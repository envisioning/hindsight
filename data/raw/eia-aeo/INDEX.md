# US EIA Annual Energy Outlook (AEO): collected Reference case projections

Facts only: series, target year, projected value, unit, source. Values come from EIA's own AEO Retrospective publications, which tabulate past AEO Reference case projections next to realized values. Nothing here is graded. Realized values are in `realized.json`.

## Verify first (issue #13)

- **First edition.** The EIA AEO archive (https://www.eia.gov/outlooks/aeo/archive.php) lists 1979, 1982 to 1987, 1989 to 2023. AEO2025 and AEO2026 are on the current AEO pages. The 1979 item is outside every retrospective. The first edition with numbers here is AEO1982 (from the 2010 retrospective, which covers "AEO1982 through AEO2010").
- **No AEO1988.** The 2010 retrospective footnote: "There is no report titled Annual Energy Outlook 1988 due to a change in the naming convention". The edition after AEO1987 is AEO1989.
- **No AEO2024.** The archive has no 2024 entry, and the 2025 retrospective data file goes from edition 2023 to 2025. Not listed as missing, because it was not published.
- **Reference case labelling.** Not consistent. The 2010 retrospective cites "Mid-Price or Reference Case Projections, Various Editions" as its source, so early editions called the central case "Mid-Price" (the entries from that source say so in `case`). The 2022 and 2025 retrospectives use "Reference case" (data file `case_name` REFERENCE) for every edition they cover. The 2025 retrospective states that the Reference case assumes current laws and regulations stay unchanged and that expiring policies expire.
- **Edition = AEO year.** The `published` field holds the edition year. Exact release dates were not verified, except AEO2026 (2026-04-08, from the AEO home page).

## Sources

| Id | Publication | What it gives | URL |
|---|---|---|---|
| R2010 | AEO Retrospective Review 2010 | AEO1982 to AEO2010 Reference (Mid-Price) projections for target years 1985 to 2009, PDF tables | https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/ |
| R2022 | AEO Retrospective 2022 | AEO1994 to AEO2022 projections for target years 1993 to 2021 (solar and wind: AEO2007 on, from 2006), one XLSX with all tables | https://www.eia.gov/outlooks/aeo/retrospective/archive/2022/ |
| R2025 | AEO Retrospective 2025 (released March 2026, report dated February 2026) | Data file with AEO2005 to AEO2025, all cases, full projection horizon (to 2025 through 2050), plus actuals 1970 to 2024 pulled August 2025 | https://www.eia.gov/outlooks/aeo/retrospective/ (CSV: https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv) |

Rules applied to avoid duplicate rows:
- AEO1994 and later: R2022 for target years up to 2021. R2010 is used for these editions only for the natural gas wellhead price, which R2022 does not have.
- AEO1982 to AEO1993: R2010 only.
- AEO2005 to AEO2022: R2025 only for target years 2022 and later. AEO2023 and AEO2025: R2025 for all years. Only the REFERENCE case is taken from R2025.
- Spot check: R2022 and R2025 give the same numbers for overlapping cells (for example AEO2015 wind 2020: 231.53 billion kWh in both).

Confidence: `high` for values read from the XLSX and CSV cells. `medium` for R2010 values, which are read from PDF text by column position (spot-checked against the printed layout, including the sparse AEO1990 row).

## Series

| Key | EIA labels (by source) | Units | Editions |
|---|---|---|---|
| solar_generation | Solar net generation (all sectors) | billion kWh | AEO2007 on |
| wind_generation | Wind net generation (all sectors) | billion kWh | AEO2007 on |
| electricity_sales | R2010 "Total electricity sales"; R2022/R2025 "Total electricity sales excluding direct use" | billion kWh | all |
| total_energy_consumption | Total energy consumption (all sectors) | quadrillion Btu | all |
| transportation_energy_consumption | R2010 "Total transportation energy consumption"; R2022 "Total delivered transportation energy consumption" | quadrillion Btu | all |
| co2_emissions_energy | R2010 "Total carbon dioxide emissions"; R2022 "Total energy-related carbon dioxide emissions" | million metric tons CO2 | AEO1993 on (EIA: CO2 projections began in AEO93) |
| petroleum_liquids_consumption | R2010 "Total petroleum consumption"; R2022/R2025 "Total petroleum and other liquids consumption" | R2010 and R2025: million barrels per day; R2022: million barrels per year | all |
| crude_oil_price_nominal | R2010 "World oil prices" (IRAC); R2022 "Imported refiner acquisition cost of crude oil"; R2025 imported crude price | nominal USD per barrel | all |
| crude_oil_price_real | R2022: constant USD in each AEO's own dollar year (`dollar_year` field); R2025: 2012 USD | USD per barrel | AEO1994 on |
| natural_gas_wellhead_price_nominal | Natural gas wellhead prices | nominal USD per thousand cubic feet | AEO1982 to AEO2010 |
| natural_gas_price_electric_power_nominal / _real | Natural gas price, electric power sector | R2022: USD per million Btu (real in each AEO's dollar year); R2025: USD per thousand cubic feet (real in 2012 USD) | AEO1994 on |

Label changes, recorded as candidate `Revision`s, not noise:
- Oil price: "World oil prices" (R2010, which notes it is the imported refiners' acquisition cost) became "Imported refiner acquisition cost of crude oil" (R2022). The R2010 actuals and the R2022 actuals match (for example 1993: 16.14 USD per barrel), so the underlying series is the same.
- Natural gas price: the wellhead price was dropped. R2022 footnote: "As of 2013, the wellhead price of natural gas was no longer reported by EIA. With the 2015 edition of the Retrospective, the natural gas price to the electric power sector replaced the wellhead price."
- Petroleum: "Total petroleum consumption" became "Total petroleum and other liquids consumption". The unit also changed between retrospectives (per day, then per year, then per day).
- Electricity sales: "excluding direct use" was added.

## Editions

Key to series: solar, wind, elec_sales, total_energy, transport, co2, petroleum, oil_nom, oil_real, ng_wellhead, ng_elec_nom, ng_elec_real.

| Edition | Status | Entries | Target years | Sources | Series | Notes |
|---|---|---|---|---|---|---|
| 1979 | missing | 0 | - | - | - | Listed in the EIA archive (1979). No retrospective covers it. |
| 1982 | partial | 36 | 1985 to 1990 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1983 | partial | 42 | 1985 to 1995 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1984 | partial | 42 | 1985 to 1995 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1985 | partial | 62 | 1985 to 1995 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1986 | partial | 82 | 1986 to 2000 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1987 | partial | 60 | 1987 to 2000 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1989 | partial | 78 | 1988 to 2000 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1990 | partial | 30 | 1989 to 2005 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1991 | partial | 120 | 1990 to 2009 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1992 | partial | 114 | 1991 to 2009 | R2010 | oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1993 | partial | 126 | 1992 to 2009 | R2010 | co2, oil_nom, elec_sales, ng_wellhead, petroleum, total_energy, transport | |
| 1994 | partial | 179 | 1993 to 2010 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 1995 | partial | 169 | 1994 to 2010 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 1996 | partial | 204 | 1995 to 2015 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 1997 | partial | 194 | 1996 to 2015 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 1998 | partial | 229 | 1997 to 2020 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 1999 | partial | 219 | 1998 to 2020 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2000 | partial | 209 | 1999 to 2020 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2001 | partial | 199 | 2000 to 2020 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2002 | partial | 189 | 2001 to 2020 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2003 | partial | 188 | 2002 to 2021 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2004 | partial | 178 | 2003 to 2021 | R2022, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, total_energy, transport | |
| 2005 | partial | 212 | 2004 to 2025 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2006 | partial | 257 | 2005 to 2030 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2007 | partial | 279 | 2006 to 2030 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2008 | partial | 267 | 2007 to 2030 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2009 | partial | 255 | 2008 to 2030 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2010 | partial | 298 | 2009 to 2035 | R2022, R2025, R2010 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, ng_wellhead, petroleum, solar, total_energy, transport, wind | |
| 2011 | partial | 286 | 2010 to 2035 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2012 | partial | 330 | 2011 to 2040 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2013 | partial | 319 | 2012 to 2040 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2014 | partial | 308 | 2013 to 2040 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2015 | partial | 297 | 2014 to 2040 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2016 | partial | 286 | 2015 to 2040 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2017 | partial | 385 | 2016 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2018 | partial | 374 | 2017 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2019 | partial | 363 | 2018 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2020 | partial | 352 | 2019 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2021 | partial | 341 | 2020 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2022 | partial | 330 | 2021 to 2050 | R2022, R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2023 | partial | 319 | 2022 to 2050 | R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2025 | partial | 297 | 2024 to 2050 | R2025 | co2, oil_nom, oil_real, elec_sales, ng_elec_nom, ng_elec_real, petroleum, solar, total_energy, transport, wind | |
| 2026 | missing | 0 | - | - | - | Released 2026-04-08. No retrospective covers it yet. |

Every edition with data is `partial`: only the series that the retrospectives carry are captured, not the full AEO tables.

## Gaps (what could not be read and why)

- **Henry Hub natural gas price.** Not in any retrospective. R2010 has the wellhead price. R2022 and R2025 have the electric power sector price. Henry Hub would need each AEO edition's own price tables.
- **Gasoline consumption.** Not in any retrospective. Nearest series captured: total petroleum and other liquids consumption, and delivered transportation energy consumption.
- **Total electricity generation.** Not in any retrospective. Nearest series captured: electricity sales. R2022 and R2025 also carry coal, natural gas, nuclear and hydro generation, not captured here (out of scope).
- **Solar and wind capacity.** Not in any retrospective. Only generation.
- **Solar and wind before AEO2007.** R2022 starts these series at AEO2007. R2025 starts at AEO2005 but only for target years 2022 and later are used here.
- **1979 and AEO2026.** No retrospective covers them. AEO2026 values would have to come from the AEO2026 tables directly.
- **Retrospectives 2011 to 2020.** Not read. They cover the same editions as R2010 and R2022 with older actual data.
- **R2010 XLS files.** Not parsed (legacy binary Excel, no parser without a new package). The PDF versions were read instead.

## Things that look wrong or odd in the sources

- R2022 Tables 17 and 18 (solar, wind) store the year header as Excel date serials (38718 = 2006), not years. Converted.
- R2025 data file column `ECI_INDX_NA_NA_GDP_NA_NA_Y09EQ1D3Z` says "2009 = 1" in its name, but its value is 1.0 in 2012. The report states all monetary values are in 2012 dollars. The real-price columns are recorded as 2012 USD.
- R2025 electric power natural gas price is per thousand cubic feet. R2022 is per million Btu. The R2025 actuals are about 3 to 4 percent higher than the R2022 actuals, consistent with the unit difference.
- R2010 Table 4 unit line reads "nominal $billions per barrel". The values are dollars per barrel.
- R2022 Table 5 unit is "million barrels", and the actual values (for example 6291 in 1993) are annual totals. R2010 and R2025 use million barrels per day.
- R2022 Table 1 average absolute percentage difference for petroleum net imports (487%) and natural gas net imports (285%) is inflated by values near zero. EIA says so in a footnote.

## EIA's self-assessment (a comparison, not our grade)

These are EIA's own error statistics, copied as published. Hindsight has not graded anything.

#### AEO Retrospective 2022, Table 1 (AEO1994 to AEO2022 Reference cases vs. outcomes 1994 to 2021)

| Variable (EIA label) | Average absolute percentage difference (%) | Share of projections over-estimated (%) |
|---|---|---|
| Imported refiner acquisition cost of crude oil (constant dollars) (table 4a) | 45.6 | 32.8 |
| Imported refiner acquisition cost of crude oil (nominal dollars) (table 4b) | 44.6 | 35.6 |
| Total petroleum and other liquids consumption (table 5) | 10.5 | 72.5 |
| Crude oil production (table 6) | 19.4 | 31.6 |
| Natural gas price, electric power sector (constant dollars)2 (table 8a) | 46.9 | 57.8 |
| Natural gas price, electric power sector (nominal dollars)2 (table 8b) | 49.7 | 59.6 |
| Total electricity sales excluding direct use (table 16) | 7.4 | 70.5 |
| Solar net generation (all sectors), projected versus actual (table 17)5,6 | 46.2 | 19.9 |
| Wind net generation (all sectors), projected versus actual (table 18)5 | 29.4 | 16.2 |
| Total energy consumption (all sectors) (table 23) | 9.2 | 81.3 |
| Delivered transportation energy consumption (table 27) | 11.6 | 78.8 |
| Total energy-related carbon dioxide emissions (table 28) | 14.6 | 79.8 |

#### AEO Retrospective 2022, Table 2 (standard deviation of percentage projection errors, by years since first projection year H)

| Variable | H=0 | H=1 | H=3 | H=5 | H=10 | H=15 |
|---|---|---|---|---|---|---|
| Imported refiner acquisition cost of crude oil (constant $) (table 4a) | 4.6% | 20.6% | 44.0% | 61.7% | 80.8% | 51.5% |
| Imported refiner acquisition cost of crude oil (nominal $) (table 4b) | 4.6% | 21.3% | 45.0% | 62.6% | 80.6% | 50.0% |
| Total petroleum and other liquids consumption (table 5) | 0.9% | 3.2% | 4.9% | 7.4% | 12.0% | 8.6% |
| Crude oil production (table 6) | 1.7% | 6.3% | 14.2% | 16.0% | 21.2% | 21.3% |
| Natural gas price, electric power sector (constant $)2 (table 8a) | 5.4% | 21.5% | 40.1% | 53.0% | 66.0% | 49.3% |
| Natural gas price, electric power sector (nominal $)2 (table 8b) | 5.4% | 21.8% | 40.8% | 53.2% | 64.4% | 47.2% |
| Total electricity sales excluding direct use (table 16) | 0.8% | 1.6% | 3.1% | 4.6% | 8.6% | 12.3% |
| Solar net generation (all sectors), Projected versus actual (table 17)5,6 | 14.2% | 12.3% | 14.9% | 11.8% | 6.0% | NA |
| Wind net generation (all sectors), Projected versus actual (table 18)5 | 4.1% | 11.5% | 15.6% | 22.8% | 15.0% | NA |
| Total energy consumption (all sectors)  (table 23) | 0.9% | 2.3% | 3.5% | 5.0% | 8.0% | 8.1% |
| Delivered transportation energy consumption (table 27) | 1.7% | 3.7% | 4.3% | 6.0% | 11.1% | 11.7% |
| Total energy-related carbon dioxide emissions (table 28) | 1.9% | 3.2% | 4.9% | 7.2% | 12.2% | 16.0% |

Note from R2022 Table 2: standard deviations "are based on the percentage projection error, except for the price quantities, which are given as the log of the error".

#### AEO Retrospective Review 2010, Tables 1 and 2 (AEO1982 to AEO2010)

| Variable | Average absolute percent difference, all AEOs (AEO82 to AEO2010) | NEMS AEOs (AEO94 to AEO2010) | Share over-estimated, all AEOs | NEMS AEOs |
|---|---|---|---|---|
| World oil prices | 49.9 | 31.4 | 52% | 24% |
| Total petroleum consumption | 4.1 | 4.3 | 44% | 61% |
| Natural gas wellhead prices | 56.6 | 31.9 | 54% | 23% |
| Total electricity sales | 3.0 | 3.8 | 40% | 40% |
| Total energy consumption | 3.5 | 4.3 | 57% | 69% |
| Transportation energy consumption | 5.0 | 4.5 | 41% | 67% |
| Total carbon dioxide emissions | 4.7 | 4.9 | 51% | 56% |

Source: https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/pdf/tbl_1.pdf and tbl_2.pdf.

#### AEO Retrospective 2025 (qualitative only)

R2025 publishes no error table. It replaced the tables with charts and text. Its stated findings, in short:
- Total energy consumption: "Across AEO vintages, projected total energy consumption through 2030 exceeded realized consumption".
- Renewables: wind and solar generation grew faster than projected in the Reference case from the 2010s. EIA names tax credit extensions as one cause, because the Reference case lets expiring credits expire.
- Natural gas and coal prices were generally lower than projected. Oil production grew faster than projected.

Per-year average absolute percentage differences (R2022, the "Average absolute percentage difference" row of each table) are kept in the scratch extraction only, not in the repo.
