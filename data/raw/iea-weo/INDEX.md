# IEA World Energy Outlook: global solar PV and wind projections

Facts only: edition, scenario, technology, metric, target year, value, unit, source. Nothing here is graded.

## Verify-first answers

- **Public editions.** The IEA serves the full PDF of every edition from 2000 to 2025 free from `iea.blob.core.windows.net`, linked from `https://www.iea.org/reports/world-energy-outlook-<year>`. Exception: 2005, where the page links only the summary and the "Middle East and North Africa Insights" volume (which is the full 2005 edition). Editions 1993 to 1999 are out of scope (task scope 2000 to 2025). A secondary analysis reports that editions before 2001 made no quantified solar projection.
- **Scenario tables.** Annex A of each edition has a World table with electricity generation (TWh) and installed capacity (GW) by source for the main scenario. Figures in this folder come from those annex tables, so `confidence` is `high`.
- **Main scenario by edition.** The main scenario changed name twice. The scenario name is recorded per entry.

| Editions | Main scenario (exact name) |
|---|---|
| 2000 to 2009 | Reference Scenario |
| 2010 to 2018 | New Policies Scenario |
| 2019 to 2024 | Stated Policies Scenario |
| 2025 | Current Policies Scenario and Stated Policies Scenario, side by side. Neither is named main. STEPS is marked `main_scenario: true` for continuity; CPS rows are `main_scenario: false`, `claim_type: scenario`. |

Other scenarios (Alternative Policy, 450, Current Policies before 2025, Sustainable Development, Announced Pledges, Net Zero) are not captured.

## Editions

| Edition | Status | Entries | Target years | Source | Notes |
|---|---|---|---|---|---|
| 2000 | partial | 1 | 2020 | WEO 2000 + WEO 2001 | Wind generation 178 TWh in 2020, a world figure stated in WEO 2001 about WEO 2000. WEO 2000 Table 3.9 has regional rows only, and solar is grouped as "Solar/Tide/Other". |
| 2001 | partial | 0 (2 quotes) | none | WEO 2001 | Insights edition. No new world figure. Qualitative solar quotes only. |
| 2002 | complete | 16 | 2010, 2020, 2030 | WEO 2002 annex | Row label "Solar" (PV not split from solar thermal). |
| 2003 | partial | 0 | none | WEO 2003 | World Energy Investment Outlook. No world solar or wind deployment figure found. |
| 2004 | complete | 16 | 2010, 2020, 2030 | WEO 2004 annex | "Solar" includes solar thermal. Chapter 7: over 80% of 2030 solar generation is PV. One quote. |
| 2005 | partial | 0 | none | WEO 2005 (MENA Insights) | Annex has "Other renewables" only. |
| 2006 | complete | 12 | 2015, 2030 | WEO 2006 annex | Row label "Solar". |
| 2007 | complete | 6 | 2015, 2030 | WEO 2007 annex | Generation only. The annex has no capacity table. Row label "Solar". |
| 2008 | complete | 20 | 2015 to 2030 | WEO 2008 annex | Row label "Solar". |
| 2009 | complete | 20 | 2015 to 2030 | WEO 2009 annex | Row label "Solar". |
| 2010 | complete | 24 | 2015 to 2035 | WEO 2010 annex | First New Policies Scenario. First "Solar PV" row label. One quote. |
| 2011 | complete | 24 | 2015 to 2035 | WEO 2011 annex | |
| 2012 | complete | 24 | 2015 to 2035 | WEO 2012 annex | |
| 2013 | complete | 20 | 2020 to 2035 | WEO 2013 annex | |
| 2014 | complete | 24 | 2020 to 2040 | WEO 2014 annex | |
| 2015 | complete | 24 | 2020 to 2040 | WEO 2015 annex | |
| 2016 | complete | 24 | 2020 to 2040 | WEO 2016 annex | |
| 2017 | complete | 20 | 2025 to 2040 | WEO 2017 annex | Base year 2016e. |
| 2018 | complete | 20 | 2025 to 2040 | WEO 2018 annex | Base year 2017e. |
| 2019 | complete | 20 | 2025 to 2040 | WEO 2019 annex | First Stated Policies Scenario. Layout text garbled; read with `pdftotext -raw`. |
| 2020 | complete | 16 | 2025, 2030, 2040 | WEO 2020 annex | |
| 2021 | complete | 16 | 2030 to 2050 | WEO 2021 annex | |
| 2022 | complete | 16 | 2030 to 2050 | WEO 2022 annex | |
| 2023 | complete | 20 | 2030 to 2050 | WEO 2023 annex | |
| 2024 | complete | 20 | 2030 to 2050 | WEO 2024 annex | |
| 2025 | complete | 28 | 2035 to 2050 | WEO 2025 annex | CPS and STEPS both captured. |

