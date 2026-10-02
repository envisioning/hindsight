# McKinsey Technology Trends Outlook: collected editions

## Verified before extraction

- **First edition: 2021.** "The top trends in tech", June 2021: an online interactive plus an 18-slide executive-summary PDF (10 trends). The 2025 report is labelled "Fifth edition" and the 2026 report "Sixth edition", which fixes 2021 as the first. The 2022 report says it "builds on the trend research we shared last year".
- **Editions to 2026:** 2021, 2022, 2023, 2024, 2025, 2026. One per year; no year has two editions.
- **Where each is readable:** mckinsey.com refuses scripted access and WebFetch (TLS read timeouts, 403 via reader proxies). Every PDF was read from the Wayback Machine. 2026's PDF has no Wayback capture; only its web article (snapshot 2026-09-15) was read.
- **What is not readable:** the 2021 online interactive (JavaScript-rendered; the Wayback copy has no trend text), the 2026 143-page PDF (not archived; mckinsey.com blocks access). Per-trend adoption scores in 2022-2025 are drawn only as chart marks, never printed as numbers.

Facts only: trend label, group, one short publisher quote per entry, equity-investment and job-posting figures as printed (in notes, as context), and dated forward-looking statements. No charts or figures are reproduced. Nothing here is graded.

## Fields

`rank` (printed trend order; forecast entries carry the rank of the trend they sit under; null for 2026), `label` (trend name as printed), `section` (group), `quote` (verbatim, at most 400 characters), `subject`, `kind` (`trend` or `forecast`), `target_year`, `horizon`, `metric`/`value`/`unit` (forecasts only), `source_url`, `confidence`, `note`.

- Trend entries carry the edition's printed equity investment (previous calendar year) and job-postings change in `note`. These are past-year figures, not forecasts. 2021 and 2022 print no per-trend figures in text.
- Forecast entries: every forward-looking statement in a trend's pages that names a year at or after the edition year, except company or government plans and commitments (for example AT&T, Joby, Aurora, Cargill, US Space Force, the EU eIDAS 2 deadline), requirements to reach net zero (Paris, $9.2 trillion a year), and conditional statements ("if all announced projects are realized"). Third-party projections that the report prints (IDC, Gartner, Northern Sky Research, Polaris) are kept, with the attribution in `note`.
- Undated forward statements ("in the next decade", "~30× reduction in software development time") are noted on the trend, not captured as forecasts.

## Label changes across editions (Revision candidates)

- Future of connectivity (2021) -> Advanced connectivity (2022-2026).
- Distributed infrastructure (2021) -> Cloud and edge computing (2022-2025); dropped in 2026 ("matured and become widely adopted").
- Next-generation computing (2021) -> Quantum technologies (2022-2026).
- Future of programming (2021) -> Next-generation software development (2022-2024) -> folded into Artificial intelligence (2025, stated by the report); Agentic software development is new in 2026.
- Trust architecture (2021) -> Trust architectures and digital identity (2022-2023) -> Digital trust and cybersecurity (2024-2025) -> Cybersecurity and trustworthy systems (2026).
- Bio Revolution (2021) -> Future of bioengineering (2022-2025) -> Future of life sciences and bioengineering (2026).
- Future of clean technologies (2021) -> Future of clean energy + Future of sustainable consumption (2022) -> Electrification and renewables + Climate technologies beyond electrification and renewables (2023-2024) -> Future of energy and sustainability technologies (2025-2026).
- Applied AI (2021-2024) + Industrializing machine learning (2022-2024) + Generative AI (2023-2024) + Next-generation software development (2022-2024) -> Artificial intelligence (2025, "an overarching artificial intelligence category replaces these four trends") -> AI infrastructure and model architectures (2026).
- Dropped: Next-level process automation and virtualization and Next-generation materials (after 2021); Web3 (after 2023); Next-generation software development, Industrializing ML (after 2024).
- Added: Industrializing ML, Web3, Immersive-reality technologies, Future of mobility, Future of space technologies (2022); Generative AI (2023); Future of robotics (2024); Agentic AI, Application-specific semiconductors (2025); Agentic software development, AI for scientific discovery and engineering (2026).

## Editions

| Edition | Title | Published | Status | Entries | Trends | Forecasts | Main source |
|---|---|---|---|---|---|---|---|
| 2021 | The top trends in tech (executive summary) | 2021-06 | complete | 16 | 10 | 6 | https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%20final/tech-trends-exec-summary.pdf (Wayback 2021-09-30) |
| 2022 | McKinsey Technology Trends Outlook 2022 | 2022-08 | complete | 36 | 14 | 22 | https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202022/mckinsey-tech-trends-outlook-2022-full-report.pdf (Wayback 2022-09-10) |
| 2023 | Technology Trends Outlook 2023 | 2023-07 | complete | 28 | 15 | 13 | https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202023/mckinsey-technology-trends-outlook-2023-v5.pdf (Wayback 2025-02-01) |
| 2024 | Technology Trends Outlook 2024 | 2024-07 | complete | 22 | 15 | 7 | https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202024/mckinsey-technology-trends-outlook-2024.pdf (Wayback 2024-07-17) |
| 2025 | Technology Trends Outlook 2025 (fifth edition) | 2025-07 | complete | 29 | 13 | 16 | https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202025/mckinsey-technology-trends-outlook-2025.pdf (Wayback 2025-07-28) |
| 2026 | McKinsey technology trends outlook 2026 (sixth edition) | 2026-09-15 | partial | 17 | 14 | 3 | https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech (web article, Wayback 2026-09-15) |

