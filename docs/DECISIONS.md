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

**Amended by D20:** the audit is done by an independent agent, not a person.

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

## D19: Numeric forecasts are graded by a deterministic command

*Recorded 2026-09-28.*

**Decision.** Numeric forecasts of the 12 numeric sources (IMF, OECD, World Bank, Fed, ECB, CBO, OBR, BCB, EIA, IEA, BP, BNEF) are graded by `pnpm grade:numeric` (`src/grade/numeric.ts`), not by agents.

- The grade is arithmetic under D18 (rates in percent: error in percentage points, hit within 0.5, partial within 1.0) and the D16 numeric rule (levels: error = (forecast minus actual) / |actual|, hit within 10%, partial within 25%). The absolute value in the denominator keeps the sign of the error meaning "forecast too high" for negative actuals such as deficits. A tolerance of 1e-9 absorbs float noise at the thresholds.
- D7 (two independent agents, kappa) does not apply: the same inputs always give the same verdict. The D11 human audit for these sources checks the forecast-to-actual matching on a random sample (right actual series, same definition, right year), not the arithmetic. D11 minimum samples and Wilson intervals apply unchanged.
- Each claim gets one of four statuses: `graded`; `ungradable` (the forecast and the captured actual are not on the same definition, or no actual on that definition exists); `open` (target year after 2025, or the actual series does not reach it yet); `excluded` (not a forecast to grade: a scenario, a longer-run projection without a year, an estimate of a year before publication, a value not public at the time, a quote without a value). Every status other than `graded` states its reason.
- The actual is the latest captured value on the forecast's definition, with its vintage. Where the latest vintage uses another definition, definition wins: EIA forecasts are graded against the actuals of the same AEO Retrospective; IEA forecasts against the IEA's own later-stated history, not Ember.
- Definition calls made in the command, each written in `data/graded/README.md`: group aggregates whose membership changed (IMF groups, euro area, OECD total) are graded with a note, because every publisher evaluates itself this way and the membership drift is small; World Bank income groups before June 2016 are ungradable, because the WDI groups use today's income classification; OBR public sector net borrowing forecasts before March 2020 are ungradable, because the definition changed (the student-loan reclassification alone is 0.8 to 0.9% of GDP a year); ECB ranges and Fed central tendencies are graded at their midpoint, with a note whether the actual lies inside the published range; Fed medians count as public at the time when the FOMC published them or when they follow from the published dot plot.
- Schema: `src/schema.ts` gains `NumericGrade`, `NumericStats`, `NumericSummary` and `NumericComparison` (with `NumericRule` and `NumericHorizon`). No existing shape changes. Numeric grades live in `data/graded/numeric/`, not in `verdicts.json`: a `VerdictRow` needs agent, model and evidence rows, which a computation does not have. How numeric grades enter the release export is left to the export step.

**Why.** A computed verdict does not need a second grader, and a second agent adds cost without adding checks. The errors that can happen are matching errors (wrong series, wrong basis, wrong year), and those are what a person should audit.

**Cost.** Each definition call in the command is a judgment made once, in code, for thousands of rows. A wrong call is wrong everywhere until the audit finds it. Rows that are ungradable today (for example India in the World Bank GEP before 2023) need a new actual series, not a regrade.

**Overturned by.** Audit findings that the matching is wrong in more than a few sampled rows, or a numeric claim type that needs judgment to read (for example a prose forecast with a vague quantity).

## D20: Agents do all grading, adjudication and audit (amends D7, D11)

*Recorded 2026-09-28.*

**Decision.** Hindsight is the grader. No verdict, adjudication or audit decision is handed to a person at Envisioning.

- **Contested verdicts:** where the two blind graders (D7) disagree, a third agent adjudicates. It reads the claim, both readings, both verdicts and both sets of evidence, may search for more, and picks the verdict under the source's rule. The result is marked `adjudicated`, with its reason. Agreed verdicts are not reopened by the adjudicator.
- **Ambiguous claims:** the adjudicator also takes claims where both graders flagged the reading as uncertain. It picks one reading, states it, and grades that reading. If no reading is more faithful to the text than another and the readings give different verdicts, the verdict is `unfalsifiable` (D16).
- **Audit (D11):** an independent agent audits the fixed-seed sample of agreed verdicts. It checks each cited source says what the grader says it says, applies the rule again, and records confirm, correct or contest in `audit-d11.json`. The sample rule, sample size and published error rate are unchanged.
- **Definition calls** in numeric grading (D19) are made in code with the reason written in `data/graded/README.md`, as before.
- **People** outside the grading process correct verdicts through a public dispute (GitHub issue). A dispute is graded by an agent under the same rule, and the result and reason are published.

**Why.** A benchmark whose verdicts depend on its publisher's staff judgment is not independent of that publisher. Envisioning is one of the graded publishers. Agents working from written rules and cited evidence give a record anyone can re-run and check.

**Cost.** An agent auditor shares blind spots with agent graders. The audit error rate measures how often the evidence does not support the verdict, not how often agents are wrong in ways all agents are wrong. Disputes are the check on that.


## D21: Hype Cycle verdicts from blind adoption timelines

*Recorded 2026-10-01.*

**Decision.** The Gartner Hype Cycle is graded per subject, not per claim. A Hype Cycle entry places a technology on a band of years to mainstream adoption; many entries name the same technology in several editions.

- **Timelines.** Two blind builders write one adoption timeline per subject (199 subjects, `timeline-subjects.json`): the reading of the label, the test, `year_5pct`, `year_mainstream`, `abandoned` and `abandoned_year`, with evidence. A builder that finds no dominant reading of a label writes `ambiguous:` in the reading and leaves the years null.
- **Claims graded.** An entry with a band of `<2`, `2-5` or `5-10` years. The placed year is the edition plus the upper bound of the band (2, 5, 10). An entry is gradable when the placed year plus 5 is not after 2026, so a `miss` is never provisional. Entries with a band of more than 10 years, with no band (1995 to 1998, some later rows) or marked obsolete before plateau are not graded by this method.
- **Verdict.** Computed by `scripts/gartner-hype-cycle/rule.mjs` under D16: `hit` when mainstream by the placed year plus 2 (earlier counts) and not abandoned before the placed year; `partial` when mainstream 3 to 5 years after, or at least 5% by the placed year; `miss` otherwise; `unfalsifiable` for an ambiguous label. `scripts/gartner-hype-cycle/verdicts.mjs` writes one verdict file per builder in the grader format, so the generic pipeline (agreement, audit sample, final) applies unchanged.
- **Agreement** (D11) is Cohen's kappa on the computed verdicts, not on the years. First run: 409 gradable claims, 325 agreed, kappa 0.66.
- **Adjudication** (D20) settles the timeline of each subject with a contested claim, or with a claim both builders called unfalsifiable. The verdict of each such claim is then computed from the settled timeline by the same rule (`adjudicate.mjs`). Agreed claims are not reopened, even where the settled timeline would give them another verdict; the audit is the check on those.
- **Audit** (D11, D20) is the standard fixed-seed sample of 50 agreed claims.

**Why.** A builder who grades each claim separately can give the same technology different adoption years in different editions. One timeline per subject makes every edition's claim about that technology consistent, and a builder writes 199 timelines instead of 409 verdicts. Computing verdicts from timelines keeps the rule in code where anyone can re-run it.

**Cost.** One wrong year in a timeline is wrong for every edition of that subject. Agreement on verdicts can hide disagreement on years that does not change a verdict. Placing at the upper bound of the band is generous to the forecast: a `2-5` entry is a hit at mainstream up to 7 years after the edition.

**Overturned by.** Audit findings that the timelines misplace years for many subjects, or evidence that readers take the band's midpoint, not its upper bound, as Gartner's forecast.

