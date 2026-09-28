// Two-grader agreement for Kurzweil 1999 (predictions for 2009), rule D16.
// Input: verdicts-d16-graderA.json and verdicts-d16-graderB.json in data/raw/kurzweil.
// Output: data/raw/kurzweil/agreement-d16.json (same shape as envisioning-technology).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../../data/raw/kurzweil");
const load = (g) => JSON.parse(readFileSync(path.join(dir, `verdicts-d16-grader${g}.json`), "utf8")).verdicts;
const A = load("A");
const B = new Map(load("B").map((v) => [v.id, v]));
const edition = JSON.parse(readFileSync(path.join(dir, "1999.json"), "utf8")).entries;
const CATS = ["hit", "partial", "miss", "unfalsifiable"];

const count = (xs) => Object.fromEntries(CATS.map((c) => [c, xs.filter((x) => x === c).length]).filter(([, n]) => n));
const pairs = A.map((a) => [a, B.get(a.id)]).filter(([, b]) => b);
const n = pairs.length;
const agreeing = pairs.filter(([a, b]) => a.verdict === b.verdict);
const po = agreeing.length / n;
const pe = CATS.reduce((s, c) => s + (pairs.filter(([a]) => a.verdict === c).length / n) * (pairs.filter(([, b]) => b.verdict === c).length / n), 0);
const kappa = (po - pe) / (1 - pe);

function wilson(k, m, z = 1.96) {
	const p = k / m;
	const d = 1 + (z * z) / m;
	const c = p + (z * z) / (2 * m);
	const r = z * Math.sqrt((p * (1 - p)) / m + (z * z) / (4 * m * m));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}

const label = (id) => edition[Number(id.split("-").pop()) - 1]?.quote ?? "";
const consensus = agreeing.filter(([a]) => a.verdict !== "unfalsifiable").map(([a]) => ({ id: a.id, label: label(a.id), verdict: a.verdict }));
const hits = consensus.filter((c) => c.verdict === "hit").length;
const r4 = (x) => Math.round(x * 10000) / 10000;

const out = {
	rule: "D16",
	graders: ["A", "B"],
	n,
	agree: agreeing.length,
	raw_agreement: r4(po),
	kappa: r4(kappa),
	passes_d11: kappa >= 0.6,
	graderA: count(pairs.map(([a]) => a.verdict)),
	graderB: count(pairs.map(([, b]) => b.verdict)),
	agreed: count(agreeing.map(([a]) => a.verdict)),
	hit_rate_agreed: {
		hits,
		of_graded_hit_partial_miss: consensus.length,
		wilson95: wilson(hits, consensus.length),
		note: "Among claims both graders agree on, excluding unfalsifiable. Not yet audited (D11 audit pending).",
	},
	consensus,
	contested: pairs.filter(([a, b]) => a.verdict !== b.verdict).map(([a, b]) => ({ id: a.id, label: label(a.id), graderA: a.verdict, graderB: b.verdict })),
};
writeFileSync(path.join(dir, "agreement-d16.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(JSON.stringify({ n, agree: out.agree, kappa: out.kappa, graderA: out.graderA, graderB: out.graderB, agreed: out.agreed, hit_rate_agreed: out.hit_rate_agreed }));
