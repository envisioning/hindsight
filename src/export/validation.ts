/**
 * The `validation` table of the release export (#3, #40, D43): per-source agreement, audit and interval
 * figures, read from the files the pipelines write. Figures are copied, not recomputed, except where D43
 * says so (Wilson intervals of D34 coverage shares, D28 widening of D33 shares). Rows are checked against
 * `ValidationRow` by the export, which fails closed. `warnings` lists files that disagree with each other;
 * they are reported, not repaired.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { ValidationRow } from "../schema.ts";
import { RAW, REPO } from "../normalize/lib.ts";

type Row = Record<string, unknown>;
type Obj = Record<string, any>;
type Pair = [number, number];

const MIN_N = 20;
const GRADED_NUMERIC = join(REPO, "data", "graded", "numeric", "summary.json");
const read = (p: string): Obj => JSON.parse(readFileSync(p, "utf8"));
const rel = (source: string, f: string): string => `data/raw/${source}/${f}`;
const round = (x: number, d: number): number => Math.round(x * 10 ** d) / 10 ** d;

/** Wilson 95% interval, rounded as scripts/final-d20.mjs rounds it. */
function wilson(k: number, n: number): Pair | null {
  if (!n) return null;
  const z = 1.96;
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [round((c - r) / d, 3), round((c + r) / d, 3)];
}

/** D28: widen by the audit error rate on both sides, clipped to [0, 1]. */
function widen(ci: Pair | null, e: number | null): Pair | null {
  return ci && e !== null ? [Math.max(0, round(ci[0] - e, 3)), Math.min(1, round(ci[1] + e, 3))] : null;
}

const decisions = (records: Obj): { audited: number; confirmed: number; corrected: number; contested: number } => {
  const recs = Object.values(records) as Obj[];
  return {
    audited: recs.length,
    confirmed: recs.filter((r) => r.decision === "confirm").length,
    corrected: recs.filter((r) => r.decision === "correct").length,
    contested: recs.filter((r) => r.decision === "contest").length,
  };
};
const errorRate = (a: { audited: number; corrected: number; contested: number }): number | null => (a.audited ? round((a.corrected + a.contested) / a.audited, 3) : null);

/** Every column, null or empty, so each row has the same shape in JSON and CSV. */
function blank(source_id: string, kind: ValidationRow["kind"], scope: string, rule: string): Row {
  return {
    source_id, kind, scope, rule, measure: null, n: null, n_graded: null, k: null, share: null, ci95: null, ci95_audit_adjusted: null, rate_withheld: null, counts: {},
    kappa: null, agreement_n: null, agreement_agreed: null, raw_agreement: null, passes_d11: null, adjudicated: null,
    audit_seed: null, audit_sample: null, audited: null, audit_confirmed: null, audit_corrected: null, audit_contested: null, audit_error_rate: null,
    audit_residual_error_rate: null, audit_resolved_by_gap_rule: null, audit_fixed_in_code: null, audit_residual_errors: null,
    rechecked: null, recheck_confirmed: null, recheck_corrected: null, pending_recheck: null, waves: [], in_published_rate: null, passes: [], inputs: [],
  };
}

const withheld = (graded: number, what: string): string => `D11: ${graded} ${what}, fewer than ${MIN_N}; counts only.`;

