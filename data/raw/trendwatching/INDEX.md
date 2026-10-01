# trendwatching.com annual consumer trend lists: collected editions

Facts only (NOTICE.md): trend label as printed, printed order, a short verbatim sentence that states the trend, the subject, and any horizon or number the text gives. Nothing here is graded. Claim type: `trend` (D6).

## Verified before extraction

- **Publisher.** trendwatching.com (TrendWatching BV, Amsterdam, founded 2002). Free monthly Trend Briefings from 2002; a paid annual "Trend Report" from the 2007 edition; a paid Premium service from about 2011.
- **First edition: 2007.** "trendwatching.com's TOP 5 CONSUMER TRENDS FOR 2007", the January 2007 Trend Briefing (https://www.trendwatching.com/trends/2007top5.htm, first archived 2007-01-11). Its intro says "OK, so we've finally succumbed to list mania", so no earlier free year list exists. The 2002-2006 briefing archive pages (trendwatching.com/trends/2003/ to /2006/, archived 2009) list one trend per monthly briefing and no year list. Several briefings (2010, 2013) are labelled December but were captured in November, so the label month is not the release month.
- **One free year list per year, 2007 to 2025**, each published as the November or December (2007: January) Trend Briefing and readable on the Wayback Machine:
  - 2007 Top 5 consumer trends (trends/2007top5.htm)
  - 2008 "8 important consumer trends for 2008" (trends/8trends2008.htm)
  - 2009 "Half a dozen consumer trends for 2009" (trends/halfdozentrends2009/)
  - 2010 10 trends (trends/10trends2010/), 2011 11 trends (trends/11trends2011/), 2012 12 trends (trends/12trends2012/), 2013 10 trends (trends/10trends2013/), 2014 7 trends (trends/7trends2014/), 2015 10 trends (trends/10-trends-for-2015/), 2016 5 trends (trends/5-trends-for-2016/), 2017 5 trends (trends/5-trends-for-2017/)
  - 2018, 2019, 2020 "5 trends for <year>" as TrendWatching Quarterly (quarterly/2017-11/5-trends-2018/, quarterly/2018-11/5-trends-2019/, quarterly/2019-11/5-trends-2020/)
  - 2021 "21 trends for 2021" and 2022 "22 trends for 2022" (lead-generation pages on info.trendwatching.com and trendwatching.com)
  - 2023 "2023 Trend Check" and 2024 "2024 Trend Check" (trendwatching.com/2023-trend-check, /2024-trend-check)
  - 2025 "2025 Trend Report highlights" (trendwatching.com/2025-trend-report-highlights)
- **2026: no public year list found.** No `2026-trend-*` page on the live site (404 for 2026-trend-report-highlights, 2026-trend-report, 2026-consumer-trends, 2026-trends, 2026-trend-check on 2026-10-01) and none in the Wayback index; the only 2026 pages are a news post about keynotes and a post about free platform access. A '2026 Trend Report' exists for paying members (a web search shows a third-party Scribd upload and a Philippine partner page); neither is a publisher's public page, so neither was used. Recorded as missing.
- **Behind the paywall, not captured:** the paid annual Trend Report (2007 to about 2010, CD-ROM/PDF, then part of Premium), the full Premium annual reports, and the full 2021-2025 reports (the public pages give the trend names and a teaser; the full write-ups need a login or a form). The free lists are the editions captured here.
- **Regional lists are out of scope:** Asian, African, Latin American and other regional "trends for <year>" (2015-2020) are separate products, not the global edition.
- **Read method.** Raw archived HTML (Wayback `id_` mode) via `scripts/trendwatching/fetch.py`; labels from the page headings (often image alt text) and quotes copied from the page text.

## Fields

`rank` (print order; several editions say 'in random order', and 2023 is alphabetical, so rank is never a priority), `label` (as printed, usually upper case), `section` (parent mega-trend or industry where the edition prints one, else null), `quote` (verbatim, checked as a substring of the archived page text), `subject` (Hindsight's short label), `horizon` (only where the text states one), `target_year` (the year in the edition title; every edition is 'trends for <year>'), `source_url` (the Wayback snapshot read), `confidence` (all `high`: publisher's own text read from raw HTML), `note` (subtitles, label variants, third-party numbers cited in the section). No `metric`/`value`/`unit` is recorded: the numbers in these lists are third-party survey results or forecasts quoted by trendwatching (Gartner, Juniper, Tractica and others), listed in notes, never trendwatching's own forecast.

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| 2007 | trendwatching.com's TOP 5 CONSUMER TRENDS FOR 2007 | 2007-01 | complete | 5 | https://web.archive.org/web/20070111000117/http://www.trendwatching.com/trends/2007top5.htm |
| 2008 | 8 important consumer trends for 2008 | 2007-12 | complete | 8 | https://web.archive.org/web/20071212234456/http://www.trendwatching.com:80/trends/8trends2008.htm |
| 2009 | Half a dozen consumer trends for 2009 | 2008-12 | complete | 6 | https://web.archive.org/web/20081205065943/http://www.trendwatching.com:80/trends/halfdozentrends2009/ |
| 2010 | 10 CRUCIAL CONSUMER TRENDS FOR 2010 | 2009-11 | complete | 10 | https://web.archive.org/web/20091118024539/http://www.trendwatching.com/trends/10trends2010/ |
| 2011 | 11 CRUCIAL CONSUMER TRENDS FOR 2011 | 2010-12 | complete | 11 | https://web.archive.org/web/20101203084257/http://www.trendwatching.com/trends/11trends2011/ |
| 2012 | 12 CRUCIAL CONSUMER TRENDS FOR 2012 | 2011-12 | complete | 12 | https://web.archive.org/web/20111203212326/http://trendwatching.com/trends/12trends2012/ |
| 2013 | 10 Crucial Trends for 2013 | 2012-11 | complete | 10 | https://web.archive.org/web/20121110201258/http://trendwatching.com/trends/10trends2013/ |
| 2014 | 7 Consumer Trends To Run With In 2014 | 2013-12 | complete | 7 | https://web.archive.org/web/20131205184452/http://www.trendwatching.com/trends/7trends2014/ |
| 2015 | 10 TRENDS for 2015 | 2014-11 | complete | 10 | https://web.archive.org/web/20141128174801/http://trendwatching.com/trends/10-trends-for-2015/ |
| 2016 | 5 Trends for 2016 | 2015-11 | complete | 5 | https://web.archive.org/web/20151114022414/http://trendwatching.com/trends/5-trends-for-2016/ |
| 2017 | 5 Consumer Trends for 2017 | 2016-11 | complete | 5 | https://web.archive.org/web/20161119081258/http://trendwatching.com/trends/5-trends-for-2017/ |
| 2018 | 5 Trends for 2018 (TrendWatching Quarterly) | 2017-11 | complete | 5 | https://web.archive.org/web/20171109211002/http://trendwatching.com/quarterly/2017-11/5-trends-2018/ |
| 2019 | 5 Trends for 2019 (TrendWatching Quarterly) | 2018-11 | complete | 5 | https://web.archive.org/web/20181219194149/https://trendwatching.com/quarterly/2018-11/5-trends-2019/ |
| 2020 | 5 Trends for 2020 (TrendWatching Quarterly) | 2019-11 | complete | 5 | https://web.archive.org/web/20191213044207/https://trendwatching.com/quarterly/2019-11/5-trends-2020/ |
| 2021 | 21 trends for 2021 | 2020-12 | complete | 21 | https://web.archive.org/web/20201201093334/https://info.trendwatching.com/21-trends-for-2021 |
| 2022 | 22 Consumer trend opportunities for 2022 | 2021-12 | complete | 27 (22 opportunities + 5 mega-trend blocks) | https://web.archive.org/web/20211223013619/https://www.trendwatching.com/22-trends-for-2022 |
| 2023 | 2023 Trend Check | 2022-12 | complete | 15 | https://web.archive.org/web/20221203232847/https://www.trendwatching.com/2023-trend-check |
| 2024 | 2024 Trend Check | 2023-12 | complete | 15 | https://web.archive.org/web/20231215231936/https://www.trendwatching.com/2024-trend-check |
| 2025 | 2025 Trend Report, Free Highlights | 2024-12 | partial | 4 | https://web.archive.org/web/20241205113811/https://www.trendwatching.com/2025-trend-report-highlights |
| 2026 | none found | - | missing | 0 | - |

Total: 186 entries in 19 edition files.

`published` is the briefing's own month where printed and consistent with the first capture (2007-2009, 2011), else the month of the first Wayback capture (on or before the real date), or the month in the URL path (2018-2020).

## What could not be read, and why

- **Paid annual Trend Reports, 2007-2025** (CD-ROM/PDF, later Premium; 100+ pages from 2009). Paywalled, never public. The free lists captured here are a selection; several editions say so ('just a snapshot of what we track').
- **2025 full report.** The free page shows four trends; the report has 'many more trends' for members. Edition marked partial.
- **2026.** No public year list (see above). A member report exists; not public.
- **PDF versions** of 2015 (2014-12-10-TRENDS-FOR-2015.pdf), 2023 (2023-Trend-Check.pdf) and 2025 (trendwatching-2025trendreport-highlights.pdf) were not read; the HTML pages carry the same lists.
- **Envisioning's archived 2013 copy** (issue #30) was not needed: the 2013 web edition is complete on the Wayback Machine.

## Open problems

- **The format changes, so 'one trend' means different things.** 2007-2020: named consumer trends. 2021: 21 'opportunities'. 2022: 22 opportunities under 5 mega-trends (27 rows; the mega-trend rows are summaries, a grader may want to skip them or grade them alone). 2023: 15 mega-trends (alphabetical), each with 3 opportunities listed in the note only. 2024: 15 industry trends. 2025: 4 headline trends. A grader should treat 2021-2022 opportunity rows as recommendations about brand behaviour, which are harder to grade than consumer-behaviour trends.
- **Self-promotional rows.** 2014 #7 GLOBAL BRAIN mostly announces trendwatching's own regional bulletins (kept, with a note). Items titled NEED MORE? (2010, 2011) and MORE-ISM (2012, 2013) are promotions and were left out; this is why 2010 and 2013 have 10 rows though the pages number 11.
- **Publication months** for 2010-2025 come from first Wayback captures or URL paths, not printed dates; the true date can be earlier.
- **Quotes from teasers.** 2011 and 2013 quotes come from the overview teasers, which end in '...'; the ellipsis was dropped, the words are verbatim. Some quotes keep source spacing errors ('owners , i.e.', 'moment , multi').
- **Label variants in the source** (recorded in notes): 2011 ECO SUPERIOR / ECO-SUPERIOR; 2012 BOTTOM OF THE URBAN PYRAMID / URBAN BOTTOM OF THE PYRAMID; 2015 INTERNET OF SHARING THINGS / INTERNET OF SHARED THINGS; 2022 GLOCALLY GROUNDED / GLOBAL GROUNDED LOCALLY; 2022 META-PHYSICAL vs 2023 METAPHYSICAL; 2024 GREEN THEATER / GREEN THEATRE; 2023 PRECAREIOUS (sic).
- **Subject mapping and Revisions not done.** Candidate chains: STATUS LIFESTYLES (2007) -> STATUS SPHERES (2008, says so) -> STATUS TESTS (2016); TRANSPARENCY TYRANNY (2007) -> FEEDBACK 3.0 (2009) -> FULL FRONTAL (2013) -> GLASS BOX WRECKING BALLS (2018) -> GLASS BOX BRANDS (2023); URBANY (2010) -> URBANOMICS (2011) -> BOTTOM OF THE URBAN PYRAMID (2012); PROFILE MYNING (2010) -> DATA MYNING (2013) -> NO DATA (2014); MATURIALISM (2010) -> EMERGING MATURIALISM (2012); THE INTERNET OF CARING THINGS (2014) -> INTERNET OF SHARING THINGS (2015); STATE OF PLACE, SOLACE AS A SERVICE, JOYNING, FREEDONISM, META-PHYSICAL (2022 -> 2023); recycled labels with new meanings: THE GLOBAL BRAIN (2007, 2014), BRAND BUTLERS (2008, 2024), VIRTUAL COMPANIONS (2018, 2024), ONLINE OXYGEN (2003 briefing, 2008), PLANNED SPONTANEITY (2002-03 briefing, 2011), PRICING PANDEMONIUM (2011 trend, 2016 parent mega-trend). Map these as `Revision`s, not noise.
- **Read method.** Raw HTML from the Wayback Machine, parsed to text by `scripts/trendwatching/fetch.py`; every quote was matched against that text before writing (curly quotes and dashes normalised for matching, stored as printed).
