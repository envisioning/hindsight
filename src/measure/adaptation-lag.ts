/**
 * measure:adaptation-lag: do institutions update when the evidence changes? (#86, objective 3)
 * Run with `pnpm measure:adaptation-lag`.
 *
 * Definitions are PROPOSED in docs/proposals/adaptation-lag.md and are not a decision yet.
 * Deterministic, like D19: the same inputs always give the same files. No judgment is made
 * here. Numeric paths come from the D19 grades; Hype Cycle readings come from the D21
 * timelines (settled where adjudicated, otherwise each blind builder's) and revisions.json.
 *
 * Reads data/graded/numeric/*.json, data/normalized/claims/gartner-hype-cycle.json,
 * data/normalized/revisions.json and data/raw/gartner-hype-cycle/timeline*.json.
 * Writes data/measures/adaptation-lag/ (numeric-paths.json, numeric-shocks.json,
 * hype-cycle.json, summary.json, README.md).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  AdaptationHypeSubject,
  AdaptationPath,
  AdaptationShockRow,
  type AdaptationHypeClass,
  type AdaptationHypeReading,
  type AdaptationVintage,
  type Claim,
  type NumericGrade,
  type Revision,
} from "../schema.ts";
import { OUT as NORMALIZED, RAW, REPO, type Raw, readJson, writeJson, writeText } from "../normalize/lib.ts";

const GRADED = join(REPO, "data", "graded", "numeric");
const OUT = join(REPO, "data", "measures", "adaptation-lag");
const HC = join(RAW, "gartner-hype-cycle");
/** Latest Hype Cycle edition captured. A subject listed in it has not exited (right-censored). */
const LAST_EDITION = 2025;
const MIN_N = 20;
const EPS = 1e-9;
/** D18 and D16 hit bands. */
const BAND = { D18: 0.5, D16: 10 } as const;

// ---------------------------------------------------------------- helpers

const round = (x: number, d = 3): number => Math.round(x * 10 ** d) / 10 ** d;

function wilson(h: number, n: number): [number, number] {
  const z = 1.959964;
  const p = h / n;
  const den = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / den;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
  return [round(Math.max(0, centre - half), 4), round(Math.min(1, centre + half), 4)];
}

/** D28: widen by the audit error rate on both sides, clipped to [0, 1]. */
function widen(ci: [number, number], e: number | null): [number, number] | null {
  return e === null ? null : [round(Math.max(0, ci[0] - e), 4), round(Math.min(1, ci[1] + e), 4)];
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? (s[m] as number) : ((s[m - 1] as number) + (s[m] as number)) / 2;
}

function quartiles(xs: number[]): [number, number] | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const q = (p: number) => {
    const i = (s.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return round((s[lo] as number) + ((s[hi] as number) - (s[lo] as number)) * (i - lo), 1);
  };
  return [q(0.25), q(0.75)];
}

/** Month index (year * 12 + month - 1) of a YYYY-MM or YYYY-MM-DD date; null for a bare year. */
function monthIndex(d: string): number | null {
  const m = d.match(/^(\d{4})-(\d{2})/);
  return m ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
}

function countBy<T>(xs: T[], key: (x: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of xs) out[key(x)] = (out[key(x)] ?? 0) + 1;
  return out;
}

// ---------------------------------------------------------------- numeric paths

/** Last month of the target period. UK fiscal years end in March, US federal fiscal years in September. */
function periodEnd(g: NumericGrade): { year: number; month: number } {
  const y = g.target_year as number;
  if (g.target_period && /^fiscal year/i.test(g.target_period)) {
    if (g.source_id === "obr-forecasts") return { year: y, month: 3 };
    if (g.source_id === "cbo-projections") return { year: y, month: 9 };
  }
  return { year: y, month: 12 };
}

/** Multi-year averages have no single period end; they are left out of the paths. */
function isAverage(g: NumericGrade): boolean {
  return /average/i.test(g.horizon_label ?? "") || /average/i.test(g.family) || /^\d{4}-\d{4}$/.test(g.target_period ?? "");
}

function buildPaths(sources: string[]): AdaptationPath[] {
  const paths: AdaptationPath[] = [];
  for (const source of sources) {
    const rows = (readJson(join(GRADED, `${source}.json`)) as unknown as NumericGrade[]).filter(
      (g) => g.status === "graded" && g.target_year !== null && !isAverage(g),
    );
    const groups = new Map<string, NumericGrade[]>();
    for (const g of rows) {
      const k = [g.subject_id, g.family, g.statistic ?? "", g.target_period ?? "", g.target_year, g.unit ?? "", g.rule].join("|");
      const list = groups.get(k) ?? [];
      list.push(g);
      groups.set(k, list);
    }
    for (const list of groups.values()) {
      list.sort((a, b) => (a.published < b.published ? -1 : a.published > b.published ? 1 : a.claim_id < b.claim_id ? -1 : 1));
      const first = list[0] as NumericGrade;
      const rule = first.rule as "D18" | "D16";
      const end = periodEnd(first);
      const endIdx = end.year * 12 + end.month - 1;
      const vintages: AdaptationVintage[] = list.map((g) => {
        const mi = monthIndex(g.published);
        return {
          claim_id: g.claim_id,
          edition: g.edition,
          published: g.published,
          months_before_end: mi === null ? null : endIdx - mi,
          forecast: g.forecast as number,
          error: g.error as number,
          in_band: Math.abs(g.error as number) <= BAND[rule] + EPS,
        };
      });
      const fi = vintages.findIndex((v) => v.in_band);
      let si = vintages.length;
      while (si > 0 && (vintages[si - 1] as AdaptationVintage).in_band) si--;
      const at = (i: number) => ({ index: i, edition: (vintages[i] as AdaptationVintage).edition, months_before_end: (vintages[i] as AdaptationVintage).months_before_end });
      paths.push(
        AdaptationPath.parse({
          source_id: source,
          subject_id: first.subject_id,
          family: first.family,
          statistic: first.statistic,
          target_year: first.target_year,
          target_period: first.target_period,
          unit: first.unit,
          rule,
          period_end: `${end.year}-${String(end.month).padStart(2, "0")}`,
          actual: first.actual,
          vintages,
          first_in_band: fi < 0 ? null : at(fi),
          settled_in_band: si < vintages.length ? at(si) : null,
        }),
      );
    }
  }
  return paths;
}

