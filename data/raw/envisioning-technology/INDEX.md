# Envisioning Technology posters (2011, 2012)

Envisioning's own early posters by Michell Zappa: "Envisioning the near future of technology" (August 2011, radial chart with bands 2011-2015, 2015-2025, 2025+) and "Envisioning emerging technology for 2012 and beyond" (last updated 2012-02-10, timeline 2012-2040 with a quantitative-forecasts column). Tracked in envisioning/hindsight#1.

Files: `2011.json`, `2012.json` (placements, with proposed verdicts merged in), `revisions.json` (2011 to 2012 changes), `PROGRESS.md`.

## Rule (D10, confirmed)

The 2012 poster says it shows which technologies "should become mainstream in the coming years". A placement reads as "this technology becomes mainstream around the placed year".

- `hit`: mainstream within 2 years of the placed year (either side).
- `partial`: real but niche adoption by the placed year, or mainstream 3 to 5 years off.
- `miss`: not mainstream within 5 years of the placed year, or abandoned. Mainstream more than 5 years before the placed year is also a miss (the forecast was late).
- `unfalsifiable`: the label is too vague to test; the reason is stated.
- Quantitative forecasts: `hit` within 10% of the actual figure for that year, `partial` within 25%, `miss` beyond.
- Placements after 2026, and the open-ended 2025+ band of 2011, stay `open`.
- 2011 band placements are graded against the band end year (placed_year). Mainstream earlier inside the band also counts.

"Mainstream" tests, stated per verdict: consumer (about 10%+ of people or households in rich markets, or a standard feature on mass-market devices); professional, medical or industrial (standard practice); energy (material share of new capacity or market); infrastructure (widely deployed and used); abstract practice (routine and reported as normal).

### Readings the graders applied (flagged for review)

1. A real niche market at the placed year gives `partial`, even when mainstream never followed. This is the D10 "real but niche adoption" clause read literally. It lifts many emerging-tech placements (graphene, photovoltaic glass, smart toys, pico-projectors, vertical farming) from `miss` to `partial`.
2. For 2011 band placements, earliness was measured from the band start year. A technology already mainstream before 2011 counts as early by (2011 minus mainstream year), not by (2015 minus mainstream year). Example: Cermets (mainstream decades before 2011) is a `miss`; PAN and Print on demand (mainstream a few years before 2011) are `partial`.

Status: grader 1 of 2 (D7). These are proposed verdicts. They publish only when the second, independent grader agrees.

## Verdict counts

| Edition | Placements | hit | partial | miss | unfalsifiable | open | graded via 2012 |
|---|---|---|---|---|---|---|---|
| 2011 | 101 | 11 | 7 | 5 | 1 | 6 | 71 |
| 2012 | 128 | 29 | 40 | 17 | 3 | 39 | 0 |
| Total | 229 | 40 | 47 | 22 | 4 | 45 | 71 |

The 2012 counts include 11 quantitative forecasts: 3 hit, 4 partial, 4 miss. 2011 placements that carry into the 2012 poster are graded once, on the 2012 placement; the 2011 entry holds `graded_via` and `successor_verdict`.

## Graded placements

