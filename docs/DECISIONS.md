# Decisions

Append only. Each entry says what was decided, why, what it costs, and what would overturn it. Supersede a decision with a new entry; never edit one in place.

## D1: The unit is the claim, not the technology

*Recorded 2026-09-27.*

**Decision.** The reference unit is a published claim about the future: dated, attributed, and resolvable.

**Why.** A technology has no author, no date and no edges, so a catalogue of technologies cannot be graded or cited precisely. A claim has all three.

**Cost.** Every claim needs extraction from a source, subject mapping and grading. That is more work per record than a technology entry.

**Overturned by.** Evidence that readers cite subjects, not claims.

## D2: Code and releases in this public repo, data maintained in the Core CMS

*Recorded 2026-09-27.*

**Decision.** Hindsight's rows live in its own tables in the Envisioning Core CMS, where agents and editors maintain them. This repo holds the code and the tagged dataset releases (`data/out`). Web pages read the CMS directly.

**Why.** The CMS is where Envisioning maintains data. Git is where data is shared, versioned and cited.

**Cost.** Pull-request review with diffs does not cover edits. The append-only history tables and the `published` flag replace it.

**Overturned by.** Edits that need line-by-line review before publication.

## D3: Minimal coupling

*Recorded 2026-09-27.*

**Decision.** Hindsight depends at runtime only on its own tables. Its one real seam is `SubjectTechnologyLink` to the research database. Links to other systems go one way, by URL or optional id.

**Why.** Each cross-project link lets one project's change break another.

**Cost.** Some duplication: evidence copies signal fields, institutions have their own ids.

**Overturned by.** A need that a one-way link cannot meet, written down here first.

## D4: Hindsight owns its subjects

*Recorded 2026-09-27.*

**Decision.** Claims point at Hindsight subjects, not at research technologies. One link table joins subjects to technologies.

**Why.** Many subjects are not technologies (GDP growth, pandemic risk). A shared concept table would make the research team maintain a layer that exists only for Hindsight.

**Cost.** Two identity systems, joined by agentic links.

**Overturned by.** A canonical concept layer in the research database that exists for its own reasons.

## D5: Agentic links

*Recorded 2026-09-27.*

**Decision.** Subject-to-technology links are proposed by embedding similarity and verified by a second agent pass. No human review. Each link records similarity, method, agent and date. `curated` links are never overwritten.

**Why.** The research database grows continuously. Human review of every link does not scale.

**Cost.** Wrong links reach pages. Batch retraction by method or agent is the remedy.

**Overturned by.** A retraction rate high enough that readers notice wrong links.

## D6: Grading rules

*Recorded 2026-09-27.*

**Decision.** Each claim type has its own verdicts (`VERDICTS_BY_TYPE`). Scenarios and fiction are graded on coverage and appearance, never hit or miss. `unfalsifiable` is a published finding. There is no total score and no ranking of institutions.

**Why.** Grading a scenario as a miss is a category error that foresight practitioners reject. A ranking would turn a record into a league table.

**Cost.** Calibration is harder to summarise in one number.

**Overturned by.** Nothing planned.

## D7: Agentic verdicts with independent agreement

*Recorded 2026-09-27.*

**Decision.** Two agents grade each claim independently; the second does not see the first agent's reasoning. A verdict publishes only when they agree and at least one evidence row exists. Disagreements stay `contested` and are listed publicly. Every verdict row records model and prompt version. Before each release a person reads a random sample, weighted toward `miss` verdicts about named institutions, and the result is published with the release.

**Why.** Human confirmation of every verdict does not scale. Independent agreement, required evidence and a published audit make agent errors visible and correctable.

**Cost.** A verdict is a public statement that a named institution was right or wrong. An agent error is a public error until someone disputes it.

**Overturned by.** A low agreement rate between the two agents, or an audit sample with errors.

## D8: Disputes through a GitHub issue template

*Recorded 2026-09-27.*

**Decision.** Anyone can dispute a verdict with the "Dispute a verdict" issue template. A dispute with evidence reopens the claim for both agents.

