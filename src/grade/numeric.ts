/**
 * grade:numeric: grade every numeric forecast of the numeric sources against
 * the captured actual values (D16, D18, D19). Run with `pnpm grade:numeric`.
 *
 * Arithmetic, not judgment. A forecast is graded only against an actual on
 * the same definition. Where the definitions differ, the row is `ungradable`
 * with the reason. The matching rules per source are in MATCH_RULES below
 * and in data/graded/README.md, which this command writes.
 *
 * Reads data/normalized/claims/<source>.json and data/raw/<source>/.
 * Writes data/graded/numeric/<source>.json after each source, then
 * summary.json, comparison.json, README.md and PROGRESS.md.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  type Claim,
  type NumericAudit,
  NumericComparison,
  NumericGrade,
  type NumericHorizon,
  type NumericRule,
  type NumericStats,
  NumericSummary,
  type SourceEdition,
} from "../schema.ts";
import { OUT as NORMALIZED, RAW, REPO, type Raw, editionFiles, readJson, writeJson, writeText } from "../normalize/lib.ts";

const GRADED = join(REPO, "data", "graded");
/** The last year with actual values in the captures. Later target years stay open. */
const LAST_ACTUAL_YEAR = 2025;
const MIN_N = 20;
/** Float tolerance for the thresholds: 2.6 - 2.1 must count as 0.5. */
const EPS = 1e-9;

// ---------------------------------------------------------------- matching

interface Actual {
  value: number | null;
  vintage: string;
  /** Why the value is null, or a caveat on the value. */
  note?: string | undefined;
}

/** An actual series on one definition. Keys are years (or fiscal-year labels). */
interface Series {
  label: string;
  values: Map<string, Actual>;
  /** Last year the series covers. A later target year is open, an earlier gap is ungradable. */
  last: number;
}

type Match =
  | {
      kind: "actual";
      actual: number;
      vintage: string;
      notes: string[];
      /** Forecast and actual restated on another scale (CBO deficits in % of GDP, #54); graded under D18. */
      rescaled?: { forecast: number; unit: string };
      /**
       * #66: a known uncertainty of the actual, as the range the error can move by (in the error's unit). When the
       * verdict differs anywhere in [error + low, error + high], the row stays graded and its note carries a
       * threshold flag naming the verdicts that range allows.
       */
      uncertainty?: { low: number; high: number; why: string };
    }
  | { kind: "ungradable" | "open" | "excluded"; reason: string };

const ungradable = (reason: string): Match => ({ kind: "ungradable", reason });
const excluded = (reason: string): Match => ({ kind: "excluded", reason });
const open = (reason: string): Match => ({ kind: "open", reason });

/**
 * #70 (D41): an actual published rounded to one decimal is known only within 0.05 points. The range is open at both
 * ends (a rounded 2.0 is a value in [1.95, 2.05)), so it is narrowed by 1e-6 and only an error that sits on a D18
 * threshold, or within 0.05 of it, gets a threshold flag.
 */
const ONE_DECIMAL = (what: string) => ({ low: -0.05 + 1e-6, high: 0.05 - 1e-6, why: `${what}, so the actual is known only within 0.05 points.` });

function series(label: string, rows: [key: string | number, actual: Actual][]): Series {
  const values = new Map<string, Actual>();
  let last = 0;
  for (const [k, a] of rows) {
    values.set(String(k), a);
    const y = Number(String(k).slice(0, 4)) + (/^\d{4}-\d{2}$/.test(String(k)) ? 1 : 0);
    if (a.value !== null && y > last) last = y;
  }
  return { label, values, last };
}

/** Look up one year. Missing after the series end: open. Missing inside it: ungradable. */
function lookup(s: Series | undefined, key: string | number, year: number, notes: string[] = []): Match {
  if (s === undefined) return ungradable("no actual series on this definition was captured");
  const a = s.values.get(String(key));
  if (a !== undefined && a.value !== null) return { kind: "actual", actual: a.value, vintage: a.vintage, notes: [...notes, ...(a.note ? [a.note] : [])] };
  if (a !== undefined && a.value === null) return ungradable(`the actual series has no value for this year: ${a.note ?? "gap in the source"}`);
  if (year > s.last) return open(`no actual captured yet for ${year} (${s.label} ends in ${s.last})`);
  return ungradable(`the actual series (${s.label}) has no value for this year`);
}

interface RowCtx {
  source: string;
  claim: Claim;
  /** The raw row, by position (D15 first assignment). Absent for edition-level quotes. */
  e: Raw | undefined;
  ed: string;
  target: number | null;
  horizon: number | null;
}

interface Grader {
  /** Match one claim to an actual. Called only for forecasts with a numeric value and a target year up to LAST_ACTUAL_YEAR. */
  match(r: RowCtx): Match;
  statistic?(e: Raw): string | null;
  /** How the source reads its own target period, when it is not a calendar year. */
  period?(e: Raw): string | null;
  /**
   * The D15 natural key of a raw row, as the normalize adapter builds it. When set, claims are mapped to raw rows
   * through data/normalized/ids.json instead of by position, so a re-captured row with a new key (a new id above
   * the edition's first assignment) still finds its row (#66: AEO2009 rows re-taken from another retrospective).
   */
  rowKey?(e: Raw): string;
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

// ---------------------------------------------------------------- IMF WEO

const GROUP_COMPOSITION =
  "Group aggregate: the actual uses the group's current composition, the forecast used the composition at the time.";

function imf(): Grader {
  const d = readJson(join(RAW, "imf-weo", "realized.json"));
  const vintage = `IMF WEO April 2026 (DataMapper API, last modified ${d.vintage_last_modified})`;
  const by = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const list = by.get(e.economy) ?? [];
    list.push([String(e.target_year), { value: e.value, vintage, note: e.confidence === "medium" ? "The actual is the latest year and may be an IMF staff estimate." : undefined } as Actual]);
    by.set(e.economy, list);
  }
  const s = new Map([...by].map(([k, v]) => [k, series(`IMF ${k}`, v)]));
  const cal = d.india_calendar_year as Raw | undefined;
  const indiaCalendar = cal
    ? series(
        "IMF WEO April 2013 India, calendar year",
        (cal.entries as Raw[]).map((e) => [String(e.target_year), { value: e.value, vintage: "IMF WEO database April 2013 (calendar year; via DBnomics IMF/WEO:2013-04)", note: e.confidence === "medium" ? "The actual is the vintage's latest year and may be an IMF staff estimate." : undefined } as Actual]),
      )
    : undefined;
  const groups = new Set(["World", "Advanced economies", "Emerging market and developing economies", "Euro area"]);
  return {
    match: ({ e, ed, target }) => {
      const eco = String(e?.economy);
      // #53 audit: before these editions the IMF published a different measure under the same subject.
      if (eco === "India" && ed < "2013-07") {
        // #66: graded against the last IMF vintage on the calendar-year basis (WEO April 2013); later vintages are fiscal-year.
        const m = lookup(indiaCalendar, target as number, target as number, [
          "India on a calendar-year basis in forecast and actual: the actual is the WEO April 2013 database, the last IMF vintage before India moved to fiscal years (July 2013 Update); later revisions of Indian national accounts are not in it.",
        ]);
        if (m.kind === "open")
          return ungradable(`India forecasts before the July 2013 WEO Update are calendar-year figures; the last calendar-year IMF vintage (April 2013) ends in 2012, and every later IMF India actual is fiscal-year`);
        return m;
      }
      if (eco === "Emerging market and developing economies" && ed < "2004-04")
        return ungradable("before the April 2004 WEO this row is the old 'developing countries' group, which left out the countries in transition (about 15% of today's group); a different group, not membership drift");
      if (eco === "Advanced economies" && ed < "1997-04")
        return ungradable("before the May 1997 WEO this row is the old 'industrial countries' group, without the Asian newly industrialized economies and Israel; a different group, not membership drift");
      if (eco === "World" && ed < "1993-04")
        return ungradable("before the May 1993 WEO world growth was weighted at market exchange rates; the actual is PPP-weighted");
      const notes = groups.has(eco) ? [GROUP_COMPOSITION] : [];
      if (eco === "India") notes.push("India on a fiscal-year basis (April to March) in both forecast and actual.");
      return lookup(s.get(eco), target as number, target as number, notes);
    },
  };
}

// ---------------------------------------------------------------- OECD Economic Outlook

function oecd(): Grader {
  const d = readJson(join(RAW, "oecd-economic-outlook", "realized.json"));
  const vintage = "OECD Economic Outlook 119 (June 2026, SDMX DSD_EO@DF_EO)";
  const by = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const list = by.get(e.economy) ?? [];
    list.push([String(e.target_year), { value: e.value, vintage, note: e.confidence === "medium" ? "The actual is the latest year and may be an estimate." : undefined } as Actual]);
    by.set(e.economy, list);
  }
  const s = new Map([...by].map(([k, v]) => [k, series(`OECD ${k}`, v)]));
  return {
    match: ({ e, target }) => {
      const eco = String(e?.economy);
      const notes: string[] = [];
      if (eco === "Euro area")
        notes.push(
          `OECD euro area = euro area members of the OECD (actual EA17${e?.economy_code === "EA16" ? "; forecast EA16" : ""}), not the full euro area. ${GROUP_COMPOSITION}`,
        );
      if (eco === "OECD total") notes.push(GROUP_COMPOSITION);
      if (eco === "India") notes.push("India on a fiscal-year basis (April to March) in both forecast and actual.");
      if (/working-day adjusted/i.test(String(e?.note ?? ""))) notes.push("Forecast is a working-day-adjusted annex figure; the actual is the EO database series.");
      return lookup(s.get(eco), target as number, target as number, notes);
    },
  };
}

// ---------------------------------------------------------------- World Bank GEP

