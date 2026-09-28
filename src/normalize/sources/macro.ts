/**
 * Macroeconomic forecast tables: OECD Economic Outlook, World Bank GEP, Fed
 * SEP, ECB staff projections, CBO, OBR. One claim per forecast value, with a
 * generated statement (D12). Subjects are deterministic (quantities.ts), so
 * the same economy and measure compare across publishers.
 */
import { join } from "node:path";
import type { Institution, Source } from "../../schema.ts";
import { type Bundle, type Draft, type Raw, RAW, clean, editionFiles, editionId, firstUrl, fit, num, readJson, str, year } from "../lib.ts";
import { quantity } from "../quantities.ts";

interface Row {
  key: string;
  subject: string;
  statement: string;
  position?: string | undefined;
  metric: string;
  unit: string;
  target?: string | undefined;
  band?: string | undefined;
  hedge?: string | undefined;
  note?: string[];
}

/** Run one table source. `row` returns a Row, or a string with the reason the entry is not a claim. */
function table(source: Source, institution: Institution, keyRule: string, row: (e: Raw, ed: string, d: Raw) => Row | string): Bundle {
  const b: Bundle = { source, institution, editions: [], drafts: [], skipped: {}, keyRule };
  for (const f of editionFiles(source.id)) {
    const d = readJson(join(RAW, source.id, f));
    const ed = String(d.edition);
    const entries = (d.entries ?? []) as Raw[];
    if (entries.length === 0) continue;
    b.editions.push(clean({ id: editionId(source.id, ed), source_id: source.id, edition: ed, published: String(d.published ?? ed), url: firstUrl(d.sources) }));
    entries.forEach((e, i) => {
      const r = row(e, ed, d);
      if (typeof r === "string") {
        b.skipped[r] = (b.skipped[r] ?? 0) + 1;
        return;
      }
      const notes = [...(r.note ?? []), str(e.note), e.confidence && e.confidence !== "high" ? `Extraction confidence: ${e.confidence}.` : undefined].filter(
        (s): s is string => s !== undefined && s.length > 0,
      );
      const draft: Draft = {
        key: r.key,
        index: i + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(r.subject)],
        claim: clean({
          statement: fit(r.statement),
          statement_generated: true,
          position: r.position,
          claim_type: "forecast" as const,
          metric: r.metric,
          value: e.value === null || e.value === undefined ? undefined : String(e.value),
          unit: r.unit,
          target_date: r.target,
          horizon_band: r.band,
          hedge: r.hedge,
          note: notes.length > 0 ? fit(notes.join(" ")) : undefined,
          status: "open" as const,
          published: true,
        }),
      };
      b.drafts.push(draft);
    });
  }
  return b;
}

const pct = (v: unknown, unit: string) => (unit.startsWith("%") ? `${num(v)}%` : `${num(v)} ${unit}`);

// ---------------------------------------------------------------- shared GDP tables (OECD, World Bank)

const GDP_ECONOMY: Record<string, string> = {
  "United States": "united-states-real-gdp-growth",
  "Euro area": "euro-area-real-gdp-growth",
  China: "china-real-gdp-growth",
  India: "india-real-gdp-growth",
  Brazil: "brazil-real-gdp-growth",
  Japan: "japan-real-gdp-growth",
  Germany: "germany-real-gdp-growth",
  "United Kingdom": "united-kingdom-real-gdp-growth",
};

function gdpTable(source: Source, institution: Institution, label: (ed: string) => string, special: Record<string, string>): Bundle {
  return table(source, institution, "economy name | target_year | horizon", (e, ed) => {
    const economy = String(e.economy);
    const subject = special[economy] ?? GDP_ECONOMY[economy];
    if (subject === undefined) throw new Error(`${source.id} ${ed}: no subject for economy ${economy}`);
    return {
      key: `${economy}|${e.target_year}|${e.horizon}`,
      subject,
      statement: `${label(ed)}: ${economy} real GDP growth in ${e.target_year}, ${pct(e.value, String(e.unit))}`,
      position: `${e.horizon}; ${e.label}`,
      metric: String(e.metric),
      unit: String(e.unit),
      target: year(e.target_year),
    };
  });
}

const MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthLabel = (ed: string) => (/^\d{4}-\d{2}$/.test(ed) ? `${MONTH[Number(ed.slice(5))]} ${ed.slice(0, 4)}` : ed);

