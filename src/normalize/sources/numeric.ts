/**
 * Numeric Tier 1 sources: IMF WEO, IEA WEO, EIA AEO, BCB Focus, BNEF EVO.
 * One claim per forecast value. Base-year rows are not claims.
 * These sources are data tables: where there is no quote, the claim carries a
 * generated statement, marked `statement_generated` (D12).
 */
import { join } from "node:path";
import {
  type Bundle,
  type Draft,
  type Raw,
  RAW,
  clean,
  editionFiles,
  firstUrl,
  editionId,
  fit,
  num,
  readJson,
  str,
  year,
} from "../lib.ts";
import { quantity } from "../quantities.ts";

function bump(skipped: Record<string, number>, reason: string): void {
  skipped[reason] = (skipped[reason] ?? 0) + 1;
}

function editionRow(source: string, edition: string, d: Raw, url?: string) {
  return clean({
    id: editionId(source, edition),
    source_id: source,
    edition,
    published: String(d.published ?? edition),
    url: url ?? firstUrl(d.sources),
  });
}

function note(e: Raw, ...extra: (string | undefined)[]): string | undefined {
  const parts = [...extra, str(e.note), e.confidence && e.confidence !== "high" ? `Extraction confidence: ${e.confidence}.` : undefined].filter(
    (s): s is string => s !== undefined,
  );
  return parts.length > 0 ? fit(parts.join(" ")) : undefined;
}

// ---------------------------------------------------------------- IMF WEO

/** By economy name: the economy code differs between the IMF files (WEO code, SDMX group code, DataMapper code). */
const IMF_ECONOMY: Record<string, string> = {
  World: "world-real-gdp-growth",
  "Advanced economies": "advanced-economies-real-gdp-growth",
  "Emerging market and developing economies": "emerging-and-developing-economies-real-gdp-growth",
  "United States": "united-states-real-gdp-growth",
  "Euro area": "euro-area-real-gdp-growth",
  China: "china-real-gdp-growth",
  India: "india-real-gdp-growth",
  Brazil: "brazil-real-gdp-growth",
  Japan: "japan-real-gdp-growth",
  Germany: "germany-real-gdp-growth",
  "United Kingdom": "united-kingdom-real-gdp-growth",
};
const SEASON: Record<string, string> = { "04": "April", "10": "October" };

export function imfWeo(): Bundle {
  const source = "imf-weo";
  const b: Bundle = {
    source: { id: source, publisher_id: "imf", series: "World Economic Outlook", url: "https://www.imf.org/en/Publications/WEO" },
    institution: { id: "imf", name: "International Monetary Fund", kind: "igo", ncb_id: "global.imf" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "economy name | target_year | horizon",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(editionRow(source, ed, d));
    const label = `IMF WEO ${SEASON[ed.slice(5)] ?? ""} ${ed.slice(0, 4)}`.replace(/\s+/g, " ");
    (d.entries as Raw[]).forEach((e, i) => {
      const subject = IMF_ECONOMY[String(e.economy)];
      if (subject === undefined) throw new Error(`imf-weo ${ed}: unknown economy ${e.economy}`);
      const draft: Draft = {
        key: `${e.economy}|${e.target_year}|${e.horizon}`,
        index: i + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(subject)],
        claim: clean({
          statement: `${label}: ${e.economy} real GDP growth in ${e.target_year}, ${num(e.value, 1)}%`,
          statement_generated: true,
          position: `${e.horizon} forecast; ${e.label}`,
          claim_type: "forecast" as const,
          metric: String(e.metric),
          value: String(e.value),
          unit: String(e.unit),
          target_date: year(e.target_year),
          note: note(e),
          status: "open" as const,
          published: true,
        }),
      };
      b.drafts.push(draft);
    });
  }
  return b;
}

// ---------------------------------------------------------------- IEA WEO

function ieaSubject(ed: string, tech: string, metric: string): string {
  const cap = metric === "installed capacity";
  if (tech === "wind") return cap ? "global-wind-installed-capacity" : "global-wind-generation";
  if (tech === "solar PV") {
    // The annex row is "Solar" until WEO 2009 and "Solar PV" from WEO 2010 (INDEX.md).
    const pv = Number(ed) >= 2010;
    if (cap) return pv ? "global-solar-pv-installed-capacity" : "global-solar-installed-capacity";
    return pv ? "global-solar-pv-generation" : "global-solar-generation";
  }
  throw new Error(`iea-weo: unknown technology ${tech}`);
}

