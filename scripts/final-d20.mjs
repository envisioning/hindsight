// Final verdicts for a judgment source under D20.
// Usage: node scripts/final-d20.mjs <source>
// Reads data/raw/<source>/: agreement-d16.json (two blind graders),
// adjudicated-d20.json (third agent on contested claims, optional),
// audit-d11.json (auditor agent on a sample of agreed claims, optional),
// audit-d11-pass<N>.json (re-check passes of the same sample, D24; a later pass's
// record replaces the earlier record of the same claim; earlier passes are never edited),
// adjudicated-d20-w<N>.json and audit-d11-w<N>.json (grading wave N of the source, D26).
// Writes data/raw/<source>/final-d20.json.
// Order: agreed verdict, then the audit (correct replaces it, contest removes it),
// then the adjudicator for claims the graders disagreed on.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = process.argv[2];
if (!source || !/^[a-z0-9-]+$/.test(source)) throw new Error("usage: final-d20.mjs <source>");
const dir = path.resolve(import.meta.dirname, "../data/raw", source);
const read = (f) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), "utf8")) : null);

const agreement = read("agreement-d16.json");
if (!agreement) throw new Error(`${source}: no agreement-d16.json`);
const waveFiles = (re) =>
	readdirSync(dir)
		.map((f) => f.match(re))
		.filter(Boolean)
		.sort((a, b) => Number(a[1]) - Number(b[1]))
		.map((m) => m[0]);
const adjudicated = read("adjudicated-d20.json") ?? { verdicts: [] };
for (const f of waveFiles(/^adjudicated-d20-w(\d+)\.json$/)) adjudicated.verdicts.push(...read(f).verdicts);
// Re-check passes (D24): adjudicated-d20-pass<N>.json re-decides claims that ended ungradable without page access.
// A later pass replaces the earlier decision of the same claim; earlier files are never edited.
const adjPassFiles = waveFiles(/^adjudicated-d20-pass(\d+)\.json$/);
const recheck = new Map();
for (const f of adjPassFiles) for (const v of read(f).verdicts) recheck.set(v.id, { ...v, pass: Number(f.match(/pass(\d+)/)[1]) });
const audit = read("audit-d11.json");
const auditPasses = readdirSync(dir)
	.map((f) => f.match(/^audit-d11-pass(\d+)\.json$/))
	.filter(Boolean)
	.map((m) => [Number(m[1]), m[0]])
	.sort((a, b) => a[0] - b[0]);
if (audit && auditPasses.length) {
	const sample = new Set(audit.sample ?? []);
	for (const [n, f] of auditPasses) {
		for (const [id, rec] of Object.entries(read(f).records ?? {})) {
			if (!sample.has(id)) throw new Error(`${f}: ${id} is not in the audit sample`);
			audit.records[id] = { ...rec, pass: n };
		}
	}
}
const waveAudits = waveFiles(/^audit-d11-w(\d+)\.json$/);
if (audit) {
	for (const f of waveAudits) {
		const w = read(f);
		for (const id of w.sample ?? []) if (audit.sample.includes(id)) throw new Error(`${f}: ${id} is already in an earlier audit sample`);
		audit.sample = [...audit.sample, ...(w.sample ?? [])];
		Object.assign(audit.records, w.records ?? {});
	}
}

const rows = [];
for (const c of agreement.consensus ?? []) {
	const rec = audit?.records?.[c.id];
	if (rec?.decision === "correct") rows.push({ id: c.id, verdict: rec.corrected_verdict, status: "corrected", was: c.verdict, reason: rec.note ?? "" });
	else if (rec?.decision === "contest") rows.push({ id: c.id, verdict: "contested", status: "contested", was: c.verdict, reason: rec.note ?? "" });
	else rows.push({ id: c.id, verdict: c.verdict, status: rec ? "audited" : "agreed" });
}
const adj = new Map((adjudicated?.verdicts ?? []).map((v) => [v.id, v]));
for (const [id, v] of recheck) adj.set(id, v);
for (const c of agreement.contested ?? []) {
	const a = adj.get(c.id);
	rows.push(
		a
			? { id: c.id, verdict: a.verdict, status: a.pass ? "rechecked" : "adjudicated", graderA: c.graderA, graderB: c.graderB, reason: a.reason ?? "", ...(a.pass ? { pass: a.pass } : {}) }
			: { id: c.id, verdict: "contested", status: "contested", graderA: c.graderA, graderB: c.graderB },
	);
}

// Claims both graders called unfalsifiable (D20: the adjudicator may take them). An
// adjudicated one is a row; the rest are counted here, as the consensus list leaves them out.
for (const u of agreement.unfalsifiable_agreed ?? []) {
	const a = adj.get(u.id);
	if (a) rows.push({ id: u.id, verdict: a.verdict, status: "adjudicated", graderA: "unfalsifiable", graderB: "unfalsifiable", reason: a.reason ?? "" });
}

