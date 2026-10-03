// One-off migration of the hand-made Origins catalogue from www (#78, D57).
// Usage: node scripts/origins/migrate-www.mjs [path to www content/origins/data.ts]
// Default input: ../www/content/origins/data.ts next to this repository (read only; www is not edited).
// Writes data/raw/origins/works-<book|film|tv|game|short-film>.json (OriginsRawFile).
// Research pages are resolved against data/links/technologies-snapshot.json (published technologies of
// published, non-excluded projects). www's work summaries are not carried over: several follow Wikipedia's
// opening sentences (CC BY-SA), which this CC BY repository cannot hold. The decisions for ids that no longer resolve are in REMAPS below,
// each with the reason; scripts/origins/README.md lists them. Re-running gives the same files.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { OriginsRawFile } from "../../src/schema.ts";

const REPO = path.resolve(import.meta.dirname, "../..");
const input = path.resolve(process.argv[2] ?? path.join(REPO, "../www/content/origins/data.ts"));
if (!existsSync(input)) throw new Error(`www data not found: ${input} (pass the path to content/origins/data.ts)`);
const { originsData } = await import(pathToFileURL(input).href);

const snapshot = JSON.parse(readFileSync(path.join(REPO, "data/links/technologies-snapshot.json"), "utf8"));
const excluded = new Set(JSON.parse(readFileSync(path.join(REPO, "data/links/excluded-projects.json"), "utf8")).projects.map((p) => p.research_slug));
const byOriginalId = new Map();
for (const t of snapshot.technologies) (byOriginalId.get(t.original_id) ?? byOriginalId.set(t.original_id, []).get(t.original_id)).push(t);

/**
 * Connections whose research id is not a published page in the snapshot (13 of 67, 2026-10-03). None is in
 * the cache of every technology of the published projects, excluded projects included (4,018 rows): the
 * 17-character ids are in a legacy format (not CMS slugs), and `neuromodulation` and
 * `simulated-worlds-with-synthetic-life` are slugs no current row uses. `target` re-maps the connection to a
 * published page of the same technology; `label` is the subject label when there is no page (D13).
 */
const REMAPS = {
	npNFqwWnPZaWPTwxD: { target: "wintermute/real-time-language-translation", reason: "Universal translator (Star Trek, Arrival): real-time language translation; the fictional device's own page, subspace/universal-translator, is excluded (D55)." },
	M48kkR47huomEHiYL: { label: "Virtual Assistants", reason: "Ship's computer and HAL 9000 answering the crew: an intelligent assistant. No general assistant page in the published projects." },
	kB3Ykz7Y8Yiasnbp2: { target: "apogee/spacecraft-autonomy-stacks", reason: "Autonomous spacecraft and shuttlecraft (Star Trek, 2001, Interstellar): spacecraft autonomy." },
	CyptkuadkcSAp5hse: { label: "Matter Replicator", reason: "Star Trek replicator. No real counterpart page is the same thing (horizons/nanofactory is close, not the same); subspace/replicator is excluded (D55). A candidate for the impossible-trope rule (D57 a)." },
	k6hgHAfGK2pzQgLXW: { target: "liminal/virtual-reality", reason: "Holodeck, cyberspace, the Wired, shared dreamscapes, virtual afterlives: immersive virtual environments." },
	geE8NoNwWB9vXN2eS: { label: "Haptics", reason: "Holodeck haptic feedback. No general haptics page (the published haptics pages are specific devices)." },
	B3tTYR5FSBwmC4nWy: { label: "Conversational User Interfaces", reason: "HAL speaking with the crew in natural language. No general conversational or speech interface page." },
	q29bFRxKvuPjiESWZ: { label: "Automated Lip Reading", reason: "HAL reading lips through its cameras. No published page." },
	syYZoAo37KrHEnjke: { target: "vortex/brain-computer-interfaces", reason: "Neuromancer's direct neural interfaces: brain-computer interfaces (the general page)." },
	Lm9YJupQM2dz3u89L: { target: "horizons/quantum-computing", reason: "Quantum computing (Neuromancer, Devs)." },
	qNaGu7hh9DwAmr4CW: { target: "lattice/blockchain", reason: "The connection names a decentralized network like blockchain: the general blockchain page." },
	"simulated-worlds-with-synthetic-life": { target: "wintermute/simulated-synthetic-life", reason: "Same title, Simulated Worlds With Synthetic Life: the page's original_id changed." },
	neuromodulation: { label: "Neuromodulation", reason: "Penfield mood organ. The published neuromodulation pages are specific devices (ultrasound, closed-loop, pain, aesthetics); none is the general technology." },
};

