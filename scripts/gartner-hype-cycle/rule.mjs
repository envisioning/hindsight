// D21: the D16 verdict for a Hype Cycle claim, computed from an adoption timeline.
// Shared by verdicts.mjs (builders A and B) and adjudicate.mjs (adjudicated timelines).
export const NOW = 2026;
export const BAND_YEARS = { "<2": 2, "2-5": 5, "5-10": 10 };

// D16 applied to a timeline at placed year P.
export function grade(t, P) {
	if (t.ambiguous === true || /^ambiguous:/i.test(t.reading)) return ["unfalsifiable", "No dominant reading of the label; the readings give different verdicts (D16)."];
	const { year_mainstream: ym, year_5pct: y5, abandoned, abandoned_year: ay } = t;
	const goneBy = (y) => abandoned && ay != null && ay <= y;
	if (ym != null && ym <= P + 2 && !goneBy(P - 1)) return ["hit", `Mainstream in ${ym}, placed year ${P}: within 2 years after, or earlier.`];
	if (ym != null && ym <= P + 5) return ["partial", `Mainstream in ${ym}, 3 to 5 years after the placed year ${P}.`];
	if (y5 != null && y5 <= P && !goneBy(P - 1)) return ["partial", `At least 5% from ${y5}, below mainstream by the placed year ${P}${ym ? ` (mainstream only in ${ym})` : ""}.`];
	if (goneBy(P + 5)) return ["miss", `Abandoned in ${ay} without reaching mainstream within 5 years after the placed year ${P}.`];
	return ["miss", `${y5 == null ? "Never reached 5%" : `Reached 5% only in ${y5}`}; not mainstream by ${P + 5} (placed year ${P} plus 5).`];
}

