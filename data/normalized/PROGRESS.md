# Normalize progress

Written by `pnpm normalize`. One line per source. Re-run the command to pick up sources that are not yet captured.

| Source | Status | Editions | Claims | Skipped rows | Natural key (ids.json) | Time |
|---|---|---|---|---|---|---|
| envisioning-technology | normalized | 2 | 229 | 0 | raw placement id (et-<edition>-<nnn>); the id number is kept | 2026-10-01T10:10:36Z |
| gartner-hype-cycle | normalized | 31 | 941 | 0 | label (exact, as captured); unique within an edition | 2026-10-01T10:10:36Z |
| mit-tr-10-breakthrough | normalized | 25 | 254 | 0 | label (exact, as captured); unique within an edition | 2026-10-01T10:10:36Z |
| gartner-strategic-predictions | normalized | 21 | 224 | 0 | kind + quote with case, spaces and punctuation removed | 2026-10-01T10:10:36Z |
| deloitte-tmt-predictions | normalized | 22 | 292 | 0 | section + quote with case, spaces and punctuation removed | 2026-10-01T10:10:36Z |
| idc-futurescape | normalized | 12 | 204 | 0 | futurescape + quote with case, spaces and punctuation removed | 2026-10-01T10:10:36Z |
| ark-big-ideas | normalized | 10 | 262 | 0 | metric + target_year + horizon + value + unit | 2026-10-01T10:10:36Z |
| bnef-evo | normalized | 11 | 58 | 8 base-year row (historical value, not a projection) | metric + target_year + scenario | 2026-10-01T10:10:36Z |
| wef-global-risks | normalized | 21 | 355 | 0 | ranking + rank + label | 2026-10-01T10:10:36Z |
| imf-weo | normalized | 73 | 1560 | 0 | economy name + target_year + horizon | 2026-10-01T10:10:37Z |
| iea-weo | normalized | 26 | 349 | 86 base-year row (historical value, not a projection) | technology + metric + target_year + scenario; edition-level quotes: quote text | 2026-10-01T10:10:37Z |
| eia-aeo | normalized | 42 | 9104 | 0 | series + unit + target_year + dollar_year | 2026-10-01T10:10:37Z |
| bcb-focus | normalized | 108 | 811 | 0 | indicator label + target_year + horizon | 2026-10-01T10:10:37Z |
| oecd-economic-outlook | normalized | 24 | 420 | 0 | economy name + target_year + horizon | 2026-10-01T10:10:37Z |
| world-bank-gep | normalized | 44 | 746 | 0 | economy name + target_year + horizon | 2026-10-01T10:10:37Z |
| fed-sep | normalized | 76 | 1541 | 553 median computed by Hindsight from individual projections (not published at the time) | variable + statistic + horizon + target_year | 2026-10-01T10:10:37Z |
| ecb-projections | normalized | 104 | 566 | 0 | variable + statistic + horizon + target_year | 2026-10-01T10:10:37Z |
| cbo-projections | normalized | 112 | 1557 | 0 | metric + horizon + target_year + target_period | 2026-10-01T10:10:37Z |
| obr-forecasts | normalized | 33 | 892 | 28 memo row (restated or supplementary forecast, not the headline forecast of this EFO) | metric + unit + horizon + target_year | 2026-10-01T10:10:37Z |
| bp-energy-outlook | normalized | 14 | 193 | 15 base-year row (historical value, not a projection) | metric + target_year + scenario | 2026-10-01T10:10:37Z |
| eurasia-top-risks | normalized | 20 | 279 | 0 | ranking + label | 2026-10-01T10:10:37Z |
| economist-world-ahead | normalized | 40 | 154 | 0 | kind + subject + quote with case, spaces and punctuation removed | 2026-10-01T10:10:37Z |
| kurzweil | normalized | 5 | 287 | 0 | target_year + quote (or paraphrase) with case, spaces and punctuation removed | 2026-10-01T10:10:37Z |
| pew-elon-imagining | normalized | 34 | 67 | 0 | label | 2026-10-01T10:10:38Z |

## Hype Cycle phase cross-check

- 2016: phase read on the chart vs phase derived from x_time and the measured boundaries: 33 of 34 agree.
  - IoT Platform: read innovation_trigger, derived peak (x 19.966).
