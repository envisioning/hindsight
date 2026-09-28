# ECB / Eurosystem staff macroeconomic projections for the euro area

Publisher: European Central Bank. Series: Eurosystem staff macroeconomic projections (June and December) and ECB staff macroeconomic projections (March and September).
Facts only: variable, target year, projected value, source. Nothing here is graded and no errors are computed.

## Scope

- Economy: euro area (composition at the time of each projection).
- Variables: `HICP inflation` (annual average percentage change of the HICP) and `real GDP growth` (annual percentage change; recent tables state seasonally and working-day-adjusted data).
- Horizons: the projection year and each later year shown (`current_year`, `next_year`, `year_plus_2`, `year_plus_3`). Columns for years before the edition year are estimates of the past and are not captured.
- Edition id = publication month `YYYY-MM` (03, 06, 09, 12). `published` is the month only; the page does not give the day (projections come out on the day of the Governing Council monetary policy meeting).
- 104 editions, 2000-12 to 2026-09, 566 entries. All editions on the ECB page are captured; status `complete` for every edition.

## Verify-first answers (issue #17)

- **Archive of past projection rounds?** Yes, two:
  1. ECB "Past macroeconomic projections" page, one table per edition from December 2000 to September 2026, with the numbers as published (ranges, or points with ranges, or points): https://www.ecb.europa.eu/mopo/devel/ecana/html/table.en.html .
  2. ECB Macroeconomic Projection Database (MPD) on the ECB Data Portal, one point value per exercise and year, exercises W99 (March 1999) to S26 (September 2026): https://data.ecb.europa.eu/data/datasets/MPD . API used: `https://data-api.ecb.europa.eu/service/data/MPD/A.U2.YER+HIC...?format=csvdata` (series key `MPD.A.U2.<YER|HIC>.A.<exercise>.0000`; exercise code W = March, G = June, S = September, A = December, plus two-digit year).
- **First published edition:** December 2000 (Eurosystem staff). The ECB page lists March and September (ECB staff) editions from March 2001, so the "ECB staff since 2004" assumption in the task brief does not match the ECB's own archive.
- **MPD exercises not on the page:** 1999-03 (W99), 1999-06 (G99), 1999-09 (S99), 1999-12 (A99), 2000-03 (W00), 2000-06 (G00), 2000-09 (S00). These exercises were not published at the time and are not captured as editions.

## Values

| edition span | published form | `statistic` | `value` |
|---|---|---|---|
| 2000-12 to 2013-03 | range only (for example [1.1 , 1.7]) | `range midpoint` | midpoint computed by Hindsight; `value_low` and `value_high` are the published bounds |
| 2013-06 to 2020-03 | point with a range | `point` | the published point; `value_low` and `value_high` are the published range |
| 2020-06 to 2026-09 | point only (scenarios shown separately in some editions) | `point` | the published point (baseline) |

Every entry also carries `mpd_value`, the MPD point for the same exercise and year. For range editions the MPD value equals the range midpoint in 224 of 226 cases (2003-12 HICP 2004: midpoint 1.8, MPD 1.9; 2005-12 HICP 2006: midpoint 2.1, MPD 2.2). For point editions the MPD value equals the published point except for 2025-06 (below).

## realized.json

Eurostat, latest values, retrieved 2026-09-28, 1999 to 2025, 54 rows:
- HICP inflation: `prc_hicp_aind`, geo=EA (changing composition), coicop=CP00, unit=RCH_A_AVG (dataset updated 2026-02-06).
- real GDP growth: `nama_10_gdp`, geo=EA (changing composition), B1GQ, CLV_PCH_PRE (dataset updated 2026-09-21); `value_ea20` gives the fixed 20-country aggregate. This annual series is not calendar adjusted, while the ECB projects working-day-adjusted GDP, so small differences are expected.

## Problems found in the sources

