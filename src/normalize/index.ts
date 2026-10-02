/**
 * normalize: read data/raw/<source>/ and write data/normalized/, one shape
 * for every source (issue #38). Run with `pnpm normalize`.
 *
 * A source is processed when its INDEX.md exists and its PROGRESS.md shows
 * no edition in progress. Every row is validated against src/schema.ts. A
 * source with an invalid row is not written and the command exits non-zero.
 * Re-running is safe: ids.json and subject-aliases.json keep ids stable.
 */
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  Claim,
  Evidence,
  Institution,
  Revision,
  Source,
  SourceEdition,
  Subject,
  VerdictRow,
  VERDICTS_BY_TYPE,
} from "../schema.ts";
import { IdRegistry, ID_RULE } from "./ids.ts";
import { type Bundle, OUT, RAW, REPO, clean, editionId, writeJson, writeText } from "./lib.ts";
import { QUANTITIES, QUANTITY_BY_ID } from "./quantities.ts";
import { posterRevisions, serialRevisions } from "./revisions.ts";
import { subjectTexts } from "./subject-text.ts";
import { type PhaseCheck, hypeCycle } from "./sources/hype-cycle.ts";
import { envisioningEducation, envisioningHealth, envisioningHorizons, envisioningPosters } from "./sources/envisioning.ts";
import { ARK_GENERIC_IDEAS, arkBigIdeas, deloittePredictions, gartnerPredictions, idcFuturescape, mitBreakthrough, wefGlobalRisks } from "./sources/lists.ts";
import { cboProjections, ecbProjections, fedSep, obrForecasts, oecdOutlook, worldBankGep } from "./sources/macro.ts";
import { bcbFocus, bnefEvo, bpEnergyOutlook, eiaAeo, ieaWeo, imfWeo } from "./sources/numeric.ts";
import { SubjectResolver } from "./subjects.ts";
import { a16zBigIdeas, accentureTechVision, deloitteTechTrends, ftsgTechTrends, ipccPathways, mckinseyTechTrends, nicGlobalTrends, shellScenarios, trendwatching } from "./sources/tier3.ts";
import { economistWorldAhead, eurasiaTopRisks, kurzweil, pewElonImagining } from "./sources/tier2.ts";

type ClaimRow = Claim & { edition: string };

/** Adapters in processing order. The order fixes which label names a new subject. */
const ADAPTERS: Record<string, () => Bundle> = {
  "envisioning-technology": envisioningPosters,
  "envisioning-education": envisioningEducation,
  "envisioning-health": envisioningHealth,
  "envisioning-horizons": envisioningHorizons,
  "gartner-hype-cycle": hypeCycle,
  "mit-tr-10-breakthrough": mitBreakthrough,
  "gartner-strategic-predictions": gartnerPredictions,
  "deloitte-tmt-predictions": deloittePredictions,
  "idc-futurescape": idcFuturescape,
  "ark-big-ideas": arkBigIdeas,
  "bnef-evo": bnefEvo,
  "wef-global-risks": wefGlobalRisks,
  "imf-weo": imfWeo,
  "iea-weo": ieaWeo,
  "eia-aeo": eiaAeo,
  "bcb-focus": bcbFocus,
  "oecd-economic-outlook": oecdOutlook,
  "world-bank-gep": worldBankGep,
  "fed-sep": fedSep,
  "ecb-projections": ecbProjections,
  "cbo-projections": cboProjections,
  "obr-forecasts": obrForecasts,
  "bp-energy-outlook": bpEnergyOutlook,
  "eurasia-top-risks": eurasiaTopRisks,
  "economist-world-ahead": economistWorldAhead,
  kurzweil,
  "pew-elon-imagining": pewElonImagining,
  "mckinsey-tech-trends": mckinseyTechTrends,
  "accenture-tech-vision": accentureTechVision,
  "deloitte-tech-trends": deloitteTechTrends,
  trendwatching,
  "a16z-big-ideas": a16zBigIdeas,
  "ftsg-tech-trends": ftsgTechTrends,
  "nic-global-trends": nicGlobalTrends,
  "shell-scenarios": shellScenarios,
  "ipcc-pathways": ipccPathways,
};

