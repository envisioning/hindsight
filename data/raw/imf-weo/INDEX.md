# IMF World Economic Outlook: real GDP growth forecasts

Publisher: International Monetary Fund. Series: World Economic Outlook (WEO), April (spring) and October (fall) editions.
Facts only: economy, target year, forecast value, source. Nothing here is graded and no errors are computed.

## Scope

- Metric: real GDP growth, annual percent change (WEO code `NGDP_RPCH`).
- Economies (11): World, Advanced economies, Emerging market and developing economies, United States, Euro area, China, India, Brazil, Japan, Germany, United Kingdom.
- Per edition: forecast for the current year (`horizon: current_year`) and the next year (`horizon: next_year`). 22 entries per full edition.
- Editions: 1990-04 to 2026-04, 73 editions. The historical file starts with the Spring 1990 vintage, so 1990 is the first edition that the data allows.

## Verify-first answers (issue #9)

- **Are the vintages downloadable?** Yes. The IMF publishes the "Historical WEO Forecasts Database" as one xlsx file with one column per vintage since Spring 1990. Per-edition WEO database files also exist on imf.org, but the imf.org HTML pages return HTTP 403 (Akamai bot protection) to curl and WebFetch.
- **IEO assessment (comparison, not used for grading):** IMF Independent Evaluation Office, "IMF Forecasts: Process, Quality, and Country Perspectives" (Board discussion 2014-02-27), https://www.elibrary.imf.org/display/book/9781475599510/9781475599510.xml . Background paper on the WEO forecast process: https://ieo.imf.org/en/-/media/ieo/files/evaluations/completed/03-18-2014-imf-forecasts-process-quality-and-country-perspectives/bp-14-03-the-imf-weo-forecast-process.pdf . Earlier IMF staff evaluation: IMF Working Paper WP/06/59, "An Evaluation of the World Economic Outlook Forecasts", https://www.imf.org/external/pubs/ft/wp/2006/wp0659.pdf . Later: IMF Working Paper WP/21/216, "An Analysis of the Forecasting Performance of the World Economic Outlook".

## Files and vintages used

1. **Editions 1990-04 to 2025-04 (71 editions).** IMF Historical WEO Forecasts Database.
   - URL: https://www.imf.org/-/media/files/publications/weo/weo-database/2025/april/weohistorical.xlsx
   - HTTP Last-Modified: Fri, 24 Oct 2025 02:30:30 GMT. ETag 0x8DE12A54D0FC064. Size 10,108,291 bytes. SHA-256 9ece06e9630f5e6c4054825148ed69d85cf583e5fe18071618521588f906729c.
   - Info sheet: "Updated: April 22nd, 2025". Sheet `ngdp_rpch`, columns `S1990ngdp_rpch` to `S2025ngdp_rpch` ("S" = spring, "F" = fall). Rows matched by country name and WEO country code (World 1, Advanced Economies 110, Emerging Market and Developing Economies 200, Euro area 163, USA 111, GBR 112, DEU 134, JPN 158, BRA 223, IND 534, CHN 924).
   - Retrieved 2026-09-27. Download trick: imf.org returns 403 to a plain GET; the static file returns 200 with the header `Range: bytes=0-`. The older URLs https://www.imf.org/external/pubs/ft/weo/data/WEOhistorical.xlsx and the data.imf.org copy still returned 403.