function worldBank(): Grader {
  const d = readJson(join(RAW, "world-bank-gep", "realized.json"));
  const gep = new Map<string, [string, Actual][]>();
  const wdi = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const isGep = String(e.source).startsWith("GEP");
    const m = isGep ? gep : wdi;
    const list = m.get(e.economy) ?? [];
    list.push([
      String(e.target_year),
      {
        value: e.value,
        vintage: isGep ? "World Bank GEP June 2026, Table 1.1" : "World Bank WDI NY.GDP.MKTP.KD.ZG (last updated 2026-07-13)",
        note: e.confidence === "medium" ? "The actual is an estimate (GEP June 2026 column 2025e)." : undefined,
      } as Actual,
    ]);
    m.set(e.economy, list);
  }
  const worldWeights = (d.world_weights ?? {}) as Record<string, string | null>;
  const worldRestated = (d.world_restated ?? []) as { target_year: number; value: number; stated_in: string; column: string; estimate: boolean; weights: string | null }[];
  const g = new Map([...gep].map(([k, v]) => [k, series(`GEP June 2026 ${k}`, v)]));
  const w = new Map([...wdi].map(([k, v]) => [k, series(`WDI ${k}`, v)]));
  return {
    match: ({ e, ed, target }) => {
      const eco = String(e?.economy);
      const y = target as number;
      const note = String(e?.note ?? "");
      if (eco === "High-income countries" || eco === "Developing countries")
        return ungradable(
          "World Bank income group of the edition (grouping used until January 2016); the WDI actual (HIC or LMY) uses the current income classification, a different membership",
        );
      // #11: regional aggregates of the 1990s editions (developing countries of each region, 1987 weights, membership of the time).
      if (/^(East Asia and Pacific|South Asia|Sub-Saharan Africa|Latin America and the Caribbean|Middle East and North Africa|Europe and Central Asia)$/.test(eco))
        return ungradable(
          "World Bank regional aggregate of the edition (membership and 1987 weights of the time); the WDI regional aggregates use today's membership and weights, and no later GEP statement of the region is captured",
        );
      const fromGep = g.get(eco)?.values.get(String(y));
      // #70 (D41): a GEP table prints growth to one decimal, so an actual read from one is known only within 0.05 points.
      const gepTable = (m: Match): Match => (m.kind === "actual" ? { ...m, uncertainty: ONE_DECIMAL("the GEP table prints growth to one decimal") } : m);
      if (eco === "World") {
        // #53 audit: the GEP weights World at the prices of a base year (1995, 2000, 2005, 2010, then the 2010-19 average);
        // WDI World uses 2015 USD weights, a different aggregate (gaps of 0.4 to 1.0 points before 2019, 0.1 to 0.2 after).
        // #66, #70 (D39, D41): every edition is graded against the GEP's own later statement of that year on the edition's
        // weights (the latest later edition with the same price base whose table prints the year as a past year).
        const base = worldWeights[ed];
        if (!base) return ungradable("GEP World growth of this edition is weighted at a price base the table does not state; the WDI World actual uses 2015 USD weights, and no later GEP statement on the same base can be chosen");
        const later = worldRestated.filter((r) => r.target_year === y && r.weights === base && r.stated_in > ed).sort((a, b) => (a.stated_in < b.stated_in ? -1 : 1));
        const st = later[later.length - 1];
        if (st === undefined)
          return ungradable(`no later GEP edition on this edition's weights (${base}) prints ${y} as a past year; the WDI World actual uses 2015 USD weights, a different aggregate`);
        return gepTable({
          kind: "actual",
          actual: st.value,
          vintage: `World Bank GEP ${st.stated_in}, real GDP growth table (column ${st.column})`,
          notes: [
            `Actual is the GEP's own later statement of World growth at the same weights (${base}, market exchange rates) as the forecast; the WDI World series uses 2015 USD weights.`,
            ...(st.estimate ? [`The ${st.stated_in} table marks ${y} as an estimate; no later edition on the same weights restates it.`] : []),
          ],
        });
      }
      if (eco === "India") {
        // #54: WDI reports India's national accounts on a fiscal-year basis (WDI country metadata, SpecialNotes:
        // "fiscal year-end: March 31"), labelled like the GEP tables (WDI 2023 = 7.21 = GEP FY2023/24 column 2023).
        if (!/fiscal year/i.test(note)) return ungradable("India: the table does not state the basis of this forecast (fiscal or calendar year), so no actual on the same basis can be chosen");
        const basis = "India on a fiscal-year basis (April to March) in both forecast and actual.";
        if (fromGep !== undefined) return gepTable(lookup(g.get(eco), y, y, [basis]));
        return lookup(w.get(eco), y, y, [basis, "Actual from WDI, which reports India on a fiscal-year basis with the same year labels as the GEP tables (2023 = FY2023/24)."]);
      }
      if (eco === "Advanced economies" || eco === "Emerging market and developing economies") {
        if (fromGep === undefined) return y > 2025 ? open("target year after 2025") : ungradable("no actual captured for this World Bank group and year (WDI does not publish the GEP groups; the GEP June 2026 table covers 2023 to 2025)");
        return gepTable(lookup(g.get(eco), y, y, [GROUP_COMPOSITION]));
      }
      const notes: string[] = [];
      if (eco === "Euro area") notes.push(GROUP_COMPOSITION);
      if (fromGep !== undefined) return gepTable(lookup(g.get(eco), y, y, notes));
      return lookup(w.get(eco), y, y, notes);
    },
  };
}

// ---------------------------------------------------------------- Fed SEP

function fed(): Grader {
  const d = readJson(join(RAW, "fed-sep", "realized.json"));
  const by = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const list = by.get(e.variable) ?? [];
    const vintage = e.vintage ? `ALFRED ${e.vintage}` : `ALFRED ${String(e.computed_from ?? "").split(" ")[0]} (retrieved ${d.retrieved})`;
    list.push([String(e.target_year), { value: e.value, vintage, note: e.value === null ? "BLS published no October 2025 unemployment rate, so no Q4 average exists" : undefined }]);
    by.set(e.variable, list);
  }
  const s = new Map([...by].map(([k, v]) => [k, series(`FRED ${k}`, v)]));
  return {
    statistic: (e) => String(e.statistic),
    match: ({ e, ed, target }) => {
      const variable = String(e?.variable);
      const stat = String(e?.statistic);
      if (stat === "median" && ed === "2015-06" && variable !== "federal funds rate")
        return excluded("median not public at the time (the September 2015 SEP printed it); the central tendency of this edition is graded instead");
      const notes = ["Same SEP definition in forecast and actual (Q4 over Q4, Q4 average, or year-end target)."];
      if (stat === "central tendency midpoint") notes.push("The SEP published a central tendency; the midpoint is graded.");
      if (stat === "median (computed from dot plot)")
        notes.push("Median computed by Hindsight from the published dot plot; the dot plot shows the 0 to 1/4 percent range as 0.25.");
      return lookup(s.get(variable), target as number, target as number, notes);
    },
  };
}

// ---------------------------------------------------------------- ECB staff projections

function ecb(): Grader {
  const d = readJson(join(RAW, "ecb-projections", "realized.json"));
  const by = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const list = by.get(e.variable) ?? [];
    // #66: real GDP is the ECB's own history in its latest MPD exercise (working-day adjusted, as projected).
    const vintage = String(e.series).startsWith("MPD.")
      ? `ECB MPD ${e.series} (history of exercise ${String(e.vintage).replace("MPD exercise ", "")}, retrieved ${d.retrieved})`
      : `Eurostat ${e.series} (updated ${String(e.vintage).slice(0, 10)})`;
    list.push([String(e.target_year), { value: e.value, vintage }]);
    by.set(e.variable, list);
  }
  const s = new Map([...by].map(([k, v]) => [k, series(k === "real GDP growth" ? "ECB MPD real GDP history" : `Eurostat ${k}`, v)]));
  return {
    statistic: (e) => String(e.statistic),
    match: ({ e, target }) => {
      const variable = String(e?.variable);
      const notes = ["Euro area with changing composition in forecast and actual."];
      if (variable === "real GDP growth")
        notes.push("Working-day-adjusted GDP in forecast and actual: the actual is the ECB's own history in its latest projection exercise (#66), not the Eurostat annual series, which is not calendar adjusted.");
      if (e?.statistic === "range midpoint") notes.push("The ECB published a range; the midpoint is graded.");
      const m = lookup(s.get(variable), target as number, target as number, notes);
      // #70 (D41): the MPD history is stated to one decimal.
      if (variable === "real GDP growth" && m.kind === "actual") return { ...m, uncertainty: ONE_DECIMAL("the ECB states its GDP history to one decimal") };
      // #71 (D41): Eurostat publishes the annual HICP rate (prc_hicp_aind) to one decimal.
      if (variable === "HICP inflation" && m.kind === "actual") return { ...m, uncertainty: ONE_DECIMAL("Eurostat publishes the annual HICP rate to one decimal") };
      return m;
    },
  };
}

// ---------------------------------------------------------------- CBO

function cbo(): Grader {
  const d = readJson(join(RAW, "cbo-projections", "realized.json"));
  const retrieved = String(d.vintage); // "retrieved YYYY-MM-DD"
  const bySeries = new Map<string, Series>();
  for (const x of d.series as Raw[]) {
    const id = String(x.series_id);
    const vintage = id.startsWith("eval-projections") ? "CBO eval-projections actuals.csv (commit 682559ca58)" : `FRED ${id} (${retrieved})`;
    bySeries.set(id, series(`${x.metric} (${id})`, (x.entries as Raw[]).map((e) => [String(e.target_year), { value: e.value, vintage }] as [string, Actual])));
  }
  const ANNUAL: Record<string, string> = {
    "real GDP growth": "A191RL1A225NBEA",
    "CPI-U inflation": "CPIAUCNS",
    "unemployment rate": "UNRATE",
    "10-year Treasury note rate": "GS10",
    "federal budget deficit": "eval-projections/actuals.csv",
  };
  const AVERAGE: Record<string, { id: string; how: "geometric" | "arithmetic" }> = {
    "real GDP growth, average": { id: "A191RL1A225NBEA", how: "geometric" },
    "real GNP growth, average": { id: "A001RL1A225NBEA", how: "geometric" },
    "CPI inflation, average": { id: "CPIAUCNS", how: "geometric" },
    "10-year Treasury note rate, average": { id: "GS10", how: "arithmetic" },
  };
  return {
    period: (e) => (e.target_period ? String(e.target_period) : e.period === "fiscal year" ? `fiscal year ${e.target_year}` : null),
    match: ({ e, ed, target }) => {
      const metric = String(e?.metric);
      const y = target as number;
      const annual = ANNUAL[metric];
      if (annual !== undefined) {
        const notes: string[] = [];
        if (/computed from the calendar-year levels/.test(String(e?.note ?? ""))) notes.push("Forecast growth computed by the capture from the levels in CBO's file.");
        if (metric !== "federal budget deficit") return lookup(bySeries.get(annual), y, y, notes);
        // #54: a deficit is graded in percent of GDP (D18, points), as CBO evaluates its own deficit projections.
        // A relative error in dollars explodes when the actual is near zero (FY1997 to FY2001).
        notes.push("Actual is CBO's own deficit actual (the basis CBO uses to evaluate its baselines), not FRED FYFSD, which differs by up to 345 billion USD (FY2023).");
        const m = lookup(bySeries.get(annual), y, y, notes);
        if (m.kind !== "actual") return m;
        const usd = bySeries.get("FYFSD")?.values.get(String(y))?.value;
        const pct = bySeries.get("FYFSGDA188S")?.values.get(String(y))?.value;
        if (typeof usd !== "number" || typeof pct !== "number" || pct === 0) return ungradable(`no fiscal-year ${y} GDP from FRED FYFSD / FYFSGDA188S to express the deficit in percent of GDP`);
        const gdpBn = usd / 1000 / (pct / 100);
        const f = Number(e?.value);
        return {
          ...m,
          actual: (m.actual / gdpBn) * 100,
          rescaled: { forecast: (f / gdpBn) * 100, unit: "% of GDP" },
          vintage: `${m.vintage}; fiscal-year GDP ${Math.round(gdpBn)} billion USD from FRED FYFSD / FYFSGDA188S (${retrieved})`,
          notes: [...m.notes, `Graded in percent of GDP (#54): forecast ${f} and actual ${m.actual} billion USD, each divided by actual fiscal-year GDP, as CBO's own evaluations do.`],
        };
      }
      if (metric === "Aaa corporate bond rate, average") return ungradable("no Aaa corporate bond rate actual was captured");
      const avg = AVERAGE[metric];
      if (avg === undefined) throw new Error(`cbo-projections: no rule for metric ${metric}`);
      const edYear = Number(ed.slice(0, 4));
      if (metric === "CPI inflation, average" && edYear >= 1986 && edYear <= 1989)
        return ungradable("CBO forecast the CPI-W in 1986 to 1989 (2025 forecasting-record appendix); the actual is the CPI-U");
      const m = /^(\d{4})-(\d{4})$/.exec(String(e?.target_period));
      if (m === null) throw new Error(`cbo-projections ${ed}: bad target_period ${e?.target_period}`);
      const s = bySeries.get(avg.id) as Series;
      const years: number[] = [];
      for (let t = Number(m[1]); t <= Number(m[2]); t++) years.push(t);
      const vals: number[] = [];
      for (const t of years) {
        const r = lookup(s, t, t);
        if (r.kind !== "actual") return r;
        vals.push(r.actual);
      }
      const value =
        avg.how === "arithmetic"
          ? vals.reduce((a, b) => a + b, 0) / vals.length
          : (vals.reduce((a, b) => a * (1 + b / 100), 1) ** (1 / vals.length) - 1) * 100;
      return {
        kind: "actual",
        actual: value,
        vintage: `FRED ${avg.id} (${retrieved}), ${avg.how} average of ${years[0]} to ${years[years.length - 1]} computed by Hindsight`,
        notes: [`Actual is the ${avg.how} average of the annual actuals over ${m[1]} to ${m[2]}, as CBO defines its own averages.`],
      };
    },
  };
}

// ---------------------------------------------------------------- OBR

