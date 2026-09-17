import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liteLLMQuotaApi } from "../dashboard/src/litellm";
import { CODEX_USAGE_URL } from "../dashboard/src/providers";

const directory = await mkdtemp(join(tmpdir(), "tokengateway-rotation-test-"));
const authPath = join(directory, "auth.json");
const python = process.env.LITELLM_TEST_PYTHON || "/opt/litellm/venv/bin/python";
const jwt = (email: string) => `fixture.${Buffer.from(JSON.stringify({
	exp: Math.floor(Date.now() / 1000) + 3600,
	email,
	"https://api.openai.com/auth": { chatgpt_account_id: "fixture-account" },
})).toString("base64url")}.not-a-real-signature`;
const originalAccess = jwt("before@example.test");
const rotatedAccess = jwt("after@example.test");
const originalFetch = globalThis.fetch;
let requests = 0;

try {
	const record = { access_token: originalAccess, refresh_token: "fixture-refresh-initial", expires_at: Date.now() / 1000 + 3600 };
	await writeFile(authPath, JSON.stringify(record), { mode: 0o600 });
	globalThis.fetch = (async (url, options) => {
		assert.equal(String(url), CODEX_USAGE_URL);
		const authorization = new Headers(options?.headers).get("Authorization");
		assert.ok([`Bearer ${originalAccess}`, `Bearer ${rotatedAccess}`].includes(authorization!));
		requests++;
		return Response.json({ rate_limit: { primary_window: {
			used_percent: authorization === `Bearer ${originalAccess}` ? 10 : 20,
			limit_window_seconds: 18000,
		} } });
	}) as typeof fetch;
	const api = liteLLMQuotaApi(authPath);
	const request = new Request("http://localhost/api/usage");
	const poll = async () => (await api(request, new URL(request.url))).json();
	assert.equal((await poll()).reports[0].limits[0].usedFraction, 0.1);
	assert.equal((await poll()).reports[0].cached, true);
	assert.equal(requests, 1);
	await writeFile(authPath, JSON.stringify({ ...record, expires_at: 1 }));
	const result = Bun.spawnSync([python, join(import.meta.dir, "refresh_fixture.py"), directory, rotatedAccess]);
	if (result.exitCode !== 0) throw new Error(result.stderr.toString());
	console.log(result.stdout.toString().trim());
	const afterRefresh = await readFile(authPath);
	assert.equal((await poll()).reports[0].limits[0].usedFraction, 0.2);
	assert.equal(requests, 2);
	assert.deepEqual(await readFile(authPath), afterRefresh);
	console.log("PASS: installed LiteLLM refreshed and persisted a fixture token; the same dashboard instance invalidated its cache without writing OAuth state.");
} finally {
	globalThis.fetch = originalFetch;
	await rm(directory, { recursive: true, force: true });
}