// Disputes (D29): data/raw/<source>/disputes.json, append-only. The latest record per claim applies;
// an upheld dispute replaces the verdict and keeps the earlier one in `was`.
const disputes = read("disputes.json")?.disputes ?? [];
const latestDispute = new Map();
for (const d of disputes) latestDispute.set(d.claim_id, d);
for (const [id, d] of latestDispute) {
	const row = rows.find((r) => r.id === id);
	if (!row) throw new Error(`disputes.json: issue #${d.issue} is about ${id}, which has no row in final-d20`);
	row.dispute = { issue: d.issue, outcome: d.outcome };
	if (d.outcome === "upheld" && d.verdict_after !== row.verdict) Object.assign(row, { was: row.verdict, verdict: d.verdict_after, status: "disputed", reason: d.reason ?? "" });
}

function wilson(k, m, z = 1.96) {
	if (!m) return null;
	const p = k / m;
	const d = 1 + (z * z) / m;
	const c = p + (z * z) / (2 * m);
	const r = z * Math.sqrt((p * (1 - p)) / m + (z * z) / (4 * m * m));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}

const counts = {};
for (const r of rows) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
const agreedUnfalsifiable = (agreement.agreed?.unfalsifiable ?? 0) - rows.filter((r) => r.status === "adjudicated" && r.graderA === "unfalsifiable" && r.graderB === "unfalsifiable").length;
if (agreedUnfalsifiable) counts.unfalsifiable = (counts.unfalsifiable ?? 0) + agreedUnfalsifiable;
// Both graders ungradable, re-decided by a re-check pass (D24): a row; the rest stay counted as ungradable.
for (const u of agreement.ungradable_agreed ?? []) {
	const r = recheck.get(u.id);
	if (r) rows.push({ id: u.id, verdict: r.verdict, status: "rechecked", graderA: "ungradable", graderB: "ungradable", reason: r.reason ?? "", pass: r.pass });
}
const agreedUngradable = (agreement.ungradable_agreed?.length ?? 0) - (agreement.ungradable_agreed ?? []).filter((u) => recheck.has(u.id)).length;
if (agreedUngradable) counts.ungradable = (counts.ungradable ?? 0) + agreedUngradable;
const MIN_RATE_N = 20;
const hits = counts.hit ?? 0;
const graded = hits + (counts.partial ?? 0) + (counts.miss ?? 0);
const recs = Object.values(audit?.records ?? {});
const auditOut = audit
	? {
			sample: audit.sample?.length ?? recs.length,
			audited: recs.length,
			confirmed: recs.filter((r) => r.decision === "confirm").length,
			corrected: recs.filter((r) => r.decision === "correct").length,
			contested: recs.filter((r) => r.decision === "contest").length,
		}
	: null;
if (auditOut && auditPasses.length) auditOut.passes = [1, ...auditPasses.map(([n]) => n)];
if (auditOut && waveAudits.length) auditOut.waves = ["w1", ...waveAudits.map((f) => f.match(/w\d+/)[0])];
if (auditOut) auditOut.error_rate = auditOut.audited ? Math.round(((auditOut.corrected + auditOut.contested) / auditOut.audited) * 1000) / 1000 : null;
// D28: the audit error rate widens the published interval on both sides.
const widen = (ci, e) => (ci && typeof e === "number" ? [Math.max(0, Math.round((ci[0] - e) * 1000) / 1000), Math.min(1, Math.round((ci[1] + e) * 1000) / 1000)] : null);

const out = {
	rule: "D16",
	process: "D20: two blind graders (D7), adjudicator on disagreements, agent audit of agreed verdicts (D11)",
	kappa: agreement.kappa,
	n: rows.length + agreedUnfalsifiable + agreedUngradable,
	counts,
	// D11: no rate below 20 graded claims; counts only.
	...(graded < MIN_RATE_N ? { rate_withheld: `D11: ${graded} graded claims, fewer than ${MIN_RATE_N}; counts only.` } : {}),
	hit_rate:
		graded >= MIN_RATE_N
			? { hits, of_graded_hit_partial_miss: graded, rate: Math.round((hits / graded) * 10000) / 10000, wilson95: wilson(hits, graded), audit_adjusted95: widen(wilson(hits, graded), auditOut?.error_rate) }
			: null,
	hit_or_partial_rate: graded >= MIN_RATE_N ? Math.round(((hits + (counts.partial ?? 0)) / graded) * 10000) / 10000 : null,
	adjudicated: rows.filter((r) => r.status === "adjudicated").length,
	...(disputes.length ? { disputes: { records: disputes.length, upheld: rows.filter((r) => r.status === "disputed").length } } : {}),
	...(adjPassFiles.length ? { rechecked: rows.filter((r) => r.status === "rechecked").length, recheck_passes: adjPassFiles } : {}),
	audit: auditOut,
	verdicts: rows.sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(path.join(dir, "final-d20.json"), `${JSON.stringify(out, null, 1)}\n`);
const { verdicts, ...summary } = out;
console.log(source, JSON.stringify(summary));
