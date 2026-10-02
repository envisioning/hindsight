/**
 * Hindsight's data shapes. The single source of truth for every table, the
 * export and the published JSON Schemas. Never define a shape a second time.
 *
 * Every id is a stable string and is never reused. History tables are
 * append-only: a change is a new row, never an update in place.
 */
import { z } from "zod";

const Id = z.string().min(1);
const IsoDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "YYYY, YYYY-MM or YYYY-MM-DD");
const Url = z.string().url();

/** A publication series, for example the Gartner Hype Cycle for Emerging Technologies. */
export const Source = z.object({
  id: Id,
  publisher_id: Id,
  series: z.string().min(1),
  url: Url.optional(),
  licence_notes: z.string().optional(),
});

/** One edition of a source, for example the 2015 Hype Cycle. */
export const SourceEdition = z.object({
  id: Id,
  source_id: Id,
  edition: z.string().min(1),
  published: IsoDate,
  url: Url.optional(),
});

/** The publisher as an actor. Hindsight owns the id. */
export const Institution = z.object({
  id: Id,
  name: z.string().min(1),
  kind: z.enum(["company", "igo", "government", "central_bank", "research_firm", "author"]),
  country: z.string().length(3).optional(),
  /** Optional match to an NCB institution id, for example `global.imf`. A note, not a dependency. */
  ncb_id: z.string().optional(),
});

/** What a claim is about. Not a technology: GDP growth and pandemic risk are subjects too. */
export const Subject = z.object({
  id: Id,
  name: z.string().min(1),
  kind: z.enum(["technology", "quantity", "risk", "other"]),
  /** Every label a publisher used for this subject. */
  aliases: z.array(z.string().min(1)),
  /** Subjects that are close but not the same thing, for example a different measure of the same quantity (D13). */
  related: z.array(Id).optional(),
  /** Definition and caveats, for example "annual average growth, PPP weights". */
  notes: z.string().optional(),
});

/** How a publisher label was mapped to a subject (D13). */
export const SubjectAlias = z
  .object({
    label: z.string().min(1),
    subject_id: Id,
    method: z.enum(["exact", "normalized", "judgment"]),
    /** Required for `judgment`: one line on why. */
    reason: z.string().optional(),
    /** Source ids that used this label. */
    sources: z.array(Id).min(1),
  })
  .refine((a) => a.method !== "judgment" || (a.reason ?? "").length > 0, {
    message: "a judgment alias needs a reason",
  });

export const ClaimType = z.enum(["forecast", "trend", "scenario", "ranking", "fiction"]);

/** Gartner Hype Cycle phases, left to right. */
export const HypePhase = z.enum(["innovation_trigger", "peak", "trough", "slope", "plateau"]);

/** One expectation, extracted from one source edition. */
export const Claim = z
  .object({
    id: Id,
    source_edition_id: Id,
    /** The exact short quote, with its position. Facts and short attributed quotes only. Absent when the source is a data table (D12). */
    quote: z.string().min(1).max(400).optional(),
    /** A plain statement of the claim. Required when there is no quote. */
    statement: z.string().min(1).max(400).optional(),
    /** True when Hindsight wrote the statement. A generated statement is never a quote. */
    statement_generated: z.boolean().optional(),
    position: z.string().optional(),
    subject_ids: z.array(Id).min(1),
    claim_type: ClaimType,
    metric: z.string().optional(),
    direction: z.enum(["up", "down", "arrive", "persist", "other"]).optional(),
    value: z.string().optional(),
    unit: z.string().optional(),
    target_date: IsoDate.optional(),
    /** A band such as "2 to 5 years", when the claim gives no date. */
    horizon_band: z.string().optional(),
    /** Hype Cycle phase of the entry in this edition (D14). */
    phase: HypePhase.optional(),
    hedge: z.string().optional(),
    /** Extraction caveats, for example why the claim cannot be graded on timing. */
    note: z.string().optional(),
    status: z.enum(["open", "resolved", "contested"]),
    published: z.boolean(),
  })
  .refine((c) => c.quote !== undefined || c.statement !== undefined, {
    message: "a claim needs a quote or a statement",
  });

