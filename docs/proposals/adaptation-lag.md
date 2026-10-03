# Proposal: adaptation lag (#86, objective 3)

*Proposal for MZ, 2026-10-03. Not a decision: no D number, nothing published. When approved it becomes the next D number, and the figures in `data/measures/adaptation-lag/` can go to the site and, with the export change in section 6, to the release.*

The pilot spec (2026-09-27) names adaptation lag as the metric: the time from the first evidence that contradicts a publisher's claim to the publisher's revision of that claim. A first deterministic build is in `src/measure/adaptation-lag.ts` (`pnpm measure:adaptation-lag`), output and figures in `data/measures/adaptation-lag/README.md`. It makes no new judgment: numeric paths come from the D19 grades, Hype Cycle readings from the D21 timelines and `revisions.json`.

## Proposed decision text

**Decision.** Adaptation lag is measured per claim type, never as one number across types, and never as a ranking (D6, D17). Each figure states its trigger, what counts as a revision and how many paths are right-censored. D11 applies: no share or median below 20 rows; shares carry a Wilson 95% interval and the D28 interval widened by the source's audit error rate.

### 1. Numeric forecasts (the 12 D19 sources)

- **Path.** One publisher's graded forecasts of one series (subject, family, statistic, unit, rule) for one target period, one vintage per edition, oldest first. Multi-year averages are left out.
- **Band.** A vintage is inside when |error| is within the hit band of its rule: 0.5 points (D18) or 10% of the actual (D16). The actual is the D19 actual (latest vintage, hindsight).
- **Convergence.** Per path: the error at each vintage by months before the end of the target period, the first vintage inside the band, and the vintage from which every later vintage stays inside (`settled`).
- **Contradicting evidence (shocks).** A shock has a fixed start month, the month the contradicting evidence became public: global financial crisis 2008-09 (Lehman, target years 2008 and 2009, all families); COVID-19 2020-03 (WHO pandemic call, target year 2020, all families); inflation surge 2021-05 (US CPI for April 2021 published 12 May, target years 2021 and 2022, inflation families only). The trigger is the first edition published in a later month. The first quarterly or monthly data release would be a better trigger, but no release dates are in the data.
- **Revision.** A vintage after the start month that is inside the band. Lag = editions after the start month up to and including that vintage, and months from the start month to its publication. Months are comparable across sources; editions are not.
- **Not contradicted.** A path whose last forecast before the shock was already inside the band.
- **Never revised.** A path with no vintage inside the band before the publisher stops forecasting the period is right-censored, split into `short` (still on the side of the old forecast) and `overshot` (moved past the actual). Censored paths have no lag; they are counted beside the lags, never given one.

### 2. Gartner Hype Cycle (D21 subjects)

- **Evidence.** The D21 adoption timeline of the subject: the settled timeline where an adjudicator settled one (latest D24 pass), otherwise both blind builders' timelines read separately. A subject whose two builders disagree on its class (mainstream, failed, stalled) is not counted; one whose builders agree on the class but whose years put it in different buckets is shown as builder-dependent and not counted.
- **Failed or stalled technologies.** Contradiction year = the first graded placement's placed year (D21: edition plus 2, 5 or 10) plus 2, when it can no longer be a D16 hit; or the abandonment year when earlier. Revision = the first later edition that delays the band, drops the subject or marks it obsolete before plateau. Advances and renames are recorded but are not a revision toward the evidence. Lag = revision edition minus contradiction year (negative: Gartner moved first). Never revised: still listed in the latest edition, right-censored.
- **Technologies that became mainstream.** Arrival call = the first edition with a band under 2 years or the plateau phase; on time within 2 years either side of the mainstream year (the D16 window). Also reported: exit from the chart relative to the mainstream year, and late listings (editions after the mainstream year still placing it 2 or more years from the plateau).

### 3. Rankings and trend lists

Not built in this pass. Proposed for a second pass: WEF (D32) and Eurasia (D31) rank changes in the edition after a matched event, using the D32 event list as the trigger (needs the D32 matches per event, which exist, and a rule for "rose": entered the top 5 or moved up at least 3 places); trend lists (D33) already have persistence, and the lag of a faded trend is its churn, so no new measure is proposed.

**Why.** Each claim type has a natural trigger and a natural revision; one definition across types would mix units (months of vintages, years of chart editions) and invite a single score, which D6 rules out.

**Cost.** Fixed start months are coarse, and one start month per shock ignores regional timing. The band uses the latest actual, so a path can enter the band by luck or leave it after a data revision. A Hype Cycle drop cannot say why Gartner dropped an entry.

