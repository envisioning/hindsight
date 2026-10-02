// Snapshot the published research technologies and their stored embeddings (#59, D48).
// Usage: CMS_URL=... CMS_ANON_KEY=... LINKS_CACHE=<dir> node scripts/links/snapshot.mjs
//        LINKS_CACHE=<dir> node scripts/links/snapshot.mjs --from-cache
// Reads published `research` and published `technologies` (anon key). Never writes to the CMS.
// Writes, outside git: <cache>/technologies.json (rows with text) and technologies.{ids.json,f32} (unit vectors).
// The cache keeps every published technology the CMS returned; projects in data/links/excluded-projects.json
// (D52) are left out of the repo snapshot here and out of the candidates in candidates.mjs.
// Writes, in git: data/links/technologies-snapshot.json (id, URL parts, title, sha256 of the embedding text; no vectors).
// --from-cache: no CMS call; rebuilds the repo snapshot from <cache>/technologies.json (for example after an
// exclusion change), keeping the CMS-side counts and taken_at of the committed snapshot.
import path from "node:path";
import { EMBEDDING_DIMENSIONS, LINKS, cacheDir, cmsRows, excludedProjects, readJson, saveVectors, sha256, technologyText, writeJson } from "./lib.mjs";

const fromCache = process.argv.includes("--from-cache");
const excluded = excludedProjects();
const dir = cacheDir();
const snapshotFile = path.join(LINKS, "technologies-snapshot.json");

let rows;
let cmsCounts;
let takenAt;
if (fromCache) {
	rows = readJson(path.join(dir, "technologies.json"));
	const prev = readJson(snapshotFile);
	const { excluded_project, snapshot, ...rest } = prev.counts;
	cmsCounts = rest;
	takenAt = prev.taken_at;
} else {
	const research = await cmsRows("research?select=id,slug,title,published&published=eq.true");
	const bySlug = new Map(research.map((r) => [r.id, r]));
	const techs = await cmsRows(
		"technologies?select=id,research_id,original_id,title,summary,description,embedding,updated_at&published=eq.true&order=id",
	);
	rows = [];
	let skippedProject = 0;
	let skippedNoVector = 0;
	for (const t of techs) {
		const project = bySlug.get(t.research_id);
		if (!project) {
			skippedProject++;
			continue;
		}
		if (!t.embedding) {
			skippedNoVector++;
			continue;
		}
		const vec = typeof t.embedding === "string" ? JSON.parse(t.embedding) : t.embedding;
		if (vec.length !== EMBEDDING_DIMENSIONS) throw new Error(`${t.id}: ${vec.length} dimensions`);
		const text = technologyText(t);
		rows.push({
			id: t.id,
			research_slug: project.slug,
			research_title: project.title,
			original_id: t.original_id,
			title: t.title,
			summary: t.summary ?? "",
			description: t.description ?? "",
			updated_at: t.updated_at,
			text_sha256: sha256(text),
			vec,
		});
	}
	writeJson(
		path.join(dir, "technologies.json"),
		rows.map(({ vec, ...r }) => r),
	);
	saveVectors(
		"technologies",
		rows.map((r) => r.id),
		rows.map((r) => r.vec),
	);
	cmsCounts = {
		published_projects: research.length,
		published_technologies: techs.length,
		in_unpublished_project: skippedProject,
		without_embedding: skippedNoVector,
	};
	takenAt = new Date().toISOString();
}

const kept = rows.filter((r) => !excluded.has(r.research_slug));
const counts = { ...cmsCounts, excluded_project: rows.length - kept.length, snapshot: kept.length };
writeJson(snapshotFile, {
	taken_at: takenAt,
	note: "Published technologies in published research projects, with the stored Core CMS embedding (text-embedding-3-large at 1536 dimensions). Vectors are not committed. Technologies of excluded projects (data/links/excluded-projects.json, D52) are left out.",
	excluded_projects: [...excluded.keys()].sort(),
	counts,
	technologies: kept.map((r) => ({
		id: r.id,
		research_slug: r.research_slug,
		original_id: r.original_id,
		title: r.title,
		text_sha256: r.text_sha256,
	})),
});
console.log(JSON.stringify(counts));