| id | Label | Placed | Verdict | Reason (first sentence of the grader reason) |
|---|---|---|---|---|
| et-2011-003 | Print on demand | 2011-2015 | partial | Book print-on-demand was already mainstream before the band: Bowker counted non-traditional, mostly POD titles above traditional titles from 2008, and nearly 8 times as many in 2010, 7 years before the 2015 band end. |
| et-2011-004 | Memristor | 2011-2015 | miss | Industrial/consumer test. |
| et-2011-005 | Cermets | 2011-2015 | miss | Test: industrial standard practice. |
| et-2011-009 | Ultra-capacitors | 2011-2015 | partial | Energy test. |
| et-2011-014 | Gamification of media | 2011-2015 | partial | Test: abstract practice routinely occurring. |
| et-2011-015 | All media on demand | 2011-2015 | hit | By 2015, 52% of US households had Netflix, Amazon Prime or Hulu, and digital overtook physical in global recorded music revenue with streaming growing 45%. |
| et-2011-025 | Electronic paper | 2015 | hit | Consumer test. |
| et-2011-028 | PAN | 2011-2015 | partial | Test: infrastructure used by a large share of users. |
| et-2011-030 | Social graph | 2011-2015 | hit | Consumer test. |
| et-2011-033 | Semantic web | 2011-2015 | hit | Test: infrastructure widely deployed. |
| et-2011-034 | Linked data | 2011-2015 | hit | Schema.org launched in 2011, Google's Knowledge Graph in 2012 and Wikidata in 2012. |
| et-2011-042 | Medical diagnostics | 2015-2025 | hit | Medical test. |
| et-2011-047 | VASIMR | 2025 | miss (provisional) | Test: industrial standard practice (flight use). |
| et-2011-049 | Superconducting interties | 2015-2025 | miss | Infrastructure test. |
| et-2011-050 | Nanostructure battery cathodes | 2015-2025 | hit | Test: energy, material share of the market. |
| et-2011-053 | PV at grid parity | 2015-2025 | hit | In 2016 solar PV added over 74 GW and grew faster than any other fuel, with auction prices near 3 US cents/kWh. |
| et-2011-055 | Solar thermal | 2015-2025 | miss (provisional) | Energy test. |
| et-2011-056 | Location-aware media | 2015-2025 | partial | Test: consumer product at 10%+ of people. |
| et-2011-059 | Immersive 3D projections | 2015-2025 | partial | Consumer test. |
| et-2011-061 | SPIMES | 2015-2025 | hit | Test: consumer and industrial practice widely deployed. |
| et-2011-063 | Virtual property | 2015-2025 | hit | Within the 2015-2025 band, in-game item purchases became the main revenue of the games industry: all top-ten grossing digital games of 2019 were free-to-play, Fortnite cosmetics earned billions in 2018, and Newzoo put in-game purchases at about three-quarters of 2020 games revenue. |
| et-2011-065 | Sensors | 2015-2025 | unfalsifiable | A bare 'Sensors' label names a component class, not a product or practice. |
| et-2011-070 | Tele-medicine | 2015-2025 | hit | Test: medical standard practice (routine, reimbursed). |
| et-2011-073 | Regenerative medicine | 2025 | partial | Medical test. |
| et-2012-001 | High-frequency trading | 2012 | partial | Test: professional practice. |
| et-2012-002 | Cloud computing | 2012 | hit | Professional test. |
| et-2012-003 | Multi touch | 2012 | hit | Test: consumer feature shipped as standard on mass-market devices. |
| et-2012-004 | Depth imaging | 2012 | partial | Kinect brought consumer depth imaging to market in 2010 and reached 24 million units by February 2013, but it was an optional console peripheral, about one per three Xbox 360s, and Microsoft discontinued it in 2017. |
| et-2012-005 | Tablets | 2012 | hit | Consumer test. |
| et-2012-006 | Rapid personal gene sequencing | 2012 | partial | Test: consumer product (10%+ of people) or routine clinical practice. |
| et-2012-007 | Additive manufacturing | 2012 | partial | Industrial test. |
| et-2012-008 | Global online population: ± 2 billion | 2012 | partial | Quantitative test (D10: hit within 10%, partial within 25%). |
| et-2012-009 | Connected devices: ±10 billion | 2012 | partial | Quantitative test. |
| et-2012-010 | Inductive chargers | 2013 | partial | Test: shipped as standard on mass-market devices. |
| et-2012-011 | World population: 7 billion | 2013 | hit | Quantitative test. |
| et-2012-012 | Software agents | 2014 | hit | Siri shipped in 2011, Google Now in 2012 and Cortana in April 2014, so by 2014 every major smartphone OS shipped a built-in assistant agent as a standard feature (consumer test, standard feature on mass-market devices). |
| et-2012-013 | Cyber-warfare | 2014 | hit | Abstract-practice test. |
| et-2012-014 | Gesture recognition | 2014 | partial | Test: consumer feature on mass-market devices. |
| et-2012-015 | Near-field communication | 2014 | hit | Consumer test (standard feature on mass-market devices). |
| et-2012-016 | Volumetric (3D) screens | 2014 | partial | Test: consumer feature shipped on mass-market devices. |
| et-2012-017 | Appliance robots | 2014 | partial | In 2014 robot vacuums were a real niche: iRobot had sold about 10 million Roombas cumulatively by 2013, and iRobot's own filings still called global household penetration single digits in 2018. |
| et-2012-018 | Self-healing materials | 2014 | miss | Industrial/consumer test. |
| et-2012-019 | Speech recognition | 2015 | hit | Test: consumer feature. |
| et-2012-020 | Pervasive video capture | 2015 | hit | Abstract-practice test. |
| et-2012-021 | Tidal turbines | 2015 | miss | Test: energy, material share of new capacity. |
| et-2012-022 | Global online population: ± 2.5 billion | 2015 | partial | Quantitative test. |
| et-2012-023 | Connected devices: ±15 billion | 2015 | hit | Quantitative test. |
| et-2012-024 | Natural language interpretation | 2016 | hit | In 2016 Google switched Translate to neural machine translation and launched Google Assistant, while Alexa devices spread. |
| et-2012-025 | 4G | 2016 | hit | Infrastructure test. |
| et-2012-026 | Flexible screens | 2016 | hit | Test: standard feature on mass-market devices. |
| et-2012-027 | Telematics | 2016 | hit | Consumer test (standard feature on mass-market vehicles). |
| et-2012-028 | Organ printing | 2016 | miss | Test: medical, standard practice. |
| et-2012-029 | Fuel cells | 2016 | miss | In 2016 global fuel cell vehicle sales were in the low thousands (Mirai about 2,000 worldwide) and total fuel cell shipments were a few hundred megawatts, a rounding error against global power and vehicle markets. |
| et-2012-030 | Commercial spaceflight | 2016 | partial | Industry test. |
| et-2012-031 | Mesh networking | 2017 | hit | Test: consumer product at roughly 10%+ of households. |
| et-2012-032 | Augmented reality | 2017 | hit | Consumer test (standard feature on mass-market devices). |
| et-2012-033 | Biometric sensors | 2017 | hit | Test: shipped as standard feature on mass-market devices. |
| et-2012-034 | Boards | 2017 | partial | Interactive whiteboards were already standard in UK classrooms before the poster: Futuresource put interactive display penetration at 87% by end 2012, 5 years before 2017, and interactive flat panels then replaced them. |
| et-2012-035 | Smart toys | 2017 | partial | Consumer test. |
| et-2012-036 | Graphene | 2017 | partial | Test: material share / standard use in mass products. |
| et-2012-037 | Bio-enhanced fuels | 2017 | partial | Energy test. |
| et-2012-038 | Photonics | 2018 | partial | Test: infrastructure, widely deployed. |
| et-2012-039 | 4K | 2018 | hit | IHS Markit reported that 4K TVs were about 44% of global TV shipments in Q3 2018, and share passed half of shipments soon after. |
| et-2012-040 | Smart power meters | 2018 | hit | Infrastructure test. |
| et-2012-041 | Modular computers | 2018 | partial | Test: consumer product at 10%+ share. |
| et-2012-042 | Robotic surgery | 2018 | hit | Medical test. |
| et-2012-043 | Synthetic blood | 2018 | miss | Test: medical, approved and widely used. |
| et-2012-044 | Personal fabricators | 2018 | partial | Desktop 3D printers had real niche adoption by 2018: Wohlers counted about 591,000 desktop units sold in 2018, mostly to hobbyists, schools and professionals. |
| et-2012-045 | Machine translation | 2019 | partial | Consumer test. |
| et-2012-046 | Virtual currencies | 2019 | hit | Test: consumer product at 10%+ of people. |
| et-2012-047 | Haptics | 2019 | hit | Consumer test (standard feature on mass-market devices). |
| et-2012-048 | Biomarkers | 2019 | hit | Test: medical, standard practice. |
| et-2012-049 | Pico-projectors | 2019 | partial | The embedded form failed: Samsung's Galaxy Beam projector phones sold poorly and no major phone maker ships a projector. |
| et-2012-050 | Self-driving vehicles | 2019 | partial | Consumer/infrastructure test. |
| et-2012-051 | Smart drugs | 2019 | partial | Test: consumer use by 10%+ of people. |
| et-2012-052 | Multi-segmented smart grids | 2019 | partial | Infrastructure test. |
| et-2012-053 | Sub-orbital spaceflight | 2019 | miss | Test: consumer service used by a large share of the population. |
| et-2012-054 | Procedural storytelling | 2020 | partial | In 2020 generated narrative was real but niche: AI Dungeon (GPT-2/GPT-3) had an enthusiast audience, and procedural narrative existed in some games. |
| et-2012-055 | 5G | 2020 | hit | Infrastructure test. |
| et-2012-056 | Machine vision | 2020 | hit | Test: standard feature on mass-market devices. |
| et-2012-057 | Eyewear-embedded screens | 2020 | partial | Consumer test. |
| et-2012-058 | Powered exoskeleton | 2020 | partial | Test: medical/industrial standard practice. |
| et-2012-059 | Personalized medicine | 2020 | hit | By 2020 personalized medicines were 39% of FDA novel drug approvals, over a third for the third time in four years, and biomarker testing to select targeted therapy was standard of care in oncology (professional test). |
| et-2012-060 | Meta-materials | 2020 | partial | Industrial/consumer test. |
| et-2012-061 | Photovoltaic glass | 2020 | partial | Test: energy, a material share of new PV capacity. |
| et-2012-062 | Space tourism | 2020 | miss | Consumer test. |
| et-2012-063 | Global online population: 4-5 billion | 2020 | hit | Quantitative test. |
| et-2012-064 | Connected devices: 30-50 billion | 2020 | miss | Quantitative test. |
| et-2012-065 | $150 Hard disk: ±200 Tb | 2020 | miss | Quantitative test. |
| et-2012-066 | Standard RAM: ±750Gb | 2020 | miss | Quantitative test. |
| et-2012-067 | Holography | 2021 | partial | Test: consumer or professional interface in wide use. |
| et-2012-068 | Context-aware computing | 2021 | miss | The forecast was late. |
| et-2012-069 | Optical invisibility cloaks | 2021 | miss | Any test. |
| et-2012-070 | Piezo-electricity | 2021 | miss | Test: energy, a material share of capacity. |
| et-2012-071 | Weather engineering | 2021 | partial | Abstract-practice test. |
| et-2012-072 | Reputation economy | 2022 | unfalsifiable | The label gives no testable threshold. |
| et-2012-073 | Commercial UAVs | 2022 | hit | After the FAA Part 107 rule in 2016, commercial drone use became routine in surveying, inspection, agriculture and media. |
| et-2012-074 | In-vitro meat | 2022 | partial | Consumer test. |
| et-2012-075 | Computational photography | 2023 | partial | Test: standard feature on mass-market devices. |
| et-2012-076 | Fabric-embedded screens | 2023 | miss (provisional) | Consumer test. |
| et-2012-077 | Carbon nanotubes | 2023 | hit | Test: industrial standard practice. |
| et-2012-078 | Telepresence | 2024 | partial | If telepresence means everyday video presence, it became mainstream in 2020 when Zoom reached 300 million daily meeting participants, 4 years before 2024, which is partial. |
| et-2012-079 | Synthetic biology | 2024 | unfalsifiable | The label names a research discipline, not a product or practice with an adoption threshold. |
| et-2012-080 | Petabyte storage standard | 2024 | miss | Quantitative test. |
| et-2012-081 | VR-only lifeforms | 2025 | unfalsifiable | The label does not say what counts as a 'lifeform' (scripted NPC, LLM agent, artificial-life simulation) or what 'mainstream' would mean for one. |
| et-2012-082 | $ 1.000 computer reaches the capacity of the human brain (± 10^15 calculations per second) | 2025 | partial | Quantitative test, threshold claim. |
| et-2012-083 | Interplanetary internet | 2026 | miss (provisional) | Infrastructure test. |
| et-2012-084 | Reprogrammable chips | 2026 | partial | Test: shipped as standard on mass-market devices. |
| et-2012-085 | Domestic robots | 2026 | miss (provisional) | As of mid-2026 no general-purpose home robot has reached households at scale. |
| et-2012-086 | Stem-cell treatments | 2026 | partial | Medical test. |
| et-2012-087 | Biomaterials | 2026 | partial | Test: material share of the market. |
| et-2012-088 | Biomechanical harvesting | 2026 | partial | Energy test. |
| et-2012-089 | Vertical farming | 2026 | partial | Test: industrial standard practice or material market share. |