const MEDIUM = { Book: "novel", Movie: "film", "TV Series": "tv_series", Game: "game", "Short Film": "short_film" };
const FILE = { Book: "book", Movie: "film", "TV Series": "tv", Game: "game", "Short Film": "short-film" };
/** www records no medium for subtitles (child works); the medium is ours, from the title and the work. */
const CHILD_MEDIUM = {
	"star-trek--tos": "tv_series",
	"star-trek--tng": "tv_series",
	"ghost-in-the-shell--ghost-in-the-shell-1995": "film",
	"ghost-in-the-shell--ghost-in-the-shell-sac": "tv_series",
	"foundation--foundation-novel": "novel",
	"foundation--foundation-tv-series": "tv_series",
	"the-three-body-problem--three-body-novel": "novel",
	"the-three-body-problem--three-body-chinese-series": "tv_series",
	"the-three-body-problem--three-body-netflix": "tv_series",
	"dune--dune-novel": "novel",
	"dune--dune-lynch-1984": "film",
	"dune--dune-syfy-2000": "miniseries",
	"dune--dune-children-2003": "miniseries",
	"dune--dune-2021": "film",
	"dune--dune-2024": "film",
	"i-robot--i-robot-book": "collection",
	"i-robot--i-robot-film": "film",
	"enders-game--enders-game-novel": "novel",
	"enders-game--enders-game-film": "film",
	"the-martian--the-martian-novel": "novel",
	"the-martian--the-martian-film": "film",
	"neon-genesis-evangelion--evangelion-tv": "tv_series",
	"neon-genesis-evangelion--evangelion-rebuild": "film",
	"steins-gate--steins-gate-original": "tv_series",
	"steins-gate--steins-gate-zero": "tv_series",
};
/** Works whose www type Book is not a novel. */
const BOOK_MEDIUM = { "i-robot": "collection" };
const CHILD_DEFAULT = { "TV Series": "tv_episode", Movie: "film", Game: "game" };

const COUNTRY = { USA: "USA", UK: "GBR", Japan: "JPN", China: "CHN", Poland: "POL", Canada: "CAN", Netherlands: "NLD", Germany: "DEU", Brazil: "BRA", Australia: "AUS", Italy: "ITA", France: "FRA", "South Africa": "ZAF" };
const STUDIOS = new Set(["Ion Storm", "CD Projekt Red", "BioWare", "Guerrilla Games", "Looking Glass Technologies", "Ubisoft", "Valve", "Quantic Dream", "Irrational Games"]);
const GROUPS = new Set(["The Wachowskis"]);

function creators(raw) {
	const out = { creators: [], studio: undefined };
	for (const part of raw.split(/\s+\/\s+|\s+and\s+/)) {
		const name = part.trim();
		if (STUDIOS.has(name)) out.studio = name;
		else out.creators.push({ name, kind: GROUPS.has(name) ? "group" : "person" });
	}
	return out;
}

