// Two-verifier agreement on link candidates (D48; same steps as D7, D11, D20).
// Usage: node scripts/links/agreement.mjs <run> [--out <dir outside git>]
// Reads data/links/runs/<run>/candidates.json and verdicts/verifier-<A|B>-<batch>.json (LinkVerdictFile).
// Writes data/links/runs/<run>/agreement.json: Cohen's kappa over link|no_link|broader|narrower,
// consensus, contested, and missing (candidates a verifier has not judged).
// With --out, also writes <out>/adjudicate/contested.json: each contested pair with both calls, for the adjudicator.
import { readdirSync } from "node:fs";
import path from "node:path";
import { LinkVerdictFile } from "../../src/schema.ts";
import { LINKS, exists, readJson, writeJson } from "./lib.mjs";

const run = process.argv[2];
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("usage: agreement.mjs <run> [--out <dir>]");
const out = process.argv.includes("--out") ? process.argv[process.argv.indexOf("--out") + 1] : null;
const dir = path.join(LINKS, "runs", run);
const { candidates } = readJson(path.join(dir, "candidates.json"));
const byId = new Map(candidates.map((c) => [c.id, c]));
const vdir = path.join(dir, "verdicts");
const files = exists(vdir) ? readdirSync(vdir) : [];

function load(role) {
	const calls = new Map();
	const agents = new Set();
	for (const f of files.filter((f) => new RegExp(`^verifier-${role}-[a-z0-9-]+\\.json$`).test(f)).sort()) {
		const file = LinkVerdictFile.parse(readJson(path.join(vdir, f)));
		if (file.role !== role || file.run !== run) throw new Error(`${f}: role ${file.role}, run ${file.run}`);
		agents.add(file.agent);
		for (const v of file.verdicts) {
			const c = byId.get(v.candidate_id);
			if (!c) throw new Error(`${f}: unknown candidate ${v.candidate_id}`);
			if (c.batch !== file.batch) throw new Error(`${f}: ${v.candidate_id} is in batch ${c.batch}`);
			if (calls.has(v.candidate_id)) throw new Error(`${f}: ${v.candidate_id} twice`);
			calls.set(v.candidate_id, v);
		}
	}
	return { calls, agents: [...agents].sort() };
}
const A = load("A");
const B = load("B");

const CATS = ["link", "no_link", "broader", "narrower"];
const both = candidates.filter((c) => A.calls.has(c.id) && B.calls.has(c.id));
const n = both.length;
if (!n) throw new Error(`${run}: no candidate judged by both verifiers`);
const agree = both.filter((c) => A.calls.get(c.id).verdict === B.calls.get(c.id).verdict);
const po = agree.length / n;
const pe = CATS.reduce((s, k) => {
	const a = both.filter((c) => A.calls.get(c.id).verdict === k).length / n;
	const b = both.filter((c) => B.calls.get(c.id).verdict === k).length / n;
	return s + a * b;
}, 0);
const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);
// D49: when one verdict dominates (expected agreement 0.8 or more), kappa says little even at high
// agreement (a title-match run is mostly `link`); the gate is then observed agreement of 0.9 or more.
const skewed = pe >= 0.8;
const passes = skewed ? po >= 0.9 : kappa >= 0.6;
// Accept or not: the decision that matters for a primary or related link.
const accept = (v) => v !== "no_link";
const agreeAccept = both.filter((c) => accept(A.calls.get(c.id).verdict) === accept(B.calls.get(c.id).verdict)).length;
const matrix = Object.fromEntries(CATS.map((a) => [a, Object.fromEntries(CATS.map((b) => [b, both.filter((c) => A.calls.get(c.id).verdict === a && B.calls.get(c.id).verdict === b).length]))]));

const consensus = agree.map((c) => ({ id: c.id, verdict: A.calls.get(c.id).verdict }));
const contested = both
	.filter((c) => A.calls.get(c.id).verdict !== B.calls.get(c.id).verdict)
	.map((c) => ({ id: c.id, A: A.calls.get(c.id), B: B.calls.get(c.id) }));
const missing = candidates.filter((c) => !A.calls.has(c.id) || !B.calls.has(c.id)).map((c) => ({ id: c.id, batch: c.batch, A: A.calls.has(c.id), B: B.calls.has(c.id) }));
const result = {
	rule: "D48",
	run,
	verifier_A: A.agents,
	verifier_B: B.agents,
	candidates: candidates.length,
	judged_by_both: n,
	agreement: Number(po.toFixed(4)),
	kappa: Number(kappa.toFixed(4)),
	expected_agreement: Number(pe.toFixed(4)),
	kappa_passes_d11: kappa >= 0.6,
	gate: skewed ? "D49: expected agreement >= 0.8, observed agreement >= 0.9" : "D11: kappa >= 0.6",
	passes,
	accept_agreement: Number((agreeAccept / n).toFixed(4)),
	matrix_A_rows_B_columns: matrix,
	consensus_counts: Object.fromEntries(CATS.map((k) => [k, consensus.filter((c) => c.verdict === k).length])),
	consensus,
	contested: contested.map((c) => ({ id: c.id, A: c.A.verdict, B: c.B.verdict })),
	missing,
};
writeJson(path.join(dir, "agreement.json"), result);
if (out) {
	// The pair as the verifiers saw it, from the batch input written by candidates.mjs.
	const batches = new Map();
	const input = (c) => {
		const b = byId.get(c.id).batch;
		if (!batches.has(b)) batches.set(b, new Map(readJson(path.join(out, "batches", `${b}.json`)).candidates.map((x) => [x.candidate_id, x])));
		return batches.get(b).get(c.id);
	};
	writeJson(path.join(out, "adjudicate", "contested.json"), { run, contested: contested.map((c) => ({ ...input(c), A: c.A, B: c.B })) });
}
console.log(
	JSON.stringify({ run, judged_by_both: n, agreement: result.agreement, kappa: result.kappa, passes, gate: result.gate, consensus: result.consensus_counts, contested: contested.length, missing: missing.length }),
);
