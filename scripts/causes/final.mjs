// Final miss causes and the D63 test.
// Usage: node scripts/causes/final.mjs <run>
// Agreed primary: coder A's call, secondary causes and evidence merged from both coders.
// Contested: the adjudicator's call (calls/adjudicator.json). Audit (calls/auditor.json): where the
// auditor's primary differs from the final call, the auditor's call replaces it; the family error rate is
// the share of audited claims whose primary family changed.
// Writes <run>/final.json and the results block of data/measures/miss-causes/README.md.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAUSES, CAUSE_LIST, family, loadCalls, readJson, round, runDir, wilson, writeJson } from "./lib.mjs";

const run = process.argv[2];
const dir = runDir(run);
const { candidates } = readJson(path.join(dir, "candidates.json"));
const A = loadCalls(run, "A", candidates);
const B = loadCalls(run, "B", candidates);
const ADJ = loadCalls(run, "adjudicator", candidates);
const AUD = loadCalls(run, "auditor", candidates);
const agreement = readJson(path.join(dir, "agreement.json"));
if (!agreement.passes) throw new Error("agreement gate failed: revise the prompt and recode (D63)");

const NON = new Set(CAUSE_LIST.filter((c) => family(c) === "non_technical"));
const rows = [];
const problems = [];
for (const c of candidates) {
	const a = A.get(c.id);
	const b = B.get(c.id);
	if (!a || !b) { problems.push(`${c.id}: missing coder call`); continue; }
	let call;
	let status;
	if (a.primary === b.primary) {
		const ev = new Map([...a.evidence, ...b.evidence].map((e) => [e.url, e]));
		call = { primary: a.primary, secondary: [...new Set([...a.secondary, ...b.secondary])].filter((s) => s !== a.primary), reason: a.reason, evidence: [...ev.values()] };
		status = "agreed";
	} else {
		const j = ADJ.get(c.id);
		if (!j) { problems.push(`${c.id}: contested, no adjudicator call`); continue; }
		call = j;
		status = "adjudicated";
	}
	const audit = AUD.get(c.id);
	let audited = null;
	if (audit) {
		audited = audit.primary === call.primary ? "confirm" : "correct";
		if (audited === "correct") audited = family(audit.primary) === family(call.primary) ? "correct_within_family" : "correct_family";
		if (audit.primary !== call.primary) { call = audit; status = "audit_corrected"; }
	}
	rows.push({ id: c.id, source_id: c.source_id, subject_id: c.subject_id, verdict: c.verdict, status, audited, primary: call.primary, family: family(call.primary), secondary: call.secondary, reason: call.reason, evidence: call.evidence });
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }

const known = rows.filter((r) => r.primary !== "unknown");
const unknownShare = round((rows.length - known.length) / rows.length);
const h1 = wilson(known.filter((r) => r.family === "non_technical").length, known.length);
const verdict = unknownShare > 0.4 ? "inconclusive (unknown above 40%)" : h1.low > 0.5 ? "holds" : h1.high < 0.5 ? "fails" : "inconclusive";
const anyNon = wilson(known.filter((r) => NON.has(r.primary) || r.secondary.some((s) => NON.has(s))).length, known.length);
const costAsTech = wilson(known.filter((r) => r.family === "non_technical" && r.primary !== "cost").length, known.length);
const drivers = known.filter((r) => r.family === "technical" || r.family === "non_technical");
const techVsNon = wilson(drivers.filter((r) => r.family === "non_technical").length, drivers.length);
const causes = Object.fromEntries(CAUSE_LIST.map((k) => [k, { primary: rows.filter((r) => r.primary === k).length, any: rows.filter((r) => r.primary === k || r.secondary.includes(k)).length }]));
const sources = [...new Set(rows.map((r) => r.source_id))].sort();
const bySource = Object.fromEntries(sources.map((s) => {
	const k = known.filter((r) => r.source_id === s);
	const x = k.filter((r) => r.family === "non_technical").length;
	return [s, { n: rows.filter((r) => r.source_id === s).length, known: k.length, non_technical: x, ...(k.length >= 20 ? { interval: wilson(x, k.length) } : {}) }];
}));
const auditedRows = rows.filter((r) => r.audited);
const audit = { n: auditedRows.length, confirm: auditedRows.filter((r) => r.audited === "confirm").length, correct_within_family: auditedRows.filter((r) => r.audited === "correct_within_family").length, correct_family: auditedRows.filter((r) => r.audited === "correct_family").length };
audit.family_error_rate = audit.n ? round(audit.correct_family / audit.n) : null;
const status = Object.fromEntries(["agreed", "adjudicated", "audit_corrected"].map((s) => [s, rows.filter((r) => r.status === s).length]));

const summary = { run, rule: "D63", n: rows.length, status, agreement: { family: agreement.family, cause: agreement.cause }, audit, unknown_share: unknownShare, h1: { ...h1, verdict }, any_non_technical: anyNon, h1_cost_as_technical: costAsTech, technical_vs_non_technical: techVsNon, causes, by_source: bySource };
writeJson(path.join(dir, "final.json"), { ...summary, rows });

const pct = (w) => (w ? `${Math.round(w.share * 100)}% [${Math.round(w.low * 100)}%, ${Math.round(w.high * 100)}%] (${w.k}/${w.n})` : "n/a");
const lines = [
	`<!-- results:${run} -->`,
	`## Results, run ${run}`,
	"",
	`Generated by \`node scripts/causes/final.mjs ${run}\`. Do not edit by hand.`,
	"",
	`- Sample: ${rows.length} claims (${status.agreed} agreed, ${status.adjudicated} adjudicated, ${status.audit_corrected} corrected by the audit).`,
	`- Agreement: kappa ${agreement.family.kappa} on primary family (observed ${agreement.family.observed}), ${agreement.cause.kappa} on the nine causes.`,
	`- Audit: ${audit.n} agreed claims; ${audit.confirm} confirmed, ${audit.correct_within_family} corrected within the family, ${audit.correct_family} corrected to another family (family error rate ${audit.family_error_rate}).`,
	`- Unknown: ${Math.round(unknownShare * 100)}% of the sample.`,
	`- **H1, non-technical primary cause among known causes: ${pct(h1)}. Verdict: ${verdict}.**`,
	`- Any non-technical cause, primary or secondary: ${pct(anyNon)}.`,
	`- H1 with cost counted as technical: ${pct(costAsTech)}.`,
	`- Technical against non-technical only (forecast errors left out): ${pct(techVsNon)} non-technical.`,
	"",
	"| Cause | Family | Primary | Primary or secondary |",
	"|---|---|---|---|",
	...CAUSE_LIST.map((k) => `| ${k} | ${family(k)} | ${causes[k].primary} | ${causes[k].any} |`),
	"",
	"| Source | Sample | Known cause | Non-technical primary | Interval |",
	"|---|---|---|---|---|",
	...sources.map((s) => { const b = bySource[s]; return `| ${s} | ${b.n} | ${b.known} | ${b.non_technical} | ${b.interval ? pct(b.interval) : "counts only"} |`; }),
	`<!-- /results:${run} -->`,
].join("\n");
const readme = path.join(CAUSES, "README.md");
let text = existsSync(readme) ? readFileSync(readme, "utf8") : "";
const re = new RegExp(`<!-- results:${run} -->[\\s\\S]*<!-- /results:${run} -->`);
text = re.test(text) ? text.replace(re, lines) : `${text.trimEnd()}\n\n${lines}\n`;
writeFileSync(readme, text);
console.log(JSON.stringify({ n: rows.length, unknownShare, h1, verdict, anyNon, costAsTech, techVsNon, audit }, null, 1));