function obr(): Grader {
  const d = readJson(join(RAW, "obr-forecasts", "realized.json"));
  const find = (id: string, vintage: string): Series => {
    const x = (d.series as Raw[]).find((s) => s.series_id === id);
    if (x === undefined) throw new Error(`obr-forecasts: no realized series ${id}`);
    return series(id, (x.entries as Raw[]).map((e) => [String(e.target_year), { value: e.value, vintage }] as [string, Actual]));
  };
  // #53 audit: unrounded actuals. IHYP and D7G7 print one decimal, which flips verdicts at the D18 thresholds.
  const gdp = find("ONS ABMI (PN2) growth", "ONS ABMI (PN2) levels, release 2026-08-13; growth computed unrounded");
  const cpi = find('OBR database "CPI" outturn row', "ONS CPI annual rate as compiled by the OBR historical official forecasts database, outturn row (March 2026), unrounded");
  const psnbPct = find('OBR database "PSNB" outturn row', "OBR historical official forecasts database, outturn row (March 2026)");
  const psnbGbp = find('OBR database "£PSNB" outturn row', "OBR historical official forecasts database, outturn row (March 2026)");
  return {
    period: (e) => (e.period === "calendar year" ? null : `fiscal year ${e.target_year}`),
    match: ({ e, ed, target }) => {
      const metric = String(e?.metric);
      const y = target as number;
      if (metric === "real GDP growth") return lookup(gdp, y, y);
      if (metric === "CPI inflation") return lookup(cpi, y, y);
      if (metric !== "public sector net borrowing") throw new Error(`obr-forecasts: no rule for metric ${metric}`);
      if (ed < "2020-03")
        return ungradable(
          "PSNB forecast made on an earlier definition: the forecast uses the definitions at the time, the outturn the current ones (the ONS student-loan reclassification alone added about 0.8 to 0.9% of GDP a year, per the OBR's restated March 2019 memo row)",
        );
      const fy = String(e?.target_year);
      const s = String(e?.unit) === "% of GDP" ? psnbPct : psnbGbp;
      return lookup(s, fy, y, ["Fiscal year April to March; forecast and outturn on the definitions in force from March 2020."]);
    },
  };
}

// ---------------------------------------------------------------- BCB Focus

/** First Focus report that labels the Selic indicator as the Copom target ("Meta Taxa Selic"); the report of 2004-04-08 still says "Over-Selic" (#66). */
const SELIC_TARGET_FROM = "2004-04-16";

function bcb(): Grader {
  const d = readJson(join(RAW, "bcb-focus", "realized.json"));
  const by = new Map<string, [string, Actual][]>();
  for (const e of d.entries as Raw[]) {
    const key = `${e.label}|${e.metric}`;
    const list = by.get(key) ?? [];
    list.push([String(e.target_year), { value: e.value, vintage: `BCB SGS ${e.sgs_series} (retrieved ${d.vintage})` }]);
    by.set(key, list);
  }
  const s = new Map([...by].map(([k, v]) => [k, series(k, v)]));
  const get = (label: string, metricPart: string) => [...s.entries()].find(([k]) => k.startsWith(`${label}|`) && k.includes(metricPart))?.[1];
  return {
    statistic: (e) => String(e.statistic),
    match: ({ e, target }) => {
      const y = target as number;
      switch (e?.label) {
        case "IPCA":
          return lookup(get("IPCA", "IPCA"), y, y, ["December over December in forecast and actual."]);
        case "PIB Total":
          return lookup(get("PIB Total", "GDP"), y, y);
        case "Selic":
          // #66: the Focus report labels the indicator "Over-Selic, fim de período" (effective rate) up to the report of
          // 2004-04-08 and "Meta Taxa Selic" (Copom target) from the report of 2004-04-16.
          if (String(e.survey_date) < SELIC_TARGET_FROM)
            return lookup(get("Selic", "Over-Selic"), y, y, [
              "Survey before 2004-04-16: the Focus indicator was the Over-Selic (effective rate) at year end; the actual is SGS 1178 on the last business day of the year.",
            ]);
          return lookup(get("Selic", "target"), y, y, ["Selic target in force at year end in forecast and actual."]);
        case "Câmbio":
          if (e.definition === "average PTAX sell rate in December")
            return lookup(get("Câmbio", "December average"), y, y, ["Definition from 2021-01-25: December average PTAX, in forecast and actual."]);
          if (e.definition === "PTAX sell rate on the last business day of the year")
            return lookup(get("Câmbio", "last business day"), y, y, ["Definition before 2021-01-25: PTAX on the last business day, in forecast and actual."]);
          throw new Error(`bcb-focus: unknown exchange-rate definition ${e.definition}`);
        default:
          throw new Error(`bcb-focus: no rule for ${e?.label}`);
      }
    },
  };
}

// ---------------------------------------------------------------- EIA AEO

function eia(): Grader {
  const d = readJson(join(RAW, "eia-aeo", "realized.json"));
  const RETRO: Record<string, string> = {
    "AEO Retrospective Review 2010": "retrospective_2010",
    "AEO Retrospective 2022": "retrospective_2022",
    "AEO Retrospective 2025 (data file, pulled August 2025)": "retrospective_2025",
  };
  const vintages = d.vintages as Raw;
  return {
    // Same key as the eia-aeo normalize adapter (src/normalize/sources/numeric.ts, keyRule).
    rowKey: (e) => `${e.series}|${e.unit}|${e.target_year}|${e.dollar_year ?? ""}`,
    match: ({ e, ed, target }) => {
      // #13: AEO2026 is read from its own tables; no retrospective states actuals for it yet.
      if (e?.retrospective === undefined && String(e?.table ?? "").startsWith("AEO2026")) return open("no AEO Retrospective covers AEO2026 yet");
      const retro = RETRO[String(e?.retrospective)];
      if (retro === undefined) throw new Error(`eia-aeo: unknown retrospective ${e?.retrospective}`);
      const v = vintages[retro] as Raw;
      const key = String(e?.series);
      if (e?.dollar_year !== undefined && e?.dollar_year !== null)
        return ungradable("constant dollars of each edition's own dollar year; no actual on that dollar basis was captured");
      const unit = (v.units as Raw)[key];
      if (unit === undefined) return ungradable(`the ${retro.replace("_", " ")} actuals do not include this series`);
      if (unit !== e?.unit) return ungradable(`unit differs from the retrospective's actuals (${e?.unit} vs ${unit})`);
      // #53 audit: two Retrospective 2025 actuals are on another definition than the forecasts.
      if (retro === "retrospective_2025" && key === "solar_generation")
        return ungradable("the AEO Retrospective 2025 actual row is utility-scale solar only; the forecast is all-sector solar including small-scale PV (AEO 2023 states 205.0 billion kWh for 2022, the actual row about 144)");
      if (retro === "retrospective_2025" && key === "total_energy_consumption")
        return ungradable("the AEO Retrospective 2025 actuals use EIA's captured-energy basis for wind, solar and hydro; the forecasts use the fossil-fuel-equivalence basis (the 2021 actual is 97.30 in the 2022 Retrospective and 93.36 in the 2025 one)");
      const values = (v.series as Raw)[key] as Record<string, number>;
      const vintage = `EIA ${retro.replace("retrospective_", "AEO Retrospective ")} actuals (${v.data_as_of})`;
      const s = series(`${retro} ${key}`, Object.entries(values).map(([yy, val]) => [yy, { value: val, vintage }] as [string, Actual]));
      const m = lookup(s, target as number, target as number, ["Actual from the same AEO Retrospective as the forecast, on the same definition and unit."]);
      // #70 (D41): the Retrospective 2022 restates the AEO2005 to AEO2014 transportation (and total) energy projections
      // 0.365 quadrillion Btu lower from 2013 (less before), while the 2025 data file keeps the printed values. Rows of
      // those editions graded against the 2025 actuals carry the restatement as a threshold flag.
      if (m.kind === "actual" && retro === "retrospective_2025" && key === "transportation_energy_consumption" && ed >= "2005" && ed <= "2014")
        return {
          ...m,
          uncertainty: {
            low: -(0.365 / Math.abs(m.actual)) * 100,
            high: 0,
            why: `the AEO Retrospective 2022 restates AEO${ed} transportation energy 0.365 quadrillion Btu lower (the same amount in total energy), the AEO Retrospective 2025 keeps the printed value; on the restated value the error would be ${round((0.365 / Math.abs(m.actual)) * 100, 2)} points lower.`,
          },
        };
      return m;
    },
  };
}

// ---------------------------------------------------------------- IEA WEO

function iea(): Grader {
  const r = readJson(join(RAW, "iea-weo", "realized.json"));
  // IEA's own later statements of history: base-year rows of each edition and the WEO 2025 historical values.
  const stated = new Map<string, { value: number; ed: number; vintage: string }>();
  const put = (tech: string, metric: string, y: number, value: number, ed: number, vintage: string) => {
    const k = `${tech}|${metric}|${y}`;
    const old = stated.get(k);
    if (old === undefined || ed >= old.ed) stated.set(k, { value, ed, vintage });
  };
  for (const f of editionFiles("iea-weo")) {
    const d = readJson(join(RAW, "iea-weo", f));
    const ed = Number(d.edition);
    for (const e of (d.entries ?? []) as Raw[]) {
      if (e.claim_type !== "base_year") continue;
      // Before WEO 2010 the annex row is "Solar" (scope unknown), not "Solar PV": not a PV history.
      if (e.technology === "solar PV" && ed < 2010) continue;
      put(String(e.technology), String(e.metric), Number(e.target_year), Number(e.value), ed, `IEA WEO ${ed}, base-year value`);
    }
  }
  const ember = new Map<string, number>();
  for (const e of r.entries as Raw[]) {
    if (e.publisher === "Ember") ember.set(`${e.technology}|${e.metric}|${e.year}`, Number(e.value));
    // #66: historical columns of later annex tables (WEO 2021 to 2025 restate 2010 and recent years). A later
    // statement overrides an earlier base-year row; within one edition the historical column follows the base year.
    else {
      const by = Number(e.stated_in);
      if (!Number.isFinite(by)) throw new Error(`iea-weo realized.json: IEA entry without stated_in (${e.technology} ${e.metric} ${e.year})`);
      put(String(e.technology), String(e.metric), Number(e.year), Number(e.value), by + 0.5, `IEA WEO ${by} Annex A, historical value`);
    }
  }
  const EMBER_VINTAGE = "Ember Yearly Electricity Data (retrieved 2026-09-27)";
  return {
    match: ({ e, ed, target }) => {
      const y = target as number;
      const tech = String(e?.technology);
      const metric = String(e?.metric);
      const edNum = Number(ed);
      if (tech === "solar PV" && edNum < 2010) {
        if (metric === "generation" && edNum === 2004) {
          const v = ember.get(`solar (PV and CSP)|generation|${y}`);
          if (v === undefined) return y >= 2025 ? open(`no actual captured yet for ${y}`) : ungradable("no Ember value for this year");
          return {
            kind: "actual",
            actual: v,
            vintage: EMBER_VINTAGE,
            notes: ["WEO 2004 states that its 'Solar' row includes solar thermal; Ember 'Solar' is PV plus CSP. Same scope."],
          };
        }
        if (metric === "installed capacity")
          return ungradable("annex row 'Solar' (all solar): no IEA-stated history on this scope, and the Ember capacity basis (AC or DC) is not confirmed");
        return ungradable("annex row 'Solar': the edition does not state whether it includes CSP, so neither IEA solar PV nor Ember PV plus CSP is the same scope");
      }
      const st = stated.get(`${tech}|${metric}|${y}`);
      if (st !== undefined)
        return { kind: "actual", actual: st.value, vintage: st.vintage, notes: ["Actual is the IEA's own later-stated historical value, the same basis as the forecast."] };
      if (y >= LAST_ACTUAL_YEAR) return open(`no IEA-stated value for ${y} captured yet`);
      if (tech === "wind" && metric === "generation") {
        const v = ember.get(`wind|generation|${y}`);
        if (v !== undefined)
          return {
            kind: "actual",
            actual: v,
            vintage: EMBER_VINTAGE,
            notes: ["No IEA-stated value for this year; Ember wind generation used (IEA-stated and Ember wind generation differ by up to 5% in years where both exist)."],
          };
      }
      if (tech === "solar PV") return ungradable("no IEA-stated solar PV value for this year; Ember 'Solar' is PV plus CSP and its capacity basis differs from the IEA's");
      return ungradable("no IEA-stated wind capacity for this year; Ember wind capacity differs from IEA-stated values by up to 9% (2010 to 2013), so it is not the same basis");
    },
  };
}

// ---------------------------------------------------------------- BP Energy Outlook

