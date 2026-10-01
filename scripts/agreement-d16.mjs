// Two-grader agreement for a judgment source (D7, D11, D16).
// Usage: node scripts/agreement-d16.mjs <source>
// Reads data/raw/<source>/verdicts-d16-graderA.json and -graderB.json. Batch files
// (verdicts-d16-graderA-<batch>.json) are merged with the main file when present.
// A batch named w<N> or w<N>-<batch> is grading wave N (D26): claims added to a source
// after its first wave was graded. Files without a wave name are wave w1. Each wave gets
// its own kappa; every wave must pass D11.
// Writes data/raw/<source>/agreement-d16.json. Labels come from the raw edition
// file named by the claim id (<source>-<edition>-<nnn>, or et-<edition>-<nnn>):
// the entry with that id, else the entry at position nnn (D15).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = process.argv[2];
if (!source || !/^[a-z0-9-]+$/.test(source)) throw new Error("usage: agreement-d16.mjs <source>");
const dir = path.resolve(import.meta.dirname, "../data/raw", source);
if (!existsSync(dir)) throw new Error(`${source}: no data/raw/${source}`);

function load(g) {
	const re = new RegExp(`^verdicts-d16-grader${g}(-[a-z0-9-]+)?\\.json$`);
	const files = readdirSync(dir).filter((f) => re.test(f)).sort();
	if (!files.length) throw new Error(`${source}: no verdicts-d16-grader${g}.json`);
	const byId = new Map();
	for (const f of files) {
		const wave = f.match(/-(w\d+)(?:-[a-z0-9-]+)?\.json$/)?.[1] ?? "w1";
		for (const v of JSON.parse(readFileSync(path.join(dir, f), "utf8")).verdicts) {
			if (byId.has(v.id)) throw new Error(`${source}: grader ${g} has ${v.id} twice (${f})`);
			byId.set(v.id, { ...v, wave });
		}
	}
	return byId;
}
const A = load("A");
const B = load("B");

const editions = new Map();
function edition(ed) {
	if (!editions.has(ed)) {
		const f = path.join(dir, `${ed}.json`);
		editions.set(ed, existsSync(f) ? JSON.parse(readFileSync(f, "utf8")).entries : []);
	}
	return editions.get(ed);
}
function label(id) {
	// Edition is YYYY or YYYY-MM (pew-elon-imagining-2010-02-001).
	const m = id.match(/-(\d{4}(?:-\d{2})?)-(\d+)$/);
	const entries = m ? edition(m[1]) : [];
	const e = entries.find((x) => x.id === id) ?? entries[Number(m?.[2]) - 1];
	return e?.label ?? e?.quote ?? e?.claim ?? e?.statement ?? "";
}

const pairs = [...A.values()].map((a) => [a, B.get(a.id)]).filter(([, b]) => b);
for (const [a, b] of pairs) if (a.wave !== b.wave) throw new Error(`${source}: ${a.id} is in wave ${a.wave} for grader A and ${b.wave} for grader B`);
const onlyA = [...A.keys()].filter((id) => !B.has(id));
const onlyB = [...B.keys()].filter((id) => !A.has(id));
const n = pairs.length;
if (!n) throw new Error(`${source}: no claim graded by both graders`);
// ungradable: no public measure of the claim exists (not a D16 verdict; never published as one).
const CATS = ["hit", "partial", "miss", "unfalsifiable", "ungradable"];
for (const [a, b] of pairs) for (const v of [a.verdict, b.verdict]) if (!CATS.includes(v)) throw new Error(`${source}: ${a.id} has verdict ${v}`);

function kappaOf(ps) {
	const m = ps.length;
	const po = ps.filter(([a, b]) => a.verdict === b.verdict).length / m;
	const pe = CATS.reduce((s, c) => s + (ps.filter(([a]) => a.verdict === c).length / m) * (ps.filter(([, b]) => b.verdict === c).length / m), 0);
	return pe === 1 ? 1 : (po - pe) / (1 - pe);
}
const count = (xs) => Object.fromEntries(CATS.map((c) => [c, xs.filter((x) => x === c).length]).filter(([, k]) => k));
const agreeing = pairs.filter(([a, b]) => a.verdict === b.verdict);
const po = agreeing.length / n;
const kappa = kappaOf(pairs);
const waveNames = [...new Set(pairs.map(([a]) => a.wave))].sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)));
const multi = waveNames.length > 1;
const w = (a) => (multi ? { wave: a.wave } : {});

function wilson(k, m, z = 1.96) {
	if (!m) return null;
	const p = k / m;
	const d = 1 + (z * z) / m;
	const c = p + (z * z) / (2 * m);
	const r = z * Math.sqrt((p * (1 - p)) / m + (z * z) / (4 * m * m));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}

const consensus = agreeing.filter(([a]) => a.verdict !== "unfalsifiable" && a.verdict !== "ungradable").map(([a]) => ({ id: a.id, label: label(a.id), verdict: a.verdict, ...w(a) }));
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
	...(multi
		? {
				waves: Object.fromEntries(
					waveNames.map((name) => {
						const ps = pairs.filter(([a]) => a.wave === name);
						const k = r4(kappaOf(ps));
						return [name, { n: ps.length, agree: ps.filter(([a, b]) => a.verdict === b.verdict).length, kappa: k, passes_d11: k >= 0.6 }];
					}),
				),
			}
		: {}),
	graderA: count(pairs.map(([a]) => a.verdict)),
	graderB: count(pairs.map(([, b]) => b.verdict)),
	agreed: count(agreeing.map(([a]) => a.verdict)),
	hit_rate_agreed: {
		hits,
		of_graded_hit_partial_miss: consensus.length,
		wilson95: wilson(hits, consensus.length),
		note: "Among claims both graders agree on, excluding unfalsifiable and ungradable. Not yet audited (D11 audit pending).",
	},
	consensus,
	// Both graders unfalsifiable: listed for the adjudicator (D20), counted in final-d20 when not adjudicated.
	unfalsifiable_agreed: agreeing.filter(([a]) => a.verdict === "unfalsifiable").map(([a]) => ({ id: a.id, label: label(a.id), ...w(a) })),
	// Both graders ungradable: no public measure. Counted in final-d20, never in a rate.
	ungradable_agreed: agreeing.filter(([a]) => a.verdict === "ungradable").map(([a]) => ({ id: a.id, label: label(a.id), ...w(a) })),
	contested: pairs.filter(([a, b]) => a.verdict !== b.verdict).map(([a, b]) => ({ id: a.id, label: label(a.id), graderA: a.verdict, graderB: b.verdict, ...w(a) })),
};
writeFileSync(path.join(dir, "agreement-d16.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(source, JSON.stringify({ n, agree: out.agree, kappa: out.kappa, passes_d11: out.passes_d11, waves: out.waves, graderA: out.graderA, graderB: out.graderB, agreed: out.agreed }));
if (onlyA.length || onlyB.length) console.warn(`${source}: graded by one grader only, left out: A ${onlyA.length}, B ${onlyB.length}`);
if (!out.passes_d11) console.warn(`${source}: kappa below 0.6 (D11). Revise the rubric before adjudication.`);
for (const [name, x] of Object.entries(out.waves ?? {})) if (!x.passes_d11) console.warn(`${source}: wave ${name} kappa ${x.kappa} below 0.6 (D11).`);