/** Verdicts per claim type. Scenarios and fiction are never graded hit or miss. */
export const Verdict = z.enum([
  // forecast
  "hit", "partial", "miss", "unfalsifiable",
  // trend
  "persisted", "faded", "renamed", "recycled",
  // scenario
  "covered", "partly_covered", "not_covered",
  // ranking
  "ranked_high", "ranked_low", "absent",
  // fiction
  "appeared", "partly_appeared", "not_yet",
]);

export const VERDICTS_BY_TYPE: Record<z.infer<typeof ClaimType>, readonly z.infer<typeof Verdict>[]> = {
  forecast: ["hit", "partial", "miss", "unfalsifiable"],
  trend: ["persisted", "faded", "renamed", "recycled"],
  scenario: ["covered", "partly_covered", "not_covered"],
  ranking: ["ranked_high", "ranked_low", "absent"],
  fiction: ["appeared", "partly_appeared", "not_yet"],
};

/** A signal attached to a claim. Hindsight keeps its own copy of the evidence. */
export const Evidence = z.object({
  id: Id,
  claim_id: Id,
  url: Url,
  /** Absent when the grader could not confirm the publication date (D12). */
  date: IsoDate.optional(),
  title: z.string().min(1),
  /** Absent when the grader recorded what the evidence shows but not a stance (D12). */
  stance: z.enum(["supports", "contradicts"]).optional(),
  note: z.string().optional(),
  /** Optional origin in Signals. Never a foreign key. */
  signal_ref: z.string().optional(),
});

/**
 * Append-only verdict history. The current verdict is the latest row.
 * A verdict publishes only when two independent agents agree (docs/DECISIONS.md, D7).
 */
export const VerdictRow = z.object({
  id: Id,
  claim_id: Id,
  verdict: Verdict,
  /** For fiction: the year the depicted technology first appeared. */
  appeared_year: z.number().int().optional(),
  evidence_ids: z.array(Id).min(1),
  reason: z.string().min(1),
  agent: z.string().min(1),
  model: z.string().min(1),
  prompt_version: z.string().min(1),
  created_at: z.string().datetime(),
});

/** A later edition that changes a claim about the same subject. */
export const Revision = z
  .object({
    id: Id,
    prior_claim_id: Id,
    /** Absent only for `dropped`: the subject has no claim in the next edition (D12). */
    new_claim_id: Id.optional(),
    change: z.enum(["delayed", "advanced", "dropped", "renamed", "reversed"]),
    subject_id: Id.optional(),
    note: z.string().optional(),
  })
  .refine((r) => (r.change === "dropped") === (r.new_claim_id === undefined), {
    message: "new_claim_id is absent exactly when change is dropped",
  });

/**
 * Hype Cycle phase boundaries for one edition, in the frame of the digitized
 * positions (x 0 = left axis, 100 = tip of the time axis). Data, not code (D14).
 */
export const HypePhaseBoundaries = z.object({
  edition: z.string().min(1),
  /** x where innovation_trigger|peak, peak|trough, trough|slope and slope|plateau meet. */
  boundaries: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  method: z.enum(["measured", "derived"]),
  note: z.string().min(1),
});

/** The one seam with the research database. Append-only; a wrong link is retracted, never deleted. */
export const SubjectTechnologyLink = z.object({
  id: Id,
  subject_id: Id,
  /** A `technologies.id` in the Core CMS. */
  technology_id: z.string().uuid(),
  similarity: z.number().min(0).max(1).optional(),
  /** `curated` links (for example Origins) are never overwritten by agent passes. */
  method: z.string().min(1),
  agent: z.string().min(1),
  status: z.enum(["active", "retracted"]),
  reason: z.string().optional(),
  created_at: z.string().datetime(),
});

/**
 * Numeric grading (D16, D18, D19): one row per claim of a numeric source.
 * Arithmetic, not judgment: no agent, model or prompt version. `status`
 * is `graded` only when a forecast and an actual on the same definition exist.
 */
