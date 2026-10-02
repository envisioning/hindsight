// Candidate subject-technology pairs, both directions (D48, #59; titles-only mode and skipping, D49).
// Usage: LINKS_CACHE=<dir> node scripts/links/candidates.mjs --run <run> --out <verifier dir outside the repo> [--batch-size 150] [--titles-only]
// Needs the snapshot (snapshot.mjs) in the cache, and subject vectors (embed-subjects.mjs) unless --titles-only.
// Candidates: each subject's top 5 technologies by cosine, each technology's top 3 subjects, their union,
// plus every exact or alias title match (D13 normalized key). Mutual nearest neighbours are flagged.
// --titles-only (D49): only the exact and alias title matches; no vectors, similarity null.
// Pairs decided in an earlier run (data/links/runs/<other run>/final.json `decisions`) or whose latest
// link row is `curated` are skipped (D49).
// Writes, in the repo: data/links/runs/<run>/candidates.json (LinkCandidate rows) and summary counts.
// Writes, outside the repo: <out>/batches/<batch>.json, the verifier input.
import { readdirSync } from "node:fs";
import path from "node:path";
import { LinkCandidate } from "../../src/schema.ts";
import { EMBEDDING_MODEL, LINKS, NORMALIZED, cacheDir, dot, exists, loadVectors, readJson, titleKey, writeJson } from "./lib.mjs";

const arg = (name, dflt) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : dflt);
const run = arg("--run");
const out = arg("--out");
const batchSize = Number(arg("--batch-size", "150"));
const titlesOnly = process.argv.includes("--titles-only");
if (!run || !/^[a-z0-9-]+$/.test(run) || !out) throw new Error("usage: candidates.mjs --run <run> --out <dir> [--titles-only]");
const SUBJECT_TOP = 5;
const TECH_TOP = 3;

const dir = cacheDir();
const techRows = readJson(path.join(dir, "technologies.json"));
const techById = new Map(techRows.map((t) => [t.id, t]));
const subjects = new Map(readJson(path.join(NORMALIZED, "subjects.json")).map((s) => [s.id, s]));
const subjectText = readJson(path.join(NORMALIZED, "subject-text.json"));
const texts = new Map(subjectText.map((s) => [s.subject_id, s.text]));
let T;
let S;
if (titlesOnly) {
	T = { ids: techRows.map((t) => t.id), vecs: null };
	S = { ids: subjectText.filter((s) => s.kind === "technology").map((s) => s.subject_id), vecs: null };
} else {
	T = loadVectors("technologies");
	S = loadVectors("subjects");
	const vectors = readJson(path.join(LINKS, "subject-vectors.json"));
	if (vectors.model !== EMBEDDING_MODEL) throw new Error(`subject vectors are ${vectors.model}`);
}
const nS = S.ids.length;
const nT = T.ids.length;
const sTop = []; // per subject: [[sim, ti], ...] best first
const tTop = Array.from({ length: nT }, () => []); // per technology: [[sim, si], ...]
const pairs = new Map(); // key si:ti -> {sim, subject_rank, technology_rank, match}
const pair = (si, ti) => {
	const k = `${si}:${ti}`;
	if (!pairs.has(k)) pairs.set(k, { si, ti, sim: titlesOnly ? null : dot(S.vecs[si], T.vecs[ti]), subject_rank: null, technology_rank: null, match: "semantic" });
	return pairs.get(k);
};

