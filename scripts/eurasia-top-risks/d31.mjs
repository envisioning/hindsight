// D31 measures for Eurasia Group Top Risks, from final-d20.json.
// Usage: node scripts/eurasia-top-risks/d31.mjs
// Top risks: materialised share (hit + partial counted separately), a calibration measure, not a
// hit rate. Red herrings: hit rate (the feared risk stayed calm). The two never merge (D31).
// Writes data/raw/eurasia-top-risks/summary-d31.json.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../../data/raw/eurasia-top-risks");
const fin = JSON.parse(readFileSync(path.join(dir, "final-d20.json"), "utf8"));
const kind = new Map();
for (const v of fin.verdicts) {
	const [, ed, n] = v.id.match(/-(\d{4})-(\d{3})$/);
	const e = JSON.parse(readFileSync(path.join(dir, `${ed}.json`), "utf8")).entries[Number(n) - 1];
	kind.set(v.id, e.ranking);
}
function wilson(k, n, z = 1.96) {
	if (!n) return null;
	const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}
const e = fin.audit?.error_rate ?? 0;
const widen = (ci) => ci && [Math.max(0, Math.round((ci[0] - e) * 1000) / 1000), Math.min(1, Math.round((ci[1] + e) * 1000) / 1000)];
function block(ranking, label) {
	const vs = fin.verdicts.filter((v) => kind.get(v.id) === ranking);
	const c = (x) => vs.filter((v) => v.verdict === x).length;
	const n = c("hit") + c("partial") + c("miss");
	const ci = wilson(c("hit"), n);
	return { measure: label, counts: Object.fromEntries(["hit", "partial", "miss", "contested", "ungradable", "unfalsifiable"].map((x) => [x, c(x)])), n_graded: n, share: n >= 20 ? Math.round((c("hit") / n) * 10000) / 10000 : null, wilson95: n >= 20 ? ci : null, audit_adjusted95: n >= 20 ? widen(ci) : null };
}
const out = {
	rule: "D31",
	note: "Top risks: share that materially occurred in the edition year (hit), a calibration measure, never a hit rate. Red herrings: share where the feared risk stayed calm (hit). Never merged. Partial is counted, not in the share. Audit-adjusted interval per D28 with the source's audit error rate.",
	top_risks: block("top risks", "materialised share"),
	red_herrings: block("red herrings", "red-herring hit rate"),
};
writeFileSync(path.join(dir, "summary-d31.json"), `${JSON.stringify(out, null, 1)}\n`);
console.log(JSON.stringify(out, null, 1));
