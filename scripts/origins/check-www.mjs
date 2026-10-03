// Proves the www Origins catalogue moved without loss (#78): every work, every subtitle and every
// technology connection of www content/origins/data.ts exists in data/raw/origins with an id, and
// every connection is a normalized depiction claim with its FictionDepiction row. www's work summaries are
// dropped on purpose (scripts/origins/README.md) and not checked.
// Usage: node scripts/origins/check-www.mjs [path to www content/origins/data.ts]
// Default input: ../www/content/origins/data.ts next to this repository (read only). Exit 1 on any gap.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = path.resolve(import.meta.dirname, "../..");
const input = path.resolve(process.argv[2] ?? path.join(REPO, "../www/content/origins/data.ts"));
if (!existsSync(input)) throw new Error(`www data not found: ${input} (pass the path to content/origins/data.ts)`);
const { originsData } = await import(pathToFileURL(input).href);
const read = (f) => JSON.parse(readFileSync(f, "utf8"));

const rawDir = path.join(REPO, "data/raw/origins");
const works = readdirSync(rawDir)
	.filter((f) => /^works-.*\.json$/.test(f))
	.flatMap((f) => read(path.join(rawDir, f)).works);
const byId = new Map(works.map((w) => [w.id, w]));
const ids = read(path.join(REPO, "data/normalized/ids.json")).sources.origins ?? {};
const claims = new Map(read(path.join(REPO, "data/normalized/claims/origins.json")).map((c) => [c.id, c]));
const depictions = new Map(read(path.join(REPO, "data/normalized/origins-depictions.json")).map((d) => [d.claim_id, d]));
const editions = new Set(read(path.join(REPO, "data/normalized/origins-works.json")).map((w) => w.edition));

const gaps = [];
const counts = { works: 0, subtitles: 0, connections: 0, claims: 0 };

function checkWork(id, title, year, conns, where) {
	const w = byId.get(id);
	if (!w) return gaps.push(`${where}: no work ${id}`);
	if (w.title !== title) gaps.push(`${where}: title ${JSON.stringify(w.title)} != ${JSON.stringify(title)}`);
	if (year !== undefined && w.year !== year) gaps.push(`${where}: year ${w.year} != ${year}`);
	if (!editions.has(id)) gaps.push(`${where}: work ${id} is not in origins-works.json`);
	const keys = ids[id]?.keys ?? {};
	for (const c of conns) {
		counts.connections++;
		const tid = typeof c === "string" ? c : c.id;
		const d = w.depictions.find((x) => x.www_technology_id === tid);
		if (!d) {
			gaps.push(`${where}: connection ${tid} missing`);
			continue;
		}
		if (typeof c !== "string" && c.description !== d.description) gaps.push(`${where}: connection ${tid} description differs`);
		const claimId = keys[d.key];
		if (!claimId) {
			gaps.push(`${where}: connection ${tid} has no claim id`);
			continue;
		}
		if (!claims.has(claimId)) gaps.push(`${where}: claim ${claimId} not normalized`);
		else counts.claims++;
		const dp = depictions.get(claimId);
		if (!dp || dp.www_technology_id !== tid) gaps.push(`${where}: claim ${claimId} has no depiction row for ${tid}`);
	}
	if (w.depictions.length !== conns.length) gaps.push(`${where}: ${w.depictions.length} depictions for ${conns.length} connections`);
}

for (const o of originsData) {
	counts.works++;
	const w = byId.get(o.id);
	if (w) {
		if (w.www?.slug !== o.slug) gaps.push(`${o.id}: slug ${w.www?.slug} != ${o.slug}`);
		if (w.www?.creator !== o.creator) gaps.push(`${o.id}: creator not kept`);
		if (w.www?.country !== o.country) gaps.push(`${o.id}: country not kept`);
		if (w.image_url !== o.imageUrl) gaps.push(`${o.id}: image not kept`);
	}
	checkWork(o.id, o.title, o.year, [...(o.relatedTechnologies ?? []), ...(o.relatedTechnologyIds ?? [])], o.id);
	for (const s of o.subtitles ?? []) {
		counts.subtitles++;
		const id = `${o.id}--${s.id}`;
		const cw = byId.get(id);
		if (cw && cw.parent !== o.id) gaps.push(`${id}: parent ${cw.parent} != ${o.id}`);
		checkWork(id, s.title, s.year, [...(s.relatedTechnologies ?? []), ...(s.relatedTechnologyIds ?? [])], id);
	}
}
// Works marked as from www must all be in data.ts (later works, from the canon #79, carry no `www`).
const fromWww = works.filter((w) => w.www !== undefined).length;
if (fromWww !== counts.works + counts.subtitles) gaps.push(`${fromWww} raw works carry www provenance, data.ts has ${counts.works + counts.subtitles}`);

console.log(JSON.stringify({ input: path.relative(REPO, input), ...counts, raw_works: works.length, gaps: gaps.length }));
if (gaps.length) {
	for (const g of gaps) console.error(g);
	process.exit(1);
}
