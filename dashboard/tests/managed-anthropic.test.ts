import { afterAll, afterEach, beforeAll, beforeEach, expect, mock, test } from "bun:test";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anthropicProxy, claudeOAuthBody } from "../src/anthropic";
import { beginLogin, completeLoginWithCode, refreshCredential } from "../src/oauth";
import { PROVIDERS } from "../src/providers";
import { deleteCredential, loadCredentials, saveCredential } from "../src/store";

const originalFetch = globalThis.fetch;
const originalPath = process.env.CREDENTIALS_PATH;
const originalDurable = process.env.CREDENTIALS_REQUIRE_DURABLE;
const key = "fixture-inference-key-with-at-least-32-characters";
const initial = { access: "fixture-anthropic-access", refresh: "fixture-refresh", expires: Date.now() + 3600_000 };
let directory: string;
let path: string;

beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), "tokengateway-anthropic-test-"));
	path = join(directory, "credentials.json");
	process.env.CREDENTIALS_PATH = path;
	process.env.CREDENTIALS_REQUIRE_DURABLE = "1";
});
beforeEach(async () => {
	await writeFile(path, "{}");
	await deleteCredential("anthropic");
	await saveCredential("anthropic", initial);
	globalThis.fetch = mock(() => { throw new Error("Unexpected network request"); }) as unknown as typeof fetch;
});
afterEach(() => { globalThis.fetch = originalFetch; });
afterAll(async () => {
	await writeFile(path, "{}");
	await deleteCredential("anthropic");
	if (originalPath === undefined) delete process.env.CREDENTIALS_PATH;
	else process.env.CREDENTIALS_PATH = originalPath;
	if (originalDurable === undefined) delete process.env.CREDENTIALS_REQUIRE_DURABLE;
	else process.env.CREDENTIALS_REQUIRE_DURABLE = originalDurable;
	await rm(directory, { recursive: true, force: true });
});

