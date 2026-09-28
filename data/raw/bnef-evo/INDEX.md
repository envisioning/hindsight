# BloombergNEF Electric Vehicle Outlook: global EV sales and share forecasts

Facts only: edition, scenario, metric, target year, value, unit, source, short quote. Nothing here is graded.

## Verify-first answers

- **Editions.** BNEF's Long-Term Electric Vehicle Outlook (EVO) is annual from 2016. The EVO 2019 executive summary calls itself BNEF's "fourth annual" EVO, so 2016 is the first. Editions 2016 to 2026 (11) all exist. 2026 (16 June 2026) is the latest.
- **Paywall.** The full report is paywalled. This folder uses only figures that BNEF published openly: its own press releases on `about.bnef.com`, the public EVO landing page, a public EVO 2019 executive summary PDF, and a BNEF presentation filed in a public California Energy Commission docket. Where BNEF's own page was not found, reputable press or an SEC filing that quotes BNEF is used, with `confidence: medium`.
- **What the public material gives.** Each release gives a few headline numbers only. Target years change from edition to edition (2040 in 2016 to 2020; 2025/2030/2040 in 2019 and 2023; 2027 and 2040 in 2024; 2035 and 2040 in 2025 and 2026). No edition's public material gives a complete, consistent set of target years.
- **Scenarios.** 2016 to 2020: a single BNEF forecast (no scenario name). From 2021: the Economic Transition Scenario (ETS) is the base case (the 2024 release calls it "BNEF's base case scenario") and is marked `main_scenario: true`. The Net Zero Scenario (NZS) is a normative pathway; its rows are `claim_type: scenario`, `main_scenario: false`.
- **Price parity.** Stated in 2016 (mid-2020s), 2017 (upfront parity by 2029; lifetime parity in the first half of the 2020s), 2018 (from 2024, almost all segments by 2029, via republication), 2019 (mid-2020s in most segments; first segment by 2022), 2020 (around 2025). From 2021 the public releases give no global parity year.

## Editions

| Edition | Published | Status | Entries | Target years | Main source | Notes |
|---|---|---|---|---|---|---|
| 2016 | 2016-02-25 | complete | 5 | 2040 | BNEF press release | 35% of new light-duty sales, 41 million EVs in 2040. Parity "mid-2020s". |
| 2017 | 2017-07-06 | complete | 6 | 2021, 2040 | BNEF press release + Utility Dive | 54% of new light-duty sales in 2040. Upfront parity by 2029. |
| 2018 | 2018-05-21 | complete | 7 | 2025, 2030, 2040 | BNEF press release + European Lithium republication | 11 million (2025), 30 million (2030); 28% (2030), 55% (2040). |
| 2019 | 2019-05-15 | complete | 7 | 2025, 2030, 2040 | BNEF public executive summary PDF | 10/28/56 million; 57% in 2040. Scope label changes to "passenger vehicles". |
| 2020 | 2020-05-19 | complete | 10 | 2020, 2023, 2030, 2040 | BNEF press release + Livent 10-K | 2030 and 2040 unit figures (25.8, 54.9 million) from the 10-K, medium. |
| 2021 | 2021-06-10 | partial | 6 | 2030, 2040 | Trade press (GreentechLead) | BNEF's own 2021 release not found. ETS 34% (2030), 70% (2040); NZS ~60% (2030). |
| 2022 | 2022-06-01 | partial | 3 | 2025, 2030 (NZS) | BNEF press release | Only 21 million in 2025 for ETS. No ETS share for 2030 or 2040 in public material. |
| 2023 | 2023-06-08 | complete | 7 | 2025, 2030, 2040 | BNEF press release | ETS: 22/42/75 million; 26/44/75%. |
| 2024 | 2024-06-12 | complete | 5 | 2027, 2040 | BNEF press release | >30 million and 33% (2027); 73 million and 73% (2040). |
| 2025 | 2025-06-18 | complete | 5 | 2025, 2035, 2040 | BNEF press release | First downward revision. 56% (2035), 70% (2040). |
| 2026 | 2026-06-16 | complete | 5 | 2026, 2035, 2040, 2047 | BNEF press release + EVO landing page | 23.3 million and 27% (2026); 52% (2035). |

"Complete" means the edition's public headline figures are captured. It does not mean the full report was read.

Every edition file also has `base_year` rows where the release states a historical value (for example 2015 sales of 462,000 in EVO 2016). These are not projections and must not be graded.

Actuals: `realized.json` (IEA Global EV Outlook 2026 vintage, via Our World in Data, electric car sales and sales share, World, 2010 to 2025). Built by `scripts/bnef-evo/realized.py`.

## Subjects and label changes (Revisions)

- Denominator: "light duty vehicle" sales in 2016 to 2018; "passenger vehicle" sales from 2019. Record as a `Revision` (renamed).
- 2021 headline uses "zero-emission passenger cars" instead of "EVs". Record as a `Revision` (renamed).
- 2040 sales share across editions: 35% (2016), 54% (2017), 55% (2018), 57% (2019), 58% (2020), 70% (2021), 75% (2023), 73% (2024), 70% (2025). 2022 and 2026 public material has no 2040 passenger share (2026 gives "over two-thirds" of car, van and truck sales combined).
- 2030 sales share: 28% (2018), 28% (2020), 34% (2021), 44% (2023).

## Open problems

- EVO 2021: BNEF's own press page was not found (pveurope.eu redirect loop, greencarcongress.com DNS failure, environmentalleader.com 404). Figures come from GreentechLead, medium.
- EVO 2022: no ETS sales share for 2030 or 2040 in any public BNEF source found.
- EVO 2018: the 2040 fleet share and price parity come from a third-party republication of the BNEF release, medium.
- EVO 2026: the 52% by 2035 sentence does not say "sales"; BNEF's landing page says "surpass 50% of sales" in 2035. Read as a sales share, medium.
- InsideEVs (2018) returned 403; not needed after other sources.
- Some quotes are condensed by the fetch tool. Rows with `confidence: medium` note this.