- **ECB page, hidden scenario rows.** The March 2026 and September 2026 tables contain adverse and severe scenario rows inside HTML comments. A plain text scrape reads these rows and makes both editions look identical (HICP 4.4 / 4.8 / 2.8). The build strips HTML comments and keeps only the baseline rows. The baseline values match the MPD exactly.
- **ECB page, scenario rows in the table.** Some editions (for example 2022-03) show scenario rows below the baseline; only the baseline is captured, and the entry note says so.
- **MPD exercise G25 (June 2025) is wrong.** It holds exactly the same values as S25 (September 2025): HICP 2.1 / 1.7 / 1.9 and GDP 1.2 / 1.0 / 1.3. The ECB page gives the June 2025 values as HICP 2.0 / 1.6 / 2.0 and GDP 0.9 / 1.1 / 1.3. The edition file keeps the page values (confidence high) and notes the MPD error.
- In December editions the current-year value is an estimate made near the end of that year; it is captured as `current_year` like any other edition.

## Label changes (possible `Revision`s for subject mapping)

- Series name alternates by quarter: "Eurosystem staff" (June, December) and "ECB staff" (March, September).
- Published form changes: ranges only until 2013-03, point plus range from 2013-06 to 2020-03, point only from 2020-06.

## Editions

| Edition | Staff | MPD exercise | Published form | Years | Entries | Status |
|---|---|---|---|---|---|---|
| 2000-12 | Eurosystem staff | A00 | range (midpoint) | 2000-2002 | 6 | complete |
| 2001-03 | ECB staff | W01 | range (midpoint) | 2001-2002 | 4 | complete |
| 2001-06 | Eurosystem staff | G01 | range (midpoint) | 2001-2002 | 4 | complete |
| 2001-09 | ECB staff | S01 | range (midpoint) | 2001-2002 | 4 | complete |
| 2001-12 | Eurosystem staff | A01 | range (midpoint) | 2001-2003 | 6 | complete |
| 2002-03 | ECB staff | W02 | range (midpoint) | 2002-2003 | 4 | complete |
| 2002-06 | Eurosystem staff | G02 | range (midpoint) | 2002-2003 | 4 | complete |
| 2002-09 | ECB staff | S02 | range (midpoint) | 2002-2003 | 4 | complete |
| 2002-12 | Eurosystem staff | A02 | range (midpoint) | 2002-2004 | 6 | complete |
| 2003-03 | ECB staff | W03 | range (midpoint) | 2003-2004 | 4 | complete |
| 2003-06 | Eurosystem staff | G03 | range (midpoint) | 2003-2004 | 4 | complete |
| 2003-09 | ECB staff | S03 | range (midpoint) | 2003-2004 | 4 | complete |
| 2003-12 | Eurosystem staff | A03 | range (midpoint) | 2003-2005 | 6 | complete |
| 2004-03 | ECB staff | W04 | range (midpoint) | 2004-2005 | 4 | complete |
| 2004-06 | Eurosystem staff | G04 | range (midpoint) | 2004-2005 | 4 | complete |
| 2004-09 | ECB staff | S04 | range (midpoint) | 2004-2005 | 4 | complete |
| 2004-12 | Eurosystem staff | A04 | range (midpoint) | 2004-2006 | 6 | complete |
| 2005-03 | ECB staff | W05 | range (midpoint) | 2005-2006 | 4 | complete |
| 2005-06 | Eurosystem staff | G05 | range (midpoint) | 2005-2006 | 4 | complete |
| 2005-09 | ECB staff | S05 | range (midpoint) | 2005-2006 | 4 | complete |
| 2005-12 | Eurosystem staff | A05 | range (midpoint) | 2005-2007 | 6 | complete |
| 2006-03 | ECB staff | W06 | range (midpoint) | 2006-2007 | 4 | complete |
| 2006-06 | Eurosystem staff | G06 | range (midpoint) | 2006-2007 | 4 | complete |
| 2006-09 | ECB staff | S06 | range (midpoint) | 2006-2007 | 4 | complete |
| 2006-12 | Eurosystem staff | A06 | range (midpoint) | 2006-2008 | 6 | complete |
| 2007-03 | ECB staff | W07 | range (midpoint) | 2007-2008 | 4 | complete |
| 2007-06 | Eurosystem staff | G07 | range (midpoint) | 2007-2008 | 4 | complete |
| 2007-09 | ECB staff | S07 | range (midpoint) | 2007-2008 | 4 | complete |
| 2007-12 | Eurosystem staff | A07 | range (midpoint) | 2007-2009 | 6 | complete |
| 2008-03 | ECB staff | W08 | range (midpoint) | 2008-2009 | 4 | complete |
| 2008-06 | Eurosystem staff | G08 | range (midpoint) | 2008-2009 | 4 | complete |
| 2008-09 | ECB staff | S08 | range (midpoint) | 2008-2009 | 4 | complete |
| 2008-12 | Eurosystem staff | A08 | range (midpoint) | 2008-2010 | 6 | complete |
| 2009-03 | ECB staff | W09 | range (midpoint) | 2009-2010 | 4 | complete |
| 2009-06 | Eurosystem staff | G09 | range (midpoint) | 2009-2010 | 4 | complete |
| 2009-09 | ECB staff | S09 | range (midpoint) | 2009-2010 | 4 | complete |
| 2009-12 | Eurosystem staff | A09 | range (midpoint) | 2009-2011 | 6 | complete |
| 2010-03 | ECB staff | W10 | range (midpoint) | 2010-2011 | 4 | complete |
| 2010-06 | Eurosystem staff | G10 | range (midpoint) | 2010-2011 | 4 | complete |
| 2010-09 | ECB staff | S10 | range (midpoint) | 2010-2011 | 4 | complete |
| 2010-12 | Eurosystem staff | A10 | range (midpoint) | 2010-2012 | 6 | complete |
| 2011-03 | ECB staff | W11 | range (midpoint) | 2011-2012 | 4 | complete |
| 2011-06 | Eurosystem staff | G11 | range (midpoint) | 2011-2012 | 4 | complete |
| 2011-09 | ECB staff | S11 | range (midpoint) | 2011-2012 | 4 | complete |
| 2011-12 | Eurosystem staff | A11 | range (midpoint) | 2011-2013 | 6 | complete |
| 2012-03 | ECB staff | W12 | range (midpoint) | 2012-2013 | 4 | complete |
| 2012-06 | Eurosystem staff | G12 | range (midpoint) | 2012-2013 | 4 | complete |
| 2012-09 | ECB staff | S12 | range (midpoint) | 2012-2013 | 4 | complete |
| 2012-12 | Eurosystem staff | A12 | range (midpoint) | 2012-2014 | 6 | complete |
| 2013-03 | ECB staff | W13 | range (midpoint) | 2013-2014 | 4 | complete |
| 2013-06 | Eurosystem staff | G13 | point + range | 2013-2014 | 4 | complete |
| 2013-09 | ECB staff | S13 | point + range | 2013-2014 | 4 | complete |
| 2013-12 | Eurosystem staff | A13 | point + range | 2013-2015 | 6 | complete |
| 2014-03 | ECB staff | W14 | point + range | 2014-2016 | 6 | complete |
| 2014-06 | Eurosystem staff | G14 | point + range | 2014-2016 | 6 | complete |
| 2014-09 | ECB staff | S14 | point + range | 2014-2016 | 6 | complete |
| 2014-12 | Eurosystem staff | A14 | point + range | 2014-2016 | 6 | complete |
| 2015-03 | ECB staff | W15 | point + range | 2015-2017 | 6 | complete |
| 2015-06 | Eurosystem staff | G15 | point + range | 2015-2017 | 6 | complete |
| 2015-09 | ECB staff | S15 | point + range | 2015-2017 | 6 | complete |
| 2015-12 | Eurosystem staff | A15 | point + range | 2015-2017 | 6 | complete |
| 2016-03 | ECB staff | W16 | point + range | 2016-2018 | 6 | complete |
| 2016-06 | Eurosystem staff | G16 | point + range | 2016-2018 | 6 | complete |
| 2016-09 | ECB staff | S16 | point + range | 2016-2018 | 6 | complete |
| 2016-12 | Eurosystem staff | A16 | point + range | 2016-2019 | 8 | complete |
| 2017-03 | ECB staff | W17 | point + range | 2017-2019 | 6 | complete |
| 2017-06 | Eurosystem staff | G17 | point + range | 2017-2019 | 6 | complete |
| 2017-09 | ECB staff | S17 | point + range | 2017-2019 | 6 | complete |
| 2017-12 | Eurosystem staff | A17 | point + range | 2017-2020 | 8 | complete |
| 2018-03 | ECB staff | W18 | point + range | 2018-2020 | 6 | complete |
| 2018-06 | Eurosystem staff | G18 | point + range | 2018-2020 | 6 | complete |
| 2018-09 | ECB staff | S18 | point + range | 2018-2020 | 6 | complete |
| 2018-12 | Eurosystem staff | A18 | point + range | 2018-2021 | 8 | complete |
| 2019-03 | ECB staff | W19 | point + range | 2019-2021 | 6 | complete |
| 2019-06 | Eurosystem staff | G19 | point + range | 2019-2021 | 6 | complete |
| 2019-09 | ECB staff | S19 | point + range | 2019-2021 | 6 | complete |
| 2019-12 | Eurosystem staff | A19 | point + range | 2019-2022 | 8 | complete |
| 2020-03 | ECB staff | W20 | point + range | 2020-2022 | 6 | complete |
| 2020-06 | Eurosystem staff | G20 | point | 2020-2022 | 6 | complete |
| 2020-09 | ECB staff | S20 | point | 2020-2022 | 6 | complete |
| 2020-12 | Eurosystem staff | A20 | point | 2020-2023 | 8 | complete |
| 2021-03 | ECB staff | W21 | point | 2021-2023 | 6 | complete |
| 2021-06 | Eurosystem staff | G21 | point | 2021-2023 | 6 | complete |
| 2021-09 | ECB staff | S21 | point | 2021-2023 | 6 | complete |
| 2021-12 | Eurosystem staff | A21 | point | 2021-2024 | 8 | complete |
| 2022-03 | ECB staff | W22 | point | 2022-2024 | 6 | complete |
| 2022-06 | Eurosystem staff | G22 | point | 2022-2024 | 6 | complete |
| 2022-09 | ECB staff | S22 | point | 2022-2024 | 6 | complete |
| 2022-12 | Eurosystem staff | A22 | point | 2022-2025 | 8 | complete |
| 2023-03 | ECB staff | W23 | point | 2023-2025 | 6 | complete |
| 2023-06 | Eurosystem staff | G23 | point | 2023-2025 | 6 | complete |
| 2023-09 | ECB staff | S23 | point | 2023-2025 | 6 | complete |
| 2023-12 | Eurosystem staff | A23 | point | 2023-2026 | 8 | complete |
| 2024-03 | ECB staff | W24 | point | 2024-2026 | 6 | complete |
| 2024-06 | Eurosystem staff | G24 | point | 2024-2026 | 6 | complete |
| 2024-09 | ECB staff | S24 | point | 2024-2026 | 6 | complete |
| 2024-12 | Eurosystem staff | A24 | point | 2024-2027 | 8 | complete |
| 2025-03 | ECB staff | W25 | point | 2025-2027 | 6 | complete |
| 2025-06 | Eurosystem staff | G25 | point | 2025-2027 | 6 | complete |
| 2025-09 | ECB staff | S25 | point | 2025-2027 | 6 | complete |
| 2025-12 | Eurosystem staff | A25 | point | 2025-2028 | 8 | complete |
| 2026-03 | ECB staff | W26 | point | 2026-2028 | 6 | complete |
| 2026-06 | Eurosystem staff | G26 | point | 2026-2028 | 6 | complete |
| 2026-09 | ECB staff | S26 | point | 2026-2028 | 6 | complete |