Every edition file also has `base_year` rows: the historical value the edition states for its base year. These are not projections and must not be graded.

Actuals: `realized.json` (Ember Yearly Electricity Data, World, 2000 to 2025, plus IEA-stated 2023 and 2024 values from WEO 2025).

## Subjects and label changes (Revisions)

- Solar: the annex row is "Solar" in 2002 to 2009 (in 2004 it explicitly includes solar thermal) and "Solar PV" from 2010. CSP is a separate row from 2010. This is a label change, to be recorded as a `Revision` (renamed), not noise.
- Wind: "Wind" in every edition. Onshore and offshore are not split in the world annex rows.
- Metric: all editions from 2002 give installed capacity (GW) and generation (TWh), except 2007 (generation only). No edition's annex gives annual capacity additions for the world; the task's "capacity additions" metric is therefore not captured.

## Secondary analyses checked

- "Photovoltaic growth: reality versus projections of the International Energy Agency – with 2018 update", Zenmo (author Auke Hoekstra), 2019-01-04, read through the Wayback Machine (the live page is a JavaScript app with no text). Its cumulative table matches the annex capacity values for WEO 2002, 2004, 2008 to 2016.
- "Paving the way towards a sustainable future or lagging behind? An ex-post analysis of the International Energy Agency's World Energy Outlook", Renewable and Sustainable Energy Reviews, 2025, doi:10.1016/j.rser.2025.115371. Paywalled (HTTP 403). Not used for figures. Known through a pv magazine summary (2025-04-11).
- The Metayer, Breyer and Fell EU PVSEC 2015 paper was found (ResearchGate, LUT portal) but not read. The primary annexes made it unnecessary.

## Open problems and source issues

- **Secondary table errors.** The Zenmo table gives WEO 2006 solar as 30 GW (2015) and 142 GW (2030). In the WEO 2006 annex these are generation in TWh; capacity is 20 GW and 87 GW. Its WEO 2007 column repeats 30 and 142, although the post says WEO 2007 has no GW figures. Its second column headed "2016" (WEO 2017, per the text) gives 807 GW (2025), 1,027 GW (2030) and 1,416 GW (2040); the WEO 2017 annex gives 939, 1,295 and 2,067 GW. Its first row per column (for example 137 GW in 2013 under WEO 2014) is an actual, not the edition's base year.
- **Capacity basis.** IEA-stated solar PV capacity for 2024 is 2,164 GW (WEO 2025); Ember gives 1,880 GW. The cause (DC versus AC, or a different source) is not confirmed. Grade against the IEA's own later historical values or state the basis.
- **"Solar" 2002 to 2009.** Whether "Solar" includes CSP is stated only for 2004 (it does). For the other editions it is unknown.
- **2000 and 2001.** No world solar projection. Summing regional rows in WEO 2000 Table 3.9 was not done (no interpolation).
- **2003 and 2005.** No world solar or wind deployment figure found by text search. A table printed as an image would not be found this way; not checked page by page.
- **Publication dates.** Recorded to the month only; exact days not verified, except 2025 (2025-11-12).
