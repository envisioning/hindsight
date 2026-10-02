# OECD Economic Outlook: real GDP growth forecasts

Publisher: Organisation for Economic Co-operation and Development (OECD), Economics Department. Series: OECD Economic Outlook (EO), two editions a year (May/June and November/December), numbered (EO119 = June 2026).
Facts only: economy, target year, forecast value, source. Nothing here is graded and no errors are computed.

## Scope

- Metric: real GDP growth, annual percent change (EO variable `GDPV_ANNPCT`, "Gross domestic product, volume, growth"; Annex Table 1 "Real GDP" in the printed statistical annex).
- Economies (9): OECD total, United States, Euro area, Japan, Germany, United Kingdom, China, India, Brazil.
- Per edition: forecast for the current year (`horizon: current_year`, the publication year) and the next year (`horizon: next_year`). 18 entries per full edition. November/December editions also project a third year; it is not captured, to match `imf-weo`.
- Editions captured: all 73 editions from EO47 (June 1990) to EO119 (June 2026); none missing. Before EO86 the sources hold OECD members only (no China, India or Brazil), except EO82, EO91 and EO92 (country notes in the PDF). Before EO66 there is no euro area (the tables show the European Union), and EO60 to EO65 and EO68 hold only the summary table (OECD total, United States, Japan, Germany). EO47 to EO50 are on a GNP basis for the United States, Japan and Germany (western Germany), and EO51 for Japan and Germany: those rows are not captured, so EO47 to EO50 hold only the United Kingdom.
- Edition ids are `YYYY-MM` with the real publication month (from the OECD edition title, for example "Economic Outlook No 112 - November 2022").

## Verify-first answers (issue #10)

