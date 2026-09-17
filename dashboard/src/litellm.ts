import { isRecord, readNumber, readString } from "./guards";
import { PROVIDERS } from "./providers";
import type { StoredCredential } from "./store";
import { fetchCodex } from "./usage";
import type { UsageReport } from "./usage";

export interface LiteLLMCredential extends StoredCredential {
	accountId?: string;
}

function claims(token: unknown): Record<string, unknown> {
	if (typeof token !== "string") return {};
	try {
		const value: unknown = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString());
		return isRecord(value) ? value : {};
	} catch {
		return {};
	}
}

export async function readLiteLLMCredential(path: string): Promise<LiteLLMCredential> {
	let data: unknown;
	try {
		data = await Bun.file(path).json();
	} catch {
		throw new Error("LiteLLM auth file is unreadable or invalid; check its path and service permissions");
	}
	if (!isRecord(data) || !readString(data.access_token)) {
		throw new Error("LiteLLM auth file has no access_token; authenticate through LiteLLM");
	}
	// Claims are display metadata, not an authentication or authorization decision.
	const accessClaims = claims(data.access_token);
	const idClaims = claims(data.id_token);
	const authClaims = accessClaims["https://api.openai.com/auth"];
	const profile = accessClaims["https://api.openai.com/profile"];
	const expires = readNumber(data.expires_at) ?? readNumber(accessClaims.exp);
	return {
		access: readString(data.access_token)!,
		expires: expires === undefined ? undefined : expires * 1000,
		email: readString(idClaims.email) ?? (isRecord(profile) ? readString(profile.email) : undefined),
		plan: isRecord(authClaims) ? readString(authClaims.chatgpt_plan_type) : undefined,
		accountId: readString(data.account_id) ?? (isRecord(authClaims) ? readString(authClaims.chatgpt_account_id) : undefined),
	};
}

/** One reader, no refresh token, no writes, no login flow. LiteLLM owns OAuth. */
export function liteLLMQuotaApi(path: string) {
	let snapshot: { access: string; accountId?: string; report: UsageReport; retryAt: number } | undefined;
	let inFlight: Promise<UsageReport> | undefined;
	const baseReport = (): UsageReport => ({
		provider: "openai-codex", label: "ChatGPT via LiteLLM",
		dashboardUrl: PROVIDERS["openai-codex"].dashboardUrl,
		limits: [], fetchedAt: Date.now(),
	});

	async function usage(): Promise<UsageReport> {
		let credential: LiteLLMCredential;
		try {
			credential = await readLiteLLMCredential(path);
		} catch (error) {
			return { ...baseReport(), error: (error as Error).message };
		}
		const now = Date.now();
		if (snapshot && (snapshot.access !== credential.access || snapshot.accountId !== credential.accountId)) snapshot = undefined;
		if (credential.expires !== undefined && credential.expires <= now) {
			return {
				...baseReport(), email: credential.email, plan: credential.plan,
				error: "LiteLLM access token has expired. Wait for LiteLLM to refresh it; this dashboard never refreshes tokens.",
			};
		}
		if (snapshot && snapshot.retryAt > now) return { ...snapshot.report, cached: true };
		let report: UsageReport = { ...baseReport(), email: credential.email, plan: credential.plan };
		try {
			report.limits = await fetchCodex(credential);
			if (report.limits.length === 0) throw new Error("No quota windows returned");
		} catch (error) {
			// Never expose an upstream response body (or credentials) in the UI.
			const status = error instanceof Error ? error.message.match(/^\d{3}\b/)?.[0] : undefined;
			report = {
				...(snapshot?.report ?? report), cached: Boolean(snapshot),
				error: status
					? `ChatGPT quota endpoint returned HTTP ${status}; token refresh remains managed by LiteLLM`
					: "ChatGPT quota request failed or returned no valid windows; retrying in 60 seconds",
			};
		}
		snapshot = {
			access: credential.access, accountId: credential.accountId, report,
			retryAt: now + (report.error ? 60_000 : 300_000),
		};
		return report;
	}

	return async (request: Request, url: URL): Promise<Response> => {
		if (request.method !== "GET" || !["/api/status", "/api/usage"].includes(url.pathname)) {
			return Response.json({ error: "LiteLLM quota mode is read-only; credential and login APIs are disabled" }, { status: 403 });
		}
		if (url.pathname === "/api/status") {
			let credential: LiteLLMCredential | undefined;
			let error: string | undefined;
			try { credential = await readLiteLLMCredential(path); }
			catch (cause) { error = (cause as Error).message; }
			return Response.json({ providers: [{
				id: "openai-codex", label: "ChatGPT via LiteLLM", readOnly: true,
				connected: Boolean(credential), email: credential?.email, plan: credential?.plan, error,
			}] });
		}
		if (!inFlight) inFlight = usage().finally(() => { inFlight = undefined; });
		return Response.json({ generatedAt: Date.now(), reports: [await inFlight] });
	};
}
