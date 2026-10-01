# a16z Big Ideas: collected editions

Andreessen Horowitz (a16z) asks its partners each December (November/December) for one "big idea" that builders will tackle in the following year, and publishes them together. Claim type: `trend` (D6). Each idea keeps the partner(s) named on it as `author`.

Facts only (NOTICE.md): order, label as printed, section (team heading), author, team, one short verbatim sentence as `quote` (max 400 characters), subject, and a target year, horizon or number only where the quoted text states one. No body text, charts or images. Nothing here is graded.

## Verify-first answers

- **Edition id.** The edition id is the year the ideas are for, as a16z titles them ("Big Ideas in Tech for 2024" is edition `2024`, published in late 2023).
- **First edition: 2023.** "Big Ideas in Tech for 2023: An a16z Omnibus" (a16z editorial, posted 15 December 2022) is the first firm-wide edition. Its intro says a16z "asked dozens of partners across the firm" for one big idea each. No firm-wide list for 2020, 2021 or 2022 exists in the a16z.com URL index of the Wayback Machine (CDX prefix query for `big-idea` on a16z.com, 2026-10-01) or in a web search.
- **Predecessor (not captured as editions).** The a16z fintech team published a team-only "big ideas" newsletter before the firm-wide series: "The Big Ideas Fintech Will Tackle in 2020" (2019-12-18), "Big Ideas for Fintech 2021" (2020-12-17), "The Big Ideas That Fintech Will Tackle in 2022" (2021-12-20), and "Nine Big Ideas for Fintech in 2023" (December 2022 newsletter). These are one team's newsletter, not the firm's list, so they are recorded here and not extracted. See open problems.
- **Every edition up to 2026.**
  - 2023: https://a16z.com/big-ideas-in-tech-for-2023-an-a16z-omnibus/ (old path `a16z.com/2022/12/15/big-ideas-in-tech-2023/` redirects there). Public, readable. One page, no team headings; each idea ends with a byline naming the partner(s) and team.
  - 2024: https://a16z.com/big-ideas-in-tech-2024/ "Big Ideas in Tech for 2024". Public, readable. Grouped under team headings. No visible date; page metadata `datePublished` 2023-11-29, first Wayback capture 2023-12-06.
  - 2025: https://a16z.com/big-ideas-in-tech-2025/ "Big Ideas in Tech for 2025". Public, readable. Grouped under team headings. No visible date; page metadata `datePublished` 2024-11-15 (may be a draft date; the Wayback CDX could not be reached later in the session to confirm the first capture).
  - 2026: published as a three-part newsletter, "Big Ideas 2026: Part 1" (2025-12-09, Infrastructure, Growth, Bio + Health, Speedrun), "Part 2" (2025-12-10, American Dynamism, Apps) and "Part 3" (2025-12-11, 17 ideas from a16z crypto partners "plus a few guest contributors"). URLs `https://a16z.com/newsletter/big-ideas-2026-part-{1,2,3}/`, mirrored on a16z.news (Substack). Public, readable. Treated as one edition (one year, one series); parts are kept in print order.
- **Horizons.** Every edition frames its ideas as what builders will tackle in the coming year ("drive innovation in 2024", "spur innovation in 2025", "the year to come"). Individual ideas rarely give a horizon or a number; `target_year` is set only where the quoted sentence names a year, `horizon` only where it names a period ("the year ahead", "the next decade").
- **What is not public / not captured.** Podcasts discussing the ideas (2023 "Big Ideas in Technology" parts 1 and 2, 2024 and 2026 episodes) repeat the written ideas and are not captured. Team spin-offs (a16z crypto "8 big ideas for 2026", speedrun "14 Big Ideas for 2026" on Substack) are separate team posts and not captured. Nothing behind a paywall or form was found.

## Extraction notes

