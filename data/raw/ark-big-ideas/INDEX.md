# ARK Invest Big Ideas: collected editions

Facts only: the chapter ("idea"), a short quote, the metric, value, unit and target year of each explicit numeric forecast, plus the page and source. Charts, figures and body text are not stored (see NOTICE.md). Nothing here is graded. Asset price targets are recorded only as stated facts (metric, value, target year), with no commentary.

## Verify-first answers

- **First edition: 2017.** The Big Ideas 2026 press release calls 2026 the "10th annual" report, and ARK's site says the series has run "since 2017". Ten editions, 2017 to 2026, all found and read.
- **Access.** Every edition is a free PDF. The ark-invest.com landing pages sit behind an email form and return HTTP 403 to curl and WebFetch. Direct PDF links on research.ark-invest.com (HubSpot) and assets.arkinvest.com work without the form. The 2025 PDF was read from ARK Invest Europe's copy through an Internet Archive snapshot (the live europe.ark-funds.com link returns a Cloudflare challenge). The 2017 hubfs link (`Infographics/BIG IDEAS 2017.pdf`) is dead and has no archived copy; the 2017 PDF was found on assets.arkinvest.com.
- **Which targets carry explicit years.** 2017 and 2018 mostly use 2020 and 2022 targets, or relative horizons ("in 20 years", "early 2030s"). 2019 to 2021 use five-year targets (2023, 2024, 2025). From 2022 on, nearly every sizing claim is dated 2030, with some five-year targets (2026, 2027). Of 262 entries, 241 carry a calendar target year and 21 carry only a relative horizon (`target_year: null`, `horizon` set).
- **Asset price targets.** Bitcoin price targets appear in 2022 (over USD 1 million by 2030), 2023 (bear/base/bull 2030) and 2025 (bear/base/bull 2030). 2024 and 2026 state no per-coin price in the text layer; 2026 gives a 2030 market capitalization instead. Ether and cryptoasset market values appear in 2021 to 2026. All are recorded as stated facts only.
- **Not part of the series.** ARK Funds' "Investment Opportunity Report" (2025, 2026) reuses Big Ideas material for fund marketing. It is a separate publication and is not captured.

## Editions

| Edition | Published | Status | Entries | Pages | Source |
|---|---|---|---|---|---|
| 2017 | 2017 (PDF dated 2017-06-13) | complete | 8 | 65 | https://assets.arkinvest.com/media-8e522a83-1b23-4d58-a202-792712f8d2d3/30ebc53a-c5d0-479f-8bea-63f1a9fbdc70/big-ideas-2017.pdf |
| 2018 | 2018 (marked "Updated March 19, 2018") | complete | 15 | 75 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Infographics/Big%20Ideas%202018%20-%20ARK%20Invest.pdf |
| 2019 | 2019-01-14 | complete | 22 | 94 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/Big-Ideas-2019-ARKInvest.pdf |
| 2020 | 2020-02-06 | complete | 28 | 81 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/Big%20Ideas%202020-Final_011020.pdf |
| 2021 | 2021-01-26 | complete | 36 | 112 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/ARK%E2%80%93Invest_BigIdeas_2021.pdf |
| 2022 | 2022-01-25 | complete | 36 | 132 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/ARK_BigIdeas2022.pdf |
| 2023 | 2023-01-31 | complete | 42 | 153 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Big_Ideas/ARK%20Invest_013123_Presentation_Big%20Ideas%202023_Final.pdf |
| 2024 | 2024-01-31 | complete | 34 | 163 | https://assets.arkinvest.com/media-8e522a83-1b23-4d58-a202-792712f8d2d3/8cea086f-21b4-47bf-8ac6-666b96a84a04/ARK-Invest_Big-Ideas-2024.pdf |
| 2025 | 2025-02-04 | complete | 21 | 149 | https://europe.ark-funds.com/wp-content/uploads/2025/02/ARK-Invest-Big-Ideas-2025.pdf (read via web.archive.org) |
| 2026 | 2026-01-21 | complete | 20 | 111 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Big_Ideas/ARKInvest%20BigIdeas2026.pdf |

No edition is missing.

## Counts

- 262 entries in 10 editions. Confidence: 214 high, 45 medium, 3 low.
- Target years: 2020 (5), 2021 (2), 2022 (11), 2023 (9), 2024 (18), 2025 (30), 2026 (9), 2027 (11), 2028 (4), 2029 (3), 2030 (133), 2035 (4), 2037 (2), none (21). 75 entries have a target year at or before 2025 and can be graded now.
- **Skipped unquantified or undated claims: about 210 in total** (per edition, roughly: 2017 ~12, 2018 ~15, 2019 ~15, 2020 ~15, 2021 ~25, 2022 ~20, 2023 ~25, 2024 ~30, 2025 ~20, 2026 ~20). These are claims with no number ("oil demand could peak before the end of the decade", "digital wallets could upend traditional banks within five years"), numbers with no year or horizon (CRISPR USD 70 billion annual revenue; generalizable robotics USD 24+ trillion), conditional hypotheticals with no date (bitcoin price impact of a 1% corporate cash allocation), third-party forecasts that ARK only cites (GE, Allied Market Research, a crypto community survey), and chart-only values that the PDF text layer does not map reliably. Each edition's `notes` lists examples.

