# BP Energy Outlook: oil demand, renewables share, electric cars

Facts only: edition, scenario, metric, target year, value, unit, source. Nothing here is graded.

## Verify-first answers

- **Editions.** Annual from January 2011 to 2020, then 2022, 2023, 2024, 2025. **No 2021 edition** (bp skipped from September 2020 to March 2022). The 2025 edition (25 September 2025) is the latest; no 2026 edition was found on 2026-09-28. bp's "Downloads and archive" page serves the report PDF of every edition. 14 editions in total.
- **Title changes.** 2011 to 2013 "BP Energy Outlook 2030"; 2014 and 2015 "BP Energy Outlook 2035"; from 2016 "BP Energy Outlook <year> edition". Horizon 2030 (2011-2013), 2035 (2014-2017), 2040 (2018-2019), 2050 (2020 on).
- **Base case to scenarios.** 2011 to 2017: a single base case, which bp calls the "most likely" path, plus alternative cases. **2018: first scenario-based edition** (Evolving Transition plus alternatives). bp still describes results with reference to ET but says this "does not imply that the probability of this scenario is higher than the others". **2020: no central scenario** (Rapid, Net Zero, Business-as-usual).
- **Data tables.** bp now serves only the 2025 xlsx files. Older summary tables come from archive.org. Available: 2015, 2016, 2017, 2019, 2020, 2023, 2024, 2025 (parsed); 2014 (.xls, not parsed); 2022 "data at a glance" (2050 only). 2018 data pack and 2022 summary tables: archive.org failed 3 times. 2011 to 2013: no tables found; figures from report text.

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
| 2014 | 2014-01-15 | partial | 3 | liquids 2035 (text) | 7% in 2035 (text) | plug-in 7% of sales 2035 | .xls tables not parsed. |
| 2015 | 2015-02-17 | partial | 6 | missing | table 2015-2035 + text 8% | none | Liquids level not stated in text; table in Mtoe only. |
| 2016 | 2016-02-10 | partial | 6 | liquids 2035 (text) | table + text 9% | none | |
| 2017 | 2017-01-25 | complete | 11 | liquids 2035 (text), oil 2035 (table) | table + text 10%, FT 16%, EFT 23% | 100 million by 2035 | |
| 2018 | 2018-02-20 | partial | 3 | liquids 2040 (text) | missing | ~190 million 2035, ~320 million 2040 | Data pack not retrieved. |
| 2019 | 2019-02-14 | complete | 24 | ET and RT, 2020-2040 (table) | ET and RT (table) | ~350 million EVs 2040 | |
| 2020 | 2020-09-14 | complete | 40 | 3 scenarios, 2025-2050 | 3 scenarios | EV share of car stock 2050 | No count of EVs in text. |
| 2022 | 2022-03-14 | partial | 10 | 3 scenarios, 2050 only | 3 scenarios, 2050 only | ~2 billion 2050 (Acc./NZ) | Full tables not retrieved. |
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

- 2018 data pack and 2022 summary tables: archive.org CDX lookups failed 3 times ("Temporarily Offline"). Retry later to fill 2018 renewables and 2022 2030/2035 values.
- 2014 summary tables are old binary .xls. Parsing needs a reader that is not installed; no dependency was added.
- 2015 liquids demand level: not stated in the report text.
- 2024 report PDF: the text layer has no spaces, so per-scenario EV counts were not extracted.
- Realized oil is in TWh, not Mb/d, and the EI series is the 2025 vintage (data to 2024). The EI 2026 downloads need an email-verified form or sit behind a bot check. See `realized.json` notes.
- Source oddity: 2015 text says renewables reach 8% of primary energy by 2035, but the 2015 summary table gives about 7% when computed as (renewables + biofuels) / total.