- `rank` is print order on the page (for 2026: Part 1, then Part 2, then Part 3). It is not a ranking.
- `section` is the team heading the page prints (2024 onward). 2023 has no headings, so `section` is null and `team` comes from the byline ("consumer team" becomes `consumer`). For 2026 Part 3 there is no team heading; `section`/`team` `Crypto` is taken from the Part 3 intro ("a16z crypto partners").
- `author` is the person or people named on the idea (byline in 2023, contributor bio in 2024 to 2026). Co-authored ideas join names with " and ". Three 2026 Part 3 contributors are not a16z staff (Sean Neville, Shane Mac, Adeniyi Abiodun); their `team` is null and the `note` says so.
- `quote` is one verbatim sentence from the idea that states it. In 139 of 189 entries the sentence carries a forecast word ("will", "expect", "predict", "likely") or the edition year; the rest state the trend as a present-tense claim or an opportunity; a few ideas are written as questions or wish lists and say so in `note`.
- Numbers about the future are rare: four entries carry `metric`/`value`/`unit` (2024 #32 game development cost 1/1,000th; 2025 #3 Starship point-to-point 40 minutes; 2025 #46 AI hypercenter 3-6 GW in five to 10 years; 2026 #40 zkVM prover overhead about 10,000x in 2026). Current-state figures quoted in the text (for example Google's ~90% search share, 46 trillion dollars of stablecoin volume) are not forecasts and are only mentioned in `note`.
- `confidence` is `high` for every entry: all text is read from the publisher's own pages.

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| 2020 | (no firm-wide edition; fintech team newsletter only) | 2019-12-18 | missing | 0 | https://a16z.com/2019/12/18/the-big-ideas-fintech-will-tackle-in-2020/ |
| 2021 | (no firm-wide edition; fintech team newsletter only) | 2020-12-17 | missing | 0 | https://a16z.com/2020/12/17/big-ideas-for-fintech-2021/ |
| 2022 | (no firm-wide edition; fintech team newsletter only) | 2021-12-20 | missing | 0 | https://a16z.com/2021/12/20/the-big-ideas-that-fintech-will-tackle-in-2022/ |
| 2023 | Big Ideas in Tech for 2023: An a16z Omnibus | 2022-12-15 | complete | 46 | https://a16z.com/big-ideas-in-tech-for-2023-an-a16z-omnibus/ |
| 2024 | Big Ideas in Tech for 2024 | 2023-11-29 (metadata; first archived 2023-12-06) | complete | 47 | https://a16z.com/big-ideas-in-tech-2024/ |
| 2025 | Big Ideas in Tech for 2025 | 2024-11-15 (metadata only) | complete | 49 | https://a16z.com/big-ideas-in-tech-2025/ |
| 2026 | Big Ideas 2026 (Parts 1-3) | 2025-12-09 to 2025-12-11 | complete | 47 | https://a16z.com/newsletter/big-ideas-2026-part-1/ (+ part-2, part-3) |

Total: 4 editions, 189 entries. 2020 to 2022 are listed as `missing` for the firm-wide series: no such list was published; only the fintech team's newsletter exists for those years.

## What could not be read and why

- **Publication dates of 2024 and 2025.** Neither page shows a date. The dates above are the pages' `datePublished` metadata. The Wayback Machine CDX API answered early in the session (2024 first captured 2023-12-06) but then refused connections (three failures), so the first capture of the 2025 page was not confirmed.
- **2026 Part 3 section.** No printed team heading; inferred from the intro.
- Nothing else was blocked. No PDF versions exist; all four editions are HTML pages.

## Open problems

- **Fintech predecessor series (2020 to 2023).** The fintech team's "big ideas" newsletters for 2020, 2021, 2022 and 2023 are public and have the same format (one idea per partner). If Hindsight wants a16z fintech forecasts from before the firm-wide list, capture them as a separate source (for example `a16z-fintech-big-ideas`), not as editions of this one. The 2023 fintech newsletter likely overlaps with the fintech ideas in the 2023 omnibus.
- **Team spin-offs for 2026.** a16z crypto ("8 big ideas for 2026 (and more trends to watch)", a16zcrypto.substack.com) and speedrun ("14 Big Ideas for 2026", speedrun.substack.com) published their own lists. Not captured; they may overlap with Part 3 and the Speedrun section of Part 1.
- **Ideas without a clear forecast.** Some entries are opportunity statements or questions (2023 #4, #41; 2024 #46; 2025 #7). Graders may find them `unfalsifiable` or `ungradable` (D22).
- **Recurring subjects across editions** (for revisions): nuclear (2023 #33, 2025 #1), AI companions (2024 #35, 2025 #40), stablecoins (2025 #22, 2026 #33/#36/#37), prediction markets (2025 #21, 2026 #32), DUNA/decentralization (2024 #16, 2025 #24, 2026 #47), AI-native SaaS/systems of record (2023 #39, 2025 #33, 2026 #7), voice apps (2024 #11, 2026 #23). Subject mapping to `Subject` ids is left to normalize.
- **Authors who moved on.** Bios are as shown on the live pages in 2026-10 (for example Malika Aubakirova "was an investor"); the `author` field records the name on the idea, which does not change.
