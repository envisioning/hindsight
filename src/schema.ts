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

/**
 * A capture correction over one raw entry (D43), kept in `data/raw/<source>/corrections.json`.
 * Append-only: the raw entry is never edited, and a later record for the same entry and field
 * replaces an earlier one. `stored` is the raw value the correction was made against (null when the
 * field is absent); normalize stops when it no longer matches. The claim id never changes: a
 * correction to a field of the natural key (D15) changes only what the claim displays.
 */
export const RawCorrection = z.object({
  edition: z.string().min(1),
  /** 1-based position of the entry in the edition file's `entries` (D15). */
  position: z.number().int().min(1),
  field: z.enum(["quote", "label", "section", "subsection", "not_a_trend"]),
  stored: z.union([z.string(), z.boolean(), z.null()]),
  /** The corrected value: a string for text fields (null removes a quote), true for not_a_trend. */
  corrected: z.union([z.string().min(1).max(400), z.boolean(), z.null()]),
  reason: z.string().min(1),
  /** Where the corrected value was read: page and source. */
  evidence: z.string().min(1),
  at: IsoDate,
});

export const RawCorrections = z.object({
  rule: z.string().min(1),
  note: z.string().min(1),
  corrections: z.array(RawCorrection),
});

/** How a subject relates to a research technology (D48). `same` is a primary link; `broader` (the technology is broader than the subject) and `narrower` are shown as related. */
export const LinkRelation = z.enum(["same", "broader", "narrower"]);

/**
 * The one seam with the research database (D3, D5, D48). Append-only, in `data/links/research.json`:
 * a wrong link is retracted by a new row with `status: retracted`, never deleted or edited.
 * The latest row of a (subject_id, technology_id) pair is its state.
 */
export const SubjectTechnologyLink = z.object({
  /** `<subject_id>~<technology_id>#<n>`, n counting the rows of the pair from 1. */
  id: Id,
  subject_id: Id,
  /** A `technologies.id` in the Core CMS. */
  technology_id: z.string().uuid(),
  /** URL parts: envisioning.com/research/<research_slug>/<original_id>. Copied at link time. */
  research_slug: Id,
  original_id: Id,
  relation: LinkRelation,
  /** Cosine of the subject and technology vectors (D48 model), when computed. */
  similarity: z.number().min(-1).max(1).optional(),
  /** `curated` links (for example Origins) are never overwritten by agent passes. D48 agent links: `d48:<match>`, match = exact | alias | semantic. */
  method: z.string().min(1),
  /** Who decided: for D48, `verifiers:<A>+<B>`, `adjudicator:<agent>` or `auditor:<agent>`. */
  agent: z.string().min(1),
  status: z.enum(["active", "retracted"]),
  reason: z.string().optional(),
  /** The D48 run (`data/links/runs/<run>/`) that wrote the row. */
  run: z.string().optional(),
  created_at: z.string().datetime(),
});

/** A forecast about a linked subject, as listed in `by-technology.json` (D48, #59). */
export const LinkedClaim = z.object({
  /** The claim id, as on envisioning.com/hindsight/claims/<id>. */
  id: Id,
  subject_id: Id,
  source_id: Id,
  /** Institution name of the source's publisher. */
  publisher: z.string().min(1),
  /** Year the edition was published. */
  year: z.number().int(),
  /** Published verdict (D20 final, D33 trend final, or D19 numeric grade); null when there is none, it is still open, or it is contested. */
  verdict: z.union([Verdict, z.literal("ungradable")]).nullable(),
});

/** Claims about the subjects linked to one technology. Publishers are alphabetical, never ranked (D17). */
export const LinkedClaims = z.object({
  count: z.number().int().min(0),
  publishers: z.array(z.string().min(1)),
  first_year: z.number().int().nullable(),
  last_year: z.number().int().nullable(),
  /** Count per published verdict; claims without one are left out. */
  verdicts: z.record(z.string(), z.number().int().min(1)),
  /** Up to 20 claims, newest edition first. */
  latest: z.array(LinkedClaim).max(20),
});

