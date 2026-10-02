// Trend persistence (D33): the mechanical part, per trend source.
// Usage: node scripts/trend-persistence.mjs <source|--all>
// Reads data/normalized/claims/<source>.json (claim_type trend) and the edition order from
// data/normalized/source_editions.json. For a trend in edition Y, "next editions" are the next
// captured editions of the same source (a missing edition is skipped, and the gap is noted):
// - persisted: a trend with a shared subject id appears in one of the next two editions;
// - open: fewer than two later editions exist yet;
// - candidate: none of the above; agents decide renamed or faded (two blind agents, D33).
// A candidate whose subject appears again in a later edition carries `reappears_in` (that edition).
// It is not `recycled` here (D47): the checkers first look for a rename within its two-edition
// window, and trend-final-d33.mjs makes it `recycled` only when the final check says faded.
// Renamed and faded verdicts come from data/raw/<source>/renames-d33-*.json via the agreement
// pipeline; this script writes data/raw/<source>/trends-d33.json with the mechanical rows, the
// trend labels of every edition once, and the editions captured only in part.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TREND_SOURCES = ["accenture-tech-vision", "a16z-big-ideas", "deloitte-tech-trends", "ftsg-tech-trends", "mckinsey-tech-trends", "trendwatching"];
const arg = process.argv[2];
const sources = arg === "--all" ? TREND_SOURCES : [arg];
if (!arg || !sources.every((s) => TREND_SOURCES.includes(s))) throw new Error(`usage: trend-persistence.mjs <${TREND_SOURCES.join("|")}|--all>`);
const root = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
const editions = read("data/normalized/source_editions.json");

for (const source of sources) {
	const claims = read(`data/normalized/claims/${source}.json`).filter((c) => c.claim_type === "trend");
	const eds = editions
		.filter((e) => e.source_id === source && claims.some((c) => c.source_edition_id === e.id))
		.sort((a, b) => a.edition.localeCompare(b.edition))
		.map((e) => e.id);
	const byEd = new Map(eds.map((id) => [id, claims.filter((c) => c.source_edition_id === id)]));
	const subjectsIn = (id) => new Set(byEd.get(id).flatMap((c) => c.subject_ids));
	// The label as printed, from the raw edition file (claim ids are positions, D15).
	const rawLabel = new Map();
	for (const ed of eds) {
		const e = ed.slice(source.length + 1);
		const f = path.join(root, "data/raw", source, `${e}.json`);
		if (!existsSync(f)) continue;
		JSON.parse(readFileSync(f, "utf8")).entries.forEach((x, i) => rawLabel.set(`${ed}-${String(i + 1).padStart(3, "0")}`, x.label));
	}
	// Label corrections (D43, data/raw/<source>/corrections.json): the corrected label is shown; a
	// later record for the same entry replaces an earlier one.
	const corrFile = path.join(root, "data/raw", source, "corrections.json");
	if (existsSync(corrFile))
		for (const x of JSON.parse(readFileSync(corrFile, "utf8")).corrections)
			if (x.field === "label") rawLabel.set(`${source}-${x.edition}-${String(x.position).padStart(3, "0")}`, x.corrected);
	const label = (c) => String(rawLabel.get(c.id) ?? c.quote ?? c.statement ?? "").slice(0, 160);
	const rows = [];
	const counts = {};
	eds.forEach((ed, i) => {
		const next = eds.slice(i + 1, i + 3);
		const later = eds.slice(i + 3);
		for (const c of byEd.get(ed)) {
			let status;
			if (next.length < 2) status = "open";
			else if (next.some((n) => c.subject_ids.some((s) => subjectsIn(n).has(s)))) status = "persisted";
			else status = "candidate";
			counts[status] = (counts[status] ?? 0) + 1;
			const row = { id: c.id, edition: ed.slice(source.length + 1), label: label(c), subject_ids: c.subject_ids, status };
			if (status === "persisted") row.matched_in = next.find((n) => c.subject_ids.some((s) => subjectsIn(n).has(s))).slice(source.length + 1);
			if (status === "candidate") {
				row.next_editions = next.map((n) => n.slice(source.length + 1));
				// D47: a shared subject back after the window; recycled only if the rename check says faded.
				const back = later.find((n) => c.subject_ids.some((s) => subjectsIn(n).has(s)));
				if (back) row.reappears_in = back.slice(source.length + 1);
			}
			rows.push(row);
		}
	});
	const gaps = eds.map((e) => Number(e.slice(source.length + 1, source.length + 5))).filter((y, i, a) => i > 0 && y - a[i - 1] > 1);
	const out = {
		rule: "D33",
		note: "Mechanical part of D33. persisted and open are computed from shared subject ids; candidate rows go to two blind rename checkers. A candidate with reappears_in (a shared subject back in a later edition) becomes recycled only when the checkers find it faded (D47). Next editions are the next captured editions; a gap year in the capture is skipped.",
		editions: eds.map((e) => e.slice(source.length + 1)),
		// Every trend label per edition, once (candidate rows name the next two editions by id).
		edition_labels: Object.fromEntries(eds.map((e) => [e.slice(source.length + 1), byEd.get(e).map((x) => ({ id: x.id, label: label(x) }))])),
		// Editions captured only in part (raw status): a trend not found there may be in an uncaptured part.
		partial_editions: eds.map((e) => e.slice(source.length + 1)).filter((ed) => {
			const f = path.join(root, "data/raw", source, `${ed}.json`);
			return existsSync(f) && JSON.parse(readFileSync(f, "utf8")).status === "partial";
		}),
		...(gaps.length ? { capture_gaps_before: gaps } : {}),
		counts,
		rows,
	};
	writeFileSync(path.join(root, "data/raw", source, "trends-d33.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(source, JSON.stringify(counts));
}
