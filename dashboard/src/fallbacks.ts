/**
 * LiteLLM fallback observability.
 *
 * Three read-only projections for the dashboard, all served by the local
 * LiteLLM admin API:
 *  - configured fallback chains (`/router/settings`),
 *  - Claude model groups with no fallback coverage (`/v1/models`),
 *  - fallback activations in the last 24 h (`/spend/logs/ui`,
 *    `metadata.attempted_fallbacks > 0`), collected incrementally because a
 *    full-window recount is ~18 KB per request row.
 * The rolling window is persisted in a small SQLite file (bun:sqlite, one
 * compact row per request) under FALLBACKS_DB_PATH, so a service restart
 * resumes from the last scanned timestamp instead of re-reading 24 h of
 * spend logs. Failures degrade to an `error` string; the dashboard never
 * breaks, and a broken/unwritable DB falls back to in-memory operation.
 */

import { Database } from "bun:sqlite";
import { isRecord, readNumber, readString } from "./guards";

export interface FallbackSnapshot {
	/** model group -> fallback chain, as configured in router_settings. */
	chains: Record<string, string[]>;
	/** Claude/omni-claude model groups with no fallback chain configured. */
	uncovered: string[];
	/** Requests in the last 24 h where LiteLLM actually fell back. */
	activations24h: number;
	/** Same, grouped by the originally requested model group. */
	activationsByGroup: Record<string, number>;
	/** True until the initial 24 h backfill finished; counts may be partial. */
	backfillPending: boolean;
	/** Rolling 24 h traffic from spend logs (deduplicated by request id). */
	requests24h: number;
	/** Prompt tokens actually processed fresh (prompt - cached) + completion. */
	freshTokens24h: number;
	/** Share of prompt tokens served from provider prompt caches, 0..1. */
	cachedShare24h: number | null;
	fetchedAt: number;
	error?: string;
}

interface Options {
	baseUrl: string;
	adminKey: string;
}

interface FallbackEvent {
	requestId: string;
	group: string;
	atMs: number;
}

const POLL_INTERVAL_MS = 5 * 60_000;
const WINDOW_MS = 24 * 3_600_000;
/** Overlap between polls so a slow writer cannot lose events at the edge. */
const OVERLAP_MS = 60_000;
const PAGE_SIZE = 500;
/** Hard cap per poll; protects the proxy from pathological paging. */
const MAX_PAGES = 80;
const REQUEST_TIMEOUT_MS = 20_000;

