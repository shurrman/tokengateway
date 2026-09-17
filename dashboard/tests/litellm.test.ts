import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liteLLMQuotaApi, readLiteLLMCredential } from "../src/litellm";
import { CODEX_USAGE_URL } from "../src/providers";

let directory: string;
let path: string;
const originalFetch = globalThis.fetch;
const token = (email: string) => `header.${Buffer.from(JSON.stringify({
	"https://api.openai.com/profile": { email },
	"https://api.openai.com/auth": { chatgpt_plan_type: "plus" },
})).toString("base64url")}.signature`;
let record: Record<string, unknown>;
const windows = { rate_limit: { primary_window: { used_percent: 25, limit_window_seconds: 18000, reset_after_seconds: 60 } } };
const request = (path: string, method = "GET") => new Request(`http://localhost${path}`, { method });

beforeEach(async () => {
	directory = await mkdtemp(join(tmpdir(), "tokengateway-quota-test-"));
	path = join(directory, "auth.json");
	record = {
		access_token: token("fixture@example.test"), refresh_token: "never-read-or-refresh-this-token",
		account_id: "fixture-account", expires_at: Date.now() / 1000 + 3600,
	};
	await writeFile(path, JSON.stringify(record), { mode: 0o600 });
	globalThis.fetch = mock(() => { throw new Error("Unexpected network request"); }) as unknown as typeof fetch;
});

afterEach(async () => {
	globalThis.fetch = originalFetch;
	await rm(directory, { recursive: true, force: true });
});

test("read-through adapter strips refresh tokens and converts expiry seconds to milliseconds", async () => {
	const before = await readFile(path);
	const beforeStat = await stat(path);
	const credential = await readLiteLLMCredential(path);
	expect(credential.access).toBe(record.access_token as string);
	expect(credential.expires).toBe((record.expires_at as number) * 1000);
	expect(credential.email).toBe("fixture@example.test");
	expect(credential.plan).toBe("plus");
	expect(credential.accountId).toBe("fixture-account");
	expect(credential.refresh).toBeUndefined();
	expect(await readFile(path)).toEqual(before);
	expect((await stat(path)).mtimeMs).toBe(beforeStat.mtimeMs);
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("all credential, login and mutation routes are denied without writing or fetching", async () => {
	const api = liteLLMQuotaApi(path);
	const before = await readFile(path);
	for (const [route, method] of [
		["/api/credentials", "GET"], ["/api/credentials/openai-codex", "GET"],
		["/api/credentials", "POST"], ["/api/login/openai-codex", "POST"],
		["/api/login/openai-codex/code", "POST"], ["/api/logout/openai-codex", "POST"],
		["/api/usage", "POST"],
	]) {
		const req = request(route, method);
		expect((await api(req, new URL(req.url))).status).toBe(403);
	}
	expect(await readFile(path)).toEqual(before);
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("status is read-only and never exposes credentials", async () => {
	const req = request("/api/status");
	const response = await liteLLMQuotaApi(path)(req, new URL(req.url));
	const text = await response.text();
	expect(text).not.toContain(record.access_token as string);
	expect(text).not.toContain(record.refresh_token as string);
	expect(JSON.parse(text).providers).toHaveLength(1);
	expect(JSON.parse(text).providers[0]).toMatchObject({ readOnly: true, connected: true });
});

test("quota fetches deduplicate and cache, then follow LiteLLM token rotation", async () => {
	const calls: RequestInit[] = [];
	globalThis.fetch = mock(async (url: unknown, options?: RequestInit) => {
		expect(String(url)).toBe(CODEX_USAGE_URL);
		calls.push(options!);
		await Bun.sleep(10);
		return Response.json(windows);
	}) as unknown as typeof fetch;
	const api = liteLLMQuotaApi(path);
	const req = request("/api/usage");
	const invoke = () => api(req, new URL(req.url)).then(response => response.json());
	const results = await Promise.all([invoke(), invoke(), invoke()]);
	expect(calls).toHaveLength(1);
	expect(results[0].reports[0].limits[0].usedFraction).toBe(0.25);
	expect(new Headers(calls[0].headers).get("ChatGPT-Account-Id")).toBe("fixture-account");
	expect((await invoke()).reports[0].cached).toBe(true);
	expect(calls).toHaveLength(1);
	record.access_token = token("rotated@example.test");
	await writeFile(path, JSON.stringify(record));
	const afterRotation = await readFile(path);
	expect((await invoke()).reports[0].email).toBe("rotated@example.test");
	expect(calls).toHaveLength(2);
	expect(new Headers(calls[1].headers).get("Authorization")).toBe(`Bearer ${record.access_token}`);
	expect(await readFile(path)).toEqual(afterRotation);
});

test("expired native tokens produce an honest error and never trigger OAuth", async () => {
	record.expires_at = Date.now() / 1000 - 1;
	await writeFile(path, JSON.stringify(record));
	const before = await readFile(path);
	const req = request("/api/usage");
	const result = await (await liteLLMQuotaApi(path)(req, new URL(req.url))).json();
	expect(result.reports[0].error).toContain("expired");
	expect(result.reports[0].limits).toEqual([]);
	expect(globalThis.fetch).not.toHaveBeenCalled();
	expect(await readFile(path)).toEqual(before);
});

test("upstream 401 is sanitized and does not fall back to refresh or login", async () => {
	globalThis.fetch = mock(async () => new Response(`secret body ${record.access_token}`, { status: 401 })) as unknown as typeof fetch;
	const api = liteLLMQuotaApi(path);
	const req = request("/api/usage");
	const response = await api(req, new URL(req.url));
	const text = await response.text();
	expect(text).toContain("HTTP 401");
	expect(text).not.toContain("secret body");
	expect(text).not.toContain(record.access_token as string);
	await api(req, new URL(req.url));
	expect(globalThis.fetch).toHaveBeenCalledTimes(1);
});

test("missing and malformed native files report errors without creating or repairing them", async () => {
	await expect(readLiteLLMCredential(join(directory, "missing.json"))).rejects.toThrow("unreadable");
	await writeFile(path, "broken-json");
	const api = liteLLMQuotaApi(path);
	for (const route of ["/api/status", "/api/usage"]) {
		const req = request(route);
		const text = await (await api(req, new URL(req.url))).text();
		expect(text).toContain("unreadable or invalid");
		expect(text).not.toContain("broken-json");
	}
	expect(await readFile(path, "utf8")).toBe("broken-json");
	expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("a quota response with no windows cannot be rendered as healthy", async () => {
	globalThis.fetch = mock(async () => Response.json({})) as unknown as typeof fetch;
	const req = request("/api/usage");
	const result = await (await liteLLMQuotaApi(path)(req, new URL(req.url))).json();
	expect(result.reports[0].error).toContain("no valid windows");
});
