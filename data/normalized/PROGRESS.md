# Normalize progress

Written by `pnpm normalize`. One line per source. Re-run the command to pick up sources that are not yet captured.

| Source | Status | Editions | Claims | Skipped rows | Natural key (ids.json) | Time |
|---|---|---|---|---|---|---|
| envisioning-technology | normalized | 2 | 229 | 0 | raw placement id (et-<edition>-<nnn>); the id number is kept | 2026-10-02T18:18:42Z |
| envisioning-education | normalized | 1 | 42 | 0 | raw placement id (edu-<edition>-<nnn>); the id number is kept | 2026-10-02T18:18:42Z |
| envisioning-health | normalized | 1 | 55 | 0 | raw placement id (health-<edition>-<nnn>); the id number is kept | 2026-10-02T18:18:42Z |
| envisioning-horizons | normalized | 1 | 88 | 0 | raw placement id (hz-<edition>-<nnn>); the id number is kept | 2026-10-02T18:18:42Z |
| gartner-hype-cycle | normalized | 31 | 941 | 0 | label (exact, as captured); unique within an edition | 2026-10-02T18:18:42Z |
| mit-tr-10-breakthrough | normalized | 25 | 254 | 0 | label (exact, as captured); unique within an edition | 2026-10-02T18:18:42Z |
| gartner-strategic-predictions | normalized | 21 | 224 | 0 | kind + quote with case, spaces and punctuation removed | 2026-10-02T18:18:42Z |
| deloitte-tmt-predictions | normalized | 25 | 466 | 0 | section + quote with case, spaces and punctuation removed | 2026-10-02T18:18:42Z |
| idc-futurescape | normalized | 12 | 204 | 0 | futurescape + quote with case, spaces and punctuation removed | 2026-10-02T18:18:42Z |
| ark-big-ideas | normalized | 10 | 262 | 0 | metric + target_year + horizon + value + unit | 2026-10-02T18:18:42Z |
| bnef-evo | normalized | 11 | 58 | 8 base-year row (historical value, not a projection) | metric + target_year + scenario | 2026-10-02T18:18:42Z |
| wef-global-risks | normalized | 21 | 355 | 0 | ranking + rank + label | 2026-10-02T18:18:42Z |
| imf-weo | normalized | 73 | 1560 | 0 | economy name + target_year + horizon | 2026-10-02T18:18:43Z |
| iea-weo | normalized | 26 | 349 | 86 base-year row (historical value, not a projection) | technology + metric + target_year + scenario; edition-level quotes: quote text | 2026-10-02T18:18:43Z |
| eia-aeo | normalized | 43 | 9390 | 0 | series + unit + target_year + dollar_year | 2026-10-02T18:18:43Z |
| bcb-focus | normalized | 108 | 811 | 0 | indicator label + target_year + horizon | 2026-10-02T18:18:43Z |
| oecd-economic-outlook | normalized | 73 | 954 | 0 | economy name + target_year + horizon | 2026-10-02T18:18:43Z |
| world-bank-gep | normalized | 49 | 834 | 0 | economy name + target_year + horizon | 2026-10-02T18:18:43Z |
| fed-sep | normalized | 76 | 1541 | 553 median computed by Hindsight from individual projections (not published at the time) | variable + statistic + horizon + target_year | 2026-10-02T18:18:43Z |
| ecb-projections | normalized | 104 | 566 | 0 | variable + statistic + horizon + target_year | 2026-10-02T18:18:43Z |
| cbo-projections | normalized | 112 | 1557 | 0 | metric + horizon + target_year + target_period | 2026-10-02T18:18:43Z |
| obr-forecasts | normalized | 33 | 892 | 28 memo row (restated or supplementary forecast, not the headline forecast of this EFO) | metric + unit + horizon + target_year | 2026-10-02T18:18:43Z |
| bp-energy-outlook | normalized | 14 | 239 | 19 base-year row (historical value, not a projection) | metric + target_year + scenario | 2026-10-02T18:18:43Z |
| eurasia-top-risks | normalized | 20 | 279 | 0 | ranking + label | 2026-10-02T18:18:43Z |
| economist-world-ahead | normalized | 40 | 154 | 0 | kind + subject + quote with case, spaces and punctuation removed | 2026-10-02T18:18:43Z |
| kurzweil | normalized | 5 | 287 | 0 | target_year + quote (or paraphrase) with case, spaces and punctuation removed | 2026-10-02T18:18:43Z |
| pew-elon-imagining | normalized | 34 | 67 | 0 | label | 2026-10-02T18:18:43Z |
| mckinsey-tech-trends | normalized | 6 | 148 | 0 | kind + label + quote with case and punctuation removed | 2026-10-02T18:18:43Z |
| accenture-tech-vision | normalized | 15 | 96 | 0 | entries: label; 2017 predictions box: prediction + quote with case and punctuation removed | 2026-10-02T18:18:43Z |
| deloitte-tech-trends | normalized | 17 | 162 | 0 | section + label | 2026-10-02T18:18:43Z |
| trendwatching | normalized | 19 | 186 | 0 | section + label | 2026-10-02T18:18:43Z |
| a16z-big-ideas | normalized | 4 | 189 | 0 | label + author | 2026-10-02T18:18:43Z |
| ftsg-tech-trends | normalized | 11 | 4185 | 18 contents entry that is not a trend (section heading or divider) | section + subsection + label + rank | 2026-10-02T18:18:44Z |
| nic-global-trends | normalized | 7 | 137 | 0 | kind + label + quote with case and punctuation removed | 2026-10-02T18:18:44Z |
| shell-scenarios | normalized | 17 | 340 | 0 | kind + scenario or label + metric + target_year | 2026-10-02T18:18:44Z |
| ipcc-pathways | normalized | 5 | 205 | 0 | kind + scenario + metric + target_year | 2026-10-02T18:18:44Z |
| crowd-baseline | captured, no normalize adapter yet |  |  |  |  | 2026-10-02T18:18:47Z |
| links | not yet captured: no INDEX.md |  |  |  |  | 2026-10-02T18:18:47Z |

## Hype Cycle phase cross-check

- 2016: phase read on the chart vs phase derived from x_time and the measured boundaries: 33 of 34 agree.
  - IoT Platform: read innovation_trigger, derived peak (x 19.966).