**Why.** Public, linkable, and it becomes the correction record.

**Cost.** Institutions that prefer a private channel must use a public one.

**Overturned by.** Institutions that refuse to dispute in public.

## D9: First release is a report and a dataset

*Recorded 2026-09-27.*

**Decision.** Release 1 is "30 years of the Hype Cycle, graded", published as a report with a CC BY dataset. Envisioning grades its own early technology timelines first. Pages per claim, subject and institution come only if the report gets cited.

**Why.** The report tests whether anyone cites graded forecasts before building a reference site around them. Grading our own record first shows we accept the same scrutiny.

**Cost.** No browsable reference pages at launch.

**Overturned by.** Citations of the first release, which trigger the reference pages.

## D10: Grading rule for year-placed forecasts

*Recorded 2026-09-27.*

**Decision.** A forecast that places a technology on a year reads as "this technology becomes mainstream around that year". It is graded:

- `hit`: mainstream adoption within 2 years of the placed year.
- `partial`: real but niche adoption by the placed year, or mainstream 3 to 5 years off.
- `miss`: not mainstream within 5 years of the placed year, or abandoned.
- `unfalsifiable`: the label is too vague to test, with the reason stated.
- Placements after the current year stay `open`.

A quantitative forecast is a `hit` within 10% of the actual figure for its year, `partial` within 25%, and a `miss` beyond that.

**Why.** The first graded source, Envisioning's own "Envisioning Technology" posters (2011, 2012), states that it shows which technologies "should become mainstream in the coming years". The tolerances give year placements a fair margin without letting a decade-late arrival count as a hit.

**Cost.** "Mainstream" needs evidence of adoption, not of existence. Each verdict must cite adoption data.

**Overturned by.** Low agreement between the two grading agents on what counts as mainstream, which would call for a numeric adoption threshold per category.

## D11: Validation thresholds

*Recorded 2026-09-28.*