export function oecdOutlook(): Bundle {
  return gdpTable(
    { id: "oecd-economic-outlook", publisher_id: "oecd", series: "OECD Economic Outlook", url: "https://www.oecd.org/en/publications/serials/oecd-economic-outlook_16097408.html" },
    { id: "oecd", name: "Organisation for Economic Co-operation and Development", kind: "igo" },
    (ed) => `OECD Economic Outlook ${monthLabel(ed)}`,
    { "OECD total": "oecd-total-real-gdp-growth" },
  );
}

export function worldBankGep(): Bundle {
  return gdpTable(
    { id: "world-bank-gep", publisher_id: "world-bank", series: "Global Economic Prospects", url: "https://www.worldbank.org/en/publication/global-economic-prospects" },
    { id: "world-bank", name: "World Bank", kind: "igo" },
    (ed) => `World Bank GEP ${monthLabel(ed)}`,
    {
      World: "world-real-gdp-growth-market-exchange-rates",
      "Advanced economies": "advanced-economies-real-gdp-growth-world-bank",
      "Emerging market and developing economies": "emerging-and-developing-economies-real-gdp-growth-world-bank",
      "High-income countries": "high-income-countries-real-gdp-growth",
      "Developing countries": "developing-countries-real-gdp-growth",
    },
  );
}

// ---------------------------------------------------------------- Fed SEP

const FED: Record<string, string> = {
  "real GDP growth": "united-states-real-gdp-growth-q4-over-q4",
  "unemployment rate": "united-states-unemployment-rate-q4",
  "PCE inflation": "united-states-pce-inflation-q4-over-q4",
  "core PCE inflation": "united-states-core-pce-inflation-q4-over-q4",
  "federal funds rate": "united-states-federal-funds-rate-year-end",
};

