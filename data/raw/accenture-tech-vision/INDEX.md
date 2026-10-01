# Accenture Technology Vision: collected editions

Facts only: trend label as printed, a short quote stating the trend, a subject label, any horizon or future-facing survey figure, source. Nothing here is graded. Claim type: `trend` (D6).

## Verified before extraction

- **First edition: about 2001, not publicly readable.** The 2025 report says "in 25 years of producing the Technology Vision" and Accenture's 2025 press release calls it the "twenty-fifth annual edition"; the 2024 report says "For more than 20 years, Accenture has developed the Technology Vision report". No pre-2011 edition was found on accenture.com, in the Wayback Machine CDX index of `accenture.com/SiteCollectionDocuments/PDF/` (the 2011-2015 document store), or by web search. Pre-2011 editions (about 2001 to 2010) are recorded as missing; their exact years and titles are unknown.
- **Earliest public edition: 2011**, "Accenture Technology Vision 2011: The technology waves that are reshaping the business landscape" (PDF created 19 January 2011), Wayback copy of `accenture.com/SiteCollectionDocuments/PDF/Accenture_Report_TechVision2011.pdf`.
- **2012** is the edition held in Envisioning's archive (issue #28). Public copy: Wayback, `accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2012.pdf` (capture 2012-02-27).
- **Where each edition is readable:**
  - 2011-2015: Wayback copies of `accenture.com/SiteCollectionDocuments/PDF/...` (2015 also under `_acnmedia/.../Microsites/Documents11/`).
  - 2016-2019: Wayback copies of `accenture.com/t<timestamp>/us-en/_acnmedia/...` and `_acnmedia/PDF-94/...` PDFs.
  - 2020, 2021: live PDFs under `accenture.com/content/dam/accenture/final/a-com-migration/thought-leadership-assets/`.
  - 2022: live `_acnmedia/PDF-174/Accenture-Tech-Vision-2022.pdf` via Wayback.
  - 2023: live PDF under `content/dam/accenture/final/accenture-com/a-com-custom-component/iconic/document/`.
  - 2024, 2025: live web pages `accenture.com/us-en/insights/technology/technology-trends-2024` and `-2025`, plus live PDFs.
- **2026: not found.** As of 2026-10-01, `technology-trends-2026` returns 404 on accenture.com, no Tech Vision 2026 PDF or press release was found, and `accenture.com/.../technology-vision` redirects to the 2024 page. Recorded as missing (not confirmed published), not interpolated.
- The live site redirects old edition URLs (2018-2023) to the 2024 or 2025 page or to the insights index; they cannot be used as sources.

## Fields

`rank` (printed order), `label` (trend name as printed, without the subtitle unless the subtitle is part of the printed name), `section`, `quote` (one verbatim sentence stating the trend, usually the deck sentence under the title), `subject`, `horizon` and `target_year` (only when printed), `metric`/`value`/`unit` (only a printed number about the future, usually an executive survey share about the next N years), `source_url`, `confidence`, `note` (survey figures about the present, edition-level horizons).

## Extra field: `predictions` (2017 only)

