// Scenario coverage (D34): pathway sets (Shell scenarios, IPCC pathways) and narrative sets (NIC).
// Usage: node scripts/scenario-coverage-d34.mjs
// Pathway sets: for each source, edition, metric and passed target year (<= 2025), the scenario values
// of the edition form a range. The observed value (data/raw/<source>/realized.json) is compared:
// covered (inside the range), partly_covered (outside, within 10% of the nearest edge),
// not_covered (otherwise). The closest scenario is recorded. The comparison is arithmetic (as D19).
// Base-year values (harmonised history) and published ranges are not scenario values.
// A metric is compared only where an observed series on the same definition exists; the
// mapping and every definition caveat are in METRICS below. Matching the observed series is a
// definition call made once in code, so, as for the numeric sources (D19, #53), a D11 matching
// audit checks it: sample from scripts/measure-audit-sample.mjs, records in audit-d34.json.
// Narrative sets: from the two blind graders and the adjudicator (see the end of this file).
// Every share applies D11: no rate below 20 graded values (counts only), a Wilson 95% interval
// otherwise, and with an audit the D28 interval widened by the residual audit error rate.
// Writes data/raw/<source>/coverage-d34.json.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));

// claim metric -> observed series {series, metric, unit} and a factor from observed to claim unit.
const METRICS = {
	"ipcc-pathways": {
		"Fossil Fuel CO2": { series: "gcb", metric: /^fossil and industrial CO2/, unit: "GtC/yr", note: "SRES fossil CO2 includes cement; GCB fossil and industrial, gross of the carbonation sink." },
		"Total CO2 (fossil fuel and other)": { series: "gcb", metric: /^total anthropogenic CO2/, unit: "GtC/yr", note: "Land-use CO2 in the scenarios comes from integrated assessment models, in GCB from bookkeeping models." },
		"Fossil & Industrial CO2 (fossil, cement, gas flaring and bunker fuels)": { series: "gcb", metric: /^fossil and industrial CO2/, unit: "GtC/yr" },
		"CO2 emissions, fossil and industrial (MAGICC)": { series: "gcb", metric: /^fossil and industrial CO2/, unit: "Gt CO2/yr", factor: 1000, note: "SSP values in Mt CO2; GCB in Gt CO2 times 1000." },
		"CO2 emissions from fossil fuel and industrial processes": { series: "gcb", metric: /^fossil and industrial CO2/, unit: "GtC/yr" },
		"CO2 emissions, total (energy, deforestation, cement)": { series: "gcb", metric: /^total anthropogenic CO2/, unit: "GtC/yr" },
		"CO2 concentration, annual global mean": { series: "noaa", metric: /CO2/, unit: "ppm" },
		"CO2 concentration": { series: "noaa", metric: /CO2/, unit: "ppm" },
		"CO2 abundance, ISAM model (reference)": { series: "noaa", metric: /CO2/, unit: "ppm" },
		"CO2 concentration, as reported in the SAR": { series: "noaa", metric: /CO2/, unit: "ppm" },
		// CH4: no observed per-year series on the scenarios' definition. EDGAR leaves out open biomass
		// burning (which SRES, RCP and SSP include) and reads 30 to 60 Mt low; the Global Methane Budget
		// per-year series is behind a licence click-through. CH4 rows are recorded as no_observed.
		"CH4 emissions": { series: "none", metric: /CH4/, unit: null },
		"CH4 total": { series: "none", metric: /CH4/, unit: null },
	},
	"shell-scenarios": Object.fromEntries(
		[
			"total primary energy",
			"total primary energy: Oil",
			"total primary energy: Coal",
			"total primary energy: Natural gas",
			"total primary energy: Nuclear",
			"total primary energy: Wind",
			"total primary energy: Solar",
			"total primary energy: Solar - photovoltaic",
			"net energy-related CO2 emissions",
			"stock of electric passenger vehicles (BEV and PHEV)",
		].map((m) => [m, { series: ["shell_history", "ei_fallback", "iea_gevo"], metric: m, unit: null }]),
	),
};
METRICS["shell-scenarios"]["CO2 emissions from energy"] = { series: ["shell_history", "ei_fallback"], metric: "net energy-related CO2 emissions", unit: "Gt CO2/year", note: "Compared with Shell's later net energy CO2 (which nets out CCS and includes bioenergy CO2); differs by 1 to 4% from EI combustion CO2." };
METRICS["shell-scenarios"]["total primary energy: Natural Gas"] = METRICS["shell-scenarios"]["total primary energy: Natural gas"];