/** D20 judgment sources: one `all` row, plus one row per grading wave where the source has waves (D26). */
function judgmentRows(source: string, warnings: string[]): Row[] {
  const dir = join(RAW, source);
  const fin = read(join(dir, "final-d20.json"));
  const agr = read(join(dir, "agreement-d16.json"));
  const counts = fin.counts as Record<string, number>;
  const graded = (counts.hit ?? 0) + (counts.partial ?? 0) + (counts.miss ?? 0);
  const auditFiles = readdirSync(dir).filter((f) => /^audit-d11(-pass\d+|-w\d+)?\.json$/.test(f)).sort();
  const auditPassFiles = auditFiles.filter((f) => /-pass\d+/.test(f));
  const waveIds = agr.waves ? Object.keys(agr.waves).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))) : [];
  const published = fin.audit?.waves ?? (waveIds.length ? ["w1"] : []);

  const all = blank(source, "judgment", "all", fin.rule);
  const hr = fin.hit_rate;
  Object.assign(all, {
    measure: "hit_rate",
    n: fin.n,
    n_graded: hr?.of_graded_hit_partial_miss ?? graded,
    k: hr?.hits ?? counts.hit ?? 0,
    share: hr?.rate ?? null,
    ci95: hr?.wilson95 ?? null,
    ci95_audit_adjusted: hr?.audit_adjusted95 ?? null,
    rate_withheld: fin.rate_withheld ?? null,
    counts,
    kappa: fin.kappa,
    passes_d11: fin.kappa >= 0.6,
    adjudicated: fin.adjudicated,
    rechecked: fin.rechecked ?? null,
    waves: published,
    passes: [...(fin.recheck_passes ?? []), ...auditPassFiles],
    inputs: [rel(source, "final-d20.json"), rel(source, "agreement-d16.json"), ...auditFiles.map((f) => rel(source, f))],
  });
  // Agreement figures of the waves the published rate covers.
  if (!waveIds.length || published.length === waveIds.length) Object.assign(all, { agreement_n: agr.n, agreement_agreed: agr.agree, raw_agreement: agr.raw_agreement });
  else if (published.length === 1) {
    const w = agr.waves[published[0]];
    Object.assign(all, { agreement_n: w.n, agreement_agreed: w.agree, raw_agreement: round(w.agree / w.n, 4) });
  }
  if (fin.audit) {
    const a = fin.audit;
    Object.assign(all, { audit_sample: a.sample, audited: a.audited, audit_confirmed: a.confirmed, audit_corrected: a.corrected, audit_contested: a.contested, audit_error_rate: a.error_rate });
  }
  if (!waveIds.length) {
    if (fin.kappa !== agr.kappa || fin.n !== agr.n) warnings.push(`${source}: final-d20.json (kappa ${fin.kappa}, n ${fin.n}) differs from agreement-d16.json (kappa ${agr.kappa}, n ${agr.n}); re-run scripts/final-d20.mjs`);
    const w1 = readdirSync(dir).includes("audit-d11.json") ? read(join(dir, "audit-d11.json")) : null;
    if (w1) all.audit_seed = w1.seed;
    return [all];
  }
  const missing = waveIds.filter((w) => !published.includes(w));
  if (missing.length) warnings.push(`${source}: agreement-d16.json has waves ${waveIds.join(", ")}; final-d20.json covers ${published.join(", ")} only (${missing.join(", ")} not in the published rate)`);

  const rows = [all];
  const seeds: string[] = [];
  for (const w of waveIds) {
    const wa = agr.waves[w];
    const row = blank(source, "judgment", w, fin.rule);
    const file = w === "w1" ? "audit-d11.json" : `audit-d11-${w}.json`;
    const passes = w === "w1" ? auditPassFiles : [];
    Object.assign(row, {
      n: wa.n,
      kappa: wa.kappa,
      agreement_n: wa.n,
      agreement_agreed: wa.agree,
      raw_agreement: round(wa.agree / wa.n, 4),
      passes_d11: wa.passes_d11,
      waves: [w],
      in_published_rate: published.includes(w),
      passes,
      inputs: [rel(source, "agreement-d16.json"), ...(existsSync(join(dir, file)) ? [rel(source, file)] : []), ...passes.map((f) => rel(source, f))],
    });
    if (existsSync(join(dir, file))) {
      const audit = read(join(dir, file));
      const records: Obj = { ...(audit.records ?? {}) };
      for (const p of passes) Object.assign(records, read(join(dir, p)).records ?? {});
      const d = decisions(records);
      if (published.includes(w)) seeds.push(audit.seed);
      Object.assign(row, { audit_seed: audit.seed, audit_sample: (audit.sample ?? []).length, audited: d.audited, audit_confirmed: d.confirmed, audit_corrected: d.corrected, audit_contested: d.contested, audit_error_rate: errorRate(d) });
      if (d.audited < (audit.sample ?? []).length) warnings.push(`${source} ${w}: audit ${d.audited} of ${(audit.sample ?? []).length} sampled claims recorded`);
    } else warnings.push(`${source} ${w}: no ${file}`);
    rows.push(row);
  }
  all.audit_seed = seeds.join(" + ") || null;
  // The pooled audit in final-d20.json is the sum of the wave audits it covers.
  const pooled = rows.filter((r) => r.scope !== "all" && r.in_published_rate === true);
  const sum = (k: string): number => pooled.reduce((s, r) => s + ((r[k] as number | null) ?? 0), 0);
  if (fin.audit && (sum("audited") !== fin.audit.audited || sum("audit_contested") !== fin.audit.contested || sum("audit_corrected") !== fin.audit.corrected))
    warnings.push(`${source}: wave audits (${sum("audited")} audited) do not add up to the audit in final-d20.json (${fin.audit.audited})`);
  return rows;
}