2. **Edition 2025-10.** IMF SDMX 3.0 API, dataflow `IMF.RES:WEO_2025_OCT_VINTAGE(1.0.0)`, key `*.NGDP_RPCH.A`: https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/+/*.NGDP_RPCH.A . Group codes G001 World, G110 Advanced economies, G200 EMDE, G163 Euro area. Series attribute COUNTRY_UPDATE_DATE 9/30/2025. Values at 3 decimals. This is the only archived vintage dataflow listed under IMF.RES (retrieved 2026-09-27).
3. **Edition 2026-04 and realized values.** IMF DataMapper API v1, indicator `NGDP_RPCH`: https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH . Indicator metadata: source "World Economic Outlook (April 2026)", last-modified 2026-04-08 16:07:34. Values at 1 decimal only. This is the live series, not an archived file (fetched with the same Range header).

Publication months (`published`) come from the WEO database release labels (May for spring 1990 to 2001, September for fall 2003 to 2006 and 2011, otherwise April and October), as listed by BD Economics (https://bd-econ.com/files/imfweo/data.json). The IMF historical file itself labels vintages only S/F. Edition ids follow the task's `YYYY-04` / `YYYY-10` convention regardless of the actual month.

## realized.json

Latest values for 1990 to 2025 for the 11 economies, from the April 2026 WEO (DataMapper API, last-modified 2026-04-08). 394 rows. 2026 onward excluded (projections). 2025 values carry confidence `medium` because they can be staff estimates. Group aggregates use the April 2026 composition. The historical file also holds first-outturn values (for example the F(t+1) value for year t), which a later grading step can use instead of latest values; they are not extracted here.

`india_calendar_year` (#66): India real GDP growth on a calendar-year basis, 1980 to 2012, from the WEO database of April 2013, the last vintage before the IMF moved India to fiscal years (April to March) with the July 2013 WEO Update. It grades the India forecasts of editions before July 2013, which are calendar-year figures; the April 2026 India actuals above are fiscal-year. Read from the DBnomics mirror of the IMF file (dataset `IMF/WEO:2013-04`, series `IND.NGDP_RPCH`), because imf.org answered HTTP 403 on 2026-10-02 even with the Range header. Check: the vintage's 2013 and 2014 values (5.676, 6.23) equal the April 2013 India forecasts in `2013-04.json`, and its 2008 value (6.187) differs from the fiscal-year 2008 value of the October 2013 vintage (3.891). 2012 is the vintage's latest year (confidence medium, may be a staff estimate); 2013 and 2014 targets have no calendar-year actual and stay ungradable. World Bank WDI was not used: it reports India on a fiscal-year basis (#54). Script: `scripts/imf-weo/india_calendar.py`.

## Editions

| Edition | Published | Vintage | Source | Entries | Status | Gaps |
|---|---|---|---|---|---|---|
| 1990-04 | 1990-05 | S1990 | weohistorical.xlsx | 16 | partial | not in source: Advanced economies 1990, Advanced economies 1991, Emerging market and developing economies 1990, Emerging market and developing economies 1991, Euro area 1990, Euro area 1991 |
| 1990-10 | 1990-10 | F1990 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1990, Euro area 1991 |
| 1991-04 | 1991-05 | S1991 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1991, Euro area 1992 |
| 1991-10 | 1991-10 | F1991 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1991, Euro area 1992 |
| 1992-04 | 1992-05 | S1992 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1992, Euro area 1993 |
| 1992-10 | 1992-10 | F1992 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1992, Euro area 1993 |
| 1993-04 | 1993-05 | S1993 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1993, Euro area 1994 |
| 1993-10 | 1993-10 | F1993 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1993, Euro area 1994 |
| 1994-04 | 1994-05 | S1994 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1994, Euro area 1995 |
| 1994-10 | 1994-10 | F1994 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1994, Euro area 1995 |
| 1995-04 | 1995-05 | S1995 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1995, Euro area 1996 |
| 1995-10 | 1995-10 | F1995 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1995, Euro area 1996 |
| 1996-04 | 1996-05 | S1996 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1996, Euro area 1997 |
| 1996-10 | 1996-10 | F1996 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1996, Euro area 1997 |
| 1997-04 | 1997-05 | S1997 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1997, Euro area 1998 |
| 1997-10 | 1997-10 | F1997 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1997, Euro area 1998 |
| 1998-04 | 1998-05 | S1998 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1998, Euro area 1999 |
| 1998-10 | 1998-10 | F1998 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1998, Euro area 1999 |
| 1999-04 | 1999-05 | S1999 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1999, Euro area 2000 |
| 1999-10 | 1999-10 | F1999 | weohistorical.xlsx | 20 | complete | not in source: Euro area 1999, Euro area 2000 |
| 2000-04 | 2000-05 | S2000 | weohistorical.xlsx | 22 | complete |  |
| 2000-10 | 2000-10 | F2000 | weohistorical.xlsx | 22 | complete |  |
| 2001-04 | 2001-05 | S2001 | weohistorical.xlsx | 22 | complete |  |
| 2001-10 | 2001-10 | F2001 | weohistorical.xlsx | 20 | partial | not in source: Euro area 2001, Euro area 2002 |
| 2002-04 | 2002-04 | S2002 | weohistorical.xlsx | 22 | complete |  |
| 2002-10 | 2002-10 | F2002 | weohistorical.xlsx | 22 | complete |  |
| 2003-04 | 2003-04 | S2003 | weohistorical.xlsx | 22 | complete |  |
| 2003-10 | 2003-09 | F2003 | weohistorical.xlsx | 22 | complete |  |
| 2004-04 | 2004-04 | S2004 | weohistorical.xlsx | 22 | complete |  |
| 2004-10 | 2004-09 | F2004 | weohistorical.xlsx | 22 | complete |  |
| 2005-04 | 2005-04 | S2005 | weohistorical.xlsx | 22 | complete |  |
| 2005-10 | 2005-09 | F2005 | weohistorical.xlsx | 22 | complete |  |
| 2006-04 | 2006-04 | S2006 | weohistorical.xlsx | 22 | complete |  |
| 2006-10 | 2006-09 | F2006 | weohistorical.xlsx | 22 | complete |  |
| 2007-04 | 2007-04 | S2007 | weohistorical.xlsx | 22 | complete |  |
| 2007-10 | 2007-10 | F2007 | weohistorical.xlsx | 22 | complete |  |
| 2008-04 | 2008-04 | S2008 | weohistorical.xlsx | 22 | complete |  |
| 2008-10 | 2008-10 | F2008 | weohistorical.xlsx | 22 | complete |  |
| 2009-04 | 2009-04 | S2009 | weohistorical.xlsx | 22 | complete |  |
| 2009-10 | 2009-10 | F2009 | weohistorical.xlsx | 22 | complete |  |
| 2010-04 | 2010-04 | S2010 | weohistorical.xlsx | 22 | complete |  |
| 2010-10 | 2010-10 | F2010 | weohistorical.xlsx | 22 | complete |  |
| 2011-04 | 2011-04 | S2011 | weohistorical.xlsx | 22 | complete |  |
| 2011-10 | 2011-09 | F2011 | weohistorical.xlsx | 22 | complete |  |
| 2012-04 | 2012-04 | S2012 | weohistorical.xlsx | 22 | complete |  |
| 2012-10 | 2012-10 | F2012 | weohistorical.xlsx | 22 | complete |  |
| 2013-04 | 2013-04 | S2013 | weohistorical.xlsx | 22 | complete |  |
| 2013-10 | 2013-10 | F2013 | weohistorical.xlsx | 22 | complete |  |
| 2014-04 | 2014-04 | S2014 | weohistorical.xlsx | 22 | complete |  |
| 2014-10 | 2014-10 | F2014 | weohistorical.xlsx | 22 | complete |  |
| 2015-04 | 2015-04 | S2015 | weohistorical.xlsx | 22 | complete |  |
| 2015-10 | 2015-10 | F2015 | weohistorical.xlsx | 22 | complete |  |
| 2016-04 | 2016-04 | S2016 | weohistorical.xlsx | 22 | complete |  |
| 2016-10 | 2016-10 | F2016 | weohistorical.xlsx | 22 | complete |  |
| 2017-04 | 2017-04 | S2017 | weohistorical.xlsx | 22 | complete |  |
| 2017-10 | 2017-10 | F2017 | weohistorical.xlsx | 22 | complete |  |
| 2018-04 | 2018-04 | S2018 | weohistorical.xlsx | 22 | complete |  |
| 2018-10 | 2018-10 | F2018 | weohistorical.xlsx | 22 | complete |  |
| 2019-04 | 2019-04 | S2019 | weohistorical.xlsx | 22 | complete |  |
| 2019-10 | 2019-10 | F2019 | weohistorical.xlsx | 22 | complete |  |
| 2020-04 | 2020-04 | S2020 | weohistorical.xlsx | 22 | complete |  |
| 2020-10 | 2020-10 | F2020 | weohistorical.xlsx | 22 | complete |  |
| 2021-04 | 2021-04 | S2021 | weohistorical.xlsx | 22 | complete |  |
| 2021-10 | 2021-10 | F2021 | weohistorical.xlsx | 22 | complete |  |
| 2022-04 | 2022-04 | S2022 | weohistorical.xlsx | 22 | complete |  |
| 2022-10 | 2022-10 | F2022 | weohistorical.xlsx | 22 | complete |  |
| 2023-04 | 2023-04 | S2023 | weohistorical.xlsx | 22 | complete |  |
| 2023-10 | 2023-10 | F2023 | weohistorical.xlsx | 22 | complete |  |
| 2024-04 | 2024-04 | S2024 | weohistorical.xlsx | 22 | complete |  |
| 2024-10 | 2024-10 | F2024 | weohistorical.xlsx | 22 | complete |  |
| 2025-04 | 2025-04 | S2025 | weohistorical.xlsx | 22 | complete |  |
| 2025-10 | 2025-10 | F2025 | SDMX WEO_2025_OCT_VINTAGE | 22 | complete |  |
| 2026-04 | 2026-04 | S2026 | DataMapper API (Apr 2026) | 22 | complete |  |

Status `complete` means every value the source holds for this scope was extracted. The euro area gap before 2000 is structural (the aggregate begins in the Spring 2000 vintage, per the file's Info sheet), so those editions are marked complete.

## Open problems and source anomalies

- **1990-04 (S1990):** the file has no Advanced economies or EMDE values. Marked partial.
- **2001-10 (F2001):** the file has no Euro area values, although S2001 and S2002 have them. Marked partial. Not filled from any other source.
- Values in the historical file are unrounded floats; they are stored here rounded to 3 decimals. Published WEO tables show 1 decimal.
- Group composition changes across vintages (for example "Advanced economies" gained members over time, and the euro area grew). A forecast for a group is a forecast for the group as it was defined at that time.
- The April 2026 edition and realized values come from a live API, not a frozen vintage. A later WEO release will change them. Re-fetch dates are recorded above.
- No short quotes are stored: the source is a data table, not prose.
