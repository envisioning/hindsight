// Curated research links for Origins depictions (#78, D57, D48).
// Usage: node scripts/origins/curated-links.mjs [--check]
// Reads data/normalized/origins-depictions.json (research pages per depiction claim) and
// data/normalized/claims/origins.json (subject per claim); appends one `curated` row to
// data/links/research.json per (subject, research page) pair. A curated row is never overwritten by
// an agent run (D48). Relation: `same`, unless the pair's latest row is an active agent row with
// another relation (the D48 verifiers judged the pair; the curated row keeps their relation), or a
// D48 run decided the pair `no_link` (then no row is written and the pair is reported).
// Pages missing from technologies-snapshot.json or in an excluded project (D52, D55) get no row.
// Append-only and idempotent: a pair whose latest row is already this curated row gets nothing.
// --check: exit 1 if rows would be appended. Run after `pnpm normalize`, then `pnpm links`.
import { readdirSync } from "node:fs";
import path from "node:path";
import { SubjectTechnologyLink } from "../../src/schema.ts";
import { LINKS, NORMALIZED, excludedProjects, exists, readJson, writeJson } from "../links/lib.mjs";

const check = process.argv.includes("--check");
/** Fixed so a re-run writes byte-identical rows: the date of the migration (#78). */
const AT = "2026-10-03T00:00:00.000Z";
const AGENT = "curated:envisioning-origins";
const RUN = "origins-curated";

const depictions = readJson(path.join(NORMALIZED, "origins-depictions.json"));
const claims = new Map(readJson(path.join(NORMALIZED, "claims", "origins.json")).map((c) => [c.id, c]));
const snapshot = readJson(path.join(LINKS, "technologies-snapshot.json")).technologies;
const page = new Map(snapshot.map((t) => [`${t.research_slug}/${t.original_id}`, t]));
const excluded = excludedProjects();

const file = path.join(LINKS, "research.json");
const rows = exists(file) ? readJson(file) : [];
const latest = new Map();
const latestAgent = new Map();
const countOf = new Map();
for (const r of rows) {
	const k = `${r.subject_id}~${r.technology_id}`;
	latest.set(k, r);
	if (r.method !== "curated") latestAgent.set(k, r);
	countOf.set(k, (countOf.get(k) ?? 0) + 1);
}
const decided = new Map();
const runs = path.join(LINKS, "runs");
for (const run of readdirSync(runs).sort()) {
	const f = path.join(runs, run, "final.json");
	if (exists(f)) for (const d of readJson(f).decisions ?? []) decided.set(d.id, { run, verdict: d.verdict });
}

// (subject, page) pairs with the claims that name them.
const pairs = new Map();
const report = { depictions: depictions.length, with_research: 0, without_research: 0, missing_page: [], excluded_page: [], no_link_decided: [] };
for (const d of depictions) {
	if (d.research.length === 0) {
		report.without_research++;
		continue;
	}
	report.with_research++;
	const claim = claims.get(d.claim_id);
	if (!claim) throw new Error(`${d.claim_id}: no claim`);
	for (const r of d.research) {
		const key = `${r.research_slug}/${r.original_id}`;
		if (excluded.has(r.research_slug)) {
			report.excluded_page.push(`${d.claim_id} ${key}`);
			continue;
		}
		const t = page.get(key);
		if (!t) {
			report.missing_page.push(`${d.claim_id} ${key}`);
			continue;
		}
		for (const s of claim.subject_ids) {
			const k = `${s}~${t.id}`;
			const p = pairs.get(k) ?? { subject_id: s, t, claims: [] };
			p.claims.push(d.claim_id);
			pairs.set(k, p);
		}
	}
}

const added = [];
let unchanged = 0;
let adopted = 0;
for (const [k, p] of [...pairs].sort((a, b) => a[0].localeCompare(b[0]))) {
	const prev = latest.get(k);
	const dec = decided.get(k);
	if (dec?.verdict === "no_link" && !(prev?.method === "curated")) {
		report.no_link_decided.push(`${k} (${dec.run})`);
		continue;
	}
	// The verifiers' relation, from the pair's latest agent row (before any curated row).
	const agentRow = latestAgent.get(k);
	let relation = "same";
	if (agentRow && agentRow.status === "active" && agentRow.relation !== "same") {
		relation = agentRow.relation;
		adopted++;
	}
	const n = p.claims.length;
	const reason = `Origins connection (envisioning.com, migrated #78): ${n} depiction${n === 1 ? "" : "s"}, ${p.claims.slice(0, 4).join(", ")}${n > 4 ? ", ..." : ""}${relation !== "same" ? `; relation kept from ${agentRow.run} (${agentRow.relation})` : ""}`;
	if (prev?.method === "curated" && prev.status === "active" && prev.relation === relation && prev.agent === AGENT && prev.reason === reason) {
		unchanged++;
		continue;
	}
	const count = (countOf.get(k) ?? 0) + 1;
	countOf.set(k, count);
	added.push(
		SubjectTechnologyLink.parse({
			id: `${k}#${count}`,
			subject_id: p.subject_id,
			technology_id: p.t.id,
			research_slug: p.t.research_slug,
			original_id: p.t.original_id,
			relation,
			method: "curated",
			agent: AGENT,
			status: "active",
			reason: reason.slice(0, 300),
			run: RUN,
			created_at: AT,
		}),
	);
}

console.log(JSON.stringify({ ...report, pairs: pairs.size, appended: added.length, unchanged, relation_kept_from_d48: adopted }, null, 1));
if (check) {
	if (added.length) process.exit(1);
} else if (added.length) {
	writeJson(file, [...rows, ...added]);
}
