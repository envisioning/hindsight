# Origins: technologies imagined in fiction (D57)

Works of fiction and the technologies they show, for the imagination lead time finding (objective 4, epic #85). Rules: `docs/DECISIONS.md` D57. Shapes: `OriginsRawFile`, `OriginsRawWork`, `OriginsRawDepiction` in `src/schema.ts`. Normalized by `src/normalize/sources/origins.ts`.

Facts only (NOTICE.md): title, year, medium, creators, countries, list memberships, and one sentence per depiction written by Envisioning. No text, stills or publisher artwork. Fiction is never graded right or wrong (D6); no ranking of works, authors or media (D17).

## Files

| File | What |
|---|---|
| `works-book.json` | Novels and story collections, with their child works (adaptations) |
| `works-film.json` | Films, with sequels and adaptations |
| `works-tv.json` | TV series, with seasons, episodes and adaptations |
| `works-game.json` | Games, with sequels |
| `works-short-film.json` | Short films |
| `works-comic.json` | Comics, manga and graphic novels (#79) |

A file holds a family of works under the medium of its root work; each child work has its own `medium`, `year` and `parent`. A work is a source edition of `origins` (edition = work id, published = year). Each depiction becomes a claim `origins-<work id>-<nnn>` (D15: nnn is the depiction's position in `depictions` on first assignment; natural key = `key`).

## State (2026-10-03)

- **Migrated from www** (`content/origins/data.ts`, #78, `scripts/origins/migrate-www.mjs`): 76 works and their 91 subtitles as child works (167 works), 165 connections as 165 depiction claims with `basis: connection`. All 167 are `inclusion: curated` until the canon (#79) is captured. `node scripts/origins/check-www.mjs` proves that every work, subtitle and connection of data.ts exists here with an id.
- A migrated connection is a hand-made link from a work to a research technology page, not a checked depiction: its subject is the technology the connection named (D13 mapping, below) and its claim says the catalogue *connects* the work to it. Some connections are analogies (The Terminator to Autonomous Field Robotics; Project Hail Mary's Astrophage drive to Nuclear Fusion Reactor). The extraction (#80) judges depictions under D20; a migrated row is kept, and a checked depiction is a new claim with `basis: extraction`.
- `centrality` and `physically_impossible` are null on every migrated row (not judged). D59 settled both open points: impossible tropes are recorded (`physically_impossible: true`, `not_yet`) and left out of lead-time statistics; the canon takes winners and shortlists and critics' lists across media, comics and anime/manga included.
- **Canon captured** (#79, `scripts/origins/canon-build.mjs`, 2026-10-03): 3,216 works in all. 3,079 are on at least one list, 40 more are the series of a listed episode (canon through their child works, no membership of their own), 97 migrated works stay `curated`. Of the 167 migrated works, 70 are on a list (44 of the 76 root works); their ids, order and depictions are unchanged. Depictions of the new works wait for the extraction (#80).

## The canon (#79, D57, D59)

**Rule.** A work is in the canon when it, or one of its episodes or seasons, appears on at least one list below, winners and shortlists alike (D59). Each membership is a row of `canon`: `list_id`, `list_name`, `year` (as the list labels it, see the table), `standing` (`winner`, `shortlisted`, `listed`), `entry_title` (the entry as the list names it, when it differs from the work's title: an episode, a volume, a translated title) and `source_url`. A stricter canon is a filter: winners only, or one list family. A work outside every list stays `curated` and is reported apart.

**Facts per work.** Title, original title, medium, year of first publication or release, creators, country of origin. Where a list entry links a Wikipedia article, the facts come from its Wikidata item (`wikidata` on the work; CC0): release or first publication date (P577, else start P580, else inception P571), country of origin (P495), director (film, episode), creator (series), developer (game, as `studio`), original-language title (P1476). Book and comic creators are the list's own author column. Where there is no item, or the item's date is after the list's eligibility year (a later collection, a fix-up novel, an omnibus), the year is the list's eligibility year and the work's `note` says so (1,157 works). An entry whose link names the work's source or series rather than the work (a film entry linking to the novel; a novel entry linking to its book series) keeps the list's title but takes no Wikidata facts.

**Dedupe.** One work per Wikidata item; without an item, per title and first creator's surname within a medium family; episodes per series and title. A migrated work is matched by Wikidata item, or by title (www subtitle notes such as "(Film)" ignored) within the same medium family and a year within one (three with the same first creator), roots before child works. An episode of a series that is itself a child work is recorded under the root (D57: a child's parent is never a child), with a note.

**SF rule for general lists** (`sf` in `canon-lists.mjs`: BAFTA, GDCA, Eisner, Japan Media Arts Festival, Sight and Sound): a membership counts when the work's Wikidata genre or class names science fiction or a subgenre (cyberpunk, space opera, dystopian, post-apocalyptic, mecha, biopunk, steampunk, time travel, kaiju, tokusatsu), or when the same work is on one of the science-fiction and fantasy lists. 825 general-list entries failed it and are not recorded. The Hugo, Nebula, Seiun and Saturn lists are taken whole: they are science-fiction-and-fantasy awards, so the canon holds fantasy works (no depiction will be extracted from most of them).

**Out of the media of D57.** 25 entries of the dramatic-presentation lists are not films, TV or games and are not recorded: record albums, radio dramas, stage plays, the 1969 TV coverage of Apollo 11, award-ceremony speeches, a filmography and a franchise page.

### Lists

All read on 2026-10-03 from the English Wikipedia list page named (wikitext through the MediaWiki API; revision ids in the build log), except Sight and Sound (BFI's own results page). Year column: `ceremony` = year of the award, the work is from the year before; `eligibility` = the work's year.

| List id | List | Year column | Years | Memberships | Works | Winner | Shortlisted | Listed | Why chosen; gaps |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| `hugo-best-novel` | Hugo Award for Best Novel | ceremony | 1953–2026 | 362 | 360 | 75 | 287 | | The fan-voted SF&F award of record. Includes fantasy. |
| `hugo-best-novel-retro` | Retro Hugo, Best Novel | ceremony | 1939–1954 | 43 | 43 | 8 | 35 | | Covers 1938–1953 in retrospect; only the years a Worldcon ran them. |
| `nebula-best-novel` | Nebula Award for Best Novel | eligibility | 1965–2025 | 353 | 353 | 62 | 291 | | Writers' (SFWA) award. Includes fantasy. |
| `locus-best-sf-novel` | Locus Award for Best SF Novel | ceremony | 1980–2026 | 47 | 47 | 47 | | | SF-only readers' poll. **Winners only**: Wikipedia lists no finalists (sfadb.com has them; not captured). |
| `hugo-best-novella` | Hugo Award for Best Novella | ceremony | 1968–2026 | 311 | 305 | 60 | 251 | | Short-form canon; many entries have no article (year from the list). |
| `hugo-best-novella-retro` | Retro Hugo, Best Novella | ceremony | 1939–1954 | 42 | 42 | 8 | 34 | | As the Retro novel list. |
| `nebula-best-novella` | Nebula Award for Best Novella | eligibility | 1965–2025 | 334 | 332 | 62 | 272 | | As the Nebula novel list. |
| `locus-best-novella` | Locus Award for Best Novella | ceremony | 1973–2026 | 54 | 54 | 54 | | | **Winners only** (as Locus SF novel). Locus novellas are SF and fantasy. |
| `clarke-award` | Arthur C. Clarke Award | ceremony | 1987–2026 | 247 | 247 | 40 | 207 | | Juried, SF-only, UK-published novels. |
| `philip-k-dick-award` | Philip K. Dick Award | ceremony | 1983–2026 | 270 | 270 | 47 | 223 | | SF first published as a US paperback original; special citations recorded as shortlisted. One poetry anthology is on the list. |
| `saturn-best-sf-film` | Saturn Award for Best Science Fiction Film | eligibility | 1972–2025 | 292 | 292 | 51 | 241 | | SF-only film award. |
| `afi-10-top-10-sf` | AFI's 10 Top 10, Science fiction (2008) | list year | 2008 | 10 | 10 | | | 10 | US critics' canon; American films only. |
| `sight-and-sound-2022` | Sight and Sound Greatest Films 2022, critics' poll (BFI) | list year | 2022 | 24 | 24 | | | 24 | The international critics' canon (top 250 with ties), SF rule applied. BFI's own SF top 100 is a book, not a public list. 19 poll films did not resolve to an article (none is SF). |
| `hugo-dramatic-presentation` | Hugo, Best Dramatic Presentation (one category) | ceremony | 1958–2002 | 195 | 191 | 38 | 157 | | Films, TV episodes and series. |
| `hugo-dramatic-presentation-long` | Hugo, Best Dramatic Presentation, Long Form | ceremony | 2003–2026 | 130 | 130 | 24 | 106 | | Mostly films; some TV seasons. |
| `hugo-dramatic-presentation-short` | Hugo, Best Dramatic Presentation, Short Form | ceremony | 2003–2026 | 126 | 126 | 23 | 103 | | Mostly TV episodes, recorded as child works of their series. |
| `hugo-dramatic-presentation-retro` | Retro Hugo, Best Dramatic Presentation | ceremony | 1939–1954 | 50 | 50 | 10 | 40 | | Radio dramas on the list are out of scope. |
| `nebula-ray-bradbury` | Nebula Ray Bradbury Award | eligibility | 1991–2025 | 106 | 106 | 18 | 88 | | SFWA's dramatic-presentation award. |
| `nebula-best-script` | Nebula Award for Best Script | eligibility | 1973–2008 | 58 | 58 | 13 | 45 | | Ran 1974–1978 and 2000–2009. |
| `saturn-best-sf-tv-series` | Saturn Award for Best SF Television Series | eligibility | 2015–2025 | 69 | 42 | 10 | 59 | | The only SF-specific TV award list; starts in 2015. Earlier Saturn TV categories are genre-wide (not taken). |
| `hugo-best-game` | Hugo Best Video Game (2021), Best Game or Interactive Work (2024–) | ceremony | 2021–2026 | 24 | 24 | 4 | 20 | | SF&F. |
| `nebula-game-writing` | Nebula Award for Best Game Writing | eligibility | 2018–2025 | 47 | 47 | 9 | 38 | | Includes tabletop games, recorded as `game`. |
| `bafta-best-game` | BAFTA Games Award for Best Game | eligibility | 2004–2025 | 38 | 38 | 13 | 25 | | General award, SF rule. |
| `gdca-game-of-the-year` | Game Developers Choice Award, Game of the Year | eligibility | 2000–2025 | 44 | 44 | 13 | 31 | | General award, SF rule. |
| `hugo-graphic-story` | Hugo Award for Best Graphic Story or Comic | ceremony | 2009–2026 | 101 | 69 | 17 | 84 | | SF&F comics; volumes recorded on their series with `entry_title`. |
| `eisner-best-continuing-series` | Eisner Award for Best Continuing Series | ceremony | 1989–2018 | 20 | 12 | 6 | 14 | | The US comics industry award, SF rule; only this category was read. |
| `seiun-japanese-long` | Seiun Award, Best Japanese Long Work | ceremony | 1970–2026 | 133 | 133 | 52 | 81 | | Japan's SF fan award (Nihon SF Taikai). |
| `seiun-japanese-short` | Seiun Award, Best Japanese Short Story | ceremony | 1970–2026 | 58 | 58 | 54 | 4 | | Mostly winners only on the page. |
| `seiun-dramatic-presentation` | Seiun Award, Best Dramatic Presentation | ceremony | 1970–2026 | 380 | 376 | 55 | 325 | | Japanese and foreign films and series, anime included; stage plays out of scope. |
| `seiun-comic` | Seiun Award, Best Comic | ceremony | 1978–2026 | 79 | 78 | 46 | 33 | | Manga. |
| `jmaf-animation` | Japan Media Arts Festival, Animation (Grand Prize, Excellence Prize) | ceremony | 1997–2022 | 20 | 20 | 20 | | | General award, SF rule; both prize levels recorded as `winner` with `category`. The festival ended in 2022. |
| `jmaf-manga` | Japan Media Arts Festival, Manga (Grand Prize, Excellence Prize) | ceremony | 2002–2022 | 11 | 11 | 11 | | | As above. |

**Not captured** (gaps): Locus finalists (sfadb.com); Harvey Awards (no stable list page of winners by category); Eisner categories other than Best Continuing Series; Retro Hugo Best Graphic Story; Seiun translated-work categories (foreign works already on the English-language lists); Emmy awards (no SF category); BFI's SF-specific top 100 (a book); Japan Media Arts entries without an article (the SF rule cannot be applied; 39 of 123 animation and 47 of 125 manga entries).

### Counts (works on a list, by medium and decade of the work's year)

| Medium | 1920s | 1930s | 1940s | 1950s | 1960s | 1970s | 1980s | 1990s | 2000s | 2010s | 2020s | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| novel |  | 6 | 27 | 29 | 67 | 95 | 160 | 196 | 207 | 239 | 162 | 1,188 |
| novella |  | 5 | 26 | 9 | 26 | 66 | 78 | 78 | 81 | 85 | 57 | 511 |
| short_story |  |  |  |  | 1 | 10 | 9 | 9 | 10 | 11 | 7 | 57 |
| film | 1 | 1 | 35 | 16 | 18 | 67 | 111 | 105 | 123 | 140 | 76 | 693 |
| short_film |  |  | 1 |  | 1 |  |  |  | 1 |  |  | 3 |
| tv_series |  |  |  | 3 | 4 | 10 | 12 | 22 | 39 | 58 | 49 | 197 |
| tv_episode |  |  | 4 | 3 | 10 | 1 | 1 | 10 | 44 | 51 | 38 | 162 |
| miniseries |  |  |  |  |  |  | 5 | 2 | 1 |  | 1 | 9 |
| game |  |  |  |  |  |  | 4 | 3 | 14 | 32 | 49 | 102 |
| comic |  |  |  |  | 1 | 13 | 28 | 15 | 28 | 43 | 29 | 157 |
| **all** | 1 | 12 | 93 | 60 | 128 | 262 | 408 | 440 | 548 | 659 | 468 | **3,079** |

682 works are on two or more lists. 785 works have at least one `winner` or `listed` membership (the winners-only canon).

### Bias note

The lists are mostly English-language and Western: of the 3,079 listed works, 1,232 have the USA as a country of origin, 247 the UK, and 1,082 have no country recorded (mostly novels and novellas whose Wikidata item has no country of origin, or no item at all; these are nearly all from the US and UK lists). The Hugo, Nebula, Locus, Clarke and Philip K. Dick lists rarely include translations (The Three-Body Problem and Frankenstein in Baghdad are exceptions). The Seiun Award and the Japan Media Arts Festival are what keep the canon from being Anglophone only: 553 works are on them alone, and 539 works have Japan as a country of origin (133 novels, 57 short stories, 118 films, 121 TV series, 85 manga, 19 games). Their own bias is Japanese: no Chinese, Korean, Latin American, African or European-language list was captured, so works such as Brazil's 3% or Germany's Dark stay `curated`. Awards over-represent recent decades (most lists start after 1960; the Retro Hugos and the critics' lists are the only route for earlier works). Lead-time figures built on this canon describe what these juries and voters recognised, not fiction in general.

## Subjects and research pages (D13, D48)

- The subject label of a migrated connection is the title of the research page it names (the shortest title when several projects share the `original_id`). It maps to an existing Hindsight subject by the D13 registry and normalized key, or by a judgment alias in `data/normalized/subject-curation.json` where the existing subject is the same technology (9 aliases, each with its reason); otherwise it names a new subject.
- `research` lists the published pages the connection points to; `scripts/origins/curated-links.mjs` turns each (subject, page) pair into a `curated` row of `data/links/research.json` (D48: never overwritten by agent runs). Pages of excluded projects (D52, D55) never get a row.
- 13 of the 67 research ids had no published page on 2026-10-03; none is in the cache of every technology of the published projects (excluded projects included). 7 were re-mapped to the page of the same technology (`research_status: remapped`, reason in `note`), 6 keep their depiction without a research link (`unresolved`). The list is in `scripts/origins/README.md`.

## www summaries

Not carried over. Several of www's work summaries follow the opening sentences of the Wikipedia article closely (CC BY-SA), which this CC BY repository cannot hold. Our own one-line descriptions come with the canon (#79) and the extraction (#80).

## Images

`image_url` is Envisioning's own generated artwork on Envisioning's Cloudinary (all 76 checked), kept as metadata only.