### Provisional misses

Placed year 2022-2026: the 5-year window has not closed. The verdict can still change.

| id | Label | Placed | Window closes |
|---|---|---|---|
| et-2011-047 | VASIMR | 2025 | 2030 |
| et-2011-055 | Solar thermal | 2025 | 2030 |
| et-2012-076 | Fabric-embedded screens | 2023 | 2028 |
| et-2012-083 | Interplanetary internet | 2026 | 2031 |
| et-2012-085 | Domestic robots | 2026 | 2031 |

## Open placements

| id | Label | Placement |
|---|---|---|
| et-2011-076 | Wetware (biofeedback) | 2025+ |
| et-2011-085 | Tethers | 2025+ |
| et-2011-093 | Smart clothing | 2025+ |
| et-2011-094 | Smart infrastructure | 2025+ |
| et-2011-095 | HAPs | 2025+ |
| et-2011-096 | Smart cities | 2025+ |
| et-2012-090 | World population: 8 billion | 2027 |
| et-2012-091 | Nano-generators | 2028 |
| et-2012-092 | BRICs GDP overtakes the G7 | 2028 |
| et-2012-093 | Optogenetics | 2029 |
| et-2012-094 | Sea-steading | 2029 |
| et-2012-095 | Skin-embedded screens | 2030 |
| et-2012-096 | Gene therapy | 2030 |
| et-2012-097 | Artificial photosynthesis | 2030 |
| et-2012-098 | Immersive virtual reality | 2031 |
| et-2012-099 | Swarm robotics | 2031 |
| et-2012-100 | Molecular assembler | 2031 |
| et-2012-101 | Terabit internet speed standard | 2031 |
| et-2012-102 | Hybrid assisted limbs | 2032 |
| et-2012-103 | Enernet | 2032 |
| et-2012-104 | Lunar outpost | 2032 |
| et-2012-105 | Desalination | 2032 |
| et-2012-106 | Remote presence | 2033 |
| et-2012-107 | Retinal screens | 2033 |
| et-2012-108 | Artificial retinas | 2034 |
| et-2012-109 | Nanowires | 2034 |
| et-2012-110 | Mars mission | 2034 |
| et-2012-111 | Carbon sequestration | 2034 |
| et-2012-112 | Exabyte storage standard | 2034 |
| et-2012-113 | Neuro-informatics | 2035 |
| et-2012-114 | Embodied avatars | 2035 |
| et-2012-115 | Thorium reactor | 2035 |
| et-2012-116 | Exocortex | 2036 |
| et-2012-117 | Nanomedicine | 2036 |
| et-2012-118 | Climate engineering | 2036 |
| et-2012-119 | Machine-augmented cognition | 2037 |
| et-2012-120 | Programmable matter | 2037 |
| et-2012-121 | Space elevator | 2037 |
| et-2012-122 | Anti-aging drugs | 2038 |
| et-2012-123 | Traveling wave reactor | 2038 |
| et-2012-124 | Utility fog | 2039 |
| et-2012-125 | Space-based solar power | 2039 |
| et-2012-126 | Solar sail | 2039 |
| et-2012-127 | Arcologies | 2039 |
| et-2012-128 | World population: 9 billion | 2040 |

