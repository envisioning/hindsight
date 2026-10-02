// Generated link files for www (#59 step 5, D48): `pnpm links`.
// Usage: node scripts/links/publish.mjs [--check]
// Reads data/links/research.json (latest row per subject-technology pair; a curated row is never
// overridden by a later agent row; active rows only), data/links/technologies-snapshot.json (titles),
// data/normalized (subjects, published claims, editions, sources, institutions) and the published
// verdicts (data/raw/<source>/final-d20.json, final-d33.json, data/graded/numeric/<source>.json).
// Writes data/links/by-technology.json (technology -> forecasts) and data/links/by-subject.json
// (forecast -> technology). Deterministic: the same inputs give byte-identical files.
// --check: exit 1 if the committed files differ from what would be written.
// Run after `pnpm normalize`, grading and `final.mjs`; then `git add data/links` and `pnpm manifest`.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LinkedClaim, LinksBySubject, LinksByTechnology } from "../../src/schema.ts";
import { LINKS, NORMALIZED, REPO, exists, readJson } from "./lib.mjs";

const check = process.argv.includes("--check");
const RAW = path.join(REPO, "data/raw");
const GRADED = path.join(REPO, "data/graded/numeric");
const MAX_CLAIMS = 20;
const RELATION_ORDER = { same: 0, broader: 1, narrower: 2 };

// 1. Link state: latest row per pair, curated rows win over later agent rows (D48).
const rows = readJson(path.join(LINKS, "research.json"));
const state = new Map();
for (const r of rows) {
	const k = `${r.subject_id}~${r.technology_id}`;
	const prev = state.get(k);
	if (prev?.method === "curated" && r.method !== "curated") continue;
	state.set(k, r);
}
const active = [...state.values()].filter((r) => r.status === "active");
const linksAsOf = rows.length ? rows.map((r) => r.created_at).sort().at(-1) : null;

// 2. Titles and fresh URL parts from the snapshot (D48: build URLs from the snapshot, not the row).
const snapshot = new Map(readJson(path.join(LINKS, "technologies-snapshot.json")).technologies.map((t) => [t.id, t]));
const subjects = new Map(readJson(path.join(NORMALIZED, "subjects.json")).map((s) => [s.id, s]));
const missing = { technology: 0, subject: 0 };
const links = active.flatMap((r) => {
	const t = snapshot.get(r.technology_id);
	const s = subjects.get(r.subject_id);
	if (!t) missing.technology++;
	if (!s) missing.subject++;
	if (!t || !s) return [];
	return [{ ...r, research_slug: t.research_slug, original_id: t.original_id, title: t.title, name: s.name }];
});

// 3. Published claims of the linked subjects, with publisher, year and verdict.
const linkedSubjects = new Set(links.map((l) => l.subject_id));
const editions = new Map(readJson(path.join(NORMALIZED, "source_editions.json")).map((e) => [e.id, e]));
const institutions = new Map(readJson(path.join(NORMALIZED, "institutions.json")).map((i) => [i.id, i.name]));
const sources = new Map(readJson(path.join(NORMALIZED, "sources.json")).map((s) => [s.id, s]));

const verdicts = new Map();
const VALID = new Set(LinkedClaim.shape.verdict.unwrap().options.flatMap((o) => o.options ?? [o.value]));
// Not a verdict: a trend still running (`open`) or a capture gap (`gap`, D33); contested rows publish none.
const NONE = new Set(["open", "gap", "contested"]);
let unknownVerdicts = 0;
const put = (id, v) => {
	if (verdicts.has(id)) return;
	if (NONE.has(v)) v = null;
	if (v !== null && !VALID.has(v)) {
		unknownVerdicts++;
		v = null;
	}
	verdicts.set(id, v);
};
for (const source of readdirSync(RAW).sort()) {
	// D20 first: the export reads the same file (src/export/index.ts). Contested rows publish no verdict.
	const d20 = path.join(RAW, source, "final-d20.json");
	if (exists(d20)) {
		for (const v of readJson(d20).verdicts ?? []) {
			// D15, D37: the posters keep their raw id numbers (et-2012-045 is envisioning-technology-2012-045).
			const id = source.startsWith("envisioning-") ? v.id.replace(/^[a-z]+-(?=\d{4}-\d+$)/, `${source}-`) : v.id;
			put(id, v.status === "contested" ? null : v.verdict);
		}
	}
	const d33 = path.join(RAW, source, "final-d33.json");
	if (exists(d33)) for (const v of readJson(d33).verdicts ?? []) put(v.id, v.status === "contested" ? null : v.verdict);
}
if (exists(GRADED)) {
	for (const f of readdirSync(GRADED).filter((x) => x.endsWith(".json") && x !== "summary.json" && x !== "comparison.json")) {
		for (const g of readJson(path.join(GRADED, f))) if (g.status === "graded") put(g.claim_id, g.verdict);
	}
}