// ---------------------------------------------------------------- shocks

interface Shock {
  id: string;
  label: string;
  /** The month the contradicting evidence became public (YYYY-MM). The trigger edition is the first one published in a later month. */
  start: string;
  start_note: string;
  target_years: number[];
  /** Families the shock applies to; null for all. */
  families: RegExp | null;
}

const SHOCKS: Shock[] = [
  {
    id: "gfc-2008",
    label: "Global financial crisis",
    start: "2008-09",
    start_note: "Lehman Brothers filed for bankruptcy on 15 September 2008.",
    target_years: [2008, 2009],
    families: null,
  },
  {
    id: "covid-2020",
    label: "COVID-19 pandemic",
    start: "2020-03",
    start_note: "The WHO called COVID-19 a pandemic on 11 March 2020; lockdowns in Europe and the US followed that month.",
    target_years: [2020],
    families: null,
  },
  {
    id: "inflation-2021",
    label: "Inflation surge 2021-22",
    start: "2021-05",
    start_note: "US CPI for April 2021 (4.2% over a year earlier), published 12 May 2021, was the first print of the surge far above target. One start month for every economy: regional starts differ.",
    target_years: [2021, 2022],
    families: /inflation/i,
  },
];

/** -1 before or in the start month, +1 after it, 0 when only the publication year is known and it is the start year. */
function side(published: string, start: string): -1 | 0 | 1 {
  const s = monthIndex(start) as number;
  const m = monthIndex(published);
  if (m !== null) return m <= s ? -1 : 1;
  const y = Number(published.slice(0, 4));
  const sy = Number(start.slice(0, 4));
  return y < sy ? -1 : y > sy ? 1 : 0;
}

