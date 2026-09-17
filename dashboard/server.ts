/**
 * Quota Dashboard — autonomous subscription-limit viewer.
 *
 * Owns its OAuth flows and talks to each provider's usage endpoint directly;
 * nothing here depends on another agent or CLI being installed.
 */

import { isRecord, readString } from "./src/guards";
import {
	beginLogin,
	cancelLogin,
	completeLoginWithCode,
	isDefinitiveOAuthFailure,
	refreshCredential,
} from "./src/oauth";
import { PROVIDERS, PROVIDER_IDS, isProviderId } from "./src/providers";
import { deleteCredential, loadCredentials, persistenceError, saveCredential } from "./src/store";
import { fetchAllUsage, clearCooldown } from "./src/usage";
import { HTML } from "./src/ui";
import { dashboardAuth } from "./src/auth";
import { liteLLMQuotaApi } from "./src/litellm";
import { anthropicProxy } from "./src/anthropic";

const PORT = Number(process.env.PORT ?? 3737);
const HOST = process.env.HOST || "0.0.0.0";
const authorize = await dashboardAuth();
const nativeApi = process.env.LITELLM_CHATGPT_AUTH_FILE
	? liteLLMQuotaApi(process.env.LITELLM_CHATGPT_AUTH_FILE)
	: undefined;
const managedAnthropic = process.env.MANAGED_ANTHROPIC === "1";
const proxyKey = managedAnthropic
	? (process.env.ANTHROPIC_PROXY_KEY_FILE
		? (await Bun.file(process.env.ANTHROPIC_PROXY_KEY_FILE).text()).trim()
		: process.env.ANTHROPIC_PROXY_KEY || "")
	: "";
const claudeProxy = managedAnthropic ? anthropicProxy(proxyKey) : undefined;

/** In-flight logins, so the UI can poll for completion and surface failures. */
interface LoginState {
	url: string;
	status: "pending" | "done" | "error";
	message?: string;
}
const logins: Map<string, LoginState> = new Map();

async function handleApi(req: Request, url: URL): Promise<Response> {
	if (url.pathname === "/api/status") {
		const credentials = await loadCredentials();
		return Response.json({
			providers: PROVIDER_IDS.map(id => ({
				id,
				label: PROVIDERS[id].label,
				connected: Boolean(credentials[id]),
				email: credentials[id]?.email,
				plan: credentials[id]?.plan,
				login: logins.get(id),
			})),
		});
	}

	if (url.pathname === "/api/usage") {
		return Response.json({ generatedAt: Date.now(), reports: await fetchAllUsage() });
	}
	if (url.pathname === "/api/credentials" && req.method === "GET") {
		const credentials = await loadCredentials();
		return Response.json(credentials);
	}
	const credProviderMatch = url.pathname.match(/^\/api\/credentials\/([\w-]+)$/);
	if (credProviderMatch && req.method === "GET") {
		const provider = credProviderMatch[1];
		if (!isProviderId(provider)) return Response.json({ error: "invalid provider" }, { status: 400 });
		const credentials = await loadCredentials();
		const cred = credentials[provider];
		if (!cred) return Response.json({ error: "credential not found" }, { status: 404 });
		return Response.json(cred);
	}
	if (url.pathname === "/api/credentials" && req.method === "POST") {
		const payload: unknown = await req.json();
		if (!isRecord(payload)) return Response.json({ error: "invalid payload" }, { status: 400 });
		let savedCount = 0;
		for (const [key, val] of Object.entries(payload)) {
			if (isProviderId(key) && isRecord(val)) {
				const access = readString(val.access) ?? readString(val.accessToken);
				const refresh = readString(val.refresh) ?? readString(val.refreshToken) ?? "";
				const expires = typeof val.expires === "number" ? val.expires : Date.now() + 3600 * 1000;
				if (access) {
					await saveCredential(key, {
						access,
						refresh,
						expires,
						email: readString(val.email),
						plan: readString(val.plan),
						projectId: readString(val.projectId) ?? readString(val.project_id),
						authorizedAt: typeof val.authorizedAt === "number" ? val.authorizedAt : Date.now(),
					});
					clearCooldown(key);
					savedCount++;
				}
			}
		}
		clearCooldown();
		return Response.json({ ok: true, saved: savedCount });
	}

	const loginMatch = url.pathname.match(/^\/api\/login\/([\w-]+)$/);
	if (loginMatch && req.method === "POST") {
		const provider = loginMatch[1];
		if (!isProviderId(provider)) return Response.json({ error: "invalid provider" }, { status: 400 });
		try {
			const { url: authUrl, completion } = await beginLogin(provider);
			const login: LoginState = { url: authUrl, status: "pending" };
			logins.set(provider, login);
			// Deliberately not awaited: the browser step gates completion.
			completion.then(
				() => { if (logins.get(provider) === login) login.status = "done"; },
				(error: unknown) =>
					logins.get(provider) === login && logins.set(provider, {
						url: authUrl,
						status: "error",
						message: error instanceof Error ? error.message : String(error),
					}),
			);
			return Response.json({ url: authUrl });
		} catch (error) {
			return Response.json(
				{ error: error instanceof Error ? error.message : String(error) },
				{ status: 500 },
			);
		}
	}

	const codeMatch = url.pathname.match(/^\/api\/login\/([\w-]+)\/code$/);
	if (codeMatch && req.method === "POST") {
		const provider = codeMatch[1];
		if (!isProviderId(provider)) return Response.json({ error: "invalid provider" }, { status: 400 });
		const payload: unknown = await req.json();
		const code = isRecord(payload) ? readString(payload.code) ?? "" : "";
		try {
			await completeLoginWithCode(provider, code);
			logins.delete(provider);
			return Response.json({ ok: true });
		} catch (error) {
			return Response.json(
				{ error: error instanceof Error ? error.message : String(error) },
				{ status: 400 },
			);
		}
	}

	const logoutMatch = url.pathname.match(/^\/api\/logout\/([\w-]+)$/);
	if (logoutMatch && req.method === "POST") {
		const provider = logoutMatch[1];
		if (!isProviderId(provider)) return Response.json({ error: "invalid provider" }, { status: 400 });
		cancelLogin(provider);
		logins.delete(provider);
		await deleteCredential(provider);
		clearCooldown(provider);
		return Response.json({ ok: true });
	}

	return Response.json({ error: "not found" }, { status: 404 });
}