const claimsBySubject = new Map();
const claimDir = path.join(NORMALIZED, "claims");
for (const f of readdirSync(claimDir).filter((x) => x.endsWith(".json")).sort()) {
	for (const c of readJson(path.join(claimDir, f))) {
		if (c.published !== true) continue;
		const ed = editions.get(c.source_edition_id);
		const src = ed && sources.get(ed.source_id);
		const year = Number(String(ed?.published ?? ed?.edition ?? "").slice(0, 4));
		if (!ed || !src || !Number.isInteger(year)) continue;
		for (const sid of c.subject_ids) {
			if (!linkedSubjects.has(sid)) continue;
			const list = claimsBySubject.get(sid) ?? [];
			list.push({
				id: c.id,
				subject_id: sid,
				source_id: ed.source_id,
				publisher: institutions.get(src.publisher_id) ?? src.publisher_id,
				year,
				verdict: verdicts.get(c.id) ?? null,
				published: String(ed.published ?? ed.edition),
			});
			claimsBySubject.set(sid, list);
		}
	}
}

const byRelation = (a, b) => RELATION_ORDER[a.relation] - RELATION_ORDER[b.relation];
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// 4. by-technology.json
const techGroups = new Map();
for (const l of links) {
	const key = `${l.research_slug}/${l.original_id}`;
	const g = techGroups.get(key) ?? { l, subjects: [] };
	g.subjects.push({ subject_id: l.subject_id, name: l.name, relation: l.relation });
	techGroups.set(key, g);
}
const technologies = {};
for (const key of [...techGroups.keys()].sort()) {
	const { l, subjects: subs } = techGroups.get(key);
	subs.sort((a, b) => byRelation(a, b) || cmp(a.subject_id, b.subject_id));
	const seen = new Set();
	const claims = subs
		.flatMap((s) => claimsBySubject.get(s.subject_id) ?? [])
		.filter((c) => (seen.has(c.id) ? false : seen.add(c.id)))
		.sort((a, b) => cmp(b.published, a.published) || cmp(a.id, b.id));
	const years = claims.map((c) => c.year);
	const counts = {};
	for (const c of claims) if (c.verdict) counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;
	technologies[key] = {
		technology_id: l.technology_id,
		research_slug: l.research_slug,
		original_id: l.original_id,
		title: l.title,
		subjects: subs,
		claims: {
			count: claims.length,
			publishers: [...new Set(claims.map((c) => c.publisher))].sort((a, b) => a.localeCompare(b, "en")),
			first_year: years.length ? Math.min(...years) : null,
			last_year: years.length ? Math.max(...years) : null,
			verdicts: Object.fromEntries(Object.keys(counts).sort().map((k) => [k, counts[k]])),
			latest: claims.slice(0, MAX_CLAIMS).map(({ published: _p, ...c }) => c),
		},
	};
}
const byTechnology = LinksByTechnology.parse({ rule: "D48", links_as_of: linksAsOf, technologies });

// 5. by-subject.json
const subjectGroups = new Map();
for (const l of links) {
	const list = subjectGroups.get(l.subject_id) ?? [];
	list.push({ technology_id: l.technology_id, research_slug: l.research_slug, original_id: l.original_id, title: l.title, relation: l.relation });
	subjectGroups.set(l.subject_id, list);
}
const bySubjectEntries = {};
for (const sid of [...subjectGroups.keys()].sort()) {
	const list = subjectGroups.get(sid).sort((a, b) => byRelation(a, b) || cmp(a.research_slug, b.research_slug) || cmp(a.original_id, b.original_id));
	const claims = (claimsBySubject.get(sid) ?? []).slice().sort((a, b) => cmp(b.published, a.published) || cmp(a.id, b.id));
	bySubjectEntries[sid] = { name: subjects.get(sid).name, technologies: list, claims: claims.map(({ published: _p, ...c }) => c) };
}
const bySubject = LinksBySubject.parse({ rule: "D48", links_as_of: linksAsOf, subjects: bySubjectEntries });

const out = [
	["by-technology.json", byTechnology],
	["by-subject.json", bySubject],
];
const text = (v) => JSON.stringify(v, null, "\t") + "\n";
let stale = 0;
for (const [name, v] of out) {
	const file = path.join(LINKS, name);
	const now = text(v);
	if (check) {
		const before = exists(file) ? readFileSync(file, "utf8") : "";
		if (before !== now) {
			stale++;
			console.error(`${name}: stale, run pnpm links`);
		}
	} else {
		writeFileSync(file, now);
	}
}
const claimTotal = Object.values(technologies).reduce((n, t) => n + t.claims.count, 0);
console.log(
	JSON.stringify({
		rows: rows.length,
		pairs: state.size,
		active: active.length,
		published_links: links.length,
		dropped_missing_technology: missing.technology,
		dropped_missing_subject: missing.subject,
		technologies: Object.keys(technologies).length,
		with_claims: Object.values(technologies).filter((t) => t.claims.count).length,
		subjects: Object.keys(bySubjectEntries).length,
		claim_mentions: claimTotal,
		unknown_verdicts: unknownVerdicts,
	}),
);
if (check && stale) process.exit(1);