function spendLogsDate(ms: number): string {
	// LiteLLM expects "YYYY-MM-DD HH:MM:SS" in UTC.
	return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

export function fallbackMonitor(options: Options): () => Promise<FallbackSnapshot> {
	const base = options.baseUrl.replace(/\/+$/, "");
	const headers = { authorization: `Bearer ${options.adminKey}` };
	const events = new Map<string, FallbackEvent>();
	/** request_id -> compact per-request token stats for the rolling window. */
	const traffic = new Map<string, { atMs: number; prompt: number; cached: number; completion: number }>();
	let sinceMs = Date.now() - WINDOW_MS; // initial backfill window
	let backfillPending = true;
	let db: Database | undefined;
	try {
		const dbPath = process.env.FALLBACKS_DB_PATH
			?? `${process.env.STATE_DIRECTORY ?? "/var/lib/tokengateway-quota"}/fallbacks.sqlite`;
		db = new Database(dbPath, { create: true });
		db.run("pragma journal_mode = wal");
		db.run(`create table if not exists requests (
			request_id text primary key,
			at_ms integer not null,
			prompt integer not null,
			cached integer not null,
			completion integer not null,
			fallback_group text
		)`);
		db.run("create index if not exists requests_at on requests (at_ms)");
		db.run("create table if not exists scan_state (id integer primary key check (id = 1), since_ms integer not null)");
		const cutoff = Date.now() - WINDOW_MS;
		db.run("delete from requests where at_ms < ?", [cutoff]);
		for (const row of db.query<{ request_id: string; at_ms: number; prompt: number; cached: number; completion: number; fallback_group: string | null }, []>(
			"select request_id, at_ms, prompt, cached, completion, fallback_group from requests",
		).all()) {
			traffic.set(row.request_id, { atMs: row.at_ms, prompt: row.prompt, cached: row.cached, completion: row.completion });
			if (row.fallback_group) events.set(row.request_id, { requestId: row.request_id, group: row.fallback_group, atMs: row.at_ms });
		}
		const state = db.query<{ since_ms: number }, []>("select since_ms from scan_state where id = 1").get();
		if (state && state.since_ms > sinceMs) {
			sinceMs = state.since_ms;
			backfillPending = false; // resume incrementally from the stored cursor
		}
	} catch {
		db = undefined; // in-memory fallback; the first scan re-reads 24 h
	}
	let lastPollAt = 0;
	let polling = false;
	let snapshot: FallbackSnapshot | undefined;
	let pending: Promise<FallbackSnapshot> | undefined;

	async function getJson(path: string): Promise<unknown> {
		const response = await fetch(`${base}${path}`, {
			headers,
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
		if (!response.ok) throw new Error(`LiteLLM ${path.split("?")[0]}: HTTP ${response.status}`);
		return response.json();
	}

	async function fetchChains(): Promise<Record<string, string[]>> {
		const data = await getJson("/router/settings");
		if (!isRecord(data) || !Array.isArray(data.fields)) throw new Error("LiteLLM /router/settings: invalid response");
		const chains: Record<string, string[]> = {};
		for (const field of data.fields) {
			if (!isRecord(field) || field.field_name !== "fallbacks") continue;
			const value = field.field_value;
			if (!Array.isArray(value)) continue;
			for (const entry of value) {
				if (!isRecord(entry)) continue;
				for (const [group, chain] of Object.entries(entry)) {
					if (Array.isArray(chain)) chains[group] = chain.filter((m): m is string => typeof m === "string");
				}
			}
		}
		return chains;
	}

	async function fetchModelGroups(): Promise<string[]> {
		const data = await getJson("/v1/models");
		if (!isRecord(data) || !Array.isArray(data.data)) throw new Error("LiteLLM /v1/models: invalid response");
		const groups: string[] = [];
		for (const entry of data.data) {
			if (!isRecord(entry)) continue;
			const id = readString(entry.id);
			if (id) groups.push(id);
		}
		return groups;
	}

	/** Pull spend-log rows since `sinceMs` and record fallback activations. */
	async function pollSpendLogs(): Promise<void> {
		const start = spendLogsDate(sinceMs - OVERLAP_MS);
		const nowMs = Date.now();
		const end = spendLogsDate(nowMs + OVERLAP_MS);
		let page = 1;
		for (; page <= MAX_PAGES; page++) {
			const data = await getJson(
				`/spend/logs/ui?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}&page=${page}&page_size=${PAGE_SIZE}`,
			);
			if (!isRecord(data) || !Array.isArray(data.data)) throw new Error("LiteLLM /spend/logs/ui: invalid response");
			for (const row of data.data) {
				if (!isRecord(row)) continue;
				const metadata = isRecord(row.metadata) ? row.metadata : {};
				const requestId = readString(row.request_id) ?? `${row.startTime}-${row.model_id}`;
				const atMs = Date.parse(readString(row.startTime) ?? "") || nowMs;
				const usage = isRecord(metadata.usage_object) ? metadata.usage_object : {};
				const promptDetails = isRecord(usage.prompt_tokens_details) ? usage.prompt_tokens_details : {};
				traffic.set(requestId, {
					atMs,
					prompt: readNumber(row.prompt_tokens) ?? 0,
					// OpenAI and Anthropic both surface cache reads here; Anthropic's
					// cache_read_input_tokens mirrors cached_tokens.
					cached: readNumber(promptDetails.cached_tokens) ?? 0,
					completion: readNumber(row.completion_tokens) ?? 0,
				});
				const attempted = readNumber(metadata.attempted_fallbacks) ?? 0;
				if (attempted <= 0) continue;
				const group = readString(metadata.original_model_group) ?? readString(row.model_group) ?? "unknown";
				events.set(requestId, { requestId, group, atMs });
			}
			// total/total_pages are capped (total_is_capped) at 10k rows, so a
			// partial page is the only trustworthy end-of-data signal.
			if (data.data.length < PAGE_SIZE) break;
		}
		sinceMs = nowMs;
		backfillPending = false;
		// Prune beyond the rolling window.
		const cutoff = nowMs - WINDOW_MS;
		for (const [key, event] of events) if (event.atMs < cutoff) events.delete(key);
		for (const [key, row] of traffic) if (row.atMs < cutoff) traffic.delete(key);
		if (db) {
			try {
				const upsert = db.prepare(
					`insert into requests (request_id, at_ms, prompt, cached, completion, fallback_group)
					 values (?, ?, ?, ?, ?, ?)
					 on conflict (request_id) do update set at_ms = excluded.at_ms, prompt = excluded.prompt,
					   cached = excluded.cached, completion = excluded.completion, fallback_group = excluded.fallback_group`,
				);
				db.transaction(() => {
					for (const [id, row] of traffic) upsert.run(id, row.atMs, row.prompt, row.cached, row.completion, events.get(id)?.group ?? null);
					db!.run("delete from requests where at_ms < ?", [cutoff]);
					db!.run("insert into scan_state (id, since_ms) values (1, ?) on conflict (id) do update set since_ms = excluded.since_ms", [sinceMs]);
				})();
			} catch { /* persistence is best-effort; memory stays authoritative */ }
		}
	}

	async function refresh(): Promise<FallbackSnapshot> {
		const now = Date.now();
		const next: FallbackSnapshot = {
			chains: snapshot?.chains ?? {},
			uncovered: snapshot?.uncovered ?? [],
			activations24h: 0,
			activationsByGroup: {},
			backfillPending,
			requests24h: 0,
			freshTokens24h: 0,
			cachedShare24h: null,
			fetchedAt: now,
		};
		const failures: string[] = [];
		try {
			const [chains, groups] = await Promise.all([fetchChains(), fetchModelGroups()]);
			next.chains = chains;
			next.uncovered = groups
				.filter(g => g.startsWith("claude-") || g.startsWith("omni-claude-"))
				.filter(g => !(g in chains))
				.sort();
		} catch (error) {
			failures.push(error instanceof Error ? error.message : String(error));
		}
		// The spend-log scan can take minutes on the first 24 h backfill, so it
		// never blocks a dashboard request: it runs in the background and the
		// snapshot is served with backfillPending until the scan lands.
		if (!polling && now - lastPollAt >= POLL_INTERVAL_MS) {
			polling = true;
			pollSpendLogs()
				.then(() => { lastPollAt = Date.now(); })
				.catch(() => { /* retried on the next poll tick */ })
				.finally(() => { polling = false; });
		}
		next.backfillPending = backfillPending;
		let promptSum = 0;
		let cachedSum = 0;
		for (const row of traffic.values()) {
			next.requests24h++;
			promptSum += row.prompt;
			cachedSum += Math.min(row.cached, row.prompt);
			next.freshTokens24h += Math.max(0, row.prompt - row.cached) + row.completion;
		}
		next.cachedShare24h = promptSum > 0 ? cachedSum / promptSum : null;
		for (const event of events.values()) {
			next.activations24h++;
			next.activationsByGroup[event.group] = (next.activationsByGroup[event.group] ?? 0) + 1;
		}
		if (failures.length) next.error = failures.join("; ");
		snapshot = next;
		return next;
	}

	return async () => {
		// Serve the cached snapshot between polls; recompute counts cheaply.
		if (snapshot && Date.now() - snapshot.fetchedAt < 30_000) return snapshot;
		if (!pending) pending = refresh().finally(() => { pending = undefined; });
		return pending;
	};
}