## D22: `ungradable` as a grader outcome for judgment sources

*Recorded 2026-10-01.*

**Decision.** A grader may record `ungradable` for a claim when no public measure of what it states exists at its target year (for example a "market cap created by" figure, or a share of organizations that no survey measures). The grader names what it looked for. `ungradable` is not a D16 verdict and is never published as one: the agreement script (`scripts/agreement-d16.mjs`) counts it as a category for kappa, keeps claims both graders call ungradable out of the consensus and out of every rate (`ungradable_agreed`), and sends a one-sided `ungradable` to the adjudicator like any other disagreement. `final-d20.json` counts it under `counts.ungradable`. It mirrors the numeric `ungradable` status of D19.

**Why.** Without it a grader must call an unmeasurable claim `unfalsifiable`, which D16 reserves for claims whose readings diverge, or guess a verdict from a proxy. Both put a false statement under a publisher's name.

**Cost.** A grader can use `ungradable` to avoid a hard claim. The adjudicator and the audit see every one-sided use, and the share per source is published.

**Overturned by.** A high ungradable share that the audit finds measurable.

## D23: When a numeric claim is ungradable (amends D22 for ARK Big Ideas and similar sources)

*Recorded 2026-10-01.*

**Decision.** The first blind grading of ARK Big Ideas (75 claims, target year 2025 or earlier) gave kappa 0.53, below the D11 floor. 15 of the 19 disagreements were `ungradable` against a verdict. Before a re-grade of all 75 claims by two new blind graders, the rubric adds:

- **Same quantity.** A claim is gradable when a public series measures the quantity it names, for the scope it names (region, segment), in the target year or the year before. A different baseline, vintage or method of the same quantity is gradable; state the difference. A proxy of another quantity (for example vendor revenue divided by unit price, for a unit count) is not a measure: the claim is `ungradable`.
- **Range of estimates.** Where several public estimates of the same quantity exist and disagree, grade against their median and name every estimate used. Where they span more than a factor of 2, the claim is `ungradable`.
- **Conditional claims.** A claim that states a condition ("if robotaxis launch at scale, ...") is graded only if the condition held by the target year. If not, it is `ungradable`, with the condition named. The stated figure alone is never graded as a miss.
- **Attributed value.** A value attributed to a technology ("market cap created by", "GDP added by", "opportunity") is `ungradable` unless a public source measures that attribution for the target year.
- **Scope not stated.** Read the scope from the edition's own chart or footnote. If the edition does not settle it, grade the dominant reading and name it; use `unfalsifiable` only under D16.

**Why.** The graders agreed on almost every claim they both graded. They split on whether a measure existed, which D22 left to judgment.

**Cost.** More claims become `ungradable`, so the ARK sample of graded claims shrinks, possibly below the D11 minimum of 20 for a rate.

**Overturned by.** A re-grade below kappa 0.6, which would call for numeric claims of this kind to be graded by command, as in D19.

## D24: Re-check passes for adjudication and audit

*Recorded 2026-10-01.*

**Decision.** When an adjudication or an audit was made with less access than it needed (for example without page access), a later pass checks it again. A pass never edits the earlier file. It writes a new file next to it: `timelines-adjudicated-d20-pass<N>.json` for Hype Cycle timelines, `audit-d11-pass<N>.json` for an audit. Each record in a pass is complete and names the earlier decision. The scripts read every pass in order, and a later record replaces the earlier record of the same subject or claim: `scripts/gartner-hype-cycle/adjudicate.mjs` for timelines, `scripts/final-d20.mjs` for audits. An audit pass may only cover claims in the stored fixed-seed sample; the sample is not redrawn. `final-d20.json` lists the passes it used.

**Why.** The Hype Cycle adjudication and audit of 2026-10-01 checked sources through search-result summaries only, because the network blocked page fetches. Those records must be checked with the pages open before release, and the record of what was decided first must stay.

**Cost.** Two files per step instead of one. A reader must read the latest pass to see the published decision; `final-d20.json` already resolves it.

**Overturned by.** A history store for verdict rows (D2) that keeps every decision as its own row.

## D25: MIT TR10 horizons from the Availability line only

*Recorded 2026-10-01.*

**Decision.** MIT Technology Review's 10 Breakthrough Technologies (#51) is graded only where the edition states an availability horizon in its own Availability (or "When") line, from 2017 on. `scripts/mit-tr-10-breakthrough/horizons.mjs` parses that text into a band of years after the edition and writes `horizons.json`.

- The placed year is the edition year plus the upper bound of the band, as D21 does for the Hype Cycle. "Now" and "This year" place the claim at the edition year. An open upper bound ("5-10+ years") is placed at the stated bound. A calendar year in the text places the claim in that year. Every non-literal reading carries a parse note.
- A claim is graded under D16 (mainstream around the placed year) when the placed year is 2025 or earlier. A later placed year is `open`.
- Availability text with no horizon ("In human testing") is `ungradable`. An entry with no Availability line is `ungradable`.
- A timing that appears only in the article's body text (2001 to 2016 editions) is recorded as `not graded`, not parsed. Body text often quotes a researcher or a company, so the timing is not always the edition's own placement.

**Why.** The Availability line is the publication's own forecast in a fixed slot. Body text mixes the editors' view with quoted views, and telling them apart needs a reading per article that the capture did not do.

**Cost.** Of 254 entries, 39 are graded now and 8 are open; 70 entries with a body-text timing are left out, so editions before 2017 are not graded. The TR10 rate rests on a small sample.

**Overturned by.** A capture pass that marks, per body-text timing, whether the editors state it in their own voice. Those timings can then be parsed and graded under this rule.

## D26: Grading waves within a source

*Recorded 2026-10-01.*

**Decision.** Claims added to a source after its first grading are graded as a new wave, not by redoing the source. Wave 1 is everything graded before; wave N (N > 1) has grader batch files named `verdicts-d16-grader<A|B>-w<N>[-<batch>].json`.

- `scripts/agreement-d16.mjs` merges all waves into one `agreement-d16.json`, tags each row of a later wave with `wave`, and reports kappa per wave. Each wave must pass D11 (kappa at least 0.6) on its own.
- The adjudicator of wave N writes `adjudicated-d20-w<N>.json`. Earlier adjudications are not reopened.
- The audit of wave N is its own fixed-seed sample of that wave's agreed claims (`node scripts/audit-sample.mjs <source> --wave w<N>`, seed `d11:<source>:d16:w<N>`, at least 50 or all agreed claims if fewer), in `audit-d11-w<N>.json`. The wave-1 sample in `audit-d11.json` is drawn from wave-1 claims only, so it never changes.
- `scripts/final-d20.mjs` merges every wave. The published rate and audit error rate cover all waves; `final-d20.json` lists the waves.

