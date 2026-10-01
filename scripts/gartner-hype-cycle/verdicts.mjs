// Hype Cycle verdicts from the two blind adoption timelines (D21).
// Usage: node scripts/gartner-hype-cycle/verdicts.mjs
// Reads data/raw/gartner-hype-cycle/: <edition>.json, timeline-subjects.json,
// timelines-builderA.json, timelines-builderB.json; claim ids from
// data/normalized/claims/gartner-hype-cycle.json.
// Writes verdicts-d16-graderA.json and -graderB.json in the grader format, so the
// generic pipeline (scripts/agreement-d16.mjs, audit-sample, final-d20) applies.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BAND_YEARS, grade, NOW } from "./rule.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const dir = path.join(root, "data/raw/gartner-hype-cycle");
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));

const subjects = readJson(path.join(dir, "timeline-subjects.json")).subjects;
const byLabel = new Map();
for (const s of subjects) for (const l of s.labels_on_charts) byLabel.set(l, s);

const claims = readJson(path.join(root, "data/normalized/claims/gartner-hype-cycle.json"));
const claimId = new Map(claims.map((c) => [`${c.source_edition_id.split("-").pop()}|${c.quote}`, c.id]));

// One row per gradable claim: an edition entry with a band that names a placed year,
// whose 5-year window after that year has closed (edition + band + 5 <= NOW).
const rows = [];
const skipped = { no_band: 0, more_than_10: 0, obsolete_before_plateau: 0, window_open: 0, no_subject: 0 };
for (let ed = 1995; ed <= NOW; ed++) {
	let entries;
	try {
		entries = readJson(path.join(dir, `${ed}.json`)).entries;
	} catch {
		continue;
	}
	for (const e of entries) {
		if (e.band == null) skipped.no_band++;
		else if (e.band === ">10") skipped.more_than_10++;
		else if (e.band === "obsolete_before_plateau") skipped.obsolete_before_plateau++;
		else {
			const placed = ed + BAND_YEARS[e.band];
			if (placed + 5 > NOW) skipped.window_open++;
			else if (!byLabel.has(e.label)) skipped.no_subject++;
			else {
				const id = claimId.get(`${ed}|${e.label}`);
				if (!id) throw new Error(`no claim id for ${ed} ${e.label}`);
				rows.push({ id, edition: ed, label: e.label, band: e.band, placed, subject: byLabel.get(e.label).subject_id });
			}
		}
	}
}

for (const g of ["A", "B"]) {
	const tl = new Map(readJson(path.join(dir, `timelines-builder${g}.json`)).timelines.map((t) => [t.subject_id, t]));
	const verdicts = rows.map((r) => {
		const t = tl.get(r.subject);
		if (!t) throw new Error(`builder ${g} has no timeline for ${r.subject}`);
		const [verdict, why] = grade(t, r.placed);
		return {
			id: r.id,
			verdict,
			subject_id: r.subject,
			edition: r.edition,
			band: r.band,
			placed_year: r.placed,
			reading: t.reading,
			mainstream_test: t.test,
			timeline: { year_5pct: t.year_5pct, year_mainstream: t.year_mainstream, abandoned: t.abandoned, abandoned_year: t.abandoned_year },
			reason: `${why} ${t.note}`.trim(),
			evidence: t.evidence,
		};
	});
	const out = {
		rule: "D16",
		grader: g,
		method: `D21: computed from blind adoption timeline builder ${g} (timelines-builder${g}.json), edition plus band (<2 = 2, 2-5 = 5, 5-10 = 10). Gradable when placed year + 5 <= ${NOW}.`,
		verdicts,
	};
	writeFileSync(path.join(dir, `verdicts-d16-grader${g}.json`), `${JSON.stringify(out, null, 1)}\n`);
	const counts = {};
	for (const v of verdicts) counts[v.verdict] = (counts[v.verdict] ?? 0) + 1;
	console.log(g, verdicts.length, JSON.stringify(counts));
}
console.log("not graded by this method:", JSON.stringify(skipped));