async function dashboardApi(req: Request, url: URL): Promise<Response> {
	if (!nativeApi) return handleApi(req, url);
	if (!managedAnthropic) return nativeApi(req, url);
	if (req.method === "POST" && /^\/api\/(login\/anthropic(?:\/code)?|logout\/anthropic)$/.test(url.pathname)) {
		return handleApi(req, url);
	}
	const response = await nativeApi(req, url);
	if (!response.ok) return response;
	const result = await response.json();
	if (!isRecord(result)) throw new Error("Invalid native dashboard response");
	if (url.pathname === "/api/status" && Array.isArray(result.providers)) {
		const credential = (await loadCredentials()).anthropic;
		result.providers.push({ id: "anthropic", label: "Anthropic", connected: Boolean(credential),
			email: credential?.email, plan: credential?.plan, login: logins.get("anthropic"),
			error: persistenceError() ? "OAuth credential persistence failed; repair storage before restarting" : undefined,
		});
	} else if (url.pathname === "/api/usage" && Array.isArray(result.reports)) {
		result.reports.push(...await fetchAllUsage(false, ["anthropic"]));
	}
	return Response.json(result);
}

export const server = Bun.serve({
	port: PORT,
	hostname: HOST,
	idleTimeout: 255,
	async fetch(req) {
		const url = new URL(req.url);
		if (claudeProxy && url.pathname.startsWith("/anthropic/")) return claudeProxy(req, url);
		const denied = authorize(req);
		if (denied) return denied;
		const origin = req.headers.get("origin");
		if (origin && origin !== url.origin) return new Response("Cross-origin request rejected", { status: 403 });
		if (url.pathname === "/") {
			return new Response(HTML, { headers: {
				"content-type": "text/html; charset=utf-8", "cache-control": "no-store",
				"x-frame-options": "DENY", "referrer-policy": "no-referrer",
			} });
		}
		if (url.pathname.startsWith("/api/")) {
			try {
				const response = await dashboardApi(req, url);
				response.headers.set("cache-control", "no-store");
				return response;
			} catch (error) {
				return Response.json(
					{ error: error instanceof Error ? error.message : String(error) },
					{ status: 500 },
				);
			}
		}
		return new Response("Not found", { status: 404 });
	},
});

/**
 * Proactive OAuth refresh sweep, mirroring omp's auth-broker refresher: every
 * REFRESH_INTERVAL_MS, renew any credential expiring within REFRESH_SKEW_MS.
 * Without it the dashboard only discovered a dead token when a usage fetch
 * failed — and that failure froze the provider's card on stale numbers.
 */
const REFRESH_INTERVAL_MS = 60_000;
const REFRESH_SKEW_MS = 5 * 60_000;
let sweeping = false;

async function refreshSweep(): Promise<void> {
	if (nativeApi && !managedAnthropic) return;
	if (sweeping) return;
	sweeping = true;
	try {
		const credentials = await loadCredentials();
		const deadline = Date.now() + REFRESH_SKEW_MS;
		await Promise.all(
			Object.entries(credentials).map(async ([provider, credential]) => {
				if (nativeApi && provider !== "anthropic") return;
				if (!isProviderId(provider) || !credential?.refresh) return;
				// Unknown expiry stays for the lazy path in `ensureFresh`; sweeping it
				// every minute would hammer the token endpoint for no gain.
				if (typeof credential.expires !== "number" || !Number.isFinite(credential.expires)) return;
				if (credential.expires > deadline) return;
				try {
					await refreshCredential(provider, credential);
					console.log(`[refresh] ${provider}: token refreshed`);
				} catch (error) {
					const msg = error instanceof Error ? error.message : String(error);
					if (isDefinitiveOAuthFailure(error)) {
						console.warn(`[refresh] ${provider}: definitive failure, requires re-authentication: ${msg}`);
					} else {
						console.warn(`[refresh] ${provider}: transient failure, will retry on next sweep: ${msg}`);
					}
				}
			}),
		);
	} catch {
		console.warn("[refresh] credential store unavailable; will retry on next sweep");
	} finally {
		sweeping = false;
	}
}

// Immediate startup sweep: pods mount initial credentials from seed secrets which
// may be expired; the initial read must refresh rather than serving dead tokens.
if (!nativeApi || managedAnthropic) {
	void refreshSweep();
	setInterval(() => void refreshSweep(), REFRESH_INTERVAL_MS).unref();
}

console.log(`Quota Dashboard running at http://${HOST}:${server.port}${nativeApi ? " (read-only LiteLLM quotas)" : ""}`);
