# US Congressional Budget Office: economic and deficit projections

Publisher: Congressional Budget Office (CBO). Series: baseline projections in *The Budget and Economic Outlook* (winter) and its updates (spring re-estimates, summer/fall updates). Issue #19.
Facts only: metric, target year, horizon, projected value, source. Nothing here is graded and no errors are computed.

## Scope

- Metrics: real GDP growth (real GNP before 1992), unemployment rate, CPI-U inflation, 10-year Treasury note rate, federal budget deficit.
- Edition id = baseline publication month `YYYY-MM`. For forecasts made 1976 to 1983 the supplement gives the year only, so the edition id is `YYYY`.
- Three kinds of entries:
  1. **Annual projections** (`horizon: year_1` to `year_5`, `period: calendar year`) from CBO's economic projections data files (publication 51135), editions 2000-01 to 2026-02. `year_1` is the calendar year of publication (part of it was already observed when CBO published). Real GDP growth and CPI-U inflation: taken from the "Percentage change, annual rate" row where the file has one (2024-02 onward). In older files only levels exist, and the growth is computed from the file's calendar-year levels (confidence `medium`, note on each entry). Unemployment and the 10-year rate are taken as given.
  2. **Two-year and five-year averages** (`horizon: 2_year_average` / `5_year_average`, with `target_period`) as CBO itself computed them for its forecasting-record evaluation, from the supplementary tables of *CBO's Economic Forecasting Record: 2017 Update*. Forecasts made 1976 to 2014 (two-year) and 1976 to 2011 (five-year) for real output and CPI inflation; 1984 to 2014 and 1984 to 2011 for the 10-year rate. These come from CBO's winter report. Each is filed under that year's first baseline (the January 51135 edition where one exists, otherwise the first baseline date in eval-projections, otherwise the year).
  3. **Federal deficit** (`horizon: year_1` to `year_5`, `period: fiscal year`, billions of dollars, negative = deficit) for every baseline 1984-02 to 2026-02, from CBO's own `eval-projections` repository. `year_1` is the fiscal year in progress at publication.
- Deficit as a percentage of GDP: not captured. The eval-projections file gives dollars only. CBO's budget projection files give percentages only for 2011-08 and 2018 onward; not extracted. `realized.json` holds dollar and percent-of-GDP actuals.

## Verify-first answers (issue #19)

