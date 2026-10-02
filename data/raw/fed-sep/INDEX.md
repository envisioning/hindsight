# Federal Reserve Summary of Economic Projections (SEP)

Publisher: Federal Open Market Committee (FOMC), Board of Governors of the Federal Reserve System. Series: Summary of Economic Projections, quarterly.
Facts only: variable, statistic, target year, value, source. Nothing here is graded and no errors are computed.

## Scope

- Variables (SEP definitions, all in percent):
  - real GDP growth: Q4 over previous Q4.
  - unemployment rate: average civilian unemployment rate in Q4.
  - PCE inflation: PCE price index, Q4 over previous Q4.
  - core PCE inflation: PCE price index excluding food and energy, Q4 over previous Q4. No longer-run projection exists.
  - federal funds rate: appropriate target level, or midpoint of the target range, at the end of the year. In the SEP from January 2012.
- Horizons: each projection year (`current_year`, `next_year`, `year_plus_2`, `year_plus_3`) and `longer_run` (`target_year: null`). Longer-run projections start with the January 2009 SEP (released 2009-02-18).
- Edition id = FOMC meeting month (`YYYY-MM`). `published` = SEP release date. Before April 2011 the SEP came out with the minutes, about three weeks after the meeting, so `published` is later than the meeting (for example edition 2007-10, meeting 2007-10-30/31, published 2007-11-20).
- 76 editions, 2007-10 to 2026-09, 2,094 entries. One edition missing (2020-03).

## Verify-first answers (issue #16)

- **When did the SEP begin?** The FOMC announced on 2007-11-14 that it would publish projections quarterly with a longer horizon. The first SEP appeared on 2007-11-20 as an addendum to the minutes of the 2007-10-30/31 meeting. Source: Federal Reserve, "Timeline: Summary of Economic Projections", https://www.federalreserve.gov/monetarypolicy/timeline-summary-of-economic-projections.htm .
- **Are medians published per meeting?** Only since the September 2015 SEP (2015-09-17). From 2007-10 to 2015-06 the SEP published the central tendency (range after removing the three highest and three lowest projections) and the full range, not the median. The September 2015 SEP also printed the June 2015 medians as comparison rows. The federal funds rate "dot plot" (count of participants at each rate) was published from January 2012, so a median can be computed from it for 2012-01 to 2015-03.
- **Individual projections.** The Fed releases each SEP's anonymised individual projections ("SEP: Compilation and Summary of Individual Economic Projections") with a five-year lag. These give exact medians for 2007-10 to 2015-03, but they were not public at the time of the forecast.

## Statistics in the edition files (`statistic` field)

