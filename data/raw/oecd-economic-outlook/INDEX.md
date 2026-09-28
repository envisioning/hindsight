# OECD Economic Outlook: real GDP growth forecasts

Publisher: Organisation for Economic Co-operation and Development (OECD), Economics Department. Series: OECD Economic Outlook (EO), two editions a year (May/June and November/December), numbered (EO119 = June 2026).
Facts only: economy, target year, forecast value, source. Nothing here is graded and no errors are computed.

## Scope

- Metric: real GDP growth, annual percent change (EO variable `GDPV_ANNPCT`, "Gross domestic product, volume, growth"; Annex Table 1 "Real GDP" in the printed statistical annex).
- Economies (9): OECD total, United States, Euro area, Japan, Germany, United Kingdom, China, India, Brazil.
- Per edition: forecast for the current year (`horizon: current_year`, the publication year) and the next year (`horizon: next_year`). 18 entries per full edition. November/December editions also project a third year; it is not captured, to match `imf-weo`.
- Editions captured: 24 of the 73 editions from EO47 (June 1990) to EO119 (June 2026). EO94, EO95, EO98 to EO119. The other 49 are recorded as missing below.
- Edition ids are `YYYY-MM` with the real publication month (from the OECD edition title, for example "Economic Outlook No 112 - November 2022").

## Verify-first answers (issue #10)

