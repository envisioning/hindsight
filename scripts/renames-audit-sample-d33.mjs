// D11 audit sample for D33 rename checks of a trend source, reproducible from this repo alone.
// Usage: node scripts/renames-audit-sample-d33.mjs <source> [--pass2 | --pass <N>] [--check]
//
// Method (the pass-1 draw, which had no script; this file reproduces its stored sample exactly):
// rank every candidate row the two checkers agree on by fnv1a(`${seed}:${id}`) ascending and take
// the first 50, then sort by id. No strata and no weights (pass 1 drew 25 faded of 50 from a pool
// that is half faded). Pass 1: pool = all rows of renames-d33-checkerA.json, agreement = same
// verdict class only, seed d11:<source>:d33. Pass 2 (--pass2, D24, D40): pool = rows listed in
// renames-d33-pass2-scope.json, agreement = same verdict class and, for same/renamed, same match_id,
// seed d11:<source>:d33:pass2. Pass N >= 2 (--pass <N>; --pass2 is --pass 2): the same with
// renames-d33-pass<N>-scope.json, the pass-N checker files and seed d11:<source>:d33:pass<N>.
// Note: FNV-1a over ids that differ in the last digits clusters neighbouring ids together, so the
// sample is not spread evenly across editions. It is kept for continuity with pass 1.
// Writes only `seed` and `sample` into renames-audit-d33[-pass2].json when the file is absent or
// has no records; refuses to change a sample that has records. --check only compares.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = process.argv[2];
const pi = process.argv.indexOf("--pass");
const passN = process.argv.includes("--pass2") ? 2 : pi > 0 ? Number(process.argv[pi + 1]) : 1;
const pass2 = passN >= 2;
const check = process.argv.includes("--check");
if (!source || !/^[a-z0-9-]+$/.test(source) || !Number.isInteger(passN) || passN < 1) throw new Error("usage: renames-audit-sample-d33.mjs <source> [--pass2 | --pass <N>] [--check]");
const dir = path.resolve(import.meta.dirname, "../data/raw", source);
const read = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
const SIZE = 50;

function fnv1a(s) {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}

const suffix = pass2 ? `-pass${passN}` : "";
const A = read(`renames-d33-checkerA${suffix}.json`).verdicts;
const B = new Map(read(`renames-d33-checkerB${suffix}.json`).verdicts.map((v) => [v.id, v]));
const scope = pass2 ? new Set(read(`renames-d33-pass${passN}-scope.json`).rows.map((r) => r.id)) : null;
const agreed = A.filter((a) => {
	const b = B.get(a.id);
	if (!b || b.verdict !== a.verdict) return false;
	if (scope && !scope.has(a.id)) return false;
	return !pass2 || a.verdict === "faded" || a.match_id === b.match_id;
});
const seed = pass2 ? `d11:${source}:d33:pass${passN}` : `d11:${source}:d33`;
const sample = agreed
	.map((a) => a.id)
	.sort((x, y) => fnv1a(`${seed}:${x}`) - fnv1a(`${seed}:${y}`))
	.slice(0, SIZE)
	.sort((x, y) => x.localeCompare(y));
const strata = Object.fromEntries(["same", "renamed", "faded"].map((v) => [v, sample.filter((id) => agreed.find((a) => a.id === id).verdict === v).length]));

const file = path.join(dir, `renames-audit-d33${suffix}.json`);
const existing = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
const same = existing && existing.seed === seed && JSON.stringify(existing.sample) === JSON.stringify(sample);
if (check) {
	console.log(source, JSON.stringify({ seed, pool: agreed.length, size: sample.length, strata, matches_audit_file: existing ? same : null }));
	if (existing && !same) process.exit(1);
} else if (same) {
	console.log(source, `sample unchanged (${sample.length})`, JSON.stringify(strata));
} else {
	if (existing && Object.keys(existing.records ?? {}).length) throw new Error(`${path.basename(file)} has records for another sample; do not redraw over audit records.`);
	writeFileSync(file, `${JSON.stringify({ rule: "D11 audit of D33 rename checks", ...(pass2 ? { pass: passN } : {}), seed, sample, records: {} }, null, 1)}\n`);
	console.log(source, `sample written (${sample.length}, pool ${agreed.length})`, JSON.stringify(strata));
}