## Not read, and why

- **2026 PDF** (`.../the%20top%20trends%20in%20tech%202026/mckinsey%20technology%20trends%20outlook%202026.pdf`): no Wayback capture; mckinsey.com times out for curl and WebFetch and returns 403 to reader proxies. Two secondary pages (theideafarm.com, advisoranalyst.com) did not list the 14 trends in order. Result: no printed order, no group per trend, no per-trend investment or job postings, and only the 3 forward statements on the web page. Re-capture when the PDF is reachable.
- **2026 PDF, second attempt (2026-10-02, issue #27): still not readable. Nothing appended.** Tried:
  - Wayback CDX, `matchType=prefix` on the 2026 media folder (`.../the%20top%20trends%20in%20tech%202026/`): only two captures, the thumbnail JPEG and Exhibit 1 (`techtrends2026-l1-v7_ex1.svgz`, 2026-09-15). No capture of the PDF under any spelling (spaces, hyphens, `?shouldIndex=false`); `web/timemap/link` for the PDF is empty; `web/2026id_/` replay returns 404.
  - Wayback CDX for the article (`/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech`): the only 2026 edition capture with status 200 is 2026-09-15 18:31 (the one already read); the 2026-09-16 to 2026-09-27 captures are 403 pages. The `/capabilities/mckinsey-digital/...` path is 403 in every 2026 capture. No `mckinsey.com.br` captures.
  - The archived article's page data names one PDF only (`fullReportPDF`, the path above); executive summary, appendix and article PDFs are null. Exhibit 1 SVG has its text converted to outlines (no extractable labels).
  - archive.today (`archive.ph` timemap): the article has one memento, 2025-12-07 (the 2025 edition); the PDF has none.
  - Direct `curl` with a Chrome User-Agent and Accept/Accept-Language headers: mckinsey.com, mckinsey.com.br and mckinsey.de time out or reset (curl exit 28, 56, 92 over HTTP/2 and HTTP/1.1); mckinsey.com.cn returns HTTP 567.
  - Reader proxy (r.jina.ai): the article returns 403; the PDF path returns 404 from the origin (`WebContentNotFound`), with and without `?shouldIndex=false` and under five other file-name spellings, while the 2026 thumbnail in the same folder and the 2025 PDF return 200. The PDF appears to be withdrawn or renamed at the origin, not only blocked.
  - WebFetch of the PDF: timeout. Three web searches: no publisher-hosted mirror. Secondary coverage (fintechnews.org, mindrift.ai, secureworld.io, advisoranalyst.com, theideafarm.com) gives no trend order or groups; search-engine summaries of it mention per-trend figures (for example agentic software development investment of about $5 billion in 2025 and more than $61 billion in the first half of 2026), but these are not the publisher's text and were not captured.
  - All 17 existing 2026 quotes were re-checked verbatim against the 2026-09-15 article snapshot: all match. No dated forward statement on that page was missed (the only other dated sentence, "By 2021, this had more than doubled to 71 years", is past).
- **2021 interactive** ("The top trends in tech", June 2021): JavaScript-rendered; the archived HTML has no trend content. The executive summary covers all 10 trends.
- **Adoption scores 2022-2025**: shown as chart marks only. Not recorded rather than read off a chart.
- **2022 per-trend investment**: only bubble sizes in Exhibit 1. Not recorded.
- **2023 PDF first capture** (2024-09-14) is truncated at 1 MB; the 2025-02-01 capture of the same URL is complete (81 pages).

## Open problems

- **Slide reconstructions (2021, 2022).** pdftotext interleaves slide columns, so 14 of 16 quotes in 2021 and 15 forecast quotes in 2022 are reassembled from column fragments. Every word is checked to be printed, and the reading order was checked by hand, but they are not contiguous strings in the extracted text. Most uncertain: 2022 space ">1,400 companies ... 600+ today to 1,000+ in 2030" (which group grows is ambiguous), 2022 "~21% ... reaching ~$600 million by 2026" (market scope unclear), 2022 "~15% CAGR ... Earth observation" (column boundaries).
- **2025 private wireless market** ($32.86 billion by 2032): the sentence does not name the market; inferred from context (medium).
- **2026 rank is null** and 2026 trend quotes are mostly exhibit-description sentences from the web page, not the report's trend definitions. The 2026 forecast entries use descriptive labels ("Equity investment across trends") because they are not tied to one trend.
- **2023 two quotes** drop a footnote marker ("minimobility45") and a running page header inside the sentence.
- **Opening sentences split by columns**: 2023 next-generation software development and advanced connectivity, 2024 cloud, quantum and robotics, 2025 advanced connectivity quote a later complete sentence instead of the opening one.
- **Investment figures** are the report's own PitchBook-based equity investment (private and public market capital raises), not capex. 2023 notes that capex-related investment for electrification and renewables was $578 billion and for climate technologies $98 billion (from McKinsey's Global Energy Perspective).
- **Subject mapping** to Hindsight `Subject`s and `Revision` rows was not done; the label-change list above is the input for it.
