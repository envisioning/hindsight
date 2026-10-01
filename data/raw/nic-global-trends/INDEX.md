# US National Intelligence Council, Global Trends: collected editions

Facts only: label, a short quote of a scenario premise or a dated/quantified projection in the NIC's own voice, subject, target year, metric/value/unit where stated, source. Claim type `scenario` (D6: graded on coverage only, never hit or miss). Nothing here is graded.

## Verified before extraction

- **First edition: Global Trends 2010, 1997.** Limited publication February 1997; public "Revised Edition: November 1997". Prepared with the Institute for National Strategic Studies at National Defense University (scope note of the dni.gov text). Global Trends 2030 ("Track Record of Global Trends Works" box) also dates the first edition to 1996-97.
- **Editions up to 2026: seven.** 1997 (GT2010), December 2000 (GT2015), December 2004 (Mapping the Global Future, GT2020), November 2008 (GT2025), December 2012 (GT2030), January 2017 (Paradox of Progress, horizon 2035), March 2021 cover / 8 April 2021 release (GT2040).
- **No eighth edition.** The edition due in early 2025 (expected horizon 2045) was not published: in September 2025 the DNI announced the elimination of the NIC Strategic Futures Group and of the Global Trends report (Hawaii Tribune-Herald / AP, 2025-09-27, https://www.hawaiitribune-herald.com/2025/09/27/nation-world-news/gabbard-ends-intelligence-report-on-future-threats-to-us/amp/; also Foreign Policy, 2025-10-20). An unofficial "Global Trends 2045" (Perspective on Risk newsletter, 2026-07-17) is not an NIC publication and is not captured.
- **Horizons passed (as of 2026-10-01):** 2010 (1997 edition), 2015 (2000), 2020 (2004), 2025 (2008). Open: 2030 (2012), 2035 (2017), 2040 (2021).
- **Where each is publicly readable.** All seven are on dni.gov / archive.dni.gov (PDF, or HTML for GT2010), but both hosts return HTTP 403 to scripts. Every edition was read from a Wayback Machine copy of the official file (URLs in each edition's `sources` and in `scripts/nic-global-trends/README.md`). GT2015 is also on the Library of Congress (tile.loc.gov). GT2020 was read from the 2006 dni.gov HTML edition; its PDF was not located in the Wayback index.
- **What is not public:** the February 1997 limited-distribution version of GT2010 (only the November 1997 revised edition is public).

## Edition ids and fields

Edition id = publication year (the prompt's rule; the title year is the horizon and the 2017 title has no year). Edition header adds `title`, `horizon_year`, `horizon_passed`, `report_number` (where printed).

Entry fields: `kind` (`scenario` | `projection`), `label`, `quote` (verbatim, at most 400 characters), `subject`, `target_year`, `metric`/`value`/`unit` where the text gives them, `source_url`, `confidence`, `note`. Scenario `target_year` = the report horizon. Projection `target_year` = the year stated, else the horizon; relative spans ("next 15 years") are converted from the publication year and say so in the note.

Every quote marked `high` was machine-checked against the text of the official document (`scripts/nic-global-trends/build.py`). No `medium` or `low` entries.

## Scope rule (applied to every edition)

- Scenarios: the edition's global, named scenarios only. Regional sub-scenarios in the body are not captured (see open problems).
- Projections: dated or quantified statements in the NIC's own voice from the summary layer of each report (overview tables, executive summary, key-trends summary; for 2021 also the structural-forces chapters; for 1997 the whole short text). Statements the NIC attributes to others (UN, World Bank, US Census Bureau, OECD, WEF, McKinsey, "private-sector forecasts") are excluded. Statements that are scenario content (dated events inside fictional narratives) are excluded.

## Editions

| Edition | Title | Published | Horizon | Passed | Status | Entries (scen/proj) | Main source |
|---|---|---|---|---|---|---|---|
| 1997 | Global Trends 2010 | 1997-11 (revised edition) | 2010 | yes | complete | 28 (0/28) | https://www.dni.gov/index.php/who-we-are/organizations/mission-integration/nic/nic-related-menus/nic-related-content/global-trends-2010 |
| 2000 | Global Trends 2015: A Dialogue About the Future With Nongovernment Experts | 2000-12 | 2015 | yes | complete | 19 (4/15) | http://www.cia.gov/cia/reports/globaltrends2015/globaltrends2015.pdf |
| 2004 | Mapping the Global Future (GT2020) | 2004-12 | 2020 | yes | complete | 19 (4/15) | http://www.dni.gov/nic/NIC_globaltrend2020_es.html |
| 2008 | Global Trends 2025: A Transformed World | 2008-11 | 2025 | yes | complete | 20 (4/16) | https://www.dni.gov/files/documents/Newsroom/Reports%20and%20Pubs/2025_Global_Trends_Final_Report.pdf |
| 2012 | Global Trends 2030: Alternative Worlds | 2012-12 | 2030 | no | complete | 23 (4/19) | https://www.dni.gov/files/documents/GlobalTrends_2030.pdf |
| 2017 | Global Trends: Paradox of Progress | 2017-01 | 2035 | no | complete | 12 (3/9) | https://www.dni.gov/files/documents/nic/GT-Full-Report.pdf |
| 2021 | Global Trends 2040: A More Contested World | 2021-03 (released 2021-04-08) | 2040 | no | complete | 16 (5/11) | https://www.dni.gov/files/ODNI/documents/assessments/GlobalTrends_2040.pdf |
| 2025 | (Global Trends 2045, due) | - | 2045 | - | missing | 0 | Not published: cancelled by the DNI, September 2025. |

"Complete" means the scope rule above was fully applied to the edition, not that every sentence of the report was mined.

## Scenarios by edition

- 1997: none (the scope note says the study did not aim to produce alternative scenarios).
- 2000: Inclusive Globalization; Pernicious Globalization; Regional Competition; Post-Polar World.
- 2004: Davos World; Pax Americana; A New Caliphate; Cycle of Fear.
- 2008: A World Without the West; October Surprise; BRICs' Bust-Up; Politics is Not Always Local.
- 2012: Stalled Engines; Fusion; Gini Out-of-the-Bottle; Nonstate World.
- 2017: Islands; Orbits; Communities.
- 2021: Renaissance of Democracies; A World Adrift; Competitive Coexistence; Separate Silos; Tragedy and Mobilization.

## What could not be read, and why

- **dni.gov and archive.dni.gov:** HTTP 403 to curl for every file. All reads went through Wayback copies of the same official files. Current dni.gov URLs in `source_url` for 2008, 2012, 2017 and 2021 are the official paths recorded in the Wayback index; the 2000 and 2004 `source_url` values are the original (now dead) cia.gov / dni.gov paths.
- **GT2020 PDF:** not found in the Wayback index; the HTML edition was used. Page numbers are therefore not given for 2004.
- **February 1997 GT2010:** limited distribution, not public.
- **Figures, charts, maps and regional annex tables** (for example GT2040's "five largest cities by 2035" and 2040 climate maps): not captured, by rule.

## Open problems

- **Body text not mined.** Projections come from the summary layer only (see scope). The body chapters of 2000-2021 hold many more dated numbers (for example GT2015 Discussion: India 1.2 billion and Pakistan about 195 million by 2015; GT2030 body: oil spare capacity "8 million barrels per day"). A second pass could add them as new rows at the end of each edition file (never reorder; D15).
- **Regional named scenarios not captured:** 2012: South Asia (Turn-the-Corner, Islamistan, Unraveling), Europe (Collapse, Slow Decline, Renaissance), US optimistic/pessimistic cases; 2008: four US-China scenarios in the body; 2017: the five-year regional outlooks. Decide whether they are scenario claims in their own right.
- **Target years for relative spans** ("next decade", "next 15 years", "coming decades") are converted from the publication year and noted; 2017's interstate-conflict entry is read as the five-year outlook (2022), a judgment call.
- **Scenario-conditional numbers** (2012 Fusion: world GDP $132 trillion by 2030; 2021 Competitive Coexistence: China largest economy by 2030) are in notes, not separate rows.
- **Subjects and Revisions not mapped.** Candidate revision chains across editions: US global role (1997, 2000, 2004, 2008, 2012), world population (1997: >7 bn by 2010; 2000: 7.2 bn by 2015; 2008: +1.2 bn by 2025; 2012: 8.3 bn by 2030; 2017: 8.8 bn by 2035; 2021: 9.2 bn by 2040), energy demand growth (2000: +50 percent; 2004: +50 percent in two decades; 2012: +50 percent), China's economy rank (2004, 2008, 2012), terrorism (2004 al-Qa'ida superseded; 2008; 2012 Islamist phase might end; 2017), water stress (2000, 2008, 2012, 2017), nuclear weapons (2000, 2004, 2008, 2017).
- **Release days** for 2008, 2012 and 2017 are from memory of press coverage and are recorded only in notes; `published` uses the cover month.

## Possible errors in the source

- 1997: "about half of the world's population will live in cities compared with one-third today": the one-third baseline looks low for 1997.
- 2012: the Tectonic Shifts table says spare capacity "may exceed over 8 million barrels" (no unit, and "exceed over"); the body says "8 million barrels per day".
- 2012: "a scenario in which the risk of interstate conflict rise" (agreement error), as printed.
- 2004: "superceded", as printed.
