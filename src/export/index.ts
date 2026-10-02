/**
 * export (#3): write the published dataset to data/out, one file per table in JSON and CSV,
 * a JSON Schema per table generated from src/schema.ts, and a Frictionless datapackage.json.
 * Reads published rows only. Every row is validated with Zod first; one invalid row stops the
 * export and nothing is written (fail closed). The `validation` table (D44) carries the agreement,
 * audit and interval figures per source. Run with `pnpm export`. Tagging the release is a
 * separate, deliberate step (AGENTS.md).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Claim, Institution, NumericGrade, PublishedVerdict, Revision, Source, SourceEdition, Subject, SubjectAlias, ValidationRow } from "../schema.ts";
import { OUT as NORMALIZED, RAW, REPO } from "../normalize/lib.ts";
import { validationTable } from "./validation.ts";

const OUT = join(REPO, "data", "out");
const GRADED = join(REPO, "data", "graded", "numeric");
const read = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));

interface Table {
  name: string;
  title: string;
  schema: ZodTypeAny;
  rows: Record<string, unknown>[];
  licence?: "ODbL-1.0";
}

function claimsTable(): Record<string, unknown>[] {
  const dir = join(NORMALIZED, "claims");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => (read(join(dir, f)) as Record<string, unknown>[]).filter((c) => c.published === true));
}

function verdictsTable(): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (const source of readdirSync(RAW).sort()) {
    const f = join(RAW, source, "final-d20.json");
    if (!existsSync(f)) continue;
    const fin = read(f) as { rule: string; verdicts: { id: string; verdict: string; status: string; was?: string; reason?: string }[] };
    for (const v of fin.verdicts) {
      // D15, D37: the Envisioning posters keep their raw id numbers (et-2012-045 is envisioning-technology-2012-045,
      // edu-2012-007 envisioning-education-2012-007, health-, hz- likewise; src/normalize/sources/envisioning.ts).
      const claimId = source.startsWith("envisioning-") ? v.id.replace(/^[a-z]+-(?=\d{4}-\d+$)/, `${source}-`) : v.id;
      const row: Record<string, unknown> = { claim_id: claimId, source_id: source, verdict: v.verdict, status: v.status, rule: fin.rule };
      if (v.was) row.was = v.was;
      if (v.reason) row.reason = v.reason;
      rows.push(row);
    }
  }
  return rows;
}

function numericTable(): Record<string, unknown>[] {
  return readdirSync(GRADED)
    .filter((f) => f.endsWith(".json") && f !== "summary.json" && f !== "comparison.json")
    .sort()
    .flatMap((f) => read(join(GRADED, f)) as Record<string, unknown>[]);
}

function csvCell(v: unknown): string {
  if (v === undefined || v === null) return "";
  const s = Array.isArray(v) ? v.join(";") : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return `${[cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n")}\n`;
}

function main(): void {
  const validation = validationTable();
  const tables: Table[] = [
    { name: "sources", title: "Publication series", schema: Source, rows: read(join(NORMALIZED, "sources.json")) as Record<string, unknown>[] },
    { name: "institutions", title: "Publishers", schema: Institution, rows: read(join(NORMALIZED, "institutions.json")) as Record<string, unknown>[] },
    { name: "source_editions", title: "Editions", schema: SourceEdition, rows: read(join(NORMALIZED, "source_editions.json")) as Record<string, unknown>[] },
    { name: "subjects", title: "Subjects", schema: Subject, rows: read(join(NORMALIZED, "subjects.json")) as Record<string, unknown>[] },
    { name: "subject_aliases", title: "Publisher labels mapped to subjects (D13)", schema: SubjectAlias, rows: read(join(NORMALIZED, "subject-aliases.json")) as Record<string, unknown>[] },
    { name: "claims", title: "Claims (published)", schema: Claim, rows: claimsTable() },
    { name: "revisions", title: "Revisions between editions", schema: Revision, rows: read(join(NORMALIZED, "revisions.json")) as Record<string, unknown>[] },
    { name: "verdicts", title: "Published verdicts of judgment sources (D20)", schema: PublishedVerdict, rows: verdictsTable() },
    { name: "numeric_grades", title: "Numeric grades (D19)", schema: NumericGrade, rows: numericTable() },
    { name: "validation", title: "Validation figures per source: agreement, audit and intervals (D11, D28, D44); alphabetical, never ranked", schema: ValidationRow, rows: validation.rows },
  ];

  const errors: string[] = [];
  const claimIds = new Set(tables.find((t) => t.name === "claims")?.rows.map((c) => c.id));
  for (const t of tables) {
    t.rows.forEach((r, i) => {
      const p = t.schema.safeParse(r);
      if (!p.success) errors.push(`${t.name}[${i}]: ${p.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
    });
  }
  for (const t of tables.filter((x) => x.name === "verdicts" || x.name === "numeric_grades"))
    for (const r of t.rows) if (!claimIds.has(r.claim_id)) errors.push(`${t.name}: ${String(r.claim_id)} is not a published claim`);
  if (errors.length > 0) {
    console.error(`export failed closed, ${errors.length} invalid rows:\n${errors.slice(0, 50).join("\n")}`);
    process.exitCode = 1;
    return;
  }

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "schemas"), { recursive: true });
  const resources = [];
  for (const t of tables) {
    writeFileSync(join(OUT, `${t.name}.json`), `${JSON.stringify(t.rows, null, 1)}\n`);
    writeFileSync(join(OUT, `${t.name}.csv`), toCsv(t.rows));
    writeFileSync(join(OUT, "schemas", `${t.name}.schema.json`), `${JSON.stringify(zodToJsonSchema(t.schema, { name: t.name, $refStrategy: "none" }), null, 1)}\n`);
    for (const format of ["json", "csv"] as const)
      resources.push({ name: `${t.name}-${format}`, title: t.title, path: `${t.name}.${format}`, format, mediatype: format === "json" ? "application/json" : "text/csv", jsonSchema: `schemas/${t.name}.schema.json`, rows: t.rows.length });
  }
  const pkg = {
    name: "envisioning-hindsight",
    title: "Envisioning Hindsight: published forecasts, graded against what happened",
    homepage: "https://github.com/envisioning/hindsight",
    licenses: [
      { name: "CC-BY-4.0", path: "https://creativecommons.org/licenses/by/4.0/", title: "Creative Commons Attribution 4.0" },
      { name: "ODbL-1.0", path: "https://opendatacommons.org/licenses/odbl/1-0/", title: "Open Database License 1.0 (rows of bcb-focus only, see NOTICE.md)" },
    ],
    created: new Date().toISOString(),
    resources,
  };
  writeFileSync(join(OUT, "datapackage.json"), `${JSON.stringify(pkg, null, 1)}\n`);
  for (const t of tables) console.log(`${t.name}: ${t.rows.length} rows`);
  for (const w of validation.warnings) console.error(`validation warning: ${w}`);
}

main();