/** D33 trend sources: one row per published share. Never a hit rate. */
function trendRows(source: string, warnings: string[]): Row[] {
  const dir = join(RAW, source);
  const fin = read(join(dir, "final-d33.json"));
  const counts = fin.counts as Record<string, number>;
  const graded = ["persisted", "renamed", "faded", "recycled"].reduce((s, v) => s + (counts[v] ?? 0), 0);
  const pass2Files = readdirSync(dir).filter((f) => /^renames-.*-pass2.*\.json$/.test(f)).sort();
  if (pass2Files.length && !fin.pass2) warnings.push(`${source}: pass-2 files (${pass2Files.join(", ")}) exist, final-d33.json has no pass2 block; re-run scripts/trend-final-d33.mjs`);
  // Audit of pass 1 and, where present, pass 2 (D24), pooled as D26 pools waves.
  const audits = [fin.audit, fin.pass2?.audit].filter(Boolean) as Obj[];
  const a = audits.length
    ? {
        audited: audits.reduce((s, x) => s + x.audited, 0),
        confirmed: audits.reduce((s, x) => s + x.confirmed, 0),
        corrected: audits.reduce((s, x) => s + x.corrected, 0),
        contested: audits.reduce((s, x) => s + x.contested, 0),
        sample: audits.reduce((s, x) => s + x.sample, 0),
        resolved: audits.reduce((s, x) => s + (x.resolved_by_gap_rule ?? 0), 0),
      }
    : null;
  const residual = a && a.audited ? round((a.corrected + a.contested - a.resolved) / a.audited, 3) : null;
  if (a && audits.length === 1 && residual !== fin.audit.residual_error_rate) warnings.push(`${source}: residual error rate ${residual} differs from final-d33.json (${fin.audit.residual_error_rate})`);
  const inputs = [rel(source, "final-d33.json"), ...(existsSync(join(dir, "renames-audit-d33.json")) ? [rel(source, "renames-audit-d33.json")] : []), ...pass2Files.filter((f) => fin.pass2 && f.startsWith("renames-audit")).map((f) => rel(source, f))];
  return (["persisted", "renamed", "faded", "recycled"] as const).map((v) => {
    const s = fin.shares?.[v] ?? null;
    const row = blank(source, "trend", "all", fin.rule);
    Object.assign(row, {
      measure: `${v}_share`,
      n: fin.n,
      n_graded: s?.n ?? graded,
      k: s?.k ?? counts[v] ?? 0,
      share: s?.share ?? null,
      ci95: s?.wilson95 ?? null,
      ci95_audit_adjusted: widen(s?.wilson95 ?? null, residual),
      rate_withheld: s ? null : (fin.shares_withheld ?? withheld(graded, "graded trends")),
      counts,
      pending_recheck: fin.pending ?? null,
      passes: fin.passes ?? [],
      inputs,
    });
    if (a)
      Object.assign(row, {
        audit_seed: [fin.audit?.seed, fin.pass2?.audit?.seed].filter(Boolean).join(" + ") || null,
        audit_sample: a.sample, audited: a.audited, audit_confirmed: a.confirmed, audit_corrected: a.corrected, audit_contested: a.contested,
        audit_error_rate: a.audited ? round((a.corrected + a.contested) / a.audited, 3) : null,
        audit_residual_error_rate: residual,
        audit_resolved_by_gap_rule: a.resolved,
      });
    return row;
  });
}

