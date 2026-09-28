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
