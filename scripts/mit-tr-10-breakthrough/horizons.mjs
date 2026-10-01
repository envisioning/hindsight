// MIT TR10 availability horizons (#51, D25).
// Usage: node scripts/mit-tr-10-breakthrough/horizons.mjs
// Reads data/raw/mit-tr-10-breakthrough/<edition>.json. Parses each entry's stated
// availability into a band of years after the edition and a placed year (edition plus
// the upper bound, as D21 does for the Hype Cycle). Writes horizons.json next to the
// editions. Only the Availability line is parsed; a timing in body text is recorded,
// not parsed or graded (D25).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve(import.meta.dirname, "../../data/raw/mit-tr-10-breakthrough");
const GRADABLE_UNTIL = 2025;
const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const n = (s) => (s in NUM ? NUM[s] : Number(s));
const W = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)";

// [low, high] in years after the edition, or a calendar year, plus a parse note.
function parse(text, edition) {
	const t = text.toLowerCase().trim();
	let m;
	if (/^now\b|^this year$/.test(t)) return { low: 0, high: 0, note: t === "now" || t === "this year" ? null : `Read as now: "${text}".` };
	if ((m = t.match(new RegExp(`^${W}\\s*(?:to|-)\\s*${W}(\\+)?\\s*years?$`)))) return { low: n(m[1]), high: n(m[2]), note: m[3] ? "Open upper bound; graded at the stated upper bound." : null };
	if ((m = t.match(new RegExp(`^(?:about\\s+)?${W}\\s*years?$`)))) return { low: n(m[1]), high: n(m[1]), note: t.startsWith("about") ? "\"About\" read as the stated number." : null };
	if ((m = t.match(new RegExp(`^(?:less than|within)\\s+${W}\\s*years?$`)))) return { low: 0, high: n(m[1]), note: null };
	if ((m = t.match(new RegExp(`within\\s+${W}\\s+years?`)))) return { low: 0, high: n(m[1]), note: `Read as within ${n(m[1])} years: "${text}".` };
	if ((m = t.match(/\b(20\d\d)\b/))) {
		const y = Number(m[1]);
		if (y >= edition) return { low: y - edition, high: y - edition, note: `Calendar year in the text: "${text}". Read as available in ${y}.` };
	}
	return null;
}

const out = [];
for (const f of readdirSync(dir).filter((f) => /^\d{4}\.json$/.test(f)).sort()) {
	const ed = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
	const year = Number(ed.edition);
	ed.entries.forEach((e, i) => {
		const id = `mit-tr-10-breakthrough-${ed.edition}-${String(i + 1).padStart(3, "0")}`;
		const row = { id, edition: ed.edition, label: e.label, availability: e.availability ?? null };
		if (e.availability) {
			const p = parse(e.availability, year);
			if (p) {
				const placed = year + p.high;
				Object.assign(row, { horizon_source: "availability", band: [p.low, p.high], placed_year: placed, status: placed <= GRADABLE_UNTIL ? "gradable" : "open", parse_note: p.note });
			} else Object.assign(row, { horizon_source: "availability", band: null, placed_year: null, status: "ungradable", parse_note: `No horizon in the availability text: "${e.availability}".` });
		} else if (/timing|body text/i.test(e.note ?? "")) {
			Object.assign(row, { horizon_source: "body text", band: null, placed_year: null, status: "not graded", parse_note: "Timing only in body text, which can be a quoted person's view, not the edition's placement (D25)." });
		} else Object.assign(row, { horizon_source: null, band: null, placed_year: null, status: "ungradable", parse_note: "No availability stated." });
		out.push(row);
	});
}
writeFileSync(path.join(dir, "horizons.json"), `${JSON.stringify({ rule: "D25", gradable_until: GRADABLE_UNTIL, claims: out }, null, 1)}\n`);
const counts = {};
for (const r of out) counts[r.status] = (counts[r.status] ?? 0) + 1;
console.log("horizons", out.length, JSON.stringify(counts));
