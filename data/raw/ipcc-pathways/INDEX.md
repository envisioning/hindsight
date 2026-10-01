# IPCC emission scenarios and pathways: collected editions

Claim type `scenario` (D6): graded on coverage (which pathway did observed emissions follow), never hit or miss. Facts only: scenario, premise, published value per metric and target year, source. Nothing here is graded.

## Verified before extraction

- **First edition: 1990 (SA90).** The IPCC First Assessment Report (1990) used four emission scenarios from the Response Strategies Working Group (WG III): Business-as-Usual (Scenario A), B, C and D. Described in FAR WG I Appendix 1 and the FAR WG I Annex; their emissions are printed only as figures (FAR WG I Annex Figure A.2), not as tables.
- **Every scenario set up to 2026:**
  - 1990: SA90 (FAR). Publicly readable at ipcc.ch (FAR WG I, scanned PDF).
  - 1992: IS92a-f, "Emissions Scenarios for the IPCC: an Update", Section A3 of the 1992 Supplementary Report to the IPCC Scientific Assessment. Readable at ipcc.ch (scanned PDF with OCR). Re-used in the 1994 special report and the Second Assessment Report (SAR, 1995); no new set in 1995.
  - 2000: SRES (Special Report on Emissions Scenarios, March 2000): four families (A1, A2, B1, B2), 40 scenarios, six illustrative (marker) scenarios A1B, A1FI, A1T, A2, B1, B2. Readable at ipcc.ch (full report PDF, Appendix VII statistical tables). Used in TAR (2001) and AR4 (2007); no new set in 2001 or 2007. TAR WG I Appendix II (2001) tabulates SRES and IS92a emissions and the projected concentrations.
  - 2013: RCP2.6, RCP4.5, RCP6.0, RCP8.5 (Representative Concentration Pathways), adopted for AR5 WG I (2013), AR5 WG III and the Synthesis Report (2014). The pathways were released by the RCP Concentration Calculation & Data Group in 2009-2010 and published in Climatic Change in 2011; the IPCC did not author them. AR5 WG I Annex II tabulates them (decadal values). Yearly values: RCP data files (PIK mirror of the RCP database, CMIP5 recommendation), readable without login. The IIASA RCP database itself needs a web session.
  - 2021: SSP1-1.9, SSP1-2.6, SSP2-4.5, SSP3-7.0, SSP5-8.5, the five illustrative SSP-RCP scenarios of AR6 WG I (August 2021). Underlying CMIP6 ScenarioMIP data: harmonised emissions (Gidden et al. 2019, IIASA SSP database) and concentrations (Meinshausen et al. 2020). AR6 WG I Annex III gives concentrations from 2020 in decadal steps; it gives no emission table. Emissions are read from the RCMIP protocol files (a public compilation of the CMIP6 input data). The IIASA SSP database needs a web session; Zenodo blocked this machine (HTTP 403).
- **Edition id.** The year the IPCC published or adopted the set: 1990, 1992, 2000, 2013, 2021. For RCPs and SSPs the underlying data were published earlier (2009-2011, 2016-2020); see each file's `notes`.
- **Not in scope, no values in 2000-2025.** AR5 WG III (2014) and SR1.5 (2018) scenario databases, and the AR6 WG III (2022) scenario database (categories C1-C8, Illustrative Mitigation Pathways): their published summary values are for 2030 and later, and they are scenario ensembles, not named pathways. Not captured. Open problem below.
- **Windows.** Target years asked: 2000, 2005, 2010, 2015, 2020, 2025. Each set prints only some of them: IS92 2000 and 2025; SRES 2000, 2010, 2020 (decadal); RCP yearly; SSP emissions 2015 and 2020 (then 2030), concentrations yearly. Years a set does not print are absent, never interpolated.
- **Base years.** A value at or before a set's harmonisation year is flagged `base_year: true` (RCP 2005, SSP 2015). Years before that are history, not pathway, and are not captured. IS92 2000 and SRES 2000 values are projections (the sets started in 1990) and are not flagged.

## Fields

Per entry: `kind` (`scenario`: the premise, with `quote`; `pathway`: one published value), `scenario`, `family`, `subject`, `metric`, `value`, `unit`, `target_year`, `source_url`, `position` (table or section), `confidence`, `note`. Optional: `base_year: true` (harmonised starting value, history rather than projection), `published_in` (value printed by a later IPCC report than the edition, for example TAR 2001 restating SRES or IS92a), `quote` on range entries.

