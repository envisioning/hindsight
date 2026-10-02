// Shared helpers for the subject-technology link pipeline (#59, D48).
// Secrets come from the process environment only and are never written or logged:
//   CMS_URL, CMS_ANON_KEY   public anon key of the Core CMS (read, published rows only)
//   OPENROUTER_API_KEY      embeddings
// LINKS_CACHE: a directory outside git for vectors and CMS snapshots.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const REPO = path.resolve(import.meta.dirname, "../..");
export const LINKS = path.join(REPO, "data/links");
export const NORMALIZED = path.join(REPO, "data/normalized");

/** The model and dimensions of `technologies.embedding` in the Core CMS (AGENTS.md, Traps). */
export const EMBEDDING_MODEL = "openai/text-embedding-3-large";
export const EMBEDDING_DIMENSIONS = 1536;

const USER_AGENT = "Mozilla/5.0";

export function cacheDir() {
	const dir = process.env.LINKS_CACHE;
	if (!dir) throw new Error("set LINKS_CACHE to a directory outside the repo");
	const abs = path.resolve(dir);
	if (abs.startsWith(REPO + path.sep)) throw new Error("LINKS_CACHE must be outside the repo");
	mkdirSync(abs, { recursive: true });
	return abs;
}

export const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
export const writeJson = (f, v) => {
	mkdirSync(path.dirname(f), { recursive: true });
	writeFileSync(f, JSON.stringify(v, null, "\t") + "\n");
};
export const exists = existsSync;

export const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

/** Research projects never linked (D52): Map research_slug -> { decision, excluded_at, reason }. */
export function excludedProjects() {
	const f = path.join(LINKS, "excluded-projects.json");
	if (!existsSync(f)) return new Map();
	return new Map(readJson(f).projects.map((p) => [p.research_slug, p]));
}

/** Same recipe as research `scripts/sync-cms-embeddings.ts`. */
export const technologyText = (t) => [t.title, t.summary, t.description].filter(Boolean).join("\n\n");

/** GET every row of a PostgREST query, 1000 at a time. */
export async function cmsRows(query) {
	const url = process.env.CMS_URL;
	const key = process.env.CMS_ANON_KEY;
	if (!url || !key) throw new Error("set CMS_URL and CMS_ANON_KEY (public anon key)");
	const rows = [];
	for (let from = 0; ; from += 1000) {
		const res = await fetch(`${url}/rest/v1/${query}`, {
			headers: { apikey: key, Authorization: `Bearer ${key}`, "User-Agent": USER_AGENT, Range: `${from}-${from + 999}` },
		});
		if (!res.ok && res.status !== 206) throw new Error(`CMS ${res.status} on ${query.split("?")[0]}`);
		const chunk = await res.json();
		rows.push(...chunk);
		if (chunk.length < 1000) return rows;
	}
}

/** Embed texts through OpenRouter; logs request counts and usage (never the key) to <cache>/requests.jsonl. */
export async function embed(texts, label) {
	const key = process.env.OPENROUTER_API_KEY;
	if (!key) throw new Error("set OPENROUTER_API_KEY");
	for (let attempt = 1; ; attempt++) {
		const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
			method: "POST",
			headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "User-Agent": USER_AGENT },
			body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts, dimensions: EMBEDDING_DIMENSIONS }),
		});
		const body = await res.json().catch(() => null);
		const ok = res.ok && Array.isArray(body?.data) && body.data.length === texts.length;
		appendFileSync(
			path.join(cacheDir(), "requests.jsonl"),
			JSON.stringify({ at: new Date().toISOString(), label, n: texts.length, status: res.status, ok, usage: body?.usage ?? null }) + "\n",
		);
		if (ok) {
			const vecs = body.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
			for (const v of vecs) if (v.length !== EMBEDDING_DIMENSIONS) throw new Error(`got ${v.length} dimensions`);
			return vecs;
		}
		if (attempt >= 3) throw new Error(`embedding failed: ${res.status} ${JSON.stringify(body?.error ?? "").slice(0, 200)}`);
		await new Promise((r) => setTimeout(r, 2000 * attempt));
	}
}

export function unit(v) {
	let n = 0;
	for (const x of v) n += x * x;
	n = Math.sqrt(n) || 1;
	return Float32Array.from(v, (x) => x / n);
}

export function dot(a, b) {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * b[i];
	return s;
}

export const cosine = (a, b) => dot(unit(a), unit(b));

/** Vectors cache: <name>.json (ids, order) + <name>.f32 (unit vectors, row-major). */
export function saveVectors(name, ids, vecs) {
	const dir = cacheDir();
	const buf = new Float32Array(ids.length * EMBEDDING_DIMENSIONS);
	vecs.forEach((v, i) => buf.set(unit(v), i * EMBEDDING_DIMENSIONS));
	writeFileSync(path.join(dir, `${name}.f32`), Buffer.from(buf.buffer));
	writeJson(path.join(dir, `${name}.ids.json`), ids);
}

export function loadVectors(name) {
	const dir = cacheDir();
	const ids = readJson(path.join(dir, `${name}.ids.json`));
	const raw = readFileSync(path.join(dir, `${name}.f32`));
	const all = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
	const vecs = ids.map((_, i) => all.subarray(i * EMBEDDING_DIMENSIONS, (i + 1) * EMBEDDING_DIMENSIONS));
	return { ids, vecs };
}

/** Title key for exact matching: the D13 normalized key (case, accents, punctuation, a final plural). */
export { normKey as titleKey } from "../../src/normalize/lib.ts";