function shockRows(paths: AdaptationPath[]): AdaptationShockRow[] {
  const out: AdaptationShockRow[] = [];
  for (const shock of SHOCKS) {
    const s = monthIndex(shock.start) as number;
    for (const p of paths) {
      if (!shock.target_years.includes(p.target_year)) continue;
      if (shock.families && !shock.families.test(p.family)) continue;
      const before = p.vintages.filter((v) => side(v.published, shock.start) === -1);
      const after = p.vintages.filter((v) => side(v.published, shock.start) === 1);
      const b = before[before.length - 1];
      const t = after[0];
      if (!b || !t) continue;
      const k = after.findIndex((v) => v.in_band);
      const reachedAt = k >= 0 ? (after[k] as AdaptationVintage) : null;
      const outcome = b.in_band ? "in_band_before" : reachedAt ? "reached" : "censored";
      const mi = reachedAt ? monthIndex(reachedAt.published) : null;
      out.push(
        AdaptationShockRow.parse({
          shock_id: shock.id,
          source_id: p.source_id,
          subject_id: p.subject_id,
          family: p.family,
          statistic: p.statistic,
          target_year: p.target_year,
          rule: p.rule,
          before: { edition: b.edition, error: b.error, in_band: b.in_band },
          trigger: { edition: t.edition, error: t.error, in_band: t.in_band },
          outcome,
          lag_editions: outcome === "reached" ? k + 1 : null,
          lag_months: outcome === "reached" && mi !== null ? mi - s : null,
          editions_after: after.length,
          censored_side: outcome === "censored" ? ((after[after.length - 1] as AdaptationVintage).error > 0 === b.error > 0 ? "short" : "overshot") : null,
          error_closed_at_trigger: b.error === 0 ? null : round(1 - Math.abs(t.error) / Math.abs(b.error), 3),
        }),
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------- numeric summaries

interface AuditInfo {
  residual_error_rate: number | null;
}

function auditRates(): Map<string, AuditInfo> {
  const s = readJson(join(GRADED, "summary.json"));
  const m = new Map<string, AuditInfo>();
  for (const src of s.sources as Raw[]) m.set(src.source_id as string, { residual_error_rate: (src.audit?.residual_error_rate as number | undefined) ?? null });
  return m;
}

function shareBlock(k: number, n: number, e: number | null) {
  if (n < MIN_N) return { k, n, share: null, ci95: null, ci95_audit_adjusted: null, withheld: `fewer than ${MIN_N} paths (D11): counts only` };
  const ci = wilson(k, n);
  return { k, n, share: round(k / n, 4), ci95: ci, ci95_audit_adjusted: widen(ci, e), withheld: null };
}

function pathSummary(paths: AdaptationPath[], audits: Map<string, AuditInfo>) {
  const bySource = new Map<string, AdaptationPath[]>();
  for (const p of paths) bySource.set(p.source_id, [...(bySource.get(p.source_id) ?? []), p]);
  const rows: Raw[] = [];
  for (const source of [...bySource.keys()].sort()) {
    const ps = bySource.get(source) as AdaptationPath[];
    const e = audits.get(source)?.residual_error_rate ?? null;
    const fams = new Map<string, AdaptationPath[]>();
    for (const p of ps) fams.set(`${p.family}|${p.rule}`, [...(fams.get(`${p.family}|${p.rule}`) ?? []), p]);
    for (const [fk, fp] of [...fams.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      const [family, rule] = fk.split("|");
      const multi = fp.filter((p) => p.vintages.length >= 2);
      const settled = multi.filter((p) => p.settled_in_band !== null);
      const months = settled.map((p) => p.settled_in_band?.months_before_end).filter((m): m is number => typeof m === "number");
      const firstMonths = multi.map((p) => p.vintages[0]?.months_before_end).filter((m): m is number => typeof m === "number");
      rows.push({
        source_id: source,
        family,
        rule,
        paths: fp.length,
        paths_with_2_or_more_vintages: multi.length,
        median_vintages: median(multi.map((p) => p.vintages.length)),
        median_months_before_end_first_vintage: multi.length >= MIN_N ? median(firstMonths) : null,
        ever_in_band: shareBlock(multi.filter((p) => p.first_in_band !== null).length, multi.length, e),
        settled_in_band: shareBlock(settled.length, multi.length, e),
        /** Months before the end of the target period at which the path entered the band for good (D11: n >= 20). */
        settled_months_before_end: months.length >= MIN_N ? { n: months.length, median: median(months), iqr: quartiles(months) } : { n: months.length, median: null, iqr: null },
        audit_residual_error_rate: e,
      });
    }
  }
  return rows;
}

function lagBucket(r: AdaptationShockRow): string {
  if (r.outcome === "censored") return `censored_${r.censored_side}`;
  if (r.outcome !== "reached") return r.outcome;
  if (r.lag_months === null) return `reached_month_unknown`;
  if (r.lag_months <= 3) return "reached_0_to_3_months";
  if (r.lag_months <= 6) return "reached_4_to_6_months";
  if (r.lag_months <= 12) return "reached_7_to_12_months";
  return "reached_after_12_months";
}

function shockSummary(rows: AdaptationShockRow[]) {
  const out: Raw[] = [];
  for (const shock of SHOCKS) {
    const rs = rows.filter((r) => r.shock_id === shock.id);
    const sources = [...new Set(rs.map((r) => r.source_id))].sort();
    out.push({
      shock_id: shock.id,
      label: shock.label,
      start: shock.start,
      start_note: shock.start_note,
      target_years: shock.target_years,
      families: shock.families ? shock.families.source : "all",
      sources: sources.map((source) => {
        const sr = rs.filter((r) => r.source_id === source);
        const contradicted = sr.filter((r) => r.outcome !== "in_band_before");
        const reached = contradicted.filter((r) => r.outcome === "reached");
        const months = reached.map((r) => r.lag_months).filter((m): m is number => m !== null);
        return {
          source_id: source,
          paths: sr.length,
          in_band_before: sr.length - contradicted.length,
          contradicted: contradicted.length,
          reached: reached.length,
          censored: contradicted.length - reached.length,
          buckets: countBy(contradicted, lagBucket),
          by_target_year: Object.fromEntries(
            shock.target_years.map((y) => {
              const yr = contradicted.filter((r) => r.target_year === y);
              const ym = yr.filter((r) => r.outcome === "reached").map((r) => r.lag_months).filter((m): m is number => m !== null);
              return [String(y), { contradicted: yr.length, reached: yr.filter((r) => r.outcome === "reached").length, median_lag_months: yr.length >= MIN_N ? median(ym) : null }];
            }),
          ),
          /** D11: medians only over 20 or more contradicted paths. A censored path has no lag, so the median is over reached paths and says so. */
          median_lag_editions: contradicted.length >= MIN_N ? median(reached.map((r) => r.lag_editions as number)) : null,
          median_lag_months: contradicted.length >= MIN_N ? median(months) : null,
        };
      }),
    });
  }
  return out;
}

// ---------------------------------------------------------------- Hype Cycle

const BAND_YEARS: Record<string, number> = { "less than 2 years": 2, "2 to 5 years": 5, "5 to 10 years": 10 };

interface Timeline {
  subject_id: string;
  reading: string;
  year_5pct: number | null;
  year_mainstream: number | null;
  abandoned: boolean;
  abandoned_year: number | null;
  ambiguous?: boolean;
}

interface Listing {
  edition: number;
  claim_id: string;
  band: string | null;
  phase: string | null;
}

interface Change {
  edition: number;
  change: string;
  note: string | null;
}

function classOf(t: Timeline): AdaptationHypeClass {
  if (t.ambiguous === true || /^ambiguous:/i.test(t.reading ?? "")) return "ambiguous";
  if (t.year_mainstream !== null) return "mainstream";
  if (t.abandoned) return "failed";
  return "stalled";
}

function readingOf(which: AdaptationHypeReading["timeline"], t: Timeline, listings: Listing[], changes: Change[], exit: number | null): AdaptationHypeReading {
  const cls = classOf(t);
  const base = {
    timeline: which,
    class: cls,
    year_5pct: t.year_5pct,
    year_mainstream: t.year_mainstream,
    abandoned_year: t.abandoned ? t.abandoned_year : null,
    contradiction_year: null,
    listings_after_contradiction: null,
    first_move_toward_evidence: null,
    arrival_call: null,
    late_listings: null,
    exit_gap_years: null,
  };
  if (cls === "ambiguous") return { ...base, bucket: "ambiguous" };
  const firstListed = (listings[0] as Listing).edition;
  if (cls === "mainstream") {
    const ym = t.year_mainstream as number;
    const call = listings.find((l) => l.band === "less than 2 years" || l.phase === "plateau");
    const late = listings.filter((l) => l.edition > ym && l.band !== null && l.band !== "less than 2 years" && l.band !== "obsolete before plateau").length;
    let bucket: string;
    if (call) {
      const gap = call.edition - ym;
      bucket = gap < -2 ? "arrival_called_early" : gap > 2 ? "arrival_called_late" : "arrival_called_on_time";
    } else bucket = exit === null ? "arrival_not_called_still_listed" : "arrival_never_called";
    return { ...base, arrival_call: call ? { edition: call.edition, gap_years: call.edition - ym } : null, late_listings: late, exit_gap_years: exit === null ? null : exit - ym, bucket };
  }
  // failed or stalled
  const placed = listings.find((l) => l.band !== null && BAND_YEARS[l.band] !== undefined);
  let c: number | null = placed ? placed.edition + (BAND_YEARS[placed.band as string] as number) + 2 : null;
  if (cls === "failed" && t.abandoned_year !== null) {
    const ay = Math.max(t.abandoned_year, firstListed);
    c = c === null ? ay : Math.min(c, ay);
  }
  if (c === null) return { ...base, bucket: "no_graded_placement" };
  if (c > LAST_EDITION) return { ...base, contradiction_year: c, bucket: "not_yet_contradicted" };
  const after = listings.filter((l) => l.edition >= c).length;
  const move = changes.find(
    (ch) => ch.edition > (placed?.edition ?? firstListed) && (ch.change === "delayed" || ch.change === "dropped" || ch.change === "obsolete"),
  );
  if (!move) return { ...base, contradiction_year: c, listings_after_contradiction: after, bucket: "not_moved_censored" };
  const lag = move.edition - c;
  const bucket = lag < 0 ? "moved_before_contradiction" : lag <= 2 ? "moved_0_to_2_years_after" : lag <= 5 ? "moved_3_to_5_years_after" : "moved_over_5_years_after";
  return { ...base, contradiction_year: c, listings_after_contradiction: after, first_move_toward_evidence: { edition: move.edition, change: move.change, lag_years: lag }, bucket };
}

function hypeCycle(): AdaptationHypeSubject[] {
  const claims = (readJson(join(NORMALIZED, "claims", "gartner-hype-cycle.json")) as unknown as Claim[]).filter((c) => c.published !== false);
  const year = (id: string) => Number((id.match(/gartner-hype-cycle-(\d{4})/) as RegExpMatchArray)[1]);
  const listingsBy = new Map<string, Listing[]>();
  for (const c of claims) {
    const s = c.subject_ids[0] as string;
    listingsBy.set(s, [...(listingsBy.get(s) ?? []), { edition: year(c.id), claim_id: c.id, band: c.horizon_band ?? null, phase: c.phase ?? null }]);
  }
  const revisions = (readJson(join(NORMALIZED, "revisions.json")) as unknown as Revision[]).filter((r) => r.prior_claim_id.startsWith("gartner-hype-cycle-"));
  const changesBy = new Map<string, Change[]>();
  for (const r of revisions) {
    const s = r.subject_id as string;
    const ed = r.new_claim_id ? year(r.new_claim_id) : year(r.prior_claim_id) + 1;
    changesBy.set(s, [...(changesBy.get(s) ?? []), { edition: ed, change: r.change, note: r.note ?? null }]);
  }
  const subjects = (readJson(join(HC, "timeline-subjects.json")).subjects as Raw[]).map((s) => ({ id: s.subject_id as string, name: s.name as string }));
  const tl = (f: string) => new Map((readJson(join(HC, f)).timelines as Timeline[]).map((t) => [t.subject_id, t]));
  const A = tl("timelines-builderA.json");
  const B = tl("timelines-builderB.json");
  const settled = tl("timelines-adjudicated-d20.json");
  const passes = readdirSync(HC)
    .map((f) => f.match(/^timelines-adjudicated-d20-pass(\d+)\.json$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .sort((a, b) => Number(a[1]) - Number(b[1]));
  for (const m of passes) for (const [k, t] of tl(m[0])) settled.set(k, t);

  const out: AdaptationHypeSubject[] = [];
  for (const s of subjects.sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const listings = (listingsBy.get(s.id) ?? []).sort((a, b) => a.edition - b.edition);
    if (listings.length === 0) throw new Error(`timeline subject ${s.id} has no Hype Cycle claim`);
    const changes = (changesBy.get(s.id) ?? []).slice();
    for (const l of listings) if (l.band === "obsolete before plateau") changes.push({ edition: l.edition, change: "obsolete", note: "marked obsolete before plateau" });
    changes.sort((a, b) => a.edition - b.edition);
    const last = (listings[listings.length - 1] as Listing).edition;
    const exit = last >= LAST_EDITION ? null : last + 1;
    let basis: AdaptationHypeSubject["basis"];
    let readings: AdaptationHypeReading[];
    const st = settled.get(s.id);
    if (st) {
      basis = "settled";
      readings = [readingOf("settled", st, listings, changes, exit)];
    } else {
      const a = A.get(s.id);
      const b = B.get(s.id);
      if (!a || !b) throw new Error(`no builder timeline for ${s.id}`);
      const ra = readingOf("builderA", a, listings, changes, exit);
      const rb = readingOf("builderB", b, listings, changes, exit);
      readings = [ra, rb];
      basis = ra.class !== rb.class ? "unsettled" : ra.bucket !== rb.bucket ? "years_differ" : "agreed";
    }
    out.push(AdaptationHypeSubject.parse({ subject_id: s.id, name: s.name, listings, changes, exit_edition: exit, basis, readings }));
  }
  return out;
}

/** The bucket a subject counts in: its settled or agreed bucket, else `builder-dependent` or `unsettled class`. */
function subjectBucket(s: AdaptationHypeSubject): { class: string; bucket: string } {
  const r0 = s.readings[0] as AdaptationHypeReading;
  if (s.basis === "unsettled") return { class: "unsettled", bucket: "builders_disagree_on_class" };
  if (s.basis === "years_differ") return { class: r0.class, bucket: "builder_dependent" };
  return { class: r0.class, bucket: r0.bucket };
}

function hypeSummary(subjects: AdaptationHypeSubject[], auditError: number | null) {
  const counted = subjects.map((s) => ({ s, ...subjectBucket(s) }));
  const block = (cls: string[], hitBuckets: string[], measurable: (b: string) => boolean) => {
    const rs = counted.filter((c) => cls.includes(c.class));
    const meas = rs.filter((c) => measurable(c.bucket));
    return {
      subjects: rs.length,
      buckets: countBy(rs, (c) => c.bucket),
      measurable: meas.length,
      share: shareBlock(meas.filter((c) => hitBuckets.includes(c.bucket)).length, meas.length, auditError),
      share_of: hitBuckets,
    };
  };
  const stalledFailed = counted.filter((c) => c.class === "failed" || c.class === "stalled");
  const lags = stalledFailed.filter((c) => c.bucket.startsWith("moved_")).map((c) => c.s.readings[0]?.first_move_toward_evidence?.lag_years).filter((x): x is number => typeof x === "number");
  const mainstream = counted.filter((c) => c.class === "mainstream" && c.bucket.startsWith("arrival_called"));
  const gaps = mainstream.map((c) => c.s.readings[0]?.arrival_call?.gap_years).filter((x): x is number => typeof x === "number");
  const firmMain = counted.filter((c) => c.class === "mainstream" && c.bucket !== "builder_dependent");
  const exitGaps = firmMain.map((c) => c.s.readings[0]?.exit_gap_years).filter((x): x is number => typeof x === "number");
  const exitBucket = (g: number | null | undefined) => (g === null || g === undefined ? "still_listed" : g < -2 ? "left_chart_over_2_years_before_mainstream" : g > 2 ? "left_chart_over_2_years_after_mainstream" : "left_chart_within_2_years_of_mainstream");
  /** Editions listed, from first listing to exit, per class: if Gartner drops failed and successful technologies at the same pace, a drop says little about the evidence. */
  const tenure = Object.fromEntries(
    ["failed", "stalled", "mainstream"].map((cls) => {
      const rs = counted.filter((c) => c.class === cls && c.bucket !== "builder_dependent");
      const n = rs.map((c) => c.s.listings.length);
      return [cls, { subjects: rs.length, median_listings: rs.length >= MIN_N ? median(n) : null, listings_iqr: rs.length >= MIN_N ? quartiles(n) : null, still_listed: rs.filter((c) => c.s.exit_edition === null).length }];
    }),
  );
  return {
    subjects: subjects.length,
    by_basis: countBy(subjects, (s) => s.basis),
    by_class: countBy(counted, (c) => c.class),
    tenure_by_class: tenure,
    first_move_by_change: countBy(
      stalledFailed.filter((c) => c.bucket.startsWith("moved_")),
      (c) => c.s.readings[0]?.first_move_toward_evidence?.change ?? "none",
    ),
    mainstream_exit: {
      buckets: countBy(firmMain, (c) => exitBucket(c.s.readings[0]?.exit_gap_years)),
      median_exit_gap_years: exitGaps.length >= MIN_N ? median(exitGaps) : null,
      exit_gap_iqr: exitGaps.length >= MIN_N ? quartiles(exitGaps) : null,
      n: exitGaps.length,
      note: "exit edition minus mainstream year, settled and agreed subjects; negative: Gartner took it off the chart before it was mainstream",
    },
    failed_or_stalled: {
      ...block(["failed", "stalled"], ["moved_before_contradiction", "moved_0_to_2_years_after"], (b) => b.startsWith("moved_") || b === "not_moved_censored"),
      note: "share = moved toward the evidence (delayed, dropped, obsolete) before or within 2 years of the contradiction year, over subjects whose contradiction year has passed and whose bucket does not depend on the builder",
      median_lag_years: lags.length >= MIN_N ? median(lags) : null,
      lag_years_iqr: lags.length >= MIN_N ? quartiles(lags) : null,
      n_lags: lags.length,
    },
    mainstream: {
      ...block(["mainstream"], ["arrival_called_on_time"], (b) => b.startsWith("arrival_called") || b === "arrival_never_called"),
      note: "share = arrival called (band under 2 years or plateau phase) within 2 years either side of the mainstream year, over subjects with an arrival call or none before exit",
      median_arrival_gap_years: gaps.length >= MIN_N ? median(gaps) : null,
      arrival_gap_iqr: gaps.length >= MIN_N ? quartiles(gaps) : null,
      n_gaps: gaps.length,
      late_listings_total: counted.filter((c) => c.class === "mainstream" && c.s.basis !== "years_differ").reduce((a, c) => a + (c.s.readings[0]?.late_listings ?? 0), 0),
    },
    audit_error_rate: auditError,
  };
}

// ---------------------------------------------------------------- README

function fmtShare(b: { k: number; n: number; share: number | null; ci95: [number, number] | null; ci95_audit_adjusted: [number, number] | null }): string {
  if (b.share === null || b.ci95 === null) return `counts only (${b.k}/${b.n})`;
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const adj = b.ci95_audit_adjusted ? `; audit-adjusted [${pct(b.ci95_audit_adjusted[0])}, ${pct(b.ci95_audit_adjusted[1])}]` : "";
  return `${pct(b.share)} [${pct(b.ci95[0])}, ${pct(b.ci95[1])}]${adj} (${b.k}/${b.n})`;
}

function readme(pathRows: Raw[], shocks: Raw[], hype: Raw, counts: { paths: number; shockRows: number; hype: number }): string {
  const L: string[] = [];
  L.push("# Adaptation lag (#86): PROPOSED measure");
  L.push("");
  L.push("Generated by `pnpm measure:adaptation-lag` (`src/measure/adaptation-lag.ts`). Do not edit by hand. The definitions are a proposal (`docs/proposals/adaptation-lag.md`), not a decision: nothing here is published until MZ approves them. Deterministic (like D19): no agent judgment is made by the command.");
  L.push("");
  L.push("Publishers are side by side in alphabetical order, never ranked (D6, D17). Below 20 rows a share or median is withheld and counts are shown (D11).");
  L.push("");
  L.push("## Files");
  L.push("");
  L.push(`- \`numeric-paths.json\`: ${counts.paths} forecast paths (\`AdaptationPath\`): every graded vintage of one publisher's forecast of one series for one target period, with the error, whether it is in the hit band, the months before the end of the target period, the first vintage inside the band and the vintage from which it stayed inside.`);
  L.push(`- \`numeric-shocks.json\`: ${counts.shockRows} rows (\`AdaptationShockRow\`): each path whose target period a shock hit, the forecast standing before the shock, the trigger edition and the lag to the band.`);
  L.push(`- \`hype-cycle.json\`: ${counts.hype} subjects (\`AdaptationHypeSubject\`): Gartner's listings and changes per technology, and the adaptation reading under the D21 timeline (settled, or each blind builder's).`);
  L.push("- `summary.json`: the tables below.");
  L.push("");
  L.push("## Method");
  L.push("");
  L.push("**Numeric paths.** Input: the graded rows of `data/graded/numeric/` (D19), the same actuals and matching. A path is one source, subject, family, statistic, target period, unit and rule; vintages are its editions, oldest first. Multi-year averages (CBO 2- and 5-year averages) have no single period end and are left out. A vintage is in the band when |error| is within the hit band of its rule: 0.5 points (D18) or 10% of the actual (D16). The period ends in December, in March for UK fiscal years (OBR) and in September for US fiscal years (CBO). `months_before_end` is null where only the publication year is known (CBO 1976 to 1983, most EIA AEO editions).");
  L.push("");
  L.push("**Shocks.** A shock has a start month: the month the contradicting evidence became public. The repo holds no quarterly or monthly actual releases, so the trigger is the first edition published in a month after the start month, not the first data release. A path counts when it has a vintage in or before the start month and one after. `in_band_before`: the standing forecast was already inside the band. `reached`: a later vintage entered the band; the lag is the number of editions after the start month up to and including that one, and the months from the start month to its publication. `censored`: no vintage of the target period entered the band (the publisher stops forecasting a period once it ends); `short` when the last vintage still erred on the same side as before the shock, `overshot` when it moved past the actual (after COVID, most forecasters cut 2020 too far). Editions dated only by year count as after the start only in a later year.");
  L.push("");
  for (const s of shocks) L.push(`- \`${s.shock_id}\` (${s.label}): start ${s.start}. ${s.start_note} Target years ${(s.target_years as number[]).join(", ")}; families: ${s.families}.`);
  L.push("");
  L.push("**Hype Cycle.** For each of the 199 D21 timeline subjects: Gartner's listings (edition, band, phase), the changes in `revisions.json` (the edition the change is visible in) plus any `obsolete before plateau` marker, and the exit (the first edition after the last listing; none while listed in 2025). The timeline is the settled one where an adjudicator settled it (D20, latest D24 pass), otherwise each blind builder's, read separately. No new grading.");
  L.push("");
  L.push("- Class: `mainstream` (a mainstream year), `failed` (abandoned, never mainstream), `stalled` (neither), `ambiguous` (no dominant reading, D16).");
  L.push("- Failed or stalled: the contradiction year is the first graded placement's placed year plus 2 (the year the placement can no longer be a D16 hit), or the abandonment year when earlier (not before the first listing). The move toward the evidence is the first change after that placement that delayed the band, dropped the subject (even for one edition) or marked it obsolete. Lag = move edition minus contradiction year; negative means Gartner moved first. Advances and renames are listed in `changes` but are not a move toward the evidence.");
  L.push("- Mainstream: the arrival call is the first edition with a band under 2 years or the plateau phase. Gap = call edition minus mainstream year; on time within 2 years either side (the D16 window). Late listings are editions after the mainstream year that still placed it 2 or more years from the plateau.");
  L.push("- Basis: `settled` and `agreed` subjects count in their bucket; `years_differ` (same class, builders' years put it in different buckets) counts as `builder_dependent`; `unsettled` (builders disagree on the class) counts as `builders_disagree_on_class`. Both are excluded from the shares and wait for a grading wave.");
  L.push("");
  L.push("## Numeric: when forecasts enter the band");
  L.push("");
  L.push("Paths with 2 or more vintages. Settled = from that vintage on, every vintage is inside the band. Months before end: median and interquartile range of the settled vintage. Shares with Wilson 95% and the D28 interval widened by the source's residual matching-audit error rate.");
  L.push("");
  L.push("| Source | Family | Rule | Paths (2+ vintages) | Median vintages | Ever in band | Settled in band | Settled, months before end: median [IQR] |");
  L.push("|---|---|---|---|---|---|---|---|");
  for (const r of pathRows) {
    const sm = r.settled_months_before_end as { n: number; median: number | null; iqr: [number, number] | null };
    L.push(`| ${r.source_id} | ${r.family} | ${r.rule} | ${r.paths_with_2_or_more_vintages} | ${r.median_vintages ?? ""} | ${fmtShare(r.ever_in_band)} | ${fmtShare(r.settled_in_band)} | ${sm.median === null ? `counts only (n=${sm.n})` : `${sm.median} [${sm.iqr?.[0]}, ${sm.iqr?.[1]}] (n=${sm.n})`} |`);
  }
  L.push("");
  L.push("## Numeric: lag after shocks");
  L.push("");
  for (const s of shocks) {
    L.push(`**${s.label}** (start ${s.start}; target years ${(s.target_years as number[]).join(", ")}; families: ${s.families})`);
    L.push("");
    L.push("| Source | Paths | In band before | Contradicted | Reached band | Censored | Reached / contradicted by target year | Median lag, editions | Median lag, months | Lag buckets (contradicted paths) |");
    L.push("|---|---|---|---|---|---|---|---|---|---|");
    for (const r of s.sources as Raw[]) {
      const b = Object.entries(r.buckets as Record<string, number>)
        .sort()
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join("; ");
      const by = Object.entries(r.by_target_year as Record<string, Raw>)
        .map(([y, v]) => `${y}: ${v.reached}/${v.contradicted}`)
        .join(", ");
      L.push(`| ${r.source_id} | ${r.paths} | ${r.in_band_before} | ${r.contradicted} | ${r.reached} | ${r.censored} | ${by} | ${r.median_lag_editions ?? "counts only"} | ${r.median_lag_months ?? "counts only"} | ${b} |`);
    }
    L.push("");
  }
  L.push("Medians are over contradicted paths that reached the band; censored paths have no lag and are counted beside them. Editions are not comparable across sources (BCB Focus and Fed SEP publish more often than the IMF); months are.");
  L.push("");
  L.push("## Hype Cycle");
  L.push("");
  const fs = hype.failed_or_stalled as Raw;
  const ms = hype.mainstream as Raw;
  L.push(`Subjects: ${hype.subjects}. Basis: ${Object.entries(hype.by_basis as Record<string, number>).map(([k, v]) => `${k} ${v}`).join(", ")}. Class: ${Object.entries(hype.by_class as Record<string, number>).map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  L.push("");
  L.push("**Read this first.** On the Emerging Technologies chart, failed, stalled and mainstream technologies are all listed for a median of about two editions (table below). Almost every failed or stalled subject left the chart by a drop, years before its first placement could be contradicted. That is the chart's churn, not evidence of adaptation: the failed-or-stalled share below should not be read or published as \"Gartner updates quickly\". The informative Hype Cycle figures are the arrival calls and the exit timing of technologies that did become mainstream.");
  L.push("");
  L.push(`**Failed or stalled** (${fs.subjects} subjects). Buckets: ${Object.entries(fs.buckets as Record<string, number>).sort().map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join("; ")}.`);
  L.push("");
  L.push(`- Moved toward the evidence before or within 2 years of the contradiction year: ${fmtShare(fs.share)}.`);
  L.push(`- Lag in years (move edition minus contradiction year), over ${fs.n_lags} subjects with a move: median ${fs.median_lag_years ?? "withheld"}, IQR ${fs.lag_years_iqr ? `[${fs.lag_years_iqr[0]}, ${fs.lag_years_iqr[1]}]` : "withheld"}.`);
  L.push("");
  L.push(`**Mainstream** (${ms.subjects} subjects). Buckets: ${Object.entries(ms.buckets as Record<string, number>).sort().map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join("; ")}.`);
  L.push("");
  L.push(`- Arrival called within 2 years of the mainstream year: ${fmtShare(ms.share)}.`);
  L.push(`- Arrival gap in years (call edition minus mainstream year), over ${ms.n_gaps} subjects with a call: median ${ms.median_arrival_gap_years ?? "withheld"}, IQR ${ms.arrival_gap_iqr ? `[${ms.arrival_gap_iqr[0]}, ${ms.arrival_gap_iqr[1]}]` : "withheld"}.`);
  L.push(`- Late listings (an edition after the mainstream year still placing it 2 or more years from the plateau), summed over settled and agreed subjects: ${ms.late_listings_total}.`);
  L.push("");
  const me = hype.mainstream_exit as Raw;
  L.push(`**Exit from the chart, mainstream subjects** (exit edition minus mainstream year, ${me.n} subjects that left): median ${me.median_exit_gap_years ?? "withheld"}, IQR ${me.exit_gap_iqr ? `[${me.exit_gap_iqr[0]}, ${me.exit_gap_iqr[1]}]` : "withheld"}. Buckets: ${Object.entries(me.buckets as Record<string, number>).sort().map(([k, v]) => `${k.replace(/_/g, " ")} ${v}`).join("; ")}.`);
  L.push("");
  L.push(`**First move by change** (failed or stalled): ${Object.entries(hype.first_move_by_change as Record<string, number>).sort().map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  L.push("");
  L.push("**Editions listed per class** (settled and agreed subjects): a drop says little about the evidence if Gartner drops failed and successful technologies at the same pace.");
  L.push("");
  L.push("| Class | Subjects | Median editions listed [IQR] | Still listed in 2025 |");
  L.push("|---|---|---|---|");
  for (const [cls, t] of Object.entries(hype.tenure_by_class as Record<string, Raw>)) L.push(`| ${cls} | ${t.subjects} | ${t.median_listings === null ? "counts only" : `${t.median_listings} [${t.listings_iqr[0]}, ${t.listings_iqr[1]}]`} | ${t.still_listed} |`);
  L.push("");
  L.push(`Shares carry the Wilson 95% interval and the D28 interval widened by the Hype Cycle D11 audit error rate (${hype.audit_error_rate}).`);
  L.push("");
  L.push("## Caveats");
  L.push("");
  L.push("- **Proposed definitions.** Every threshold here (start months, trigger rule, contradiction year, what counts as a move) is in the proposal and may change on MZ's review.");
  L.push("- **Hindsight band.** In band is judged against the latest actual (D18), not the data the forecaster had. A forecast can enter the band by luck, and a revised actual can move a path in or out. First-release actuals are not captured.");
  L.push("- **No data-release trigger.** Quarterly and monthly actual releases are not in the repo; the trigger is the first edition after a fixed start month, so the lag in months is measured from the start month, not from the first release that contradicted each forecast. One start month per shock for every economy (inflation especially started at different times in the US, euro area, UK and Brazil).");
  L.push("- **Cadence.** Lag in editions depends on how often a source publishes; compare months, not editions, across sources.");
  L.push("- **Censoring.** A path that never enters the band before the target period ends is censored, not a lag of zero or infinity. A Hype Cycle subject still listed in 2025 without a move is censored.");
  L.push("- **A Gartner drop is not always a verdict.** The Emerging Technologies chart drops entries that matured, moved to another Hype Cycle or lost Gartner's interest; a drop is counted as a move toward the evidence for a failed or stalled subject, but the data cannot say why Gartner dropped it.");
  L.push("- **Timelines.** One wrong year in a D21 timeline moves a subject's bucket (D21 cost). Subjects whose bucket depends on the builder are shown, not counted.");
  L.push("- **Plateau versus mainstream.** Gartner's plateau and band under 2 years are read as Gartner's call that mainstream adoption has arrived; D16's mainstream threshold (20% of users, or 50% of new units) is not Gartner's definition.");
  L.push("- **Rankings (WEF, Eurasia) and trend lists (D33)** are not measured here: see the proposal.");
  L.push("");
  L.push("## Validation rows");
  L.push("");
  L.push("Not exported. `src/export/validation.ts` supports `measure` rows only for the D31, D32 and D34 measures, with a fixed `ValidationMeasure` list. Adding adaptation lag needs new measure names and an export step; this is proposed in `docs/proposals/adaptation-lag.md` and left for after the definitions are approved.");
  L.push("");
  L.push("## Re-run");
  L.push("");
  L.push("```");
  L.push("pnpm grade:numeric            # only if the numeric grades changed");
  L.push("pnpm measure:adaptation-lag");
  L.push("```");
  L.push("");
  return L.join("\n");
}

// ---------------------------------------------------------------- main

function main(): void {
  const sources = readdirSync(GRADED)
    .filter((f) => f.endsWith(".json") && f !== "summary.json" && f !== "comparison.json")
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
  const audits = auditRates();
  const paths = buildPaths(sources);
  writeJson(join(OUT, "numeric-paths.json"), paths);
  const shocks = shockRows(paths);
  writeJson(join(OUT, "numeric-shocks.json"), shocks);
  const subjects = hypeCycle();
  writeJson(join(OUT, "hype-cycle.json"), subjects);
  const final = readJson(join(HC, "final-d20.json"));
  const pathRows = pathSummary(paths, audits);
  const shockRowsSummary = shockSummary(shocks);
  const hype = hypeSummary(subjects, (final.audit?.error_rate as number | undefined) ?? null);
  writeJson(join(OUT, "summary.json"), {
    measure: "adaptation lag (#86)",
    status: "proposed: definitions in docs/proposals/adaptation-lag.md await MZ; not published",
    note: "Publishers side by side, alphabetical, never ranked (D6, D17). No share or median below 20 rows (D11). Intervals: Wilson 95% and D28 audit-adjusted.",
    numeric_paths: pathRows,
    shocks: shockRowsSummary,
    hype_cycle: hype,
  });
  writeText(join(OUT, "README.md"), readme(pathRows, shockRowsSummary, hype, { paths: paths.length, shockRows: shocks.length, hype: subjects.length }));
  console.log(`numeric: ${paths.length} paths over ${sources.length} sources; shocks: ${shocks.length} rows; hype cycle: ${subjects.length} subjects`);
}

main();