function bp(): Grader {
  const r = readJson(join(RAW, "bp-energy-outlook", "realized.json"));
  const vintage = "Energy Institute Statistical Review 2025 via OWID energy-data (retrieved 2026-09-28)";
  const pick = (metric: string, v: string) =>
    series(metric, (r.entries as Raw[]).filter((e) => e.metric === metric).map((e) => [String(e.year), { value: Number(e.value), vintage: v }] as [string, Actual]));
  const renewables = pick("renewables share of primary energy (excl. hydro, substitution method)", vintage);
  const carStock = pick("electric car stock (BEV + PHEV)", "IEA Global EV Outlook 2026 via OWID (updated 2026-06-15)");
  return {
    // Same key as the bp normalize adapter (src/normalize/sources/numeric.ts, keyRule). #15: rows appended to 2018 and
    // 2022 after base-year rows get ids above the edition's last id, not their position.
    rowKey: (e) => `${e.metric}|${e.target_year ?? ""}|${e.scenario ?? ""}`,
    match: ({ e, ed, target }) => {
      const m = String(e?.metric);
      const y = target as number;
      if (m.startsWith("renewables share of primary energy")) {
        if (m.includes("incl. bioenergy"))
          return ungradable("bp's renewables definition from 2022 includes bioenergy (bp base year 2019: 11.8%); the EI series excluding hydro (5.2% in 2019) is a different measure");
        // #53 audit, #66, #71: bp's history in EO2018 to EO2020 matches the EI series within 0.1 point; in EO2014 to
        // EO2017 (38% efficiency accounting) each edition's base year sits 0.14 to 0.18 points below it.
        if (ed >= "2014" && ed <= "2017") {
          const r = lookup(renewables, y, y, [
            "Actual: EI renewables share of primary energy minus hydro share (substitution method). bp's own base year in EO2014 to EO2017 sits 0.14 to 0.18 points below this series (EO2014, 2012: 2.36 vs 2.54; EO2015, 2013: 2.71 vs 2.85; EO2016, 2014: 3.00 vs 3.15; EO2017, 2015: 3.34 vs 3.51; #53 audit, #71).",
          ]);
          if (r.kind !== "actual") return r;
          return { ...r, uncertainty: { low: 0.14, high: 0.18, why: "on bp's own accounting of this edition the actual would be 0.14 to 0.18 points lower." } };
        }
        return lookup(renewables, y, y, [
          "Actual: EI renewables share of primary energy minus hydro share (substitution method). bp's own base years in EO2018 to EO2020 match it within 0.1 point (2016: 3.78 vs 3.84; 2017: 4.2 vs 4.30; 2018: 4.7 vs 4.72).",
        ]);
      }
      if (m.includes("liquids demand") || m.startsWith("oil demand")) return ungradable("realized oil is captured in TWh and excludes biofuels; the forecast is in Mb/d; no conversion is made");
      if (m.startsWith("electric cars on the road")) return lookup(carStock, y, y, ["Electric car stock (BEV plus PHEV) in forecast and actual."]);
      return ungradable("no actual on this definition was captured");
    },
  };
}

// ---------------------------------------------------------------- BNEF EVO

function bnef(): Grader {
  const r = readJson(join(RAW, "bnef-evo", "realized.json"));
  const v = "IEA Global EV Outlook 2026 via OWID (updated 2026-06-15)";
  const pick = (metric: string) =>
    series(metric, (r.entries as Raw[]).filter((e) => e.metric === metric).map((e) => [String(e.year), { value: Number(e.value), vintage: v }] as [string, Actual]));
  const sales = pick("global electric car sales (BEV + PHEV)");
  const share = pick("EV share of new car sales, global");
  return {
    match: ({ claim, target }) => {
      const y = target as number;
      const subject = claim.subject_ids[0];
      switch (subject) {
        case "global-passenger-ev-sales":
          return lookup(sales, y, y, ["Passenger EV (BEV plus PHEV) sales; the IEA counts electric cars, the same scope."]);
        case "global-ev-share-of-new-passenger-car-sales": {
          const m = lookup(share, y, y, ["Plug-in share of new passenger car sales; IEA shares are rounded to 2 significant figures from 2022."]);
          // #66: from 2022 the IEA publishes the share as a whole number (15, 18, 21, 25), so the actual is known to +-0.5 points.
          if (m.kind === "actual" && y >= 2022 && Number.isInteger(m.actual))
            return { ...m, uncertainty: { low: -0.5, high: 0.5, why: "the IEA publishes this share rounded to a whole number, so the actual is known only to within 0.5 points." } };
          return m;
        }
        case "global-ev-sales":
          return ungradable("scope of 'EV sales' in EVO 2016 to 2018 is light-duty vehicles or not stated; the IEA actual counts cars only");
        case "ev-price-parity-with-ice":
          return ungradable("price-parity year: no actual captured, and each edition defines parity differently");
        default:
          return ungradable("no actual on this definition was captured (the IEA series covers passenger car sales and their share only)");
      }
    },
  };
}

// ---------------------------------------------------------------- sources

const GRADERS: Record<string, () => Grader> = {
  "imf-weo": imf,
  "oecd-economic-outlook": oecd,
  "world-bank-gep": worldBank,
  "fed-sep": fed,
  "ecb-projections": ecb,
  "cbo-projections": cbo,
  "obr-forecasts": obr,
  "bcb-focus": bcb,
  "eia-aeo": eia,
  "iea-weo": iea,
  "bp-energy-outlook": bp,
  "bnef-evo": bnef,
};