2011 placements carried into 2012 whose 2012 placement is open: Artificial limbs (et-2012-102, 2032), Optogenetics (et-2012-093, 2029), Reversal of aging (et-2012-122, 2038), Programmable matter (et-2012-120, 2037), Molecular assembler (et-2012-100, 2031), Nanowires (et-2012-109, 2034), Intelligence Amplification (et-2012-119, 2037), Space elevator (et-2012-121, 2037), Lunar outpost (et-2012-104, 2032), Traveling wave reactor (et-2012-123, 2038), Thorium reactors (et-2012-115, 2035), Nano-generators (et-2012-091, 2028), Artificial photosynthesis (et-2012-097, 2030), Skin-embedded screens (et-2012-095, 2030), Retinal screens (et-2012-107, 2033), Utility fog (et-2012-124, 2039), Swarm robotics (et-2012-099, 2031).

## Revisions 2011 to 2012

102 change rows and 40 unchanged placements. Change counts: added 41, advanced 7, delayed 15, dropped 30, renamed 16.

| id | Changes | 2011 | 2012 | Note |
|---|---|---|---|---|
| et-rev-001 | renamed | PGS (2011-2015) | Rapid personal gene sequencing (2012) | 2011 used the acronym PGS (Personal Gene Sequencing). |
| et-rev-002 | renamed | 3D printing (2011-2015) | Additive manufacturing (2012) |  |
| et-rev-003 | dropped | Print on demand (2011-2015) |  | 2012 keeps additive manufacturing (2012) and adds 'Personal fabricators' (2018). |
| et-rev-004 | dropped | Memristor (2011-2015) |  |  |
| et-rev-005 | dropped | Cermets (2011-2015) |  |  |
| et-rev-006 | renamed, delayed | Private spaceflight (2011-2015) | Commercial spaceflight (2016) |  |
| et-rev-007 | delayed | Bio-enhanced fuels (2011-2015) | Bio-enhanced fuels (2017) |  |
| et-rev-008 | dropped | Ultra-capacitors (2011-2015) |  |  |
| et-rev-009 | delayed | Fuel cells (2011-2015) | Fuel cells (2016) |  |
| et-rev-010 | renamed, delayed | Smart meters (2011-2015) | Smart power meters (2018) | 2012 also moved it from ENERGY to SENSORS. |
| et-rev-011 | delayed | Procedural storytelling (2011-2015) | Procedural storytelling (2020) | 2012 moved it from MEDIA to ARTIFICIAL INTELLIGENCE. |
| et-rev-012 | dropped | Gamification of media (2011-2015) |  |  |
| et-rev-013 | dropped | All media on demand (2011-2015) |  |  |
| et-rev-014 | delayed | Haptics (2011-2015) | Haptics (2019) |  |
| et-rev-015 | delayed | Holography (2015) | Holography (2021) |  |
| et-rev-016 | renamed, delayed | AR (2011-2015) | Augmented reality (2017) | Acronym expanded. |
| et-rev-017 | renamed | 3D (2011-2015) | Volumetric (3D) screens (2014) | 2011 '3D' meant '3D screens and cameras' (acronym legend). 2012 splits it into 'Volumetric (3D) screens' (2014) and 'Depth imaging' (2012). |
| et-rev-018 | renamed | Tabs & Pads (2011-2015) | Tablets (2012) |  |
| et-rev-019 | delayed | Boards (2011-2015) | Boards (2017) |  |
| et-rev-020 | dropped | Electronic paper (2015) |  | 2012 adds 'Flexible screens' (2016); not the same claim. |
| et-rev-021 | renamed | Pervasive video (2011-2015) | Pervasive video capture (2015) | 2012 also moved it from INTERNET to SENSORS. |
| et-rev-022 | delayed | 4G (2011-2015) | 4G (2016) |  |
| et-rev-023 | dropped | PAN (2011-2015) |  |  |
| et-rev-024 | dropped | Social graph (2011-2015) |  |  |
| et-rev-025 | renamed | NFC (2011-2015) | Near-field communication (2014) | Acronym expanded. 2012 also moved it from INTERNET to SENSORS. |
| et-rev-026 | dropped | Semantic web (2011-2015) |  |  |
| et-rev-027 | dropped | Linked data (2011-2015) |  |  |
| et-rev-028 | delayed | Bio-markers (2011-2015) | Biomarkers (2019) | Spelling only. 2012 also moved it from BIOTECH to SENSORS. |
| et-rev-029 | renamed, delayed | Vertical agriculture (2015-2025) | Vertical farming (2026) | 2012 also moved it from BIOTECH to GEOENGINEERING. |
| et-rev-030 | delayed | Bio-materials (2015-2025) | Biomaterials (2026) | Spelling only. |
| et-rev-031 | advanced | Self-healing materials (2015-2025) | Self-healing materials (2014) |  |
| et-rev-032 | dropped | Medical diagnostics (2015-2025) |  |  |
| et-rev-033 | advanced | Software agents (2015-2025) | Software agents (2014) |  |
| et-rev-034 | dropped | VASIMR (2025) |  |  |
| et-rev-035 | dropped | Superconducting interties (2015-2025) |  |  |
| et-rev-036 | dropped | Nanostructure battery cathodes (2015-2025) |  |  |
| et-rev-037 | delayed | Biomechanical harvesting (2015-2025) | Biomechanical harvesting (2026) |  |
| et-rev-038 | dropped | PV at grid parity (2015-2025) |  |  |
| et-rev-039 | dropped | Solar thermal (2015-2025) |  |  |
| et-rev-040 | dropped | Location-aware media (2015-2025) |  | Nearest 2012 item is 'Context-aware computing' (2021); not the same claim. |
| et-rev-041 | dropped | Immersive 3D projections (2015-2025) |  | Nearest 2012 items are 'Holography' (2021) and 'Immersive virtual reality' (2031); neither is the same claim. |
| et-rev-042 | advanced | Fabric-embedded screens (2025) | Fabric-embedded screens (2023) |  |
| et-rev-043 | dropped | SPIMES (2015-2025) |  |  |
| et-rev-044 | dropped | Virtual property (2015-2025) |  |  |
| et-rev-045 | dropped | Sensors (2015-2025) |  | 2012 turns SENSORS into a category heading instead of a node. |
| et-rev-046 | renamed, advanced | Exoskeletons (2025) | Powered exoskeleton (2020) |  |
| et-rev-047 | dropped | Tele-medicine (2015-2025) |  | 2012 has 'Telepresence' and 'Remote presence', neither medical. |
| et-rev-048 | delayed | Stem-cell treatments (2015-2025) | Stem-cell treatments (2026) |  |
| et-rev-049 | dropped | Regenerative medicine (2025) |  | 2012 keeps 'Stem-cell treatments' and adds 'Organ printing'; no node named regenerative medicine. |
| et-rev-050 | renamed | Artificial limbs (2025+) | Hybrid assisted limbs (2032) |  |
| et-rev-051 | dropped | Wetware (biofeedback) (2025+) |  | Nearest 2012 item is 'Neuro-informatics' (2035); not the same claim. |
| et-rev-052 | renamed | Reversal of aging (2025+) | Anti-aging drugs (2038) |  |
| et-rev-053 | renamed, advanced | Synthetic meat (2025+) | In-vitro meat (2022) |  |
| et-rev-054 | renamed | Intelligence Amplification (2025+) | Machine-augmented cognition (2037) | Match by meaning; the 2012 'Exocortex' (2036) is a second candidate. |
| et-rev-055 | advanced | Machine translation (2025+) | Machine translation (2019) |  |
| et-rev-056 | dropped | Tethers (2025+) |  |  |
| et-rev-057 | dropped | Smart clothing (2025+) |  |  |
| et-rev-058 | dropped | Smart infrastructure (2025+) |  |  |
| et-rev-059 | dropped | HAPs (2025+) |  |  |
| et-rev-060 | dropped | Smart cities (2025+) |  |  |
| et-rev-061 | renamed, advanced | UAVs (2025+) | Commercial UAVs (2022) |  |
| et-rev-062 | added |  | Depth imaging (2012) | Split out of the 2011 '3D' (3D screens and cameras) node. |
| et-rev-063 | added |  | Tidal turbines (2015) |  |
| et-rev-064 | added |  | Flexible screens (2016) |  |
| et-rev-065 | added |  | Telematics (2016) |  |
| et-rev-066 | added |  | Organ printing (2016) |  |
| et-rev-067 | added |  | Mesh networking (2017) |  |
| et-rev-068 | added |  | Biometric sensors (2017) |  |
| et-rev-069 | added |  | Graphene (2017) |  |
| et-rev-070 | added |  | Photonics (2018) |  |
| et-rev-071 | added |  | 4K (2018) |  |
| et-rev-072 | added |  | Modular computers (2018) |  |
| et-rev-073 | added |  | Robotic surgery (2018) |  |
| et-rev-074 | added |  | Synthetic blood (2018) |  |
| et-rev-075 | added |  | Personal fabricators (2018) |  |
| et-rev-076 | added |  | Smart drugs (2019) |  |
| et-rev-077 | added |  | Eyewear-embedded screens (2020) |  |
| et-rev-078 | added |  | Context-aware computing (2021) |  |
| et-rev-079 | added |  | Optical invisibility cloaks (2021) |  |
| et-rev-080 | added |  | Weather engineering (2021) |  |
| et-rev-081 | added |  | Reputation economy (2022) |  |
| et-rev-082 | added |  | Computational photography (2023) |  |
| et-rev-083 | added |  | Synthetic biology (2024) |  |
| et-rev-084 | added |  | VR-only lifeforms (2025) |  |
| et-rev-085 | added |  | Reprogrammable chips (2026) |  |
| et-rev-086 | added |  | Sea-steading (2029) |  |
| et-rev-087 | added |  | Gene therapy (2030) |  |
| et-rev-088 | added |  | Immersive virtual reality (2031) |  |
| et-rev-089 | added |  | Enernet (2032) |  |
| et-rev-090 | added |  | Desalination (2032) |  |
| et-rev-091 | added |  | Remote presence (2033) |  |
| et-rev-092 | added |  | Artificial retinas (2034) |  |
| et-rev-093 | added |  | Mars mission (2034) |  |
| et-rev-094 | added |  | Carbon sequestration (2034) |  |
| et-rev-095 | added |  | Neuro-informatics (2035) |  |
| et-rev-096 | added |  | Embodied avatars (2035) |  |
| et-rev-097 | added |  | Exocortex (2036) |  |
| et-rev-098 | added |  | Nanomedicine (2036) |  |
| et-rev-099 | added |  | Climate engineering (2036) |  |
| et-rev-100 | added |  | Space-based solar power (2039) |  |
| et-rev-101 | added |  | Solar sail (2039) |  |
| et-rev-102 | added |  | Arcologies (2039) |  |

