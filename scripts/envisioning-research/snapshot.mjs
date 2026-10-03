// Snapshot Envisioning's research ratings as dated assessments (#95).
// Usage: CMS_URL=... CMS_ANON_KEY=... node scripts/envisioning-research/snapshot.mjs [--check]
// Reads published `research`, `research_metrics` and published `technologies` with the public anon key
// (lib.mjs cmsRows, the same client as scripts/links/snapshot.mjs). Never writes to the CMS.
// Writes data/raw/envisioning-research/<YYYY-MM-DD>.json (UTC date of the run). Append-only: an existing
// file for the date is never overwritten; the script stops instead. --check validates without writing.
// Labels are resolved as the research apps resolve them (research projects/_shared/lib/supabase-technologies.ts,
// getMetricsConfigFromSupabase): research_metrics row for (project, collection_id), else the project row
// (collection_id null), else the app-common defaults below. Excluded projects (D52) are kept and marked.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPO, cmsRows, excludedProjects } from "../links/lib.mjs";

const OUT_DIR = path.join(REPO, "data/raw/envisioning-research");
const check = process.argv.includes("--check");

/** Defaults of the research apps when a project has no research_metrics row
 * (research packages/app-common/data/metrics.ts trl/impact/investment, config/schema.ts names). */
const level5 = ["Minimal", "Low", "Medium", "High", "Very High"];
const DEFAULTS = {
	metric1: {
		name: "Technology Readiness Level",
		definitions: ["Speculative", "Theoretical", "Conceptual", "Formative", "Validated", "Demonstrated", "Operational", "Deployed", "Established"].map(
			(label, i) => ({ value: i + 1, label }),
		),
	},
	metric2: { name: "Impact", definitions: level5.map((label, i) => ({ value: i + 1, label })) },
	metric3: { name: "Investment", definitions: level5.map((label, i) => ({ value: i + 1, label })) },
};
const METRICS = ["metric1", "metric2", "metric3"];

const scale = (cfg, key) => {
	const m = cfg?.[key];
	const defs = m?.definitions;
	if (!Array.isArray(defs) || defs.length === 0) return null;
	return {
		name: m.name ?? null,
		definitions: defs
			.map((d) => ({ value: d.value, label: (d.label ?? d.title ?? "").trim() || String(d.value) }))
			.sort((a, b) => a.value - b.value),
	};
};

/** Resolve one metric's scale for a project and collection. Mirrors the apps: metric1 falls back to TRL per metric;
 * metric2/3 come from the same config row when it has them, else the defaults. */
function resolve(byKey, researchId, collectionId, key) {
	const collectionCfg = collectionId != null ? byKey.get(`${researchId}|${collectionId}`) : undefined;
	const projectCfg = byKey.get(`${researchId}|`);
	const row = collectionCfg ?? projectCfg;
	const from = collectionCfg ? "cms:research_metrics(collection)" : projectCfg ? "cms:research_metrics(project)" : "default:app-common";
	const s = row ? scale(row.metrics_config, key) : null;
	if (s) return { ...s, name: s.name ?? DEFAULTS[key].name, from };
	return { ...DEFAULTS[key], from: "default:app-common" };
}

const takenAt = new Date().toISOString();
const date = takenAt.slice(0, 10);
const outFile = path.join(OUT_DIR, `${date}.json`);
if (!check && existsSync(outFile)) {
	console.error(`${path.relative(REPO, outFile)} exists; snapshots are append-only (one per date). Nothing written.`);
	process.exit(1);
}

const excluded = excludedProjects();
const research = await cmsRows("research?select=id,slug,title,published&order=slug");
const published = new Map(research.filter((r) => r.published).map((r) => [r.id, r]));
const configs = await cmsRows("research_metrics?select=research_id,collection_id,metrics_config,updated_at&order=updated_at.desc");
const byKey = new Map();
for (const c of configs) {
	const k = `${c.research_id}|${c.collection_id ?? ""}`;
	if (!byKey.has(k)) byKey.set(k, c); // newest first, as the apps take the latest row
}
const techs = await cmsRows(
	"technologies?select=id,research_id,original_id,title,collection_id,collection_label,metric1,metric2,metric3,updated_at,last_reviewed_at&published=eq.true&order=id",
);