/** How each source's forecasts are matched to actuals. Written into README.md. */
const MATCH_RULES: Record<string, string[]> = {
  "imf-weo": [
    "Actual: IMF WEO April 2026 (DataMapper), the same series and weights (world at PPP).",
    "Group aggregates (world, advanced economies, EMDEs, euro area): the actual uses current composition; graded with a note.",
    "India: fiscal year in both forecast and actual, for editions from the July 2013 Update. Earlier India forecasts are calendar-year figures (#53 audit); they are graded against the WEO April 2013 database (#66), the last IMF vintage on the calendar-year basis (via the DBnomics mirror; imf.org blocks scripted requests). Its latest year is 2012, so 2013 and 2014 targets stay ungradable. WDI is not used: it reports India on a fiscal-year basis (#54).",
    "Ungradable (#53 audit), because the edition's group is a different aggregate: emerging market and developing economies before April 2004 (old 'developing countries', without the transition economies); advanced economies before May 1997 (old 'industrial countries'); world before May 1993 (market-exchange-rate weights, actual is PPP).",
  ],
  "oecd-economic-outlook": [
    "Actual: OECD Economic Outlook 119 (June 2026), the same database variable GDPV_ANNPCT.",
    "Euro area is EA16/EA17 (euro area members of the OECD), not the full euro area. OECD total uses current membership. Graded with a note.",
    "India: fiscal year in both. EO94 and EO95 annex values are working-day adjusted; graded with a note.",
  ],
  "world-bank-gep": [
    "Actual: GEP June 2026 table for 2023 to 2025; World Development Indicators for earlier years. World: the GEP's own later statement (below).",
    "Ungradable: 'High income' and 'Developing countries' (pre-June-2016 groups): the WDI groups use today's income classification.",
    "Ungradable: advanced economies and EMDEs before 2023 (no actual captured).",
    "India: fiscal-year forecasts are graded against the GEP June 2026 table (2023 to 2025) and otherwise against WDI, which reports India on a fiscal-year basis with the GEP year labels (WDI country metadata; WDI 2023 = 7.21 = GEP FY2023/24). realized.json calls the WDI series calendar year; that label is wrong (#54). Forecasts whose table does not state the basis stay ungradable.",
    "World, every edition (#66, #70; D39, D41): the GEP weights World at 1995, 2000, 2005 or 2010 prices, and from June 2021 at average 2010-19 prices; WDI World uses 2015 USD weights, a different aggregate. Graded against the GEP's own later statement of the year on the same weights: the latest later edition with the same price base (from the table note) whose table prints the year as a past year (`world_restated` in realized.json). Ungradable where no such edition exists (the last forecasts before each base change: on 2010 prices, the 2021 and 2022 targets of January 2020 to January 2021) and for GEP 2000, whose table states no base. Until #70, editions from January 2019 were graded against WDI.",
    "Threshold flag (#70, D41): GEP tables print growth to one decimal, so an actual read from a GEP table (World statements, the June 2026 table) is known only within 0.05 points; a row whose error sits on a D18 threshold carries a threshold flag. WDI actuals are unrounded and carry none.",
    "Current-year values in November, December and some January editions are estimates; they are graded as current-year forecasts, with the capture note in the claim.",
    "1990s editions (#11): GEP 1991, 1992, the 1995 and 1996 short-term updates and GEP 1998/99, read by OCR from scanned reports (confidence medium). Their tables weight World at 1987 prices and exchange rates; World is graded against the later 1990s statements on 1987 prices (the 1996 update, GEP 1997, GEP 1998/99); GEP 1998/99 World forecasts are ungradable because GEP 2000 states no base. United States, Japan, China and Brazil are graded against WDI (1990 to 1997 added from the same WDI vintage); India rows state no basis and stay ungradable. Regional aggregates (East Asia and Pacific, South Asia, Sub-Saharan Africa, Latin America and the Caribbean, Middle East and North Africa, Europe and Central Asia) are ungradable: the regions of the time had other membership and weights than today's WDI regions.",
  ],
  "fed-sep": [
    "Actual: FRED/ALFRED latest vintage computed on the SEP definitions: GDP and PCE Q4 over Q4, unemployment Q4 average, federal funds target midpoint at year end.",
    "Vintage refresh (#66): realized.json re-captured 2026-10-02 (GDPC1, PCEPI and PCEPILFE vintages of 2026-09-30) after the BEA revised GDP, PCE and core PCE for 2021 to 2025 (`build.py --realized-only`).",
    "Statistic: the published median (from 2015-09), the central tendency midpoint (2007-10 to 2015-06), and the dot-plot median for the federal funds rate (2012-01 to 2015-06).",
    "Excluded: medians computed from individual projections (not public at the time; already skipped at normalize), the June 2015 medians other than the federal funds rate (published only in September 2015), and longer-run projections (no target year).",
    "Ungradable: 2025 unemployment (BLS published no October 2025 rate).",
  ],
  "ecb-projections": [
    "Actual: euro area with changing composition (the ECB projects the composition of the projection year). HICP: Eurostat prc_hicp_aind.",
    "Real GDP (#66): the ECB's own history in its latest projection exercise (MPD, September 2026, status A rows), working-day adjusted like the projections, one decimal as published. Eurostat nama_10_gdp (used before #66) is not calendar adjusted and differed by 0.1 to 0.2 points, enough to flip verdicts; it stays in realized.json for reference, with an Eurostat namq_10_gdp SCA cross-check for the fixed EA20.",
    "2000-12 to 2013-03 published ranges only: the midpoint is graded. 2013-06 onward: the published point.",
    "Threshold flag (#70, D41): the MPD history is stated to one decimal, so the GDP actual is known only within 0.05 points; a GDP row whose error sits on a D18 threshold (or, for a range midpoint, within 0.05 of one) carries a threshold flag. HICP (#71): Eurostat prc_hicp_aind is also one decimal, so HICP rows get the same flag.",
  ],
  "cbo-projections": [
    "Annual (2000 onward): FRED actuals on CBO's definitions: real GDP annual average, CPI-U annual average, unemployment annual average, 10-year Treasury annual average.",
    "Vintage refresh (#66): realized.json re-captured 2026-10-02 after the BEA revised real GDP and GNP for 2021 to 2025 (`build.py --realized-only`); CPI-U, unemployment, the 10-year rate and the deficits did not change.",
    "Two- and five-year averages: the actual average is computed from annual actuals (geometric for growth and CPI, arithmetic for the 10-year rate). Real GNP before 1992.",
    "Deficits: actual is CBO's own actuals (eval-projections), not FRED FYFSD. Graded in percent of GDP under D18 (#54): forecast and actual, in billions of dollars, are each divided by actual fiscal-year GDP (FRED FYFSD / FYFSGDA188S), as CBO's own evaluations do. A relative error in dollars explodes when the actual is near zero (FY1997 to FY2001).",
    "Ungradable: CPI averages of 1986 to 1989 (CBO forecast the CPI-W), and Aaa bond rate averages (no actual captured).",
  ],
  "obr-forecasts": [
    "GDP: growth computed from ONS ABMI levels (latest release), unrounded. CPI: the OBR database outturn row (ONS CPI annual rate, 3 decimals). The one-decimal ONS series IHYP and D7G7 are not used: rounding flipped verdicts at the D18 thresholds in the #53 audit.",
    "PSNB (% of GDP by D18, £ billion by D16): outturn row of the OBR database. Graded only for EFOs from March 2020; earlier PSNB forecasts used earlier definitions (student-loan reclassification and others) and are ungradable. Checked for #54: the Spring 2026 database restates only one earlier vintage (memo row, March 2019), so no restated series exists for the other pre-2020 EFOs.",
    "Memo rows (restated March 2019, supplementary March 2020) are not claims (skipped at normalize). year_0 values (estimates of the year before publication) are excluded.",
  ],
  "bcb-focus": [
    "Actual: BCB SGS. IPCA December over December (13522), GDP (7326), Selic target at year end (432).",
    "Selic before April 2004 (#66): the Focus report labels the indicator 'Over-Selic, fim de período' (the effective rate) up to the report of 2004-04-08 and 'Meta Taxa Selic' (the Copom target) from 2004-04-16 (weekly reports checked from 2003-12-26 to 2004-06-25; the API holds one series without a label). Surveys before 2004-04-16 are graded against SGS 1178 (effective Selic) on the last business day of the year. The December collection stop agrees: the current-year Selic is collected to the last business day of December up to 2003 and stops after the December Copom meeting from 2004.",
    "Exchange rate by the definition of each survey date: last business day before 2021-01-25 (SGS 3696), December average from then (SGS 3697). Exchange rate is a level (D16).",
  ],
  "eia-aeo": [
    "Actual: the same AEO Retrospective as the forecast (2010, 2022 or 2025), on the same definition and unit. This takes definition over vintage: older retrospectives hold older actuals.",
    "Ungradable (#53 audit): Retrospective 2025 solar generation (the actual row is utility-scale only, the forecast all-sector) and total energy consumption (captured-energy basis in the actual, fossil-fuel-equivalence in the forecast).",
    "Ungradable: constant-dollar prices from the 2022 retrospective (each edition's own dollar year; no actual on that basis). Target years before the edition year are excluded (estimates of the past).",
    "AEO2009 (#66): every series from the March 2009 Reference case of the published AEO2009 report, which the Retrospective 2025 data file holds for all years. The Retrospective 2022 AEO2009 rows are the April 2009 ARRA-updated Reference case (SR/OIAF/2009-03) for all series but solar and wind (imported crude 2009: 39.99 vs 61.09 USD per barrel), so they are not used. AEO2009 rows up to 2021 are graded against the Retrospective 2025 actuals; total energy consumption among them is ungradable (captured-energy basis, above).",
    "AEO2015 and AEO2016 (#70, D41): the Retrospective 2022 rows for AEO2015 and AEO2016 imported crude price (nominal) and AEO2016 transportation energy match no case of the edition: they differ from the printed Reference case tables even in the base year (AEO2016 crude 2015: 52.87 against 46.42 printed; transportation 2015: 27.28 against 28.13), while every other Retrospective 2022 series of these editions (electricity sales, total energy, CO2, petroleum, solar, wind) equals the printed Reference case, which includes the Clean Power Plan. The printed Reference case is in the Retrospective 2025 data file, so these rows are taken from it for every year and graded against its actuals.",
    "Transportation energy, AEO2005 to AEO2014 (#70): the Retrospective 2022 restates these editions' transportation projections lower than printed (0.365 quadrillion Btu a year from 2013, 0.05 to 0.54 before), by the same amount as their total energy, so it is a restatement, not a different case; graded within the Retrospective 2022 as before. The Retrospective 2025 rows of these editions (target years from 2022, and AEO2009 for every year) keep the printed values; a threshold flag names the verdicts the restatement allows. AEO2015 differs by 0.2% at most, AEO2017 on not at all.",
    "AEO2026 (#13): the Counterfactual Baseline case (AEO2026 renamed the Reference case without changing its method), read from the AEO2026 tables with the row codes that reproduce the Retrospective 2025 AEO2025 rows. No retrospective covers it yet, and every target year is after 2025, so its rows are open.",
    "Claims are mapped to raw rows by their D15 natural key through `data/normalized/ids.json`, so re-taken AEO2009 rows with a new unit keep their row.",
  ],
  "iea-weo": [
    "Actual: the IEA's own later-stated history (base-year rows of later editions and the historical columns of the WEO 2021 to 2025 annex tables), the latest statement for each year (#66: a later historical column overrides an earlier base-year row, so 2010 wind capacity is 181 GW as restated from WEO 2021, not WEO 2012's 198 GW). Confirmed for #54: the IEA states capacity on its own basis (for example 2,164 GW of solar PV for 2024 against Ember's 1,880 GW), so an IEA forecast is graded against the IEA's own history, never Ember, wherever the IEA states a value.",
    "Wind generation: Ember where the IEA states no value (2015). Solar PV and wind capacity: no Ember fallback (PV plus CSP scope, capacity basis gap).",
    "Annex row 'Solar' (2002 to 2009): generation graded against Ember PV plus CSP only for WEO 2004, which states that 'Solar' includes solar thermal; other editions and all capacity rows are ungradable.",
    "Scenarios other than the main one are excluded. Edition-level quotes without a value are excluded.",
  ],
  "bp-energy-outlook": [
    "Renewables share of primary energy excluding hydro (2014 to 2019 editions, main case; EO2018 from its summary tables, #15; EO2014 from its .xls summary tables, #71): EI series excluding hydro. bp's base years in EO2018 (2016: 3.78 vs 3.84), EO2019 and EO2020 match it within 0.1 point; in EO2014 to EO2017 each edition's base year sits 0.14 to 0.18 points below it (EO2014, 2012: 2.36 vs 2.54; EO2015, 2013: 2.71 vs 2.85; EO2016, 2014: 3.00 vs 3.15; EO2017, 2015: 3.34 vs 3.51; bp's 38% efficiency accounting; #53 audit). Those rows are graded against the EI series and carry a threshold flag (#66) where a shift of up to 0.18 points would change the verdict.",
    "Ungradable: oil and liquids demand (realized oil captured in TWh without biofuels), the 2022+ renewables definition (includes bioenergy).",
    "From 2020 all rows are scenarios: excluded.",
  ],
  "bnef-evo": [
    "Passenger EV sales and EV share of new passenger car sales: IEA Global EV Outlook 2026 (electric cars, BEV plus PHEV).",
    "EV share from 2022: the IEA publishes whole numbers (15, 18, 21, 25%), so the actual is known within 0.5 points. A row whose error is within 0.5 points of a D18 threshold stays graded and carries a threshold flag in its note (#66).",
    "Ungradable: 'EV sales' of EVO 2016 to 2018 (light-duty or unstated scope), shares of other denominators (light-duty, all vehicles, fleet), price-parity years.",
    "Net Zero scenario rows are excluded.",
  ],
};

/** Measure family per subject, for the summary. */
function family(subject: string, e: Raw | undefined): string {
  const avg = typeof e?.horizon === "string" && e.horizon.endsWith("_average") ? `, ${e.horizon.replace("_year_average", "-year average")}` : "";
  const base = (() => {
    if (subject === "united-states-real-gdp-growth-q4-over-q4") return "real GDP growth, Q4 over Q4";
    if (/real-gdp-growth|real-gnp-growth/.test(subject)) return "real GDP growth";
    if (subject.includes("core-pce")) return "core inflation";
    if (/inflation/.test(subject)) return "inflation";
    if (subject.includes("unemployment")) return "unemployment rate";
    if (/funds-rate|treasury-rate|selic|corporate-bond/.test(subject)) return "interest rate";
    if (/deficit|borrowing/.test(subject)) return "government borrowing";
    if (subject.includes("exchange-rate")) return "exchange rate";
    if (/solar.*capacity/.test(subject)) return "solar capacity";
    if (/solar.*generation/.test(subject)) return "solar generation";
    if (/wind.*capacity/.test(subject)) return "wind capacity";
    if (/wind.*generation/.test(subject)) return "wind generation";
    if (subject === "us-electricity-sales") return "electricity sales";
    if (subject.endsWith("energy-consumption")) return "energy consumption";
    if (subject === "us-energy-co2-emissions") return "CO2 emissions";
    if (/petroleum|oil-demand|liquids-demand/.test(subject)) return "oil consumption";
    if (subject.includes("crude-oil-price")) return "oil price";
    if (subject.includes("natural-gas")) return "natural gas price";
    if (/ev-sales$/.test(subject)) return "EV sales";
    if (/share-of-new/.test(subject)) return "EV sales share";
    if (/fleet|ev-stock/.test(subject)) return "EV fleet";
    if (subject.includes("parity")) return "EV price parity";
    if (subject.includes("renewables-share")) return "renewables share";
    if (subject === "electric-vehicles") return "electric vehicles, other measures";
    throw new Error(`no family for subject ${subject}`);
  })();
  return `${base}${avg}`;
}

// ---------------------------------------------------------------- grading

function ruleFor(unit: string | undefined): NumericRule {
  const u = (unit ?? "").trim();
  return u.startsWith("%") || u === "percent" ? "D18" : "D16";
}

function verdict(rule: NumericRule, err: number): "hit" | "partial" | "miss" {
  const a = Math.abs(err);
  const [hit, partial] = rule === "D18" ? [0.5, 1.0] : [10, 25];
  return a <= hit + EPS ? "hit" : a <= partial + EPS ? "partial" : "miss";
}

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

function targetYear(e: Raw | undefined, claim: Claim): number | null {
  const t = e?.target_year;
  if (typeof t === "number") return t;
  const fy = /^(\d{4})-(\d{2})$/.exec(String(t));
  if (fy) return Number(fy[1]) + 1; // UK fiscal year 2017-18 ends in 2018
  if (claim.target_date) return Number(claim.target_date.slice(0, 4));
  return null;
}

function horizonYears(e: Raw | undefined, published: string, target: number | null): number | null {
  const h = typeof e?.horizon === "string" ? e.horizon : "";
  if (h === "current_year") return 0;
  if (h === "next_year") return 1;
  const plus = /^year_plus_(\d+)$/.exec(h);
  if (plus) return Number(plus[1]);
  const n = /^year_(\d+)$/.exec(h);
  if (n) return Number(n[1]) - 1;
  // From the publication year, not the edition label: AEO 1982 to 1987 came out the year after their title (#53 audit).
  return target === null ? null : target - Number(published.slice(0, 4));
}