// Fixes from the D11 matching audit (audit-d34.json, 2026-10-02), applied to every row:
// - Shell solar: from 2021 the 2025 workbook's PV history is on another basis (1.5-1.7x EI solar power),
//   and EI leaves out solar heat. "Solar" (all solar, 2013 and 2021 editions) has no observed series on
//   its definition after 2020; "Solar - photovoltaic" (2023 edition) is compared with EI solar power
//   from 2021, the closest series to the edition's own PV basis.
// - An observed row of low confidence is not on the definition (EI total energy supply leaves out
//   traditional biomass) and is never used.
// - A value first printed after the edition (IPCC SAR or TAR restatements, the claim's note says so)
//   is not the edition's scenario (D19: not public at the time).
// - A group with one scenario value is not the set's range (IS92: only IS92a is printed in a table).
const AUDIT_FIX = {
	"shell-scenarios": {
		"total primary energy: Solar": { fromYear: 2021, map: null, reason: "no observed solar series on the edition's definition after 2020 (Shell PV history changes basis in 2021; EI excludes solar heat)" },
		"total primary energy: Solar - photovoltaic": { fromYear: 2021, map: { series: ["ei_fallback"], metric: "total primary energy: Solar - photovoltaic", unit: null }, note: "From 2021 compared with EI solar power: Shell's own PV history changes basis in 2021 (1.5-1.7x EI)." },
	},
};
const LATER_VALUE = /^Value as printed in IPCC (SAR|TAR)/;
const MIN_N = 20;

function observed(rows, map, year, fixed) {
	const series = Array.isArray(map.series) ? map.series : [map.series];
	for (const s of series) {
		const hit = rows.find((r) => r.series === s && r.year === year && !r.projection && (!fixed || r.confidence !== "low") && (map.metric instanceof RegExp ? map.metric.test(r.metric) : r.metric === map.metric) && (!map.unit || r.unit === map.unit));
		if (hit) return hit;
	}
	return null;
}
function wilson(k, n, z = 1.96) {
	const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}
const widen = (ci, e) => (ci && e !== null && e !== undefined ? [Math.max(0, Math.round((ci[0] - e) * 1000) / 1000), Math.min(1, Math.round((ci[1] + e) * 1000) / 1000)] : null);
const round4 = (x) => Math.round(x * 10000) / 10000;

/** D11 on a coverage share: a rate only from 20 graded values, always with its Wilson interval and, with an audit, the D28 interval. */
function share(covered, graded, auditErr) {
	if (graded >= MIN_N) {
		const ci = wilson(covered, graded);
		return { coverage_share: round4(covered / graded), wilson95: ci, audit_adjusted95: widen(ci, auditErr) };
	}
	return { coverage_share: null, wilson95: null, audit_adjusted95: null, rate_withheld: `D11: ${graded} graded values, fewer than ${MIN_N}; counts only.` };
}

function compare(g, map, o) {
	const actual = o.value * (map.factor ?? 1);
	const lo = Math.min(...g.values.map((x) => x.value));
	const hi = Math.max(...g.values.map((x) => x.value));
	const closest = g.values.reduce((a, b) => (Math.abs(b.value - actual) < Math.abs(a.value - actual) ? b : a));
	const gap = actual < lo ? (lo - actual) / Math.abs(lo) : actual > hi ? (actual - hi) / Math.abs(hi) : 0;
	const verdict = gap === 0 ? "covered" : gap <= 0.1 + 1e-9 ? "partly_covered" : "not_covered";
	return { range: [lo, hi], scenarios: g.values.length, observed: Math.round(actual * 1e6) / 1e6, observed_series: o.series, observed_vintage: o.vintage, verdict, gap_outside_range: Math.round(gap * 10000) / 10000, closest_scenario: closest.scenario, closest_id: closest.id };
}