let inUnpublishedProject = 0;
const unresolved = [];
const scales = {};
const technologies = [];
for (const t of techs) {
	const project = published.get(t.research_id);
	if (!project) {
		inUnpublishedProject++;
		continue;
	}
	const row = {
		id: t.id,
		research_slug: project.slug,
		original_id: t.original_id,
		title: t.title,
		collection: t.collection_id ?? null,
	};
	if (t.collection_label) row.collection_label = t.collection_label;
	for (const key of METRICS) {
		const s = resolve(byKey, t.research_id, t.collection_id, key);
		const scaleKey = `${project.slug}${s.from.endsWith("(collection)") ? `/${t.collection_id}` : ""}`;
		scales[scaleKey] ??= {};
		scales[scaleKey][key] ??= { name: s.name, from: s.from, definitions: s.definitions };
		const value = t[key];
		const label = value == null ? null : (s.definitions.find((d) => d.value === value)?.label ?? null);
		if (value != null && label == null) unresolved.push(`${project.slug}/${t.original_id} ${key}=${value}`);
		row[key] = { name: s.name, value, label };
	}
	row.updated_at = t.updated_at;
	row.last_reviewed_at = t.last_reviewed_at ?? null;
	if (excluded.has(project.slug)) row.excluded_from_linking = excluded.get(project.slug).decision;
	technologies.push(row);
}
technologies.sort((a, b) => a.research_slug.localeCompare(b.research_slug) || a.original_id.localeCompare(b.original_id) || a.id.localeCompare(b.id));

const distribution = {};
for (const key of METRICS) {
	distribution[key] = {};
	for (const r of technologies) {
		const k = r[key].value == null ? "null" : String(r[key].value);
		distribution[key][k] = (distribution[key][k] ?? 0) + 1;
	}
}
const projects = [...new Set(technologies.map((r) => r.research_slug))].sort();
const custom = Object.entries(scales)
	.filter(([, s]) => METRICS.some((k) => s[k].from !== "default:app-common"))
	.map(([k]) => k)
	.sort();
const counts = {
	published_projects: published.size,
	projects_with_technologies: projects.length,
	published_technologies: techs.length,
	in_unpublished_project: inUnpublishedProject,
	technologies: technologies.length,
	excluded_from_linking: technologies.filter((r) => r.excluded_from_linking).length,
	with_last_reviewed_at: technologies.filter((r) => r.last_reviewed_at).length,
	null_metric: Object.fromEntries(METRICS.map((k) => [k, technologies.filter((r) => r[k].value == null).length])),
	unresolved_labels: unresolved.length,
};

const snapshot = {
	source: "envisioning-research",
	institution: "Envisioning",
	title: "Envisioning research database: technology ratings",
	snapshot_date: date,
	taken_at: takenAt,
	method:
		"Read with the public anon key of the Core CMS (read only): published technologies in published research projects, their three metric values, collection, updated_at and last_reviewed_at. Labels and metric names resolved per technology as the research apps resolve them: research_metrics row for the project and collection, else the project row, else the app-common defaults (metric1 Technology Readiness Level 1-9, metric2 Impact 1-5, metric3 Investment 1-5). The CMS overwrites ratings in place; each snapshot is the only record of the ratings on its date. Projects excluded from linking (D52) are kept and marked: they are Envisioning's assessments too.",
	script: "scripts/envisioning-research/snapshot.mjs",
	licence: "CC BY 4.0 (NOTICE.md). Facts only: values, labels and dates of Envisioning's own ratings; no summaries or descriptions.",
	excluded_from_linking: [...excluded.keys()].sort(),
	counts,
	distribution,
	projects_with_custom_metrics: custom,
	// Per project: technology count and the scale its ratings use ("default" = app-common defaults, else the project key).
	projects: Object.fromEntries(
		Object.keys(scales)
			.sort()
			.map((k) => [
				k,
				{
					technologies: technologies.filter((r) => `${r.research_slug}` === k || `${r.research_slug}/${r.collection}` === k).length,
					scale: custom.includes(k) ? k : "default",
				},
			]),
	),
	scales: {
		default: Object.fromEntries(METRICS.map((m) => [m, { name: DEFAULTS[m].name, from: "default:app-common", definitions: DEFAULTS[m].definitions }])),
		...Object.fromEntries(custom.map((k) => [k, scales[k]])),
	},
	technologies,
};

if (unresolved.length) console.error(`values without a label (kept, label null): ${unresolved.slice(0, 20).join(", ")}${unresolved.length > 20 ? " ..." : ""}`);
if (check) console.log(`check: would write ${path.relative(REPO, outFile)}`);
else {
	// Header indented; one technology per line, to keep a monthly file small and diffable.
	const { technologies: rows, ...header } = snapshot;
	const head = JSON.stringify({ ...header, technologies: [] }, null, "\t").replace(/\t"technologies": \[\]\n}$/, "");
	mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(outFile, `${head}\t"technologies": [\n${rows.map((r) => `\t\t${JSON.stringify(r)}`).join(",\n")}\n\t]\n}\n`);
	JSON.parse(readFileSync(outFile, "utf8"));
}
console.log(JSON.stringify({ file: path.relative(REPO, outFile), counts, distribution, projects_with_custom_metrics: custom }));
