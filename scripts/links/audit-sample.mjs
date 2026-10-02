// Fixed-seed audit sample of accepted links (D48, D11, D20).
// Usage: node scripts/links/audit-sample.mjs <run> [--out <dir outside git>] [--check]
// Pool: every candidate whose decided verdict is link, broader or narrower: verifier consensus,
// or the adjudicator's call on a contested pair. Every contested pair must be adjudicated first.
// Size: at least 50 or 10% of the pool, stratified by verdict, seed d48:<run>.
// Writes data/links/runs/<run>/audit.json {rule, auditor, seed, sample, records}. Never redraws over records.
// With --out, writes <out>/audit/sample.json: each sampled pair as the verifiers saw it, with the decided verdict.
import path from "node:path";
import { LinkVerdictFile } from "../../src/schema.ts";
import { LINKS, exists, readJson, writeJson } from "./lib.mjs";

const run = process.argv[2];
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("usage: audit-sample.mjs <run> [--out <dir>] [--check]");
const out = process.argv.includes("--out") ? process.argv[process.argv.indexOf("--out") + 1] : null;
const check = process.argv.includes("--check");
const dir = path.join(LINKS, "runs", run);
const agreement = readJson(path.join(dir, "agreement.json"));
if (!agreement.kappa_passes_d11) throw new Error(`${run}: kappa ${agreement.kappa} < 0.6; revise the verifier prompt (D11) before the audit`);
if (agreement.missing.length) throw new Error(`${run}: ${agreement.missing.length} candidates not judged by both verifiers`);
const adjFile = path.join(dir, "adjudicated.json");
const adjudicated = exists(adjFile) ? new Map(LinkVerdictFile.parse(readJson(adjFile)).verdicts.map((v) => [v.candidate_id, v])) : new Map();
const open = agreement.contested.filter((c) => !adjudicated.has(c.id));
if (open.length) throw new Error(`${run}: ${open.length} contested pairs without an adjudicated verdict`);

const decided = [...agreement.consensus, ...agreement.contested.map((c) => ({ id: c.id, verdict: adjudicated.get(c.id).verdict }))];
const pool = decided.filter((d) => d.verdict !== "no_link");

function fnv1a(s) {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h;
}
function drawSample(items, seed) {
	const size = Math.min(items.length, Math.max(50, Math.ceil(items.length * 0.1)));
	const strata = new Map();
	for (const a of items) strata.set(a.verdict, [...(strata.get(a.verdict) ?? []), a.id]);
	const alloc = new Map();
	for (const [v, ids] of strata) alloc.set(v, Math.min(ids.length, Math.floor((size * ids.length) / items.length)));
	let left = size - [...alloc.values()].reduce((a, b) => a + b, 0);
	const order = [...strata.keys()].sort((a, b) => strata.get(b).length - strata.get(a).length || a.localeCompare(b));
	while (left > 0 && order.some((v) => alloc.get(v) < strata.get(v).length)) {
		for (const v of order) {
			if (left > 0 && alloc.get(v) < strata.get(v).length) {
				alloc.set(v, alloc.get(v) + 1);
				left--;
			}
		}
	}
	const picked = [];
	for (const [v, ids] of strata) picked.push(...[...ids].sort((a, b) => fnv1a(`${seed}:${a}`) - fnv1a(`${seed}:${b}`) || a.localeCompare(b)).slice(0, alloc.get(v)));
	return picked.sort((a, b) => a.localeCompare(b));
}

const seed = `d48:${run}`;
const sample = drawSample(pool, seed);
const file = path.join(dir, "audit.json");
const existing = exists(file) ? readJson(file) : null;
const same = existing && existing.seed === seed && JSON.stringify(existing.sample) === JSON.stringify(sample);
const verdictOf = new Map(decided.map((d) => [d.id, d.verdict]));
const strata = Object.fromEntries(["link", "broader", "narrower"].map((v) => [v, sample.filter((id) => verdictOf.get(id) === v).length]));
if (check) {
	console.log(JSON.stringify({ run, seed, pool: pool.length, size: sample.length, strata, matches_audit_file: existing ? same : null }));
	if (existing && !same) process.exit(1);
} else {
	if (!same) {
		if (existing && Object.keys(existing.records ?? {}).length) throw new Error(`${run}: audit.json has records for another sample; do not redraw over audit records`);
		writeJson(file, { rule: "D48", auditor: existing?.auditor ?? "agent (D20)", seed, pool: pool.length, sample, records: existing?.records ?? {} });
	}
	console.log(run, same ? "sample unchanged" : "sample written", sample.length, JSON.stringify(strata));
}
if (out && !check) {
	const { candidates } = readJson(path.join(dir, "candidates.json"));
	const batchOf = new Map(candidates.map((c) => [c.id, c.batch]));
	const rows = sample.map((id) => {
		const b = readJson(path.join(out, "batches", `${batchOf.get(id)}.json`));
		return { ...b.candidates.find((x) => x.candidate_id === id), decided_verdict: verdictOf.get(id) };
	});
	writeJson(path.join(out, "audit", "sample.json"), { run, seed, sample: rows });
}
