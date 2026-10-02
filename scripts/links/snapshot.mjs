// Snapshot the published research technologies and their stored embeddings (#59, D48).
// Usage: CMS_URL=... CMS_ANON_KEY=... LINKS_CACHE=<dir> node scripts/links/snapshot.mjs
// Reads published `research` and published `technologies` (anon key). Never writes to the CMS.
// Writes, outside git: <cache>/technologies.json (rows with text) and technologies.{ids.json,f32} (unit vectors).
// Writes, in git: data/links/technologies-snapshot.json (id, URL parts, title, sha256 of the embedding text; no vectors).
import path from "node:path";
import { EMBEDDING_DIMENSIONS, LINKS, cacheDir, cmsRows, saveVectors, sha256, technologyText, writeJson } from "./lib.mjs";

const research = await cmsRows("research?select=id,slug,title,published&published=eq.true");
const bySlug = new Map(research.map((r) => [r.id, r]));
const techs = await cmsRows(
	"technologies?select=id,research_id,original_id,title,summary,description,embedding,updated_at&published=eq.true&order=id",
);
const rows = [];
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
const dir = cacheDir();
writeJson(
	path.join(dir, "technologies.json"),
	rows.map(({ vec, ...r }) => r),
);
saveVectors(
	"technologies",
	rows.map((r) => r.id),
	rows.map((r) => r.vec),
);
writeJson(path.join(LINKS, "technologies-snapshot.json"), {
	taken_at: new Date().toISOString(),
	note: "Published technologies in published research projects, with the stored Core CMS embedding (text-embedding-3-large at 1536 dimensions). Vectors are not committed.",
	counts: {
		published_projects: research.length,
		published_technologies: techs.length,
		in_unpublished_project: skippedProject,
		without_embedding: skippedNoVector,
		snapshot: rows.length,
	},
	technologies: rows.map((r) => ({
		id: r.id,
		research_slug: r.research_slug,
		original_id: r.original_id,
		title: r.title,
		text_sha256: r.text_sha256,
	})),
});
console.log(
	`projects ${research.length}; technologies ${techs.length}; in unpublished project ${skippedProject}; without embedding ${skippedNoVector}; snapshot ${rows.length}`,
);
