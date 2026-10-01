// Scenario coverage for pathway sets (D34): Shell scenarios and IPCC pathways.
// Usage: node scripts/scenario-coverage-d34.mjs
// For each source, edition, metric and passed target year (<= 2025), the scenario values of the
// edition form a range. The observed value (data/raw/<source>/realized.json) is compared:
// covered (inside the range), partly_covered (outside, within 10% of the nearest edge),
// not_covered (otherwise). The closest scenario is recorded. Arithmetic, no judgment (as D19).
// Base-year values (harmonised history) and published ranges are not scenario values.
// A metric is compared only where an observed series on the same definition exists; the
// mapping and every definition caveat are in METRICS below. Writes data/raw/<source>/coverage-d34.json.
import { readFileSync, writeFileSync } from "node:fs";
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

function observed(src, rows, map, year) {
	const series = Array.isArray(map.series) ? map.series : [map.series];
	for (const s of series) {
		const hit = rows.find((r) => r.series === s && r.year === year && !r.projection && (map.metric instanceof RegExp ? map.metric.test(r.metric) : r.metric === map.metric) && (!map.unit || r.unit === map.unit));
		if (hit) return hit;
	}
	return null;
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
		const g = groups.get(key) ?? { edition: ed, metric: c.metric, year: y, unit: c.unit, values: [] };
		g.values.push({ id: c.id, scenario: (c.position ?? "").match(/scenario ([^;]+)/)?.[1] ?? c.id, value: v });
		groups.set(key, g);
	}
	const rows = [];
	for (const g of [...groups.values()].sort((a, b) => `${a.edition}${a.metric}${a.year}`.localeCompare(`${b.edition}${b.metric}${b.year}`))) {
		const map = METRICS[src][g.metric];
		const o = observed(src, obs, map, g.year);
		if (!o) {
			rows.push({ ...g, verdict: null, status: "no_observed", note: "no observed value on this definition for this year" });
			continue;
		}
		const actual = o.value * (map.factor ?? 1);
		const lo = Math.min(...g.values.map((x) => x.value));
		const hi = Math.max(...g.values.map((x) => x.value));
		const closest = g.values.reduce((a, b) => (Math.abs(b.value - actual) < Math.abs(a.value - actual) ? b : a));
		const gap = actual < lo ? (lo - actual) / Math.abs(lo) : actual > hi ? (actual - hi) / Math.abs(hi) : 0;
		const verdict = gap === 0 ? "covered" : gap <= 0.1 + 1e-9 ? "partly_covered" : "not_covered";
		rows.push({
			...g,
			range: [lo, hi],
			scenarios: g.values.length,
			observed: Math.round(actual * 1e6) / 1e6,
			observed_series: o.series,
			observed_vintage: o.vintage,
			verdict,
			status: "graded",
			gap_outside_range: Math.round(gap * 10000) / 10000,
			closest_scenario: closest.scenario,
			closest_id: closest.id,
			...(map.note || o.confidence === "low" ? { note: [map.note, o.confidence === "low" ? `Observed value confidence low (${o.series}).` : null].filter(Boolean).join(" ") } : {}),
		});
	}
	const graded = rows.filter((r) => r.status === "graded");
	const cnt = (v) => graded.filter((r) => r.verdict === v).length;
	const byEd = {};
	for (const r of graded) {
		const e = (byEd[r.edition] ??= { covered: 0, partly_covered: 0, not_covered: 0 });
		e[r.verdict]++;
	}
	const out = {
		rule: "D34",
		note: "Pathway coverage: is the observed value inside the edition's scenario range for that metric and year? Covered share is a property of the set, never a hit rate. Arithmetic, as D19.",
		counts: { covered: cnt("covered"), partly_covered: cnt("partly_covered"), not_covered: cnt("not_covered"), no_observed: rows.length - graded.length, unmapped_claims: unmapped },
		coverage_share: graded.length ? Math.round((cnt("covered") / graded.length) * 10000) / 10000 : null,
		by_edition: byEd,
		rows,
	};
	writeFileSync(path.join(root, "data/raw", src, "coverage-d34.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(src, JSON.stringify(out.counts), "share", out.coverage_share, JSON.stringify(byEd));
}
