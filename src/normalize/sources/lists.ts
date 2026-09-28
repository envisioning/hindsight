/**
 * Technology lists with one claim per entry: MIT Technology Review 10
 * Breakthrough Technologies, Gartner Top Strategic Predictions, ARK Invest
 * Big Ideas, and the WEF Global Risks Report rankings.
 */
import { join } from "node:path";
import { type Bundle, type LabelRef, type Raw, RAW, clean, firstUrl, editionFiles, editionId, fit, num, readJson, str, year } from "../lib.ts";

function edRow(source: string, d: Raw) {
  const ed = String(d.edition);
  const sources = Array.isArray(d.sources) ? (d.sources as string[]) : [];
  return clean({ id: editionId(source, ed), source_id: source, edition: ed, published: String(d.published ?? ed), url: firstUrl(sources) });
}

function conf(e: Raw): string | undefined {
  return e.confidence && e.confidence !== "high" ? `Extraction confidence: ${e.confidence}.` : undefined;
}

function joinNotes(...parts: (string | undefined | null | false)[]): string | undefined {
  const p = parts.filter((s): s is string => typeof s === "string" && s.length > 0);
  return p.length > 0 ? fit(p.join(" ")) : undefined;
}

// ---------------------------------------------------------------- MIT TR10

export function mitBreakthrough(): Bundle {
  const source = "mit-tr-10-breakthrough";
  const b: Bundle = {
    source: { id: source, publisher_id: "mit-technology-review", series: "10 Breakthrough Technologies", url: "https://www.technologyreview.com/supertopic/tr10-archive/" },
    institution: { id: "mit-technology-review", name: "MIT Technology Review", kind: "company", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "label (exact, as captured); unique within an edition",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const label = String(e.label);
      const horizon = str(e.horizon);
      const band = horizon === undefined ? undefined : horizon.replace(/^(\d+)-(\d+)/, "$1 to $2");
      b.drafts.push({
        key: label,
        index: i + 1,
        edition: ed,
        labels: [{ label, kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote: str(e.quote) ?? label,
          statement: `MIT Technology Review 10 Breakthrough Technologies ${ed}: ${label}${band ? `, availability ${band}` : ""}.`,
          statement_generated: true,
          position: `list position ${e.rank}`,
          claim_type: "forecast" as const,
          horizon_band: band,
          direction: "arrive" as const,
          note: joinNotes(
            str(e.availability) ? `Availability as printed: "${e.availability}".` : "No availability stated: the entry cannot be graded on timing.",
            str(e.note),
            conf(e),
          ),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- Gartner Top Strategic Predictions

function quoteKey(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function gartnerPredictions(): Bundle {
  const source = "gartner-strategic-predictions";
  const b: Bundle = {
    source: { id: source, publisher_id: "gartner", series: "Top Strategic Predictions", url: "https://www.gartner.com/en/newsroom" },
    institution: { id: "gartner", name: "Gartner, Inc.", kind: "research_firm", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "kind | quote with case, spaces and punctuation removed",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const quote = String(e.quote);
      const flag = e.kind === "near_term_flag";
      b.drafts.push({
        key: `${e.kind}|${quoteKey(quote)}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote,
          position: flag ? `near-term flag for prediction ${e.parent_rank}` : `top prediction ${e.rank}`,
          claim_type: "forecast" as const,
          metric: str(e.metric),
          value: str(e.value),
          unit: str(e.unit),
          target_date: year(e.target_year),
          hedge: str(e.timing),
          note: joinNotes(e.target_year ? undefined : "No target year stated.", str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- ARK Big Ideas

/** ARK chapter names that name no subject. */
export const ARK_GENERIC_IDEAS = new Set(["Introduction", "Convergence", "Technological Convergence", "The Great Acceleration"]);

export function arkBigIdeas(): Bundle {
  const source = "ark-big-ideas";
  const b: Bundle = {
    source: { id: source, publisher_id: "ark-invest", series: "Big Ideas", url: "https://www.ark-invest.com/big-ideas-2026" },
    institution: { id: "ark-invest", name: "ARK Investment Management LLC", kind: "company", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "metric | target_year | horizon | value | unit",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const labels: LabelRef[] = [{ label: String(e.subject), kind: "quantity" }];
      const idea = String(e.idea);
      if (!ARK_GENERIC_IDEAS.has(idea)) labels.push({ label: idea, kind: "technology" });
      b.drafts.push({
        key: `${e.metric}|${e.target_year ?? ""}|${e.horizon ?? ""}|${e.value}|${e.unit}`,
        index: i + 1,
        edition: ed,
        labels,
        quantityIds: [],
        claim: clean({
          quote: String(e.quote),
          position: `chapter "${idea}", page ${e.page}`,
          claim_type: "forecast" as const,
          metric: str(e.metric),
          value: str(e.value),
          unit: str(e.unit),
          target_date: year(e.target_year),
          horizon_band: str(e.horizon),
          note: joinNotes(str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- WEF Global Risks Report

const RANKING_TEXT: Record<string, string> = {
  likelihood: "by likelihood",
  impact: "by impact",
  "highest-concern": "by highest concern",
  "severity-10-year": "by severity, 10-year horizon",
  "2-year": "by severity, 2-year horizon",
  "10-year": "by severity, 10-year horizon",
  "current-year": "for the current year",
};

export function wefGlobalRisks(): Bundle {
  const source = "wef-global-risks";
  const b: Bundle = {
    source: { id: source, publisher_id: "wef", series: "Global Risks Report", url: "https://www.weforum.org/publications/series/global-risks-report/" },
    institution: { id: "wef", name: "World Economic Forum", kind: "igo", country: "CHE" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "ranking | rank | label",
    extraAliases: [],
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const label = String(e.label);
      const ranking = String(e.ranking);
      const rankText = RANKING_TEXT[ranking] ?? ranking.replace(/^horizon-/, "as a critical threat in ").replace(/-/g, " ");
      const retro = str(e.label_grr2020_figure);
      if (retro !== undefined && retro !== label)
        b.extraAliases?.push({ label: retro, sameAs: label, kind: "risk", reason: `WEF's own GRR 2020 retrospective figure relabels the ${ed} entry "${label}" as "${retro}".` });
      const scored = e.likelihood_score !== undefined ? `likelihood ${e.likelihood_score} of 4, severity ${e.severity_score} of 4` : undefined;
      b.drafts.push({
        key: `${ranking}|${e.rank ?? ""}|${label}`,
        index: i + 1,
        edition: ed,
        labels: [{ label, kind: "risk" }],
        quantityIds: [],
        claim: clean({
          quote: label,
          statement:
            e.rank === null || e.rank === undefined
              ? `WEF Global Risks ${ed}: ${label}, among the risks with the highest severity (${ranking.replace(/-/g, " ")}), ${scored ?? "no rank printed"}.`
              : `WEF Global Risks Report ${ed}: ${label} ranked ${e.rank} ${rankText}${e.horizon ? ` (horizon ${e.horizon})` : ""}${e.value !== undefined ? `, ${num(e.value)} ${e.unit}` : ""}.`,
          statement_generated: true,
          position: [ranking, e.rank === null || e.rank === undefined ? "no rank printed" : `rank ${e.rank}`, str(e.category), scored].filter(Boolean).join("; "),
          claim_type: "ranking" as const,
          metric: str(e.metric),
          value: e.value === undefined ? undefined : String(e.value),
          unit: str(e.unit),
          horizon_band: str(e.horizon),
          note: joinNotes(str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- Deloitte TMT Predictions

export function deloittePredictions(): Bundle {
  const source = "deloitte-tmt-predictions";
  const b: Bundle = {
    source: { id: source, publisher_id: "deloitte", series: "Technology, Media & Telecommunications Predictions", url: "https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions.html" },
    institution: { id: "deloitte", name: "Deloitte Touche Tohmatsu Limited", kind: "company" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "section | quote with case, spaces and punctuation removed",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const quote = String(e.quote);
      b.drafts.push({
        key: `${e.section}|${quoteKey(quote)}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote,
          position: `${e.section}, ${e.rank}: "${fit(String(e.title), 200)}"`,
          claim_type: "forecast" as const,
          metric: str(e.metric),
          value: str(e.value),
          unit: str(e.unit),
          target_date: year(e.target_year),
          note: joinNotes(e.target_year ? undefined : "No target year stated.", str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- IDC FutureScape

export function idcFuturescape(): Bundle {
  const source = "idc-futurescape";
  const b: Bundle = {
    source: { id: source, publisher_id: "idc", series: "IDC FutureScape", url: "https://www.idc.com/research/futurescape" },
    institution: { id: "idc", name: "International Data Corporation (IDC)", kind: "research_firm", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "futurescape | quote with case, spaces and punctuation removed",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const quote = String(e.quote);
      b.drafts.push({
        key: `${e.futurescape}|${quoteKey(quote)}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote,
          position: `${e.futurescape} FutureScape, prediction ${e.rank}${e.idc_label ? ` (${e.idc_label})` : ""}`,
          claim_type: "forecast" as const,
          metric: str(e.metric),
          value: str(e.value),
          unit: str(e.unit),
          target_date: year(e.target_year),
          hedge: str(e.timing),
          note: joinNotes(e.target_year ? undefined : "No target year stated.", str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}
