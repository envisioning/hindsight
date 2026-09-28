# World Bank Global Economic Prospects: real GDP growth forecasts

Publisher: World Bank, Prospects Group. Series: Global Economic Prospects (GEP). Annual from 1991 (titled by the first forecast year, released late in the previous year or early in the title year); twice a year (January and June) since January 2010.
Facts only: economy, target year, forecast value, source. Nothing here is graded and no errors are computed.

## Scope

- Metric: real GDP growth, annual percent change, as printed in the GEP real GDP table (Table 1.1 in recent editions, "The global outlook in summary" in older ones).
- Economies (9 slots): World, Advanced economies, Emerging market and developing economies (EMDEs), United States, Euro area, Japan, China, India, Brazil.
- Per edition: the value for the publication year (`horizon: current_year`) and the next year (`horizon: next_year`). 18 entries per full edition. For editions released in November or December the current-year column is an estimate, not a forecast; each such entry has a note.
- Editions captured: 44, from GEP 2000 (released 1999-12) to June 2026. Earlier editions (1991 to 1999) are recorded as missing below.

## Verify-first answers (issue #11)

- **Are past forecast vintages available?** Yes, as tables, not as a database. The GEP page (https://www.worldbank.org/en/publication/global-economic-prospects) links one "gdp-growth" PDF per edition: five ZIP archives cover GEP 2000 to June 2024, and single PDFs cover January 2025 to June 2026. Each PDF is the edition's real GDP table, one page, with a text layer.
- **GEP forecast database.** The World Bank DataBank "Global Economic Prospects" (https://databank.worldbank.org/source/global-economic-prospects; Data Catalog dataset 0037888, which lists 14 versions) holds only the current vintage. The Data Catalog API answered HTTP 429 (rate limit) on 2026-09-28, so its version history was not read.
- **Group names change.** Before June 2016 the GEP reported "High income" and "Developing countries" (low- and middle-income); from June 2016 it reports "Advanced economies" and "Emerging market and developing economies (EMDEs)". These are different groupings. When an edition has no Advanced economies or EMDE row, the entry stores the group the edition did report, under its own name (`High-income countries`, code HIC; `Developing countries`, code LMY) with a note. A grader must not compare these with the later groups.
- **World Bank forecast evaluations (comparison, not used for grading):** the GEP itself publishes forecast-error boxes in some editions; not extracted.

## Files and vintages used

1. **GEP 2000 to June 2024 (40 editions).** ZIP archives of per-edition PDFs, retrieved 2026-09-28:
   - https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2000-2004.zip
   - https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2005-2009.zip
   - https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2010-2014.zip
   - https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2015-2019.zip
   - https://thedocs.worldbank.org/en/doc/2b672b3b0415d6b66c45b66579db4ef5-0050012026/related/GEP-GDP-growth-2020-2024.zip
2. **January 2025 to June 2026 (4 editions).** Single PDFs linked from the GEP page (URLs in each edition file and in `scripts/world-bank-gep/fetch.py`).
3. **Parsing.** `pdftotext -layout`, then `scripts/world-bank-gep/parse.py` assigns each number to the year column above it. Parsed values were spot-checked against the PDF text for editions 1999-12, 2006-12, 2008-12, 2011-06, 2016-06 and 2024-06 (all economies in 2024-06). Other editions were checked only for plausibility. The January 2018 PDF uses a shifted font encoding (": R U O G" for "World"); its text is decoded by a fixed offset of 29.

Published months: for editions since January 2010 the month is in the title. For the annual editions it comes from the World Bank Documents & Reports catalog date (GEP 2000 to 2006) or the World Bank press release of the report (GEP 2007: December 2006; GEP 2008: January 2008; GEP 2009: December 2008). Catalog dates of 1 January and 31 December can be placeholders, so the month of GEP 2000, 2001, 2002 and 2003 is uncertain.

## realized.json

Two World Bank sources, kept apart by the `source` field on each row. (1) GEP June 2026 table: 2023 and 2024 outturns and the 2025 estimate for all 9 economies, including Advanced economies and EMDEs. (2) World Development Indicators, NY.GDP.MKTP.KD.ZG (last updated 2026-07-13): 1998 to 2025 for World, United States, Euro area (EMU), Japan, China, India (calendar year, unlike the GEP fiscal year), Brazil, High income and Low & middle income. 279 rows. The two sources can differ for the same year (weights, revision timing).

## Editions

| Edition | Published | Title | Entries | Status | Notes |
|---|---|---|---|---|---|
| (1991 to 1999) | 1991 to 1999 | Global Economic Prospects and the Developing Countries 1991 to 1998/99, and the 1995 and 1996 short-term updates | 0 | missing | not in the World Bank "gdp-growth" files; the full reports are on https://documents.worldbank.org (scanned). Not extracted. |
| 1999-12 | 1999-12 | Global Economic Prospects 2000 | 8 | partial | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Low- and middle-income countriesa"; not in source: United States, Japan, China, India, Brazil |
| 2000-12 | 2000-12 | Global Economic Prospects 2001 | 12 | partial | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries"; not in source: China, India, Brazil |
| 2002-01 | 2002-01 | Global Economic Prospects 2002 | 12 | partial | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries"; not in source: China, India, Brazil |
| 2003-01 | 2003-01 | Global Economic Prospects 2003 | 12 | partial | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries"; not in source: China, India, Brazil |
| 2003-09 | 2003-09 | Global Economic Prospects 2004 | 12 | partial | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries"; not in source: China, India, Brazil |
| 2004-11 | 2004-11 | Global Economic Prospects 2005 | 12 | partial | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries"; not in source: China, India, Brazil |
| 2005-11 | 2005-11 | Global Economic Prospects 2006 | 12 | partial | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries in"; not in source: China, India, Brazil |
| 2006-12 | 2006-12 | Global Economic Prospects 2007 | 18 | complete | groups: Advanced economies shown as "High-income", Emerging market and developing economies shown as "Developing countries" |
| 2008-01 | 2008-01 | Global Economic Prospects 2008 | 18 | complete | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries" |
| 2008-12 | 2008-12 | Global Economic Prospects 2009 | 18 | complete | groups: Advanced economies shown as "High-income countries", Emerging market and developing economies shown as "Developing countries" |
| 2010-01 | 2010-01 | Global Economic Prospects, January 2010 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2010-06 | 2010-06 | Global Economic Prospects, June 2010 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2011-01 | 2011-01 | Global Economic Prospects, January 2011 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2011-06 | 2011-06 | Global Economic Prospects, June 2011 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2012-01 | 2012-01 | Global Economic Prospects, January 2012 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2012-06 | 2012-06 | Global Economic Prospects, June 2012 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2013-01 | 2013-01 | Global Economic Prospects, January 2013 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2013-06 | 2013-06 | Global Economic Prospects, June 2013 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2014-01 | 2014-01 | Global Economic Prospects, January 2014 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2014-06 | 2014-06 | Global Economic Prospects, June 2014 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2015-01 | 2015-01 | Global Economic Prospects, January 2015 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2015-06 | 2015-06 | Global Economic Prospects, June 2015 | 18 | complete | groups: Advanced economies shown as "High income", Emerging market and developing economies shown as "Developing countries" |
| 2016-01 | 2016-01 | Global Economic Prospects, January 2016 | 18 | complete | groups: Advanced economies shown as "High income2", Emerging market and developing economies shown as "Developing countries2" |
| 2016-06 | 2016-06 | Global Economic Prospects, June 2016 | 18 | complete |  |
| 2017-01 | 2017-01 | Global Economic Prospects, January 2017 | 18 | complete |  |
| 2017-06 | 2017-06 | Global Economic Prospects, June 2017 | 18 | complete |  |
| 2018-01 | 2018-01 | Global Economic Prospects, January 2018 | 18 | complete |  |
| 2018-06 | 2018-06 | Global Economic Prospects, June 2018 | 18 | complete |  |
| 2019-01 | 2019-01 | Global Economic Prospects, January 2019 | 18 | complete |  |
| 2019-06 | 2019-06 | Global Economic Prospects, June 2019 | 18 | complete |  |
| 2020-01 | 2020-01 | Global Economic Prospects, January 2020 | 18 | complete |  |
| 2020-06 | 2020-06 | Global Economic Prospects, June 2020 | 18 | complete |  |
| 2021-01 | 2021-01 | Global Economic Prospects, January 2021 | 18 | complete |  |
| 2021-06 | 2021-06 | Global Economic Prospects, June 2021 | 18 | complete |  |
| 2022-01 | 2022-01 | Global Economic Prospects, January 2022 | 18 | complete |  |
| 2022-06 | 2022-06 | Global Economic Prospects, June 2022 | 18 | complete |  |
| 2023-01 | 2023-01 | Global Economic Prospects, January 2023 | 18 | complete |  |
| 2023-06 | 2023-06 | Global Economic Prospects, June 2023 | 18 | complete |  |
| 2024-01 | 2024-01 | Global Economic Prospects, January 2024 | 18 | complete |  |
| 2024-06 | 2024-06 | Global Economic Prospects, June 2024 | 18 | complete |  |
| 2025-01 | 2025-01 | Global Economic Prospects, January 2025 | 18 | complete |  |
| 2025-06 | 2025-06 | Global Economic Prospects, June 2025 | 18 | complete |  |
| 2026-01 | 2026-01 | Global Economic Prospects, January 2026 | 18 | complete |  |
| 2026-06 | 2026-06 | Global Economic Prospects, June 2026 | 18 | complete |  |

Status `complete` means every slot was filled (possibly by the older group, see Notes). `partial` means the edition's table did not show some economies: GEP 2000 to GEP 2006 list no China, India or Brazil rows, and GEP 2000 lists no individual countries at all.

## Open problems and source anomalies

- **Editions before GEP 2000** are missing. The World Bank data files start with GEP 2000. The older reports exist as scanned PDFs; reading them needs OCR or a person.
- **2009 mid-year forecast updates** (the World Bank issued interim GEP forecast updates in 2009) are not in the data files and are not captured.
- **India** is on a fiscal-year basis in the GEP (the 2024 column is the fiscal year April 2024 to March 2025) in editions whose table notes say so (all editions since January 2010, and some earlier). Entries carry a note.
- **January 2017, United States:** the values carry an asterisk. Table note: "The U.S. forecasts do not incorporate the effect of policy proposals by the new U.S. administration, as their overall scope and ultimate form are still uncertain."
- **Estimate columns.** In November/December editions (GEP 2000 to GEP 2009) and in some January editions the current-year column is an estimate (marked "e", "*" or "h" in the header). The value is stored, with a note.
- **Group definitions change** (High income / Developing countries until January 2016; Advanced economies / EMDEs from June 2016). The euro area membership also changes over time.
- Values are the printed 1-decimal figures. No short quotes are stored except the one table note above.