## Hardest calls

- **High-frequency trading (et-2012-001, 2012): partial.** HFT was already the dominant share of US equity volume by 2009, about 3 years before the placed year. The early-forecast clause gives partial, although the poster described the present, not the future.
- **Telepresence (et-2012-078, 2024): partial.** Read as everyday video presence, it was mainstream in 2020 (4 years early, partial). Read as immersive or robotic presence, it is a miss. The grader took the first reading.
- **Reputation economy (et-2012-072) and Synthetic biology (et-2012-079): unfalsifiable.** Under one reading each was mainstream years before the placed year (a late miss); under another it is untestable. The label gives no threshold.
- **Machine translation (et-2012-045, 2019): partial.** Google Translate had 200 million monthly users in 2012, so mainstream came 3-6 years before the placed year. The 2011 poster had it in the 2025+ band, which makes both editions late.
- **Self-driving vehicles (et-2012-050, 2019): partial.** A paid robotaxi service ran in Phoenix from December 2018 (real niche). It was not mainstream by 2024.
- **Connected devices 2012 (et-2012-009): partial.** Published estimates for 2012 run from 8.7 billion (Cisco) to 15 billion (IDATE). Against Cisco the poster is 15% high (partial); against IDATE it is 33% low (miss).
- **$1,000 computer at 10^15 calculations per second (et-2012-082, 2025): partial.** A $999 RTX 5080 passes the threshold only on NVIDIA's low-precision sparse "AI TOPS" figure (about 1.8 x 10^15). At FP32 (5.6 x 10^13) or dense FP16 (2.25 x 10^14) it falls short.
- **2011 band placements measured from the band start (see "Readings" above).** This choice decides Cermets (miss) against PAN and Print on demand (partial).

