# BP Energy Outlook: oil demand, renewables share, electric cars

Facts only: edition, scenario, metric, target year, value, unit, source. Nothing here is graded.

## Verify-first answers

- **Editions.** Annual from January 2011 to 2020, then 2022, 2023, 2024, 2025. **No 2021 edition** (bp skipped from September 2020 to March 2022). The 2025 edition (25 September 2025) is the latest; no 2026 edition was found on 2026-09-28. bp's "Downloads and archive" page serves the report PDF of every edition. 14 editions in total.
- **Title changes.** 2011 to 2013 "BP Energy Outlook 2030"; 2014 and 2015 "BP Energy Outlook 2035"; from 2016 "BP Energy Outlook <year> edition". Horizon 2030 (2011-2013), 2035 (2014-2017), 2040 (2018-2019), 2050 (2020 on).
- **Base case to scenarios.** 2011 to 2017: a single base case, which bp calls the "most likely" path, plus alternative cases. **2018: first scenario-based edition** (Evolving Transition plus alternatives). bp still describes results with reference to ET but says this "does not imply that the probability of this scenario is higher than the others". **2020: no central scenario** (Rapid, Net Zero, Business-as-usual).
- **Data tables.** bp now serves only the 2025 xlsx files. Older summary tables come from archive.org. Available: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025 (parsed); 2022 also "data at a glance" (2050 only). 2018 (#15): archive.org holds no capture of any 2018 table file (CDX on 2026-10-02 lists only a 404 for the 2018 data pack), so the 2018 summary tables are read from the NRGI GitHub mirror (github.com/NRGI/bp-energy-outlook-tracking), whose 2019 copy is identical cell for cell to archive.org's copy of bp's 2019 file; confidence medium. 2022 (#15): archive.org capture of 2023-01-28; the earlier capture (2022-04-03) has a stale 'Renewables - EJ' sheet. 2014 and 2015 (#71): legacy binary .xls files on archive.org (2014: capture of 2014-02-24, 'January 2014', base year 2012; 2015: `BP-Energy-Outlook-2035-Summary-Tables-2015.xls`, capture of 2015-03-01, 'February 2015', base year 2013), read with the stdlib `scripts/bp-energy-outlook/xls_dump.py` (output identical, cell for cell, to xlrd on both files). The archive.org .xlsx at the 2015 path (`BP_Energy_Outlook_2035_Summary_Tables_2015.xlsx`, capture of 2015-03-11) is not the 2015 workbook: its Contents sheet reads 'BP Energy Outlook 2035: January 2014' and every cell equals the 2014 .xls. Both 2014 and 2015 tables give liquids in Mtoe only. 2011 to 2013: no tables found; figures from report text.

## Scenario names per edition (exact) and central scenario

| Edition | Scenarios | Central (`main_scenario: true`) |
|---|---|---|
| 2011 | Base Case; High GDP Case, Low GDP Case, Policy Case | Base Case |
| 2012 | base case ("most likely"); business as usual, Policy Case | base case |
| 2013 | base case ("most likely") | base case |
| 2014 | base case (single "most likely" view) | base case |
| 2015 | base case; low GDP case and other sensitivities | base case |
| 2016 | base case; alternative cases | base case |
| 2017 | base case; faster transition, even faster transition | base case |
| 2018 | Evolving Transition (ET); Faster Transition, Even Faster Transition, renewables push and others | ET, with bp's caveat |
| 2019 | Evolving transition (ET), Rapid transition (RT); Less globalization, More energy, Delayed transition | ET, with bp's caveat |
| 2020 | Rapid, Net Zero, Business-as-usual | none |
| 2022 | Accelerated, Net Zero, New Momentum | none |
| 2023 | Accelerated, Net Zero, New Momentum | none |
| 2024 | Current Trajectory, Net Zero | none |
| 2025 | Current Trajectory, Below 2° | none |

From 2020 every row is `claim_type: scenario`, `main_scenario: false`. Business-as-usual, New Momentum and Current Trajectory rows carry `current_trajectory_scenario: true`: bp describes each as the path the energy system is currently on, but never as a forecast.

## Editions

| Edition | Published | Status | Entries | Oil | Renewables share | Electric cars | Notes |
|---|---|---|---|---|---|---|---|
| 2011 | 2011-01-19 | partial | 3 | liquids 2030 (text) | power share only | qualitative | No tables. |
| 2012 | 2012-01-18 | partial | 3 | liquids 2030 (text) | electricity share only | plug-in 8% of sales 2030 | No tables. |
| 2013 | 2013-01-16 | partial | 3 | liquids 2030 (text) | 6% in 2030 (text) | none | No tables. |
| 2014 | 2014-01-15 | partial | 9 | liquids 2035 (text) | table 2015-2035 + text 7% | plug-in 7% of sales 2035 | Table rows and 2012 base year from the .xls (#71). |
| 2015 | 2015-02-17 | partial | 8 | liquids 2035 (text, p. 30) | table 2015-2035 + text 8% | none | Table rows and 2013 base year from the .xls; corrected in place (#71, see Open problems). |
| 2016 | 2016-02-10 | partial | 6 | liquids 2035 (text) | table + text 9% | none | |
| 2017 | 2017-01-25 | complete | 11 | liquids 2035 (text), oil 2035 (table) | table + text 10%, FT 16%, EFT 23% | 100 million by 2035 | |
| 2018 | 2018-02-20 | complete | 15 | liquids 2040 (text), oil 2020-2040 (table) | ET 2020-2040 (table) | ~190 million 2035, ~320 million 2040 | Summary tables from the NRGI mirror (#15); ET only. |
| 2019 | 2019-02-14 | complete | 24 | ET and RT, 2020-2040 (table) | ET and RT (table) | ~350 million EVs 2040 | |
| 2020 | 2020-09-14 | complete | 40 | 3 scenarios, 2025-2050 | 3 scenarios | EV share of car stock 2050 | No count of EVs in text. |
| 2022 | 2022-03-14 | complete | 40 | 3 scenarios, 2025-2050 | 3 scenarios, 2025-2050 | ~2 billion 2050 (Acc./NZ) | 2050 from data at a glance, 2025-2045 from the summary tables (#15). |
| 2023 | 2023-01-30 | complete | 39 | 3 scenarios, 2025-2050 | 3 scenarios | range only | |
| 2024 | 2024-07-10 | partial | 26 | 2 scenarios, 2025-2050 | 2 scenarios | not extracted | PDF text layer has no word spaces. |
| 2025 | 2025-09-25 | complete | 31 | 2 scenarios, 2025-2050 | 2 scenarios | 480 million 2035, 1.4 billion 2050 (CT) | |

Every edition file with a table also has `base_year` rows (bp's own historical value for the edition's last actual year). These are not projections and must not be graded.

Actuals: `realized.json`. Built by `scripts/bp-energy-outlook/realized.py`.

## Subjects and label changes (Revisions)

- **Oil.** 2011 to 2018 text gives "liquids" (oil, biofuels and other liquids). The summary tables from 2019 give "Oil" in Mb/d. The 2017 World table gives oil excluding biofuels (106 Mb/d in 2035) next to text liquids (110 Mb/d). Record liquids vs oil as a `Revision` (renamed), not noise.
- **Renewables.** bp's "renewables" always excludes hydro. 2013 to 2017: "renewables (including biofuels)". 2019 and 2020: the "Renewables" table (wind, solar, geothermal, biomass, biofuels). From 2022: "Renewables (incl. bioenergy)". The 2023+ base-year share (about 11-12%) is much higher than the 2019-2020 base-year share (about 4-5%), so the definition widened (it now includes bioenergy, likely including traditional biomass). Record as a `Revision` (renamed).
- **Renewables share rows from tables are derived** (`derived: true`): renewables / total primary energy. bp prints the share only in text.
- **Electric cars.** Metric changes: plug-in share of sales (2012, 2014), electric cars on the road (2017, 2018), all EVs (2019, 2022), share of passenger car stock (2020), passenger cars and trucks (2025).

## Open problems

- 2018 and 2022 tables: retrieved on 2026-10-02 (#15); see Data tables above. The 2018 file is a third-party copy, as archive.org has none.
- Source oddity: bp's 2022 summary tables as captured on 2022-04-03 carry a 'Renewables - EJ' sheet with the 2020 edition's scenarios (Rapid, Net Zero, Business-as-usual) and base year (2018); the file captured on 2023-01-28 has the 2022 scenarios and matches 'data at a glance' (2050 shares 55.6, 64.0, 32.6). The oil sheets of the two captures are identical.
- 2015 table rows (#71): the five derived renewables-share rows in `2015.json` (2015 to 2035) were first read from the archive.org .xlsx at the 2015 path, which is the January 2014 workbook, so they equalled the 2014 rows (3.0, 4.0, 5.0, 6.1, 7.0). They were corrected in place from bp's 2015 workbook (the .xls) to 3.1, 4.2, 5.4, 6.5, 7.5, keeping their natural keys and ids (bp-energy-outlook-2015-002 to -006); each row's note records the first value. The 2013 base year (2.7) was appended. The #53 audit records for 2015-002 (contest) and 2015-003 (confirm) refer to the first values and need a D24 re-check. This also explains the old '2015 text 8% vs table 7%' oddity: the 2015 .xls gives 7.5% for 2035.
- 2024 report PDF: the text layer has no spaces, so per-scenario EV counts were not extracted.
- Renewables share basis (#53 audit, #66): bp's own history matches the EI series excluding hydro within 0.1 point in EO2018 (2016: 3.78 vs 3.84), EO2019 and EO2020 (2017: 4.2 vs 4.30; 2018: 4.7 vs 4.72), but sits 0.14 to 0.18 points below it in EO2014 to EO2017 (EO2014, 2012: 2.36 vs 2.54, stored as a base-year row; EO2015, 2013: 2.71 vs 2.85; EO2016, 2014: 3.00 vs 3.15; EO2017, 2015: 3.34 vs 3.51; from those editions' summary tables). The #53 audit attributed the 2012 figure to EO2015 because it read the stale .xlsx (#71). The grader keeps the EI actual and flags rows where that gap would change the verdict.
- Realized oil is in TWh, not Mb/d, and the EI series is the 2025 vintage (data to 2024). The EI 2026 downloads need an email-verified form or sit behind a bot check. See `realized.json` notes.
- Source oddity: 2015 text says renewables reach 8% of primary energy by 2035; the 2015 .xls gives 7.5% when computed as (renewables + biofuels) / total. The 7.0% stored earlier came from the 2014 workbook (#71).
