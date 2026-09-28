# UK Office for Budget Responsibility: Economic and fiscal outlook forecasts

Publisher: Office for Budget Responsibility (OBR). Series: *Economic and fiscal outlook* (EFO), normally twice a year (spring and autumn). Issue #20.
Facts only: metric, target year, horizon, forecast value, source. Nothing here is graded and no errors are computed.

## Scope

- Metrics, per EFO and per forecast year:
  - real GDP growth, % (calendar year; database sheet `UKGDP`)
  - CPI inflation, percentage change on a year earlier (calendar year; sheet `CPI`)
  - public sector net borrowing (PSNB), % of GDP (fiscal year April to March; sheet `PSNB`)
  - PSNB, £ billion (fiscal year; sheet `£PSNB`)
- Edition id = EFO publication month `YYYY-MM`, taken from the database row label (for example "November 2025" gives `2025-11`).
- `horizon`: `year_1` is the calendar year of publication (GDP, CPI) or the fiscal year in progress at publication (PSNB; a March EFO's `year_1` is the fiscal year that ends that month). `year_0` is the year before `year_1`: an estimate, mostly outturn, kept because the row gives it. Years before `year_0` are outturns and are not captured.
- Every value the database holds for these rows from `year_0` onward is captured, usually to `year_5` or `year_6`.
- Values are as published at the time. PSNB definitions and classifications changed over time (for example the treatment of public sector banks, Royal Mail pension transfers and Asset Purchase Facility transfers). The database states that each forecast reflects "the definitions and classifications used at the time of each forecast".

## Verify-first answers (issue #20)

- **Archive start.** The OBR was set up in May 2010. Its first forecast was the Pre-Budget forecast of 14 June 2010. The first EFO was the June 2010 Budget forecast (22 June 2010). The historical official forecasts database starts its OBR rows with "June 2010" (the Budget forecast); earlier rows are HM Treasury forecasts back to the 1970s and are out of scope.
- **Editions in the database.** 33 EFO forecasts from June 2010 to March 2026: June 2010, November 2010, March 2011, November 2011, March 2012, December 2012, March 2013, December 2013, March 2014, December 2014, March 2015, July 2015, November 2015, March 2016, November 2016, March 2017, November 2017, March 2018, October 2018, March 2019, March 2020, November 2020, March 2021, October 2021, March 2022, November 2022, March 2023, November 2023, March 2024, October 2024, March 2025, November 2025, March 2026.
- **No autumn 2019 or autumn 2022 forecast rows.** The government cancelled the autumn 2019 Budget, and the September 2022 fiscal event had no OBR forecast; the next forecast was November 2022. These are gaps in the series, not missing files.
- **Missing edition:** the Pre-Budget forecast of June 2010 is not in the database and is not captured. It is recorded in the notes of `2010-06.json`.
- **Access.** obr.uk returns a Cloudflare challenge (HTTP 403) to curl and WebFetch. The workbook was read from its Internet Archive snapshot of 2026-03-26 (https://web.archive.org/web/20260326123133/https://obr.uk/docs/dlm_uploads/Historical_official_forecasts_database_Spring_2026.xlsx). `source_url` in each entry is the official obr.uk URL. ONS series were read directly from ons.gov.uk.

## OBR's self-assessment (comparison, not used for grading)

Source: *Forecast evaluation report – July 2025* (FER), https://obr.uk/fer/forecast-evaluation-report-july-2025/ (PDF https://obr.uk/docs/dlm_uploads/Forecast-evaluation-report-July-2025.pdf). The FER sign convention is outturn minus forecast. Earlier, fuller analysis: Working paper No.19, *The OBR's forecast performance* (Atkins and Lanskey, August 2023), https://obr.uk/docs/dlm_uploads/Working_Paper_19_The_OBRs_forecast_performance_Aug23.pdf.

- The OBR states that its forecasts since 2010 "have tended to be somewhat pessimistic in the near-term and optimistic in the medium term".
- Real GDP growth: on average the OBR underestimated growth by 0.4 percentage points one year ahead and overestimated it by 0.7 points five years ahead. Its average absolute difference matches the external average at one and two years and is larger at five years.
- PSNB: on average the OBR overestimated one-year-ahead borrowing by 0.2% of GDP and underestimated five-year-ahead borrowing by 3.1% of GDP. The OBR attributes the medium-term gap to its average GDP overoptimism and to the legal requirement to use government departmental spending plans, which were later raised several times.
- External forecasters (median of HM Treasury's compilation): one-year GDP growth underestimated by 0.5 points, five-year overestimated by 0.6 points; one-year borrowing overestimated by 0.3% of GDP, five-year underestimated by 2.9% of GDP. The OBR describes its record as similar to theirs.
- CPI inflation (Table 2.2, median outturn minus forecast): 0.0 one year ahead, 0.3 two years ahead, 0.5 five years ahead; median absolute differences 0.3, 0.9 and 1.1 points. The one-year mean difference is 0.3 points (0.1 excluding the October 2021 forecast), mean absolute 0.7 points. In the 2010s the one-year forecast mostly overestimated CPI inflation; in the 2020s it mostly underestimated it.
- FY 2023-24 case (FER chapter 1): outturn PSNB was £131.1 billion (4.8% of GDP). The March 2019 five-year forecast was £13.5 billion (0.5% of GDP), £117.6 billion below outturn. The March 2022 two-year forecast was £50.2 billion (1.9% of GDP). The March 2023 one-year forecast was £131.6 billion (5.1% of GDP), close to outturn.

## Files and vintages used

| Input | URL | Notes |
|---|---|---|
| Historical official forecasts database, Spring 2026 | https://obr.uk/docs/dlm_uploads/Historical_official_forecasts_database_Spring_2026.xlsx | Linked from https://obr.uk/data/. Includes the March 2026 EFO. Snapshot 2026-03-26, 2,298,283 bytes, SHA-256 e00b17cb7ec8dfdd... Sheets `UKGDP`, `CPI`, `PSNB`, `£PSNB`. |
| ONS IHYP (PN2) | https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/ihyp/pn2 | GDP year-on-year growth, chained volume. Release 2026-08-13. |
| ONS D7G7 (MM23) | https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23 | CPI annual rate, all items. Release 2026-09-16. |

## realized.json

Two sources. (1) The "Outturn data" rows of the same database for all four series (ONS data "as available at last forecast", March 2026), from 2009 on. PSNB outturns come only from this row: ONS publishes PSNB by fiscal year in its bulletins, but its time-series API returns calendar-year totals. (2) ONS IHYP and D7G7 read directly on 2026-09-28. Recent years carry confidence `medium`. Latest values, not first estimates. No errors are computed.

## Editions

33 editions, all `complete` (every scope series is present for every EFO row). Entry counts are in `PROGRESS.md` (920 entries in total).

## Open problems and source anomalies

- **Memo rows.** The PSNB sheets hold two extra rows: "Memo: restated March 2019 forecast" and "Memo: supplementary March 2020 forecast". They are captured in editions 2019-03 and 2020-03 with a note on each entry; they are not the headline forecast of that EFO. The restated March 2019 forecast shows PSNB about 0.8 to 0.9% of GDP higher in each year than the headline forecast (a later restatement, from the database, not from the March 2019 EFO).
- **Precision.** Rows up to about 2016 hold rounded published values (one decimal). Later rows hold unrounded model values. Values are stored rounded to 3 decimals.
- **CPI outturn row** carries the database note "May differ from ONS series due to rounding".
- **`year_0` values** are the OBR's estimate for the year just ended at the time. They are captured but carry a note; a grader may want to exclude them.
- **No short quotes** are stored per entry: the source is a data table, not prose.
