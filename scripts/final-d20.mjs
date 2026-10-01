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
for (const c of agreement.contested ?? []) {
	const a = adj.get(c.id);
	rows.push(
		a
			? { id: c.id, verdict: a.verdict, status: "adjudicated", graderA: c.graderA, graderB: c.graderB, reason: a.reason ?? "" }
			: { id: c.id, verdict: "contested", status: "contested", graderA: c.graderA, graderB: c.graderB },
	);
}

// Claims both graders called unfalsifiable (D20: the adjudicator may take them). An
// adjudicated one is a row; the rest are counted here, as the consensus list leaves them out.
for (const u of agreement.unfalsifiable_agreed ?? []) {
	const a = adj.get(u.id);
	if (a) rows.push({ id: u.id, verdict: a.verdict, status: "adjudicated", graderA: "unfalsifiable", graderB: "unfalsifiable", reason: a.reason ?? "" });
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
const agreedUngradable = agreement.ungradable_agreed?.length ?? 0;
if (agreedUngradable) counts.ungradable = (counts.ungradable ?? 0) + agreedUngradable;
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

const out = {
	rule: "D16",
	process: "D20: two blind graders (D7), adjudicator on disagreements, agent audit of agreed verdicts (D11)",
	kappa: agreement.kappa,
	n: rows.length + agreedUnfalsifiable + agreedUngradable,
	counts,
	hit_rate: graded ? { hits, of_graded_hit_partial_miss: graded, rate: Math.round((hits / graded) * 10000) / 10000, wilson95: wilson(hits, graded) } : null,
	hit_or_partial_rate: graded ? Math.round(((hits + (counts.partial ?? 0)) / graded) * 10000) / 10000 : null,
	adjudicated: rows.filter((r) => r.status === "adjudicated").length,
	audit: auditOut,
	verdicts: rows.sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(path.join(dir, "final-d20.json"), `${JSON.stringify(out, null, 1)}\n`);
const { verdicts, ...summary } = out;
console.log(source, JSON.stringify(summary));