export function fedSep(): Bundle {
  return table(
    { id: "fed-sep", publisher_id: "fomc", series: "Summary of Economic Projections", url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" },
    { id: "fomc", name: "Federal Open Market Committee (Federal Reserve)", kind: "central_bank", country: "USA" },
    "variable | statistic | horizon | target_year",
    (e, ed, d) => {
      const statistic = String(e.statistic);
      if (statistic === "median (computed from individual projections)")
        return "median computed by Hindsight from individual projections (not published at the time)";
      const subject = FED[String(e.variable)];
      if (subject === undefined) throw new Error(`fed-sep ${ed}: unknown variable ${e.variable}`);
      const longer = e.horizon === "longer_run";
      const range = e.value_low !== undefined && e.value_low !== null ? `central tendency ${num(e.value_low)} to ${num(e.value_high)}` : undefined;
      return {
        key: `${e.variable}|${statistic}|${e.horizon}|${e.target_year ?? ""}`,
        subject,
        statement: `FOMC Summary of Economic Projections ${d.meeting ?? ed} (${statistic}): ${e.variable} ${longer ? "in the longer run" : `in ${e.target_year}`}, ${pct(e.value, String(e.unit))}${range ? ` (${range})` : ""}`,
        position: `${e.horizon}; ${e.label}`,
        metric: String(e.metric),
        unit: String(e.unit),
        target: year(e.target_year),
        band: longer ? "longer run" : undefined,
        hedge: statistic,
        note: [`Definition: ${e.definition}.`, range ? `Published as a ${range}; value is the midpoint.` : undefined].filter((s): s is string => s !== undefined),
      };
    },
  );
}

// ---------------------------------------------------------------- ECB staff projections

export function ecbProjections(): Bundle {
  return table(
    { id: "ecb-projections", publisher_id: "ecb", series: "Eurosystem/ECB staff macroeconomic projections for the euro area", url: "https://www.ecb.europa.eu/pub/projections/html/index.en.html" },
    { id: "ecb", name: "European Central Bank", kind: "central_bank" },
    "variable | statistic | horizon | target_year",
    (e, ed) => {
      const v = String(e.variable);
      const subject = v === "HICP inflation" ? "euro-area-hicp-inflation" : v === "real GDP growth" ? "euro-area-real-gdp-growth" : undefined;
      if (subject === undefined) throw new Error(`ecb-projections ${ed}: unknown variable ${v}`);
      const range = e.value_low !== undefined && e.value_low !== null ? `range ${num(e.value_low)} to ${num(e.value_high)}` : undefined;
      return {
        key: `${v}|${e.statistic}|${e.horizon}|${e.target_year}`,
        subject,
        statement: `ECB staff projections ${monthLabel(ed)}: euro area ${v} in ${e.target_year}, ${pct(e.value, String(e.unit))}${range ? ` (${range})` : ""}`,
        position: `${e.horizon}; ${e.label}`,
        metric: String(e.metric),
        unit: String(e.unit),
        target: year(e.target_year),
        hedge: String(e.statistic),
        note: [`Definition: ${e.definition}.`, range ? `Published as a ${range}; value is the midpoint.` : undefined].filter((s): s is string => s !== undefined),
      };
    },
  );
}

// ---------------------------------------------------------------- CBO

const CBO: Record<string, string> = {
  "real GDP growth": "united-states-real-gdp-growth",
  "real GDP growth, average": "united-states-real-gdp-growth",
  "real GNP growth, average": "united-states-real-gnp-growth",
  "CPI-U inflation": "united-states-cpi-inflation",
  "CPI inflation, average": "united-states-cpi-inflation",
  "unemployment rate": "united-states-unemployment-rate",
  "10-year Treasury note rate": "united-states-10-year-treasury-rate",
  "10-year Treasury note rate, average": "united-states-10-year-treasury-rate",
  "Aaa corporate bond rate, average": "united-states-aaa-corporate-bond-rate",
  "federal budget deficit": "united-states-federal-budget-deficit",
};

export function cboProjections(): Bundle {
  return table(
    { id: "cbo-projections", publisher_id: "cbo", series: "The Budget and Economic Outlook (baseline projections)", url: "https://www.cbo.gov/about/products/major-recurring-reports" },
    { id: "cbo", name: "Congressional Budget Office", kind: "government", country: "USA" },
    "metric | horizon | target_year | target_period",
    (e, ed) => {
      const metric = String(e.metric);
      const subject = CBO[metric];
      if (subject === undefined) throw new Error(`cbo-projections ${ed}: unknown metric ${metric}`);
      const period = str(e.target_period);
      return {
        key: `${metric}|${e.horizon}|${e.target_year}|${period ?? ""}`,
        subject,
        statement: `CBO baseline ${monthLabel(ed)}: US ${metric} ${period ? `over ${period}` : `in ${e.period === "fiscal year" ? "fiscal year " : ""}${e.target_year}`}, ${pct(e.value, String(e.unit))}`,
        position: [e.horizon, e.period, e.label].filter(Boolean).join("; "),
        metric,
        unit: String(e.unit),
        target: year(e.target_year),
        band: period ? `${period} average` : undefined,
      };
    },
  );
}

// ---------------------------------------------------------------- OBR

const OBR: Record<string, string> = {
  "real GDP growth": "united-kingdom-real-gdp-growth",
  "CPI inflation": "united-kingdom-cpi-inflation",
  "public sector net borrowing": "united-kingdom-public-sector-net-borrowing",
};

export function obrForecasts(): Bundle {
  return table(
    { id: "obr-forecasts", publisher_id: "obr", series: "Economic and fiscal outlook", url: "https://obr.uk/efo/" },
    { id: "obr", name: "Office for Budget Responsibility", kind: "government", country: "GBR" },
    "metric | unit | horizon | target_year",
    (e, ed, d) => {
      const metric = String(e.metric);
      const subject = OBR[metric];
      if (subject === undefined) throw new Error(`obr-forecasts ${ed}: unknown metric ${metric}`);
      if (String(e.label).includes("Memo:")) return "memo row (restated or supplementary forecast, not the headline forecast of this EFO)";
      // Fiscal year "2017-18" resolves when it ends, in March 2018.
      const fy = /^(\d{4})-(\d{2})$/.exec(String(e.target_year));
      const target = fy ? `${fy[1]?.slice(0, 2)}${fy[2]}-03` : year(e.target_year);
      return {
        key: `${metric}|${e.unit}|${e.horizon}|${e.target_year}`,
        subject,
        statement: `OBR ${d.forecast_label ?? ed} forecast: UK ${metric} in ${e.period === "calendar year" ? "" : "fiscal year "}${e.target_year}, ${pct(e.value, String(e.unit))}`,
        position: [e.horizon, e.period, e.label].filter(Boolean).join("; "),
        metric,
        unit: String(e.unit),
        target,
      };
    },
  );
}
