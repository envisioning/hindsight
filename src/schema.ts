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
});

export const ClaimType = z.enum(["forecast", "trend", "scenario", "ranking", "fiction"]);

/** One expectation, extracted from one source edition. */
export const Claim = z.object({
  id: Id,
  source_edition_id: Id,
  /** The exact short quote, with its position. Facts and short attributed quotes only. */
  quote: z.string().min(1).max(400),
  position: z.string().optional(),
  subject_ids: z.array(Id).min(1),
  claim_type: ClaimType,
  metric: z.string().optional(),
  direction: z.enum(["up", "down", "arrive", "persist", "other"]).optional(),
  value: z.string().optional(),
  target_date: IsoDate.optional(),
  /** A band such as "2 to 5 years", when the claim gives no date. */
  horizon_band: z.string().optional(),
  hedge: z.string().optional(),
  status: z.enum(["open", "resolved", "contested"]),
  published: z.boolean(),
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
  date: IsoDate,
  title: z.string().min(1),
  stance: z.enum(["supports", "contradicts"]),
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
export const Revision = z.object({
  id: Id,
  prior_claim_id: Id,
  new_claim_id: Id,
  change: z.enum(["delayed", "advanced", "dropped", "renamed", "reversed"]),
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
export type ClaimType = z.infer<typeof ClaimType>;
export type Claim = z.infer<typeof Claim>;
export type Verdict = z.infer<typeof Verdict>;
export type Evidence = z.infer<typeof Evidence>;
export type VerdictRow = z.infer<typeof VerdictRow>;
export type Revision = z.infer<typeof Revision>;
export type SubjectTechnologyLink = z.infer<typeof SubjectTechnologyLink>;
