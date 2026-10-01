/**
 * Trend lists and scenario sets captured 2026-10-01 (#26 to #34): McKinsey Technology Trends
 * Outlook, Accenture Technology Vision, Deloitte Tech Trends, trendwatching, a16z Big Ideas,
 * FTSG Tech Trends (trends, D6), NIC Global Trends, Shell scenarios and IPCC pathways
 * (scenarios, D6: graded on coverage only). One claim per raw entry; ids follow D15. Rows
 * outside `entries` (Accenture's 2017 predictions box) follow the last entry.
 */
import { join } from "node:path";
import type { Institution, Source } from "../../schema.ts";
import { type Bundle, type LabelRef, type Raw, RAW, clean, editionFiles, editionId, firstUrl, fit, num, readJson, str, year } from "../lib.ts";

type ClaimBody = Bundle["drafts"][number]["claim"];

function edRow(source: string, d: Raw) {
  const ed = String(d.edition);
  const sources = Array.isArray(d.sources) ? (d.sources as string[]) : [];
  return clean({ id: editionId(source, ed), source_id: source, edition: ed, published: String(d.published ?? ed), url: firstUrl(sources) });
}

function joinNotes(...parts: (string | undefined | null | false)[]): string | undefined {
  const p = parts.filter((s): s is string => typeof s === "string" && s.length > 0);
  return p.length > 0 ? fit(p.join(" ")) : undefined;
}

function conf(e: Raw): string | undefined {
  return e.confidence && e.confidence !== "high" ? `Extraction confidence: ${e.confidence}.` : undefined;
}

interface Spec {
  source: Source;
  institution: Institution;
  keyRule: string;
  /** Natural key of an entry, unique within its edition. */
  key: (e: Raw) => string;
  labels: (e: Raw) => LabelRef[];
  claim: (e: Raw, d: Raw, ed: string) => ClaimBody;
  /** Rows outside `entries` that are claims too, in print order. */
  extra?: (d: Raw) => Raw[];
}

function build(spec: Spec): Bundle {
  const id = spec.source.id;
  const b: Bundle = { source: spec.source, institution: spec.institution, editions: [], drafts: [], skipped: {}, keyRule: spec.keyRule };
  for (const f of editionFiles(id)) {
    const d = readJson(join(RAW, id, f));
    const ed = String(d.edition);
    b.editions.push(edRow(id, d));
    const rows = [...((d.entries ?? []) as Raw[]), ...(spec.extra ? spec.extra(d) : [])];
    rows.forEach((e, i) => {
      b.drafts.push({ key: spec.key(e), index: i + 1, edition: ed, labels: spec.labels(e), quantityIds: [], claim: spec.claim(e, d, ed) });
    });
  }
  return b;
}

const lc = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** A trend entry: claim type trend unless the entry is a dated forecast. */
function trendClaim(e: Raw, d: Raw, ed: string, publisher: string, forecast = false): ClaimBody {
  const label = String(e.label);
  const quote = str(e.quote);
  return clean({
    quote,
    statement: quote === undefined ? fit(`${publisher} ${ed}: ${label}${e.section ? ` (${e.section})` : ""}.`) : undefined,
    statement_generated: quote === undefined ? true : undefined,
    position: [str(e.section), str(e.subsection), e.rank !== null && e.rank !== undefined ? `item ${e.rank}` : undefined, str(e.author) ? `by ${e.author}` : undefined].filter(Boolean).join("; ") || undefined,
    claim_type: forecast ? ("forecast" as const) : ("trend" as const),
    metric: str(e.metric),
    value: e.value === null || e.value === undefined ? undefined : String(e.value),
    unit: str(e.unit),
    target_date: year(e.target_year),
    horizon_band: str(e.horizon),
    note: joinNotes(label !== quote ? `Trend label: ${label}.` : undefined, str(e.note), conf(e)),
    status: "open" as const,
    published: true,
  });
}

const techLabel = (e: Raw): LabelRef[] => [{ label: String(e.subject ?? e.label), kind: "technology" }];