export const NumericRule = z.enum(["D18", "D16"]);
export const NumericErrorUnit = z.enum(["pp", "percent of actual"]);
export const NumericGrade = z
  .object({
    claim_id: Id,
    source_id: Id,
    subject_id: Id,
    /** Measure family, for example "real GDP growth" or "solar capacity". */
    family: z.string().min(1),
    edition: z.string().min(1),
    published: IsoDate,
    target_year: z.number().int().nullable(),
    /** The source's own period label when it is not one calendar year, for example a fiscal year "2017-18" or a period "2010-2014". */
    target_period: z.string().nullable(),
    /** Years between publication and target: 0 = current year, 1 = next year. */
    horizon_years: z.number().int().nullable(),
    /** The source's own horizon label, for example `next_year` or `year_3`. */
    horizon_label: z.string().nullable(),
    /** Fed, ECB and BCB: which statistic of the published projections the value is. */
    statistic: z.string().nullable(),
    forecast: z.number().nullable(),
    actual: z.number().nullable(),
    actual_vintage: z.string().nullable(),
    unit: z.string().nullable(),
    rule: NumericRule.nullable(),
    /** D18: forecast minus actual in percentage points. D16: (forecast minus actual) / |actual| in percent. */
    error: z.number().nullable(),
    error_unit: NumericErrorUnit.nullable(),
    status: z.enum(["graded", "ungradable", "open", "excluded"]),
    verdict: z.enum(["hit", "partial", "miss"]).nullable(),
    /** The reason for any status other than `graded`, and every definition caveat of a graded row. */
    note: z.string(),
  })
  .refine(
    (g) =>
      (g.status === "graded") ===
      (g.forecast !== null && g.actual !== null && g.rule !== null && g.error !== null && g.error_unit !== null && g.verdict !== null && g.actual_vintage !== null),
    { message: "a graded row has forecast, actual, vintage, rule, error and verdict; other rows have no verdict" },
  )
  .refine((g) => g.status === "graded" || g.note.length > 0, { message: "a row that is not graded states why" });

export const NumericHorizon = z.enum(["all", "current_year", "next_year", "2_years", "3_to_5_years", "6_to_10_years", "over_10_years", "none"]);

/** Counts and accuracy for a group of numeric grade rows. D11: no rate, bias or MAE below 20 graded rows. */
export const NumericStats = z
  .object({
    n_graded: z.number().int().min(0),
    hits: z.number().int().min(0),
    partials: z.number().int().min(0),
    misses: z.number().int().min(0),
    ungradable: z.number().int().min(0),
    open: z.number().int().min(0),
    excluded: z.number().int().min(0),
    /** Share of graded rows that are hits. Null below 20 graded rows (D11). */
    hit_rate: z.number().min(0).max(1).nullable(),
    /** Wilson 95% interval of `hit_rate` (D11). */
    hit_rate_ci95: z.tuple([z.number(), z.number()]).nullable(),
    /** One entry per rule present: mean error (bias) and mean absolute error. Null below 20 rows (D11). */
    errors: z.array(z.object({ rule: NumericRule, unit: NumericErrorUnit, n: z.number().int().min(0), bias: z.number().nullable(), mae: z.number().nullable() })),
  })
  .refine((s) => s.n_graded === s.hits + s.partials + s.misses, { message: "graded = hits + partials + misses" })
  .refine((s) => (s.n_graded >= 20) === (s.hit_rate !== null && s.hit_rate_ci95 !== null), { message: "a rate is published exactly when n >= 20 (D11)" });

/**
 * D11 matching audit of one numeric source (D19, D20, issue #53): an agent checked a fixed-seed sample of
 * graded rows (forecast value, series, definition, year, actual). A matching error found in the sample is
 * fixed in code for every row; `residual_errors` are sampled rows where the current grade still differs
 * from the auditor's decision. D28 widens the rate interval by `residual_error_rate`.
 */
export const NumericAudit = z.object({
  seed: z.string().min(1),
  sample: z.number().int().min(0),
  audited: z.number().int().min(0),
  confirmed: z.number().int().min(0),
  corrected: z.number().int().min(0),
  contested: z.number().int().min(0),
  /** (corrected + contested) / audited, as the audit found it. */
  error_rate: z.number().min(0).max(1).nullable(),
  /** Findings whose current grade matches the auditor's correction, or that a D24 re-check confirmed on the current grade. */
  fixed_in_code: z.number().int().min(0),
  residual_errors: z.number().int().min(0),
  residual_error_rate: z.number().min(0).max(1).nullable(),
  /** D24 re-check passes (audit/<source>-recheck-*.json): sampled rows re-checked, by the latest record per row. */
  rechecked: z.number().int().min(0),
  recheck_confirmed: z.number().int().min(0),
  recheck_corrected: z.number().int().min(0),
  /**
   * Sampled rows whose current grade no audit or re-check has seen: a confirmed row whose grade changed since the
   * audit, a re-checked row that changed again, or a finding fixed by a new capture that no re-check has confirmed.
   * Counted neither as fixed nor as residual.
   */
  pending_recheck: z.number().int().min(0),
});

