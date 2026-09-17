import { open, rename, unlink } from "node:fs/promises";
import { dirname } from "node:path";

export async function atomicWriteJson(path: string, value: unknown): Promise<void> {
	const temporary = `${path}.${crypto.randomUUID()}.tmp`;
	try {
		const file = await open(temporary, "wx", 0o600);
		try {
			await file.writeFile(JSON.stringify(value, null, 2));
			await file.sync();
		} finally {
			await file.close();
		}
		await rename(temporary, path);
		const directory = await open(dirname(path), "r");
		try { await directory.sync(); }
		finally { await directory.close(); }
	} finally {
		await unlink(temporary).catch(error => { if (error.code !== "ENOENT") throw error; });
	}
}