if (!titlesOnly) {
	// Similarity matrix, one subject row at a time; keep the top lists of both sides.
	const push = (list, item, k) => {
		if (list.length === k && item[0] <= list[k - 1][0]) return;
		list.push(item);
		list.sort((a, b) => b[0] - a[0]);
		if (list.length > k) list.pop();
	};
	const t0 = Date.now();
	for (let si = 0; si < nS; si++) {
		const top = [];
		const sv = S.vecs[si];
		for (let ti = 0; ti < nT; ti++) {
			const sim = dot(sv, T.vecs[ti]);
			push(top, [sim, ti], SUBJECT_TOP);
			push(tTop[ti], [sim, si], TECH_TOP);
		}
		sTop.push(top);
		if (si % 500 === 0) process.stdout.write(`\rsubjects ${si}/${nS} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
	}
	process.stdout.write("\n");
	sTop.forEach((top, si) => top.forEach(([, ti], r) => (pair(si, ti).subject_rank = r + 1)));
	tTop.forEach((top, ti) => top.forEach(([, si], r) => (pair(si, ti).technology_rank = r + 1)));
}

// Exact and alias title matches.
const techByKey = new Map();
T.ids.forEach((id, ti) => {
	const k = titleKey(techById.get(id).title ?? "");
	if (k) techByKey.set(k, [...(techByKey.get(k) ?? []), ti]);
});
S.ids.forEach((id, si) => {
	const s = subjects.get(id);
	const nameKey = titleKey(s.name);
	for (const ti of techByKey.get(nameKey) ?? []) pair(si, ti).match = "exact";
	for (const a of s.aliases) {
		for (const ti of techByKey.get(titleKey(a)) ?? []) {
			const p = pair(si, ti);
			if (p.match !== "exact") p.match = "alias";
		}
	}
});

// Rows, grouped by subject.
let rows = [...pairs.values()]
	.map((p) => {
		const sid = S.ids[p.si];
		const t = techById.get(T.ids[p.ti]);
		return {
			id: `${sid}~${t.id}`,
			subject_id: sid,
			technology_id: t.id,
			research_slug: t.research_slug,
			original_id: t.original_id,
			similarity: p.sim === null ? null : Number(p.sim.toFixed(4)),
			subject_rank: p.subject_rank,
			technology_rank: p.technology_rank,
			mutual_nn: !titlesOnly && sTop[p.si][0][1] === p.ti && tTop[p.ti][0][1] === p.si,
			match: p.match,
		};
	})
	.sort((a, b) => a.subject_id.localeCompare(b.subject_id) || (b.similarity ?? 0) - (a.similarity ?? 0) || a.technology_id.localeCompare(b.technology_id));

// Skip pairs decided in an earlier run, or held by a curated link (D49).
const decidedIn = new Map();
const runsDir = path.join(LINKS, "runs");
for (const r of exists(runsDir) ? readdirSync(runsDir).sort() : []) {
	const f = path.join(runsDir, r, "final.json");
	if (r === run || !exists(f)) continue;
	const final = readJson(f);
	if (!Array.isArray(final.decisions)) throw new Error(`${r}/final.json has no decisions list; re-run final.mjs ${r}`);
	for (const d of final.decisions) decidedIn.set(d.id, r);
}
const researchFile = path.join(LINKS, "research.json");
const curated = new Map();
for (const l of exists(researchFile) ? readJson(researchFile) : []) curated.set(`${l.subject_id}~${l.technology_id}`, l.method === "curated");
const skippedDecided = rows.filter((r) => decidedIn.has(r.id)).length;
const skippedCurated = rows.filter((r) => !decidedIn.has(r.id) && curated.get(r.id)).length;
rows = rows.filter((r) => !decidedIn.has(r.id) && !curated.get(r.id));

// Batches that never split a subject.
const bySubject = new Map();
for (const r of rows) bySubject.set(r.subject_id, [...(bySubject.get(r.subject_id) ?? []), r]);
const batches = [];
let cur = [];
for (const group of bySubject.values()) {
	if (cur.length && cur.length + group.length > batchSize) {
		batches.push(cur);
		cur = [];
	}
	cur.push(...group);
}
if (cur.length) batches.push(cur);
const width = String(batches.length).length < 3 ? 3 : String(batches.length).length;
batches.forEach((b, i) => {
	const name = `b${String(i + 1).padStart(width, "0")}`;
	for (const r of b) r.batch = name;
});
for (const r of rows) LinkCandidate.parse(r);

const count = (f) => rows.filter(f).length;
const summary = {
	run,
	model: titlesOnly ? null : EMBEDDING_MODEL,
	created_at: new Date().toISOString(),
	rule: titlesOnly
		? "exact and alias title matches only, no vectors (D49)"
		: `subject top ${SUBJECT_TOP} + technology top ${TECH_TOP}, union, plus exact and alias title matches (D48)`,
	subjects: nS,
	technologies: nT,
	skipped_decided_in_earlier_run: skippedDecided,
	skipped_curated: skippedCurated,
	candidates: rows.length,
	by_match: { exact: count((r) => r.match === "exact"), alias: count((r) => r.match === "alias"), semantic: count((r) => r.match === "semantic") },
	from_subject_side_only: count((r) => r.subject_rank !== null && r.technology_rank === null),
	from_technology_side_only: count((r) => r.subject_rank === null && r.technology_rank !== null),
	from_both_sides: count((r) => r.subject_rank !== null && r.technology_rank !== null),
	title_match_only: count((r) => r.subject_rank === null && r.technology_rank === null),
	mutual_nn: count((r) => r.mutual_nn),
	subjects_with_candidates: bySubject.size,
	technologies_with_candidates: new Set(rows.map((r) => r.technology_id)).size,
	batches: batches.map((b) => ({ batch: b[0].batch, candidates: b.length })),
};
writeJson(path.join(LINKS, "runs", run, "candidates.json"), { ...summary, candidates: rows });

// Verifier input: what a verifier needs to judge the pair, nothing about the other verifier.
const claimLines = (sid) => (texts.get(sid) ?? "").split("\n").filter((l, i) => i > 0 && !l.startsWith("Also called: ")).slice(0, 3);
for (const b of batches) {
	writeJson(path.join(out, "batches", `${b[0].batch}.json`), {
		run,
		batch: b[0].batch,
		candidates: b.map((r) => {
			const s = subjects.get(r.subject_id);
			const t = techById.get(r.technology_id);
			return {
				candidate_id: r.id,
				similarity: r.similarity,
				subject: { id: s.id, name: s.name, aliases: s.aliases.filter((a) => a !== s.name), sample_claims: claimLines(s.id) },
				technology: {
					id: t.id,
					title: t.title,
					summary: t.summary,
					research_project: t.research_title,
					url: `https://www.envisioning.com/research/${t.research_slug}/${t.original_id}`,
				},
			};
		}),
	});
}
console.log(JSON.stringify({ ...summary, batches: `${batches.length} batches` }, null, 1));