## Entry fields

`idea` (ARK's chapter name), `quote` (max 400 chars; `...` marks a cut), `target_year`, `horizon` (relative horizon when stated, for example "20 years"), `metric`, `value` (string; ranges as "1-5"; `unit` says "lower bound" or "upper bound" for "more than" / "up to"), `unit`, `subject` (plain label, Hindsight's own), `page` (PDF page), `source_url`, `confidence`, `note`.

`confidence` is high for a sentence in the slide body, medium for a value read from a chart label or a reassembled two-column text layer, low where the label-to-value mapping or the slide context is uncertain.

## Revisions (label or value changes across editions, for `Revision` rows later)

- **EV sales:** 17M in 2022 (2017, 2018) -> 26.4M in 2023 (2019) -> 37M in 2024 (2020) -> 40M in 2025 (2021) -> 40M in 2026 (2022) -> 60M in 2027 (2023) -> 74M in 2030 (2024). Scope changes from "EV" to "battery electric vehicle" in 2022.
- **EV price parity:** "by 2022" (2017 to 2019), crossover between 2020 and 2022 (2020), "in 2023" / undercut by 25-35% in 2025 (2022).
- **Autonomous taxi cost per mile:** USD 0.35 in 2020 (2017, 2018 at 2021) -> USD 0.26 (2019) -> USD 0.25 (2020 to 2024, dated 2024 or 2030) -> USD 0.25 in 2035 (2025).
- **Autonomous ride-hailing value:** USD 7T by 2028 (2019) -> USD 5T 2024 and USD 9T 2029 (2020) -> USD 3.8T EV by 2025 (2021) -> USD 11.7T by 2026 (2022) -> USD 14T in 2027 (2023) -> USD 28T in 2030 (2024) -> about USD 34T in 2030 (2025, 2026).
- **3D printing market:** USD 41B 2020 (2017, low confidence) -> USD 65B 2022 (2018) -> USD 94B 2023 (2019) -> USD 97B 2024 (2020) -> USD 120B 2025 (2021) -> USD 180B 2030 (2024, 2025).
- **Genome sequencing cost:** under USD 100 by 2022 (2018) -> USD 200 in 2023/2024 (2019, 2020; 2020 footnote says ARK moved its USD 100-by-2023 target) -> USD 10 by 2030 (2026).
- **Mobile payment volume:** USD 15T 2020 (2017) -> USD 30T 2022 (2018) -> USD 55T 2022 (2019).
- **Deep learning / AI market value:** USD 17T "in 20 years" (2017, 2018) -> USD 30T "in 20 years" (2019) -> USD 30T by 2037 (2020, 2021) -> USD 87T by 2030 (2022).
- **Autonomous logistics revenue:** USD 900B 2030 (2022, 2024) -> USD 1-2T 2030 (2023) -> ~USD 860B 2030 (2025) -> USD 480B 2030 (2026).
- **Bitcoin 2030:** over USD 1M (2022) -> bear/base/bull USD 258.5K / 682.8K / 1.48M (2023) -> USD 300K / 710K / 1.5M (2025) -> about USD 16T market cap (2026).
- **Chapter labels change:** "Mobility-as-a-Service" (2017, 2018) -> "Autonomous Ride-Hailing" (2019 to 2022) -> "Autonomous Ride-Hail" (2023) -> "Robotaxis" (2024, 2025) -> "Autonomous Vehicles" (2026). "Deep Learning" (2017 to 2021) -> "Artificial Intelligence" (2022 on). "Frictionless Value Transfers" / "Mobile Payments" -> "Digital Wallets".

## Realized values

`realized.json` holds IEA global electric car sales for 2022 to 2025 (partial). Other matured targets are not yet collected (see its `notes`).

## Open problems and things that look wrong in the source

- **2023 oil demand:** the p110 headline says oil demand "Could Decline 30% By 2030"; the body says 5% by 2030 and 30 million barrels per day by 2035. Both are recorded in the 2023 note.
- **2024 precision therapies:** the same 2030 enterprise value appears as about USD 4.5T (p88, p97) and about USD 4T (p95), at 28% or 26% growth.
- **2023 bitcoin:** the headline says "could exceed $1 million by 2030"; the table's base case is USD 682,800 (the bull case is USD 1.48M).
- **2021 drone hardware:** p89 says drone hardware revenues of about USD 100B by 2025, while p77 says USD 14B hardware sales by 2025. Recorded with low confidence.
- **2017 and 2018 publication dates** are not confirmed. The only copies found are later updates (June 2017; March 2018).
- **Chart values.** Several entries take numbers from chart labels in the PDF text layer. Where labels could belong to more than one bar, confidence is medium or low and the note says so.
- **Subjects** are plain labels, not yet mapped to `Subject` ids.
