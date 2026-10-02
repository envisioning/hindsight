// D11 audit sample for a measure source: D32 (WEF event matches) and D34 (pathway coverage).
// Usage: node scripts/measure-audit-sample.mjs <source> [--check]
// Same draw as scripts/audit-sample.mjs (and www app/hindsight/_lib/audit.ts drawSample): at least 50
// rows or 10%, all rows if fewer than 50, stratified by verdict (no stratum is weighted: these verdicts
// are not hit or miss), each stratum ranked by FNV-1a of `<seed>:<id>`.
//   D32 (wef-global-risks): population = the matched events both blind matchers agreed on in
//     summary-d32.json (status `agreed`, or audited with the matchers' verdict in `was`; the adjudicated
//     event is not drawn, as D20 audits agreed verdicts). id = `<year>|<event>`. Seed d11:wef-global-risks:d32. Writes audit-d32.json.
//   D34 (shell-scenarios, ipcc-pathways): population = graded rows of coverage-d34.json
//     (an observed value exists; the comparison itself is arithmetic), counting rows a fix after the
//     audit took out of grading by their `pre_fix` comparison. id = `<edition>|<metric>|<year>`.
//     Seed d11:<source>:d34. Writes audit-d34.json.
//   D34 (nic-global-trends): population = the scenario verdicts both blind graders agreed on
//     (coverage-d34.json rows[].scenario_verdicts, status `agreed`, or audited with the graders' verdict in `was`).
//     id = scenario claim id. Seed d11:nic-global-trends:d34. Writes audit-d34.json.
// Keeps existing records. Refuses to change a sample that already has records (D24: a fix in code
// never moves an audited sample). --check only compares.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = process.argv[2];
const check = process.argv.includes("--check");
const dir = path.resolve(import.meta.dirname, "../data/raw", source ?? "");
const read = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));

let rule, population, file;
if (source === "wef-global-risks") {
	rule = "d32";
	// An audited row keeps its matchers' verdict in `was` (corrected or contested by the audit).
	population = read("summary-d32.json").rows.filter((r) => r.status === "agreed" || r.was !== undefined).map((r) => ({ id: `${r.year}|${r.event}`, verdict: r.was ?? r.verdict }));
	file = "audit-d32.json";
} else if (source === "shell-scenarios" || source === "ipcc-pathways") {
	rule = "d34";
	// A row a later fix took out of grading keeps its earlier comparison in `pre_fix` (D24: the sample never moves).
	population = read("coverage-d34.json").rows.filter((r) => r.status === "graded" || r.pre_fix).map((r) => ({ id: `${r.edition}|${r.metric}|${r.year}`, verdict: r.pre_fix?.verdict ?? r.verdict }));
	file = "audit-d34.json";
} else if (source === "nic-global-trends") {
	rule = "d34";
	// Narrative sets: the scenario verdicts both blind graders agreed on (D20 audits agreed verdicts, not the
	// adjudicated ones). An audited scenario keeps the graders' verdict in `was`.
	population = read("coverage-d34.json")
		.rows.flatMap((r) => r.scenario_verdicts ?? [])
		.filter((v) => v.status === "agreed" || v.was !== undefined)
		.map((v) => ({ id: v.id, verdict: v.was ?? v.verdict }));
	file = "audit-d34.json";
} else throw new Error("usage: measure-audit-sample.mjs <wef-global-risks|shell-scenarios|ipcc-pathways|nic-global-trends> [--check]");

function fnv1a(s) {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}
function drawSample(rows, seed) {
	const size = Math.min(rows.length, Math.max(50, Math.ceil(rows.length * 0.1)));
	const strata = new Map();
	for (const a of rows) strata.set(a.verdict, [...(strata.get(a.verdict) ?? []), a.id]);
	const total = rows.length;
	const alloc = new Map();
	for (const [v, ids] of strata) alloc.set(v, Math.min(ids.length, Math.floor((size * ids.length) / total)));
	let left = size - [...alloc.values()].reduce((a, b) => a + b, 0);
	const order = [...strata.keys()].sort((a, b) => strata.get(b).length - strata.get(a).length);
	while (left > 0 && order.some((v) => alloc.get(v) < strata.get(v).length)) {
		for (const v of order) {
			if (left > 0 && alloc.get(v) < strata.get(v).length) {
				alloc.set(v, alloc.get(v) + 1);
				left--;
			}
		}
	}
	const out = [];
	for (const [v, ids] of strata) {
		const ranked = [...ids].sort((a, b) => fnv1a(`${seed}:${a}`) - fnv1a(`${seed}:${b}`));
		out.push(...ranked.slice(0, alloc.get(v)));
	}
	return out.sort((a, b) => a.localeCompare(b));
}

const seed = `d11:${source}:${rule}`;
const sample = drawSample(population, seed);
const target = path.join(dir, file);
const existing = existsSync(target) ? JSON.parse(readFileSync(target, "utf8")) : null;
const same = existing && existing.seed === seed && JSON.stringify(existing.sample) === JSON.stringify(sample);
const strata = {};
for (const id of sample) {
	const v = population.find((p) => p.id === id).verdict;
	strata[v] = (strata[v] ?? 0) + 1;
}
if (check) {
	console.log(source, JSON.stringify({ seed, size: sample.length, of: population.length, strata, matches_audit_file: existing ? same : null }));
	if (existing && !same) process.exit(1);
} else if (same) {
	console.log(source, `sample unchanged (${sample.length} of ${population.length})`, JSON.stringify(strata));
} else {
	if (existing && Object.keys(existing.records ?? {}).length) throw new Error(`${source}: ${file} has records for another sample; do not redraw over audit records.`);
	const head = source === "nic-global-trends" ? { rule: "D11 audit of D34 narrative scenario verdicts (D20, D45)", checks: "the scenario's premise as printed in the edition (Wayback copy of the official file); the graders' cited evidence on the world at the horizon year; the verdict (covered: the defining premise held; partly_covered: a defining premise feature held, not all; not_covered: none held)." } : rule === "d32" ? { rule: "D11 audit of D32 event matches (D20)", checks: "event meets a D32 criterion (UCDP-first death tally, GDP effect, or IMF/World Bank review); match to the WEF risk; that risk's rank in the January edition of the event year; the verdict under D32." } : { rule: "D11 matching audit of D34 pathway coverage (D19, D20)", checks: "scenario values as printed in the edition; observed series, definition, unit and year; observed value; the verdict." };
	writeFileSync(target, `${JSON.stringify({ ...head, auditor: "agent (D20)", seed, of: population.length, sample, records: existing?.records ?? {} }, null, 1)}\n`);
	console.log(source, `sample written (${sample.length} of ${population.length})`, JSON.stringify(strata));
}