/** The D11 matching audit (#53 rules): a correction is fixed when the row now carries it, a contest when the row no longer grades; else residual. */
function auditBlock(src, rows) {
	const file = path.join(root, "data/raw", src, "audit-d34.json");
	if (!existsSync(file)) return null;
	const a = JSON.parse(readFileSync(file, "utf8"));
	const byId = new Map(rows.map((r) => [`${r.edition}|${r.metric}|${r.year}`, r]));
	const recs = Object.entries(a.records ?? {});
	let fixed = 0, residual = 0, pending = 0;
	for (const [id, rec] of recs) {
		const row = byId.get(id);
		if (rec.decision === "confirm") {
			if (!row || row.status !== "graded" || row.verdict !== rec.seen.verdict) pending++;
		} else if (rec.decision === "correct") {
			const c = rec.corrected ?? {};
			const now = row && (c.status ? row.status === c.status : row.status === "graded" && row.verdict === c.verdict);
			now ? fixed++ : residual++;
		} else (row && row.status !== "graded" ? fixed++ : residual++);
	}
	const n = recs.length;
	const count = (d) => recs.filter(([, r]) => r.decision === d).length;
	return {
		rule: "D11 matching audit (D19, D20), as data/graded/audit (#53)",
		seed: a.seed,
		sample: a.sample.length,
		of_graded: a.of,
		audited: n,
		confirmed: count("confirm"),
		corrected: count("correct"),
		contested: count("contest"),
		error_rate: n ? Math.round(((count("correct") + count("contest")) / n) * 1000) / 1000 : null,
		fixed_in_code: fixed,
		residual_errors: residual,
		residual_error_rate: n ? round4(residual / n) : null,
		pending_recheck: pending,
	};
}