interface Progress {
  source: string;
  status: string;
  editions?: number;
  claims?: number;
  skipped?: string;
  keyRule?: string;
  time: string;
  detail?: string;
}

const now = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");

function eligibility(source: string): string | undefined {
  const dir = join(RAW, source);
  if (!existsSync(join(dir, "INDEX.md"))) return "not yet captured: no INDEX.md";
  const progress = join(dir, "PROGRESS.md");
  if (existsSync(progress) && /in progress/i.test(readFileSync(progress, "utf8"))) return "not yet captured: PROGRESS.md shows an edition in progress";
  if (ADAPTERS[source] === undefined) return "captured, no normalize adapter yet";
  return undefined;
}

function allSourceNames(): string[] {
  const names = new Set<string>();
  for (const d of readdirSync(RAW, { withFileTypes: true })) if (d.isDirectory()) names.add(d.name);
  const scripts = join(REPO, "scripts");
  if (existsSync(scripts)) for (const d of readdirSync(scripts, { withFileTypes: true })) if (d.isDirectory()) names.add(d.name);
  return [...names].sort();
}

function progressMd(rows: Progress[], phaseChecks: PhaseCheck[]): string {
  const lines = [
    "# Normalize progress",
    "",
    "Written by `pnpm normalize`. One line per source. Re-run the command to pick up sources that are not yet captured.",
    "",
    "| Source | Status | Editions | Claims | Skipped rows | Natural key (ids.json) | Time |",
    "|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.source} | ${r.status}${r.detail ? `: ${r.detail}` : ""} | ${r.editions ?? ""} | ${r.claims ?? ""} | ${r.skipped ?? ""} | ${(r.keyRule ?? "").replaceAll(" | ", " + ")} | ${r.time} |`,
    ),
  ];
  if (phaseChecks.length > 0) {
    lines.push("", "## Hype Cycle phase cross-check", "");
    for (const c of phaseChecks) {
      lines.push(`- ${c.edition}: phase read on the chart vs phase derived from x_time and the measured boundaries: ${c.agree} of ${c.compared} agree.`);
      for (const d of c.disagreements) lines.push(`  - ${d.label}: read ${d.raw}, derived ${d.derived} (x ${d.x}).`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function main(): void {
  const ids = new IdRegistry();
  const subjects = new SubjectResolver();
  const progress: Progress[] = [];
  const failures: string[] = [];
  const sources: Source[] = [];
  const institutions = new Map<string, Institution>();
  const editions: SourceEdition[] = [];
  const claimsBySource = new Map<string, ClaimRow[]>();
  const verdicts: VerdictRow[] = [];
  const evidence: Evidence[] = [];
  let phaseChecks: PhaseCheck[] = [];
  const posterIds = new Map<string, string>();
  const skippedTotals: Record<string, Record<string, number>> = {};

  const writeProgress = () => {
    const done = new Set(progress.map((p) => p.source));
    const rest = allSourceNames()
      .filter((s) => !done.has(s))
      .map((s) => ({ source: s, status: eligibility(s) ?? "pending", time: now() }));
    writeText(join(OUT, "PROGRESS.md"), progressMd([...progress, ...rest], phaseChecks));
  };

  const order = [...Object.keys(ADAPTERS), ...allSourceNames().filter((s) => ADAPTERS[s] === undefined)];
  for (const name of order) {
    const why = eligibility(name);
    if (why !== undefined) continue;
    const adapter = ADAPTERS[name] as () => Bundle;
    let bundle: Bundle;
    try {
      bundle = adapter();
    } catch (err) {
      failures.push(`${name}: ${(err as Error).message}`);
      progress.push({ source: name, status: "failed", detail: (err as Error).message, time: now() });
      writeProgress();
      continue;
    }
    if ("phaseChecks" in bundle) phaseChecks = (bundle as Bundle & { phaseChecks: PhaseCheck[] }).phaseChecks;

    const errors: string[] = [];
    const rows: ClaimRow[] = [];
    const idSnap = ids.snapshot();
    const subjectSnap = subjects.snapshot();
    const verdictCount = verdicts.length;
    const evidenceCount = evidence.length;
    try {
      for (const x of bundle.extraAliases ?? []) subjects.assertSame(x.label, x.sameAs, x.reason, x.kind, name);
      const byEdition = new Map<string, typeof bundle.drafts>();
      for (const d of bundle.drafts) {
        const list = byEdition.get(d.edition) ?? [];
        list.push(d);
        byEdition.set(d.edition, list);
      }
      for (const [ed, drafts] of byEdition) {
        const idMap = ids.assign(name, ed, drafts.map((d) => ({ key: d.key, index: d.index })));
        for (const d of drafts) {
          const id = idMap.get(d.key) as string;
          if (d.rawId !== undefined) posterIds.set(d.rawId, id);
          const subjectIds = [...d.quantityIds];
          for (const ref of d.labels) {
            const s = subjects.resolve(ref, name);
            if (s !== undefined && !subjectIds.includes(s)) subjectIds.push(s);
          }
          const row = { id, source_edition_id: editionId(name, ed), subject_ids: subjectIds, ...d.claim };
          const parsed = Claim.safeParse(row);
          if (!parsed.success) errors.push(`${id}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
          else rows.push({ ...parsed.data, edition: ed });
        }
      }
      for (const e of bundle.editions) {
        const p = SourceEdition.safeParse(e);
        if (!p.success) errors.push(`edition ${e.id}: ${p.error.message}`);
      }
      const s = Source.safeParse(bundle.source);
      if (!s.success) errors.push(`source: ${s.error.message}`);
      const inst = Institution.safeParse(bundle.institution);
      if (!inst.success) errors.push(`institution: ${inst.error.message}`);
      for (const v of bundle.verdicts ?? []) {
        const claimId = posterIds.get(v.rawClaimKey);
        const claim = rows.find((c) => c.id === claimId);
        if (claimId === undefined || claim === undefined) {
          errors.push(`verdict for unknown claim ${v.rawClaimKey}`);
          continue;
        }
        if (!VERDICTS_BY_TYPE[claim.claim_type].includes(v.verdict.verdict)) errors.push(`${claimId}: verdict ${v.verdict.verdict} not allowed for ${claim.claim_type}`);
        const evIds: string[] = [];
        v.evidence.forEach((ev, i) => {
          const row = clean({ id: `${claimId}-e${i + 1}`, claim_id: claimId, ...ev });
          const p = Evidence.safeParse(row);
          if (!p.success) errors.push(`${row.id}: ${p.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
          else {
            evidence.push(p.data);
            evIds.push(p.data.id);
          }
        });
        const vr = VerdictRow.safeParse({ id: `${claimId}-v1`, claim_id: claimId, evidence_ids: evIds, ...v.verdict });
        if (!vr.success) errors.push(`${claimId}-v1: ${vr.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
        else verdicts.push(vr.data);
      }
    } catch (err) {
      errors.push((err as Error).message);
    }

    const skipped = Object.entries(bundle.skipped)
      .map(([k, v]) => `${v} ${k}`)
      .join("; ");
    skippedTotals[name] = bundle.skipped;
    if (errors.length > 0) {
      ids.restore(idSnap);
      subjects.restore(subjectSnap);
      verdicts.length = verdictCount;
      evidence.length = evidenceCount;
      failures.push(`${name}: ${errors.length} invalid rows`);
      writeText(join(OUT, "errors", `${name}.txt`), `${errors.join("\n")}\n`);
      progress.push({ source: name, status: "failed", detail: `${errors.length} invalid rows, see errors/${name}.txt; not written`, time: now() });
      writeProgress();
      continue;
    }
    rmSync(join(OUT, "errors", `${name}.txt`), { force: true });
    sources.push(Source.parse(bundle.source));
    institutions.set(bundle.institution.id, Institution.parse(bundle.institution));
    editions.push(...bundle.editions.map((e) => SourceEdition.parse(e)));
    claimsBySource.set(name, rows);
    writeJson(
      join(OUT, "claims", `${name}.json`),
      rows.map(({ edition: _e, ...c }) => c),
    );
    ids.save();
    subjects.save();
    progress.push({
      source: name,
      status: "normalized",
      editions: bundle.editions.length,
      claims: rows.length,
      skipped: skipped || "0",
      keyRule: bundle.keyRule,
      time: now(),
    });
    writeProgress();
    console.log(`${name}: ${rows.length} claims`);
  }

  // Revisions.
  const revisions: Revision[] = [];
  let hcAmbiguous = 0;
  let posterAdded = 0;
  const hc = claimsBySource.get("gartner-hype-cycle");
  if (hc !== undefined) {
    const eds = [...new Set(hc.map((c) => c.edition))].sort();
    const r = serialRevisions(hc, eds);
    revisions.push(...r.rows);
    hcAmbiguous = r.ambiguous;
  }
  if (claimsBySource.has("envisioning-technology")) {
    const r = posterRevisions((raw) => posterIds.get(raw));
    revisions.push(...r.rows);
    posterAdded = r.added;
  }
  const revErrors: string[] = [];
  const allClaimIds = new Set([...claimsBySource.values()].flat().map((c) => c.id));
  const revSeen = new Set<string>();
  for (const r of revisions) {
    const p = Revision.safeParse(r);
    if (!p.success) revErrors.push(`${r.id}: ${p.error.message}`);
    if (revSeen.has(r.id)) revErrors.push(`${r.id}: duplicate revision id`);
    revSeen.add(r.id);
    if (!allClaimIds.has(r.prior_claim_id) || (r.new_claim_id !== undefined && !allClaimIds.has(r.new_claim_id))) revErrors.push(`${r.id}: unknown claim`);
  }

  // Subjects.
  const allClaims = [...claimsBySource.values()].flat();
  const usedIds = new Set(allClaims.flatMap((c) => c.subject_ids));
  const aliasRows = subjects.rows().filter((a) => usedIds.has(a.subject_id));
  const subjectRows: Subject[] = [];
  const subjErrors: string[] = [];
  const curated = new Map(subjects.curation.subjects.map((s) => [s.id, s]));
  for (const id of [...usedIds].sort()) {
    const q = QUANTITY_BY_ID.get(id);
    const labels = aliasRows.filter((a) => a.subject_id === id);
    const metrics = [...new Set(allClaims.filter((c) => c.subject_ids.includes(id) && c.metric).map((c) => c.metric as string))];
    const kinds = subjects.kinds.get(id);
    const kind = kinds ? ([...kinds.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other") : "quantity";
    const cur = curated.get(id);
    const namedBy = labels.find((a) => a.method === "exact") ?? labels[0];
    const row = clean({
      id,
      name: cur?.name ?? q?.name ?? namedBy?.label ?? id,
      kind: cur?.kind ?? (q ? "quantity" : kind),
      aliases: [...new Set([...labels.map((a) => a.label), ...(q ? metrics : [])])].sort(),
      related: cur?.related ?? q?.related,
      notes: cur?.notes ?? q?.notes,
    });
    const p = Subject.safeParse(row);
    if (!p.success) subjErrors.push(`${id}: ${p.error.message}`);
    else subjectRows.push(p.data);
  }
  const subjectIdSet = new Set(subjectRows.map((s) => s.id));
  for (const s of subjectRows) for (const r of s.related ?? []) if (!subjectIdSet.has(r) && !QUANTITIES.some((q) => q.id === r) && !curated.has(r)) subjErrors.push(`${s.id}: related ${r} is not a subject`);

  const tableErrors = [...revErrors, ...subjErrors];
  if (tableErrors.length > 0) {
    failures.push(`tables: ${tableErrors.length} invalid rows`);
    writeText(join(OUT, "errors", "tables.txt"), `${tableErrors.join("\n")}\n`);
  } else {
    rmSync(join(OUT, "errors", "tables.txt"), { force: true });
    writeJson(join(OUT, "sources.json"), sources);
    writeJson(join(OUT, "source_editions.json"), editions);
    writeJson(join(OUT, "institutions.json"), [...institutions.values()].sort((a, b) => a.id.localeCompare(b.id)));
    writeJson(join(OUT, "subjects.json"), subjectRows);
    writeJson(join(OUT, "subject-text.json"), subjectTexts(subjectRows, claimsBySource));
    writeJson(join(OUT, "revisions.json"), revisions);
    writeJson(join(OUT, "verdicts.json"), verdicts);
    writeJson(join(OUT, "evidence.json"), evidence);
  }

  // Cross-source subjects.
  const sourcesOf = new Map<string, Set<string>>();
  for (const [src, rows] of claimsBySource) for (const c of rows) for (const s of c.subject_ids) (sourcesOf.get(s) ?? sourcesOf.set(s, new Set()).get(s))?.add(src);
  const cross = [...sourcesOf.entries()]
    .filter(([, s]) => s.size >= 3)
    .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]));
  const unmapped = [
    ...[...subjects.unmappedSeen.entries()].map(([label, u]) => `"${label}" (${[...u.sources].join(", ")}): ${u.reason}`),
    ...[...ARK_GENERIC_IDEAS].map((l) => `"${l}" (ark-big-ideas chapter name): names no subject; the claim is mapped through its own subject label.`),
  ];
  const methodCount = aliasRows.reduce<Record<string, number>>((m, a) => ((m[a.method] = (m[a.method] ?? 0) + 1), m), {});
  const revCount = revisions.reduce<Record<string, number>>((m, r) => {
    const src = r.prior_claim_id.startsWith("envisioning-technology") ? "posters" : "hype cycle";
    m[`${src} ${r.change}`] = (m[`${src} ${r.change}`] ?? 0) + 1;
    return m;
  }, {});
  writeReadme({
    claimsBySource,
    subjects: subjectRows.length,
    aliases: aliasRows.length,
    methodCount,
    cross,
    unmapped,
    revCount,
    hcAmbiguous,
    posterAdded,
    verdicts: verdicts.length,
    evidence: evidence.length,
    editions: editions.length,
    skippedTotals,
    phaseChecks,
  });
  writeJson(join(OUT, "summary.json"), {
    claims: Object.fromEntries([...claimsBySource].map(([k, v]) => [k, v.length])),
    subjects: subjectRows.length,
    aliases: methodCount,
    cross_source: cross.map(([id, s]) => ({ subject_id: id, sources: [...s].sort() })),
    revisions: revCount,
    unmapped,
  });
  writeProgress();
  if (failures.length > 0) {
    console.error(`normalize failed closed:\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}

interface ReadmeInput {
  claimsBySource: Map<string, ClaimRow[]>;
  subjects: number;
  aliases: number;
  methodCount: Record<string, number>;
  cross: [string, Set<string>][];
  unmapped: string[];
  revCount: Record<string, number>;
  hcAmbiguous: number;
  posterAdded: number;
  verdicts: number;
  evidence: number;
  editions: number;
  skippedTotals: Record<string, Record<string, number>>;
  phaseChecks: PhaseCheck[];
}

function writeReadme(r: ReadmeInput): void {
  const total = [...r.claimsBySource.values()].reduce((n, c) => n + c.length, 0);
  const lines = [
    "# Normalized data",
    "",
    "Generated by `pnpm normalize` from `data/raw/`. Do not edit the tables by hand. The files you may edit are `subject-curation.json` (subject judgments) and `hype-cycle-phase-boundaries.json` (measured data). `ids.json` and `subject-aliases.json` are registries: the command reads them and only adds to them.",
    "",
    "## Tables",
    "",
    "| File | Rows | Shape (src/schema.ts) |",
    "|---|---|---|",
    `| claims/<source>.json | ${total} | Claim |`,
    `| sources.json | ${r.claimsBySource.size} | Source |`,
    `| source_editions.json | ${r.editions} | SourceEdition |`,
    "| institutions.json | see file | Institution |",
    `| subjects.json | ${r.subjects} | Subject |`,
    `| subject-aliases.json | ${r.aliases} | SubjectAlias |`,
    `| subject-text.json | ${r.subjects} | SubjectText (embedding input for research links, D48) |`,
    `| revisions.json | ${Object.values(r.revCount).reduce((a, b) => a + b, 0)} | Revision |`,
    `| verdicts.json | ${r.verdicts} | VerdictRow (grader 1 of 2, Envisioning posters only; D7) |`,
    `| evidence.json | ${r.evidence} | Evidence |`,
    "| hype-cycle-phase-boundaries.json | 13 editions | HypePhaseBoundaries |",
    "| ids.json | registry | see below |",
    "",
    "Claims per source:",
    "",
    "| Source | Claims | Rows skipped (not claims) |",
    "|---|---|---|",
    ...[...r.claimsBySource].map(
      ([s, c]) =>
        `| ${s} | ${c.length} | ${
          Object.entries(r.skippedTotals[s] ?? {})
            .map(([k, v]) => `${v} ${k}`)
            .join("; ") || "0"
        } |`,
    ),
    "",
    "## Claim ids",
    "",
    ID_RULE,
    "",
    "The natural key per source is listed in `PROGRESS.md`.",
    "",
    "## Subjects",
    "",
    "- Economic and energy series map to deterministic subjects defined in `src/normalize/quantities.ts` (for example `world-real-gdp-growth`, `brazil-ipca-inflation`, `global-solar-pv-installed-capacity`). The same economy and measure from any publisher gets the same id. A different measure of a close quantity gets its own id and a `related` link, and the difference is in `notes`.",
    "- Publisher labels (technologies, risks, prose metrics) map through `subject-aliases.json`. A label is first matched exactly, then by a normalized key (case, accents, punctuation and a final plural ignored). Judgment merges and related links come from `subject-curation.json`, each with a one-line reason. Otherwise a label names a new subject.",
    `- Alias methods: ${Object.entries(r.methodCount)
      .map(([k, v]) => `${k} ${v}`)
      .join(", ")}.`,
    "- A claim can have several subjects: a quantity and the technology it measures (for example BNEF sales forecasts carry `global-passenger-ev-sales` and `electric-vehicles`).",
    "",
    "## Hype Cycle phases",
    "",
    "Editions 2005 to 2017 carry chart positions but no phase. `hype-cycle-phase-boundaries.json` holds the four phase boundaries per edition, measured on each chart in the frame of the positions (0 = expectations axis, 100 = tip of the time axis). The measured boundaries of 2006 to 2017 vary by less than 0.7 points; the 2005 chart draws no boundaries, so 2005 uses their mean. Each claim's phase is derived from its `x_time`; a phase within 0.5 points of a boundary carries a note. Where the raw file has a phase read on the chart (2016), that phase is kept.",
    "",
    ...r.phaseChecks.flatMap((c) => [
      `- ${c.edition} cross-check: ${c.agree} of ${c.compared} phases read on the chart agree with the derived phase.`,
      ...c.disagreements.map((d) => `  - ${d.label}: read ${d.raw}, derived ${d.derived} (x ${d.x}, on the boundary).`),
    ]),
    "- Entries from 1995 to 1998 have no time-to-plateau band: they are positions, not forecasts, and cannot be graded on timing.",
    "",
    "## Cross-source subjects (3 or more sources)",
    "",
    ...(r.cross.length === 0 ? ["None."] : r.cross.map(([id, s]) => `- \`${id}\`: ${[...s].sort().join(", ")}`)),
    "",
    "## Unmapped labels",
    "",
    ...(r.unmapped.length === 0 ? ["None."] : r.unmapped.map((u) => `- ${u}`)),
    "",
    "## Revisions",
    "",
    ...Object.entries(r.revCount).map(([k, v]) => `- ${k}: ${v}`),
    `- Hype Cycle subject-edition pairs skipped because one edition has two entries for the subject: ${r.hcAmbiguous}.`,
    `- Poster "added" rows (not a revision type): ${r.posterAdded}.`,
    "",
    "## Re-run",
    "",
    "```",
    "pnpm normalize",
    "```",
    "",
    "The command processes every `data/raw/<source>/` with an INDEX.md, no edition in progress in PROGRESS.md, and an adapter in `src/normalize/sources/`. Other sources are listed in PROGRESS.md as not yet captured. Existing claim ids and subject mappings never change. A source with an invalid row is not written; its errors go to `errors/<source>.txt` and the command exits non-zero.",
    "",
  ];
  writeText(join(OUT, "README.md"), lines.join("\n"));
}

main();
