import { isRecord, readNumber, readString } from "./guards";
import type { UsageLimit } from "./usage";

interface Options { baseUrl: string; password: string; dashboardUrl?: string; }
interface Provider { id: string; label: string; email?: string; plan?: string; connected: boolean; readOnly: true; managedBy: string; }
interface Report { provider: string; label: string; dashboardUrl: string; limits: UsageLimit[]; fetchedAt: number; cached?: boolean; error?: string; }
interface Snapshot { providers: Provider[]; reports: Report[]; }

/** Management session is private to this adapter; OAuth credentials never leave OmniRoute. */
export function omniRouteQuota(options: Options): () => Promise<Snapshot> {
  const base = options.baseUrl.replace(/\/+$/, "");
  const dashboardUrl = options.dashboardUrl || "http://omni.wsoft/dashboard/quota";
  let cookie = "";
  let snapshot: Snapshot | undefined;
  let expires = 0;
  let pending: Promise<Snapshot> | undefined;
  async function login() {
    const r = await fetch(base + "/api/auth/login", { method: "POST", redirect: "error",
      headers: { "content-type": "application/json" }, body: JSON.stringify({ password: options.password }), signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`OmniRoute dashboard login: HTTP ${r.status}`);
    cookie = r.headers.getSetCookie().map(s => s.split(";")[0]).filter(s => s?.startsWith("auth_token=")).join("; ");
    if (!cookie) throw new Error("OmniRoute dashboard login returned no session");
  }
  async function get(path: string) {
    if (!cookie) await login();
    let r = await fetch(base + path, { headers: { cookie }, redirect: "error", signal: AbortSignal.timeout(15000) });
    if (r.status === 401 || r.status === 403) {
      cookie = "";
      await login();
      r = await fetch(base + path, { headers: { cookie }, redirect: "error", signal: AbortSignal.timeout(15000) });
    }
    if (!r.ok) throw new Error(`OmniRoute quota: HTTP ${r.status}`);
    const j: unknown = await r.json();
    if (!isRecord(j)) throw new Error("Invalid OmniRoute quota response");
    return j;
  }
  function safeError(e: unknown) {
    return e instanceof Error && /^OmniRoute |^Invalid OmniRoute/.test(e.message) ? e.message : "OmniRoute quota request failed or timed out";
  }
  async function refresh(): Promise<Snapshot> {
    const now = Date.now();
    try {
      const overview = await get("/api/usage/quota");
      if (!Array.isArray(overview.providers)) throw new Error("Invalid OmniRoute account list");
      const accounts = overview.providers.filter(isRecord).filter(p => p.provider === "claude" || p.provider === "cursor");
      const pairs = await Promise.all(accounts.map(async p => {
        const connectionId = readString(p.connectionId);
        if (!connectionId) throw new Error("Invalid OmniRoute connection ID");
        const kind = p.provider === "cursor" ? "cursor" : "claude";
        const id = "omni-" + kind + "-" + connectionId;
        const label = kind === "cursor" ? "Cursor · OmniRoute" : "Claude Code · OmniRoute";
        const provider: Provider = { id, label, email: readString(p.name), connected: p.tokenStatus !== "expired", readOnly: true, managedBy: "OmniRoute" };
        const report: Report = { provider: id, label, dashboardUrl, limits: [], fetchedAt: now };
        try {
          const usage = await get("/api/usage/" + encodeURIComponent(connectionId));
          if (usage.error) throw new Error("OmniRoute account quota unavailable");
          provider.plan = readString(usage.plan);
          if (!isRecord(usage.quotas)) throw new Error("Invalid OmniRoute quota windows");
          const quotaEntries = Object.entries(usage.quotas);
          const hideCursorTotal = kind === "cursor" && quotaEntries.some(([name, q]) => {
            if (name === "Total" || !isRecord(q) || q.unlimited === true) return false;
            const used = readNumber(q.used), total = readNumber(q.total), remaining = readNumber(q.remainingPercentage);
            const fraction = total !== undefined && total > 0 && used !== undefined ? used / total : remaining !== undefined ? (100 - remaining) / 100 : undefined;
            return fraction !== undefined && Number.isFinite(fraction);
          });
          for (const [name, q] of quotaEntries) {
            if (!isRecord(q) || q.unlimited === true) continue;
            if (hideCursorTotal && name === "Total") continue;
            const used = readNumber(q.used), total = readNumber(q.total), remaining = readNumber(q.remainingPercentage);
            const fraction = total !== undefined && total > 0 && used !== undefined ? used / total : remaining !== undefined ? (100 - remaining) / 100 : undefined;
            if (fraction === undefined || !Number.isFinite(fraction)) continue;
            const reset = readString(q.resetAt);
            const resetsAt = reset ? Date.parse(reset) : NaN;
            report.limits.push({ id: name, label: name, usedFraction: Math.max(0, Math.min(1, fraction)), ...(Number.isFinite(resetsAt) ? { resetsAt } : {}) });
          }
          if (!report.limits.length) report.error = "OmniRoute returned no measurable quota windows";
        } catch(e) { report.error = safeError(e); }
        return { provider, report };
      }));
      for (const [kind, name] of [["claude", "Claude Code"], ["cursor", "Cursor"]]) {
        if (accounts.some(p => p.provider === kind)) continue;
        const id = "omni-" + kind, label = name + " · OmniRoute";
        pairs.push({ provider: { id, label, connected: false, readOnly: true, managedBy: "OmniRoute" }, report: { provider: id, label, dashboardUrl, limits: [], fetchedAt: now, error: "No " + name + " accounts connected in OmniRoute" } });
      }
      snapshot = { providers: pairs.map(p => p.provider), reports: pairs.map(p => p.report) };
      expires = now + (snapshot.reports.some(r => r.error) ? 60000 : 300000);
    } catch(e) {
      const error = safeError(e);
      snapshot = snapshot ? { providers: snapshot.providers, reports: snapshot.reports.map(r => ({ ...r, cached: true, error })) } : {
        providers: ["claude", "cursor"].map(kind => ({ id: "omni-" + kind, label: (kind === "cursor" ? "Cursor" : "Claude Code") + " · OmniRoute", connected: false, readOnly: true, managedBy: "OmniRoute" })),
        reports: ["claude", "cursor"].map(kind => ({ provider: "omni-" + kind, label: (kind === "cursor" ? "Cursor" : "Claude Code") + " · OmniRoute", dashboardUrl, limits: [], fetchedAt: now, error })),
      };
      expires = now + 60000;
    }
    return snapshot;
  }
  return async () => {
    if (snapshot && Date.now() < expires) return { providers: snapshot.providers, reports: snapshot.reports.map(r => ({ ...r, cached: true })) };
    if (!pending) pending = refresh().finally(() => { pending = undefined; });
    return pending;
  };
}