**Decision.** Accuracy figures publish only under these rules (protocol in issue #40):

- **Grader agreement:** Cohen's kappa between the two grading agents (D7), per source and claim type, is at least 0.6. Below that, the rubric for that source is revised before any verdict publishes.
- **Human audit:** each release, a person reads a random sample of at least 50 claims or 10% of graded claims, whichever is larger, stratified by verdict and weighted toward `miss` verdicts about named institutions. Sample size, error rate and every correction are published.
- **Minimum sample:** no rate is published for a band, horizon or source with fewer than 20 graded claims. Below that, counts only.
- **Uncertainty:** every rate is shown with a Wilson 95% interval, never as a bare percentage, and is recomputed with the audit error rate applied.
- **Double extraction** wherever a second independent route exists, with the agreement rate published per source.

**Why.** An accuracy figure about a named publisher will be read by people who want it to be wrong. Agreement, audit, sample size and intervals make each figure defensible, and make its limits visible.

**Cost.** Small sources and thin bands publish counts, not rates. The audit takes a person's time each release.

**Overturned by.** Evidence that a threshold is too strict to publish anything useful, or too loose to catch errors the audit finds.

## D12: Schema changes for normalized claims

*Recorded 2026-09-28.*

**Decision.** `src/schema.ts` changes, the minimum the raw captures need (issue #38):

- `Claim.quote` is optional. A claim then carries `statement`, and `statement_generated: true` when Hindsight wrote it. Numeric sources (IMF, OECD, World Bank, Fed, ECB, CBO, OBR, BCB, EIA and most IEA and BP rows) are data tables with no prose to quote. A generated statement is never a quote. Every claim has a quote or a statement (enforced).
- `Claim` gains `unit`, `note` and `phase` (the Hype Cycle phase, D14).
- `Evidence.date` and `Evidence.stance` are optional. Grader 1 recorded some evidence as "n.d." or "unknown", and recorded what each source shows, not a stance.
- `Revision.new_claim_id` is absent exactly when `change` is `dropped`: a dropped subject has no claim in the next edition. `Revision` gains `subject_id` and `note`.
- New shapes: `SubjectAlias`, `HypePhase`, `HypePhaseBoundaries`. `Subject` gains `related` and `notes` (D13).
- Every normalized claim has `published: true`: it is a fact from a public edition. Verdicts still publish only under D7.
- The poster verdicts of grader 1 record `model` and `prompt_version` as `unrecorded`, because the grading run did not record them. Grader 2 must record both.

**Why.** Faking a quote for a table value, or a date for undated evidence, would put invented text under a publisher's name.

**Cost.** A page must show a generated statement differently from a quote.

**Overturned by.** A source whose table rows come with a citable sentence each.

## D13: Subjects: deterministic quantities, conservative label merges

*Recorded 2026-09-28.*

**Decision.**

- Economic and energy series map to fixed subject ids in `src/normalize/quantities.ts`. The same economy and measure gets the same id from every publisher (`united-states-real-gdp-growth` from IMF, OECD, World Bank and CBO). A different measure gets its own id and a `related` link, with the difference in `notes`: Q4-over-Q4 growth (Fed SEP) is not annual-average growth; the World Bank world aggregate at market exchange rates is not the IMF's PPP-weighted one; World Bank country groups are not IMF groups of the same name.
- Publisher labels map through `data/normalized/subject-aliases.json`, a registry that only grows. Method `exact`: the label names the subject. `normalized`: same label after ignoring case, accents, punctuation and a final plural. `judgment`: a merge in `data/normalized/subject-curation.json`, with a one-line reason each.
- Merge only when the thing is the same (spelling variants, abbreviations, a publisher's own recorded rename, clear synonyms such as additive manufacturing and 3D printing). Otherwise link with `related` (for example 3D printing and Consumer 3D Printing). The Hype Cycle `technology_index` groups are evidence, not truth: "Speech Recognition for Mobile Devices" and "...for Telephony" share a group and stay apart.
- A claim can carry several subjects: a quantity and the technology it measures (BNEF sales carry `global-passenger-ev-sales` and `electric-vehicles`).

**Why.** Comparing forecasts of the same thing across sources is the point of a subject page. A wrong merge compares different things; a missing merge only hides a comparison.

**Cost.** Many labels stay single-source subjects (1,746 subjects for 20 sources). Judgment calls need review.

**Overturned by.** Subject pages that show wrong comparisons, or a canonical concept layer (D4).

## D14: Hype Cycle phase from measured boundaries

*Recorded 2026-09-28.*

**Decision.** For editions 2005 to 2017, the phase of each entry is derived from its digitized `x_time` and the four phase boundaries measured on that edition's chart, stored as data in `data/normalized/hype-cycle-phase-boundaries.json`. The 2005 chart draws no boundaries; 2005 uses the mean of the 12 measured editions. A phase read on the chart (2016) is kept over the derived one. Entries within 0.5 points of a boundary carry a note. Entries from 1995 to 1998 have no band: they are claims, but they cannot be graded on timing.

**Why.** Phase is part of what Gartner said. The measurements show that in the frame of the digitized positions the boundaries are nearly fixed (spread under 0.7 points across 2006 to 2017), and the 2016 cross-check agrees on 33 of 34 entries; the one disagreement sits on a boundary.

**Cost.** Phases within about half a point of a boundary are uncertain.

**Overturned by.** A primary phase listing for an edition that disagrees with the derived phases away from the boundaries.

## D15: Permanent claim ids

*Recorded 2026-09-28.*

**Decision.** A claim id is `<source>-<edition>-<nnn>`. On the first assignment in an edition, nnn is the row's 1-based position in the raw edition file's `entries`, zero-padded to 3 digits, counting rows that are not claims (base-year rows, Fed SEP medians computed by Hindsight, OBR memo rows), so ids can have gaps. The Envisioning posters keep their raw ids (`et-2012-045` becomes `envisioning-technology-2012-045`). After the first assignment `data/normalized/ids.json` governs: it maps a natural key per raw row to its id, a known key keeps its id forever, and a new key gets the next number above the highest ever used in its edition. The natural key per source is in `data/normalized/PROGRESS.md`.

**Why.** envisioning.com serves a permalink per claim. A re-capture or a reordered raw file must not move a permalink.

**Cost.** The registry is state that must be committed with the data. A natural key that changes in a re-capture (for example a corrected quote in a Gartner prediction) creates a new id; the old id is kept in the registry and never reused.

**Overturned by.** Nothing planned.

## D16: Grading rule for year-placed forecasts, revised (supersedes D10)

*Recorded 2026-09-28.*

**Decision.** A forecast that places a technology on a year reads as "this technology is mainstream around that year".

- **Mainstream** means at least 20% of the target users or households in major markets, or at least 50% of new units shipping with it (for a device feature), or routine use by at least 20% of the relevant industry. The grader names the test used.
- `hit`: mainstream within 2 years after the placed year, or already mainstream at the placed year (arriving early is not penalised).
- `partial`: a measurable share of at least 5%, below mainstream, by the placed year; or mainstream 3 to 5 years after the placed year.
- `miss`: below 5% within 5 years after the placed year, or abandoned. A miss whose 5-year window has not closed yet is marked provisional, with the closing year.
- `unfalsifiable`: only when the plausible readings of the label give different verdicts and no reading dominated at publication time. Otherwise the dominant reading is graded and recorded.
- Quantitative forecasts keep the D10 rule: `hit` within 10% of the actual figure for its year, `partial` within 25%, else `miss`.

**Why.** Under D10 the two blind graders of the Envisioning posters agreed on 76 of 113 claims, kappa 0.52, below the D11 floor of 0.6. The disagreements clustered on three gaps in D10: no floor under "niche" (partial or miss, 18 cases), no threshold for "mainstream" and no rule for early arrival (hit or partial, 13 cases), and no test for vague labels (5 cases). This decision closes all three with numbers.

**Cost.** Thresholds are a convention; a technology at 19% of households is a partial and one at 21% a hit. Early arrival is not penalised, so a forecast that names something already here scores a hit; that trades rigour on foresight for a simpler, more testable rule.

**Overturned by.** A kappa below 0.6 on the re-grade under this rule, or audit findings that the thresholds misclassify clear cases.

## D17: Publishers side by side, not ranked (amends D6)

*Recorded 2026-09-28.*

**Decision.** Publishers of the same claim type may be shown in one table: each with its hit rate, its Wilson 95% interval, its sample size and its unfalsifiable share. The table is sorted alphabetically, never by score. There is still no single total score and no rank position. Claim types are never mixed in one table: technology placements, numeric forecasts, rankings and scenarios each get their own.

**Why.** Readers want to know how Envisioning's record compares with others. A side-by-side table answers that; intervals show where two publishers cannot be told apart, which a rank would hide.

**Cost.** Readers will rank the table themselves. The intervals and sample sizes are the counterweight.

**Overturned by.** Evidence that the table is read and cited as a league table despite the design.

## D18: Grading numeric forecasts of rates

*Recorded 2026-09-28.*

**Decision.** For forecasts of a rate in percent (GDP growth, inflation, unemployment, interest rates), the error is the forecast minus the actual, in percentage points. `hit`: within 0.5 points. `partial`: within 1.0 point. `miss`: more than 1.0 point off. Every publisher also gets its mean error (bias), mean absolute error, and error by horizon (current year, next year, further). The actual value is the latest published figure, with its vintage recorded; a first-release comparison may be added later. Forecasts of levels (for example GW of solar, oil in Mb/d, a count of devices) keep the D16 percentage rule: within 10% hit, within 25% partial.

**Why.** A 10% relative band on a growth rate is meaningless (10% of 2% is 0.2 points). Percentage points are how these forecasters and their evaluators measure error.

**Cost.** One threshold for all rates treats a 0.5-point miss on volatile inflation the same as on stable growth.

**Overturned by.** Evidence that per-series thresholds are needed, for example from the publishers' own evaluation reports.
