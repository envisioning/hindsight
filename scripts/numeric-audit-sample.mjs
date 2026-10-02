// D11 matching audit sample for a numeric source (D19, D20, issue #53).
// Usage: node scripts/numeric-audit-sample.mjs <source|--all> [--check]
// Reads data/graded/numeric/<source>.json and draws a fixed-seed sample of graded rows:
// at least 50 rows or 10% of graded rows (all rows if fewer than 50), stratified by verdict,
// misses weighted 1.5. Same draw as scripts/audit-sample.mjs, seed d11:<source>:numeric.
// Writes data/graded/audit/<source>.json and keeps existing records. Refuses to change a
// sample that already has records (a regrade must not move an audited sample). --check only compares.
// Supplementary sample (D46): --supplement <tag> --editions <e1,e2,...> draws the same way over the graded rows of
// those editions only, seed d11:<source>:numeric:<tag>, into data/graded/audit/<source>-supplement-<tag>.json. It
// is for rows added after the first audit; the first sample and its records are not touched.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const NUMERIC = ["bcb-focus", "bnef-evo", "bp-energy-outlook", "cbo-projections", "ecb-projections", "eia-aeo", "fed-sep", "iea-weo", "imf-weo", "obr-forecasts", "oecd-economic-outlook", "world-bank-gep"];
const arg = process.argv[2];
const check = process.argv.includes("--check");
const sources = arg === "--all" ? NUMERIC : [arg];
const opt = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined);
const supTag = opt("--supplement");
const supEditions = opt("--editions")?.split(",");
if (supTag !== undefined && (!/^[a-z0-9-]+$/.test(supTag) || !supEditions?.length || sources.length !== 1)) throw new Error("--supplement <tag> needs one source and --editions <e1,e2,...>");
if (!arg || !sources.every((s) => NUMERIC.includes(s))) throw new Error(`usage: numeric-audit-sample.mjs <${NUMERIC.join("|")}|--all> [--check]`);
const root = path.resolve(import.meta.dirname, "..", "data", "graded");
mkdirSync(path.join(root, "audit"), { recursive: true });

const MISS_WEIGHT = 1.5;
function fnv1a(s) {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}
function drawSample(agreed, seed) {
	const size = Math.min(agreed.length, Math.max(50, Math.ceil(agreed.length * 0.1)));
	const strata = new Map();
	for (const a of agreed) strata.set(a.verdict, [...(strata.get(a.verdict) ?? []), a.id]);
	const weight = (v) => (v === "miss" ? MISS_WEIGHT : 1);
	const total = [...strata.entries()].reduce((s, [v, ids]) => s + weight(v) * ids.length, 0);
	const alloc = new Map();
	for (const [v, ids] of strata) alloc.set(v, Math.min(ids.length, Math.floor((size * weight(v) * ids.length) / total)));
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

let failed = false;
for (const source of sources) {
	const rows = JSON.parse(readFileSync(path.join(root, "numeric", `${source}.json`), "utf8"));
	const graded = rows.filter((r) => r.status === "graded" && (!supEditions || supEditions.includes(r.edition))).map((r) => ({ id: r.claim_id, verdict: r.verdict }));
	const seed = supTag ? `d11:${source}:numeric:${supTag}` : `d11:${source}:numeric`;
	const sample = drawSample(graded, seed);
	const file = path.join(root, "audit", supTag ? `${source}-supplement-${supTag}.json` : `${source}.json`);
	const existing = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
	const same = existing && existing.seed === seed && JSON.stringify(existing.sample) === JSON.stringify(sample);
	const strata = Object.fromEntries(["hit", "partial", "miss"].map((v) => [v, sample.filter((id) => graded.find((g) => g.id === id)?.verdict === v).length]));
	if (check) {
		console.log(source, JSON.stringify({ seed, size: sample.length, strata, matches_audit_file: existing ? same : null }));
		if (existing && !same) failed = true;
	} else if (same) {
		console.log(source, `sample unchanged (${sample.length})`);
	} else {
		if (existing && Object.keys(existing.records ?? {}).length) throw new Error(`${source}: data/graded/audit/${source}.json has records for another sample; do not redraw over audit records.`);
		const scope = supTag ? { supplement: supTag, editions: supEditions } : {};
		writeFileSync(file, `${JSON.stringify({ rule: supTag ? "D11 matching audit (D19, D20), supplementary sample (D46)" : "D11 matching audit (D19, D20)", auditor: "agent (D20)", seed, ...scope, of_graded: graded.length, sample, records: existing?.records ?? {} }, null, 1)}\n`);
		console.log(source, `sample written (${sample.length} of ${graded.length})`, JSON.stringify(strata));
	}
}
if (failed) process.exit(1);
