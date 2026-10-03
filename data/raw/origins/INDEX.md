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

A file holds a family of works under the medium of its root work; each child work has its own `medium`, `year` and `parent`. A work is a source edition of `origins` (edition = work id, published = year). Each depiction becomes a claim `origins-<work id>-<nnn>` (D15: nnn is the depiction's position in `depictions` on first assignment; natural key = `key`).

## State (2026-10-03)

- **Migrated from www** (`content/origins/data.ts`, #78, `scripts/origins/migrate-www.mjs`): 76 works and their 91 subtitles as child works (167 works), 165 connections as 165 depiction claims with `basis: connection`. All 167 are `inclusion: curated` until the canon (#79) is captured. `node scripts/origins/check-www.mjs` proves that every work, subtitle and connection of data.ts exists here with an id.
- A migrated connection is a hand-made link from a work to a research technology page, not a checked depiction: its subject is the technology the connection named (D13 mapping, below) and its claim says the catalogue *connects* the work to it. Some connections are analogies (The Terminator to Autonomous Field Robotics; Project Hail Mary's Astrophage drive to Nuclear Fusion Reactor). The extraction (#80) judges depictions under D20; a migrated row is kept, and a checked depiction is a new claim with `basis: extraction`.
- `centrality` and `physically_impossible` are null on every migrated row (not judged).

## Fields that wait for a decision

- `physically_impossible` (D57 rule a, open, MZ decides): whether impossible tropes such as warp drive are recorded as `not_yet` with a note or excluded. The field is filled by the extraction either way; the measure reads it.
- `canon[].standing` (D57 rule b, open, MZ decides): winners only or shortlists too, and whether comics and anime lists count. Every membership is captured with its standing, so the rule is a filter.

## Subjects and research pages (D13, D48)

- The subject label of a migrated connection is the title of the research page it names (the shortest title when several projects share the `original_id`). It maps to an existing Hindsight subject by the D13 registry and normalized key, or by a judgment alias in `data/normalized/subject-curation.json` where the existing subject is the same technology (9 aliases, each with its reason); otherwise it names a new subject.
- `research` lists the published pages the connection points to; `scripts/origins/curated-links.mjs` turns each (subject, page) pair into a `curated` row of `data/links/research.json` (D48: never overwritten by agent runs). Pages of excluded projects (D52, D55) never get a row.
- 13 of the 67 research ids had no published page on 2026-10-03; none is in the cache of every technology of the published projects (excluded projects included). 7 were re-mapped to the page of the same technology (`research_status: remapped`, reason in `note`), 6 keep their depiction without a research link (`unresolved`). The list is in `scripts/origins/README.md`.

## www summaries

Not carried over. Several of www's work summaries follow the opening sentences of the Wikipedia article closely (CC BY-SA), which this CC BY repository cannot hold. Our own one-line descriptions come with the canon (#79) and the extraction (#80).

## Images

`image_url` is Envisioning's own generated artwork on Envisioning's Cloudinary (all 76 checked), kept as metadata only.
