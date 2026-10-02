// Final links of a run, appended to data/links/research.json (D48, D5, D20).
// Usage: node scripts/links/final.mjs <run> [--dry]
// Reads data/links/runs/<run>/: candidates.json, agreement.json, adjudicated.json, audit.json.
// Order: verifier consensus, else the adjudicator's call; then the audit (correct replaces it,
// reject makes it no_link). link -> relation same; broader / narrower -> related; no_link -> no link.
// Refuses to run before every contested pair is adjudicated and every sampled link is audited.
// Append-only: a pair whose latest row already says the same thing gets no new row; a changed
// relation or a newly rejected active link gets a new row (the old one is retracted by it).
// A pair whose latest row has method `curated` is never touched.
// Writes data/links/runs/<run>/final.json (counts, audit error rate, every decided pair) and appends to data/links/research.json.
import path from "node:path";
import { LinkAuditRecord, LinkVerdictFile, SubjectTechnologyLink } from "../../src/schema.ts";
import { LINKS, exists, readJson, writeJson } from "./lib.mjs";

const run = process.argv[2];
const dry = process.argv.includes("--dry");
if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("usage: final.mjs <run> [--dry]");
const dir = path.join(LINKS, "runs", run);
const { candidates } = readJson(path.join(dir, "candidates.json"));
const agreement = readJson(path.join(dir, "agreement.json"));
if (!agreement.passes) throw new Error(`${run}: agreement gate failed (${agreement.gate})`);
if (agreement.missing.length) throw new Error(`${run}: ${agreement.missing.length} candidates not judged by both verifiers`);
const adjFile = path.join(dir, "adjudicated.json");
const adj = exists(adjFile) ? LinkVerdictFile.parse(readJson(adjFile)) : null;
const adjudicated = new Map((adj?.verdicts ?? []).map((v) => [v.candidate_id, v]));
const open = agreement.contested.filter((c) => !adjudicated.has(c.id));
if (open.length) throw new Error(`${run}: ${open.length} contested pairs without an adjudicated verdict`);
const audit = readJson(path.join(dir, "audit.json"));
const unaudited = audit.sample.filter((id) => !audit.records?.[id]);
if (unaudited.length) throw new Error(`${run}: ${unaudited.length} sampled links without an audit record`);
const records = new Map(audit.sample.map((id) => [id, LinkAuditRecord.parse(audit.records[id])]));

const verifierAgent = `verifiers:${agreement.verifier_A.join(",")}+${agreement.verifier_B.join(",")}`;
const consensus = new Map(agreement.consensus.map((c) => [c.id, c.verdict]));
const at = new Date().toISOString();
const decisions = candidates.map((c) => {
	let verdict = consensus.get(c.id);
	let agent = verifierAgent;
	let reason = "verifiers agree";
	if (verdict === undefined) {
		const a = adjudicated.get(c.id);
		verdict = a.verdict;
		agent = `adjudicator:${adj.agent}`;
		reason = a.reason;
	}
	const r = records.get(c.id);
	if (r?.decision === "correct") {
		verdict = r.corrected_verdict;
		agent = `auditor:${audit.auditor}`;
		reason = r.note;
	} else if (r?.decision === "reject") {
		verdict = "no_link";
		agent = `auditor:${audit.auditor}`;
		reason = r.note;
	}
	return { c, verdict, agent, reason };
});

const RELATION = { link: "same", broader: "broader", narrower: "narrower" };
const file = path.join(LINKS, "research.json");
const rows = exists(file) ? readJson(file) : [];
const latest = new Map();
const countOf = new Map();
for (const r of rows) {
	const k = `${r.subject_id}~${r.technology_id}`;
	latest.set(k, r);
	countOf.set(k, (countOf.get(k) ?? 0) + 1);
}
const added = [];
let unchanged = 0;
let curatedKept = 0;
for (const { c, verdict, agent, reason } of decisions) {
	const k = c.id;
	const prev = latest.get(k);
	if (prev?.method === "curated") {
		curatedKept++;
		continue;
	}
	const relation = RELATION[verdict];
	const wantActive = relation !== undefined;
	if (!prev && !wantActive) continue;
	if (prev && prev.status === "active" && wantActive && prev.relation === relation) {
		unchanged++;
		continue;
	}
	if (prev && prev.status === "retracted" && !wantActive) {
		unchanged++;
		continue;
	}
	const n = (countOf.get(k) ?? 0) + 1;
	countOf.set(k, n);
	const row = SubjectTechnologyLink.parse({
		id: `${k}#${n}`,
		subject_id: c.subject_id,
		technology_id: c.technology_id,
		research_slug: c.research_slug,
		original_id: c.original_id,
		relation: relation ?? prev.relation,
		// A titles-only run (D49) has no similarity; the row then omits it.
		...(c.similarity === null || c.similarity === undefined ? {} : { similarity: c.similarity }),
		method: `d48:${c.match}`,
		agent,
		status: wantActive ? "active" : "retracted",
		reason: reason.slice(0, 300),
		run,
		created_at: at,
	});
	added.push(row);
}

const tally = (f) => decisions.filter(f).length;
const sampleDecisions = [...records.values()];
const errors = sampleDecisions.filter((r) => r.decision !== "confirm").length;
const summary = {
	rule: "D48",
	run,
	decided_at: at,
	candidates: candidates.length,
	verdicts: Object.fromEntries(["link", "broader", "narrower", "no_link"].map((v) => [v, tally((d) => d.verdict === v)])),
	adjudicated: adjudicated.size,
	audit: {
		seed: audit.seed,
		sampled: audit.sample.length,
		confirm: sampleDecisions.filter((r) => r.decision === "confirm").length,
		correct: sampleDecisions.filter((r) => r.decision === "correct").length,
		reject: sampleDecisions.filter((r) => r.decision === "reject").length,
		error_rate: Number((errors / audit.sample.length).toFixed(4)),
	},
	rows_appended: added.length,
	rows_unchanged: unchanged,
	curated_kept: curatedKept,
	/** Every decided pair of the run, link or not. A later run skips these ids (D49). */
	decisions: decisions.map((d) => ({ id: d.c.id, verdict: d.verdict })),
};
const { decisions: _list, ...printed } = summary;
console.log(JSON.stringify(printed, null, 1));
if (!dry) {
	writeJson(path.join(dir, "final.json"), summary);
	writeJson(file, [...rows, ...added]);
}