function gradeSource(source: string, editions: Map<string, SourceEdition>): NumericGrade[] {
  const grader = (GRADERS[source] as () => Grader)();
  const claims = readJson(join(NORMALIZED, "claims", `${source}.json`)) as unknown as Claim[];
  // Raw rows by claim id: on first assignment nnn is the 1-based row position (D15). Verified below.
  const raw = new Map<string, { e: Raw; ed: string }>();
  const registry = grader.rowKey ? ((readJson(join(NORMALIZED, "ids.json")).sources as Raw)[source] as Record<string, { keys: Record<string, string> }> | undefined) : undefined;
  for (const f of editionFiles(source)) {
    const d = readJson(join(RAW, source, f));
    const ed = String(d.edition);
    const keys = registry?.[ed]?.keys;
    ((d.entries ?? []) as Raw[]).forEach((e, i) => {
      const id = grader.rowKey && keys ? keys[grader.rowKey(e)] : `${source}-${ed}-${String(i + 1).padStart(3, "0")}`;
      if (id === undefined && e.claim_type === "base_year") return; // not a claim: normalize skips base-year rows
      if (id === undefined) throw new Error(`${source} ${ed}: raw row ${i + 1} has no id in ids.json; run pnpm normalize`);
      raw.set(id, { e, ed });
    });
  }
  const rows: NumericGrade[] = [];
  for (const claim of claims) {
    const ed = claim.source_edition_id.slice(source.length + 1);
    const found = raw.get(claim.id);
    const e = found?.e;
    const forecast = claim.value !== undefined && claim.unit !== "year" ? Number(claim.value) : null;
    if (e !== undefined && forecast !== null && Math.abs(forecast - Number(e.value)) > 1e-9)
      throw new Error(`${claim.id}: claim value ${claim.value} does not match raw row value ${e.value}; the id-to-row mapping is broken`);
    const target = targetYear(e, claim);
    const edition0 = editions.get(claim.source_edition_id);
    const horizon = horizonYears(e, edition0?.published ?? ed, target);
    const subject = claim.subject_ids[0] as string;
    const edition = editions.get(claim.source_edition_id);
    if (edition === undefined) throw new Error(`${claim.id}: unknown edition ${claim.source_edition_id}`);
    const base = {
      claim_id: claim.id,
      source_id: source,
      subject_id: subject,
      family: family(subject, e),
      edition: ed,
      published: edition.published,
      target_year: target,
      target_period: e && grader.period ? grader.period(e) : null,
      horizon_years: horizon,
      horizon_label: typeof e?.horizon === "string" ? e.horizon : null,
      statistic: e && grader.statistic ? grader.statistic(e) : null,
      forecast: Number.isFinite(forecast) ? forecast : null,
      actual: null,
      actual_vintage: null,
      unit: claim.unit ?? null,
      rule: null,
      error: null,
      error_unit: null,
      verdict: null,
    };
    const m: Match = (() => {
      if (claim.claim_type !== "forecast") return excluded("scenario, not a forecast: never graded hit or miss");
      if (e === undefined || base.forecast === null) return excluded("no numeric value to grade (edition-level quote or a year-type claim)");
      if (target === null) return excluded("no target year (longer-run projection)");
      if (horizon !== null && horizon < 0) return excluded("target year before the publication year: an estimate of the past, not a forecast");
      if (target > LAST_ACTUAL_YEAR) return open(`target year after ${LAST_ACTUAL_YEAR}`);
      return grader.match({ source, claim, e, ed, target, horizon });
    })();
    // Year-type claims (BNEF parity) have no numeric forecast but get the source's reason when due.
    const m2 = m.kind === "excluded" && claim.unit === "year" && claim.claim_type === "forecast" && target !== null && target <= LAST_ACTUAL_YEAR ? grader.match({ source, claim, e, ed, target, horizon }) : m;
    if (m2.kind !== "actual") {
      rows.push(NumericGrade.parse({ ...base, status: m2.kind, note: m2.reason }));
      continue;
    }
    const rule = m2.rescaled ? "D18" : ruleFor(claim.unit);
    const f = m2.rescaled ? m2.rescaled.forecast : (base.forecast as number);
    if (m2.rescaled) Object.assign(base, { forecast: round(f, 6), unit: m2.rescaled.unit });
    if (rule === "D16" && m2.actual === 0) {
      rows.push(NumericGrade.parse({ ...base, status: "ungradable", note: "actual is zero: relative error undefined" }));
      continue;
    }
    const err = rule === "D18" ? f - m2.actual : ((f - m2.actual) / Math.abs(m2.actual)) * 100;
    const notes = [...m2.notes];
    const lo = num(e?.value_low);
    const hi = num(e?.value_high);
    if (lo !== null && hi !== null)
      notes.push(`Published ${source === "fed-sep" ? "central tendency" : "range"} ${lo} to ${hi}; the actual is ${m2.actual >= lo - EPS && m2.actual <= hi + EPS ? "inside" : "outside"} it.`);
    if (m2.uncertainty) {
      const { low, high, why } = m2.uncertainty;
      const v = verdict(rule, err);
      // The verdict rises with |error|, so the smallest and largest |error| in the range bound the possible verdicts.
      // The stated error is one of the readings, so the range always includes it.
      const [a, b] = [err + Math.min(0, low), err + Math.max(0, high)];
      const ORDER = ["hit", "partial", "miss"];
      const from = ORDER.indexOf(verdict(rule, a < 0 && b > 0 ? 0 : Math.min(Math.abs(a), Math.abs(b))));
      const to = ORDER.indexOf(verdict(rule, Math.max(Math.abs(a), Math.abs(b))));
      const span = ORDER.slice(from, to + 1);
      if (span.length > 1)
        notes.push(`Threshold flag (#66): ${why} The error lies between ${round(a, 2)} and ${round(b, 2)} ${rule === "D18" ? "points" : "percent of the actual"}, so the verdict could be ${span.join(" or ")}; ${v} is graded on the stated values.`);
    }
    rows.push(
      NumericGrade.parse({
        ...base,
        actual: round(m2.actual, 6),
        actual_vintage: m2.vintage,
        rule,
        error: round(err, 4),
        error_unit: rule === "D18" ? "pp" : "percent of actual",
        status: "graded",
        verdict: verdict(rule, err),
        note: notes.join(" "),
      }),
    );
  }
  return rows;
}

// ---------------------------------------------------------------- statistics

function wilson(h: number, n: number): [number, number] {
  const z = 1.959964;
  const p = h / n;
  const den = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / den;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
  return [round(Math.max(0, centre - half), 4), round(Math.min(1, centre + half), 4)];
}

function stats(rows: NumericGrade[]): NumericStats {
  const graded = rows.filter((r) => r.status === "graded");
  const count = (f: (r: NumericGrade) => boolean) => rows.filter(f).length;
  const hits = count((r) => r.verdict === "hit");
  const n = graded.length;
  const errors = (["D18", "D16"] as const)
    .map((rule) => {
      const es = graded.filter((r) => r.rule === rule).map((r) => r.error as number);
      return {
        rule,
        unit: rule === "D18" ? ("pp" as const) : ("percent of actual" as const),
        n: es.length,
        bias: es.length >= MIN_N ? round(es.reduce((a, b) => a + b, 0) / es.length, 3) : null,
        mae: es.length >= MIN_N ? round(es.reduce((a, b) => a + Math.abs(b), 0) / es.length, 3) : null,
      };
    })
    .filter((x) => x.n > 0);
  return {
    n_graded: n,
    hits,
    partials: count((r) => r.verdict === "partial"),
    misses: count((r) => r.verdict === "miss"),
    ungradable: count((r) => r.status === "ungradable"),
    open: count((r) => r.status === "open"),
    excluded: count((r) => r.status === "excluded"),
    hit_rate: n >= MIN_N ? round(hits / n, 4) : null,
    hit_rate_ci95: n >= MIN_N ? wilson(hits, n) : null,
    errors,
  };
}

function bucket(h: number | null): NumericHorizon {
  if (h === null || h < 0) return "none";
  if (h === 0) return "current_year";
  if (h === 1) return "next_year";
  if (h === 2) return "2_years";
  if (h <= 5) return "3_to_5_years";
  if (h <= 10) return "6_to_10_years";
  return "over_10_years";
}
const HORIZONS: NumericHorizon[] = ["current_year", "next_year", "2_years", "3_to_5_years", "6_to_10_years", "over_10_years", "none"];

function groupBy<T>(xs: T[], key: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of xs) {
    const k = key(x);
    const list = m.get(k) ?? [];
    list.push(x);
    m.set(k, list);
  }
  return m;
}

function byHorizon(rows: NumericGrade[]): { horizon: NumericHorizon; stats: NumericStats }[] {
  const g = groupBy(rows, (r) => bucket(r.horizon_years));
  return [{ horizon: "all" as NumericHorizon, stats: stats(rows) }, ...HORIZONS.filter((h) => g.has(h)).map((h) => ({ horizon: h, stats: stats(g.get(h) as NumericGrade[]) }))];
}

interface AuditRecord {
  decision: "confirm" | "correct" | "contest";
  error_type?: string;
  corrected?: { status?: string; verdict?: string; actual?: number };
}

/**
 * Contested audit records whose definition problem the command now fixes (#66): the actual series the row must
 * use (a substring of actual_vintage) and the verdict the audit note gives on that series. The records themselves
 * stay as stored.
 */
const CONTESTS_RESOLVED: Record<string, { vintage: string; verdict: "hit" | "partial" | "miss"; why: string }> = {
  "bcb-focus-2000-12-006": { vintage: "SGS 1178", verdict: "miss", why: "Over-Selic survey graded against SGS 1178 (19.05 on 31 Dec 2001); audit: miss on either series" },
  "bcb-focus-2002-06-005": { vintage: "SGS 1178", verdict: "miss", why: "Over-Selic survey graded against SGS 1178 (24.9 on 31 Dec 2002); audit: miss on either series" },
  "bcb-focus-2002-06-006": { vintage: "SGS 1178", verdict: "miss", why: "Over-Selic survey graded against SGS 1178 (16.33 on 31 Dec 2003); audit: miss on either series" },
  "ecb-projections-2003-09-004": {
    vintage: "ECB MPD",
    verdict: "partial",
    why: "GDP graded against the ECB's own working-day-adjusted history (MPD S26, 2004 = 2.1); the audit gives partial on that series (hit on Eurostat SCA 1.99/2.04)",
  },
};

/**
 * #66 (D39): audit findings that a new capture resolved, counted as fixed in code. Each test is narrow: it names
 * the rows the finding was about and checks that the row now uses the capture that answers it. The audit records
 * themselves are never edited; a D24 re-check pass can confirm or overturn the new grades.
 */
const AUDIT_RESOLVED: Record<string, (id: string, row: NumericGrade, rec: AuditRecord) => boolean> = {
  // The 4 contests: the Retrospective 2022 AEO2009 value was the ARRA-updated case; the row now carries the March 2009 printed value the auditor cited.
  "eia-aeo": (id, row, rec) =>
    /^eia-aeo-2009-/.test(id) && rec.decision === "contest" && rec.error_type === "forecast_value" && row.status === "graded" && /AEO Retrospective 2025/.test(row.actual_vintage ?? ""),
  // India rows before July 2013, corrected to ungradable because no calendar-year actual was captured; now graded on one.
  "imf-weo": (_id, row, rec) => rec.corrected?.status === "ungradable" && row.status === "graded" && /calendar year/.test(row.actual_vintage ?? ""),
};

interface GradeSnap {
  status: string;
  forecast: number | null;
  actual: number | null;
  verdict: string | null;
}

/** A D24 re-check record (data/graded/audit/<source>-recheck-<tag>.json). */
interface RecheckRecord {
  claim_id: string;
  decision: "confirm" | "correct";
  grade_rechecked: GradeSnap;
  checked?: { status?: string; forecast?: number; actual?: number; verdict?: string };
}

const sameNum = (a: number | null | undefined, b: number | null | undefined) =>
  (a === null || a === undefined) === (b === null || b === undefined) && (a === null || a === undefined || Math.abs((a as number) - (b as number)) < 1e-6);
/** The current row has exactly this grade: status, forecast, actual and verdict. */
const sameGrade = (row: NumericGrade, g: GradeSnap) =>
  row.status === g.status && sameNum(row.forecast, g.forecast) && sameNum(row.actual, g.actual) && (row.verdict ?? null) === (g.verdict ?? null);

/**
 * D11 matching audit (#53): data/graded/audit/<source>.json, compared with the current grades, plus the D24 re-check
 * passes data/graded/audit/<source>-recheck-*.json read in name order (a later record replaces an earlier one for the
 * same claim; a re-check may only cover sampled claims). A sampled row counts as follows:
 * - a re-check `confirm` whose grade_rechecked equals the current row: confirmed (or fixed, if the first audit found an error);
 * - a re-check `correct`: fixed when the current row equals what the re-check checked, else residual;
 * - a re-check whose grade no longer equals the current row: pending_recheck;
 * - no re-check: a confirm whose grade changed since the audit (data/graded/audit/audited-grades-53.json, or the grade
 *   the auditor read where 6e11858 changed it, data/graded/audit/audited-grades-53-seen.json, #71) is
 *   pending_recheck; a finding fixed in code by AUDIT_RESOLVED or CONTESTS_RESOLVED (a new capture, not a correction
 *   the auditor wrote) is pending_recheck until a re-check confirms it; other findings as before.
 */