const unresolvedSeen = new Set();
function depiction(conn) {
	const pages = (byOriginalId.get(conn.id) ?? []).filter((t) => !excluded.has(t.research_slug));
	const base = { key: `www:${conn.id}`, description: conn.description, basis: "connection", centrality: null, physically_impossible: null, www_technology_id: conn.id };
	if (pages.length > 0) {
		pages.sort((a, b) => a.title.length - b.title.length || a.research_slug.localeCompare(b.research_slug));
		return { ...base, label: pages[0].title, research_status: "resolved", research: pages.map((t) => ({ research_slug: t.research_slug, original_id: t.original_id })).sort((a, b) => a.research_slug.localeCompare(b.research_slug)) };
	}
	const r = REMAPS[conn.id];
	if (r === undefined) throw new Error(`unresolved research id without a decision: ${conn.id}`);
	unresolvedSeen.add(conn.id);
	if (r.target !== undefined) {
		const [slug, oid] = r.target.split("/");
		const t = (byOriginalId.get(oid) ?? []).find((x) => x.research_slug === slug);
		if (t === undefined || excluded.has(slug)) throw new Error(`re-map target not published: ${r.target}`);
		return { ...base, label: t.title, research_status: "remapped", research: [{ research_slug: slug, original_id: oid }], note: `Re-mapped (#78): ${r.reason}` };
	}
	return { ...base, label: r.label, research_status: "unresolved", research: [], note: `Unresolved (#78): ${r.reason}` };
}

const files = {};
for (const w of originsData) {
	const file = FILE[w.type];
	if (file === undefined) throw new Error(`${w.id}: unknown type ${w.type}`);
	const c = creators(w.creator ?? "");
	const countries = (w.country ?? "").split("/").map((x) => {
		const iso = COUNTRY[x.trim()];
		if (iso === undefined) throw new Error(`${w.id}: unknown country ${x}`);
		return iso;
	});
	const parent = {
		id: w.id,
		title: w.title,
		medium: w.type === "Book" ? (BOOK_MEDIUM[w.id] ?? "novel") : MEDIUM[w.type],
		year: w.year,
		creators: c.creators,
		...(c.studio ? { studio: c.studio } : {}),
		countries,
		canon: [],
		inclusion: "curated",
		image_url: w.imageUrl,
		www: { id: w.id, slug: w.slug, creator: w.creator, country: w.country },
		depictions: [...(w.relatedTechnologies ?? []), ...(w.relatedTechnologyIds ?? []).map((id) => ({ id }))].map(depiction),
	};
	(files[file] ??= []).push(parent);
	for (const s of w.subtitles ?? []) {
		const id = `${w.id}--${s.id}`;
		const medium = CHILD_MEDIUM[id] ?? CHILD_DEFAULT[w.type];
		if (medium === undefined) throw new Error(`${id}: no medium`);
		files[file].push({
			id,
			title: s.title,
			medium,
			year: s.year ?? w.year,
			creators: [],
			countries: [],
			parent: w.id,
			canon: [],
			inclusion: "curated",
			www: { id: w.id, subtitle_id: s.id },
			depictions: [...(s.relatedTechnologies ?? []), ...(s.relatedTechnologyIds ?? []).map((id) => ({ id }))].map(depiction),
			...(s.year === undefined ? { note: "www records no year for this subtitle; the parent's year is used." } : {}),
		});
	}
}
for (const id of Object.keys(REMAPS)) if (!unresolvedSeen.has(id)) throw new Error(`REMAPS entry ${id} is not needed: the id resolves now`);

const NOTE =
	"Origins works (D57), migrated from www content/origins/data.ts on 2026-10-03 (#78) by scripts/origins/migrate-www.mjs. Facts about each work and one-sentence descriptions written by Envisioning; no text, stills or artwork from the works (NOTICE.md). Child works (episodes, sequels, adaptations) follow their parent. See INDEX.md.";
for (const [name, works] of Object.entries(files)) {
	const doc = OriginsRawFile.parse({ rule: "D57", note: NOTE, works });
	writeFileSync(path.join(REPO, "data/raw/origins", `works-${name}.json`), `${JSON.stringify(doc, null, 1)}\n`);
	console.log(`works-${name}.json: ${works.length} works, ${works.reduce((n, w) => n + w.depictions.length, 0)} depictions`);
}
