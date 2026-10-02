// D32 surprise measure for the WEF Global Risks Report.
// Usage: node scripts/wef-global-risks/d32.mjs
// Reads data/raw/wef-global-risks/: events-d32.json (merged list of major events per year, from two
// blind builders and an adjudicator), matches-d32-matcherA/B.json (two blind matchers: each event
// against the edition of January of its year), matches-adjudicated-d32.json. Writes summary-d32.json:
// the share of major events WEF ranked high the year before, per method block, with a Wilson 95%
// interval. Never a hit rate (D32). Below 20 events in a block: counts only (D11).
// audit-d32.json (D11, D20; sample from scripts/measure-audit-sample.mjs): a `correct` replaces the
// agreed verdict (`not_a_major_event` drops the event), a `contest` removes it, as scripts/final-d20.mjs
// does. Each published interval is widened by the audit error rate (D28) as `audit_adjusted95`.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../../data/raw/wef-global-risks");
const read = (f) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));
const A = read("matches-d32-matcherA.json").verdicts;
const B = new Map(read("matches-d32-matcherB.json").verdicts.map((v) => [`${v.year}|${v.event}`, v]));
const adj = new Map(read("matches-adjudicated-d32.json").verdicts.map((v) => [`${v.year}|${v.event}`, v]));
function wilson(k, n, z = 1.96) {
	const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}
const auditFile = existsSync(path.join(dir, "audit-d32.json")) ? read("audit-d32.json") : null;
const records = auditFile?.records ?? {};
const rows = A.map((a) => {
	const k = `${a.year}|${a.event}`;
	const b = B.get(k);
	if (!b) throw new Error(`matcher B has no verdict for ${k}`);
	if (a.verdict === b.verdict) {
		const rec = records[k];
		if (rec?.decision === "correct") return { year: a.year, event: a.event, verdict: rec.corrected.verdict, wef_label: rec.corrected.wef_label ?? a.wef_label, status: "corrected", was: a.verdict, reason: rec.note };
		if (rec?.decision === "contest") return { year: a.year, event: a.event, verdict: "contested", wef_label: a.wef_label, status: "contested", was: a.verdict, reason: rec.note };
		return { year: a.year, event: a.event, verdict: a.verdict, wef_label: a.wef_label, status: "agreed" };
	}
	const j = adj.get(k);
	return j ? { year: a.year, event: a.event, verdict: j.verdict, wef_label: j.wef_label, status: "adjudicated", reason: j.reason } : { year: a.year, event: a.event, verdict: "contested", status: "contested" };
});
const VERDICTS = ["ranked_high", "ranked_low", "absent"];
const recs = Object.values(records);
const audit = auditFile
	? (() => {
			const a = { seed: auditFile.seed, sample: auditFile.sample.length, of_agreed: auditFile.of, audited: recs.length, confirmed: recs.filter((r) => r.decision === "confirm").length, corrected: recs.filter((r) => r.decision === "correct").length, contested: recs.filter((r) => r.decision === "contest").length };
			a.error_rate = a.audited ? Math.round(((a.corrected + a.contested) / a.audited) * 1000) / 1000 : null;
			return a;
		})()
	: null;
const widen = (ci, e) => (ci && e !== null && e !== undefined ? [Math.max(0, Math.round((ci[0] - e) * 1000) / 1000), Math.min(1, Math.round((ci[1] + e) * 1000) / 1000)] : null);
const BLOCKS = [["2007-2020", 2007, 2020], ["2021-2022", 2021, 2022], ["2023-2025", 2023, 2025]];
const block = ([name, y0, y1]) => {
	const r = rows.filter((x) => x.year >= y0 && x.year <= y1 && VERDICTS.includes(x.verdict));
	const c = (v) => r.filter((x) => x.verdict === v).length;
	const n = r.length;
	const inBlock = rows.filter((x) => x.year >= y0 && x.year <= y1);
	return { block: name, events: n, ranked_high: c("ranked_high"), ranked_low: c("ranked_low"), absent: c("absent"), contested: inBlock.filter((x) => x.verdict === "contested").length, dropped_by_audit: inBlock.filter((x) => x.status === "corrected" && !VERDICTS.includes(x.verdict)).length, share_ranked_high: n >= 20 ? Math.round((c("ranked_high") / n) * 10000) / 10000 : null, wilson95: n >= 20 ? wilson(c("ranked_high"), n) : null, audit_adjusted95: n >= 20 ? widen(wilson(c("ranked_high"), n), audit?.error_rate) : null, ...(n < 20 ? { rate_withheld: `D11: ${n} events, fewer than 20; counts only.` } : {}) };
};
const out = {
	rule: "D32",
	note: "Share of the year's major global events (fixed criteria, merged from two blind lists) that WEF ranked high in its January edition of the same year. A surprise measure, never a hit rate. Method blocks are not pooled: the rankings changed method in 2021 and 2023.",
	matcher_agreement: { events: rows.length, agreed: rows.filter((r) => r.status !== "adjudicated").length },
	audit,
	excluded_by_audit: { corrected_out: rows.filter((r) => r.status === "corrected" && !VERDICTS.includes(r.verdict)).length, contested: rows.filter((r) => r.status === "contested").length },
	blocks: BLOCKS.map(block),
	rows,
};
writeFileSync(path.join(dir, "summary-d32.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(JSON.stringify(out.blocks, null, 1));