- **Archive of past baselines.** Yes, in three pieces. (a) cbo.gov "Key Budget and Economic Data" (https://www.cbo.gov/data/budget-economic-data) lists 10-year economic projection files for January 2000 to August 2012 and April 2018 onward (44 files, 2026-02 included). It lists no files for 2013 to 2017. (b) CBO's GitHub repo https://github.com/US-CBO/eval-projections (commit 682559ca58, 2026-02-17) holds the budget projections of every baseline from February 1984 to February 2026 (101 baseline dates). (c) The forecasting-record supplementary tables (2017 update) hold CBO's two-year and five-year forecasts from 1976. The later forecasting-record data files (2019, 2021, 2023, 2025) hold forecast errors only, not forecast values.
- **The "Excel file of past forecasts".** The 2025 update's data file (https://www.cbo.gov/system/files/2025-07/61334-data.xlsx) contains summary statistics and errors per forecast period, not the forecasts. The last CBO file with forecast values per year is the 2017 supplement (53090). This capture uses that file.
- **Access.** cbo.gov serves a DataDome bot check (HTTP 403) to curl and WebFetch. All CBO files were read from Internet Archive snapshots of the official cbo.gov URLs. `source_url` in each entry is the official cbo.gov URL. The CBO GitHub repo and FRED were read directly.
- **CBO's GitHub `cbo-data` repo** (https://github.com/US-CBO/cbo-data) holds machine-readable economic projections only for 2024-02 onward. Not used.

## CBO's self-assessment (comparison, not used for grading)

Source: *CBO's Economic Forecasting Record: 2025 Update*, July 2025, https://www.cbo.gov/publication/61334 (report https://www.cbo.gov/system/files/2025-07/61334-forecasts.pdf, data https://www.cbo.gov/system/files/2025-07/61334-data.xlsx). Errors are projected minus actual; positive = too high. Actual values as of 2025-04-06.

- CBO states that its forecasts of output growth, unemployment, inflation, interest rates and wages "tend to be more accurate than those of the Administration and the Blue Chip consensus". Roughly half of its two-year forecasts are more accurate than the Survey of Professional Forecasters (SPF).
- CBO states that on average its forecasts "are too high by small amounts", and that two-year and five-year accuracy is similar. Average errors for growth, unemployment and CPI inflation are small and not statistically significant. Interest-rate errors are statistically significant and positive.
- Two-year forecasts (Table 1), CBO root mean square error (RMSE) / average error, percentage points: real output growth 1.2 / -0.1 (1982-2023); unemployment rate 1.0 / 0.1; CPI inflation 1.0 / near 0; 10-year Treasury rate 0.8 / 0.4 (1984-2023).
- Five-year forecasts (Table 2), CBO RMSE / average error: real output growth 1.1 / 0.1 (1979-2020); unemployment rate 1.1 / -0.1; CPI inflation 0.7 / 0.1 (1983-2020); 10-year rate 1.2 / 0.9 (1984-2020).
- Relative accuracy (Summary Table 1: percent by which the other forecaster's RMSE exceeds CBO's): two-year, Administration +11 on average, Blue Chip +4, SPF +7; five-year, Administration +9, Blue Chip +6. Exception: Blue Chip five-year real growth forecasts were 10% more accurate than CBO's.
- Largest two-year CPI errors (Box 3): -4.3 points for the forecasts made in 2021 and in 1979. Recent five-year CPI forecasts (Table 3): CBO forecast 2.4% for 2019-2023 (actual 3.9%) and 2.5% for 2020-2024 (actual 4.2%).
- Error sources that CBO names: turning points in the business cycle, shifts in productivity trends, oil prices, the downward trend in interest rates, the falling labor share, data revisions, and the pandemic.
- Deficits: CBO evaluates its deficit projections separately, at https://www.cbo.gov/publication/61067 (1984 to 2023, December 2024) and https://www.cbo.gov/publication/55234 (2019). The 2019 report gives an average absolute error of 1 percent of GDP for budget-year deficit projections and 2 percent of GDP for sixth-year projections.

## Files and vintages used

| Input | URL | Notes |
|---|---|---|
| Forecasting record 2017 supplementary tables | https://www.cbo.gov/system/files/115th-congress-2017-2018/reports/53090-supplementarytables.xlsx | Report page https://www.cbo.gov/publication/53090 (October 2017). Sheets Fig. 7, 9, 13 (two-year) and Fig. 16, 18, 22 (five-year), CBO "Forecast" column. SHA-256 prefix 3ef003f39842df1d. |
| 10-year economic projections, 44 files | listed in `scripts/cbo-projections/ep_urls.txt` (prefix https://www.cbo.gov) | Sheet "2. Calendar Year". Retrieved 2026-09-28 from Internet Archive snapshots. |
| eval-projections baselines and actuals | https://github.com/US-CBO/eval-projections/tree/main/input_data | Commit 682559ca58 (2026-02-17). SHA-256 prefixes a2f0ef6890c53b57 (baselines.csv), 810e101e0691d9f1 (actuals.csv). |

## realized.json

Annual actuals 1975 to 2025, retrieved from FRED on 2026-10-02 (latest vintage, not first release; re-captured for #66 with `python3 scripts/cbo-projections/build.py --realized-only <input folder>` after the BEA revised real GDP and GNP for 2021 to 2025: GDP 2021 6.2 to 6.3, 2022 2.5 to 2.4, 2024 2.8 to 3.0, 2025 2.1 to 2.3; the first capture was 2026-09-28): real GDP growth (BEA, A191RL1A225NBEA), real GNP growth (BEA, A001RL1A225NBEA, for forecasts before 1992), unemployment rate annual average (BLS, UNRATE), CPI-U annual-average inflation (BLS, CPIAUCNS, not seasonally adjusted, the CBO calendar-year-average method), 10-year Treasury rate annual average (Federal Reserve, GS10), federal surplus or deficit in millions (FYFSD) and as % of GDP (FYFSGDA188S). It also holds CBO's own deficit actuals in billions from eval-projections `actuals.csv`. 2025 values have confidence `medium`. No averages or errors are computed.

## Editions

112 edition files: 1976 to 1983 (year ids), every baseline from 1984-02 to 2026-02, and the economic-only updates 2018-08, 2020-07, 2023-07 and 2025-09. 71 complete, 41 partial. `PROGRESS.md` has the per-edition counts.

| Span | Content | Status |
|---|---|---|
| 1976 to 1983 | Two-year and five-year averages (real GNP, CPI). CBO did not forecast the 10-year rate before 1984. | partial: unemployment and deficit not in the sources |
| 1984 to 1999, winter baselines | Averages (real output, CPI, 10-year or Aaa rate) and deficit | partial: no unemployment (the 2017 supplement omits it) and no annual data file |
| 1984 to 1999, spring re-estimates | Deficit only | complete (spring re-estimates reuse the winter economic forecast) |
| 1992-08, 1993-09, 1994-08, 1995-08, 1995-12, 1997-09, 1998-08, 1999-07 | Deficit only | partial: summer and fall updates revise the economic forecast; no data file |
| 2000-01 to 2012-08 | Annual projections for all four economic metrics, averages (winter editions to 2011 or 2012), deficit | complete |
| 2013-02 to 2017-06 | Averages (2013 and 2014 only) and deficit | winter and summer editions partial: CBO's data page lists no economic projection files for 2013 to 2017 |
| 2018-04 to 2026-02 | Annual projections and deficit | complete, except 2020-09 (deficit only; its economic forecast is in edition 2020-07) |

## Open problems and source anomalies

- **Fig. 22 row labels (2017 supplement).** The sheet of five-year 10-year-rate forecasts labels its rows as two-year periods ("1984-1985" to "2011-2012"). The actual values in the same rows are five-year averages (for example 9.58% for the 1984 forecast, which is the 1984-1988 average; the 1984-1985 average is 11.53%). The entries use the five-year period and have confidence `medium`.
- **Aaa rate in 1984 and 1985.** CBO forecast Moody's Aaa corporate bond rate, not the 10-year Treasury rate, in those years. The entries have that label.
- **CPI-W.** CBO's forecasts made 1986 to 1989 were for the CPI-W (2025 report appendix). The supplement gives one CBO CPI column.
- **Computed growth rates.** For 2000-01 to 2023-07 the economic files give real GDP and CPI-U as levels only. Growth for `year_1` uses the prior year's level from the same file, which was an actual or estimate at the time. Check: the geometric two-year average of the computed rates equals CBO's own two-year figure for 2008 (2.254) and 2012 (1.62).
- **2023-12.** The file 51135-2023-12 is a one-table "Current View of the Economy" with fourth-quarter-over-fourth-quarter figures, not a baseline. Not extracted.
- **2023-07 and 2025-09** are short updates with projections to 2025 and 2028 only.
- **Forecast values for 2015 to 2017 averages and 2013 to 2017 annual data are missing.** The 2019 to 2025 forecasting-record files give forecasts made 2015 to 2023 only as errors. Forecast values could be recovered as actual + error. That is a computation and was not done.
- **Pre-1984 publication months** are not in the sources used. The edition ids are years.
- No short quotes are stored per entry: the sources are data tables, not prose.