/** D31: Eurasia top risks (materialised share) and red herrings (hit rate), never merged. Audit of the D20 source. */
function d31Rows(source: string): Row[] {
  const dir = join(RAW, source);
  const sum = read(join(dir, "summary-d31.json"));
  const fin = read(join(dir, "final-d20.json"));
  const agr = read(join(dir, "agreement-d16.json"));
  const parts: [string, string][] = [["top_risks", "materialised_share"], ["red_herrings", "red_herring_hit_rate"]];
  return parts.map(([scope, measure]) => {
    const p = sum[scope];
    const counts = p.counts as Record<string, number>;
    const row = blank(source, "measure", scope, sum.rule);
    const graded = p.n_graded as number;
    Object.assign(row, {
      measure,
      n: Object.values(counts).reduce((s, x) => s + x, 0),
      n_graded: graded,
      k: counts.hit ?? 0,
      share: graded >= MIN_N ? p.share : null,
      ci95: graded >= MIN_N ? p.wilson95 : null,
      ci95_audit_adjusted: graded >= MIN_N ? (p.audit_adjusted95 ?? null) : null,
      rate_withheld: graded >= MIN_N ? null : withheld(graded, "graded claims"),
      counts,
      kappa: fin.kappa,
      agreement_n: agr.n,
      agreement_agreed: agr.agree,
      raw_agreement: agr.raw_agreement,
      passes_d11: fin.kappa >= 0.6,
      adjudicated: fin.adjudicated,
      inputs: [rel(source, "summary-d31.json"), rel(source, "final-d20.json"), rel(source, "agreement-d16.json"), rel(source, "audit-d11.json")],
    });
    if (fin.audit) {
      const a = fin.audit;
      Object.assign(row, { audit_seed: read(join(dir, "audit-d11.json")).seed, audit_sample: a.sample, audited: a.audited, audit_confirmed: a.confirmed, audit_corrected: a.corrected, audit_contested: a.contested, audit_error_rate: a.error_rate });
    }
    return row;
  });
}

/** D32: WEF share of major events ranked high, per method block. No audit file exists for D32. */
function d32Rows(source: string, warnings: string[]): Row[] {
  const sum = read(join(RAW, source, "summary-d32.json"));
  warnings.push(`${source}: D32 has no audit; matcher agreement ${sum.matcher_agreement.agreed}/${sum.matcher_agreement.events}, no kappa`);
  return (sum.blocks as Obj[]).map((b) => {
    const row = blank(source, "measure", b.block, sum.rule);
    Object.assign(row, {
      measure: "ranked_high_share",
      n: b.events,
      n_graded: b.events,
      k: b.ranked_high,
      share: b.share_ranked_high,
      ci95: b.wilson95,
      rate_withheld: b.rate_withheld ?? null,
      counts: { ranked_high: b.ranked_high, ranked_low: b.ranked_low, absent: b.absent },
      agreement_n: sum.matcher_agreement.events,
      agreement_agreed: sum.matcher_agreement.agreed,
      raw_agreement: round(sum.matcher_agreement.agreed / sum.matcher_agreement.events, 4),
      inputs: [rel(source, "summary-d32.json")],
    });
    return row;
  });
}