**Why.** Kurzweil (#63) adds 124 claims to a source whose 147 claims were graded, adjudicated and audited. Redrawing the audit sample over all claims would discard a finished audit. The yearly refresh (#58) will add claims to every source in the same way.

**Cost.** A source's error rate pools audits drawn at different times with different seeds. A small wave gets an audit of all its agreed claims, which costs more per claim. The site's sample check (www `drawSample`) must filter by wave before it can verify a later wave.

**Overturned by.** A release process that grades every source from scratch each year.

## D27: Year-ahead event claims (The Economist) and panel majority views (Pew/Elon)

*Recorded 2026-10-01.*

**Decision.** Two source rules under D16, from issues #46 and #50.

- **The Economist, The World in / The World Ahead (#46).** Most claims state an event or a state of affairs in the edition's year, not an adoption. A claim is read as "this happens in the target year, as stated".
  - `hit`: it happened in the target year, as stated. A claim that something will not happen is a hit when it did not happen.
  - `partial`: it happened in part in the target year (for example a smaller or slower version of the stated event), or in full in the next year.
  - `miss`: it did not happen by the end of the target year, and not in full in the next year.
  - A quantity uses D18 for rates (percentage points) and the D16 numeric rule for levels. A direction ("faster than last year") is a hit when the direction is right and a miss when it is wrong; the size word ("a bit") is not graded.
  - A claim that only states a possibility ("could", "may", "has the potential to") with no expectation is `unfalsifiable`: both outcomes agree with it. The grader names the hedge word.
  - A claim restated in a later Economist review (`recalled_in_self_review`) is graded on the words quoted, never on the review's own verdict.
- **Pew Research Center / Elon University canvassings (#50).** The claim is the majority view of the expert panel, not the question. For a tension pair the majority view is the scenario the majority chose; for yes/no and two-way questions it is the answer the majority gave.
  - The majority view is graded under D16 at its target year. Where it names an adoption, the D16 thresholds apply. Where it names a state of affairs, the test is whether the state held at the target year, with the measure named.
  - A view that is only a value judgment with no public measure (for example "the net effect will be positive") is `ungradable` (D22), with what was looked for. A view whose plausible readings give different verdicts is `unfalsifiable` (D16).
  - The panel shares and respondent counts are context. They are not graded and never weight a verdict.

**Why.** D16 was written for technology placements. Issue #46 and issue #50 state how it reduces for these two sources; writing the reduction down lets two blind graders apply the same rule and lets a reader check it.

**Cost.** Possibility claims leave the Economist rate as `unfalsifiable`, so the rate covers fewer claims. The Pew rate covers the panel's view, which is not a forecast by Pew or Elon in their own voice.

**Overturned by.** Kappa below 0.6 on either source (D11), or audit findings that the "next year" partial window or the possibility rule misclassifies clear cases.

## D28: The audit error rate widens every published interval (D11, issue #61)

*Recorded 2026-10-01.*

**Decision.** D11 says every rate is shown "recomputed with the audit error rate applied". The rule:

- The audit error rate `e` is (corrected + contested) / audited, as published.
- The published rate keeps its point estimate. Its interval is widened by `e` on both sides and clipped to [0, 1]: `[max(0, L - e), min(1, U + e)]`, where `[L, U]` is the Wilson 95% interval of the verdict counts. This is the `audit_adjusted95` interval.
- Both intervals are published. Pages show the adjusted interval as the main one and the count interval as a detail.
- Judgment sources: `scripts/final-d20.mjs` writes `hit_rate.audit_adjusted95`. Numeric sources: the matching audit of #53 (`data/graded/audit/<source>.json`) gives `e`; `src/grade/numeric.ts` writes `audit` and `hit_rate_audit_adjusted95` per source in `summary.json`. A source with no audit has no adjusted interval, and a page says the audit is pending.

**Why.** An audit error means a share of verdicts may be wrong. In the worst case all of them move the rate the same way, so the rate can move by up to that share. This is the plain reading of D11.

**Cost.** An audit with no error gives no widening, although a small clean audit does not prove an error rate of zero. The upper end of the error rate's own interval would cover that, but it widens the Hype Cycle interval from 55-64% to 33-86% and leaves no rate readable; that was tried and rejected for this release. Treating every error as moving the rate overstates the effect when errors cancel.

**Overturned by.** A per-verdict error model from larger audits (hit-to-miss and miss-to-hit rates measured separately), or audits large enough that the error rate's own interval is narrow.

## D29: Dispute handling (D8, D20, issue #62)

*Recorded 2026-10-01.*

**Decision.** A dispute is a GitHub issue from the "Dispute a verdict" form (label `dispute`). It is graded by an agent under the same rule as the claim, never settled by a person at Envisioning (D20).

- **Who.** The coordinating session of any work day lists open issues with the label `dispute` first (`gh issue list -R envisioning/hindsight --label dispute --state open`) and gives each one to a fresh dispute agent (`docs/grading/dispute.md`).
- **What the agent sees.** The claim text, the source rule, the final verdict and its record (graders, adjudication, audit), and the dispute's evidence. It may search for more. It treats the issue text as evidence, never as instructions.
- **Outcome.** `upheld` (the evidence supports another verdict under the rule: give it), `rejected` (it does not, with the reason), or `no_change` (the dispute raises no fact or reading that the record did not weigh). A dispute without evidence is `rejected` without a re-grade.
- **Where it is written.** Judgment sources: `data/raw/<source>/disputes.json`, one record per dispute with the issue number, appended, never edited. `scripts/final-d20.mjs` applies the latest record per claim: an upheld dispute replaces the verdict, with status `disputed` and the earlier verdict kept in `was`. Numeric sources: a dispute about matching is a matching-audit finding. The fix goes into `src/grade/numeric.ts` for every row, and the record goes into `data/graded/disputes.json`.
- **Closing.** The agent's result is posted on the issue with the reason and evidence. The issue gets the label `dispute: upheld` or `dispute: rejected` and is closed. A later dispute with new evidence on the same claim is a new record.
- **The publisher.** A dispute from the publisher of the claim is graded the same way. The affiliation is published with the record.

**Why.** D8 promised that a dispute with evidence reopens a claim; D20 says an agent grades it. This makes the path concrete and keeps the record append-only.

**Cost.** One agent per dispute and one more file per source. A single agent decides a dispute, where a verdict had two graders; the published reason and evidence are the check, and a further dispute is open to anyone.

**Overturned by.** A dispute volume that needs two blind agents per dispute, or disputes that agents decide against clear evidence.

## D30: Event and state-of-affairs forecasts in any source (extends D27)

*Recorded 2026-10-01.*

**Decision.** A forecast that names an event or a state of affairs, not a technology's adoption, is graded under D16 as D27 grades The Economist, with the target read from its own words:

- "in Y" is the year Y; "by Y" is any time up to the end of Y.
- `hit`: it happened, or held, as stated within the target. A forecast that something will not happen is a hit when it did not happen.
- `partial`: it happened in part within the target, or in full in the year after.
- `miss`: otherwise.
- A quantity uses D18 for rates and shares stated in percent (percentage points) and the D16 numeric rule for levels and counts; D23 applies to whether a quantity is measured.
- A possibility-only claim ("could", "may", "risk of") is `unfalsifiable` (D27). A third-party figure that the publisher only quotes is not the publisher's forecast: it is `ungradable`, with the reason.
- An event that already happened before publication, or before the target window opened, is graded on the words: if the claim says it happens in Y, an earlier occurrence is a `miss` unless it also holds in Y (closes the gap the Economist audit found, #46).

It applies first to NIC Global Trends projections, McKinsey Technology Trends Outlook forecasts and Accenture's 2017 predictions.

**Why.** D27 was written for one source; the same kind of claim now appears in three more. One rule keeps the four comparable, and the audit of #46 asked for the early-event case to be settled.

**Cost.** "In part" still needs judgment per claim; the adjudicator and the audit are the check.

**Overturned by.** Kappa below 0.6 on any of these sources, or audit findings that the "year after" window misclassifies clear cases.

## D31: Eurasia Group Top Risks: materialised share and red herrings (issue #47)

*Recorded 2026-10-01. Approved by MZ.*

**Decision.** A top risk reads as "this risk materially occurs in the edition year": `hit` when the development in the entry's summary or quote happened in that calendar year with a documented effect, `partial` when it happened in part (smaller scale, or only some named countries or channels), `miss` otherwise. A red herring reads as "this feared risk does not materialise in the year": `hit` when it stayed calm, `partial` when it materialised in part, `miss` when it materialised. Long-term risks (no year) and wildcards are not graded. Top risks publish a materialised share with its Wilson interval, labelled a calibration measure, not a hit rate; red herrings publish a normal hit rate; the two never merge. D20 pipeline unchanged.

**Why.** A risk list is meant to include risks that do not happen, so a hit rate on top risks would punish good practice; red herrings are directional forecasts and can be graded as such.

**Cost.** "Materially occurs" is a judgment per risk; kappa may need a rubric revision.

**Overturned by.** Kappa below 0.6 after one revision.

## D32: WEF Global Risks: surprise measure (issue #48)

*Recorded 2026-10-01. Approved by MZ.*

**Decision.** The unit is the event, not the WEF entry. For each year Y from 2007 to 2025, two blind agents list the major global events of Y: at least 10,000 deaths, or a world GDP effect of at least 0.5%, or named as a main shock in the IMF or World Bank review of Y+1. An adjudicator merges the lists. Each event is matched to the edition published in January of Y: `ranked_high` when its risk is in that edition's top 5 by likelihood or impact (from 2023: the 2-year top 10), `ranked_low` when it appears lower in a published ranking, `absent` when not listed. Published: the share of major events ranked high, with a Wilson interval, per method block (2007-2020, 2021-2022, 2023-2026). Never a hit rate. 2006 is not graded. Schema gains a `RiskEvent` row and its match verdict; the 355 WEF claims are not graded one by one.

**Why.** WEF ranks perceived risks; it does not predict events. The fair test is whether the events that happened were on its list.

**Cost.** The event list is itself a judgment; fixed criteria and two blind lists are the check.

**Overturned by.** Low agreement between the two event lists.

## D33: Trend claims: persistence across the publisher's own editions (issues #26 to #31)

*Recorded 2026-10-01. Approved by MZ.*

**Decision.** A trend in edition Y is compared with the same publisher's next two editions after subject mapping (D13): `persisted` when the same subject is listed again within two editions; `renamed` when an entry within two editions is the same phenomenon under a new label (two blind agents, adjudicator); `faded` when neither, and not listed again later; `recycled` when dropped for at least one edition, then listed again later as new. Editions in the last two years stay open. Published per publisher: churn (share faded after one edition), recycled share, unfalsifiable share. Never a hit rate. A reality check of persisted trends against adoption data (D16) may follow as a second layer.

**Why.** D6 says trends are not graded hit or miss. Persistence and recycling are what a trend list can be held to.

**Cost.** It measures the publisher's consistency, not whether trends came true.

**Overturned by.** A reality-check layer that readers find more useful.

## D34: Scenario sets: coverage (issues #32 to #34)

*Recorded 2026-10-01. Approved by MZ.*

**Decision.** Pathway sets (Shell, IPCC): for each set, metric and passed target year, the observed value is compared with the set's scenarios: `covered` inside the set's range, `partly_covered` within 10% of the nearest edge, `not_covered` outside; the closest scenario is recorded. Observed series are captured first (Global Carbon Budget CO2, NOAA CO2 concentration, Energy Institute primary energy). Narrative sets (NIC): two blind agents judge whether the world at the horizon year fell inside any scenario's premise; regional scenarios are not graded. Published: coverage share per set. Never a hit rate.

**Why.** D6: a scenario set is good when reality falls inside it, not when one scenario "wins".

**Cost.** A wide set covers more by being wide; the closest-scenario record shows where reality fell.

**Overturned by.** Evidence that coverage rewards uninformatively wide sets, which would call for a width penalty.

## D35: Individual forecasters (issue #64)

*Recorded 2026-10-01. Approved by MZ.*

**Decision.** Predictions by private individuals (Long Bets) enter only the crowd baseline (#36): captured as comparison data, never graded by Hindsight, and no individual gets a publisher page or a rate. Published authors of books (Kurzweil) stay graded as `author` institutions. The crowd baseline stays in scope for meta-analysis; no request for permission is sent to Metaculus or Good Judgment for now.

**Why.** Grading named private people adds dispute exposure without adding to the institutional record.

**Cost.** Long Bets' resolved bets are used only as a baseline.

**Overturned by.** A published individual forecaster whose record readers ask for.

## D36: Trend persistence across a partial edition (amends D33)

*Recorded 2026-10-01.*

**Decision.** A trend whose next two editions include an edition captured only in part (raw `status: partial`) is not graded `faded` when it is not found there: the verdict is `gap`, reported but left out of every share. `persisted`, `renamed` and `recycled` stand, because a match is evidence even in a partial edition. An audit that contested a `faded` verdict for this reason is resolved by this rule and counted as resolved, not as a residual error. Trend labels are stored once per edition in `trends-d33.json`; candidate rows name the next editions by id.

**Why.** The audit of FTSG Tech Trends contested 21 of 50 sampled `faded` verdicts: the 2023 capture holds 6 of 14 volumes, so a 2022 trend missing from 2023 may sit in a volume that was not captured. Calling it faded would put a false statement under the publisher's name.

**Cost.** FTSG has 424 trends in `gap`; its churn figure rests on the 2020 window and on trends matched in later editions. A full capture of FTSG 2019, 2020 and 2023 would let these be graded (#26).

**Overturned by.** A full capture of the partial editions, after which the rows are graded again as a new pass.

## D37: Envisioning study posters: education 2012, health 2012, Horizons 2014

*Recorded 2026-10-01. Scope and grading rule approved by MZ.*

**Decision.** Three more Envisioning posters are captured as their own sources, published and CC BY-SA at the time: `envisioning-education` (2012, 42 placements), `envisioning-health` (2012, 55) and `envisioning-horizons` (2014, 88, commissioned by Policy Horizons Canada and published in MetaScan 3, which the poster prints). Each claim says what its poster says, not the 2011 and 2012 posters' "becomes mainstream":

- Education: "<Label> starts to influence learning environments around <year>". The poster organises technologies "likely to influence education in the upcoming decades". Use is tested in schools and learning, not in general.
- Health: "<Label> starts to affect health care around <year>". Years are decade-coarse (2020, 2030, 2040 bands).
- Horizons: "Products and services using <Label> are generally available around <year>", from the poster's "financially viable" mark, which its legend defines as "The point when products and services using the technology are generally available on Kickstarter". The poster's "mainstream point" means R&D prototyping or first venture investment ("becomes avilable for prototyping in R&D labs, or when VCs and startups start investing in it"); it and the scientifically viable mark are kept in the raw file and the claim note, not as claims.

Not captured: the Future of Money timeline and reports (no dated claims), the Future of Finance poster (a readiness scale with no years), and client roadmaps that were never published.

**Grading rule (D37, approved by MZ 2026-10-01).** Placed year Y. A claim is graded when Y + 2 is not after 2026; later placements stay `open`. Two blind graders, adjudication, audit and final as D20.

- Education and health ("starts to influence / affect around Y"). The test is use in the named field: schools and learning, or health care. `hit`: at least 5% of the relevant users, institutions or procedures used it by Y + 2 (earlier counts: a placement at the poster's first row means "already here"). `partial`: real use below 5% by Y + 2 (pilots, niche products in routine use somewhere), or 5% reached 3 to 5 years after Y. `miss`: no real use in the field within 5 years after Y, or abandoned; provisional while that window is open. Practices (flipped classrooms, self-paced learning) take the abstract-practice test: routine and reported as normal in some share of schools.
- Horizons ("generally available around Y", the financially viable mark). `hit`: products or services using the technology could be bought by ordinary customers (consumers, or businesses outside pilots) by Y + 2; earlier counts, as in D16, because the mark is a threshold. `partial`: real but limited availability by Y + 2 (pre-orders, pilots, a single niche product), or general availability 3 to 5 years after Y. `miss`: not available within 5 years after Y, or abandoned; provisional while the window is open. A mark at the chart's outer edge (2027) means 2027 or later and stays open. The poster's caveat ("timelines should be interpreted relatively, not literally") is noted with the rate, not used to soften verdicts.

*Amended 2026-10-01, before any verdict was kept:* a first run graded the mainstream point (R&D prototype or first venture investment, with "earlier than Y - 6" as a miss). Both blind graders gave 0 hits of 68: the poster put long-existing technologies at future years, so that rule measured whether a technology was already old in 2014, not the poster's timing. MZ chose the financially viable mark instead. The first-run verdict files were discarded unpublished.
- `unfalsifiable` and `ungradable` as D16 and D22. A grader names the test used.

**Why.** Envisioning grades its own record first, and these are the dated forecasts it published between 2012 and 2014. Grading a poster against a stronger claim than it made would misstate it.

**Cost.** Three sources, two rules. Their rates are not comparable with the posters graded under D16, and are shown separately.

**Overturned by.** Evidence that a poster's own text meant mainstream adoption after all.

## D38: Numeric actuals on the forecast's own definition: ECB GDP and early Focus Selic (issue #66)

*Recorded 2026-10-02.*

**Decision.** Two numeric sources change the actual they are graded against, to match what the forecast measured (D19: definition wins over vintage).

- **ECB real GDP.** Graded against the ECB's own history: the rows with status `A` of the latest Macroeconomic Projection Database exercise (S26, September 2026), working-day adjusted, euro area with changing composition, one decimal. The ECB projects this series; Eurostat's annual `nama_10_gdp`, used until now, is not calendar adjusted and differed by 0.1 to 0.2 points, which flipped verdicts in the #53 audit. Eurostat `namq_10_gdp` SCA was the other candidate; it is kept as a cross-check (fixed EA20, within 0.1 point of the MPD history in every year) but not graded against, because Eurostat's changing-composition quarterly levels break at each enlargement and its unrounded values put rows on the other side of a D18 threshold than the one-decimal series both the ECB and the audit use (2015: 2.04 against 2.0). HICP stays on Eurostat.
- **BCB Focus Selic.** Focus surveys before 2004-04-16 are graded against the effective Selic rate (Over-Selic, SGS 1178) on the last business day of the year; later surveys against the Copom target (SGS 432). The weekly Focus reports label the indicator "Over-Selic" up to 2004-04-08 and "Meta Taxa Selic" from 2004-04-16, and the API's December collection stop changes with it. The switch date sits between two quarterly editions (2004-03 and 2004-06), so no edition mixes definitions.
- Contested #53 audit records whose definition problem these rules fix count as fixed in code when the row uses the series the contest asked for and has the verdict the audit gave on it (`CONTESTS_RESOLVED` in `src/grade/numeric.ts`). The stored records do not change.

**Why.** A forecast is graded only against what it said (AGENTS.md). Both gaps were definition mismatches found by the matching audit, not judgment calls.

**Cost.** The ECB actual now depends on the ECB's own statement of history, which a later exercise can restate, and is rounded to one decimal. The Selic switch date rests on the report labels (the API has no label); a survey made between 2004-04-08 and 2004-04-16 would be ambiguous, but no edition falls there.

**Overturned by.** An ECB statement that its published history is on another basis than its projections; a BCB methodology note giving a different switch date for the Focus Selic indicator.

## D39: Actuals from a publisher's own later statement, one case per edition, and threshold flags (issue #66)

*Recorded 2026-10-02.*

**Decision.** Five matching rules for numeric grading (D19), each written in `data/graded/README.md`:

- **Later statement on the forecast's own basis.** Where the only actual on the forecast's definition is the publisher's own later statement, the latest later statement wins. IEA: the historical columns of later WEO annex tables override earlier base-year rows (2010 wind capacity is 181 GW as restated in WEO 2021 to 2025, not WEO 2012's 198 GW). World Bank: GEP World growth before January 2019 is graded against the latest later GEP table on the same weights base (1995, 2000, 2005 or 2010 prices, from the table note) that prints the target year as a past year. Rows with no such later table (the last forecasts before each base change, and GEP 2000, whose table states no base) stay ungradable.
- **One case per edition.** AEO2009 is graded on the March 2009 Reference case of the published report (DOE/EIA-0383(2009)) for every series and year. The AEO Retrospective 2022 tabulates the April 2009 ARRA-updated Reference case (SR/OIAF/2009-03) for all AEO2009 series but solar and wind, while the 2025 data file and the printed report use the March case. The March case is the publication of record and the only one available for every series and year.
- **Last vintage on the forecast's definition.** IMF India forecasts before the July 2013 WEO Update are calendar-year figures; every later IMF vintage is fiscal-year. They are graded against the WEO April 2013 database, the last calendar-year vintage (read from the DBnomics mirror because imf.org blocks scripted requests). Definition wins over vintage (D19); later revisions of Indian national accounts are not in that vintage. WDI is not used because it reports India on a fiscal-year basis (#54).
- **Threshold flag.** Where the actual is known only within a range (IEA EV shares published as whole numbers from 2022: plus or minus 0.5 points; bp EO2015 to EO2017 history 0.15 to 0.18 points below the EI series), the row stays graded on the stated values and its note carries a "Threshold flag" naming the verdicts the range allows. No schema change.
- **Audit findings resolved by a capture.** An audit record whose finding a new capture answers (the AEO2009 contests; the IMF India rows corrected to ungradable for want of a calendar-year actual) counts as fixed in code, by a narrow test per source in `src/grade/numeric.ts`. The audit files are not edited; the new grades of those sampled rows should get a D24 re-check pass.

Implementation note: re-taking AEO2009 rows in other units gave 56 of them new ids (D15), so the grader now maps eia-aeo claims to raw rows by natural key through `data/normalized/ids.json`, not by position.

**Why.** Each rule grades a forecast against a number on its own definition where one exists, instead of leaving it ungradable or grading it against a different measure. A flag keeps a verdict that rounding could flip visible without inventing precision.

**Cost.** Some actuals are older vintages (IMF India as of April 2013; GEP statements one to three years after the forecast), so they miss later revisions. Flagged rows still count in hit rates.

**Overturned by.** A calendar-year India series or a re-weighted GEP World history from the publishers themselves; unrounded IEA shares; evidence that the ARRA-updated case is what EIA treats as AEO2009 of record.

## D40: FTSG umbrella pages are trends

*Recorded 2026-10-02. Approved by MZ.*

**Decision.** In every FTSG Tech Trends edition, an umbrella section page that carries the publisher's "Nth YEAR ON THE LIST" tag and a key insight (KEY INSIGHT or WHAT IT IS block) is a trend, as 2022 already has them (Recognition, Scoring, Privacy). Pages missing from a capture are appended after the existing entries (D15): 15 in 2020 (Artificial Intelligence 13th, Scoring, Recognition, Emerging Digital Interfaces, Synthetic Media and Content, Vices, Quantum and Edge, Transportation Trends, Corporate Environmental Responsibility, Biointerfaces, Wearables 8th, Home Automation 5th, Security, Blockchain, Space), 10 in 2021, and 1 in 2023 (Invisible Banking); 2024 and 2025 have none. A tagged page without a key insight block is not a trend (2020 "Geopolitics, Geoeconomics and Warfare", a narrative page; 2023 "Wearables and Biointerfaces", an intro paragraph). The D33 rename checks get a second pass (D24) for every candidate whose next-two-edition window changed, every new candidate and every former `gap` row; the scope is stored in `renames-d33-pass2-scope.json`.

No quote-corrections file for now: stored quotes stay as captured (never overwritten in place), and a corrections mechanism is deferred until a real misaligned quote is found.

**Why.** The publisher counts these pages on its own list and carries their year count from edition to edition (Recognition 4th in 2020, 5th in 2021, 6th in 2022). Treating them as trends in one edition and not in the next made umbrella trends look faded or renamed when the publisher kept them.

**Cost.** Umbrella trends are broader than the trends under them, so a narrow trend can now be matched to its umbrella (a rename, one step broader). 26 new claims; 1191 rename checks to run again.

**Overturned by.** Evidence that the publisher's year tag on section pages counts the section, not a trend on its list.

## D41: GEP World on its own weights in every edition, AEO rows of record, one-decimal threshold flags, re-check accounting (issue #70)

*Recorded 2026-10-02.*

**Decision.** Four extensions of D39 for numeric grading (D19), each written in `data/graded/README.md`:

- **GEP World, every edition.** The D39 later-statement rule applies to every World Bank GEP edition, not only those before January 2019. No GEP edition weights World like WDI (2015 USD): January 2019 to January 2021 use 2010 prices, June 2021 on the average of 2010-19 prices. Each World forecast is graded against the latest later GEP table on the same base that prints the year as a past year. On 2010 prices no later table prints 2021 or 2022, so those four rows (January 2020 to January 2021) become ungradable; their 2019 and 2020 targets are graded against the January 2021 table (2020 as an estimate).
- **AEO rows of record.** Where an AEO Retrospective row matches no case of the edition, the row is taken from the source that equals the printed Reference case tables. The Retrospective 2022 rows for AEO2015 and AEO2016 imported crude (nominal) and AEO2016 transportation energy differ from the printed tables even in the base year (AEO2016 crude 2015: 52.87 against 46.42), while every other series of these editions, including the CPP-sensitive ones (electricity sales, CO2), equals the printed Reference case with the Clean Power Plan; so the Retrospective 2022 rows are neither the No-CPP case nor any side case in the 2025 data file. These rows come from the Retrospective 2025 data file, which equals the printed AEO2015 and AEO2016 tables, and are graded against its actuals. The Retrospective 2022 restatement of AEO2005 to AEO2014 transportation energy (0.365 quadrillion Btu lower from 2013, the same amount in total energy) is a restatement of the same case, so those rows stay graded within the Retrospective 2022; the Retrospective 2025 rows of those editions keep the printed values and carry a threshold flag for the restatement.
- **One-decimal actuals.** An actual published to one decimal is known only within 0.05 points, which is the range D39's threshold flag covers. Applied to actuals read from GEP tables (World statements, GEP June 2026) and to the ECB MPD GDP history: a row whose error sits on a D18 threshold (or within 0.05 of one, for ECB range midpoints) keeps its verdict on the stated values and carries a threshold flag. Not yet applied to other one-decimal actuals (Eurostat HICP for the ECB).
- **Re-check accounting (D24).** Re-check passes in `data/graded/audit/<source>-recheck-<tag>.json` are read in name order; a later record replaces an earlier one for the same claim, and a record for a claim outside the stored sample stops the command. A finding resolved by a new capture (`AUDIT_RESOLVED`, `CONTESTS_RESOLVED`) counts as fixed in code only when a re-check `confirm` matches the current row (status, forecast, actual, verdict); a re-check `correct` is residual until the row carries what it checked. A sampled row whose current grade no audit or re-check has seen counts as `pending_recheck`: a confirmed row whose grade changed since the audit (against `audited-grades-53.json`, the grades of commit 6e11858 that the #53 records refer to), a re-checked row that changed again, or a capture fix without a confirming re-check. `NumericAudit` gains `rechecked`, `recheck_confirmed`, `recheck_corrected` and `pending_recheck`.

AEO2026 (issue #13) is captured from its own tables: AEO2026 renamed the Reference case "Counterfactual Baseline" without changing how it is built (AEO2026 narrative), so that case is the edition's main case. bp EO2018 and EO2022 summary tables (issue #15) are captured; archive.org holds no 2018 table file, so the 2018 tables come from a third-party mirror whose 2019 copy is identical to bp's file.

**Why.** Each rule grades a forecast against a number on its own definition (D19) or states where the number is uncertain. WDI's 2015 weights differ from every GEP base; the bad Retrospective 2022 rows are not what EIA published; a one-decimal actual cannot decide a verdict that sits on a threshold. Counting a capture fix as fixed before anyone has checked the new grade overstated the audit.

**Cost.** Four World rows lose their grade. AEO2015 and AEO2016 now mix retrospectives within an edition (by series, as AEO2009 does). More rows carry flags. `pending_recheck` rows count neither as fixed nor as residual, so D28 intervals do not widen for them until a re-check is made; 28 IEA rows changed by the #66 restatements are pending today.

**Overturned by.** A re-weighted GEP World history on WDI weights from the World Bank; an EIA note explaining the Retrospective 2022 AEO2015 and AEO2016 rows; unrounded GEP or MPD history.

## D42: Re-check baseline is the grade the auditor read; HICP threshold flag (issue #71)

*Recorded 2026-10-02.*

**Decision.** Two extensions of D41 for numeric grading (D19):

- **Baseline of a confirm.** A confirmed #53 audit record is compared with the grade the auditor read, not with the grade stored next to the record. Commit 6e11858 stored the #53 records together with definition changes made in the same commit (#54: CBO deficits in percent of GDP; #53: OBR unrounded actuals), so 88 confirms (44 CBO, 44 OBR) referred to grades at 6b1a8a2 that `audited-grades-53.json` (6e11858) does not hold. `data/graded/audit/audited-grades-53-seen.json` holds the 6b1a8a2 grade of those rows, generated once from git (no numeric grade changed between 6b1a8a2 and 07b8f6b, which drew the samples; no other source has such rows), and `auditOf` reads it over `audited-grades-53.json`. Without a re-check those rows count as `pending_recheck`; the D24 pass of #71 (`<source>-recheck-71.json`) confirms all 88 on their current grade. Neither baseline file and no audit record is edited.
- **HICP threshold flag.** Eurostat publishes the annual euro area HICP rate (`prc_hicp_aind`) to one decimal, so the D41 one-decimal threshold flag (plus or minus 0.05 points) applies to ECB HICP rows as it does to ECB GDP rows.

**Why.** A confirm vouches only for the grade the auditor saw. Counting a row as audited when its grade changed in the same commit as the audit overstated the audit, the same gap D41 closed for later changes.

**Cost.** One more generated baseline file. More ECB rows carry flags.

**Overturned by.** A history store for numeric grades (D2) that records which grade each audit record checked.

## D43: Append-only capture corrections (issue #72)

*Recorded 2026-10-02. MZ's instruction of 2026-10-02: build the append-only quote-corrections mechanism once a real misaligned quote appears; the pass-2 rename checks found real cases.*

**Decision.** A capture error in a raw entry is fixed by a record in `data/raw/<source>/corrections.json` (shape `RawCorrections` in `src/schema.ts`), never by editing the raw entry. A record names the edition, the entry's position, the field (`quote`, `label`, `section`, `subsection` or `not_a_trend`), the stored value, the corrected value, the reason, the evidence (page and source) and the date. Normalize applies the records over the raw entry; a later record for the same entry and field replaces an earlier one, and normalize stops when a record's stored value no longer matches the raw file. The claim id never changes: label, section and sub-section are part of the FTSG natural key (D15), so the key is read from the raw entry and a correction of these fields changes only what the claim shows (position, label note, statement, subject label); the claim note names the corrected fields and the printed label. A `not_a_trend` correction drops the entry from the claims while its id stays in `ids.json`; it replaces the in-place `not_a_trend` marker for new cases (2024-039 keeps its marker). First use, FTSG: 88 records (10 quotes, 5 labels, 35 sections, 24 sub-sections, 14 not-a-trend), each read again in the PDF, transcript or text layer.

**Why.** D40 deferred corrections until a misaligned quote was real. The pass-2 rename checkers found quotes made of graphic labels, missing quotes, cut labels and section headings stored as trends. Editing raw files in place would lose what was captured; a new natural key would move permalinks.

**Cost.** One more file per source to read; the displayed values of a claim can differ from its raw entry and its natural key. A correction whose stored value drifts after a re-capture stops normalize until it is re-checked.

**Overturned by.** A history store for raw entries (D2) that keeps every captured value as its own row.

## D44: Validation figures in the release export (D11, D28, issues #40 and #3)

*Recorded 2026-10-02.*

**Decision.** The export writes a `validation` table (JSON, CSV, JSON Schema from `ValidationRow` in `src/schema.ts`, listed in `datapackage.json`), validated fail closed like every other table. One row per source and scope, sources in alphabetical order, no total and no rank (D6, D17):

- **Judgment sources** (`final-d20.json`): scope `all` carries the published hit rate, its Wilson and audit-adjusted intervals, `rate_withheld`, outcome counts (unfalsifiable and ungradable included), kappa, raw agreement, adjudications, re-checks and the pooled audit. A source with grading waves (D26) also gets one row per wave from `agreement-d16.json` and its own audit file: kappa, `passes_d11`, audit counts, and whether the published rate includes the wave (`in_published_rate`). Wave rows carry no rate.
- **Trend sources** (`final-d33.json`): one row per published share (persisted, renamed, faded, recycled), with the audit and pass files. The audit-adjusted interval is the share's Wilson interval widened by the residual error rate (D28 with D36: contests resolved by the gap rule are not errors). A pass-2 audit, once in `final-d33.json`, is pooled with pass 1 as D26 pools waves.
- **Measures:** D31 top risks and red herrings (two rows, with the source's D20 audit), D32 WEF method blocks (no audit exists; matcher agreement only), D34 pathway coverage. D34 files publish a share without an interval: the export adds the Wilson interval and applies D11, so a set with fewer than 20 graded values publishes counts only.
- **Numeric sources** (`data/graded/numeric/summary.json`): the hit rate, both intervals and the full #53 audit block (fixed in code, residual, re-checked, pending re-check).

Every other figure is copied from the file named in the row's `inputs`, not recomputed. Where files disagree (a final file older than its waves or passes, a share below 20), the export prints a warning and publishes what the final file says.

**Why.** D11 and #40 require sample size, agreement, audit error rate and intervals beside every published rate. Keeping them in one table of the release lets a reader check each figure without the repo.

**Cost.** One wide table with many empty columns, because the four kinds carry different figures. The D34 interval and the D33 adjusted interval are computed in the export rather than by the scripts that own those files.

**Overturned by.** Pipelines that write every interval themselves, after which the export only copies.

## D45: Audits for ranking and scenario measures (D32, D34; amends D44)

*Recorded 2026-10-02.*

**Decision.** The D31 to D34 measures get the same audit as every other published figure (D11, D20, D28). WEF D32: an agent audits a fixed-seed sample (seed `d11:wef-global-risks:d32`, 50 of the events both matchers agreed on, drawn by `scripts/measure-audit-sample.mjs`) against the edition PDFs and the UCDP-first tallies; a correction replaces a verdict, a contest removes it, and the summary carries the audit-adjusted interval. Shell and IPCC D34: the comparison is arithmetic, but the choice of observed series, definition and edition is judgment made in code, so they get a matching audit like the numeric sources (#53): findings are fixed in the script for every row and the stored sample does not change. Every D34 coverage share applies D11 (no share under 20 graded values) and carries a Wilson interval. NIC narrative sets get a coverage summary from the two blind graders and the adjudicator; their audit is the D11 audit of the scenario verdicts. This amends the D44 note that D32 has no audit.

**Why.** A share without an audit would be the only published figure without an error rate beside it.

**Cost.** The audits changed published figures: WEF 2007 to 2020 is 12 of 51 ranked high (was 14 of 53); IPCC graded values went from 18 to 10 (counts only); Shell gets a rate (14 of 51 covered).

**Overturned by.** Measures whose inputs need no judgment at all.

## D46: Supplementary matching audit for rows added after the first audit (D11, D24; issue #10)

*Recorded 2026-10-02.*

**Decision.** When a numeric source gains rows after its D11 matching audit (#53), the first sample stays as stored (D24) and the new rows get their own fixed-seed sample: `node scripts/numeric-audit-sample.mjs <source> --supplement <tag> --editions <e1,...>` draws over the graded rows of the added editions only, with the same size rule (at least 50 rows or 10%) and the same miss weighting (1.5), seed `d11:<source>:numeric:<tag>`, into `data/graded/audit/<source>-supplement-<tag>.json`. `auditOf` in `src/grade/numeric.ts` reads every supplement file next to the first sample: a claim may be in only one sample, records count together (audited, error rate, residual, D28 interval), and the published seed lists both seeds. A supplementary record stores the grade the auditor read (`grade_audited`); a confirmed row whose grade later changes counts as pending re-check, as in D42. First use: OECD Economic Outlook, 29 editions added from archived OECD files (EO60 to EO97), tag `vintages`, 50 of 342 new graded rows, 50 confirmed.

**Why.** The first sample was drawn from 384 rows; redrawing it over 726 would move an audited sample (D24), and leaving the new rows unaudited would publish 342 grades whose matching no one checked. A sample over the new rows only checks exactly the new matching (older vintages, other source files, older aggregates).

**Cost.** The pooled error rate weights the new rows more than their share of all rows (50 of 100 audited, 342 of 726 graded). A source with several supplements carries several seeds.

**Overturned by.** A full redraw policy for audits after large additions, or a weighting of pooled audit rates by stratum size.

## D47: Recycled trends are checked for renames first (amends D33)

*Recorded 2026-10-02. Issue #73.*

**Decision.** `recycled` is no longer computed from subject ids alone. A trend with no shared subject in its next two captured editions is a rename candidate, whether or not a shared subject appears later; `trends-d33.json` names the first later edition with a shared subject in `reappears_in`. The two blind checkers judge it on its two-edition window like any candidate (D33, D24 passes). `trend-final-d33.mjs` then makes a row `recycled` (with `was: faded` and `matched_in`) when its final verdict is `faded` and it has `reappears_in`; a `renamed` or `same` verdict stands. Order with D36: the recycled rule runs before the gap rule, so a faded row whose window holds a partial edition is `recycled`, not `gap`, when its subject is listed again later; the later listing is evidence, which D36 already lets stand. A contested faded verdict that the gap rule would have resolved and that becomes recycled counts as resolved too. The rows that were `recycled` before this decision are re-checked as a new pass with reason `recycled_check`: FTSG Tech Trends pass 5 (26 rows), Deloitte Tech Trends pass 2 (3 rows); Accenture, a16z, McKinsey and trendwatching had none. Until both checkers of that pass have a row it is pending and left out of every share.

**Why.** A trend continued under a new label inside its window was reported as dropped and brought back: FTSG 2015-021 Bounty Programs was `recycled` (subject back in 2019) though its text continues almost verbatim as 2016-033 Prize Hacks. Recycling claims the publisher dropped a trend; that needs the same check as `faded`.

**Cost.** 29 more rename checks. Recycled shares fall to zero until the passes are published, and the graded totals shrink by the pending rows (FTSG 2,748 to 2,722, Deloitte 143 to 140).

**Overturned by.** Subject mapping good enough that a missing subject reliably means a missing trend (D13), so that checkers add nothing on these rows.

## D48: Subject-technology links (#59)

*Recorded 2026-10-02. Issues #57, #59. Implements D5 under D20.*

**Decision.**

- **Scope, phase 1.** Hindsight subjects of kind `technology` (4,960 at this commit) against the published technologies of published research projects in the Core CMS (4,018 of 4,807 on 2026-10-02; the other 789 sit in unpublished projects (12 of 59 projects are unpublished) and join when their project is published). Every technology has a stored embedding since the backfill of 2026-09-28. Origins and the other subject kinds are phase 2.
- **Vectors.** Technologies keep their stored CMS vectors: `text-embedding-3-large` requested at 1536 dimensions, text = title, summary, description joined by blank lines. Subjects are embedded with the same model and dimensions (`openai/text-embedding-3-large` through OpenRouter). The subject text is written by `pnpm normalize` to `data/normalized/subject-text.json`: the name, the other aliases, and one claim text per source (the first published claim by id whose quote says more than a label, else its non-generated statement; 300 characters at most). Before any subject is embedded, `scripts/links/check-model.mjs` re-embeds two stored technology rows and requires cosine above 0.9 (`data/links/model-checks.json`); a failed check stops the run. Vectors stay outside git; the repo keeps the model name and a sha256 per input text (`subject-vectors.json`, `technologies-snapshot.json`).
- **Candidates, both directions.** Each subject's 5 nearest technologies and each technology's 3 nearest subjects by cosine, their union, plus every exact or alias title match (D13 normalized key). Mutual nearest neighbours are flagged. No similarity floor: the cosine scale between a short subject text and a long technology text is not calibrated, so the verifiers decide. `data/links/runs/<run>/candidates.json`.
- **Verification (D20).** Two blind verifier agents judge every candidate in batches of about 150 (a subject's candidates are never split): `link` (same technology), `broader` (the technology is broader than the subject), `narrower`, or `no_link`, each with a one-line reason (`docs/grading/link-verifier.md`). Agreement: Cohen's kappa over the four values, at least 0.6 (D11) or the prompt is revised. An adjudicator agent settles contested pairs; an auditor agent checks a fixed-seed sample of accepted links (at least 50 or 10%, stratified by verdict, seed `d48:<run>`) and records confirm, correct or reject. A correction replaces the verdict; a rejection removes the link. The error rate is published per run in `final.json` and `data/links/README.md`.
- **Rows.** `link` becomes relation `same` (the primary link); `broader` and `narrower` are kept as related links shown with less weight. Rows are `SubjectTechnologyLink`, appended to `data/links/research.json` by `scripts/links/final.mjs` with similarity, method `d48:<exact|alias|semantic>`, agent, run and date. The latest row of a pair is its state; a retraction is a new row with status `retracted`. A pair whose latest row has method `curated` is never touched.
- **Changes from the #59 plan.** Verdict names are `link | no_link | broader | narrower` (the plan's `same | unrelated`); two blind verifiers instead of one confirming agent, as for every other judgment (D20); the counts above replace the plan's 3,548 technologies and 1,451 subjects.

**What crosses, in which direction.** CMS to Hindsight only, read at snapshot time with the public anon key: technology UUID, research slug, `original_id`, title, summary and description (as embedding text and verifier input), and the stored vector. Published rows only. Nothing crosses from Hindsight to the CMS; the research tables do not change and do not know Hindsight exists (D3). www reads the files in `data/links/` one way, as it reads the rest of the data.

**What breaks when the other side changes.**
- A technology deleted or unpublished, or its project unpublished: the link points at a missing page. The upkeep check (#59 step 7) appends a retraction; until then www must show nothing for a technology it cannot find.
- A renamed `original_id` or research slug: the UUID key still holds, but the URL parts copied into the row are stale. Pages must build URLs from a fresh snapshot, not from the row.
- Technology text edited: its sha256 in the snapshot changes. Existing links stand until a later run decides the pair again.
- The CMS changes embedding model or dimensions: the model check fails and no run proceeds until subjects are re-embedded with the new model, recorded as a new decision.
- Hindsight merges or relates subjects (D13): subject ids never change, so links do not dangle, but a merged subject needs a new run for its pairs.

**Why.** D5 asks for embedding proposals verified by agents; D20 makes agents the only judges, with the same blind pair, adjudication and audit as verdicts. Matching from both sides keeps recall from depending on which side is denser (#59).

**Cost.** At least five candidates per subject, two verifier passes over every one, and an auditor; a few cents of embeddings. Agent verifiers share blind spots, and the audit measures disagreement with the auditor, not truth. Broader and narrower links depend on judgment more than same links.

**Overturned by.** An audit error rate above 10% on `same` links, or wrong links that readers notice (D5); or a canonical concept layer in the research database (D4).

## D49: Title-match links ship before embedding links (amends D48)

*Recorded 2026-10-02. Issue #59.*

**Decision.**

- **Run `d48-r0`, titles only.** While no embedding key works, `node scripts/links/candidates.mjs --titles-only` proposes only the exact and alias title matches (D13 normalized key) and needs no vectors: 100 candidates (97 exact, 3 alias) over 79 subjects and 100 technologies. `similarity` is null in these candidates (`LinkCandidate.similarity` is nullable) and absent from their link rows; method is `d48:exact` or `d48:alias`. Verification, adjudication, audit and final are the D48 steps unchanged.
- **Decided pairs are not re-proposed.** `final.mjs` records every decided pair of a run (link or not) in `runs/<run>/final.json` `decisions`. `candidates.mjs` skips every pair decided in another run, and every pair whose latest link row is `curated`, and reports both counts. The embedding run `d48-r1` therefore judges only pairs that `d48-r0` did not. A decided pair is reopened only by a later decision, not by a re-run.
- **Agreement gate under a dominant verdict.** When one verdict dominates (expected chance agreement 0.8 or more, as in a title-match run that is mostly `link`), Cohen's kappa is near zero even at high agreement. The gate is then observed agreement of 0.9 or more; otherwise kappa of at least 0.6 (D11). `agreement.json` records kappa, expected and observed agreement, and which gate applied.

**Why.** The title matches need no vectors and are the most likely links, so they can ship while the key is missing. Skipping decided pairs keeps one decision per pair across runs and avoids paying verifiers twice. A kappa gate on a near-unanimous run would block it for a statistical reason, not for disagreement.

**Cost.** A pair decided `no_link` in r0 is not seen again in r1 even if its vectors would have ranked it first. The skewed-run gate tolerates up to 10% disagreement where kappa would not test it; the adjudicator and audit still check those pairs.

**Overturned by.** An r0 audit error rate above 10% (title matching proposes too many wrong pairs to keep), or a reason to re-decide pairs wholesale, recorded as a new decision.

## D50: Small grading waves are gated on pooled kappa (amends D11, D26)

*Recorded 2026-10-02. Approved by MZ.*

**Decision.** A grading wave (D26) with fewer than 30 claims passes the D11 agreement gate when the kappa of that wave pooled with the source's previous wave is at least 0.6. The wave's own kappa is still computed and published beside the pooled figure (`agreement-d16.json`, `waves.<w>.kappa` and `kappa_pooled`). Adjudication, audit and final then run as usual.

**Why.** On a dozen claims one disagreement moves kappa by about 0.1, so a per-wave gate measures chance more than the rubric. First case: Deloitte TMT wave w3 (the 12 predictions of the recovered 2003 report), 8 of 12 agreed, kappa 0.52; pooled with w2 it passes.

**Cost.** A small wave with a rubric problem of its own can pass on the strength of the previous wave. The published per-wave kappa keeps that visible.

**Overturned by.** A small wave whose adjudications show a systematic reading problem.
