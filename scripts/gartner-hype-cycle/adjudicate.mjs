// Hype Cycle adjudication (D20, D21).
// Usage: node scripts/gartner-hype-cycle/adjudicate.mjs
// Reads data/raw/gartner-hype-cycle/timelines-adjudicated-d20.json: one settled timeline
// per subject where the two builders disagree, written by adjudicator agents.
// Computes the verdict of every contested claim (and every claim both builders called
// unfalsifiable) from the settled timeline with the same rule as the builders (rule.mjs).
// A re-check pass (timelines-adjudicated-d20-pass<N>.json, D24) replaces the settled
// timeline of each subject it covers; later passes win. Earlier passes are never edited.
// Writes adjudicated-d20.json in the shape scripts/final-d20.mjs reads.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { grade } from "./rule.mjs";

const dir = path.resolve(import.meta.dirname, "../../data/raw/gartner-hype-cycle");
const readJson = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
const agreement = readJson("agreement-d16.json");
const settled = new Map(readJson("timelines-adjudicated-d20.json").timelines.map((t) => [t.subject_id, { ...t, pass: 1 }]));
const passes = readdirSync(dir)
	.map((f) => f.match(/^timelines-adjudicated-d20-pass(\d+)\.json$/))
	.filter(Boolean)
	.map((m) => [Number(m[1]), m[0]])
	.sort((a, b) => a[0] - b[0]);
for (const [n, f] of passes) for (const t of readJson(f).timelines) settled.set(t.subject_id, { ...t, pass: n });
const A = new Map(readJson("verdicts-d16-graderA.json").verdicts.map((v) => [v.id, v]));

const todo = [
	...agreement.contested.map((c) => ({ id: c.id, graderA: c.graderA, graderB: c.graderB })),
	...(agreement.unfalsifiable_agreed ?? []).map((c) => ({ id: c.id, graderA: "unfalsifiable", graderB: "unfalsifiable" })),
];
const missing = new Set();
const verdicts = [];
for (const c of todo) {
	const a = A.get(c.id);
	const t = settled.get(a.subject_id);
	if (!t) {
		missing.add(a.subject_id);
		continue;
	}
	const [verdict, why] = grade(t, a.placed_year);
	verdicts.push({
		id: c.id,
		graderA: c.graderA,
		graderB: c.graderB,
		verdict,
		subject_id: a.subject_id,
		placed_year: a.placed_year,
		pass: t.pass,
		reading: t.reading,
		timeline: { year_5pct: t.year_5pct, year_mainstream: t.year_mainstream, abandoned: t.abandoned, abandoned_year: t.abandoned_year, ambiguous: t.ambiguous === true },
		reason: `${why} ${t.reason}`.trim(),
		evidence: t.evidence,
	});
}
if (missing.size) throw new Error(`no settled timeline for: ${[...missing].join(", ")}`);
writeFileSync(
	path.join(dir, "adjudicated-d20.json"),
	`${JSON.stringify({ rule: "D16", role: "adjudicator (D20)", method: "D21: settled timeline per subject, verdict computed with scripts/gartner-hype-cycle/rule.mjs", verdicts }, null, 1)}\n`,
);
const counts = {};
for (const v of verdicts) counts[v.verdict] = (counts[v.verdict] ?? 0) + 1;
console.log("adjudicated", verdicts.length, JSON.stringify(counts));