Subjects: `global CO2 emissions from fossil fuels and industry`, `global total CO2 emissions` (fossil plus land use), `global CH4 emissions`, `atmospheric CO2 concentration`, and `global greenhouse gas emissions pathway` for premises. The exact definition is in each `metric`; units differ by edition (GtC/yr in 1992-2013, Mt CO2/yr in 2021; 1 GtC = 3.664 Gt CO2). CO2 emissions are fossil fuels and industry unless the metric says total. IS92a CH4 "total" includes 155 Tg natural emissions; the other sets are anthropogenic.

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| 1990 | SA90: Business-as-Usual (A), B, C, D (FAR) | 1990 | partial | 4 | https://www.ipcc.ch/site/assets/uploads/2018/03/ipcc_far_wg_I_app_01.pdf |
| 1992 | IS92a-f, Emissions Scenarios for the IPCC: an Update (1992 Supplementary Report) | 1992 | partial | 19 | https://www.ipcc.ch/site/assets/uploads/2018/05/ipcc_wg_I_1992_suppl_report_full_report.pdf |
| 2000 | Special Report on Emissions Scenarios (SRES), six illustrative scenarios | 2000-03 | complete | 78 | https://www.ipcc.ch/site/assets/uploads/2018/03/emissions_scenarios-1.pdf |
| 2013 | Representative Concentration Pathways, AR5 WG I | 2013-09 | complete | 64 | http://www.pik-potsdam.de/~mmalte/rcps/ (data), https://www.ipcc.ch/site/assets/uploads/2018/02/WG1AR5_SPM_FINAL.pdf (premises) |
| 2021 | SSP-RCP illustrative scenarios, AR6 WG I | 2021-08 | complete | 40 | https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Annex_III.pdf, RCMIP v5.1.0 (emissions) |

No missing editions between 1990 and 2026: 1995 (SAR), 2001 (TAR) and 2007 (AR4) used the sets above and published no new pathway set; WG III scenario databases (2014, 2018, 2022) are out of scope (see below).

Counts: 1990: 4 scenario. 1992: 6 scenario, 13 pathway (IS92a 6 from the 1992 tables, 2 ranges, 2 emissions and 3 concentrations restated by TAR). 2000: 6 scenario, 72 pathway (fossil CO2, total CO2, CH4 from SRES; CO2 concentration from TAR; 2000, 2010, 2020). 2013: 4 scenario, 60 pathway (fossil CO2, CH4, CO2 concentration; 2005 base to 2025). 2021: 5 scenario, 35 pathway (fossil CO2 and CH4 for 2015 base and 2020; CO2 concentration 2015, 2020, 2025).

## What could not be read, and why

- **SA90 values.** FAR WG I prints SA90 emissions and concentrations only as figures (Annex Figures A.2, A.3). No table found. The WG III 1990 report and the underlying Expert Group on Emissions Scenarios (1990) report were not checked. No values read off figures.
- **IS92b-f per-scenario values.** The 1992 report prints a global table only for IS92a; IS92b-f appear in figures. Captured as the published ranges (IS92a-b: 10.3-10.7 GtC fossil in 2025; IS92a-f: 7-14 GtC). The 1994 Radiative Forcing special report and SAR (1995) may tabulate IS92 per scenario; not checked.
- **IS92 concentrations.** Not in the 1992 report. IS92a concentrations as reported in SAR are taken from TAR Appendix II (column 'IS92a/SAR'), confidence medium. IS92b-f concentrations not captured.
- **SRES 2005, 2015, 2025; other 34 SRES scenarios.** SRES prints decades only. Only the six illustrative scenarios captured.
- **RCP database (IIASA) and SSP database (IIASA).** Both are web applications behind a session; not scripted. RCP values come from the RCP data files of the RCP Concentration Calculation & Data Group (PIK mirror), cross-checked against AR5 Annex II. SSP emissions come from the RCMIP protocol CSV (gitlab.com/rcmip), confidence medium.
- **Zenodo** (AR6 Annex III extended data, doi 10.5281/zenodo.5705391) returned HTTP 403 to this machine.
- **AR6 Annex III final layout.** `IPCC_AR6_WGI_AnnexIII.pdf` serves only 3 pages; the full annex was read from `IPCC_AR6_WGI_Annex_III.pdf`, which is the Final Government Distribution text. Its Table AIII.2 integer values (2020) agree with the CMIP6 input data to the ppm.
- **SSP emissions 2025.** The harmonised SSP emissions are given for 2015, 2020 and then every ten years; no 2025 value.

## Open problems

- **Edition ids for RCP and SSP.** Set to the IPCC report years (2013, 2021) as the issue frames them. The pathway data were released earlier (RCP: 2009-2011; SSP: 2016-2020). A grader judging what was known at publication should use the data-release dates in each file's notes: for example RCP values for 2010 were projections when released in 2009 but close to history by 2013.
- **Units differ by edition** (GtC vs Mt CO2; anthropogenic vs total CH4 in IS92a). Normalization must convert before comparing editions.
- **Base years.** RCP 2005 and SSP 2015 values are harmonised history (`base_year: true`) and should not be graded as pathway claims. IS92 and SRES 2000 values are projections from 1990 and can be graded.
- **TAR restatements.** SRES concentrations and IS92a 2010/2020 values were printed by TAR (2001), not by the edition itself (`published_in`). TAR's IS92a fossil CO2 in 2000 (7.1 GtC) differs from the 1992 table (7.0 energy + 0.2 cement).
- **Out of scope.** AR5 WG III (2014), SR1.5 (2018) and AR6 WG III (2022, C1-C8 categories and Illustrative Mitigation Pathways) scenario ensembles; extra ScenarioMIP scenarios (SSP4-3.4, SSP4-6.0, SSP5-3.4-OS); SA90 numeric values.
- **Mapping to Subjects/Revisions** not done. Candidate revision chain: IS92a (1992) -> SRES A1B/A2 (2000) -> RCP6.0/RCP8.5 (2013) -> SSP2-4.5/SSP3-7.0 (2021) as successive reference pathways.
- **Realized values** (Global Carbon Budget fossil CO2, NOAA CO2 and CH4) not captured here; needed for coverage grading.
