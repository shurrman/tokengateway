import { createHash, timingSafeEqual } from "node:crypto";
import { isRecord } from "./guards";
import { ensureFresh, refreshCredential } from "./oauth";
import { loadCredentials } from "./store";

const IDENTITY = "You are a Claude agent, built on Anthropic's Claude Agent SDK.";
const CACHE_CONTROL = { type: "ephemeral" } as const;
const CACHE_BREAKPOINTS = 2;
const CACHE_BREAKPOINT_LIMIT = 4;

function countCacheBreakpoints(value: unknown): number {
	if (Array.isArray(value)) return value.reduce((total, item) => total + countCacheBreakpoints(item), 0);
	if (!isRecord(value)) return 0;
	return (isRecord(value.cache_control) ? 1 : 0)
		+ Object.entries(value).reduce((total, [key, item]) => key === "cache_control" ? total : total + countCacheBreakpoints(item), 0);
}

function markCacheableContent(message: Record<string, unknown>): boolean {
	const content = message.content;
	if (typeof content === "string" && content.trim()) {
		message.content = [{ type: "text", text: content, cache_control: CACHE_CONTROL }];
		return true;
	}
	if (!Array.isArray(content)) return false;
	for (let index = content.length - 1; index >= 0; index--) {
		const block = content[index];
		if (!isRecord(block) || isRecord(block.cache_control)) continue;
		if (["thinking", "redacted_thinking"].includes(String(block.type))) continue;
		const markable = block.type === "tool_result" || (block.type === "text" && typeof block.text === "string" && block.text.trim());
		if (!markable) continue;
		content[index] = { ...block, cache_control: CACHE_CONTROL };
		return true;
	}
	return false;
}

function applyConversationCache(messages: Record<string, unknown>[]): void {
	let budget = Math.min(CACHE_BREAKPOINTS, CACHE_BREAKPOINT_LIMIT - countCacheBreakpoints(messages));
	for (let index = messages.length - 1; index >= 0 && budget > 0; index--) {
		const message = messages[index];
		if (!isRecord(message) || !["user", "assistant"].includes(String(message.role))) continue;
		if (markCacheableContent(message)) budget--;
	}
}

/** Apply the upstream bridge's OAuth identity convention to native Messages. */
export function claudeOAuthBody(value: unknown): Record<string, unknown> {
	if (!isRecord(value) || typeof value.model !== "string" || !value.model.startsWith("claude-") || !Array.isArray(value.messages)) {
		throw new Error("Expected a native Anthropic Messages request with a Claude model");
	}
	const body = structuredClone(value);
	const instructions = typeof body.system === "string"
		? [{ type: "text", text: body.system }]
		: Array.isArray(body.system) ? body.system : [];
	const clientInstructions = instructions.filter(block => isRecord(block) && block.type === "text" && block.text !== IDENTITY);
	body.system = [{ type: "text", text: IDENTITY }];
	const messages = body.messages as Record<string, unknown>[];
	if (clientInstructions.length) {
		const firstUser = messages.find(message => isRecord(message) && message.role === "user");
		if (firstUser) {
			const content = typeof firstUser.content === "string"
				? [{ type: "text", text: firstUser.content }]
				: Array.isArray(firstUser.content) ? firstUser.content : [];
			firstUser.content = [...clientInstructions, ...content];
		} else {
			messages.unshift({ role: "user", content: clientInstructions });
		}
	}
	applyConversationCache(messages);
	return body;
}

export function anthropicProxy(key: string) {
	if (key.length < 32) throw new Error("ANTHROPIC_PROXY_KEY must contain at least 32 characters");
	const digest = (value: string) => createHash("sha256").update(value).digest();
	const expected = digest(key);
	const failure = (status: number, message: string) => Response.json({ type: "error", error: { type: "api_error", message } }, { status });
	return async (request: Request, url: URL): Promise<Response> => {
		const supplied = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace(/^Bearer /i, "") || "";
		if (!timingSafeEqual(digest(supplied), expected)) return failure(401, "Invalid TokenGateway inference key");
		const messages = url.pathname === "/anthropic/v1/messages" && request.method === "POST";
		const models = url.pathname === "/anthropic/v1/models" && request.method === "GET";
		if (!messages && !models) return failure(404, "Unsupported Anthropic proxy route");
		let body: string | undefined;
		if (messages) {
			try { body = JSON.stringify(claudeOAuthBody(await request.json())); }
			catch { return failure(400, "Invalid native Anthropic Messages request"); }
		}
		try {
			const stored = (await loadCredentials()).anthropic;
			if (!stored) return failure(503, "Sign in to Anthropic in the TokenGateway dashboard first");
			const credential = await ensureFresh("anthropic", stored);
			const betas = new Set((request.headers.get("anthropic-beta") || "").split(",").map(value => value.trim()).filter(Boolean));
			betas.add("oauth-2025-04-20");
			betas.add("claude-code-20250219");
			const send = (access: string) => fetch(`https://api.anthropic.com/v1/${messages ? "messages" : "models"}${url.search}`, {
				method: request.method,
				headers: {
					Authorization: `Bearer ${access}`,
					"anthropic-version": request.headers.get("anthropic-version") || "2023-06-01",
					"anthropic-beta": [...betas].join(","),
					"user-agent": "claude-cli/2.1.246 (external, claude-desktop)",
					"content-type": "application/json",
				},
				body,
				signal: AbortSignal.any([request.signal, AbortSignal.timeout(300_000)]),
			});
			let response = await send(credential.access);
			if (response.status === 401 && credential.refresh) {
				await response.body?.cancel();
				const renewed = await refreshCredential("anthropic", credential);
				response = await send(renewed.access);
			}
			const headers = new Headers(response.headers);
			for (const name of ["content-length", "content-encoding", "transfer-encoding", "connection", "set-cookie"]) headers.delete(name);
			headers.set("cache-control", "no-store");
			headers.set("x-accel-buffering", "no");
			return new Response(response.body, { status: response.status, headers });
		} catch {
			return failure(503, "Claude request or OAuth refresh failed; check Anthropic login and credential persistence in the dashboard");
		}
	};
}