- **Are past vintages downloadable?** Only recent ones, directly from the OECD. OECD Data Explorer (SDMX API, https://sdmx.oecd.org/public/rest/dataflow/all) lists one archived dataflow per edition only for EO114 to EO118 (`OECD.ECO.MAD:DSD_EO_114@DF_EO_114` ... `DSD_EO_118@DF_EO_118`) plus the current EO119 (`DSD_EO@DF_EO`). `DSD_EO_113` and older return HTTP 404 (checked 2026-09-28).
- **Older vintages.** The retired OECD.Stat held one dataset `EO` that each edition replaced. DBnomics mirrored that dataset into a public git repository, one commit per update, from April 2018 (EO102) to May 2024 (EO115): https://git.nomics.world/dbnomics-json-data/oecd-json-data (folder `EO/`). Each commit's `dataset.json` names the edition, so each commit is one vintage. For EO114 and EO115 the mirror and the OECD SDMX archive agree to all printed decimals (checked for OECD, USA, EA17, IND, CHN).
- **Before EO102.** No OECD vintage database was found. Every Economic Outlook volume is on oecd.org as a PDF under `/content/dam/oecd/en/publications/reports/<year>/<month>/oecd-economic-outlook-volume-<year>-issue-<n>_<hash>/eco_outlook-v<year>-<n>-en.pdf`; the 20 editions no archived file covered were taken from those PDFs (Files, item 9). The OECD publication pages and the OECD iLibrary return HTTP 403 to curl and WebFetch; PDFs under oecd.org/content/dam download, but their paths carry a hash that is listed only on the blocked pages (two found by web search: EO63 and EO70). Earlier editions come from files oecd.org overwrote each edition and the Internet Archive kept: the annex workbook "Demand and output" (`/dataoecd/6/27/2483806.xls` 2002 to 2012, `/eco/outlook/Demand and Output.xls` and `Demand-and-Output.xls` 2013 to 2016), the "flash file" summary of projections (`/dataoecd/18/26/2713584.xls`, 2003 to 2011; `flash_eo93_nolinked.xls`), statistical annex PDFs (EO99 to EO101) and the summary table on the old EO pages (`/eco/out/eo.htm`, 1997 to 2001). The University of Goettingen library keeps the SourceOECD PDFs of EO63 to EO68 (https://webdoc.sub.gwdg.de/edoc/lm/ingenta/sourceoecd/). EconData sells "summary projections from previous editions" from EO49 (1991) in its dX database (https://econdata.com/databases/oecd/eol/); not public, not used.
- **Real-time data for outturns (not forecasts):** Federal Reserve Bank of Dallas, "Real-time historical dataset for the OECD" (https://www.dallasfed.org/research/international/oecd), and the OECD Main Economic Indicators Original Release Data and Revisions Database. Not used here.
- **OECD forecast evaluations (comparison, not used for grading):** L. Vogel (2007), "How do the OECD Growth Projections for the G7 Economies Perform? A Post-Mortem", OECD Economics Department Working Papers No. 573, https://www.oecd.org/content/dam/oecd/en/publications/reports/2007/09/how-do-the-oecd-growth-projections-for-the-g7-economies-perform_g17a19b8/111804483765.pdf (G7, 1991 to 2006). N. Pain et al. (2014), "OECD Forecasts During and After the Financial Crisis: A Post Mortem", OECD Economics Department Working Papers No. 1107, https://www.oecd.org/content/dam/oecd/en/publications/reports/2014/03/oecd-forecasts-during-and-after-the-financial-crisis_g17a246c/5jz73l1qw1s1-en.pdf . These report errors, not the vintage values, so they cannot fill the missing editions.

## Files and vintages used

1. **EO114 to EO119 (6 editions).** OECD SDMX API, `https://sdmx.oecd.org/public/rest/data/OECD.ECO.MAD,DSD_EO_NNN@DF_EO_NNN,/OECD+USA+EA17+JPN+DEU+GBR+CHN+IND+BRA.GDPV_ANNPCT.A?startPeriod=1990&format=csvfilewithlabels` (EO119: `DSD_EO@DF_EO`). Retrieved 2026-09-28. Codes: `OECD` = OECD total, `EA17` = "Euro area (17 countries)".
2. **EO102 to EO113 (12 editions).** DBnomics git mirror of OECD.Stat `EO`, variable `GDPV_ANNPCT`. The first commit that names each edition is used; the last commit for the same edition holds the same values (differences only in float representation). Commit ids are in each edition's `sources` and in `scripts/oecd-economic-outlook/fetch.py`. Codes: `OTO` = OECD total; euro area `EA16` ("Euro area (16 countries)") in EO102 and EO103, `EA17` from EO104.
3. **EO94, EO95, EO98 (3 editions).** Internet Archive captures of http://www.oecd.org/eco/outlook/Demand-and-Output.xls (20140407105600, 20140823025542, 20160313203848), sheet `RealGDP`. EO94 and EO95 name their vintage in the sheet. The EO98 sheet has an empty source line; it is identified as EO98 by file metadata (created and saved 2015-11-05), its last annual column (2017) and its layout. Confidence `medium` for all three (see Open problems).
4. **EO99, EO100, EO101 (3 editions).** Internet Archive copies of the statistical annex PDFs, Annex Table 1 "Real GDP". The PDF text layer has no usable digits, so the values were read from a rendered page image (1 decimal as printed) and checked against a second, zoomed rendering. Confidence `medium`.
5. **EO72, EO74 to EO80, EO85, EO87 to EO90, EO93, EO96, EO97 (16 editions).** Internet Archive captures of the annex workbook "Demand and output", sheet `RealGDP` (Annex Table 1. Real GDP), read with xlrd (`scripts/oecd-economic-outlook/vintages.py`, capture timestamps in the script). Years come from the sheet's own header row. From EO76 the sheet states "Source: OECD Economic Outlook NN database"; confidence `high`. EO72, EO74 and EO75 say only "Source: OECD." and are identified by file metadata and their year columns; EO74 and EO75 also match the dated flash file of the same edition to 0.004 points. Confidence `medium`. The flash files of EO74, EO75 and EO77 to EO80 agree with the annex values to 0.003 points (`vintages_check.json`).
6. **EO81, EO83, EO84, EO86 and EO93 (China, India, Brazil) (5 editions).** Internet Archive captures of the Economic Outlook "flash file" (summary of projections by country), variable "Gross domestic product - volume". Each names its edition in its title or sheet name. EO86 and EO93 hold values rounded to 1 decimal. EO86 is the first source with China, India and Brazil. Confidence `high`.
7. **EO63 to EO68 and EO70 (7 editions).** Text layer of the Economic Outlook PDFs: Annex Table 1 "Real GDP" where the PDF has the statistical annex (EO66, EO67, EO70), otherwise the "Summary of projections" table (EO63, EO64, EO65, EO68 preliminary edition). EO63 to EO68 from the library copy at the University of Goettingen; EO70 from oecd.org. 1 decimal as printed. Confidence `high`.
8. **EO60 and EO62 (2 editions).** The "Summary of projections" table on the OECD Economic Outlook page (http://www.oecd.org/eco/out/eo.htm): EO62 as an HTML table, EO60 as a table image (read from the image, confidence `medium`; the image capture is dated August 1997, but its half-year columns fit the December 1996 projection).
9. **EO47 to EO59, EO61, EO69, EO71, EO73, EO82, EO91, EO92 (20 editions).** The OECD PDF of each volume on oecd.org (`scripts/oecd-economic-outlook/pdfs.py` lists the URLs). The hash in each path came from Internet Archive captures of the OECD publication pages (their `og:url` names it), from the Internet Archive CDX index of `content/dam` (EO59, EO91, EO92), or from probing neighbouring hashes (the 1990s volumes are numbered in sequence, `g1g2e2ff` to `g1g2e316`). Tables used: the chapter table "Growth of real GNP/GDP" (EO47 to EO50) or "Growth of real GDP in major OECD countries and country groups" (EO51 to EO54), Annex Table 1 "Real GDP" (EO55 to EO59, EO69, EO71, EO73, EO82, EO91, EO92), the "Summary of projections" (EO61), and for EO82, EO91 and EO92 the "Macroeconomic indicators" tables of the China, India and Brazil country notes. EO47 to EO59 are scans: every value was read from the OCR text layer and again from a rendered page image (EO56 United States from two renderings: no digits in the text layer). EO61 onward have a native text layer; each row was read and then re-mapped to the header years by script. 1 decimal as printed. Confidence `high`, except EO51 OECD total and EO56 United States (`medium`). EO82, EO91 and EO92 annex values are working-day adjusted (the sheet says so, as in EO94 and EO95). Checked against the EO summary or Table 1.1 where both exist (EO59, EO91).

## realized.json

Latest values for 1990 to 2025 for the 9 economies, from EO119 (June 2026, SDMX `DSD_EO@DF_EO`, retrieved 2026-09-28). 312 rows. 2026 onward excluded (projections). 2025 values carry confidence `medium`. Aggregates use the EO119 composition. India is on a fiscal-year basis.

## Editions

| Edition | Published | Vintage | Source | Entries | Status | Gaps |
|---|---|---|---|---|---|---|
| 1990-06 | 1990-06 | EO47 | Table 22, EO PDF (oecd.org, scan) | 2 | partial | GNP rows not captured (see Open problems); not in source: OECD total 1990, OECD total 1991, United States 1990, United States 1991, Euro area 1990, Euro area 1991, Japan 1990, Japan 1991, Germany 1990, Germany 1991, China 1990, China 1991, India 1990, India 1991, Brazil 1990, Brazil 1991 |
| 1990-12 | 1990-12 | EO48 | Table 24, EO PDF (oecd.org, scan) | 2 | partial | GNP rows not captured (see Open problems); not in source: OECD total 1990, OECD total 1991, United States 1990, United States 1991, Euro area 1990, Euro area 1991, Japan 1990, Japan 1991, Germany 1990, Germany 1991, China 1990, China 1991, India 1990, India 1991, Brazil 1990, Brazil 1991 |
| 1991-07 | 1991-07 | EO49 | Table 21, EO PDF (oecd.org, scan) | 2 | partial | GNP rows not captured (see Open problems); not in source: OECD total 1991, OECD total 1992, United States 1991, United States 1992, Euro area 1991, Euro area 1992, Japan 1991, Japan 1992, Germany 1991, Germany 1992, China 1991, China 1992, India 1991, India 1992, Brazil 1991, Brazil 1992 |
| 1991-12 | 1991-12 | EO50 | Table 26, EO PDF (oecd.org, scan) | 2 | partial | GNP rows not captured (see Open problems); not in source: OECD total 1991, OECD total 1992, United States 1991, United States 1992, Euro area 1991, Euro area 1992, Japan 1991, Japan 1992, Germany 1991, Germany 1992, China 1991, China 1992, India 1991, India 1992, Brazil 1991, Brazil 1992 |
| 1992-06 | 1992-06 | EO51 | Table 25, EO PDF (oecd.org, scan) | 6 | partial | GNP rows not captured (see Open problems); not in source: Euro area 1992, Euro area 1993, Japan 1992, Japan 1993, Germany 1992, Germany 1993, China 1992, China 1993, India 1992, India 1993, Brazil 1992, Brazil 1993 |
| 1992-12 | 1992-12 | EO52 | Table 28, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1992, Euro area 1993, China 1992, China 1993, India 1992, India 1993, Brazil 1992, Brazil 1993 |
| 1993-06 | 1993-06 | EO53 | Table 32, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1993, Euro area 1994, China 1993, China 1994, India 1993, India 1994, Brazil 1993, Brazil 1994 |
| 1993-12 | 1993-12 | EO54 | Table A50, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1993, Euro area 1994, China 1993, China 1994, India 1993, India 1994, Brazil 1993, Brazil 1994 |
| 1994-06 | 1994-06 | EO55 | Annex Table 1, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1994, Euro area 1995, China 1994, China 1995, India 1994, India 1995, Brazil 1994, Brazil 1995 |
| 1994-12 | 1994-12 | EO56 | Annex Table 1, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1994, Euro area 1995, China 1994, China 1995, India 1994, India 1995, Brazil 1994, Brazil 1995 |
| 1995-06 | 1995-06 | EO57 | Annex Table 1, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1995, Euro area 1996, China 1995, China 1996, India 1995, India 1996, Brazil 1995, Brazil 1996 |
| 1995-12 | 1995-12 | EO58 | Annex Table 1, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1995, Euro area 1996, China 1995, China 1996, India 1995, India 1996, Brazil 1995, Brazil 1996 |
| 1996-06 | 1996-06 | EO59 | Annex Table 1, EO PDF (oecd.org, scan) | 10 | partial | not in source: Euro area 1996, Euro area 1997, China 1996, China 1997, India 1996, India 1997, Brazil 1996, Brazil 1997 |
| 1996-12 | 1996-12 | EO60 | summary table, EO web page (Wayback) | 8 | partial | not in source: Euro area 1996, Euro area 1997, United Kingdom 1996, United Kingdom 1997, China 1996, China 1997, India 1996, India 1997, Brazil 1996, Brazil 1997 |
| 1997-06 | 1997-06 | EO61 | summary table, EO PDF (oecd.org) | 8 | partial | not in source: Euro area 1997, Euro area 1998, United Kingdom 1997, United Kingdom 1998, China 1997, China 1998, India 1997, India 1998, Brazil 1997, Brazil 1998 |
| 1997-12 | 1997-12 | EO62 | summary table, EO web page (Wayback) | 8 | partial | not in source: Euro area 1997, Euro area 1998, United Kingdom 1997, United Kingdom 1998, China 1997, China 1998, India 1997, India 1998, Brazil 1997, Brazil 1998 |
| 1998-06 | 1998-06 | EO63 | summary table, EO PDF (library copy) | 8 | partial | not in source: Euro area 1998, Euro area 1999, United Kingdom 1998, United Kingdom 1999, China 1998, China 1999, India 1998, India 1999, Brazil 1998, Brazil 1999 |
| 1998-12 | 1998-12 | EO64 | summary table, EO PDF (library copy) | 8 | partial | not in source: Euro area 1998, Euro area 1999, United Kingdom 1998, United Kingdom 1999, China 1998, China 1999, India 1998, India 1999, Brazil 1998, Brazil 1999 |
| 1999-06 | 1999-06 | EO65 | summary table, EO PDF (library copy) | 8 | partial | not in source: Euro area 1999, Euro area 2000, United Kingdom 1999, United Kingdom 2000, China 1999, China 2000, India 1999, India 2000, Brazil 1999, Brazil 2000 |
| 1999-12 | 1999-12 | EO66 | Annex Table 1, EO PDF (library copy) | 12 | partial | not in source: China 1999, China 2000, India 1999, India 2000, Brazil 1999, Brazil 2000 |
| 2000-06 | 2000-06 | EO67 | Annex Table 1, EO PDF (library copy) | 12 | partial | not in source: China 2000, China 2001, India 2000, India 2001, Brazil 2000, Brazil 2001 |
| 2000-11 | 2000-11 | EO68 | summary table, EO PDF (library copy) | 8 | partial | not in source: Germany 2000, Germany 2001, United Kingdom 2000, United Kingdom 2001, China 2000, China 2001, India 2000, India 2001, Brazil 2000, Brazil 2001 |
| 2001-06 | 2001-06 | EO69 | Annex Table 1, EO PDF (oecd.org) | 12 | partial | not in source: China 2001, China 2002, India 2001, India 2002, Brazil 2001, Brazil 2002 |
| 2001-12 | 2001-12 | EO70 | Annex Table 1, EO PDF (oecd.org) | 12 | partial | not in source: China 2001, China 2002, India 2001, India 2002, Brazil 2001, Brazil 2002 |
| 2002-06 | 2002-06 | EO71 | Annex Table 1, EO PDF (oecd.org) | 12 | partial | not in source: China 2002, China 2003, India 2002, India 2003, Brazil 2002, Brazil 2003 |
| 2002-12 | 2002-12 | EO72 | annex XLS (Wayback) | 12 | partial | not in source: China 2002, China 2003, India 2002, India 2003, Brazil 2002, Brazil 2003 |
| 2003-06 | 2003-06 | EO73 | Annex Table 1, EO PDF (oecd.org) | 12 | partial | not in source: China 2003, China 2004, India 2003, India 2004, Brazil 2003, Brazil 2004 |
| 2003-12 | 2003-12 | EO74 | annex XLS (Wayback) | 12 | partial | not in source: China 2003, China 2004, India 2003, India 2004, Brazil 2003, Brazil 2004 |
| 2004-06 | 2004-06 | EO75 | annex XLS (Wayback) | 12 | partial | not in source: China 2004, China 2005, India 2004, India 2005, Brazil 2004, Brazil 2005 |
| 2004-12 | 2004-12 | EO76 | annex XLS (Wayback) | 12 | partial | not in source: China 2004, China 2005, India 2004, India 2005, Brazil 2004, Brazil 2005 |
| 2005-06 | 2005-06 | EO77 | annex XLS (Wayback) | 12 | partial | not in source: China 2005, China 2006, India 2005, India 2006, Brazil 2005, Brazil 2006 |
| 2005-11 | 2005-11 | EO78 | annex XLS (Wayback) | 12 | partial | not in source: China 2005, China 2006, India 2005, India 2006, Brazil 2005, Brazil 2006 |
| 2006-06 | 2006-06 | EO79 | annex XLS (Wayback) | 12 | partial | not in source: China 2006, China 2007, India 2006, India 2007, Brazil 2006, Brazil 2007 |
| 2006-12 | 2006-12 | EO80 | annex XLS (Wayback) | 12 | partial | not in source: China 2006, China 2007, India 2006, India 2007, Brazil 2006, Brazil 2007 |
| 2007-05 | 2007-05 | EO81 | flash file XLS (Wayback) | 12 | partial | not in source: China 2007, China 2008, India 2007, India 2008, Brazil 2007, Brazil 2008 |
| 2007-12 | 2007-12 | EO82 | Annex Table 1 + country notes, EO PDF (oecd.org) | 18 | complete |  |
| 2008-06 | 2008-06 | EO83 | flash file XLS (Wayback) | 12 | partial | not in source: China 2008, China 2009, India 2008, India 2009, Brazil 2008, Brazil 2009 |
| 2008-11 | 2008-11 | EO84 | flash file XLS (Wayback) | 12 | partial | not in source: China 2008, China 2009, India 2008, India 2009, Brazil 2008, Brazil 2009 |
| 2009-06 | 2009-06 | EO85 | annex XLS (Wayback) | 12 | partial | not in source: China 2009, China 2010, India 2009, India 2010, Brazil 2009, Brazil 2010 |
| 2009-11 | 2009-11 | EO86 | flash file XLS (Wayback) | 18 | complete |  |
| 2010-05 | 2010-05 | EO87 | annex XLS (Wayback) | 12 | partial | not in source: China 2010, China 2011, India 2010, India 2011, Brazil 2010, Brazil 2011 |
| 2010-11 | 2010-11 | EO88 | annex XLS (Wayback) | 12 | partial | not in source: China 2010, China 2011, India 2010, India 2011, Brazil 2010, Brazil 2011 |
| 2011-05 | 2011-05 | EO89 | annex XLS (Wayback) | 12 | partial | not in source: China 2011, China 2012, India 2011, India 2012, Brazil 2011, Brazil 2012 |
| 2011-11 | 2011-11 | EO90 | annex XLS (Wayback) | 12 | partial | not in source: China 2011, China 2012, India 2011, India 2012, Brazil 2011, Brazil 2012 |
| 2012-05 | 2012-05 | EO91 | Annex Table 1 + country notes, EO PDF (oecd.org) | 18 | complete |  |
| 2012-11 | 2012-11 | EO92 | Annex Table 1 + country notes, EO PDF (oecd.org) | 18 | complete |  |
| 2013-05 | 2013-05 | EO93 | annex XLS + flash file XLS (Wayback) | 18 | complete |  |
| 2013-11 | 2013-11 | EO94 | annex XLS (Wayback) | 12 | partial | not in source: China 2013, China 2014, India 2013, India 2014, Brazil 2013, Brazil 2014 |
| 2014-05 | 2014-05 | EO95 | annex XLS (Wayback) | 12 | partial | not in source: China 2014, China 2015, India 2014, India 2015, Brazil 2014, Brazil 2015 |
| 2014-11 | 2014-11 | EO96 | annex XLS (Wayback) | 12 | partial | not in source: China 2014, China 2015, India 2014, India 2015, Brazil 2014, Brazil 2015 |
| 2015-06 | 2015-06 | EO97 | annex XLS (Wayback) | 18 | complete |  |
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

Status `complete` means every value in scope was extracted. `partial` means the source holds only some economies: the annex Table 1 covered OECD members only until EO97 (China, India and Brazil were in a separate table that was not archived with the workbook), and the summary tables of EO60 to EO65 and EO68 show only the OECD total, the United States, Japan and Germany or the euro area. `missing` means no copy of that vintage was found; nothing is interpolated.

## Open problems and source anomalies

- **No missing editions.** The 20 editions listed missing until 2026-10-02 (EO47 to EO59, EO61, EO69, EO71, EO73, EO82, EO91, EO92) were captured from the OECD PDFs (Files, item 9).
- **GNP before June 1992.** EO47 to EO50 report "real GNP/GDP": the United States, Japan and Germany are GNP and the OECD total aggregates GNP and GDP; EO51 still shows Japan and Germany as GNP. A GNP forecast is a different measure from the GDP actual, so these rows are not captured (recorded in each edition's notes). Germany in EO47 to EO51 is also western Germany only. The EO51 OECD total is captured with a note (GDP-weighted, but with the two GNP rows inside), confidence `medium`.
- **Germany from EO52** is the whole of Germany for growth rates from 1992 (box on page iii of each volume), the same basis as the actual.
- **EO55 OECD total excludes Mexico** ("in this issue only").
- **Euro area before 1999 is not captured.** The summary tables of EO60 to EO65 show the European Union instead. EO66 onward show the euro area.
- **EO68 is the preliminary edition** (November 2000); its summary table has no Germany or United Kingdom row.
- **EO94 and EO95 annex figures are working-day adjusted.** The sheet says these numbers "may differ from the basis used for official projections" (mainly affects Germany and Japan). Stored as published in the annex, with a note on each entry.
- **EO98 identification is by inference** (empty source line). See Files, item 3.
- **EO107 (June 2020)** had two equally weighted scenarios. The OECD.Stat dataset (and so this capture) holds the double-hit scenario only. The single-hit scenario is not captured.
- **EO119 (June 2026)** also published a "prolonged disruption" scenario; the database holds the baseline ("time-limited disruption") only.
- **India** is on a fiscal-year basis (April to March) in all OECD tables; the target year is the fiscal year starting in that calendar year.
- **Euro area** in the OECD database is the euro area countries that are OECD members (EA16, later EA17), not the full euro area of the ECB or Eurostat. The composition changes over time.
- Values from databases are unrounded; stored rounded to 3 decimals. Published tables show 1 decimal.
- No short quotes are stored: the sources are data tables, not prose.
