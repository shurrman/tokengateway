import { afterEach, expect, test } from "bun:test";
import { dashboardAuth } from "../src/auth";

const prior = { password: process.env.DASHBOARD_PASSWORD, path: process.env.DASHBOARD_PASSWORD_FILE };
afterEach(() => {
	for (const [name, value] of [["DASHBOARD_PASSWORD", prior.password], ["DASHBOARD_PASSWORD_FILE", prior.path]]) {
		if (value === undefined) delete process.env[name!];
		else process.env[name!] = value;
	}
});

test("dashboard fails closed without a usable password", async () => {
	delete process.env.DASHBOARD_PASSWORD;
	delete process.env.DASHBOARD_PASSWORD_FILE;
	await expect(dashboardAuth()).rejects.toThrow("at least 16");
	process.env.DASHBOARD_PASSWORD = "short";
	await expect(dashboardAuth()).rejects.toThrow("at least 16");
});
