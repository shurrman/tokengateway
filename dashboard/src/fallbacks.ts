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
 * Plus the proxy-wide request/token totals (`/global/activity`) for the KPI
 * bar. Failures degrade to an `error` string; the dashboard never breaks.
 */

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
	/** Proxy-wide totals for the KPI bar (last 24 h, from /global/activity). */
	requests24h?: number;
	tokens24h?: number;
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
const MAX_PAGES = 40;
const REQUEST_TIMEOUT_MS = 20_000;

function spendLogsDate(ms: number): string {
	// LiteLLM expects "YYYY-MM-DD HH:MM:SS" in UTC.
	return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

export function fallbackMonitor(options: Options): () => Promise<FallbackSnapshot> {
	const base = options.baseUrl.replace(/\/+$/, "");
	const headers = { authorization: `Bearer ${options.adminKey}` };
	const events = new Map<string, FallbackEvent>();
	let sinceMs = Date.now() - WINDOW_MS; // initial backfill window
	let backfillPending = true;
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

	async function fetchActivity(): Promise<{ requests?: number; tokens?: number }> {
		const end = new Date();
		const start = new Date(end.getTime() - WINDOW_MS);
		const fmt = (d: Date) => d.toISOString().slice(0, 10);
		const data = await getJson(`/global/activity?start_date=${fmt(start)}&end_date=${fmt(end)}`);
		if (!isRecord(data)) return {};
		return { requests: readNumber(data.sum_api_requests), tokens: readNumber(data.sum_total_tokens) };
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
				const attempted = readNumber(metadata.attempted_fallbacks) ?? 0;
				if (attempted <= 0) continue;
				const requestId = readString(row.request_id) ?? `${row.startTime}-${row.model_id}`;
				const group = readString(metadata.original_model_group) ?? readString(row.model_group) ?? "unknown";
				const atMs = Date.parse(readString(row.startTime) ?? "") || nowMs;
				events.set(requestId, { requestId, group, atMs });
			}
			const totalPages = readNumber(data.total_pages) ?? 1;
			if (page >= totalPages) break;
		}
		sinceMs = nowMs;
		backfillPending = false;
		// Prune beyond the rolling window.
		const cutoff = nowMs - WINDOW_MS;
		for (const [key, event] of events) if (event.atMs < cutoff) events.delete(key);
	}

	async function refresh(): Promise<FallbackSnapshot> {
		const now = Date.now();
		const next: FallbackSnapshot = {
			chains: snapshot?.chains ?? {},
			uncovered: snapshot?.uncovered ?? [],
			activations24h: 0,
			activationsByGroup: {},
			backfillPending,
			requests24h: snapshot?.requests24h,
			tokens24h: snapshot?.tokens24h,
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
		try {
			const activity = await fetchActivity();
			next.requests24h = activity.requests;
			next.tokens24h = activity.tokens;
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
