import { afterAll, beforeAll, expect, mock, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let directory: string;
let server: Awaited<typeof import("../server")>["server"];
let url: string;
const password = "fixture-password-for-tests-only";
const headers = { Authorization: `Basic ${Buffer.from(`quota:${password}`).toString("base64")}` };
const names = ["PORT", "HOST", "DASHBOARD_PASSWORD", "DASHBOARD_PASSWORD_FILE", "LITELLM_CHATGPT_AUTH_FILE", "MANAGED_ANTHROPIC", "ANTHROPIC_PROXY_KEY", "ANTHROPIC_PROXY_KEY_FILE", "CREDENTIALS_PATH", "LITELLM_BASE_URL", "LITELLM_ADMIN_KEY", "LITELLM_ADMIN_KEY_FILE"];
const priorEnv = Object.fromEntries(names.map(name => [name, process.env[name]]));
const originalFetch = globalThis.fetch;

beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), "tokengateway-deepseek-sync-"));
	Object.assign(process.env, {
		PORT: "0",
		HOST: "127.0.0.1",
		DASHBOARD_PASSWORD: password,
		LITELLM_ADMIN_KEY: "fixture-liteLLM-admin-key",
		LITELLM_BASE_URL: "http://litellm.test",
		CREDENTIALS_PATH: join(directory, "credentials.json"),
	});
	delete process.env.DASHBOARD_PASSWORD_FILE;
	delete process.env.LITELLM_CHATGPT_AUTH_FILE;
	delete process.env.MANAGED_ANTHROPIC;
	delete process.env.ANTHROPIC_PROXY_KEY;
	delete process.env.ANTHROPIC_PROXY_KEY_FILE;
	delete process.env.LITELLM_ADMIN_KEY_FILE;
	({ server } = await import("../server"));
	url = `http://127.0.0.1:${server.port}`;
});

afterAll(async () => {
	globalThis.fetch = originalFetch;
	server.stop(true);
	for (const name of names) {
		if (priorEnv[name] === undefined) delete process.env[name];
		else process.env[name] = priorEnv[name];
	}
	await rm(directory, { recursive: true, force: true });
});

test("connect registers both DeepSeek models and logout deletes them", async () => {
	const created = new Set<string>();
	globalThis.fetch = mock(async (input: unknown, init?: RequestInit) => {
		const requestUrl = String(input);
		if (!requestUrl.startsWith("http://litellm.test/")) {
			return originalFetch(input as RequestInfo | URL, init);
		}
		const method = init?.method || "GET";
		if (requestUrl === "http://litellm.test/v1/model/info") {
			return Response.json({
				data: [...created].map(modelName => ({
					model_name: modelName,
					model_info: { id: `${modelName}-id` },
				})),
			});
		}
		if (requestUrl === "http://litellm.test/model/new") {
			const body = JSON.parse(String(init?.body ?? "{}"));
			created.add(body.model_name);
			return Response.json({ model_id: `${body.model_name}-id` });
		}
		if (requestUrl === "http://litellm.test/model/update") {
			return Response.json({ ok: true });
		}
		if (requestUrl === "http://litellm.test/model/delete") {
			const body = JSON.parse(String(init?.body ?? "{}"));
			created.delete(body.id.replace(/-id$/, ""));
			return Response.json({ ok: true });
		}
		throw new Error(`Unexpected LiteLLM admin request: ${method} ${requestUrl}`);
	}) as unknown as typeof fetch;

	const connect = await fetch(url + "/api/connect/deepseek", {
		method: "POST",
		headers,
		body: JSON.stringify({ apiKey: "sk-fixture-deepseek-api-key-123456" }),
	});
	expect(connect.status).toBe(200);
	expect((await connect.json()).liteLLM.synced).toEqual([
		"deepseek-v4-pro:created",
		"deepseek-v4-flash:created",
	]);

	const logout = await fetch(url + "/api/logout/deepseek", { method: "POST", headers });
	expect(logout.status).toBe(200);
	expect((await logout.json()).liteLLM.removed).toEqual([
		"deepseek-v4-pro",
		"deepseek-v4-flash",
	]);
});