export const NumericSummary = z.object({
  note: z.string().min(1),
  min_graded_for_rate: z.literal(20),
  sources: z.array(
    z.object({
      source_id: Id,
      totals: NumericStats,
      /** D11 matching audit (#53). Absent before the audit. */
      audit: NumericAudit.optional(),
      /** D28: `totals.hit_rate_ci95` widened by the audit's residual error rate on both sides. */
      hit_rate_audit_adjusted95: z.tuple([z.number(), z.number()]).nullable().optional(),
      by_horizon: z.array(z.object({ horizon: NumericHorizon, stats: NumericStats })),
      by_family: z.array(z.object({ family: z.string().min(1), horizon: NumericHorizon, stats: NumericStats })),
      by_subject: z.array(z.object({ subject_id: Id, family: z.string().min(1), horizon: NumericHorizon, stats: NumericStats })),
      by_edition: z.array(z.object({ edition: z.string().min(1), published: IsoDate, stats: NumericStats })),
    }),
  ),
});

/**
 * The published verdict of one judgment-source claim, as `scripts/final-d20.mjs` resolves it
 * (D20: graders, adjudicator, audit, re-check passes, disputes). The release export (#3) writes
 * one row per claim graded under D20. `contested` and `ungradable` are outcomes, never verdicts (D11, D22).
 */
export const PublishedVerdict = z.object({
  claim_id: Id,
  source_id: Id,
  verdict: z.union([Verdict, z.enum(["contested", "ungradable"])]),
  status: z.enum(["agreed", "audited", "corrected", "contested", "adjudicated", "rechecked", "disputed"]),
  /** The grading rule of the source, for example "D16". */
  rule: z.string().min(1),
  /** The verdict before an audit correction or an upheld dispute. */
  was: z.string().optional(),
  reason: z.string().optional(),
});

/** D17 side-by-side view: same subject, same horizon, sources in alphabetical order. No rank, no total. */
export const NumericComparison = z.object({
  note: z.string().min(1),
  subjects: z.array(
    z.object({
      subject_id: Id,
      horizon: z.enum(["current_year", "next_year"]),
      caveats: z.array(z.string()),
      sources: z.array(z.object({ source_id: Id, first_target_year: z.number().int().nullable(), last_target_year: z.number().int().nullable(), stats: NumericStats })),
      /** The same, restricted to target years that every listed source graded. */
      common_years: z.object({
        target_years: z.array(z.number().int()),
        sources: z.array(z.object({ source_id: Id, stats: NumericStats })),
      }),
    }),
  ),
});

export type Source = z.infer<typeof Source>;
export type SourceEdition = z.infer<typeof SourceEdition>;
export type Institution = z.infer<typeof Institution>;
export type Subject = z.infer<typeof Subject>;
export type SubjectAlias = z.infer<typeof SubjectAlias>;
export type HypePhase = z.infer<typeof HypePhase>;
export type HypePhaseBoundaries = z.infer<typeof HypePhaseBoundaries>;
export type ClaimType = z.infer<typeof ClaimType>;
export type Claim = z.infer<typeof Claim>;
export type Verdict = z.infer<typeof Verdict>;
export type Evidence = z.infer<typeof Evidence>;
export type VerdictRow = z.infer<typeof VerdictRow>;
export type Revision = z.infer<typeof Revision>;
export type SubjectTechnologyLink = z.infer<typeof SubjectTechnologyLink>;
export type NumericRule = z.infer<typeof NumericRule>;
export type PublishedVerdict = z.infer<typeof PublishedVerdict>;
export type NumericAudit = z.infer<typeof NumericAudit>;
export type NumericGrade = z.infer<typeof NumericGrade>;
export type NumericHorizon = z.infer<typeof NumericHorizon>;
export type NumericStats = z.infer<typeof NumericStats>;
export type NumericSummary = z.infer<typeof NumericSummary>;
export type NumericComparison = z.infer<typeof NumericComparison>;
