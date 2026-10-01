# FTSG / Future Today Institute, Tech Trends Report: collected editions

Facts only (NOTICE.md): trend title as printed, its section, a short quote where the edition states the trend in a sentence, a printed horizon or action label, the printed "Nth year on the list" tag, and the source. Nothing here is graded. Claim type: `trend` (D6).

## Verified before extraction

- **Series and author.** Annual report by Amy Webb's firm: Webbmedia Group "Trend Report" (to 2015), Future Today Institute "Tech Trends Report" (2016-2024), Future Today Strategy Group (FTSG) "Tech Trends Report" (2025). Amy Webb is founder/CEO and the publication's author.
- **First edition: 2008 (inferred, not seen).** The editions count themselves: 2017 is the "10th year", 2018 the "11th annual", 2019 the 12th, 2020 the 13th, 2021 the 14th, 2022 the 15th, 2023 the 16th, 2024 the 17th, 2025 the 18th. Counting back puts the 1st edition in 2008 (Webbmedia Group). No copy of 2008-2012 was found; the 2016 landing page says the annual report has been public "for several years".
- **Last edition: 2025.** The 2026 publication is not a Tech Trends Report: FTSG's "Convergence Outlook 2026 (1st edition)" says it "would have been FTSG's 19th annual Tech Trends Report" and that the format was retired. It is recorded as 2026 missing, not extracted as a trend edition.
- **Edition id** is the year in the title. Each edition is published in March (SXSW) of its title year, except 2014-2017 (released in December or January around the turn of the year; the 2017 deck was embargoed until 13 December 2016).
- **Where each edition is publicly readable (2026-10-01):**
  - 2008-2012: no public copy found (not on the Webbmedia Group or FTI sites in the Wayback Machine).
  - 2013: SlideShare deck `webbmedia/webbmedia-group-2013-tech-trends` archived 2013-11-28, but the archived page has no slide text.
  - 2014: PDF archived (webbmediagroup.com/upload/2014-Trend-Report.pdf, capture 2014-01-24). Extracted.
  - 2015: PDF not found; SlideShare deck `webbmedia/2015-tech-trends` archived 2014-12-09 with a transcript of the first 52 slides (report states 55 trends). Not extracted (budget).
  - 2016: PDF link (WebbmediaGroup-2016-TechTrends.pdf) never archived (only redirects and 404s); landing page states 81 trends; SlideShare deck `webbmedia/webbmedia-group-2016-tech-trends` archived 2016-01-16 with a transcript of 47 slides. Not extracted.
  - 2017: PDF distributed through WeTransfer (expired, not archived); landing page states 159 trends; SlideShare deck archived 2020-12-05 with a transcript of 56 slides. Not extracted.
  - 2018: PDF through WeTransfer (not archived); landing page states 225 trends in 20 industries. No transcript found. Missing.
  - 2019: PDF through WeTransfer (not archived); SlideShare part 1 transcript carries the full contents list; part 2 transcript carries the opening pages of trends 192-225. Extracted as partial (titles complete, quotes for 9).
  - 2020: PDF through WeTransfer (not archived); SlideShare section 1 transcript carries the full contents list (publisher: 406 trends, 31 sections). Extracted as partial (titles only).
  - 2021: full 504-page PDF on the publisher's Dropbox link (target of 2021techtrends.com/Full-Report, captured 2021-04-02), still live. Extracted.
  - 2022: full PDF archived (futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf, capture 2022-03-16). Extracted.
  - 2023: published as 14 volume PDFs plus an executive summary; 6 volumes archived complete, the AI volume capture truncated, 7 volumes not archived. Extracted as partial.
  - 2024: full PDF archived (TR2024_Full-Report_FINAL_LINKED.pdf, capture 2024-03-09). Extracted.
  - 2025: full PDF archived (ftsg.com FTSG_2025_TR_FINAL_LINKED.pdf, capture 2025-03-10). Extracted.

## Fields

