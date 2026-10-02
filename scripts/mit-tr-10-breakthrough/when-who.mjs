// MIT TR10 article pages: extract the WHO / WHEN (or Key players / Availability) lines (#6, D25).
// Usage: node scripts/mit-tr-10-breakthrough/when-who.mjs <article.html>...
// Input: article HTML saved with curl outside the repo (see README). Prints one JSON object
// per file: { file, who, when }. A null field means the label was not found in the article body.
import { readFileSync } from "node:fs";

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#039": "'", "#8217": "’", "#8216": "‘", "#8211": "–", "#8212": "—", nbsp: " " };
const text = (s) =>
	s
		.replace(/<[^>]+>/g, "")
		.replace(/\u00ad/g, "")
		.replace(/&(#?\w+);/g, (m, e) => ENT[e] ?? (e.startsWith("#") ? String.fromCodePoint(Number(e.slice(1))) : m))
		.replace(/\s+/g, " ")
		.trim();

// Rendered HTML only (the page also carries the same text JSON-escaped in a data blob).
// Three layouts: 2026 header box (infoTitle/infoContent spans), 2021 content list
// (h3 "Availability:" + description span), 2022-2025 body box (h4 WHEN + p).
const LAYOUTS = (label) => [
	`<span[^>]*infoTitle[^>]*>\\s*${label}\\s*:?\\s*</span>\\s*<span[^>]*infoContent[^>]*>([\\s\\S]*?)</span>`,
	`<h3[^>]*contentListItem__title[^>]*>(?:<br\\s*/?>)?\\s*${label}\\s*:?\\s*</h3>\\s*<span[^>]*>([\\s\\S]*?)</span>\\s*</li>`,
	`<h\\d[^>]*>\\s*(?:<[^>]+>)*\\s*${label}\\s*:?\\s*(?:<[^>]+>)*\\s*</h\\d>\\s*<p[^>]*>([\\s\\S]*?)</p>`,
];
function field(html, labels) {
	for (const label of labels)
		for (const re of LAYOUTS(label)) {
			const m = html.match(new RegExp(re, "i"));
			if (m) return text(m[1].replace(/<\/p>\s*<p[^>]*>/g, ", ")).replace(/\u2022\s*/g, "").replace(/\s+,/g, ",");
		}
	return null;
}

for (const file of process.argv.slice(2)) {
	const html = readFileSync(file, "utf8");
	console.log(JSON.stringify({ file, who: field(html, ["WHO", "Key players"]), when: field(html, ["WHEN", "Availability"]) }));
}