/** `data/links/by-technology.json` (technology to forecasts), written by `pnpm links` from the active rows of `research.json`. */
export const LinksByTechnology = z.object({
  rule: z.literal("D48"),
  /** `created_at` of the newest row of `research.json` read; the file changes only when the links or claims do. */
  links_as_of: z.string().datetime().nullable(),
  /** Keyed by `<research_slug>/<original_id>`, the URL parts of envisioning.com/research/<research_slug>/<original_id>. */
  technologies: z.record(
    z.string(),
    z.object({
      technology_id: z.string().uuid(),
      research_slug: Id,
      original_id: Id,
      title: z.string().min(1),
      /** Linked subjects; `same` first. */
      subjects: z.array(z.object({ subject_id: Id, name: z.string().min(1), relation: LinkRelation })),
      claims: LinkedClaims,
    }),
  ),
});

/** `data/links/by-subject.json` (forecast to technology), written by `pnpm links`. */
export const LinksBySubject = z.object({
  rule: z.literal("D48"),
  links_as_of: z.string().datetime().nullable(),
  /** Keyed by subject id. */
  subjects: z.record(
    z.string(),
    z.object({
      name: z.string().min(1),
      /** `same` first, then by research slug and original_id. */
      technologies: z.array(
        z.object({
          technology_id: z.string().uuid(),
          research_slug: Id,
          original_id: Id,
          title: z.string().min(1),
          relation: LinkRelation,
        }),
      ),
      /** Every published claim about the subject, newest edition first. www uses it for the subject page and to find a claim's technologies. */
      claims: z.array(LinkedClaim),
    }),
  ),
});

/** Text embedded for a subject (D48): name, other aliases, and one claim text per source. Written by `pnpm normalize`. */
export const SubjectText = z.object({
  subject_id: Id,
  kind: z.enum(["technology", "quantity", "risk", "other"]),
  text: z.string().min(1),
});

/** One proposed subject-technology pair (D48), in `data/links/runs/<run>/candidates.json`. */
export const LinkCandidate = z.object({
  /** `<subject_id>~<technology_id>`, stable across runs. */
  id: Id,
  subject_id: Id,
  technology_id: z.string().uuid(),
  research_slug: Id,
  original_id: Id,
  /** Cosine of the two vectors; null in a titles-only run (D49), which uses no vectors. */
  similarity: z.number().min(-1).max(1).nullable(),
  /** Rank of the technology among the subject's nearest technologies (1 = nearest), null outside the top 5. */
  subject_rank: z.number().int().min(1).nullable(),
  /** Rank of the subject among the technology's nearest subjects, null outside the top 3. */
  technology_rank: z.number().int().min(1).nullable(),
  /** Each is the other's nearest neighbour. */
  mutual_nn: z.boolean(),
  /** `exact`: subject name and technology title share the D13 normalized key; `alias`: another alias does; `semantic`: neither. */
  match: z.enum(["exact", "alias", "semantic"]),
  batch: z.string().min(1),
});

/** A verifier's call on one candidate (D48). `broader`: the technology is broader than the subject. */
export const LinkVerdictValue = z.enum(["link", "no_link", "broader", "narrower"]);
export const LinkVerdict = z.object({
  candidate_id: Id,
  verdict: LinkVerdictValue,
  reason: z.string().min(1).max(300),
});
export const LinkVerdictFile = z.object({
  run: z.string().min(1),
  batch: z.string().min(1),
  /** `A` or `B` for the blind verifiers, `adjudicator` for contested pairs. */
  role: z.enum(["A", "B", "adjudicator"]),
  agent: z.string().min(1),
  verdicts: z.array(LinkVerdict),
});

/** Auditor record for one sampled accepted link (D48, D20). */
export const LinkAuditRecord = z
  .object({
    decision: z.enum(["confirm", "correct", "reject"]),
    corrected_verdict: LinkVerdictValue.optional(),
    note: z.string().min(1),
    at: z.string().datetime(),
  })
  .refine((r) => r.decision !== "correct" || r.corrected_verdict !== undefined, { message: "a correction needs corrected_verdict" });

/**
 * A re-check of an active link row (D56, D24 for links): `data/links/runs/<recheck>/recheck.json`.
 * Append-only record; `scripts/links/apply-recheck.mjs` turns each correction into a new row of
 * `research.json` (`retracted` for `no_link`, else `active` with the new relation).
 */