## Spot-check of the extraction

Eight entries were checked against the poster PDFs (text coordinates from the PDF and the rendered page). All eight match the extraction.

| id | Label | Extracted | PDF check |
|---|---|---|---|
| et-2012-001 | High-frequency trading | 2012 | Label above the 2012 line. Match. |
| et-2012-021 | Tidal turbines | 2015 | Between the 2014 and 2015 lines. Match. |
| et-2012-036 | Graphene | 2017 | Between the 2016 and 2017 lines. Match. |
| et-2012-050 | Self-driving vehicles | 2019 | Between the 2018 and 2019 lines. Match. |
| et-2012-055 | 5G | 2020 | Between the 2019 and 2020 lines. Match. |
| et-2011-085 | Tethers | 2025+ | Radius about 454 pt, outside the 2015-2025 ring at about 431 pt. Match. |
| et-2011-025 | Electronic paper | 2015 (on ring) | Radius about 256 pt, on the ring at about 255 pt. Match. |
| et-2011-007 | Private spaceflight | 2011-2015 | Radius about 184 pt, inside the first band. Match. |

One reading convention affects every 2012 placement: a node between two year lines is read as the later year. Reading it as the earlier year would move most 2012 placements one year earlier. Under D10's 2-year tolerance this changes few verdicts, but it is a convention, not a fact printed on the poster.

## Gaps and notes

- Ring-sitting 2011 nodes (Holography, Electronic paper, Fabric-embedded screens, Exoskeletons) carry `confidence: medium`, as do nodes within 10 pt of a ring.
- The 2011 poster has no year labels on the rings beyond the band captions. The band edges come from ring radii measured on the PDF.
- The 2012 poster places "World population: 7 billion" in 2013. The UN marked the 7 billion day in October 2011, before the poster was published.
- Evidence dates marked `unknown` are sources whose publication date the grader could not confirm.
- No Drive links or internal ids are stored. Source URLs point to Envisioning's public work pages and public copies.
