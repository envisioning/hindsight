// Embed the technology subjects with the CMS model (D48, #59).
// Usage: OPENROUTER_API_KEY=... LINKS_CACHE=<dir> node scripts/links/embed-subjects.mjs
// Input: data/normalized/subject-text.json (kind technology). Refuses to run unless the last
// entry of data/links/model-checks.json passed (check-model.mjs).
// Writes, outside git: <cache>/subjects.{ids.json,f32} and subjects.hashes.json (reused when a text is unchanged).
// Writes, in git: data/links/subject-vectors.json (model, dimensions, one sha256 per input text; no vectors).
import path from "node:path";
import {
	EMBEDDING_DIMENSIONS,
	EMBEDDING_MODEL,
	LINKS,
	NORMALIZED,
	cacheDir,
	embed,
	exists,
	loadVectors,
	readJson,
	saveVectors,
	sha256,
	writeJson,
} from "./lib.mjs";

const checks = exists(path.join(LINKS, "model-checks.json")) ? readJson(path.join(LINKS, "model-checks.json")) : [];
const last = checks.at(-1);
if (!last?.pass || last.model !== EMBEDDING_MODEL || last.dimensions !== EMBEDDING_DIMENSIONS)
	throw new Error("no passing model check for this model; run check-model.mjs first");

const texts = readJson(path.join(NORMALIZED, "subject-text.json")).filter((s) => s.kind === "technology");
const dir = cacheDir();
const hashFile = path.join(dir, "subjects.hashes.json");
const old = new Map();
if (exists(hashFile) && exists(path.join(dir, "subjects.f32"))) {
	const hashes = readJson(hashFile);
	const { ids, vecs } = loadVectors("subjects");
	ids.forEach((id, i) => old.set(`${id}:${hashes[i]}`, Array.from(vecs[i])));
}
const rows = texts.map((t) => ({ id: t.subject_id, text: t.text, hash: sha256(t.text) }));
const todo = rows.filter((r) => !old.has(`${r.id}:${r.hash}`));
console.log(`${rows.length} subjects; ${rows.length - todo.length} cached; ${todo.length} to embed`);
const fresh = new Map();
for (let i = 0; i < todo.length; i += 100) {
	const batch = todo.slice(i, i + 100);
	const vecs = await embed(
		batch.map((r) => r.text),
		`subjects ${i}`,
	);
	batch.forEach((r, j) => fresh.set(`${r.id}:${r.hash}`, vecs[j]));
	process.stdout.write(`\r${Math.min(i + 100, todo.length)}/${todo.length}`);
}
if (todo.length) process.stdout.write("\n");
const vecs = rows.map((r) => fresh.get(`${r.id}:${r.hash}`) ?? old.get(`${r.id}:${r.hash}`));
saveVectors(
	"subjects",
	rows.map((r) => r.id),
	vecs,
);
writeJson(
	hashFile,
	rows.map((r) => r.hash),
);
writeJson(path.join(LINKS, "subject-vectors.json"), {
	model: EMBEDDING_MODEL,
	dimensions: EMBEDDING_DIMENSIONS,
	input: "data/normalized/subject-text.json, kind technology",
	embedded_at: new Date().toISOString(),
	note: "Vectors are not committed. text_sha256 is the sha256 of the UTF-8 text that was embedded.",
	subjects: rows.map((r) => ({ subject_id: r.id, text_sha256: r.hash })),
});