`rank` (printed order in the edition: contents order across volumes; 2019 also has `trend_number` where the printed number is visible), `label` (trend title as printed in the contents), `section` (volume or report section), `subsection` (section and sub-section headings above the entry, joined by " / "), `quote` (first sentence of the trend's body or KEY INSIGHT / WHAT IT IS block, verbatim, 400 characters or fewer), `subject` (the printed title; no merging across editions yet), `horizon` (2014: "the coming year"; 2022: the highlighted page-header label Watch Closely / Informs Strategy / Act Now), `target_year` (2014 only), `years_on_list` (the printed "Nth YEAR ON THE LIST" tag on one-trend-per-page layouts), `page` (PDF page of the trend), `source_url` (with `#page=`), `confidence`, `note`. Each file also lists `skipped_toc_items` (contents entries that are not trends: Key Insights, Scenarios, Selected Sources, front matter) and its own `notes`.

## How labels were chosen

PDF editions (2021-2025): the contents page of each volume, read with font information (pdftohtml XML). Coloured or bold entries are sections, medium-weight entries sub-sections, regular black entries trends; 2025 sections are detected from full-page section dividers. Scenarios ("Scenario: ...", "What if ...?"), Key Insights, Important Terms, Ones to Watch, Expert Insight essays, Application, Key Questions, Selected Sources and person names (expert perspectives) are excluded. Quotes come from the trend heading's first body sentence; for one-trend-per-page layouts from the KEY INSIGHT (2021-2023) or WHAT IT IS (2024-2025) block. Every quote was checked against the PDF text; the 11 not found verbatim (line-break hyphenation, reading order) are `medium`.

## Editions

| Edition | Title | Published | Status | Entries | With quote | Main source |
|---|---|---|---|---|---|---|
| 2008 | (Webbmedia Group trend report, 1st, inferred) | - | missing | 0 | 0 | - |
| 2009 | - | - | missing | 0 | 0 | - |
| 2010 | - | - | missing | 0 | 0 | - |
| 2011 | - | - | missing | 0 | 0 | - |
| 2012 | - | - | missing | 0 | 0 | - |
| 2013 | Webbmedia Group 2013 Tech Trends | 2012-12 (approx.) | missing | 0 | 0 | SlideShare webbmedia-group-2013-tech-trends (no text archived) |
| 2014 | Webbmedia Group 2014 Trend Report | 2014-01 | complete | 25 | 25 | https://web.archive.org/web/20140124011002/http://webbmediagroup.com/upload/2014-Trend-Report.pdf |
| 2015 | Webbmedia Group 2015 Trend Report | 2014-12 | missing | 0 | 0 | SlideShare webbmedia/2015-tech-trends (transcript, not extracted) |
| 2016 | FTI 2016 Tech Trends (9th) | 2015-12 | missing | 0 | 0 | SlideShare webbmedia/webbmedia-group-2016-tech-trends (transcript, not extracted) |
| 2017 | FTI 2017 Tech Trends Report (10th) | 2016-12 | missing | 0 | 0 | SlideShare webbmedia/embargoed-until-dec-13th-future-today-institutes-2017-tech-trends-report (transcript, not extracted) |
| 2018 | FTI 2018 Tech Trends Report (11th) | 2018-03 | missing | 0 | 0 | - |
| 2019 | FTI 2019 Tech Trends Report (12th) | 2019-03 | partial | 321 | 9 | SlideShare part 1 and part 2 transcripts (Wayback) |
| 2020 | FTI 2020 Tech Trends Report (13th) | 2020-03 | partial | 400 | 0 | SlideShare section 1 transcript (Wayback) |
| 2021 | FTI 2021 Tech Trends Report (14th) | 2021-03 | complete | 494 | 466 | https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf |
| 2022 | FTI 2022 Tech Trends Report (15th) | 2022-03 | complete | 587 | 556 | https://web.archive.org/web/20220316173530/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf |
| 2023 | FTI 2023 Tech Trends Report (16th) | 2023-03 | partial | 257 | 251 | six volume PDFs (Wayback), see 2023.json `sources` |
| 2024 | FTI 2024 Tech Trends Report (17th) | 2024-03 | complete | 706 | 699 | https://web.archive.org/web/20240309173748/https://futuretodayinstitute.com/wp-content/uploads/2024/03/TR2024_Full-Report_FINAL_LINKED.pdf |
| 2025 | FTSG 2025 Tech Trends Report (18th) | 2025-03 | complete | 676 | 670 | https://web.archive.org/web/20250310153559/https://ftsg.com/wp-content/uploads/2025/03/FTSG_2025_TR_FINAL_LINKED.pdf |
| 2026 | (none: Convergence Outlook 2026 replaced the series) | 2026-03 | missing | 0 | 0 | https://ftsg.com/wp-content/uploads/2026/03/Convergence_Outlook_2026.pdf |

## What could not be read, and why

- **2008-2012:** no copy in the Wayback Machine under webbmediagroup.com or futuretodayinstitute.com; no SlideShare deck found. Existence inferred only from the edition count.
- **2013:** the archived SlideShare page has no transcript text.
- **2015, 2016, 2017:** the PDFs were never archived (2016 link only returns redirects and 404s; 2017 went through WeTransfer). Archived SlideShare transcripts exist (first 47-56 slides each); they were not extracted in this pass because of the tool budget. 2017's slides open with the report's introduction, so the transcript may not reach the trend list.
- **2018:** PDF only through WeTransfer and a MailChimp form; no archived copy or transcript found.
- **2019 and 2020:** PDFs only through WeTransfer. Titles come from contents pages in SlideShare transcripts, which carry no layout (no font, so sections were found by case (2019) or by a hand list (2020)); quote text exists only for the first trend pages in the 2019 part 2 transcript.
- **2023:** the Artificial Intelligence volume's only capture (2023-09-23) is truncated at 1 MB and cannot be opened; the other seven volumes (likely Computing, Mobility/Robotics/Drones, Built Environment, Financial Services & Insurance, Space, Hospitality, Entertainment or similar; the executive summary names 14 reports) were not found in the Wayback Machine. The executive summary lists no trend titles.
- **Action / certainty labels:** 2017-2020 used an "Action Meter" quadrant (Act Now, Informs Strategy, Revisit Later, Keep Vigilant Watch) drawn as a graphic; it cannot be read from transcripts. 2021 page headers print "Watch Closely" on every page, so the highlighted label was not trusted and `horizon` is empty for 2021. 2022's highlighted label was readable and is in `horizon` for 585 entries. 2023-2025 give time-of-impact charts per industry, not per trend.

## Open problems

- **Mapping to Subjects and Revisions** not done. The `years_on_list` tags (169 in 2021, 210 in 2022, 211 in 2024, 180 in 2025) give the publisher's own persistence count and should anchor revision chains (for example "Smart Glasses" 5th year in 2022).
- **2019 has 321 entries against the publisher's 315 trends.** Rank is consistently trend number + 1 where the number is visible, so one non-trend heading sits among trends 1-191, and "Health Technologies, Digital Self-Care and Wearables" holds 58 entries including blockchain, smart-city and 5G titles, so later section headings were probably printed in mixed case and missed. Section labels for 2019 entries after rank ~250 need a manual check.
- **2020 has 400 entries against the publisher's 406.** Sub-section headings were removed by a hand list; a few may remain, and a few trends may be missing where the transcript dropped a contents line.
- **Contents entries that are lists, not trends,** may remain in the PDF editions (for example "Emerging Wearables", "Mature Wearables" in 2021; "China Spotlight" sub-items in 2022). They are kept as printed.
- **2024 and 2025 contents entries under section questions** (for example "How is AI being used in HR?") are trends; the question is kept in `subsection`.
- **Quotes.** First sentences are verbatim but some are context sentences rather than a statement of the trend (for example an example company), because the body often opens with an example. Confidence stays `high` when verbatim.
- **2026 Convergence Outlook** (10 convergences in five sections) is a different product. If Hindsight wants it, it should be a separate source, not edition 2026 of this one.
