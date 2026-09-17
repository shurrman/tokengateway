import { createHash, timingSafeEqual } from "node:crypto";

export async function dashboardAuth(): Promise<(request: Request) => Response | undefined> {
	const path = process.env.DASHBOARD_PASSWORD_FILE;
	const password = path
		? (await Bun.file(path).text()).trim()
		: process.env.DASHBOARD_PASSWORD ?? "";
	if (password.length < 16) {
		throw new Error("Set DASHBOARD_PASSWORD_FILE or DASHBOARD_PASSWORD to a password of at least 16 characters");
	}
	const username = process.env.DASHBOARD_USERNAME || "quota";
	const digest = (value: string) => createHash("sha256").update(value).digest();
	const expected = digest(`${username}:${password}`);
	return request => {
		const header = request.headers.get("authorization") ?? "";
		const supplied = /^Basic /i.test(header)
			? Buffer.from(header.slice(6), "base64").toString("utf8")
			: "";
		if (timingSafeEqual(expected, digest(supplied))) return;
		return new Response("Authentication required", {
			status: 401,
			headers: {
				"www-authenticate": 'Basic realm="TokenGateway", charset="UTF-8"',
				"cache-control": "no-store",
			},
		});
	};
}
