// Final miss causes and the D63 test.
// Usage: node scripts/causes/final.mjs <run>
// Agreed primary: coder A's call, secondary causes and evidence merged from both coders.
// Contested: the adjudicator's call (calls/adjudicator.json). Audit (calls/auditor.json): where the
// auditor's primary differs from the final call, the auditor's call replaces it; the family error rate is
// the share of audited claims whose primary family changed.
// Writes <run>/final.json and the results block of data/measures/miss-causes/README.md.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MissCauseScopeFile } from "../../src/schema.ts";
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

// D64: a claim leaves the H1 denominator only when both scope screeners mark it out of scope.
const screens = ["A", "B"].map((r) => {
	const f = path.join(dir, `scope-${r}.json`);
	if (!existsSync(f)) throw new Error(`missing ${f} (D64)`);
	const file = MissCauseScopeFile.parse(readJson(f));
	return new Map(file.calls.map((c) => [c.claim_id, c.scope]));
});
const scopeOf = (id) => {
	const [a, b] = screens.map((m) => m.get(id));
	if (!a || !b) throw new Error(`${id}: no scope call (D64)`);
	return a !== "in_scope" && b !== "in_scope" ? (a === b ? a : "out_of_scope") : "in_scope";
};
const scopeKappa = (() => {
	const ids = candidates.map((c) => c.id);
	const pairs = ids.map((id) => screens.map((m) => (m.get(id) === "in_scope" ? "in" : "out")));
	const n = pairs.length, po = pairs.filter(([a, b]) => a === b).length / n;
	const pa = pairs.filter(([a]) => a === "in").length / n, pb = pairs.filter(([, b]) => b === "in").length / n;
	const pe = pa * pb + (1 - pa) * (1 - pb);
	return { observed: round(po), kappa: pe === 1 ? 1 : round((po - pe) / (1 - pe)) };
})();

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
	rows.push({ id: c.id, scope: scopeOf(c.id), source_id: c.source_id, subject_id: c.subject_id, verdict: c.verdict, status, audited, primary: call.primary, family: family(call.primary), secondary: call.secondary, reason: call.reason, evidence: call.evidence });
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }

const inScope = rows.filter((r) => r.scope === "in_scope");
const known = inScope.filter((r) => r.primary !== "unknown");
const unknownShare = round((inScope.length - known.length) / inScope.length);
const allKnown = rows.filter((r) => r.primary !== "unknown");
const h1AllKept = wilson(allKnown.filter((r) => r.family === "non_technical").length, allKnown.length);
const h1 = wilson(known.filter((r) => r.family === "non_technical").length, known.length);
const verdict = unknownShare > 0.4 ? "inconclusive (unknown above 40%)" : h1.low > 0.5 ? "holds" : h1.high < 0.5 ? "fails" : "inconclusive";
const anyNon = wilson(known.filter((r) => NON.has(r.primary) || r.secondary.some((s) => NON.has(s))).length, known.length);
const costAsTech = wilson(known.filter((r) => r.family === "non_technical" && r.primary !== "cost").length, known.length);
const drivers = known.filter((r) => r.family === "technical" || r.family === "non_technical");
const techVsNon = wilson(drivers.filter((r) => r.family === "non_technical").length, drivers.length);
const causes = Object.fromEntries(CAUSE_LIST.map((k) => [k, { primary: inScope.filter((r) => r.primary === k).length, any: inScope.filter((r) => r.primary === k || r.secondary.includes(k)).length }]));
const sources = [...new Set(rows.map((r) => r.source_id))].sort();
const bySource = Object.fromEntries(sources.map((s) => {
	const k = known.filter((r) => r.source_id === s);
	const x = k.filter((r) => r.family === "non_technical").length;
	return [s, { n: inScope.filter((r) => r.source_id === s).length, known: k.length, non_technical: x, ...(k.length >= 20 ? { interval: wilson(x, k.length) } : {}) }];
}));
const auditedRows = rows.filter((r) => r.audited);
const audit = { n: auditedRows.length, confirm: auditedRows.filter((r) => r.audited === "confirm").length, correct_within_family: auditedRows.filter((r) => r.audited === "correct_within_family").length, correct_family: auditedRows.filter((r) => r.audited === "correct_family").length };
audit.family_error_rate = audit.n ? round(audit.correct_family / audit.n) : null;
const status = Object.fromEntries(["agreed", "adjudicated", "audit_corrected"].map((s) => [s, rows.filter((r) => r.status === s).length]));

const scope = { screen_agreement: scopeKappa, in_scope: inScope.length, above_forecast: rows.filter((r) => r.scope === "above_forecast").length, not_technology: rows.filter((r) => r.scope === "not_technology").length, out_split: rows.filter((r) => r.scope === "out_of_scope").length };
const summary = { run, rule: "D63, D64", n: rows.length, scope, status, agreement: { family: agreement.family, cause: agreement.cause }, audit, unknown_share: unknownShare, h1: { ...h1, verdict }, h1_all_claims_kept: h1AllKept, any_non_technical: anyNon, h1_cost_as_technical: costAsTech, technical_vs_non_technical: techVsNon, causes, by_source: bySource };
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
	`- Scope (D64): ${scope.in_scope} in scope; out by both screeners: ${scope.above_forecast} above forecast, ${scope.not_technology} not technology, ${scope.out_split} out for different reasons (screener agreement ${scopeKappa.observed}, kappa ${scopeKappa.kappa}).`,
	`- Unknown: ${Math.round(unknownShare * 100)}% of in-scope claims.`,
	`- **H1, non-technical primary cause among known causes: ${pct(h1)}. Verdict: ${verdict}.**`,
	`- H1 with every claim kept (D64 off): ${pct(h1AllKept)}.`,
	`- Any non-technical cause, primary or secondary: ${pct(anyNon)}.`,
	`- H1 with cost counted as technical: ${pct(costAsTech)}.`,
	`- Technical against non-technical only (forecast errors left out): ${pct(techVsNon)} non-technical.`,
	"",
	"In-scope claims only:",
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