export function mckinseyTechTrends(): Bundle {
  return build({
    source: { id: "mckinsey-tech-trends", publisher_id: "mckinsey", series: "Technology Trends Outlook", url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-top-trends-in-tech" },
    institution: { id: "mckinsey", name: "McKinsey & Company", kind: "company", country: "USA" },
    keyRule: "kind + label + quote with case and punctuation removed",
    key: (e) => `${e.kind}|${lc(e.label)}|${lc(e.quote)}`,
    labels: techLabel,
    claim: (e, d, ed) => trendClaim(e, d, ed, "McKinsey Technology Trends Outlook", e.kind === "forecast"),
  });
}

export function accentureTechVision(): Bundle {
  return build({
    source: { id: "accenture-tech-vision", publisher_id: "accenture", series: "Technology Vision", url: "https://www.accenture.com/us-en/insights/technology/technology-trends-2025" },
    institution: { id: "accenture", name: "Accenture plc", kind: "company", country: "IRL" },
    keyRule: "entries: label; 2017 predictions box: prediction + quote with case and punctuation removed",
    key: (e) => (e._prediction ? `prediction|${lc(e.quote)}` : lc(e.label)),
    labels: techLabel,
    // The 2017 PREDICTIONS box: each prediction belongs to the trend with rank `trend_rank`.
    extra: (d) =>
      ((d.predictions ?? []) as Raw[]).map((p) => {
        const t = ((d.entries ?? []) as Raw[]).find((e) => e.rank === p.trend_rank);
        if (t === undefined) throw new Error(`accenture-tech-vision ${d.edition}: prediction for unknown trend ${p.trend_rank}`);
        return { ...p, label: t.label, subject: t.subject, section: `trend ${t.rank}: ${t.label}`, _prediction: true };
      }),
    claim: (e, d, ed) => {
      const c = trendClaim(e, d, ed, "Accenture Technology Vision", Boolean(e._prediction));
      return e._prediction ? { ...c, position: [c.position, "PREDICTIONS box"].filter(Boolean).join("; ") } : c;
    },
  });
}

export function deloitteTechTrends(): Bundle {
  return build({
    source: { id: "deloitte-tech-trends", publisher_id: "deloitte", series: "Tech Trends", url: "https://www2.deloitte.com/us/en/insights/focus/tech-trends.html" },
    institution: { id: "deloitte", name: "Deloitte Touche Tohmatsu Limited", kind: "company" },
    keyRule: "section + label",
    key: (e) => `${lc(e.section)}|${lc(e.label)}`,
    labels: techLabel,
    claim: (e, d, ed) => trendClaim(e, d, ed, "Deloitte Tech Trends"),
  });
}

export function trendwatching(): Bundle {
  return build({
    source: { id: "trendwatching", publisher_id: "trendwatching", series: "Annual consumer trends", url: "https://www.trendwatching.com/" },
    institution: { id: "trendwatching", name: "TrendWatching", kind: "company" },
    keyRule: "section + label",
    key: (e) => `${lc(e.section)}|${lc(e.label)}`,
    labels: (e) => [{ label: String(e.subject ?? e.label), kind: "other" }],
    claim: (e, d, ed) => trendClaim(e, d, ed, "trendwatching"),
  });
}

export function a16zBigIdeas(): Bundle {
  return build({
    source: { id: "a16z-big-ideas", publisher_id: "andreessen-horowitz", series: "Big Ideas", url: "https://a16z.com/big-ideas-in-tech-2026/" },
    institution: { id: "andreessen-horowitz", name: "Andreessen Horowitz (a16z)", kind: "company", country: "USA" },
    keyRule: "label + author",
    key: (e) => `${lc(e.label)}|${lc(e.author)}`,
    labels: techLabel,
    claim: (e, d, ed) => trendClaim(e, d, ed, "a16z Big Ideas"),
  });
}

export function ftsgTechTrends(): Bundle {
  return build({
    source: { id: "ftsg-tech-trends", publisher_id: "future-today-strategy-group", series: "Tech Trends Report", url: "https://ftsg.com/" },
    institution: { id: "future-today-strategy-group", name: "Future Today Strategy Group (formerly Future Today Institute)", kind: "research_firm", country: "USA" },
    keyRule: "section + subsection + label + rank",
    key: (e) => `${lc(e.section)}|${lc(e.subsection)}|${lc(e.label)}|${e.rank}`,
    labels: techLabel,
    claim: (e, d, ed) => {
      const c = trendClaim(e, d, ed, "FTSG Tech Trends");
      return e.years_on_list ? { ...c, note: joinNotes(c.note, `Printed: ${e.years_on_list} year on the list.`) } : c;
    },
  });
}

// ---------------------------------------------------------------- scenario sets

function scenarioClaim(e: Raw, publisher: string, ed: string): ClaimBody {
  const kind = String(e.kind);
  const quote = str(e.quote);
  const scen = str(e.scenario) ?? str(e.label);
  const value = e.value === null || e.value === undefined ? undefined : String(e.value);
  const statement =
    kind === "pathway"
      ? `${publisher} ${ed}, scenario ${scen}: ${e.metric}${value !== undefined ? ` ${num(e.value)} ${e.unit ?? ""}`.trimEnd() : ""} in ${e.target_year}.`
      : `${publisher} ${ed}: scenario ${scen}.`;
  return clean({
    quote,
    statement: quote === undefined ? fit(statement) : undefined,
    statement_generated: quote === undefined ? true : undefined,
    position: [kind, scen ? `scenario ${scen}` : undefined, str(e.family) ? `family ${e.family}` : undefined, str(e.position)].filter(Boolean).join("; "),
    claim_type: "scenario" as const,
    metric: str(e.metric),
    value,
    unit: str(e.unit),
    target_date: year(e.target_year),
    note: joinNotes(e.base_year ? "Base-year value (harmonised history), not a projection." : undefined, str(e.published_in) ? `Value as printed in ${e.published_in}.` : undefined, str(e.note), conf(e)),
    status: "open" as const,
    published: true,
  });
}

export function nicGlobalTrends(): Bundle {
  return build({
    source: { id: "nic-global-trends", publisher_id: "us-national-intelligence-council", series: "Global Trends", url: "https://www.dni.gov/index.php/gt2040-home" },
    institution: { id: "us-national-intelligence-council", name: "US National Intelligence Council", kind: "government", country: "USA" },
    keyRule: "kind + label + quote with case and punctuation removed",
    key: (e) => `${e.kind}|${lc(e.label)}|${lc(e.quote)}`,
    labels: (e) => [{ label: String(e.subject ?? e.label), kind: "other" }],
    claim: (e, d, ed) => {
      if (e.kind === "scenario") return scenarioClaim(e, "NIC Global Trends", ed);
      // A projection in the NIC's own voice is a forecast (D6), graded on its own words.
      return {
        ...trendClaim(e, d, ed, "NIC Global Trends", true),
        position: `projection; ${String(d.title ?? d.series ?? "Global Trends")}`,
      };
    },
  });
}

export function shellScenarios(): Bundle {
  return build({
    source: { id: "shell-scenarios", publisher_id: "shell", series: "Shell scenarios", url: "https://www.shell.com/news-and-insights/scenarios.html" },
    institution: { id: "shell", name: "Shell plc", kind: "company", country: "GBR" },
    keyRule: "kind + scenario or label + metric + target_year",
    key: (e) => `${e.kind}|${lc(e.scenario ?? e.label)}|${lc(e.metric)}|${e.target_year ?? ""}|${lc(e.subject)}`,
    labels: (e) => [{ label: String(e.subject ?? e.label), kind: e.kind === "pathway" ? "quantity" : "other" }],
    claim: (e, d, ed) => scenarioClaim(e, "Shell scenarios", ed),
  });
}

export function ipccPathways(): Bundle {
  return build({
    source: { id: "ipcc-pathways", publisher_id: "ipcc", series: "Emission scenarios and pathways", url: "https://www.ipcc.ch/" },
    institution: { id: "ipcc", name: "Intergovernmental Panel on Climate Change", kind: "igo", country: "CHE" },
    keyRule: "kind + scenario + metric + target_year",
    key: (e) => `${e.kind}|${lc(e.scenario)}|${lc(e.metric)}|${e.target_year ?? ""}`,
    labels: (e) => [{ label: String(e.subject), kind: e.kind === "pathway" ? "quantity" : "other" }],
    claim: (e, d, ed) => scenarioClaim(e, "IPCC", ed),
  });
}

