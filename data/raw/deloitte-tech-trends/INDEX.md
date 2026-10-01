# Deloitte Tech Trends: collected editions

Facts only: trend name as printed, a short quote that states the trend, the horizon Deloitte prints, a subject label, source. Body text, charts and figures are not stored (see NOTICE.md). Nothing here is graded.

## Verify-first answers

- **Series.** Deloitte's annual Tech Trends report (Deloitte Consulting LLP, US; from 2024 written by Deloitte's Office of the CTO). Not Deloitte TMT Predictions (captured separately as `deloitte-tmt-predictions`).
- **First edition: 2010.** "Depth Perception: A dozen technology trends shaping business and IT in 2010" (running header "2010 Technology Trends"). Deloitte's own counts agree: 2014 is the "fifth annual", 2015 the "sixth", 2016 the "seventh", 2017 the "eighth", 2020 the "11th annual", 2022 the "13th", 2023 the "14th", 2024 the "15th", 2025 the "16th", 2026 "the 17th annual edition". The 2017 introduction looks back at trends "we wrote about in 2010".
- **Editions up to 2026.** One per year, 2010 to 2026: 17 editions. All 17 are publicly readable and captured.
- **Horizon language.**
  - 2010: the trends are placed "in 2010" (title; "technology trends we see as relevant for 2010").
  - 2011: topics chosen for "potential business impact over the next 18 months".
  - 2012 to 2021: the report covers trends with impact "over the next 18 to 24 months" (stated in each preface or introduction; 2021: "during the next 18 to 24 months and beyond"). From 2017 most chapters restate it for their own trend.
  - 2022: no edition-level horizon; some chapters state 18 to 24 months, the "Field notes from the future" chapter "the next decade".
  - 2023 to 2025: chapters are written as Now / New / Next. 2023 and 2024 say the "new" approaches "stand to become the norm within 18 to 24 months" and project "the coming decade"; 2025 chapters state 18 to 24 months in "New" and the next decade in "Next".
  - 2026: "For 17 years, Tech Trends has explored emerging technologies poised to reshape business in the next 18 to 24 months."
  - Exponentials sections: 2014 "24 months or more" (beyond "our standard 24-month time horizon"); 2015 none stated; 2017 "next three to five years"; 2018 "horizon 3 to 5" (36 to 60 months), AGI and quantum encryption "5+"; 2020 "several more years"; 2022 "next decade".
  - Each entry's `horizon` holds the horizon as printed; `(edition-level)` marks a horizon taken from the edition's general statement rather than the chapter's own sentence.
- **Where each edition is readable.**
  - 2010, 2011, 2013 to 2016: Deloitte Global PDFs under `www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/` (now 404; read through the Wayback Machine).
  - 2012: the Deloitte Global PDF was only captured as 404; read from the US PDF `www.deloitte.com/assets/Dcom-UnitedStates/Local Assets/Documents/us_cons_techtrends2012_013112.pdf` through the Wayback Machine.
  - 2017 to 2023: full PDFs linked from the Deloitte Insights Tech Trends archive page (https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/tech-trends-archive.html).
  - 2024: the edition URL serves the full PDF.
  - 2025 and 2026: full PDFs linked from the Deloitte Insights edition pages.

## What an entry is

- One entry per trend chapter, in printed order. Exponentials, "horizon next" forces (2020), "field notes" technologies (2022) and the 2026 "signals" are entries too, with `section` naming the chapter; the edition's `notes` say how Deloitte framed them (2026: "Signals aren't predictions").
- Not entries: introductions, executive summaries, conclusions, and the "Macro technology forces" chapters of 2019 to 2021 (a taxonomy of nine forces, recorded in `notes`).
- `quote` is one short sentence or chapter subtitle from the edition. Every quote was checked against the PDF text with `scripts/deloitte-tech-trends/verify_quotes.py` (one known mismatch from a page break, noted on 2018 entry 7).
- `target_year` is set only where the text names a year for the trend itself (2010 edition year; 2025 entry 4, 2027; 2026 entry 8, 2030). Third-party figures that Deloitte cites (Gartner, IDC, UBS and others) are not recorded as values; some are mentioned in `note`.

## Deloitte's look-backs (Deloitte's own claims, not Hindsight's grade)