test("concurrent refreshes exchange a rotating token once and persist the result privately", async () => {
	globalThis.fetch = mock(async (url: unknown) => {
		expect(String(url)).toBe(PROVIDERS.anthropic.tokenUrl);
		await Bun.sleep(15);
		return Response.json({ access_token: "rotated-access", refresh_token: "rotated-refresh", expires_in: 3600 });
	}) as unknown as typeof fetch;
	const results = await Promise.all([refreshCredential("anthropic", initial), refreshCredential("anthropic", initial)]);
	expect(results[0]).toEqual(results[1]);
	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	expect(JSON.parse(await readFile(path, "utf8")).anthropic.refresh).toBe("rotated-refresh");
	expect((await stat(path)).mode & 0o777).toBe(0o600);
	expect((await refreshCredential("anthropic", initial)).access).toBe("rotated-access");
	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("logout during refresh cannot resurrect the session", async () => {
	let release!: () => void;
	let started!: () => void;
	const ready = new Promise<void>(resolve => { started = resolve; });
	const gate = new Promise<void>(resolve => { release = resolve; });
	globalThis.fetch = mock(async () => {
		started(); await gate;
		return Response.json({ access_token: "late-access", refresh_token: "late-refresh", expires_in: 3600 });
	}) as unknown as typeof fetch;
	const flight = refreshCredential("anthropic", initial);
	await ready;
	await deleteCredential("anthropic");
	release();
	await expect(flight).rejects.toThrow("logged out during refresh");
	expect((await loadCredentials()).anthropic).toBeUndefined();
});

test("an unreadable credential store cannot be silently overwritten", async () => {
	await writeFile(path, "{broken");
	await expect(saveCredential("anthropic", initial)).rejects.toThrow("refusing to overwrite");
	expect(await readFile(path, "utf8")).toBe("{broken");
});

test("OAuth system identity preserves client instructions, tool schemas, and tool results", () => {
	const input = { model: "claude-sonnet-5", system: "Keep the project conventions", max_tokens: 40,
		messages: [{ role: "user", content: [{ type: "tool_result", tool_use_id: "call-1", content: "done" }] }],
		tools: [{ name: "read", input_schema: { type: "object", properties: { path: { type: "string" } } } }],
	};
	const body = claudeOAuthBody(input);
	expect(body.system).toEqual([{ type: "text", text: "You are a Claude agent, built on Anthropic's Claude Agent SDK." }]);
	expect(body.tools).toEqual(input.tools);
	expect((body.messages as any[])[0].content).toEqual([{ type: "text", text: input.system }, ...input.messages[0].content]);
	expect(input.messages[0].content).toHaveLength(1);
});

function messageRequest(headers: Record<string, string> = { "x-api-key": key }) {
	return new Request("http://localhost/anthropic/v1/messages", { method: "POST", headers,
		body: JSON.stringify({ model: "claude-sonnet-5", messages: [{ role: "user", content: "hello" }], max_tokens: 40, stream: true }),
	});
}

test("inference uses a separate key and never forwards it or dashboard auth upstream", async () => {
	const proxy = anthropicProxy(key);
	const request = messageRequest({ Authorization: "Basic dashboard-credentials" });
	expect((await proxy(request, new URL(request.url))).status).toBe(401);
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("native streaming and usage pass through without buffering or chat conversion", async () => {
	const wire = 'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":7}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n';
	globalThis.fetch = mock(async (url: unknown, options?: RequestInit) => {
		expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
		const headers = new Headers(options?.headers);
		expect(headers.get("Authorization")).toBe(`Bearer ${initial.access}`);
		expect(headers.has("x-api-key")).toBe(false);
		expect(headers.get("anthropic-beta")).toContain("oauth-2025-04-20");
		expect(JSON.parse(String(options?.body)).stream).toBe(true);
		return new Response(wire, { headers: { "content-type": "text/event-stream", "content-encoding": "gzip" } });
	}) as unknown as typeof fetch;
	const req = messageRequest();
	const response = await anthropicProxy(key)(req, new URL(req.url));
	expect(response.headers.get("content-type")).toBe("text/event-stream");
	expect(response.headers.has("content-encoding")).toBe(false);
	expect(await response.text()).toBe(wire);
});

test("429 passes through with Retry-After and does not consume a refresh token", async () => {
	globalThis.fetch = mock(async () => new Response('{"error":{"type":"rate_limit_error"}}', { status: 429, headers: { "retry-after": "30" } })) as unknown as typeof fetch;
	const req = messageRequest();
	const response = await anthropicProxy(key)(req, new URL(req.url));
	expect(response.status).toBe(429);
	expect(response.headers.get("retry-after")).toBe("30");
	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	expect((await loadCredentials()).anthropic?.refresh).toBe(initial.refresh);
});

test("401 retries once with the centrally refreshed credential", async () => {
	let calls = 0;
	globalThis.fetch = mock(async (url: unknown, options?: RequestInit) => {
		calls++;
		if (String(url) === PROVIDERS.anthropic.tokenUrl) return Response.json({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 });
		if (calls === 1) return new Response("revoked", { status: 401 });
		expect(new Headers(options?.headers).get("Authorization")).toBe("Bearer new-access");
		return Response.json({ type: "message", content: [], usage: { input_tokens: 2, output_tokens: 1 } });
	}) as unknown as typeof fetch;
	const req = messageRequest();
	const response = await anthropicProxy(key)(req, new URL(req.url));
	expect(response.status).toBe(200);
	expect(calls).toBe(3);
	expect(JSON.parse(await readFile(path, "utf8")).anthropic.refresh).toBe("new-refresh");
});

test("pasted OAuth code rejects a wrong state and shares one code exchange", async () => {
	const port = PROVIDERS.anthropic.callbackPort;
	PROVIDERS.anthropic.callbackPort = 0;
	try {
		const login = await beginLogin("anthropic");
		const state = new URL(login.url).searchParams.get("state")!;
		globalThis.fetch = mock(async (_url: unknown, options?: RequestInit) => {
			expect(JSON.parse(String(options?.body)).state).toBe(state);
			return Response.json({ access_token: "login-access", refresh_token: "login-refresh", expires_in: 3600 });
		}) as unknown as typeof fetch;
		await expect(completeLoginWithCode("anthropic", "fixture#wrong-state")).rejects.toThrow("state mismatch");
		expect(globalThis.fetch).not.toHaveBeenCalled();
		await completeLoginWithCode("anthropic", `fixture#${state}`);
		await login.completion;
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect((await loadCredentials()).anthropic?.access).toBe("login-access");
	} finally { PROVIDERS.anthropic.callbackPort = port; }
});
