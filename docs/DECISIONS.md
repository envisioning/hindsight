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