for (const src of ["ipcc-pathways", "shell-scenarios"]) {
	const claims = read(`data/normalized/claims/${src}.json`);
	const obs = read(`data/raw/${src}/realized.json`).entries;
	const groups = new Map();
	let unmapped = 0;
	for (const c of claims) {
		const y = Number(c.target_date);
		if (c.claim_type !== "scenario" || !c.metric || c.value === undefined || !(y <= 2025)) continue;
		if (/Base-year value/.test(c.note ?? "") || /range/i.test(c.metric)) continue;
		const v = Number(c.value);
		if (!Number.isFinite(v)) continue;
		if (!METRICS[src][c.metric]) {
			unmapped++;
			continue;
		}
		const ed = c.source_edition_id.slice(src.length + 1);
		// A target year at or before the edition is the scenario's base or history, not a projection.
		if (y <= Number(ed.slice(0, 4))) continue;
		const key = `${ed}|${c.metric}|${y}`;
		const g = groups.get(key) ?? { edition: ed, metric: c.metric, year: y, unit: c.unit, values: [], later: [] };
		(LATER_VALUE.test(c.note ?? "") ? g.later : g.values).push({ id: c.id, scenario: (c.position ?? "").match(/scenario ([^;]+)/)?.[1] ?? c.id, value: v });
		groups.set(key, g);
	}
	const rows = [];
	for (const g of [...groups.values()].sort((a, b) => `${a.edition}${a.metric}${a.year}`.localeCompare(`${b.edition}${b.metric}${b.year}`))) {
		const base = { edition: g.edition, metric: g.metric, year: g.year, unit: g.unit, values: g.values.length ? g.values : g.later };
		const map0 = METRICS[src][g.metric];
		// Before the audit fixes: every value, the first series in order. Kept as `pre_fix` where a fix took the row out of grading.
		const o0 = observed(obs, map0, g.year, false);
		const pre = o0 ? compare({ values: [...g.values, ...g.later] }, map0, o0) : null;
		const preFix = pre ? { pre_fix: { status: "graded", verdict: pre.verdict, observed: pre.observed, observed_series: pre.observed_series } } : {};
		const fix = AUDIT_FIX[src]?.[g.metric];
		const map = fix && g.year >= fix.fromYear ? fix.map : map0;
		if (!g.values.length) {
			rows.push({ ...base, verdict: null, status: "excluded", note: "every scenario value here was first printed after the edition (IPCC restatement); not the edition's scenario (D19: not public at the time)", ...preFix });
			continue;
		}
		if (g.values.length < 2) {
			rows.push({ ...base, verdict: null, status: "excluded", note: "one scenario value: not the set's range (the other scenarios of the set are not printed for this year)", ...preFix });
			continue;
		}
		const o = map ? observed(obs, map, g.year, true) : null;
		if (!o) {
			rows.push({ ...base, verdict: null, status: "no_observed", note: fix && g.year >= fix.fromYear && !fix.map ? fix.reason : "no observed value on this definition for this year", ...preFix });
			continue;
		}
		const r = compare(g, map, o);
		const notes = [map.note ?? (fix && g.year >= fix.fromYear ? fix.note : map0.note), o.confidence === "low" ? `Observed value confidence low (${o.series}).` : null].filter(Boolean);
		rows.push({ ...base, ...r, status: "graded", ...(notes.length ? { note: notes.join(" ") } : {}) });
	}
	const graded = rows.filter((r) => r.status === "graded");
	const cnt = (v) => graded.filter((r) => r.verdict === v).length;
	const byEd = {};
	for (const r of graded) {
		const e = (byEd[r.edition] ??= { covered: 0, partly_covered: 0, not_covered: 0 });
		e[r.verdict]++;
	}
	const audit = auditBlock(src, rows);
	const out = {
		rule: "D34",
		note: "Pathway coverage: is the observed value inside the edition's scenario range for that metric and year? Covered share is a property of the set, never a hit rate. The comparison is arithmetic (as D19); the matching (observed series, definition, edition) is a judgment made once in code, so it has a D11 matching audit like the numeric sources (D19, #53). D11: a share only from 20 graded values, with its Wilson 95% interval; the audit-adjusted interval widens it by the residual audit error rate (D28).",
		counts: { covered: cnt("covered"), partly_covered: cnt("partly_covered"), not_covered: cnt("not_covered"), no_observed: rows.filter((r) => r.status === "no_observed").length, excluded: rows.filter((r) => r.status === "excluded").length, unmapped_claims: unmapped },
		...share(cnt("covered"), graded.length, audit?.residual_error_rate),
		audit,
		by_edition: byEd,
		rows,
	};
	writeFileSync(path.join(root, "data/raw", src, "coverage-d34.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(src, JSON.stringify(out.counts), "share", out.coverage_share, JSON.stringify(audit));
}

// Narrative sets (NIC): two blind agents judged each scenario and each set at the horizon year
// (scenarios-d34-graderA/B.json); an adjudicator settled disagreements (scenarios-adjudicated-d34.json).
// The unit is the set: covered when the world at the horizon fell inside any scenario's premise (D34).
// Sets whose horizon is after 2025 stay open. Regional scenarios are not graded.
// D11 audit (D20, D45): audit-d34.json audits the agreed scenario verdicts (sample from
// scripts/measure-audit-sample.mjs, seed d11:nic-global-trends:d34). As for WEF D32, a `correct` replaces
// the verdict and a `contest` removes it (the graders' verdict stays in `was`); a set with an audited change
// is re-derived from its scenarios (covered when any scenario is covered). The audit error rate widens the
// share's interval (D28) once a share is published.
{
	const src = "nic-global-trends";
	const dir = `data/raw/${src}`;
	const A = read(`${dir}/scenarios-d34-graderA.json`);
	const B = read(`${dir}/scenarios-d34-graderB.json`);
	const J = read(`${dir}/scenarios-adjudicated-d34.json`);
	const claims = read(`data/normalized/claims/${src}.json`).filter((c) => c.claim_type === "scenario");
	const vB = new Map(B.verdicts.map((v) => [v.id, v.verdict]));
	const vJ = new Map(J.verdicts.map((v) => [v.id, v]));
	const auditPath = path.join(root, dir, "audit-d34.json");
	const auditFile = existsSync(auditPath) ? JSON.parse(readFileSync(auditPath, "utf8")) : null;
	const records = auditFile?.records ?? {};
	const scen = new Map(
		A.verdicts.map((a) => {
			const b = vB.get(a.id);
			if (b === undefined) throw new Error(`${src}: grader B has no verdict for ${a.id}`);
			if (a.verdict === b) {
				const rec = records[a.id];
				if (rec?.decision === "correct") return [a.id, { id: a.id, verdict: rec.corrected_verdict, status: "corrected", was: a.verdict, reason: rec.note }];
				if (rec?.decision === "contest") return [a.id, { id: a.id, verdict: "contested", status: "contested", was: a.verdict, reason: rec.note }];
				return [a.id, { id: a.id, verdict: a.verdict, status: "agreed" }];
			}
			const j = vJ.get(a.id);
			return [a.id, j ? { id: a.id, verdict: j.verdict, status: "adjudicated", graderA: a.verdict, graderB: b } : { id: a.id, verdict: "contested", status: "contested", graderA: a.verdict, graderB: b }];
		}),
	);
	const editions = [...new Set(claims.map((c) => c.source_edition_id.slice(src.length + 1)))].sort();
	const rows = editions.map((ed) => {
		const ids = claims.filter((c) => c.source_edition_id === `${src}-${ed}`).map((c) => c.id);
		const horizon = Number(claims.find((c) => c.source_edition_id === `${src}-${ed}`).target_date);
		if (horizon > 2025) return { edition: ed, horizon, scenarios: ids.length, verdict: null, status: "open", note: "horizon after 2025" };
		const a = A.sets[ed], b = B.sets[ed], j = J.sets?.[ed];
		const agreed = a && b && a.covered === b.covered;
		const set = agreed ? a : j;
		if (!set) return { edition: ed, horizon, scenarios: ids.length, verdict: "contested", status: "contested" };
		const scenario_verdicts = ids.map((id) => scen.get(id) ?? { id, verdict: null, status: "not_graded" });
		// An audited change to a scenario re-derives the set from its scenarios.
		const audited = scenario_verdicts.some((v) => v.was !== undefined);
		const covered = audited ? scenario_verdicts.some((v) => v.verdict === "covered") : set.covered;
		return {
			edition: ed,
			horizon,
			scenarios: ids.length,
			verdict: covered ? "covered" : "not_covered",
			status: audited && covered !== set.covered ? "audited" : agreed ? "agreed" : "adjudicated",
			...(audited && covered !== set.covered ? { was: set.covered ? "covered" : "not_covered" } : {}),
			closest_id: (j ?? a).closest,
			reason: (j ?? a).reason,
			scenario_verdicts,
		};
	});
	const graded = rows.filter((r) => r.verdict === "covered" || r.verdict === "not_covered");
	const sv = [...scen.values()];
	const sc = (v) => sv.filter((x) => x.verdict === v).length;
	const setsAgreed = graded.filter((r) => r.status === "agreed").length;
	const recs = Object.values(records);
	const nAud = (d) => recs.filter((r) => r.decision === d).length;
	const audit = auditFile
		? {
				rule: "D11 audit of the agreed scenario verdicts (D20, D45)",
				seed: auditFile.seed,
				sample: auditFile.sample.length,
				of_agreed: auditFile.of,
				audited: recs.length,
				confirmed: nAud("confirm"),
				corrected: nAud("correct"),
				contested: nAud("contest"),
				error_rate: recs.length ? Math.round(((nAud("correct") + nAud("contest")) / recs.length) * 1000) / 1000 : null,
			}
		: null;
	const out = {
		rule: "D34",
		note: "Narrative set coverage: did the world at the set's horizon year fall inside any scenario's premise? Judged by two blind agents per scenario and per set, disagreements adjudicated (D20). Coverage share of sets, never a hit rate. D11: fewer than 20 graded sets, counts only.",
		counts: { covered: graded.filter((r) => r.verdict === "covered").length, not_covered: graded.filter((r) => r.verdict === "not_covered").length, open: rows.filter((r) => r.status === "open").length, contested: rows.filter((r) => r.verdict === "contested").length },
		...share(graded.filter((r) => r.verdict === "covered").length, graded.length, audit?.error_rate),
		scenario_counts: { covered: sc("covered"), partly_covered: sc("partly_covered"), not_covered: sc("not_covered"), contested: sc("contested") },
		agreement: { sets: graded.length, sets_agreed: setsAgreed, scenarios: sv.length, scenarios_agreed: sv.filter((x) => x.status === "agreed" || x.was !== undefined).length, adjudicated: sv.filter((x) => x.status === "adjudicated").length },
		audit,
		...(audit ? {} : { audit_note: "No D11 audit sample has been drawn for the NIC scenario verdicts." }),
		rows,
	};
	writeFileSync(path.join(root, dir, "coverage-d34.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(src, JSON.stringify(out.counts), JSON.stringify(out.agreement), JSON.stringify(audit));
}