/** D34 pathway sets: coverage share, arithmetic (as D19). D43: the export adds the Wilson interval and applies D11. */
function d34Rows(source: string, warnings: string[]): Row[] {
  const cov = read(join(RAW, source, "coverage-d34.json"));
  const counts = cov.counts as Record<string, number>;
  const graded = (counts.covered ?? 0) + (counts.partly_covered ?? 0) + (counts.not_covered ?? 0);
  const k = counts.covered ?? 0;
  if (graded < MIN_N && cov.coverage_share !== null) warnings.push(`${source}: coverage-d34.json publishes a share (${cov.coverage_share}) over ${graded} graded values, fewer than ${MIN_N}; withheld here (D11)`);
  if (graded && cov.coverage_share !== round(k / graded, 4)) warnings.push(`${source}: coverage_share ${cov.coverage_share} is not covered / graded (${k}/${graded})`);
  const row = blank(source, "measure", "all", cov.rule);
  Object.assign(row, {
    measure: "coverage_share",
    n: (cov.rows as unknown[]).length,
    n_graded: graded,
    k,
    share: graded >= MIN_N ? round(k / graded, 4) : null,
    ci95: graded >= MIN_N ? wilson(k, graded) : null,
    rate_withheld: graded >= MIN_N ? null : withheld(graded, "graded values"),
    counts,
    inputs: [rel(source, "coverage-d34.json")],
  });
  return [row];
}

/** D19 numeric sources: totals and the #53 matching audit from data/graded/numeric/summary.json. */
function numericRows(): Row[] {
  const sum = read(GRADED_NUMERIC);
  return (sum.sources as Obj[]).map((s) => {
    const t = s.totals;
    const a = s.audit;
    const row = blank(s.source_id, "numeric", "all", "D19");
    Object.assign(row, {
      measure: "hit_rate",
      n: t.n_graded + t.ungradable + t.open + t.excluded,
      n_graded: t.n_graded,
      k: t.hits,
      share: t.hit_rate,
      ci95: t.hit_rate_ci95,
      ci95_audit_adjusted: s.hit_rate_audit_adjusted95 ?? null,
      rate_withheld: t.hit_rate === null ? withheld(t.n_graded, "graded rows") : null,
      counts: { hit: t.hits, partial: t.partials, miss: t.misses, ungradable: t.ungradable, open: t.open, excluded: t.excluded },
      inputs: ["data/graded/numeric/summary.json"],
    });
    if (a)
      Object.assign(row, {
        audit_seed: a.seed, audit_sample: a.sample, audited: a.audited, audit_confirmed: a.confirmed, audit_corrected: a.corrected, audit_contested: a.contested,
        audit_error_rate: a.error_rate, audit_residual_error_rate: a.residual_error_rate, audit_fixed_in_code: a.fixed_in_code, audit_residual_errors: a.residual_errors,
        rechecked: a.rechecked, recheck_confirmed: a.recheck_confirmed, recheck_corrected: a.recheck_corrected, pending_recheck: a.pending_recheck,
      });
    return row;
  });
}

export function validationTable(): { rows: Row[]; warnings: string[] } {
  const warnings: string[] = [];
  const rows: Row[] = [];
  for (const source of readdirSync(RAW).sort()) {
    const has = (f: string): boolean => existsSync(join(RAW, source, f));
    if (has("final-d20.json")) rows.push(...judgmentRows(source, warnings));
    if (has("final-d33.json")) rows.push(...trendRows(source, warnings));
    if (has("summary-d31.json")) rows.push(...d31Rows(source));
    if (has("summary-d32.json")) rows.push(...d32Rows(source, warnings));
    if (has("coverage-d34.json")) rows.push(...d34Rows(source, warnings));
    if (has("scenarios-d34-graderA.json") && !has("coverage-d34.json")) warnings.push(`${source}: D34 grader files exist but no coverage summary; no validation row`);
  }
  rows.push(...numericRows());
  // Alphabetical by source (D17); a source's rows keep their order (judgment, trend, measure). Never by score.
  const kindOrder = ["judgment", "trend", "measure", "numeric"];
  rows.sort((x, y) => (x.source_id === y.source_id ? kindOrder.indexOf(x.kind as string) - kindOrder.indexOf(y.kind as string) : (x.source_id as string) < (y.source_id as string) ? -1 : 1));
  return { rows, warnings };
}
