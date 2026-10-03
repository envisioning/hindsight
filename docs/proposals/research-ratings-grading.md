# Proposal: how Envisioning's research ratings become graded claims (#95)

*Proposal for MZ, 2026-10-03. Not a decision: no D number, nothing graded. When approved it becomes the next D number and #95 step 4 (normalize) is wired to it.*

## What the snapshot holds

`data/raw/envisioning-research/2026-10-03.json`: 4,018 published technologies in 47 published research projects, three ratings each, resolved labels and metric names (see `INDEX.md` there).

Two findings change the plan in the issue:

1. **metric2 and metric3 are not momentum and product stage.** The issue reads `interestDefinitions` (Low Interest to High Interest) and `maturityDefinitions` (Concept to Retired, 1 to 9) from `metrics.ts`. No project uses them. Every standard project maps `metric2` to `impactDefinitions` and `metric3` to `investmentDefinitions` (research `projects/*/data/metrics.ts`, `app-common/config/schema.ts`): Impact 1 to 5 and Investment level 1 to 5, both Minimal, Low, Medium, High, Very High. The CMS values agree: `metric3` never exceeds 5 outside xenotech. So there is no "Accelerating" momentum label to read as a forecast, and no product-stage scale.
2. **The ratings carry no date of their own.** `last_reviewed_at` is empty on all 4,018 rows. `updated_at` is a bulk date (2,741 rows on 2026-05-25, 1,259 on 2026-09-28, the embedding backfill), not the date a rating was set. The snapshot date is the only date a rating can carry.

Custom scales (CMS `research_metrics`, project level; no collection-level overrides exist today): `cities` (TRL 1 to 9 with its own labels, Diffusion of Innovation, Technology Life Cycle), `moradia` (Brazilian adoption, inclusivity, friction; 15 rows with no ratings), `subspace` and `xenotech` (fiction and alleged exotic technology). `democracy` has custom metrics in code but no rows in the CMS, so it is not in the snapshot. 3,447 technologies use the default scales.

## Proposed rule

**R1. Only readiness is graded.** `metric1` (Technology Readiness Level, 1 to 9) on the default scale and on `cities` is a state-of-affairs claim under D30: "on the snapshot date, technology X is at readiness level L". Impact and Investment are recorded, never graded: Impact is a magnitude with no horizon or unit (unfalsifiable, D27), and Investment level has no unit or threshold to check against. `moradia`'s scales are regional judgments with no published test; `subspace` and `xenotech` are fiction or alleged technology (fiction is never graded hit or miss). All four are recorded only.

**R2. One claim per rating, dated at its first snapshot.** A claim is a (technology, level) pair. Its date is the first snapshot that shows that level; later snapshots with the same level extend it (`held_from`, `held_to`) without new claims. A changed level is a new claim; the old one stays (append-only), and the change is recorded as a revision, as for the 2011 to 2012 posters. Snapshot dates are the editions.

**R3. Readiness is checked against dated milestones, not judged afresh.** The three Origins milestones (#81: first working prototype, first commercial product, mainstream at about 20% of relevant users or uses) give the expected band on any date:

| Milestones reached by the snapshot date | Expected TRL band |
|---|---|
| none | 1 to 3 (Speculative, Theoretical, Conceptual) |
| prototype | 4 to 6 (Formative, Validated, Demonstrated) |
| prototype, product reached within the last 2 years or only in pilots | 7 (Operational) |
| commercial product | 8 (Deployed) |
| mainstream | 9 (Established) |

Verdicts, for a new claim type `rating` (needs `ClaimType` and `VERDICTS_BY_TYPE` in `src/schema.ts`):

- `accurate`: the rated level is inside the expected band, or one level outside it.
- `early`: the rating is two or more levels above the band (it put the technology further along than it was).
- `late`: two or more levels below the band (it understated how far along it was).
- `unfalsifiable`: the technology names a class too broad to date milestones for (D30's two-readings test).
- `open`: the linked subject has no dated milestones yet.

The milestones come from Hindsight, not from the rater: a technology is gradable only through an active `same` link (D48) to a subject whose milestones are dated (Origins #81, or a D21 adoption timeline cross-checked as #81 already says). Broader and narrower links do not carry milestones over.

**R4. Grading is agentic and blind (D7, D20).** Two blind graders check the milestone dating for each linked subject where #81 has not dated it; the verdict is computed from the dates by a rule script (as `scripts/gartner-hype-cycle/rule.mjs` does for D21), so agreement, adjudication, the fixed-seed audit and the final step run unchanged. Graders never see the rating while dating milestones, so a rating cannot pull the dates.

**R5. No score.** Counts per verdict per snapshot, as for every other source. No total, no ranking of projects.

## What it covers today

- Gradable scale: 3,546 technologies (3,447 default, 99 `cities`).
- With an active `same` link to a subject: 459 technologies (448 subjects) at this commit.
- Of those subjects, 3 have a D21 adoption timeline; none has Origins milestones yet. So almost every claim is `open` until #81 dates milestones for research-linked subjects. The first graded wave depends on extending #81's subject list to these 448.

## Options not proposed

- **Read TRL as a forecast** (a level implies years to mainstream, like a Hype Cycle band). The research apps state no horizon, and a claim is graded only against what it said (AGENTS.md). Rejected unless the apps publish a horizon per level.
- **Grade Impact as a forecast of outcomes.** No horizon and no unit. Rejected.
- **Grade on updated_at.** It is a bulk migration date, not the rating date.

## Cost

- Envisioning grades its own present research. The blind pipeline and the audit are the check; publish the verdicts whatever they show.
- Coverage depends on links (459 of 3,546 today) and on #81. Most ratings stay `open` for a while.
- A one-level tolerance is generous at the band edges; TRL 7 is the least sharp band (pilot versus first product).
- Snapshots are monthly: a rating changed and changed back within a month is never seen.

## What MZ decides

1. Readiness only (R1), Impact and Investment recorded but never graded?
2. The TRL-band table (R3) and the one-level tolerance?
3. Verdict names `accurate / early / late` (alternative: `ahead / behind`), as a new claim type `rating`?
4. Milestones only through `same` links (R3), and extending #81 to the 448 research-linked subjects?
5. `cities` graded with the default projects (its metric1 is TRL with other labels)?
