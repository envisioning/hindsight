// Apply link re-checks (D56, D24 for links) to data/links/research.json, append-only.
// Usage: node scripts/links/apply-recheck.mjs [--dry]
// Reads every data/links/runs/<run>/recheck.json (LinkRecheckFile in src/schema.ts), in run-name order.
// Each record names the row it checked (`row_id`, the latest row of the pair at re-check time).
// - confirm: no row.
// - correct to no_link: a `retracted` row; to another relation: an `active` row with that relation.
//   The new row copies the checked row (URL parts, similarity, method), with agent `rechecker:<agent>`,
//   run `<recheck run>`, created_at the record's `at`, and a reason naming the re-check.
// Idempotent: a pair whose latest row is the one this re-check wrote is left alone. A pair whose latest
// row is neither the checked row nor this re-check's row changed after the re-check: the script stops.
// A pair whose latest row has method `curated` is never touched.
// Writes data/links/runs/<run>/summary.json: counts, rows appended, and, when `audit_run` is set, that
// run's audit residual (audit records in the re-check scope count as fixed; audit.json is not changed).
import path from "node:path";
import { readdirSync } from "node:fs";
import { LinkAuditRecord, LinkRecheckFile, SubjectTechnologyLink } from "../../src/schema.ts";
import { LINKS, exists, readJson, writeJson } from "./lib.mjs";

const dry = process.argv.includes("--dry");
const runsDir = path.join(LINKS, "runs");
const files = readdirSync(runsDir)
	.sort()
	.map((r) => path.join(runsDir, r, "recheck.json"))
	.filter(exists);

const researchFile = path.join(LINKS, "research.json");
const rows = readJson(researchFile);
const latest = new Map();
const countOf = new Map();
for (const r of rows) {
	const k = `${r.subject_id}~${r.technology_id}`;
	latest.set(k, r);
	countOf.set(k, (countOf.get(k) ?? 0) + 1);
}

const added = [];
for (const file of files) {
	const rc = LinkRecheckFile.parse(readJson(file));
	const agent = `rechecker:${rc.agent}`;
	const scope = new RegExp(rc.scope_original_id);
	let appended = 0;
	let already = 0;
	let curated = 0;
	for (const rec of rc.records) {
		if (rec.decision === "confirm") continue;
		const prev = latest.get(rec.pair_id);
		if (!prev) throw new Error(`${rc.run}: ${rec.pair_id} has no row`);
		if (prev.method === "curated") {
			curated++;
			continue;
		}
		if (prev.agent === agent && prev.run === rc.run) {
			already++;
			continue;
		}
		if (prev.id !== rec.row_id) throw new Error(`${rc.run}: ${rec.pair_id} changed after the re-check (latest ${prev.id}, checked ${rec.row_id})`);
		if (prev.status !== "active" || prev.relation !== rec.earlier_relation) throw new Error(`${rc.run}: ${rec.row_id} is not an active ${rec.earlier_relation} row`);
		if (!scope.test(prev.original_id)) throw new Error(`${rc.run}: ${rec.row_id} is outside the re-check scope`);
		const n = (countOf.get(rec.pair_id) ?? 0) + 1;
		countOf.set(rec.pair_id, n);
		const retract = rec.corrected_relation === "no_link";
		const row = SubjectTechnologyLink.parse({
			...prev,
			id: `${rec.pair_id}#${n}`,
			relation: retract ? prev.relation : rec.corrected_relation,
			agent,
			status: retract ? "retracted" : "active",
			reason: `re-check ${rc.run} (D56) of ${prev.run} ${prev.relation}: ${rec.reason}`.slice(0, 300),
			run: rc.run,
			created_at: rec.at,
		});
		added.push(row);
		latest.set(rec.pair_id, row);
		appended++;
	}

	const tally = {};
	for (const rec of rc.records) {
		const k = `${rec.earlier_relation}>${rec.corrected_relation ?? "confirm"}`;
		tally[k] = (tally[k] ?? 0) + 1;
	}
	const summary = {
		rule: rc.rule,
		run: rc.run,
		checked: rc.records.length,
		confirm: rc.records.filter((r) => r.decision === "confirm").length,
		correct: rc.records.filter((r) => r.decision === "correct").length,
		by_earlier_relation: Object.fromEntries(
			["same", "broader", "narrower"].map((rel) => {
				const of = rc.records.filter((r) => r.earlier_relation === rel);
				return [rel, { checked: of.length, confirm: of.filter((r) => r.decision === "confirm").length, corrections: Object.fromEntries(["same", "broader", "narrower", "no_link"].map((c) => [c, of.filter((r) => r.corrected_relation === c).length]).filter(([, v]) => v > 0)) }];
			}),
		),
		transitions: tally,
		/** Rows of research.json written by this re-check (stable across re-runs). */
		rows_written: [...rows, ...added].filter((r) => r.agent === agent && r.run === rc.run).length,
		curated_kept: curated,
	};

	// Audit residual of the audited run: records in the re-check scope count as fixed.
	if (rc.audit_run) {
		const dir = path.join(runsDir, rc.audit_run);
		const audit = readJson(path.join(dir, "audit.json"));
		const cand = new Map(readJson(path.join(dir, "candidates.json")).candidates.map((c) => [c.id, c]));
		const checked = new Map(rc.records.map((r) => [r.pair_id, r]));
		const inScope = audit.sample.filter((id) => scope.test(cand.get(id).original_id));
		const errors = audit.sample.filter((id) => LinkAuditRecord.parse(audit.records[id]).decision !== "confirm");
		const fixed = errors.filter((id) => inScope.includes(id));
		const residual = errors.filter((id) => !inScope.includes(id));
		const confirmedThenCorrected = inScope.filter((id) => audit.records[id].decision === "confirm" && checked.get(id)?.decision === "correct");
		summary.audit = {
			run: rc.audit_run,
			sampled: audit.sample.length,
			errors: errors.length,
			error_rate: Number((errors.length / audit.sample.length).toFixed(4)),
			sampled_in_scope: inScope.length,
			fixed_by_recheck: fixed,
			residual_errors: residual.length,
			residual_error_rate: Number((residual.length / audit.sample.length).toFixed(4)),
			/** Sampled pairs the auditor confirmed and the re-check corrected (fixed now; the audit missed them). */
			confirmed_by_audit_corrected_by_recheck: confirmedThenCorrected,
		};
	}
	console.log(JSON.stringify(summary, null, 1));
	console.log(`${rc.run}: ${appended} rows appended now, ${already} already applied`);
	if (!dry) writeJson(path.join(path.dirname(file), "summary.json"), summary);
}

if (!dry && added.length) writeJson(researchFile, [...rows, ...added]);
console.log(`${added.length} rows appended${dry ? " (dry run)" : ""}`);