The 2017 edition ends each trend chapter with a numbered PREDICTIONS box (18 dated or horizon-bound forecasts, for example "By 2020, there will be entire ecosystems requiring the use of smart contracts in order to participate."). They are separate, gradable forecast claims, not trends, so they sit in a top-level `predictions` array in `2017.json` with `trend_rank`, `quote`, `horizon` or `target_year`, `source_url`, `confidence`. They are not in `entries`, so entry positions (D15) are unaffected. Normalization must decide whether they become `forecast` claims. No other edition 2011-2025 has such a box (every other edition text was searched for a "PREDICTIONS" heading).

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| ~2001-2010 | unknown | unknown | missing | 0 | Not found publicly. Existence inferred from Accenture's own count (25th edition in 2025; 20th anniversary in 2020). |
| 2011 | The technology waves that are reshaping the business landscape | 2011-01 | complete | 8 | Wayback: accenture.com/SiteCollectionDocuments/PDF/Accenture_Report_TechVision2011.pdf |
| 2012 | Accenture Technology Vision 2012 | 2012-01 | complete | 6 | Wayback: accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2012.pdf |
| 2013 | Every Business Is a Digital Business | 2013-02 | complete | 7 | Wayback: accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2013.pdf |
| 2014 | From Digitally Disrupted to Digital Disrupter | 2014-01 | complete | 6 | Wayback: accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2014.pdf |
| 2015 | Digital Business Era: Stretch Your Boundaries | 2015-02 | complete | 5 | Wayback: accenture.com/SiteCollectionDocuments/PDF/Accenture-Tech-Vision-2015-Full-Report.pdf |
| 2016 | People First: The Primacy of People in a Digital Age | 2016-02 | complete | 5 | Wayback: accenture.com/t20160202T102002__w__/.../Technology-Trends-Technology-Vision-2016.pdf |
| 2017 | Technology for People: The Era of the Intelligent Enterprise | 2017-01 | complete | 5 (+18 predictions) | Wayback: accenture.com/t20170206T064234__w__/.../Accenture-TV17-Full.pdf |
| 2018 | Intelligent Enterprise Unleashed | 2018-02 | complete | 5 | Wayback: accenture.com/t20180222T121500Z__w__/.../Accenture-TechVision-2018-Tech-Trends-Report.pdf |
| 2019 | The Post-Digital Era is Upon Us | 2019-02 | complete | 5 | Wayback: accenture.com/_acnmedia/PDF-94/Accenture-TechVision-2019-Tech-Trends-Report.pdf |
| 2020 | We, the Post-Digital People | 2020-02 | complete | 5 | accenture.com/content/dam/accenture/final/a-com-migration/thought-leadership-assets/accenture-technology-vision-2020-full-report.pdf |
| 2021 | Leaders Wanted: Masters of change at a moment of truth | 2021 (month not verified) | complete | 5 | accenture.com/content/dam/accenture/final/a-com-migration/thought-leadership-assets/accenture-tech-vision-2021-full-report.pdf |
| 2022 | Meet Me in the Metaverse | 2022-03 | complete | 4 | Wayback: accenture.com/_acnmedia/Thought-Leadership-Assets/PDF-5/Accenture-Meet-Me-in-the-Metaverse-Full-Report.pdf |
| 2023 | When Atoms meet Bits | 2023 (month not verified) | complete | 4 | accenture.com/content/dam/.../iconic/document/Accenture-Technology-Vision-2023-Full-Report.pdf |
| 2024 | Human by design | 2024-01-09 | complete | 4 | accenture.com/us-en/insights/technology/technology-trends-2024 |
| 2025 | AI: A Declaration of Autonomy | 2025-01-07 | complete | 4 | accenture.com/us-en/insights/technology/technology-trends-2025 |
| 2026 | - | - | missing | 0 | Not found as of 2026-10-01 (404 on accenture.com, no PDF or press release found). |

Total: 15 editions captured, 78 trend entries, plus 18 predictions in 2017.

## What could not be read, and why

- **Editions before 2011.** Accenture says the series is about 25 years old, but no pre-2011 edition was found: not on accenture.com, not in the Wayback CDX index of the 2011-2015 document store, not by web search (2 searches). They may have been client-only or published by Accenture Technology Labs under another name. Years, titles and counts unknown; nothing interpolated.
- **2026.** No Technology Vision 2026 found. It may not exist yet, may have been renamed, or may sit at a URL not tried (`technology-trends-2026`, `tech-vision-2026`, `technology-vision-2026`, `document-3`/`document-4` PDF names all 404).
- **Live accenture.com edition pages for 2016-2023** redirect to the 2024/2025 page or the insights index; the PDFs were used instead.
- **2022 `_acnmedia/PDF-174/Accenture-Tech-Vision-2022.pdf`** is a French executive summary; the English full report was read from the Wayback copy of `Accenture-Meet-Me-in-the-Metaverse-Full-Report.pdf`.
- **Industry and country editions** (Banking, Insurance, Retail, Energy, Life Sciences, Federal, country cuts) were not captured. They are spin-offs of the global edition.

