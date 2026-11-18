// Sample missed and partial technology forecasts for miss-cause coding (D63).
// Usage: node scripts/causes/candidates.mjs <run> [n=200] [batch=40]
// Population: every judgment source with data/raw/<source>/final-d20.json; final verdict miss or partial;
// the claim's subject is of kind `technology` (Envisioning posters: every claim, they are all technologies).
// One claim per subject (lowest seeded hash), then the n subjects with the lowest seeded hash.
// Seed: `d63:<run>`. Writes data/measures/miss-causes/runs/<run>/candidates.json.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MissCauseCandidate } from "../../src/schema.ts";

const REPO = path.resolve(import.meta.dirname, "../..");
const run = process.argv[2];
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("usage: candidates.mjs <run> [n] [batch]");
const N = Number(process.argv[3] ?? 200);
const BATCH = Number(process.argv[4] ?? 40);
const seed = `d63:${run}`;
const h = (s) => createHash("sha256").update(`${seed}:${s}`).digest("hex");
const read = (f) => JSON.parse(readFileSync(f, "utf8"));

const claims = new Map(read(path.join(REPO, "data/out/claims.json")).map((c) => [c.id, c]));
const subjects = new Map(read(path.join(REPO, "data/normalized/subjects.json")).map((s) => [s.id, s]));
const RAW = path.join(REPO, "data/raw");

function graderRows(source) {
	const dir = path.join(RAW, source);
	const byId = new Map();
	for (const f of readdirSync(dir).filter((f) => /^verdicts-.*(grader[AB]|grader2).*\.json$/.test(f)).sort()) {
		const j = read(path.join(dir, f));
		const rows = Array.isArray(j) ? j : j.verdicts ?? [];
		for (const r of rows) {
			if (!r?.id) continue;
			if (!byId.has(r.id)) byId.set(r.id, []);
			byId.get(r.id).push({
				reading: r.reading ?? r.statement,
				reason: r.reason,
				evidence: (r.evidence ?? []).filter((e) => e?.url).map((e) => ({ url: e.url, shows: e.shows ?? e.note ?? e.title })),
				subject_id: r.subject_id,
			});
		}
	}
	return byId;
}

function claimText(c, g) {
	if (!c) return g.find((x) => x.reading)?.reading ?? "";
	const parts = [c.quote && c.statement && c.quote !== c.statement ? `${c.statement} (label: ${c.quote})` : c.statement ?? c.quote];
	if (c.position) parts.push(`position: ${c.position}`);
	if (c.target_date) parts.push(`target: ${c.target_date}`);
	else if (c.horizon_band) parts.push(`horizon: ${c.horizon_band}`);
	if (c.phase) parts.push(`phase: ${c.phase}`);
	return parts.filter(Boolean).join("; ").slice(0, 600);
}

const pool = [];
for (const source of readdirSync(RAW).sort()) {
	const file = path.join(RAW, source, "final-d20.json");
	if (!existsSync(file)) continue;
	const grader = graderRows(source);
	const poster = source.startsWith("envisioning-");
	for (const v of read(file).verdicts) {
		if (v.verdict !== "miss" && v.verdict !== "partial") continue;
		const c = claims.get(v.id);
		const g = grader.get(v.id) ?? [];
		const subjectId = c?.subject_ids.find((i) => subjects.get(i)?.kind === "technology") ?? (poster ? g.find((x) => x.subject_id)?.subject_id ?? `${source}:${v.id}` : undefined);
		if (!subjectId) continue;
		const claim = claimText(c, g);
		if (!claim) continue;
		pool.push({ id: v.id, source_id: source, subject_id: subjectId, verdict: v.verdict, claim, graders: g.map(({ subject_id, ...x }) => x) });
	}
}

const bySubject = new Map();
for (const p of pool) {
	const cur = bySubject.get(p.subject_id);
	if (!cur || h(p.id) < h(cur.id)) bySubject.set(p.subject_id, p);
}
const picked = [...bySubject.values()].sort((a, b) => (h(a.subject_id) < h(b.subject_id) ? -1 : 1)).slice(0, N);
const candidates = picked.map((p, i) => MissCauseCandidate.parse({ ...p, subject_id: p.subject_id.includes(":") ? undefined : p.subject_id, batch: `b${Math.floor(i / BATCH) + 1}` }));

const count = (arr, k) => arr.reduce((m, x) => ((m[x[k]] = (m[x[k]] ?? 0) + 1), m), {});
const out = path.join(REPO, "data/measures/miss-causes/runs", run);
mkdirSync(out, { recursive: true });
writeFileSync(
	path.join(out, "candidates.json"),
	`${JSON.stringify({ run, seed, rule: "D63", population: { claims: pool.length, subjects: bySubject.size, by_source: count(pool, "source_id") }, sample: { n: candidates.length, by_source: count(candidates, "source_id"), by_verdict: count(candidates, "verdict") }, candidates }, null, "\t")}\n`,
);
console.log(`population ${pool.length} claims, ${bySubject.size} subjects; sample ${candidates.length}`);
console.log(count(candidates, "source_id"), count(candidates, "verdict"));
console.log(`no grader text: ${candidates.filter((c) => !c.graders.length).length}`);
