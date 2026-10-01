/**
 * Tier 2 sources (issue #52): Eurasia Group Top Risks, The Economist's The
 * World in / The World Ahead, Ray Kurzweil's dated predictions, and the Pew
 * Research Center / Elon University expert canvassings. One claim per raw
 * entry; ids follow D15 (first assignment = position in `entries`).
 */
import { join } from "node:path";
import { type Bundle, type Raw, RAW, clean, editionFiles, editionId, firstUrl, fit, readJson, str, year } from "../lib.ts";

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

function quoteKey(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

// ---------------------------------------------------------------- Eurasia Group Top Risks

const EURASIA_RANKING: Record<string, string> = {
  "top risks": "top risk",
  "red herrings": "red herring (a risk Eurasia Group expects to be overstated)",
  "long-term risks": "long-term risk",
  wildcard: "wildcard",
};

export function eurasiaTopRisks(): Bundle {
  const source = "eurasia-top-risks";
  const b: Bundle = {
    source: { id: source, publisher_id: "eurasia-group", series: "Top Risks", url: "https://www.eurasiagroup.net/issues/top-risks-2026" },
    institution: { id: "eurasia-group", name: "Eurasia Group", kind: "company", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "ranking | label",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const label = String(e.label);
      const ranking = String(e.ranking);
      const ranked = e.rank !== null && e.rank !== undefined && ranking === "top risks";
      const role = `${EURASIA_RANKING[ranking] ?? ranking}${ranked ? ` ${e.rank}` : ""}`;
      const dated = e.horizon === "calendar year";
      b.drafts.push({
        key: `${ranking}|${label}`,
        index: i + 1,
        edition: ed,
        labels: [{ label, kind: "risk" }],
        quantityIds: [],
        claim: clean({
          quote: str(e.quote),
          statement: fit(`Eurasia Group Top Risks ${ed}, ${role}: ${label}. ${String(e.summary ?? "")}`.trim()),
          statement_generated: true,
          position: [ranking, e.rank === null || e.rank === undefined ? "not ranked" : `${ranked ? "rank" : "printed order"} ${e.rank}`].join("; "),
          claim_type: "forecast" as const,
          target_date: dated ? ed : undefined,
          horizon_band: dated ? undefined : str(e.horizon),
          note: joinNotes(str(e.quote) ? undefined : "No verbatim quote captured; the statement is Hindsight's summary.", str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- The Economist: The World Ahead

const ECONOMIST_KIND: Record<string, string> = {
  article: "article",
  editor_letter: "editor's introduction",
  press_release: "launch press release",
  recalled_in_self_review: "prediction restated in a later Economist review",
};

export function economistWorldAhead(): Bundle {
  const source = "economist-world-ahead";
  const b: Bundle = {
    source: { id: source, publisher_id: "the-economist", series: "The World in / The World Ahead", url: "https://www.economist.com/the-world-ahead" },
    institution: { id: "the-economist", name: "The Economist Group", kind: "company", country: "GBR" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "kind | subject | quote with case, spaces and punctuation removed",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const quote = String(e.quote);
      const kind = String(e.kind);
      b.drafts.push({
        key: `${kind}|${e.subject}|${quoteKey(quote)}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "other" }],
        quantityIds: [],
        claim: clean({
          quote,
          position: `${d.series ?? `The World in ${ed}`}, ${ECONOMIST_KIND[kind] ?? kind}${e.rank !== null && e.rank !== undefined ? `, item ${e.rank}` : ""}`,
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

// ---------------------------------------------------------------- Ray Kurzweil

export function kurzweil(): Bundle {
  const source = "kurzweil";
  const b: Bundle = {
    source: { id: source, publisher_id: "ray-kurzweil", series: "Dated predictions in books and essays", url: "https://www.thekurzweillibrary.com/images/How-My-Predictions-Are-Faring.pdf" },
    institution: { id: "ray-kurzweil", name: "Ray Kurzweil", kind: "author", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "target_year | quote (or paraphrase) with case, spaces and punctuation removed",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      const quote = str(e.quote);
      const paraphrase = str(e.paraphrase);
      const text = quote ?? paraphrase ?? String(e.subject);
      const earliest = year(e.target_year_earliest);
      b.drafts.push({
        key: `${e.target_year ?? ""}|${quoteKey(text)}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote,
          statement: quote === undefined ? fit(paraphrase ?? `Kurzweil ${ed}: ${e.subject}.`) : undefined,
          statement_generated: quote === undefined ? true : undefined,
          position: [str(d.title), str(e.section), str(e.position)].filter(Boolean).join("; "),
          claim_type: "forecast" as const,
          metric: str(e.metric),
          value: str(e.value),
          unit: str(e.unit),
          direction: "arrive" as const,
          target_date: year(e.target_year),
          hedge: str(e.timing),
          note: joinNotes(
            quote === undefined ? "No verbatim quote found; the statement is a paraphrase." : undefined,
            earliest ? `Range: ${earliest} to ${e.target_year}.` : undefined,
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

// ---------------------------------------------------------------- Pew Research Center / Elon University

function pewStatement(e: Raw): string {
  const fmt = String(e.question_format);
  const other = e.share_other && typeof e.share_other === "object" ? Object.entries(e.share_other as Record<string, number>).map(([k, v]) => `${v}% ${k.replaceAll("_", " ")}`) : [];
  const [yes, no] = fmt === "yes_no" ? ["yes", "no"] : ["agree", "disagree"];
  const shares = [`${e.share_agree}% ${yes}`, `${e.share_disagree}% ${no}`, ...other].join(", ");
  const view = e.majority_view === "agree" ? yes : e.majority_view === "disagree" ? no : String(e.majority_view);
  let reading: string;
  if (fmt === "tension_pair") reading = view === "agree" ? "the first scenario (quoted)" : "the second scenario (option B)";
  else if (str(e.answer_mapping)) reading = `${view} (${e.answer_mapping})`;
  else reading = view;
  return fit(`Expert canvassing, ${e.label}: ${shares} of ${e.respondents} respondents. Majority view: ${reading}.`);
}

export function pewElonImagining(): Bundle {
  const source = "pew-elon-imagining";
  const b: Bundle = {
    source: { id: source, publisher_id: "pew-research-center", series: "Future of the Internet expert canvassings (Imagining the Internet)", url: "https://www.pewresearch.org/topic/internet-technology/technology-policy-issues/future-of-the-internet-canvassing/" },
    institution: { id: "pew-research-center", name: "Pew Research Center, with Elon University's Imagining the Internet Center", kind: "research_firm", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "label",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(edRow(source, d));
    (d.entries as Raw[]).forEach((e, i) => {
      b.drafts.push({
        key: String(e.label),
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "other" }],
        quantityIds: [],
        claim: clean({
          quote: String(e.quote),
          statement: pewStatement(e),
          statement_generated: true,
          position: `${d.report ?? d.series}; question format ${e.question_format}`,
          claim_type: "forecast" as const,
          metric: "majority view of the expert panel",
          value: String(e.majority_view),
          target_date: year(e.target_year),
          note: joinNotes(str(e.option_b) ? `Option B: "${e.option_b}"` : undefined, str(e.note), conf(e)),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}
