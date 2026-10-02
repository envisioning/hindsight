// Embedding trap check (AGENTS.md, Traps): re-embed stored technology rows and compare with their stored vectors.
// Usage: OPENROUTER_API_KEY=... LINKS_CACHE=<dir> node scripts/links/check-model.mjs [n=2]
// Needs the snapshot (snapshot.mjs). Exits non-zero when any cosine is 0.9 or below.
// Appends the result to data/links/model-checks.json.
import path from "node:path";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, LINKS, cacheDir, dot, embed, exists, loadVectors, readJson, sha256, technologyText, unit, writeJson } from "./lib.mjs";

const n = Number(process.argv[2] ?? 2);
const rows = readJson(path.join(cacheDir(), "technologies.json"));
const { ids, vecs } = loadVectors("technologies");
// Fixed picks spread over the table: the rows at 1/3 and 2/3 (then further fractions for n > 2).
const picks = Array.from({ length: n }, (_, i) => rows[Math.floor(((i + 1) * rows.length) / (n + 1))]);
const fresh = await embed(picks.map(technologyText), "check-model");
const results = picks.map((t, i) => ({
	technology_id: t.id,
	title: t.title,
	text_sha256: sha256(technologyText(t)),
	cosine: Number(dot(unit(fresh[i]), vecs[ids.indexOf(t.id)]).toFixed(4)),
}));
const pass = results.every((r) => r.cosine > 0.9);
const file = path.join(LINKS, "model-checks.json");
const log = exists(file) ? readJson(file) : [];
log.push({ checked_at: new Date().toISOString(), model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIMENSIONS, threshold: 0.9, pass, results });
writeJson(file, log);
for (const r of results) console.log(`${r.cosine}  ${r.title}`);
console.log(pass ? "PASS" : "FAIL: stored vectors do not match this model; stop");
if (!pass) process.exit(1);
