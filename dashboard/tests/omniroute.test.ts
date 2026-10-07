import { afterEach, expect, test } from "bun:test";
import { omniRouteQuota } from "../src/omniroute";

const servers: ReturnType<typeof Bun.serve>[] = [];
afterEach(() => { for (const s of servers.splice(0)) s.stop(true); });
const windows = { plan: "max", quotas: { "session (5h)": { used: 25, total: 100, resetAt: "2026-10-02T01:00:00Z" }, "weekly (7d)": { remainingPercentage: 90 } }, bootstrap: { access_token: "DO_NOT_EXPOSE" } };
const cursorWindows = { plan: "Cursor Pro", quotas: {
  Total: { used: 60, total: 100, remainingPercentage: 40, resetAt: "2026-11-01T00:00:00Z" },
  "Auto + Composer": { remainingPercentage: 98 },
  API: { remainingPercentage: 86 },
}};

function fixture(failAccount = false) {
  let logins = 0;
  const s = Bun.serve({ port: 0, hostname: "127.0.0.1", async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/auth/login") {
      expect(await req.json()).toEqual({ password: "fixture-management-password" });
      logins++;
      return Response.json({ ok: true }, { headers: { "set-cookie": "auth_token=fixture-secret-session; HttpOnly; Path=/" } });
    }
    expect(req.method).toBe("GET");
    expect(req.headers.get("cookie")).toBe("auth_token=fixture-secret-session");
    if (url.pathname === "/api/usage/quota") return Response.json({ providers: [
      { provider: "claude", connectionId: "a", name: "Alice" },
      { provider: "claude", connectionId: "b", name: "Bob" },
      { provider: "nvidia", connectionId: "c", name: "NVIDIA" },
      { provider: "cursor", connectionId: "d", name: "Cursor account" },
    ] });
    if (url.pathname === "/api/usage/b" && failAccount) return Response.json({ error: "secret-upstream-error" }, { status: 502 });
    if (url.pathname === "/api/usage/d") return Response.json(cursorWindows);
    return Response.json(windows);
  } });
  servers.push(s);
  return { baseUrl: s.url.origin, logins: () => logins };
}

test("separate read-only account cards normalize real windows, cache and never expose secrets", async () => {
  const f = fixture();
  const get = omniRouteQuota({ baseUrl: f.baseUrl, password: "fixture-management-password", dashboardUrl: "http://omni.wsoft/dashboard/quota" });
  const result = await get();
  expect(result.providers.map(p => p.id)).toEqual(["omni-claude-a", "omni-claude-b", "omni-cursor-d"]);
  expect(result.providers.every(p => p.readOnly && p.managedBy === "OmniRoute")).toBe(true);
  expect(result.reports[0]?.limits).toEqual([
    { id: "session (5h)", label: "session (5h)", usedFraction: 0.25, resetsAt: 1790902800000 },
    { id: "weekly (7d)", label: "weekly (7d)", usedFraction: 0.1 },
  ]);
  expect(result.reports.find(r => r.provider === "omni-cursor-d")?.limits).toEqual([
    { id: "Auto + Composer", label: "Auto + Composer", usedFraction: 0.02 },
    { id: "API", label: "API", usedFraction: 0.14 },
  ]);
  expect(result.reports.find(r => r.provider === "omni-cursor-d")?.limits.some(l => l.id === "Total")).toBe(false);
  expect(JSON.stringify(result)).not.toMatch(/DO_NOT_EXPOSE|fixture-secret|fixture-management/);
  expect((await get()).reports.every(r => r.cached)).toBe(true);
  expect(f.logins()).toBe(1);
});

test("one failed account preserves its sibling and surfaces a sanitized error", async () => {
  const f = fixture(true);
  const result = await omniRouteQuota({ baseUrl: f.baseUrl, password: "fixture-management-password" })();
  expect(result.reports[0]?.limits).toHaveLength(2);
  expect(result.reports[1]?.error).toContain("HTTP 502");
  expect(JSON.stringify(result)).not.toContain("secret-upstream-error");
});

test("unavailable OmniRoute yields an error card instead of breaking the dashboard", async () => {
  const s = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response("secret", { status: 403 }) }); servers.push(s);
  const result = await omniRouteQuota({ baseUrl: s.url.origin, password: "fixture-management-password" })();
  expect(result.providers[0]?.id).toBe("omni-claude");
  expect(result.reports[0]?.error).toContain("HTTP 403");
  expect(JSON.stringify(result)).not.toContain("secret");
});

test("Cursor card is present when no account is connected, without pretending quotas exist", async () => {
  const s = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch(req) {
    if (new URL(req.url).pathname === "/api/auth/login") return Response.json({}, { headers: { "set-cookie": "auth_token=fixture; Path=/" } });
    return Response.json({ providers: [] });
  } }); servers.push(s);
  const result = await omniRouteQuota({ baseUrl: s.url.origin, password: "fixture" })();
  expect(result.providers.find(p => p.id === "omni-cursor")).toMatchObject({ connected: false, readOnly: true, label: "Cursor · OmniRoute" });
  expect(result.reports.find(r => r.provider === "omni-cursor")).toMatchObject({ limits: [], error: "No Cursor accounts connected in OmniRoute" });
});

test("Cursor Total is dropped when Auto/API buckets exist, but kept as sole fallback", async () => {
  const s = Bun.serve({ port: 0, hostname: "127.0.0.1", async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/auth/login") return Response.json({}, { headers: { "set-cookie": "auth_token=fixture; Path=/" } });
    if (url.pathname === "/api/usage/quota") return Response.json({ providers: [
      { provider: "cursor", connectionId: "only-total", name: "Legacy" },
      { provider: "cursor", connectionId: "with-buckets", name: "Modern" },
    ] });
    if (url.pathname === "/api/usage/only-total") return Response.json({ plan: "Cursor Pro", quotas: { Total: { used: 7, total: 10, remainingPercentage: 30 } } });
    if (url.pathname === "/api/usage/with-buckets") return Response.json(cursorWindows);
    return Response.json({ error: "missing" }, { status: 404 });
  } }); servers.push(s);
  const result = await omniRouteQuota({ baseUrl: s.url.origin, password: "fixture" })();
  expect(result.reports.find(r => r.provider === "omni-cursor-only-total")?.limits).toEqual([
    { id: "Total", label: "Total", usedFraction: 0.7 },
  ]);
  expect(result.reports.find(r => r.provider === "omni-cursor-with-buckets")?.limits.map(l => l.id)).toEqual(["Auto + Composer", "API"]);
});