function auditOf(source: string, rows: NumericGrade[]): NumericAudit | undefined {
  const file = join(GRADED, "audit", `${source}.json`);
  if (!existsSync(file)) return undefined;
  const a = readJson(file) as { seed: string; sample: string[]; records: Record<string, AuditRecord> };
  const recs = Object.entries(a.records ?? {});
  if (recs.length === 0) return undefined;
  const sampled = new Set(a.sample);
  // D46: supplementary samples (audit/<source>-supplement-<tag>.json) over rows added after the first audit. Their
  // records count with the first sample's; a supplementary confirm stores the grade it read (grade_audited), and a
  // row whose grade changed since then is pending_recheck.
  const seeds = [a.seed];
  let sampleSize = a.sample.length;
  const supBase: Record<string, GradeSnap> = {};
  for (const f of readdirSync(join(GRADED, "audit"))
    .filter((n) => n.startsWith(`${source}-supplement-`) && n.endsWith(".json"))
    .sort()) {
    const sp = readJson(join(GRADED, "audit", f)) as { seed: string; sample: string[]; records: Record<string, AuditRecord & { grade_audited?: GradeSnap }> };
    seeds.push(sp.seed);
    sampleSize += sp.sample.length;
    for (const id of sp.sample) {
      if (sampled.has(id)) throw new Error(`${f}: ${id} is already in an audit sample of ${source} (D46)`);
      sampled.add(id);
    }
    for (const [id, r] of Object.entries(sp.records ?? {})) {
      if (!sp.sample.includes(id)) throw new Error(`${f}: record ${id} is not in its sample (D46)`);
      recs.push([id, r]);
      if (r.grade_audited) supBase[id] = r.grade_audited;
    }
  }
  const rechecks = new Map<string, RecheckRecord>();
  for (const f of readdirSync(join(GRADED, "audit"))
    .filter((n) => n.startsWith(`${source}-recheck-`) && n.endsWith(".json"))
    .sort()) {
    const rc = readJson(join(GRADED, "audit", f)) as { records: Record<string, RecheckRecord> };
    for (const [id, r] of Object.entries(rc.records ?? {})) {
      if (!sampled.has(id)) throw new Error(`${f}: ${id} is not in the audit sample of ${source}; a re-check may only cover sampled claims (D24)`);
      rechecks.set(id, r);
    }
  }
  const baseOf = (name: string) => {
    const f = join(GRADED, "audit", name);
    return existsSync(f) ? (((readJson(f).sources as Raw)[source] ?? {}) as Record<string, GradeSnap>) : {};
  };
  // #71 (D42): the grade a confirming auditor read. 6e11858 stored the #53 records together with definition changes
  // (CBO deficits in % of GDP, OBR unrounded actuals), so for those confirms the grade seen is the one at 6b1a8a2.
  const baseline = { ...baseOf("audited-grades-53.json"), ...baseOf("audited-grades-53-seen.json"), ...supBase };
  const byId = new Map(rows.map((r) => [r.claim_id, r]));
  let fixed = 0;
  let residual = 0;
  let pending = 0;
  for (const [id, r] of recs) {
    const row = byId.get(id);
    const rc = rechecks.get(id);
    if (row === undefined) {
      if (r.decision !== "confirm") residual++;
      else pending++;
      continue;
    }
    if (rc !== undefined) {
      if (rc.decision === "confirm") {
        if (!sameGrade(row, rc.grade_rechecked)) pending++;
        else if (r.decision !== "confirm") fixed++;
        continue;
      }
      // A re-check correction: fixed when the current row now carries what the re-check checked.
      const c = rc.checked ?? {};
      const ok =
        (c.status === undefined || c.status === row.status) &&
        (c.verdict === undefined || c.verdict === row.verdict) &&
        (c.actual === undefined || sameNum(c.actual, row.actual)) &&
        (c.forecast === undefined || sameNum(c.forecast, row.forecast));
      if (ok) fixed++;
      else residual++;
      continue;
    }
    if (r.decision === "confirm") {
      const b = baseline[id];
      if (b !== undefined && !sameGrade(row, b)) pending++;
      continue;
    }
    if (AUDIT_RESOLVED[source]?.(id, row, r)) {
      pending++;
      continue;
    }
    // A row the code no longer grades publishes no verdict, so the error the audit found is resolved.
    if (row.status !== "graded" && (r.decision === "contest" || r.corrected?.status !== "graded")) {
      fixed += r.decision === "correct" ? 1 : 0;
      continue;
    }
    if (row.status !== "graded" && r.decision === "correct") {
      fixed++;
      continue;
    }
    if (r.decision === "contest") {
      // A contest names a definition problem without a corrected verdict. It is fixed in code when the row now uses
      // the actual series the contest asked for (CONTESTS_RESOLVED) and the verdict the auditor gave for that series;
      // that grade is new, so it waits for a D24 re-check.
      const res = CONTESTS_RESOLVED[id];
      if (res !== undefined && (row.actual_vintage ?? "").includes(res.vintage) && row.verdict === res.verdict) pending++;
      else residual++;
      continue;
    }
    const c = r.corrected ?? {};
    const statusOk = c.status === undefined || c.status === row.status;
    const verdictOk = row.status !== "graded" || c.verdict === undefined || c.verdict === row.verdict;
    if (statusOk && verdictOk) fixed++;
    else residual++;
  }
  const n = recs.length;
  const count = (d: string) => recs.filter(([, r]) => r.decision === d).length;
  const rcs = [...rechecks.values()];
  return {
    seed: seeds.join(" + "),
    sample: sampleSize,
    audited: n,
    confirmed: count("confirm"),
    corrected: count("correct"),
    contested: count("contest"),
    error_rate: round((count("correct") + count("contest")) / n, 4),
    fixed_in_code: fixed,
    residual_errors: residual,
    residual_error_rate: round(residual / n, 4),
    rechecked: rcs.length,
    recheck_confirmed: rcs.filter((r) => r.decision === "confirm").length,
    recheck_corrected: rcs.filter((r) => r.decision === "correct").length,
    pending_recheck: pending,
  };
}

function summarize(all: Map<string, NumericGrade[]>): NumericSummary {
  const sources = [...all.keys()].sort().map((source) => {
    const rows = all.get(source) as NumericGrade[];
    const totals = stats(rows);
    const audit = auditOf(source, rows);
    const ci = totals.hit_rate_ci95;
    const e = audit?.residual_error_rate;
    const fam = groupBy(rows, (r) => r.family);
    const subj = groupBy(rows, (r) => `${r.subject_id}\u0000${r.family}`);
    const eds = groupBy(rows, (r) => r.edition);
    return {
      source_id: source,
      totals,
      ...(audit ? { audit, hit_rate_audit_adjusted95: ci && typeof e === "number" ? ([round(Math.max(0, ci[0] - e), 4), round(Math.min(1, ci[1] + e), 4)] as [number, number]) : null } : {}),
      by_horizon: byHorizon(rows),
      by_family: [...fam.keys()].sort().flatMap((f) => byHorizon(fam.get(f) as NumericGrade[]).map((x) => ({ family: f, ...x }))),
      by_subject: [...subj.keys()].sort().flatMap((k) => {
        const [subject_id, f] = k.split("\u0000") as [string, string];
        return byHorizon(subj.get(k) as NumericGrade[]).map((x) => ({ subject_id, family: f, ...x }));
      }),
      by_edition: [...eds.keys()].sort().map((ed) => {
        const r = eds.get(ed) as NumericGrade[];
        return { edition: ed, published: (r[0] as NumericGrade).published, stats: stats(r) };
      }),
    };
  });
  return NumericSummary.parse({
    note:
      "Deterministic numeric grading (D16, D18, D19). hit_rate = hits / graded rows, with a Wilson 95% interval. audit: the D11 matching audit (#53); hit_rate_audit_adjusted95 widens the interval by the residual audit error rate (D28). errors: bias = mean of forecast minus actual, mae = mean absolute error, in percentage points (D18) or percent of the actual (D16). D11: below 20 graded rows, counts only. Horizon buckets use years between publication and target (0 = current year).",
    min_graded_for_rate: MIN_N,
    sources,
  });
}

/** D17 side by side, for subjects that 3 or more sources grade at the current or next year. */
const COMPARISON_CAVEATS: Record<string, string[]> = {
  "euro-area-real-gdp-growth": [
    "OECD 'Euro area' is the euro area members of the OECD (EA16/EA17), not the full euro area.",
    "ECB rows are graded against the ECB's own working-day-adjusted history (MPD, September 2026); the other sources against their own databases.",
  ],
  "united-states-real-gdp-growth": ["CBO year_1 comes from January or February baselines; IMF, OECD and World Bank current-year values come from spring and autumn editions."],
  "brazil-real-gdp-growth": ["BCB Focus values are the median of market forecasts, sampled quarterly; the others are institutional forecasts."],
  "india-real-gdp-growth": ["World Bank India rows are fiscal-year forecasts graded against fiscal-year actuals (GEP June 2026 for 2023 to 2025, WDI before); rows whose table does not state the basis are ungradable."],
  "united-kingdom-real-gdp-growth": ["OBR year_1 is the calendar year of publication of each EFO (spring and autumn)."],
};

function compare(all: Map<string, NumericGrade[]>): NumericComparison {
  const rows = [...all.values()].flat().filter((r) => (r.horizon_years === 0 || r.horizon_years === 1) && !r.family.includes("average"));
  const bySubject = groupBy(rows, (r) => r.subject_id);
  const subjects: NumericComparison["subjects"] = [];
  for (const subject of [...bySubject.keys()].sort()) {
    const srows = bySubject.get(subject) as NumericGrade[];
    const gradedSources = new Set(srows.filter((r) => r.status === "graded").map((r) => r.source_id));
    if (gradedSources.size < 3) continue;
    for (const horizon of ["current_year", "next_year"] as const) {
      const hrows = srows.filter((r) => bucket(r.horizon_years) === horizon && gradedSources.has(r.source_id));
      const per = groupBy(hrows, (r) => r.source_id);
      const names = [...per.keys()].sort();
      const yearsOf = (s: string) => new Set((per.get(s) as NumericGrade[]).filter((r) => r.status === "graded").map((r) => r.target_year as number));
      const common = names.length === 0 ? [] : [...yearsOf(names[0] as string)].filter((y) => names.every((s) => yearsOf(s).has(y))).sort((a, b) => a - b);
      subjects.push({
        subject_id: subject,
        horizon,
        caveats: COMPARISON_CAVEATS[subject] ?? [],
        sources: names.map((s) => {
          const ys = [...yearsOf(s)];
          return {
            source_id: s,
            first_target_year: ys.length ? Math.min(...ys) : null,
            last_target_year: ys.length ? Math.max(...ys) : null,
            stats: stats(per.get(s) as NumericGrade[]),
          };
        }),
        common_years: {
          target_years: common,
          sources: names.map((s) => ({ source_id: s, stats: stats((per.get(s) as NumericGrade[]).filter((r) => r.status === "graded" && common.includes(r.target_year as number))) })),
        },
      });
    }
  }
  return NumericComparison.parse({
    note: "D17: same subject, same horizon, sources in alphabetical order. No rank and no total score. Intervals that overlap mean the sources cannot be told apart. common_years restricts each source to the target years that all listed sources graded.",
    subjects,
  });
}

// ---------------------------------------------------------------- reports

const pct = (x: number | null) => (x === null ? "n/a" : `${(x * 100).toFixed(0)}%`);
function rateCell(s: NumericStats): string {
  if (s.hit_rate === null || s.hit_rate_ci95 === null) return `counts only (${s.hits}/${s.n_graded} hits)`;
  return `${pct(s.hit_rate)} [${pct(s.hit_rate_ci95[0])}, ${pct(s.hit_rate_ci95[1])}]`;
}
function errCell(s: NumericStats, which: "bias" | "mae"): string {
  const cell = (v: number | null, unit: string) => (v === null ? "n/a" : `${v > 0 && which === "bias" ? "+" : ""}${v.toFixed(2)} ${unit === "pp" ? "pp" : "%"}`);
  return s.errors.map((x) => cell(x[which], x.unit)).join("; ") || "n/a";
}