/** Edition-level quotes: subject and timing by judgment, one line each. */
const IEA_QUOTE_SUBJECT: Record<string, { subject: string; target?: string; band?: string }> = {
  "2001|Utility-scale development of solar technologies": { subject: "global-solar-generation", band: "next twenty years" },
  "2001|Steady growth in solar power continues": { subject: "global-solar-generation" },
  "2004|Electricity generation from solar power is expected": { subject: "global-solar-generation", target: "2030" },
  "2010|Electricity produced from solar photovoltaics": { subject: "global-solar-pv-generation", target: "2035" },
};

export function ieaWeo(): Bundle {
  const source = "iea-weo";
  const b: Bundle = {
    source: { id: source, publisher_id: "iea", series: "World Energy Outlook", url: "https://www.iea.org/topics/world-energy-outlook" },
    institution: { id: "iea", name: "International Energy Agency", kind: "igo" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "technology | metric | target_year | scenario; edition-level quotes: quote text",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(editionRow(source, ed, d));
    const entries = d.entries as Raw[];
    entries.forEach((e, i) => {
      if (e.claim_type === "base_year") return bump(b.skipped, "base-year row (historical value, not a projection)");
      const subject = ieaSubject(ed, String(e.technology), String(e.metric));
      const techName = Number(ed) < 2010 && e.technology === "solar PV" ? "solar (annex row 'Solar')" : String(e.technology);
      b.drafts.push({
        key: `${e.technology}|${e.metric}|${e.target_year}|${e.scenario}`,
        index: i + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(subject)],
        claim: clean({
          quote: str(e.quote),
          statement: `IEA WEO ${ed} (${e.scenario}): world ${techName} ${e.metric} in ${e.target_year}, ${num(e.value)} ${e.unit}`,
          statement_generated: true,
          position: str(e.position),
          claim_type: e.claim_type === "scenario" ? ("scenario" as const) : ("forecast" as const),
          metric: String(e.metric),
          value: String(e.value),
          unit: String(e.unit),
          target_date: year(e.target_year),
          hedge: e.main_scenario === false ? `${e.scenario}; not the edition's main scenario` : String(e.scenario),
          note: note(e),
          status: "open" as const,
          published: true,
        }),
      });
    });
    ((d.quotes ?? []) as Raw[]).forEach((q, j) => {
      const text = String(q.quote);
      const hit = Object.entries(IEA_QUOTE_SUBJECT).find(([k]) => k.startsWith(`${ed}|`) && text.startsWith(k.slice(5)));
      if (hit === undefined) throw new Error(`iea-weo ${ed}: edition quote without a subject mapping: ${text.slice(0, 60)}`);
      const m = hit[1];
      b.drafts.push({
        key: `quote|${text}`,
        index: entries.length + j + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(m.subject)],
        claim: clean({
          quote: text,
          position: str(q.position),
          claim_type: "forecast" as const,
          target_date: m.target,
          horizon_band: m.band,
          note: "Edition-level quote, not an annex value. Subject assigned by judgment.",
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- EIA AEO

const EIA_SERIES: Record<string, string> = {
  solar_generation: "us-solar-generation",
  wind_generation: "us-wind-generation",
  electricity_sales: "us-electricity-sales",
  total_energy_consumption: "us-total-energy-consumption",
  transportation_energy_consumption: "us-transportation-energy-consumption",
  co2_emissions_energy: "us-energy-co2-emissions",
  petroleum_liquids_consumption: "us-petroleum-liquids-consumption",
  crude_oil_price_nominal: "us-imported-crude-oil-price-nominal",
  crude_oil_price_real: "us-imported-crude-oil-price-real",
  natural_gas_wellhead_price_nominal: "us-natural-gas-wellhead-price-nominal",
  natural_gas_price_electric_power_nominal: "us-natural-gas-price-electric-power-nominal",
  natural_gas_price_electric_power_real: "us-natural-gas-price-electric-power-real",
};

export function eiaAeo(): Bundle {
  const source = "eia-aeo";
  const b: Bundle = {
    source: { id: source, publisher_id: "us-eia", series: "Annual Energy Outlook", url: "https://www.eia.gov/outlooks/aeo/" },
    institution: { id: "us-eia", name: "US Energy Information Administration", kind: "government", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "series | unit | target_year | dollar_year",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(editionRow(source, ed, d, "https://www.eia.gov/outlooks/aeo/archive.php"));
    (d.entries as Raw[]).forEach((e, i) => {
      const subject = EIA_SERIES[String(e.series)];
      if (subject === undefined) throw new Error(`eia-aeo ${ed}: unknown series ${e.series}`);
      const unit = e.dollar_year ? `${e.unit}; dollar year ${e.dollar_year}` : String(e.unit);
      b.drafts.push({
        key: `${e.series}|${e.unit}|${e.target_year}|${e.dollar_year ?? ""}`,
        index: i + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(subject)],
        claim: clean({
          statement: `EIA AEO ${ed} (${e.case} case): ${e.label} in ${e.target_year}, ${num(e.value)} ${unit}`,
          statement_generated: true,
          position: [e.retrospective, e.table, e.column].filter(Boolean).join(", "),
          claim_type: "forecast" as const,
          metric: String(e.label),
          value: String(e.value),
          unit,
          target_date: year(e.target_year),
          hedge: `${e.case} case`,
          note: note(e, Number(e.target_year) < Number(ed) ? "Target year before the edition year: an estimate of a year whose data were not yet final." : undefined),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- BCB Focus

function bcbSubject(e: Raw): string {
  switch (e.label) {
    case "IPCA":
      return "brazil-ipca-inflation";
    case "PIB Total":
      return "brazil-real-gdp-growth";
    case "Selic":
      return "brazil-selic-rate-year-end";
    case "Câmbio":
      if (e.definition === "average PTAX sell rate in December") return "brazil-usd-brl-exchange-rate-december-average";
      if (e.definition === "PTAX sell rate on the last business day of the year") return "brazil-usd-brl-exchange-rate-last-business-day";
      throw new Error(`bcb-focus: exchange-rate row without a known definition: ${e.definition}`);
    default:
      throw new Error(`bcb-focus: unknown indicator ${e.label}`);
  }
}

export function bcbFocus(): Bundle {
  const source = "bcb-focus";
  const b: Bundle = {
    source: {
      id: source,
      publisher_id: "bcb",
      series: "Focus market expectations survey",
      url: "https://www.bcb.gov.br/publicacoes/focus",
      licence_notes: "ODbL 1.0 (Banco Central do Brasil open data). Not CC BY 4.0. See NOTICE.md.",
    },
    institution: { id: "bcb", name: "Banco Central do Brasil", kind: "central_bank", country: "BRA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "indicator label | target_year | horizon",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    const entries = d.entries as Raw[];
    if (entries.length === 0) continue;
    b.editions.push(editionRow(source, ed, d));
    entries.forEach((e, i) => {
      const unit = String(e.unit);
      const v = unit === "%" ? `${num(e.value)}%` : `${num(e.value)} ${unit}`;
      b.drafts.push({
        key: `${e.label}|${e.target_year}|${e.horizon}`,
        index: i + 1,
        edition: ed,
        labels: [],
        quantityIds: [quantity(bcbSubject(e))],
        claim: clean({
          statement: `BCB Focus survey ${e.survey_date} (median): Brazil ${e.metric} in ${e.target_year}, ${v}`,
          statement_generated: true,
          position: `${e.horizon}; survey date ${e.survey_date}${e.respondents ? `; ${e.respondents} respondents` : ""}`,
          claim_type: "forecast" as const,
          metric: String(e.metric),
          value: String(e.value),
          unit,
          target_date: year(e.target_year),
          hedge: `${e.statistic} of market forecasts`,
          note: note(e, str(e.definition) ? `Definition: ${e.definition}.` : undefined),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- BNEF EVO

function bnefSubject(metric: string): string {
  const m = metric.toLowerCase();
  if (m.includes("parity") || m.includes("cheaper") || m.includes("cross over") || m.includes("comparable or lower")) return "ev-price-parity-with-ice";
  if (m.includes("outnumber")) return "ev-fleet-majority-year";
  if (m === "global passenger ev sales") return "global-passenger-ev-sales";
  if (m === "global ev sales") return "global-ev-sales";
  if (m.startsWith("zero-emission share of new passenger")) return "global-zev-share-of-new-passenger-car-sales";
  if (m.includes("light duty vehicle sales") || m.includes("light-duty vehicle sales")) return "global-ev-share-of-new-light-duty-vehicle-sales";
  if (m.includes("car, van and truck") || m === "ev share of new vehicle sales, global") return "global-ev-share-of-new-vehicle-sales";
  if (m.includes("share of new passenger") || m.includes("share of new car sales")) return "global-ev-share-of-new-passenger-car-sales";
  if (m.includes("light-duty vehicles on the road")) return "global-ev-share-of-light-duty-fleet";
  if (m.includes("fleet") || m.includes("on the road")) return "global-ev-share-of-car-fleet";
  throw new Error(`bnef-evo: no subject for metric "${metric}"`);
}

export function bnefEvo(): Bundle {
  const source = "bnef-evo";
  const b: Bundle = {
    source: { id: source, publisher_id: "bloombergnef", series: "Electric Vehicle Outlook", url: "https://about.bnef.com/electric-vehicle-outlook/" },
    institution: { id: "bloombergnef", name: "BloombergNEF", kind: "research_firm" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "metric | target_year | scenario",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(editionRow(source, ed, d));
    (d.entries as Raw[]).forEach((e, i) => {
      if (e.claim_type === "base_year") return bump(b.skipped, "base-year row (historical value, not a projection)");
      const metric = String(e.metric);
      const isYear = metric.startsWith("year ");
      const target = year(e.target_year);
      b.drafts.push({
        key: `${metric}|${e.target_year ?? ""}|${e.scenario ?? ""}`,
        index: i + 1,
        edition: ed,
        labels: [{ label: String(e.subject), kind: "technology" }],
        quantityIds: [quantity(bnefSubject(metric))],
        claim: clean({
          quote: str(e.quote),
          position: str(e.position),
          claim_type: e.claim_type === "scenario" ? ("scenario" as const) : ("forecast" as const),
          metric,
          value: isYear ? target : e.value === null || e.value === undefined ? undefined : String(e.value),
          unit: isYear ? "year" : str(e.unit),
          target_date: target,
          horizon_band: str(e.horizon),
          hedge: str(e.scenario),
          note: note(e),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}

// ---------------------------------------------------------------- BP Energy Outlook

function bpSubject(metric: string): string | undefined {
  const m = metric.toLowerCase();
  if (m.startsWith("global liquids demand")) return "global-liquids-demand";
  if (m.startsWith("oil demand")) return "global-oil-demand";
  if (m.startsWith("renewables share of primary energy")) return "global-renewables-share-of-primary-energy";
  if (m.startsWith("renewables share of power generation") || m.startsWith("renewables share of world electricity")) return "global-renewables-share-of-electricity";
  if (m.includes("share of new vehicle sales")) return "global-ev-share-of-new-vehicle-sales";
  if (m.includes("share of passenger car stock")) return "global-ev-share-of-car-fleet";
  if (m.includes("on the road")) return "global-ev-stock";
  if (m === "electric vehicles contribution to transport") return undefined;
  throw new Error(`bp-energy-outlook: no subject for metric "${metric}"`);
}

export function bpEnergyOutlook(): Bundle {
  const source = "bp-energy-outlook";
  const b: Bundle = {
    source: { id: source, publisher_id: "bp", series: "Energy Outlook", url: "https://www.bp.com/en/global/corporate/energy-economics/energy-outlook.html" },
    institution: { id: "bp", name: "BP p.l.c.", kind: "company", country: "GBR" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "metric | target_year | scenario",
  };
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    b.editions.push(editionRow(source, ed, d));
    (d.entries as Raw[]).forEach((e, i) => {
      if (e.claim_type === "base_year") return bump(b.skipped, "base-year row (historical value, not a projection)");
      const metric = String(e.metric);
      const q = bpSubject(metric);
      const hasValue = e.value !== null && e.value !== undefined;
      b.drafts.push({
        key: `${metric}|${e.target_year ?? ""}|${e.scenario ?? ""}`,
        index: i + 1,
        edition: ed,
        labels: String(e.subject) === "electric vehicles" ? [{ label: "electric vehicles", kind: "technology" }] : [],
        quantityIds: q === undefined ? [] : [quantity(q)],
        claim: clean({
          quote: str(e.quote),
          statement: hasValue ? `BP Energy Outlook ${ed} (${e.scenario}): world ${metric} in ${e.target_year}, ${num(e.value)} ${e.unit}` : undefined,
          statement_generated: hasValue ? true : undefined,
          position: str(e.position),
          claim_type: e.claim_type === "scenario" ? ("scenario" as const) : ("forecast" as const),
          metric,
          value: hasValue ? String(e.value) : undefined,
          unit: str(e.unit) === "None" ? undefined : str(e.unit),
          target_date: year(e.target_year),
          hedge: e.main_scenario === false ? `${e.scenario}; not a central scenario` : str(e.scenario),
          note: note(e, e.derived ? "Value derived by the capture from the edition's tables (see raw note)." : undefined),
          status: "open" as const,
          published: true,
        }),
      });
    });
  }
  return b;
}