**Overturned by.** Captured release dates for actuals (a data-release trigger replaces the start months); evidence that the D21 timelines misplace years for many subjects (D21's own condition).

## 4. What the first build shows (figures in the README; nothing here is published)

- **Numeric convergence.** IMF, OECD and World Bank real GDP growth paths settle inside the band in 55%, 59% and 50% of paths with two or more vintages (Wilson intervals about ±5 to 8 points), a median 7 to 11 months before the end of the target year. Inflation paths of the ECB, the Fed and BCB Focus settle in 95% or more. EIA oil and gas price paths settle in 24 to 28%.
- **Shocks.** Counts only: no source has 20 contradicted paths in one shock. GFC: CBO, BCB Focus and most Fed paths for 2009 reached the band within 6 months of the start month; IMF, OECD and World Bank 2008 paths are mostly censored `short` (2008 ended three months after the start, and the actuals were revised since). COVID-19: 30 of 31 censored paths are `overshot`: forecasters cut 2020 further than it fell (OECD 9 of 9, World Bank 6 of 7, IMF 8 of 11), so the lag after COVID is not slowness but overshooting. Inflation 2021-22: BCB, ECB, Fed and OBR reached the band for both years (2022 after more than 12 months); CBO's two inflation paths are censored `short`.
- **Hype Cycle, failed or stalled (51 counted).** 47 left the chart by a drop and 4 by a delay, a median 6 years before the contradiction year. That looks like fast adaptation and is not: failed, stalled and mainstream technologies all stay on the chart a median of 2 editions. The drop is the chart's churn. **This share should not be published as an adaptation figure.**
- **Hype Cycle, mainstream (135 counted).** Gartner called arrival (band under 2 years or plateau) for 32; 16 within 2 years of the mainstream year (12% of 135, [7%, 18%], audit-adjusted [0%, 28%]), 13 early, 3 late. 103 left the chart without an arrival call. Exit from the chart: 64 within 2 years of the mainstream year, 60 more than 2 years before it, 11 more than 2 years after.

## 5. Questions for MZ

1. Are the three shocks, their start months and their target years right? (Alternatives: GFC from 2007-08, the BNP Paribas fund freeze; inflation per region.)
2. Is "inside the D18/D16 hit band" the right revision test, or should a revision be any move of at least half the standing error toward the actual (the `error_closed_at_trigger` field is already computed)?
3. Should `overshot` censored paths count as adapted (direction right, size wrong) or stay censored?
4. Hype Cycle: publish only the mainstream arrival and exit figures, and show the failed-or-stalled lag as a finding about churn, not a rate?
5. Is a second pass for rankings (section 3) wanted now, or after #87 and #88?

## 6. Validation rows (D44): proposed, not built

`src/export/validation.ts` writes `measure` rows only for D31, D32 and D34, from a fixed `ValidationMeasure` list. Adaptation lag fits the `measure` kind with new measure names, after approval:

- per numeric source: `settled_in_band_share` (scope: family), with the source's #53 matching audit (`residual_error_rate`) as the audit;
- Hype Cycle: `arrival_on_time_share` (scope `mainstream`), with the D21 audit (`final-d20.json`) as the audit.

Shock lags stay counts only until a shock has 20 contradicted paths per source. The export would copy from `data/measures/adaptation-lag/summary.json`, not recompute (D44).

## 7. What a grading wave would need (not done: judgment)

- **Why Gartner dropped an entry** (verdict, moved to another Hype Cycle, renamed beyond the subject map, lost interest). Two blind agents per drop of a counted subject, reading Gartner's own text where it exists (the 2003 to 2019 text evidence file), then an adjudicator and a D11 audit. Only then can a drop count as a revision.
- **Unsettled subjects.** 7 subjects where the builders disagree on the class (biometric-payments, commercial-grids, external-mpp-grids, mesh-networking, speech-recognition-for-telephony-and-call-center, synthetic-characters, tablet-pc) and 4 builder-dependent ones (ajax, business-rule-engines, e-cash, hosted-virtual-desktops): a D20 adjudicator settling their timelines, as for the 53 already settled.
- **Hype Cycle subjects without a timeline** (about 258 of 457, those with no graded band): D21 builders would need to write timelines before any of them can enter this measure.
- **Release-date trigger** for numeric shocks: captured first-release dates (GDP quarterly, CPI monthly) per economy. Capture work, not grading.