export const LinkRecheckRecord = z
  .object({
    /** `<subject_id>~<technology_id>`. */
    pair_id: z.string().min(1),
    /** The `research.json` row that was checked (latest row of the pair at re-check time). */
    row_id: z.string().min(1),
    /** `<research_slug>/<original_id>`, for reading only. */
    technology: z.string().min(1),
    earlier_relation: LinkRelation,
    earlier_run: z.string().min(1),
    decision: z.enum(["confirm", "correct"]),
    corrected_relation: z.union([LinkRelation, z.literal("no_link")]).optional(),
    reason: z.string().min(1),
    at: z.string().datetime(),
  })
  .refine((r) => (r.decision === "correct") === (r.corrected_relation !== undefined), {
    message: "a correction needs corrected_relation, a confirmation has none",
  })
  .refine((r) => r.corrected_relation !== r.earlier_relation, { message: "corrected_relation equals earlier_relation" });

export const LinkRecheckFile = z.object({
  rule: z.string().min(1),
  run: z.string().regex(/^[a-z0-9-]+$/),
  agent: z.string().min(1),
  scope: z.string().min(1),
  /** Regex on `original_id` that defines the rows in scope (every active row matching it was checked). */
  scope_original_id: z.string().min(1),
  /** The audited run whose residual error the re-check updates (audit records in scope count as fixed). */
  audit_run: z.string().optional(),
  drawn_at: z.string().datetime(),
  records: z.array(LinkRecheckRecord),
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

const Interval = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);
const Count = z.number().int().min(0);

/**
 * Per-source validation figures of a release (D11, D28, D44, issues #40 and #3): sample sizes, agreement,
 * audit and intervals behind every published rate or share. One row per source and scope; sources in
 * alphabetical order. No total score and no rank across rows (D6, D17): each row stands on its own and
 * `measure` rows of different names are never comparable.
 *
 * - `judgment`: a D20 source (final-d20.json). Scope `all` is the published hit rate over every wave;
 *   scope `w<N>` is one grading wave (D26): its kappa and its own audit, no rate.
 * - `trend`: a D33 source (final-d33.json), one row per published share. Never a hit rate.
 * - `measure`: D31 (Eurasia top risks, red herrings), D32 (WEF method blocks) and D34 (pathway coverage) shares.
 * - `numeric`: a D19 source (data/graded/numeric/summary.json) with its matching audit (#53, D24).
 */
export const ValidationKind = z.enum(["judgment", "trend", "measure", "numeric"]);
export const ValidationMeasure = z.enum([
  "hit_rate",
  "persisted_share",
  "renamed_share",
  "faded_share",
  "recycled_share",
  "materialised_share",
  "red_herring_hit_rate",
  "ranked_high_share",
  "coverage_share",
]);
export const ValidationRow = z
  .object({
    source_id: Id,
    kind: ValidationKind,
    /** `all`, a grading wave (`w1`, `w2`), a D31 part (`top_risks`, `red_herrings`) or a D32 method block (`2007-2020`). */
    scope: z.string().min(1),
    /** The grading rule, for example "D16", "D33", "D19". */
    rule: z.string().min(1),
    /** What `share` measures. Null on a wave row, which carries agreement and audit only. */
    measure: ValidationMeasure.nullable(),
    /** Every row in scope: claims, trends, events or numeric rows, including open, ungradable and contested ones. */
    n: Count.nullable(),
    /** Rows the share is computed over (the D11 sample size). */
    n_graded: Count.nullable(),
    /** Rows counted in the share's numerator (hits, faded trends, events ranked high, covered values). */
    k: Count.nullable(),
    /** k / n_graded. Null below 20 graded rows (D11) or where a rule withholds it (`rate_withheld`). */
    share: z.number().min(0).max(1).nullable(),
    /** Wilson 95% interval of `share` (D11). */
    ci95: Interval.nullable(),
    /** D28: `ci95` widened by the audit error rate (residual rate where the rule defines one). Null without an audit. */
    ci95_audit_adjusted: Interval.nullable(),
    /** Why no share is published (D11 below 20 graded, or the source's rule, D31). */
    rate_withheld: z.string().nullable(),
    /** Outcome counts in scope, unfalsifiable, ungradable, contested, open and gap included (the unfalsifiable share, #40). */
    counts: z.record(z.string(), Count),
    /** Cohen's kappa of the two blind graders or checkers (D7, D11). */
    kappa: z.number().min(-1).max(1).nullable(),
    /** D50: a wave under 30 claims is gated on kappa pooled with the previous wave. */
    kappa_pooled: z.number().min(-1).max(1).nullable(),
    /** Pairs both agents graded, pairs they agreed on, and agree / pairs. */
    agreement_n: Count.nullable(),
    agreement_agreed: Count.nullable(),
    raw_agreement: z.number().min(0).max(1).nullable(),
    /** Kappa at least 0.6 (D11). */
    passes_d11: z.boolean().nullable(),
    /** Contested claims a third agent settled (D20). */
    adjudicated: Count.nullable(),
    /** Fixed seed of the audit sample (D11). */
    audit_seed: z.string().nullable(),
    audit_sample: Count.nullable(),
    audited: Count.nullable(),
    audit_confirmed: Count.nullable(),
    audit_corrected: Count.nullable(),
    audit_contested: Count.nullable(),
    /** (corrected + contested) / audited, as the audit found it. */
    audit_error_rate: z.number().min(0).max(1).nullable(),
    /** Trend (D36: contests resolved by the gap rule) and numeric (#53: findings fixed in code) audits: the errors that still stand. */
    audit_residual_error_rate: z.number().min(0).max(1).nullable(),
    /** Trend audits: contests resolved by the partial-edition gap rule (D36). */
    audit_resolved_by_gap_rule: Count.nullable(),
    /** Numeric audits: findings fixed in code for every row (#53). */
    audit_fixed_in_code: Count.nullable(),
    audit_residual_errors: Count.nullable(),
    /** D24 re-checks. Judgment: claims re-decided by an adjudication re-check pass. Numeric: sampled rows re-checked. */
    rechecked: Count.nullable(),
    recheck_confirmed: Count.nullable(),
    recheck_corrected: Count.nullable(),
    /** Numeric: sampled rows whose current grade no audit or re-check has seen (D41). Trend: rows waiting for both pass-2 checkers. */
    pending_recheck: Count.nullable(),
    /** Grading waves in the published figure (D26). On a wave row: whether the source's final file includes that wave. */
    waves: z.array(z.string().min(1)),
    in_published_rate: z.boolean().nullable(),
    /** Re-check and audit pass files that the figures include (D24). */
    passes: z.array(z.string().min(1)),
    /** Files the figures are read from, relative to the repository. */
    inputs: z.array(z.string().min(1)).min(1),
  })
  .refine((r) => r.n_graded === null || r.n_graded >= 20 || r.share === null, { message: "no share below 20 graded rows (D11)" })
  .refine((r) => (r.share === null) === (r.ci95 === null), { message: "a share has a Wilson interval and an interval has a share (D11)" })
  .refine((r) => r.share !== null || r.ci95_audit_adjusted === null, { message: "an adjusted interval needs a share" })
  .refine((r) => r.share === null || r.rate_withheld === null, { message: "a share is either published or withheld" })
  .refine((r) => r.k === null || r.n_graded === null || r.k <= r.n_graded, { message: "k <= n_graded" })
  .refine((r) => r.share === null || (r.k !== null && r.n_graded !== null && Math.abs(r.k / r.n_graded - r.share) < 0.0005), { message: "share = k / n_graded" })
  .refine((r) => r.share === null || r.ci95 === null || (r.ci95[0] <= r.share + 0.0005 && r.share - 0.0005 <= r.ci95[1]), { message: "share lies in its interval" })
  .refine((r) => r.ci95 === null || r.ci95_audit_adjusted === null || (r.ci95_audit_adjusted[0] <= r.ci95[0] + 0.0005 && r.ci95[1] - 0.0005 <= r.ci95_audit_adjusted[1]), {
    message: "the adjusted interval contains the count interval (D28)",
  })
  .refine((r) => r.audited === null || r.audit_confirmed === null || r.audited === r.audit_confirmed + (r.audit_corrected ?? 0) + (r.audit_contested ?? 0), {
    message: "audited = confirmed + corrected + contested",
  })
  .refine((r) => r.audited === null || r.audit_sample === null || r.audited <= r.audit_sample, { message: "audited <= sample" })
  .refine(
    (r) => r.audit_error_rate === null || (r.audited !== null && r.audited > 0 && Math.abs(((r.audit_corrected ?? 0) + (r.audit_contested ?? 0)) / r.audited - r.audit_error_rate) < 0.0005),
    { message: "audit error rate = (corrected + contested) / audited" },
  )
  .refine((r) => r.kappa === null || r.passes_d11 === null || r.passes_d11 === (r.kappa_pooled ?? r.kappa) >= 0.6, {
    message: "passes_d11 iff kappa >= 0.6 (pooled kappa for a small wave, D50)",
  })
  .refine((r) => r.n === null || r.n_graded === null || r.n_graded <= r.n, { message: "n_graded <= n" });

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

// ---------------------------------------------------------------- adaptation lag (#86, proposed)

/**
 * Adaptation lag (#86): definitions proposed in docs/proposals/adaptation-lag.md, not yet a decision.
 * Written by `pnpm measure:adaptation-lag` (src/measure/adaptation-lag.ts) to data/measures/adaptation-lag/.
 */

/** One vintage of a numeric forecast path: a graded forecast of one target period from one edition. */
export const AdaptationVintage = z.object({
  claim_id: Id,
  edition: z.string().min(1),
  published: IsoDate,
  /** Months from the publication month to the end of the target period. Null when only the publication year is known. */
  months_before_end: z.number().int().nullable(),
  forecast: z.number(),
  /** D18 points or D16 percent of actual, as in the numeric grade. */
  error: z.number(),
  /** Inside the hit band of the row's rule (D18: 0.5 points; D16: 10%). */
  in_band: z.boolean(),
});

/** Every graded vintage of one publisher's forecast of one series for one target period, oldest first. */
export const AdaptationPath = z.object({
  source_id: Id,
  subject_id: Id,
  family: z.string().min(1),
  statistic: z.string().nullable(),
  target_year: z.number().int(),
  target_period: z.string().nullable(),
  unit: z.string().nullable(),
  rule: NumericRule,
  /** Last month of the target period (YYYY-MM): December, March for UK fiscal years, September for US fiscal years. */
  period_end: z.string().regex(/^\d{4}-\d{2}$/),
  actual: z.number(),
  vintages: z.array(AdaptationVintage).min(1),
  /** First vintage inside the band, and first vintage from which every later vintage stays inside (null: never). */
  first_in_band: z.object({ index: z.number().int().min(0), edition: z.string(), months_before_end: z.number().int().nullable() }).nullable(),
  settled_in_band: z.object({ index: z.number().int().min(0), edition: z.string(), months_before_end: z.number().int().nullable() }).nullable(),
});

/** One forecast path around a shock: the forecast standing at the trigger and how many editions it took to reach the band. */
export const AdaptationShockRow = z.object({
  shock_id: Id,
  source_id: Id,
  subject_id: Id,
  family: z.string().min(1),
  statistic: z.string().nullable(),
  target_year: z.number().int(),
  rule: NumericRule,
  /** Last vintage published in or before the shock's start month. */
  before: z.object({ edition: z.string(), error: z.number(), in_band: z.boolean() }),
  /** First vintage published after the start month (the trigger edition). */
  trigger: z.object({ edition: z.string(), error: z.number(), in_band: z.boolean() }),
  /** `in_band_before`: the standing forecast was already inside the band, nothing to adapt. `reached`: a vintage after the start month is inside the band. `censored`: no vintage of the target period is. */
  outcome: z.enum(["in_band_before", "reached", "censored"]),
  /** Editions after the start month up to and including the first one inside the band (1 = the trigger edition). Null unless reached. */
  lag_editions: z.number().int().min(1).nullable(),
  /** Months from the start month to the publication month of that edition. Null unless reached, or when the month is unknown. */
  lag_months: z.number().int().nullable(),
  /** Editions after the start month that were observed (for a censored row: none inside the band). */
  editions_after: z.number().int().min(0),
  /** Censored rows: `short` when the last vintage still erred on the same side as the forecast before the shock, `overshot` when it moved past the actual to the other side. */
  censored_side: z.enum(["short", "overshot"]).nullable(),
  /** 1 - |trigger error| / |error before|: the share of the standing error the trigger edition removed (negative: it grew). Null when the error before was zero. */
  error_closed_at_trigger: z.number().nullable(),
});

export const AdaptationHypeClass = z.enum(["mainstream", "failed", "stalled", "ambiguous"]);

/** One reading of a Hype Cycle subject's adaptation, computed from one D21 timeline (settled, or one builder's). */
export const AdaptationHypeReading = z.object({
  timeline: z.enum(["settled", "builderA", "builderB"]),
  class: AdaptationHypeClass,
  year_5pct: z.number().int().nullable(),
  year_mainstream: z.number().int().nullable(),
  abandoned_year: z.number().int().nullable(),
  /** Failed or stalled: the year the first graded placement could no longer be a D16 hit (placed year + 2), or the abandonment year if earlier. */
  contradiction_year: z.number().int().nullable(),
  /** Failed or stalled: editions from the contradiction year on that still list the subject. */
  listings_after_contradiction: z.number().int().min(0).nullable(),
  /** Failed or stalled: first edition after the first placement that delayed, dropped or marked it obsolete; years from the contradiction year (negative: before). */
  first_move_toward_evidence: z.object({ edition: z.number().int(), change: z.string(), lag_years: z.number().int() }).nullable(),
  /** Mainstream: first edition with a band under 2 years or the plateau phase; years after the mainstream year (negative: early). */
  arrival_call: z.object({ edition: z.number().int(), gap_years: z.number().int() }).nullable(),
  /** Mainstream: editions after the mainstream year that still placed it 2 or more years from the plateau. */
  late_listings: z.number().int().min(0).nullable(),
  /** Mainstream: exit edition minus the mainstream year (negative: left the chart before mainstream). Null while still listed. */
  exit_gap_years: z.number().int().nullable(),
  /** The bucket the summary counts. */
  bucket: z.string().min(1),
});

export const AdaptationHypeSubject = z.object({
  subject_id: Id,
  name: z.string().min(1),
  /** Editions that list the subject, with Gartner's band and phase. */
  listings: z.array(z.object({ edition: z.number().int(), claim_id: Id, band: z.string().nullable(), phase: z.string().nullable() })),
  /** Every revision row of the subject (revisions.json), with the edition the change is visible in. */
  changes: z.array(z.object({ edition: z.number().int(), change: z.string(), note: z.string().nullable() })),
  /** First edition with no listing after the last one; null while listed in the latest edition (right-censored). */
  exit_edition: z.number().int().nullable(),
  /** `settled`: an adjudicated timeline (D20, D24). `agreed`: both builders, same class and same bucket. `years_differ`: same class, different bucket. `unsettled`: builders disagree on the class. */
  basis: z.enum(["settled", "agreed", "years_differ", "unsettled"]),
  readings: z.array(AdaptationHypeReading).min(1).max(2),
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
export type LinkRelation = z.infer<typeof LinkRelation>;
export type SubjectText = z.infer<typeof SubjectText>;
export type LinkCandidate = z.infer<typeof LinkCandidate>;
export type LinkVerdict = z.infer<typeof LinkVerdict>;
export type LinkVerdictFile = z.infer<typeof LinkVerdictFile>;
export type LinkAuditRecord = z.infer<typeof LinkAuditRecord>;
export type LinkRecheckRecord = z.infer<typeof LinkRecheckRecord>;
export type LinkRecheckFile = z.infer<typeof LinkRecheckFile>;
export type LinkedClaim = z.infer<typeof LinkedClaim>;
export type LinksByTechnology = z.infer<typeof LinksByTechnology>;
export type LinksBySubject = z.infer<typeof LinksBySubject>;
export type NumericRule = z.infer<typeof NumericRule>;
export type PublishedVerdict = z.infer<typeof PublishedVerdict>;
export type NumericAudit = z.infer<typeof NumericAudit>;
export type NumericGrade = z.infer<typeof NumericGrade>;
export type NumericHorizon = z.infer<typeof NumericHorizon>;
export type NumericStats = z.infer<typeof NumericStats>;
export type NumericSummary = z.infer<typeof NumericSummary>;
export type NumericComparison = z.infer<typeof NumericComparison>;
export type RawCorrection = z.infer<typeof RawCorrection>;
export type ValidationRow = z.infer<typeof ValidationRow>;
export type AdaptationVintage = z.infer<typeof AdaptationVintage>;
export type AdaptationPath = z.infer<typeof AdaptationPath>;
export type AdaptationShockRow = z.infer<typeof AdaptationShockRow>;
export type AdaptationHypeClass = z.infer<typeof AdaptationHypeClass>;
export type AdaptationHypeReading = z.infer<typeof AdaptationHypeReading>;
export type AdaptationHypeSubject = z.infer<typeof AdaptationHypeSubject>;
