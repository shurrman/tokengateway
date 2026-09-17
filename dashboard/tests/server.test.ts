import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let directory: string;
let server: Awaited<typeof import("../server")>["server"];
let url: string;
let before: Buffer;
const password = "fixture-password-for-tests-only";
const headers = { Authorization: `Basic ${Buffer.from(`quota:${password}`).toString("base64")}` };
const names = ["PORT", "HOST", "DASHBOARD_PASSWORD", "DASHBOARD_PASSWORD_FILE", "LITELLM_CHATGPT_AUTH_FILE"];
const priorEnv = Object.fromEntries(names.map(name => [name, process.env[name]]));

beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), "tokengateway-http-test-"));
	const path = join(directory, "auth.json");
	await writeFile(path, JSON.stringify({ access_token: "expired-fixture", refresh_token: "must-not-refresh", expires_at: 1 }));
	before = await readFile(path);
	Object.assign(process.env, { PORT: "0", HOST: "127.0.0.1", DASHBOARD_PASSWORD: password, LITELLM_CHATGPT_AUTH_FILE: path });
	delete process.env.DASHBOARD_PASSWORD_FILE;
	({ server } = await import("../server"));
	url = `http://127.0.0.1:${server.port}`;
});

afterAll(async () => {
	server.stop(true);
	for (const name of names) {
		if (priorEnv[name] === undefined) delete process.env[name];
		else process.env[name] = priorEnv[name];
	}
	await rm(directory, { recursive: true, force: true });
});

test("HTTP routes require authentication and reject wrong passwords", async () => {
	for (const route of ["/", "/api/status", "/api/usage", "/api/credentials"]) {
		const response = await fetch(url + route);
		expect(response.status).toBe(401);
		expect(response.headers.get("WWW-Authenticate")).toContain("Basic");
	}
	expect((await fetch(url, { headers: { Authorization: "Basic aW52YWxpZA==" } })).status).toBe(401);
});

test("authenticated UI and API work, with credential routes disabled and no OAuth writes", async () => {
	expect((await fetch(url, { headers })).status).toBe(200);
	const status = await fetch(url + "/api/status", { headers });
	expect(status.headers.get("Cache-Control")).toBe("no-store");
	expect((await status.json()).providers[0].readOnly).toBe(true);
	const usage = await (await fetch(url + "/api/usage", { headers })).json();
	expect(usage.reports[0].error).toContain("expired");
	expect((await fetch(url + "/api/credentials", { headers })).status).toBe(403);
	expect((await fetch(url + "/api/login/openai-codex", { method: "POST", headers })).status).toBe(403);
	expect(await readFile(join(directory, "auth.json"))).toEqual(before);
});

test("authenticated requests from a different web origin are rejected", async () => {
	expect((await fetch(url + "/api/status", { headers: { ...headers, Origin: "https://elsewhere.example" } })).status).toBe(403);
});