## Open problems

- **First edition year conflict.** 2020 report: "This year marks the 20th anniversary of our Tech Vision" (implies a 2000 start). Accenture's 2025 press release: "twenty-fifth annual edition" (implies 2001 as the first edition). Both fit a first edition in 2000 or 2001; unresolved.
- **Publication months for 2021 and 2023** are not verified: the readable PDFs are later re-exports (2021-08-02, 2023-06-21). Survey fieldwork dates bound them (2021: fielded Dec 2020 to Jan 2021; 2023: Dec 2022 to Jan 2023).
- **Edition-level horizons** are copied into each entry's `horizon` only where the edition states one for all trends (2011 "next five years", 2012 "next few years", 2015-2016 "next three to five years", 2017-2018 "next three years", 2022 "next decade", 2023 "a decade into the future"). Where an entry has its own survey horizon, that replaces the edition horizon and the edition horizon is in the note. Graders should treat the edition horizon as weak: it frames the report, not each trend.
- **Survey figures are executive opinion**, not forecasts by Accenture. Where one states a future horizon it is in `metric`/`value`/`unit` with `unit` "percent of executives surveyed" (or consumers). These are opinions measured at the time; they are gradable only as what executives expected, not as Accenture's prediction. Accenture's own forecasts are rare: 2013 cloud share of IT spend (14 percent by 2016), 2016 digital economy (25 percent of world economy by 2020), and the 2017 predictions boxes.
- **Survey figure attribution** in 2021 and 2023 PDFs depends on layout: the extracted text puts the number after its statement in some places and before in others. 2021 (two figures) and 2023 Generalizing AI were checked by word position; 2023 "Our forever frontier" (95%) was matched by text order only (confidence medium).
- **Labels with subtitles.** From 2014 most trends are printed as "Name: subtitle". The label field holds the name; the subtitle is in the note. Graders and the Subject mapper may want the subtitle.
- **Revision candidates** (same subject, new label, for `Revision` rows): cloud (2011 Cloud Computing Will Create More Value, 2012 PaaS-enabled agility, 2013 Beyond the Cloud); security (2011 IT Security, 2012 Orchestrated analytical security, 2013 Active Defense, 2014 Architecting resilience, 2019 Secure US to Secure ME); data (2011 Data Takes its Rightful Place, 2012 Converging data architectures and Industrialized data services, 2013 Data Velocity, 2014 Data supply chain, 2018 Data Veracity, 2023 Your data, my data, our data); AI (2015 Intelligent Enterprise, 2016 Intelligent Automation, 2017 AI Is the New UI, 2018 Citizen AI, 2020 AI and Me, 2023 Generalizing AI, 2024 A match made in AI and Meet my agent, 2025 Binary Big Bang); workforce (2014 From workforce to crowdsource, 2015 Workforce Reimagined, 2016 Liquid Workforce, 2017 Workforce Marketplace, 2019 Human+ Worker, 2021 Anywhere, Everywhere, 2025 New Learning Loop); platforms and ecosystems (2015 Platform (R)evolution, 2016 Platform Economy and Predictable Disruption, 2017 Ecosystem Power Plays, 2018 Frictionless Business, 2021 From Me to We); robotics (2020 Robots in the Wild, 2025 When LLMs Get Their Bodies); XR and metaverse (2018 Extended Reality, 2022 WebMe, 2024 The space we need); digital twins (2021 Mirrored World, 2022 Programmable World). Subject mapping was not done.
- **Read method.** All quotes were taken from `pdftotext` output or stripped HTML, then checked: every quote and label matches its source text after removing spaces and punctuation. pdftotext dropped inter-word spaces in 2017-2021 headings and some body text; spaces were restored in quotes.