| statistic | editions | what it is | confidence |
|---|---|---|---|
| `median` | 2015-06 to 2026-09 | Median published by the FOMC. For 2015-06 it comes from the comparison rows of the September 2015 SEP. | high |
| `central tendency midpoint` | 2007-10 to 2015-06 | `value_low` and `value_high` are the published central tendency. `value` is the midpoint as computed by FRED (series `...CTM`). This is the statistic that was public at the time. | high |
| `median (computed from dot plot)` | 2012-01 to 2015-03, federal funds rate only | Median computed by Hindsight from the published dot plot. Where the participant count is even, the average of the two middle values (the SEP's own rule). The dot plot rounds to the nearest 1/4 percent, so a "0 to 1/4 percent" range shows as 0.25. | medium |
| `median (computed from individual projections)` | 2007-10 to 2015-03 | Median computed by Hindsight from Table 2 of the SEP compilation (16 to 19 participants). Not public at the time. For the federal funds rate the compilation uses the exact midpoint 0.13 for the 0 to 1/4 percent range, while the dot plot shows 0.25; both are kept. | medium |

Cross-checks run by `scripts/fed-sep/build.py`: every compilation median lies inside the published central tendency; the dot-plot longer-run federal funds medians match FRED `FEDTARMDLR` (which FRED rounds to 1 decimal); the 2015-06 compilation medians match the published June 2015 medians.

## Sources

1. **Medians 2015-12 to 2026-09 and central tendencies 2007-10 to 2015-06:** ALFRED (Federal Reserve Bank of St. Louis) real-time vintages. One request per series per release date, `https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=<SERIES>&vintage_date=<release date>`. Series: `GDPC1MD`, `UNRATEMD`, `PCECTPIMD`, `JCXFEMD`, `FEDTARMD` (medians); `GDPC1CTH/CTL/CTM`, `UNRATECTH/CTL/CTM`, `PCECTPICTH/CTL/CTM`, `JCXFECTH/CTL/CTM` (central tendency). Every returned vintage header matched the requested release date. The median series have no vintage before 2015-12-16.
2. **Longer-run values:** the latest vintage of `GDPC1MDLR`, `UNRATEMDLR`, `PCECTPIMDLR`, `FEDTARMDLR` and `...CTHLR/CTLLR/CTMLR`. These series are indexed by SEP release date. Note: FRED fills `FEDTARMDLR` back to 2012-01 and `GDPC1MDLR`, `UNRATEMDLR`, `PCECTPIMDLR` back to 2015-06, before the SEP published medians. Hindsight uses them only from 2015-12; for 2015-06 the values come from the September 2015 SEP.
3. **September 2015 and June 2015 medians; dot plots 2012-01 to 2015-03:** Federal Reserve "Projection materials, accessible version", `https://www.federalreserve.gov/monetarypolicy/fomcprojtablYYYYMMDD.htm`. The December 2012 page is `fomcprojtabl20121217.htm` (the `...20121212.htm` name returns "Page not Found").
4. **Individual projections 2007-10 to 2015-06:** `https://www.federalreserve.gov/monetarypolicy/files/FOMC<meeting day 2>SEPcompilation.pdf`, read with `pdftotext -layout`. HTML versions exist only for some meetings (2010-01 to 2012-09), so the PDFs are used throughout.
5. **Realized values:** see `realized.json`.

fred.stlouisfed.org (`fredgraph.csv`) timed out for curl; alfred.stlouisfed.org answered. Retrieved 2026-09-28.

## realized.json

Latest-vintage values (ALFRED, retrieved 2026-10-02; GDPC1, PCEPI and PCEPILFE vintages of 2026-09-30) for 2007 to 2025. Re-captured for #66 with `python3 scripts/fed-sep/build.py --realized-only <input folder>` (needs only the `alfred/*_latest.csv` realized series) after the BEA revised GDP, PCE and core PCE: 15 values for 2021 to 2025 changed (for example GDP Q4/Q4 2024 2.40 to 2.64, core PCE 2023 3.29 to 3.41); the first capture was 2026-09-28. Values, computed with the SEP definitions:
- real GDP growth: `GDPC1` Q4 level / previous Q4 level.
- PCE and core PCE inflation: `PCEPI` and `PCEPILFE` monthly index, Oct-Dec average / previous Oct-Dec average.
- unemployment rate: `UNRATE`, Oct-Dec average.
- federal funds rate: midpoint of `DFEDTARU` and `DFEDTARL` on 31 December (from 2008), `DFEDTAR` on 31 December 2007.

95 rows. Gap: 2025 unemployment rate has `value: null`. BLS published no October 2025 unemployment rate (no household survey during the federal government shutdown), so the Q4 average is not computed; November and December values are given in `available_months`. GDP and PCE values change with every BEA revision; a grading step may prefer first-release values from ALFRED vintages.

## Open problems

- The medians for 2007-10 to 2015-03 are computed, not published at the time. Graders must decide which statistic represents "what it said at the time". The central tendency is the published claim.
- 2009-01: the compilation has the longer-run projections in a separate "Longer-run Projections" table that the parser does not read, so this edition has no computed longer-run median (the central tendency is present).
- 2020-03: no SEP. The FOMC cut rates at an unscheduled meeting on 2020-03-15 and did not hold the scheduled 2020-03-17/18 meeting, so no projections were submitted.
- Label changes (possible `Revision`s for subject mapping): the federal funds rate variable was "target federal funds rate at year-end" until June 2015 and "midpoint of target range or target level" from September 2015. The dot-plot values moved from rounded quarter points to exact range midpoints (0.125 steps) in September 2015. The other variable definitions did not change.

## Editions

`*` = computed by Hindsight. CT = central tendency.

| Edition | Meeting | Published | Statistics | Entries | Status |
|---|---|---|---|---|---|
| 2007-10 | 2007-10-30/31 | 2007-11-20 | CT, compilation median* | 32 | complete |
| 2008-01 | 2008-01-29/30 | 2008-02-20 | CT, compilation median* | 24 | complete |
| 2008-04 | 2008-04-29/30 | 2008-05-21 | CT, compilation median* | 24 | complete |
| 2008-06 | 2008-06-24/25 | 2008-07-16 | CT, compilation median* | 24 | complete |
| 2008-10 | 2008-10-28/29 | 2008-11-19 | CT, compilation median* | 32 | complete |
| 2009-01 | 2009-01-27/28 | 2009-02-18 | CT, compilation median* | 27 | complete |
| 2009-04 | 2009-04-28/29 | 2009-05-20 | CT, compilation median* | 30 | complete |
| 2009-06 | 2009-06-23/24 | 2009-07-15 | CT, compilation median* | 30 | complete |
| 2009-11 | 2009-11-03/04 | 2009-11-24 | CT, compilation median* | 38 | complete |
| 2010-01 | 2010-01-26/27 | 2010-02-17 | CT, compilation median* | 30 | complete |
| 2010-04 | 2010-04-27/28 | 2010-05-19 | CT, compilation median* | 30 | complete |
| 2010-06 | 2010-06-22/23 | 2010-07-14 | CT, compilation median* | 30 | complete |
| 2010-11 | 2010-11-02/03 | 2010-11-23 | CT, compilation median* | 38 | complete |
| 2011-01 | 2011-01-25/26 | 2011-02-16 | CT, compilation median* | 30 | complete |
| 2011-04 | 2011-04-27 | 2011-04-27 | CT, compilation median* | 30 | complete |
| 2011-06 | 2011-06-22 | 2011-06-22 | CT, compilation median* | 30 | complete |
| 2011-11 | 2011-11-02 | 2011-11-02 | CT, compilation median* | 38 | complete |
| 2012-01 | 2012-01-25 | 2012-01-25 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2012-04 | 2012-04-25 | 2012-04-25 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2012-06 | 2012-06-20 | 2012-06-20 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2012-09 | 2012-09-13 | 2012-09-13 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2012-12 | 2012-12-12 | 2012-12-12 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2013-03 | 2013-03-20 | 2013-03-20 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2013-06 | 2013-06-19 | 2013-06-19 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2013-09 | 2013-09-18 | 2013-09-18 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2013-12 | 2013-12-18 | 2013-12-18 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2014-03 | 2014-03-19 | 2014-03-19 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2014-06 | 2014-06-18 | 2014-06-18 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2014-09 | 2014-09-17 | 2014-09-17 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2014-12 | 2014-12-17 | 2014-12-17 | CT, FFR dot median*, compilation median* | 48 | complete |
| 2015-03 | 2015-03-18 | 2015-03-18 | CT, FFR dot median*, compilation median* | 38 | complete |
| 2015-06 | 2015-06-17 | 2015-06-17 | CT, median | 34 | complete |
| 2015-09 | 2015-09-16/17 | 2015-09-17 | median | 24 | complete |
| 2015-12 | 2015-12-16 | 2015-12-16 | median | 24 | complete |
| 2016-03 | 2016-03-16 | 2016-03-16 | median | 19 | complete |
| 2016-06 | 2016-06-15 | 2016-06-15 | median | 19 | complete |
| 2016-09 | 2016-09-21 | 2016-09-21 | median | 24 | complete |
| 2016-12 | 2016-12-14 | 2016-12-14 | median | 24 | complete |
| 2017-03 | 2017-03-15 | 2017-03-15 | median | 19 | complete |
| 2017-06 | 2017-06-14 | 2017-06-14 | median | 19 | complete |
| 2017-09 | 2017-09-20 | 2017-09-20 | median | 24 | complete |
| 2017-12 | 2017-12-13 | 2017-12-13 | median | 24 | complete |
| 2018-03 | 2018-03-21 | 2018-03-21 | median | 19 | complete |
| 2018-06 | 2018-06-13 | 2018-06-13 | median | 19 | complete |
| 2018-09 | 2018-09-26 | 2018-09-26 | median | 24 | complete |
| 2018-12 | 2018-12-19 | 2018-12-19 | median | 24 | complete |
| 2019-03 | 2019-03-20 | 2019-03-20 | median | 19 | complete |
| 2019-06 | 2019-06-19 | 2019-06-19 | median | 19 | complete |
| 2019-09 | 2019-09-18 | 2019-09-18 | median | 24 | complete |
| 2019-12 | 2019-12-11 | 2019-12-11 | median | 24 | complete |
| 2020-03 | (2020-03-17/18 cancelled) | - | - | 0 | missing |
| 2020-06 | 2020-06-10 | 2020-06-10 | median | 19 | complete |
| 2020-09 | 2020-09-16 | 2020-09-16 | median | 24 | complete |
| 2020-12 | 2020-12-16 | 2020-12-16 | median | 24 | complete |
| 2021-03 | 2021-03-17 | 2021-03-17 | median | 19 | complete |
| 2021-06 | 2021-06-16 | 2021-06-16 | median | 19 | complete |
| 2021-09 | 2021-09-22 | 2021-09-22 | median | 24 | complete |
| 2021-12 | 2021-12-15 | 2021-12-15 | median | 24 | complete |
| 2022-03 | 2022-03-16 | 2022-03-16 | median | 19 | complete |
| 2022-06 | 2022-06-15 | 2022-06-15 | median | 19 | complete |
| 2022-09 | 2022-09-21 | 2022-09-21 | median | 24 | complete |
| 2022-12 | 2022-12-14 | 2022-12-14 | median | 24 | complete |
| 2023-03 | 2023-03-22 | 2023-03-22 | median | 19 | complete |
| 2023-06 | 2023-06-14 | 2023-06-14 | median | 19 | complete |
| 2023-09 | 2023-09-20 | 2023-09-20 | median | 24 | complete |
| 2023-12 | 2023-12-13 | 2023-12-13 | median | 24 | complete |
| 2024-03 | 2024-03-20 | 2024-03-20 | median | 19 | complete |
| 2024-06 | 2024-06-12 | 2024-06-12 | median | 19 | complete |
| 2024-09 | 2024-09-18 | 2024-09-18 | median | 24 | complete |
| 2024-12 | 2024-12-18 | 2024-12-18 | median | 24 | complete |
| 2025-03 | 2025-03-19 | 2025-03-19 | median | 19 | complete |
| 2025-06 | 2025-06-18 | 2025-06-18 | median | 19 | complete |
| 2025-09 | 2025-09-17 | 2025-09-17 | median | 24 | complete |
| 2025-12 | 2025-12-10 | 2025-12-10 | median | 24 | complete |
| 2026-03 | 2026-03-18 | 2026-03-18 | median | 19 | complete |
| 2026-06 | 2026-06-17 | 2026-06-17 | median | 19 | complete |
| 2026-09 | 2026-09-16 | 2026-09-16 | median | 24 | complete |
