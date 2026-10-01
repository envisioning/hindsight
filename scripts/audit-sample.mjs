// D11 audit sample for a judgment source, reproducible from this repo alone.
// Usage: node scripts/audit-sample.mjs <source> [--check]
// Reads data/raw/<source>/agreement-d16.json (consensus list) and draws a fixed-seed
// stratified sample: at least 50 claims or 10% of agreed claims, misses weighted 1.5.
// Seed: d11:<source>:d16. Same draw as www app/hindsight/_lib/audit.ts drawSample.
// Writes the sample into data/raw/<source>/audit-d11.json and keeps existing records.
// Refuses to change a sample that already has audit records. --check only compares.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = process.argv[2];
const check = process.argv.includes("--check");
if (!source || !/^[a-z0-9-]+$/.test(source)) throw new Error("usage: audit-sample.mjs <source> [--check]");
const dir = path.resolve(import.meta.dirname, "../data/raw", source);
const agreementFile = path.join(dir, "agreement-d16.json");
if (!existsSync(agreementFile)) throw new Error(`${source}: no agreement-d16.json. Run scripts/agreement-d16.mjs first.`);
const agreement = JSON.parse(readFileSync(agreementFile, "utf8"));

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
	// Hand out the remainder one at a time, largest stratum with room first.
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

const seed = `d11:${source}:d16`;
const sample = drawSample(agreement.consensus ?? [], seed);
const auditFile = path.join(dir, "audit-d11.json");
const existing = existsSync(auditFile) ? JSON.parse(readFileSync(auditFile, "utf8")) : null;
const same = existing && existing.seed === seed && JSON.stringify(existing.sample) === JSON.stringify(sample);
const strata = Object.fromEntries(["hit", "partial", "miss"].map((v) => [v, sample.filter((id) => agreement.consensus.find((c) => c.id === id)?.verdict === v).length]));

if (check) {
	console.log(source, JSON.stringify({ seed, size: sample.length, strata, matches_audit_file: existing ? same : null }));
	if (existing && !same) process.exit(1);
} else if (same) {
	console.log(source, `sample unchanged (${sample.length})`, JSON.stringify(strata));
} else {
	if (existing && Object.keys(existing.records ?? {}).length) throw new Error(`${source}: audit-d11.json has records for another sample. The agreement changed after the audit; do not redraw over audit records.`);
	writeFileSync(auditFile, `${JSON.stringify({ rule: "D11", auditor: existing?.auditor ?? "agent (D20)", seed, sample, records: existing?.records ?? {} }, null, 1)}\n`);
	console.log(source, `sample written (${sample.length})`, JSON.stringify(strata));
}