- **Are past vintages downloadable?** Only recent ones, directly from the OECD. OECD Data Explorer (SDMX API, https://sdmx.oecd.org/public/rest/dataflow/all) lists one archived dataflow per edition only for EO114 to EO118 (`OECD.ECO.MAD:DSD_EO_114@DF_EO_114` ... `DSD_EO_118@DF_EO_118`) plus the current EO119 (`DSD_EO@DF_EO`). `DSD_EO_113` and older return HTTP 404 (checked 2026-09-28).
- **Older vintages.** The retired OECD.Stat held one dataset `EO` that each edition replaced. DBnomics mirrored that dataset into a public git repository, one commit per update, from April 2018 (EO102) to May 2024 (EO115): https://git.nomics.world/dbnomics-json-data/oecd-json-data (folder `EO/`). Each commit's `dataset.json` names the edition, so each commit is one vintage. For EO114 and EO115 the mirror and the OECD SDMX archive agree to all printed decimals (checked for OECD, USA, EA17, IND, CHN).
- **Before EO102.** No OECD vintage database was found. oecd.org and the OECD iLibrary return HTTP 403 to curl and WebFetch. The Internet Archive holds some annex files that oecd.org overwrote each edition: `Demand-and-Output.xls` (captures for EO94, EO95, EO98) and statistical annex PDFs for EO99, EO100 and EO101. These give six more editions.
- **Real-time data for outturns (not forecasts):** Federal Reserve Bank of Dallas, "Real-time historical dataset for the OECD" (https://www.dallasfed.org/research/international/oecd), and the OECD Main Economic Indicators Original Release Data and Revisions Database. Not used here.
- **OECD forecast evaluations (comparison, not used for grading):** L. Vogel (2007), "How do the OECD Growth Projections for the G7 Economies Perform? A Post-Mortem", OECD Economics Department Working Papers No. 573, https://www.oecd.org/content/dam/oecd/en/publications/reports/2007/09/how-do-the-oecd-growth-projections-for-the-g7-economies-perform_g17a19b8/111804483765.pdf (G7, 1991 to 2006). N. Pain et al. (2014), "OECD Forecasts During and After the Financial Crisis: A Post Mortem", OECD Economics Department Working Papers No. 1107, https://www.oecd.org/content/dam/oecd/en/publications/reports/2014/03/oecd-forecasts-during-and-after-the-financial-crisis_g17a246c/5jz73l1qw1s1-en.pdf . These report errors, not the vintage values, so they cannot fill the missing editions.

## Files and vintages used

1. **EO114 to EO119 (6 editions).** OECD SDMX API, `https://sdmx.oecd.org/public/rest/data/OECD.ECO.MAD,DSD_EO_NNN@DF_EO_NNN,/OECD+USA+EA17+JPN+DEU+GBR+CHN+IND+BRA.GDPV_ANNPCT.A?startPeriod=1990&format=csvfilewithlabels` (EO119: `DSD_EO@DF_EO`). Retrieved 2026-09-28. Codes: `OECD` = OECD total, `EA17` = "Euro area (17 countries)".
2. **EO102 to EO113 (12 editions).** DBnomics git mirror of OECD.Stat `EO`, variable `GDPV_ANNPCT`. The first commit that names each edition is used; the last commit for the same edition holds the same values (differences only in float representation). Commit ids are in each edition's `sources` and in `scripts/oecd-economic-outlook/fetch.py`. Codes: `OTO` = OECD total; euro area `EA16` ("Euro area (16 countries)") in EO102 and EO103, `EA17` from EO104.
3. **EO94, EO95, EO98 (3 editions).** Internet Archive captures of http://www.oecd.org/eco/outlook/Demand-and-Output.xls (20140407105600, 20140823025542, 20160313203848), sheet `RealGDP`. EO94 and EO95 name their vintage in the sheet. The EO98 sheet has an empty source line; it is identified as EO98 by file metadata (created and saved 2015-11-05), its last annual column (2017) and its layout. Confidence `medium` for all three (see Open problems).
4. **EO99, EO100, EO101 (3 editions).** Internet Archive copies of the statistical annex PDFs, Annex Table 1 "Real GDP". The PDF text layer has no usable digits, so the values were read from a rendered page image (1 decimal as printed) and checked against a second, zoomed rendering. Confidence `medium`.

## realized.json

Latest values for 1990 to 2025 for the 9 economies, from EO119 (June 2026, SDMX `DSD_EO@DF_EO`, retrieved 2026-09-28). 312 rows. 2026 onward excluded (projections). 2025 values carry confidence `medium`. Aggregates use the EO119 composition. India is on a fiscal-year basis.

## Editions

| Edition | Published | Vintage | Source | Entries | Status | Gaps |
|---|---|---|---|---|---|---|
| (EO47, 1990 H1) | 1990 | EO47 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO48, 1990 H2) | 1990 | EO48 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO49, 1991 H1) | 1991 | EO49 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO50, 1991 H2) | 1991 | EO50 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO51, 1992 H1) | 1992 | EO51 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO52, 1992 H2) | 1992 | EO52 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO53, 1993 H1) | 1993 | EO53 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO54, 1993 H2) | 1993 | EO54 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO55, 1994 H1) | 1994 | EO55 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO56, 1994 H2) | 1994 | EO56 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO57, 1995 H1) | 1995 | EO57 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO58, 1995 H2) | 1995 | EO58 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO59, 1996 H1) | 1996 | EO59 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO60, 1996 H2) | 1996 | EO60 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO61, 1997 H1) | 1997 | EO61 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO62, 1997 H2) | 1997 | EO62 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO63, 1998 H1) | 1998 | EO63 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO64, 1998 H2) | 1998 | EO64 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO65, 1999 H1) | 1999 | EO65 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO66, 1999 H2) | 1999 | EO66 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO67, 2000 H1) | 2000 | EO67 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO68, 2000 H2) | 2000 | EO68 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO69, 2001 H1) | 2001 | EO69 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO70, 2001 H2) | 2001 | EO70 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO71, 2002 H1) | 2002 | EO71 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO72, 2002 H2) | 2002 | EO72 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO73, 2003 H1) | 2003 | EO73 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO74, 2003 H2) | 2003 | EO74 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO75, 2004 H1) | 2004 | EO75 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO76, 2004 H2) | 2004 | EO76 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO77, 2005 H1) | 2005 | EO77 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO78, 2005 H2) | 2005 | EO78 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO79, 2006 H1) | 2006 | EO79 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO80, 2006 H2) | 2006 | EO80 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO81, 2007 H1) | 2007 | EO81 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO82, 2007 H2) | 2007 | EO82 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO83, 2008 H1) | 2008 | EO83 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO84, 2008 H2) | 2008 | EO84 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO85, 2009 H1) | 2009 | EO85 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO86, 2009 H2) | 2009 | EO86 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO87, 2010 H1) | 2010 | EO87 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO88, 2010 H2) | 2010 | EO88 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO89, 2011 H1) | 2011 | EO89 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO90, 2011 H2) | 2011 | EO90 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO91, 2012 H1) | 2012 | EO91 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO92, 2012 H2) | 2012 | EO92 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO93, 2013 H1) | 2013 | EO93 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| 2013-11 | 2013-11 | EO94 | annex XLS (Wayback) | 12 | partial | not in source: China 2013, China 2014, India 2013, India 2014, Brazil 2013, Brazil 2014 |
| 2014-05 | 2014-05 | EO95 | annex XLS (Wayback) | 12 | partial | not in source: China 2014, China 2015, India 2014, India 2015, Brazil 2014, Brazil 2015 |
| (EO96, 2014 H2) | 2014 | EO96 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| (EO97, 2015 H1) | 2015 | EO97 | none found | 0 | missing | no machine-readable or archived copy of this vintage was found (see Open problems) |
| 2015-11 | 2015-11 | EO98 | annex XLS (Wayback) | 18 | complete |  |
| 2016-06 | 2016-06 | EO99 | annex PDF (transcribed) | 18 | complete |  |
| 2016-11 | 2016-11 | EO100 | annex PDF (transcribed) | 18 | complete |  |
| 2017-06 | 2017-06 | EO101 | annex PDF (transcribed) | 18 | complete |  |
| 2017-11 | 2017-11 | EO102 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2018-05 | 2018-05 | EO103 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2018-11 | 2018-11 | EO104 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2019-05 | 2019-05 | EO105 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2019-11 | 2019-11 | EO106 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2020-06 | 2020-06 | EO107 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2020-12 | 2020-12 | EO108 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2021-05 | 2021-05 | EO109 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2021-12 | 2021-12 | EO110 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2022-06 | 2022-06 | EO111 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2022-11 | 2022-11 | EO112 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2023-06 | 2023-06 | EO113 | DBnomics mirror of OECD.Stat EO | 18 | complete |  |
| 2023-11 | 2023-11 | EO114 | SDMX DF_EO_114 | 18 | complete |  |
| 2024-05 | 2024-05 | EO115 | SDMX DF_EO_115 | 18 | complete |  |
| 2024-12 | 2024-12 | EO116 | SDMX DF_EO_116 | 18 | complete |  |
| 2025-06 | 2025-06 | EO117 | SDMX DF_EO_117 | 18 | complete |  |
| 2025-12 | 2025-12 | EO118 | SDMX DF_EO_118 | 18 | complete |  |
| 2026-06 | 2026-06 | EO119 | SDMX DF_EO | 18 | complete |  |