- 2017 introduction: "Looking back, with much humility, we're proud that most of our analysis was right on target." Hits it names: cognitive analytics (2014), security and privacy, user engagement (2010). Misses it names: "in 2010 we predicted that asset intelligence—sensors and connected devices—was on the cusp of driving significant disruption. No question we were a few years premature"; digital identities (2012) waited for a protocol (blockchain).
- 2026 executive summary: "Last year's Tech Trends report predicted that artificial intelligence would become akin to electricity ... This year's report ... proves that hypothesis."
- From 2017 several editions print a "Trending the trends" chart of every earlier trend by year and macro force. Not stored (chart).

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| 2010 | Depth Perception: A dozen technology trends shaping business and IT in 2010 | 2010 | complete | 12 | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2010-dozen-technology-trends.pdf (Wayback) |
| 2011 | Tech Trends 2011: The natural convergence of business and IT | 2011 | complete | 10 | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2011-natural-convergence.pdf (Wayback) |
| 2012 | Tech Trends 2012: Elevate IT for digital business | 2012-01 | complete | 10 | http://www.deloitte.com/assets/Dcom-UnitedStates/Local%20Assets/Documents/us_cons_techtrends2012_013112.pdf (Wayback) |
| 2013 | Tech Trends 2013: Elements of postdigital | 2013 | complete | 10 | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2013-elements-postdigital.pdf (Wayback) |
| 2014 | Tech Trends 2014: Inspiring Disruption | 2014 | complete | 15 (10 trends + 5 exponentials) | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2014-inspiring-disruption.pdf (Wayback) |
| 2015 | Tech Trends 2015: The fusion of business and IT | 2015 | complete | 14 (8 + 6 exponentials) | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2015-fusion-business-it.pdf (Wayback) |
| 2016 | Tech Trends 2016: Innovating in the digital era | 2016 | complete | 8 | https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-tech-trends-2016-innovating-digital-era.pdf (Wayback) |
| 2017 | Tech Trends 2017: The kinetic enterprise | 2017 | complete | 11 (7 + 4 exponentials) | https://www.deloitte.com/content/dam/insights/articles/2017/3468_techtrends2017/dup-techtrends2017.pdf |
| 2018 | Tech Trends 2018: The symphonic enterprise | 2018 | complete | 9 (7 + 2 exponentials) | https://www.deloitte.com/content/dam/insights/articles/2018/tech-trends-2018/4109-techtrends-2018-final.pdf |
| 2019 | Tech Trends 2019: Beyond the digital frontier | 2019 | complete | 6 | https://www.deloitte.com/content/dam/insights/articles/2024/5080_techtrend2019_collection/pdf/DI_TechTrends2019.pdf |
| 2020 | Tech Trends 2020 | 2020 | complete | 8 (5 + 3 horizon next) | https://www.deloitte.com/content/dam/insights/articles/2020/tech-trends-2020/di-techtrends2020.pdf |
| 2021 | Tech Trends 2021 | 2021 | complete | 9 | https://www.deloitte.com/content/dam/insights/articles/2021/6730_tt-landing-page/DI_2021-Tech-Trends.pdf |
| 2022 | Tech Trends 2022 | 2022 | complete | 9 (6 + 3 field notes) | https://www.deloitte.com/content/dam/insights/articles/2024/us164706_tech-trends-2022/pdf/di-tech-trends-2022.pdf |
| 2023 | Tech Trends 2023 | 2023 | complete | 6 | https://www.deloitte.com/content/dam/insights/articles/2023/us175897_tech-trends-2023/DI_tech-trends-2023.pdf |
| 2024 | Tech Trends 2024 | 2023-12 | complete | 6 | https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/2024.html (PDF) |
| 2025 | Tech Trends 2025 | 2024-12-11 | complete | 6 | https://www.deloitte.com/content/dam/insights/articles/2024/us187540_tech-trends-2025/DI_Tech-trends-2025.pdf |
| 2026 | Tech Trends 2026 | 2025-12-10 | complete | 13 (5 + 8 signals) | https://www.deloitte.com/content/dam/insights/articles/2025/us188546_tt-26/pdf/DI_Tech-trends-2026.pdf |

Total: 162 entries.

## What could not be read, and why

- Nothing is missing: every edition from 2010 to 2026 was read in full.
- The Deloitte Global PDF of 2012 (`gx-cons-tech-trends-2012-elevate-digital-business.pdf`) exists only as 404 captures; the US PDF of the same report was used.
- Publication months before 2017 are not printed in the PDFs. The US file names carry date stamps (2010 `042310`, 2011 `021511`, 2012 `013112`); only 2012 is used, as `2012-01`. 2010 and 2011 stay year-only. 2017 to 2023 are year-only (PDF creation dates are of the archived files, not launches). 2024 uses the PDF creation month; 2025 and 2026 use the Deloitte Insights page dates.
- Per-region "Timeliness" ratings (2018) and the "Trending the trends" charts are charts; not stored.

## Open problems

- **Edition-level horizons.** Most horizons come from the edition's general statement, not from each chapter. Graders should read `horizon` with its `(edition-level)` marker: Deloitte says the trends will matter within 18 to 24 months, not that a technology will be mainstream by then.
- **Trends are not forecasts with endpoints.** Most entries say a practice is emerging or growing. They grade as `trend` (persisted, faded, renamed, recycled). Only entries with a stated horizon also grade as `forecast`, and even then most name no measurable endpoint. Candidates with a year: 2025 entry 4 (gen AI embedded in every company's digital product or software footprint by 2027) and 2026 entry 8 (widespread neuromorphic adoption by 2030, footnoted to a third-party report).
- **Shared quotes.** Some exponentials and horizon-next entries share one chapter-level quote (2014 entries 11-15, 2017 entries 8-11, 2018 entries 8-9, 2020 entries 6-8). Their natural keys must include the label, not the quote alone.
- **Label changes across editions** that should become `Revision`s, not new subjects: asset intelligence (2010) to ambient computing / Internet of Things (2015, 2016); user engagement (2010, 2011) to user empowerment (2012) to digital engagement (2014); cloud revolution (2010) to capability clouds (2011) to hyper-hybrid cloud (2012) to cloud orchestration (2014) to multicloud (2023); ERP (2011, 2013) to core renaissance (2015) to reimagining core systems (2016) to the new core (2018) to core revival (2021) to core workout (2024) to the intelligent core (2025); blockchain (2016, 2017, 2018, 2022) to "In us we trust" (2023); AR/VR (2016) to mixed reality (2017) to digital reality (2018) to immersive internet (2023) to spatial computing (2024, 2025); exponential intelligence and ambient experience recur in 2020 and 2022.
- **Executive-summary vs chapter titles.** 2025 entry 5 is "Quantum computing and cybersecurity: A post-quantum cryptography migration guide for leaders" in the contents and "The new math: Solving cryptography in an age of quantum" in the executive summary; 2025 entry 4 differs in its last words ("tech function" vs "tech talent"). The contents title is recorded.