function readme(all: Map<string, NumericGrade[]>, summary: NumericSummary, comparison: NumericComparison): string {
  const L: string[] = [];
  L.push("# Graded numeric forecasts", "");
  L.push(
    "Generated by `pnpm grade:numeric` (`src/grade/numeric.ts`). Do not edit by hand. Deterministic arithmetic, not judgment (D19): the D7 two-agent rule does not apply. The D11 audit for these sources checks the forecast-to-actual matching on a random sample.",
    "",
  );
  L.push("## Rules", "");
  L.push("- **Rates in percent (D18):** GDP growth, inflation, unemployment, interest and policy rates, shares and ratios stated in percent. Error = forecast minus actual, in percentage points. `hit` within 0.5 points, `partial` within 1.0, else `miss`.");
  L.push("- **Levels (D16):** GW, TWh, barrels, prices, vehicles, billions of dollars or pounds. Error = (forecast minus actual) / |actual|, in percent. `hit` within 10%, `partial` within 25%, else `miss`.");
  L.push("- **Status.** `graded`: forecast and actual on the same definition. `ungradable`: the definitions differ or no actual on the forecast's definition exists; the reason is in `note`. `open`: target year after 2025, or the actual series does not reach the target year yet. `excluded`: not a forecast to grade (scenario, longer-run projection with no year, estimate of a past year, value not public at the time, quote without a value).");
  L.push("- **Actual.** The latest captured value on the forecast's definition, with its vintage in `actual_vintage`. Where the latest vintage uses a different definition, definition wins (EIA, IEA).");
  L.push("- **Threshold flag (#66, #70).** Where the actual is known only within a range (published rounding, or a basis gap the source states), a graded row whose verdict could change inside that range stays graded on the stated values; its note starts the caveat with `Threshold flag` and names the verdicts the range allows. One-decimal actuals (GEP tables, ECB MPD GDP history, Eurostat HICP for the ECB) are known within 0.05 points (D41).");
  L.push("- **Horizon.** `horizon_years` = years between publication and target (0 = current year), from the source's own label where it has one (`horizon_label`).");
  L.push("- **Statistics (D11).** Hit rate = hits / graded, with a Wilson 95% interval. Bias = mean error, MAE = mean absolute error. Below 20 graded rows: counts only.", "");
  L.push("## Files", "");
  L.push("- `numeric/<source>.json`: one row per claim of the source (shape `NumericGrade` in `src/schema.ts`), with `status`; graded rows carry actual, error and verdict.");
  L.push("- `numeric/summary.json`: per source, by horizon, by measure family, by subject and by edition (`NumericSummary`).");
  L.push("- `numeric/comparison.json`: the D17 side-by-side view for subjects that 3 or more sources grade (`NumericComparison`).", "");
  L.push("## Counts per source", "");
  L.push("| Source | Claims | Graded | Hit | Partial | Miss | Ungradable | Open | Excluded | Hit rate [95% CI] |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const s of summary.sources) {
    const t = s.totals;
    const n = (all.get(s.source_id) as NumericGrade[]).length;
    L.push(`| ${s.source_id} | ${n} | ${t.n_graded} | ${t.hits} | ${t.partials} | ${t.misses} | ${t.ungradable} | ${t.open} | ${t.excluded} | ${rateCell(t)} |`);
  }
  L.push("");
  L.push("## Matching audit (D11, D20, #53)", "");
  L.push(
    "An agent checked a fixed-seed sample of graded rows per source (`node scripts/numeric-audit-sample.mjs <source>`, seed `d11:<source>:numeric`, at least 50 rows or 10%, misses weighted 1.5): forecast as printed, actual series and definition, year, actual value. Records are in `data/graded/audit/<source>.json`. Rows added after the first audit get a supplementary fixed-seed sample over the new rows only (D46: `--supplement <tag> --editions <list>`, seed `d11:<source>:numeric:<tag>`, same size rule and weighting) in `data/graded/audit/<source>-supplement-<tag>.json`; its records count together with the first sample's (OECD: 50 rows over the 29 editions added in issue #10, tag `vintages`, and 50 rows over the 20 editions added from oecd.org PDFs, tag `pdfs`; World Bank GEP: all 18 graded rows of the five 1990s editions added in issue #11, tag `1990s`). A matching error found in the sample is fixed in this command for every row; `residual` counts sampled rows whose grade still differs from the audit. The audit-adjusted interval widens the hit-rate interval by the residual error rate (D28). The sample is not redrawn after a fix (D24), so a sampled row may now be ungradable. D24 re-check passes are in `data/graded/audit/<source>-recheck-<tag>.json`, read in name order; a later record replaces an earlier one for the same claim, and a re-check may only cover sampled claims. A finding that a later capture answered (D38, D39, #66: the AEO2009 contests, the IMF India rows before July 2013, the early Focus Selic and ECB GDP contests) counts as fixed in code only when a re-check confirms the row on its current grade. A sampled row whose current grade no audit or re-check has seen counts as `pending re-check`, neither fixed nor residual: a confirmed row whose grade changed since the audit (against `data/graded/audit/audited-grades-53.json`, the grades the audit records refer to, or, where commit 6e11858 changed a confirmed row in the same commit that stored the records, against the grade the auditor read in `data/graded/audit/audited-grades-53-seen.json`: 44 CBO deficit rows and 44 OBR rows, #71), a re-checked row that changed again, or a capture fix without a confirming re-check. A re-check correction is residual until the row carries what the re-check checked.",
    "",
    "| Source | Audited | Confirm | Correct | Contest | Error rate found | Fixed in code | Residual | Re-checked (confirm / correct) | Pending re-check | Audit-adjusted interval |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const s of summary.sources) {
    const a = s.audit;
    if (a === undefined) {
      L.push(`| ${s.source_id} | audit pending | | | | | | | | | |`);
      continue;
    }
    const adj = s.hit_rate_audit_adjusted95;
    L.push(
      `| ${s.source_id} | ${a.audited} of ${a.sample} | ${a.confirmed} | ${a.corrected} | ${a.contested} | ${pct(a.error_rate)} | ${a.fixed_in_code} | ${a.residual_errors} (${pct(a.residual_error_rate)}) | ${a.rechecked} (${a.recheck_confirmed} / ${a.recheck_corrected}) | ${a.pending_recheck} | ${adj ? `[${pct(adj[0])}, ${pct(adj[1])}]` : "counts only"} |`,
    );
  }
  L.push("");
  L.push("## Headline comparison: real GDP growth (D17)", "");
  L.push("Sources in alphabetical order. Not a ranking. Hit rate with Wilson 95% interval; bias and MAE in percentage points; all target years each source graded.", "");
  const head = (subject: string, title: string) => {
    for (const horizon of ["current_year", "next_year"] as const) {
      const c = comparison.subjects.find((x) => x.subject_id === subject && x.horizon === horizon);
      if (c === undefined) continue;
      L.push(`**${title}, ${horizon.replace("_", " ")}**`, "");
      L.push("| Source | Target years | n graded | Hit rate [95% CI] | Bias | MAE |", "|---|---|---|---|---|---|");
      for (const s of c.sources) L.push(`| ${s.source_id} | ${s.first_target_year ?? "-"} to ${s.last_target_year ?? "-"} | ${s.stats.n_graded} | ${rateCell(s.stats)} | ${errCell(s.stats, "bias")} | ${errCell(s.stats, "mae")} |`);
      L.push("", `Common target years (${c.common_years.target_years.length}): ${c.common_years.target_years.join(", ") || "none"}.`, "");
      L.push("| Source | n graded | Hit rate [95% CI] | Bias | MAE |", "|---|---|---|---|---|");
      for (const s of c.common_years.sources) L.push(`| ${s.source_id} | ${s.stats.n_graded} | ${rateCell(s.stats)} | ${errCell(s.stats, "bias")} | ${errCell(s.stats, "mae")} |`);
      if (c.caveats.length) L.push("", ...c.caveats.map((x) => `- ${x}`));
      L.push("");
    }
  };
  head("united-states-real-gdp-growth", "United States");
  head("euro-area-real-gdp-growth", "Euro area");
  L.push("**World.** No three sources forecast the same world measure. The IMF weights the world at purchasing power parity (`world-real-gdp-growth`); the World Bank at market exchange rates (`world-real-gdp-growth-market-exchange-rates`). D13 keeps them apart, so they are shown next to each other but are not the same subject.", "");
  L.push("| Source | Subject | Horizon | n graded | Hit rate [95% CI] | Bias | MAE |", "|---|---|---|---|---|---|---|");
  for (const [src, subj] of [["imf-weo", "world-real-gdp-growth"], ["world-bank-gep", "world-real-gdp-growth-market-exchange-rates"]] as const) {
    const s = summary.sources.find((x) => x.source_id === src);
    for (const h of ["current_year", "next_year"] as const) {
      const c = s?.by_subject.find((x) => x.subject_id === subj && x.horizon === h);
      if (c) L.push(`| ${src} | ${subj} | ${h.replace("_", " ")} | ${c.stats.n_graded} | ${rateCell(c.stats)} | ${errCell(c.stats, "bias")} | ${errCell(c.stats, "mae")} |`);
    }
  }
  L.push("", "Other subjects with 3 or more sources are in `numeric/comparison.json`: " + [...new Set(comparison.subjects.map((c) => `\`${c.subject_id}\``))].join(", ") + ".", "");
  L.push("## Definition matches and exclusions per source", "");
  for (const source of [...all.keys()].sort()) {
    const rows = all.get(source) as NumericGrade[];
    L.push(`### ${source}`, "");
    for (const line of MATCH_RULES[source] ?? []) L.push(`- ${line}`);
    const reasons = groupBy(
      rows.filter((r) => r.status === "ungradable" || r.status === "excluded"),
      (r) => `${r.status}: ${r.note.replace(/ \(.* ends in \d{4}\)$/, "")}`,
    );
    if (reasons.size > 0) {
      L.push("", "| Status and reason | Rows |", "|---|---|");
      for (const [k, v] of [...reasons].sort((a, b) => b[1].length - a[1].length)) L.push(`| ${k.replace(/\|/g, "/")} | ${v.length} |`);
    }
    L.push("");
  }
  L.push("## Re-run", "", "```", "pnpm grade:numeric", "```", "");
  L.push("The command reads `data/normalized/claims/<source>.json` and `data/raw/<source>/` (edition files and `realized.json`). It maps each claim to its raw row by the D15 first-assignment position and checks that the values agree; a mismatch stops the command. Every row is validated with Zod before it is written.");
  return `${L.join("\n")}\n`;
}

function progressMd(done: { source: string; rows: NumericGrade[]; time: string }[], pending: string[]): string {
  const L = ["# Numeric grading progress", "", "Written by `pnpm grade:numeric` after each source.", "", "| Source | Status | Claims | Graded | Ungradable | Open | Excluded | Time |", "|---|---|---|---|---|---|---|---|"];
  for (const d of done) {
    const c = (s: string) => d.rows.filter((r) => r.status === s).length;
    L.push(`| ${d.source} | graded | ${d.rows.length} | ${c("graded")} | ${c("ungradable")} | ${c("open")} | ${c("excluded")} | ${d.time} |`);
  }
  for (const p of pending) L.push(`| ${p} | pending | | | | | | |`);
  return `${L.join("\n")}\n`;
}

// ---------------------------------------------------------------- main

function main(): void {
  const editions = new Map((readJson(join(NORMALIZED, "source_editions.json")) as unknown as SourceEdition[]).map((e) => [e.id, e]));
  const order = Object.keys(GRADERS);
  const all = new Map<string, NumericGrade[]>();
  const done: { source: string; rows: NumericGrade[]; time: string }[] = [];
  for (const source of order) {
    const rows = gradeSource(source, editions);
    all.set(source, rows);
    writeJson(join(GRADED, "numeric", `${source}.json`), rows);
    done.push({ source, rows, time: new Date().toISOString().replace(/\.\d+Z$/, "Z") });
    writeText(join(GRADED, "PROGRESS.md"), progressMd(done, order.slice(done.length)));
    const c = (s: string) => rows.filter((r) => r.status === s).length;
    console.log(`${source}: ${rows.length} claims, ${c("graded")} graded, ${c("ungradable")} ungradable, ${c("open")} open, ${c("excluded")} excluded`);
  }
  const summary = summarize(all);
  writeJson(join(GRADED, "numeric", "summary.json"), summary);
  const comparison = compare(all);
  writeJson(join(GRADED, "numeric", "comparison.json"), comparison);
  writeText(join(GRADED, "README.md"), readme(all, summary, comparison));
  console.log(`summary: ${summary.sources.length} sources; comparison: ${comparison.subjects.length} subject-horizon tables`);
}

main();