Status `complete` means every value in scope was extracted. `partial` means the source holds only some economies (EO94 and EO95: the annex Table 1 of that time covered OECD members only; China, India and Brazil were in a separate table that was not archived with the workbook). `missing` means no copy of that vintage was found; nothing is interpolated.

## Open problems and source anomalies

- **Missing editions EO47 (1990) to EO93 (June 2013), EO96 (November 2014) and EO97 (June 2015).** No OECD vintage database covers them. The printed Economic Outlook volumes hold Annex Table 1 for each edition, but oecd.org and the OECD iLibrary block automated access (HTTP 403), and no archived copy was found in the Internet Archive listings checked (`oecd.org/eco/outlook/`, `oecd.org/economy/outlook/`). The OECD Economics Department built its own vintage files for the evaluations above; they are not public. Next step: a person downloads the EO PDFs from the OECD iLibrary and reads Annex Table 1, or asks the OECD Economics Department for the historical projections file.
- **EO94 and EO95 annex figures are working-day adjusted.** The sheet says these numbers "may differ from the basis used for official projections" (mainly affects Germany and Japan). Stored as published in the annex, with a note on each entry.
- **EO98 identification is by inference** (empty source line). See Files, item 3.
- **EO107 (June 2020)** had two equally weighted scenarios. The OECD.Stat dataset (and so this capture) holds the double-hit scenario only. The single-hit scenario is not captured.
- **EO119 (June 2026)** also published a "prolonged disruption" scenario; the database holds the baseline ("time-limited disruption") only.
- **India** is on a fiscal-year basis (April to March) in all OECD tables; the target year is the fiscal year starting in that calendar year.
- **Euro area** in the OECD database is the euro area countries that are OECD members (EA16, later EA17), not the full euro area of the ECB or Eurostat. The composition changes over time.
- Values from databases are unrounded; stored rounded to 3 decimals. Published tables show 1 decimal.
- No short quotes are stored: the sources are data tables, not prose.
