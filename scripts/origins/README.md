# Origins scripts (D57, epic #85)

| Script | What |
|---|---|
| `migrate-www.mjs [data.ts]` | One-off move of the www catalogue (`content/origins/data.ts`, read only) into `data/raw/origins/works-*.json` (#78). Deterministic: a re-run writes the same files. |
| `check-www.mjs [data.ts]` | Proves nothing was dropped: every work, subtitle and connection of data.ts exists in the raw files with an id, as a normalized claim and a `FictionDepiction` row. Exit 1 on any gap. |
| `curated-links.mjs [--check]` | One `curated` row in `data/links/research.json` per (subject, research page) pair of the depictions (D48: never overwritten by agent runs). Idempotent. |

Default input of the first two: `../www/content/origins/data.ts` next to the repository; pass the path otherwise.

```
node scripts/origins/migrate-www.mjs ../www/content/origins/data.ts
pnpm normalize
node scripts/origins/curated-links.mjs
pnpm links
node scripts/origins/check-www.mjs ../www/content/origins/data.ts
```

## Migration result (2026-10-03)

- **Summaries dropped.** www's one-paragraph summary of each work is not migrated: several follow the opening sentences of the Wikipedia article closely (CC BY-SA), which this CC BY repository cannot hold. The canon (#79) and the extraction (#80) write our own one-line descriptions. Everything else of data.ts is kept (`check-www.mjs`).
- 76 works and 91 subtitles (child works) = 167 works; 165 connections = 165 claims `origins-<work>-<nnn>` over 66 subjects (20 existing, 46 new). `check-www.mjs`: 0 gaps.
- Research pages: 54 of the 67 ids are published pages in `technologies-snapshot.json` (7 of them exist in two projects under the same `original_id`; the connection links both pages). 13 are not.
- `curated-links.mjs`: 67 curated pairs. 16 repeat an active D48 link (one keeps the verifiers' `narrower`: `generative-ai` to `cities/generative-ai`); 51 are new. `pnpm links` publishes 19 of them (3 new to the site: `brain-computer-interface` to `vortex/brain-computer-interfaces`, `emotion-recognition` to `wintermute/emotion-recognition-systems`, `real-time-language-translation` to `wintermute/real-time-language-translation`). 48 wait, because their subject has no published forecast (an Origins-only subject has nothing to show on a Hindsight subject page): they publish when the subject gets a forecast or www reads the Origins tables (#84).
- No pair points into an excluded project (D52, D55); the script refuses one.

## The 13 research ids without a published page

The cache of the D48 snapshot (`LINKS_CACHE/technologies.json`, 2026-10-02) holds every published technology of the 47 published research projects, the excluded `xenotech` and `subspace` included (4,018 rows). It does not hold the 789 technologies of unpublished projects, unpublished rows or deleted rows, so it cannot say which of these happened. None of the 13 ids is in it under any project. The 11 seventeen-character ids are in a legacy format (not CMS slugs); `simulated-worlds-with-synthetic-life` and `neuromodulation` are slugs no current row uses.

| www id | Depictions | Fate | Subject |
|---|---|---|---|
| `npNFqwWnPZaWPTwxD` | Star Trek TOS, Arrival (universal translator) | re-mapped to `wintermute/real-time-language-translation`; the fictional device's page `subspace/universal-translator` is excluded (D55) | `real-time-language-translation` |
| `M48kkR47huomEHiYL` | Star Trek TOS, 2001 (ship's computer, HAL) | no page; no link | `virtual-assistants` |
| `kB3Ykz7Y8Yiasnbp2` | Star Trek TOS, 2001, Interstellar (autonomous spacecraft) | re-mapped to `apogee/spacecraft-autonomy-stacks` | `spacecraft-autonomy-systems` (new) |
| `CyptkuadkcSAp5hse` | Star Trek TNG (replicator) | no page (`horizons/nanofactory` is close, not the same; `subspace/replicator` excluded); no link | `matter-replicator` (new) |
| `k6hgHAfGK2pzQgLXW` | Star Trek TNG, Neuromancer, Serial Experiments Lain, Paprika, Upload (immersive virtual worlds) | re-mapped to `liminal/virtual-reality` | `virtual-reality` |
| `geE8NoNwWB9vXN2eS` | Star Trek TNG (holodeck haptics) | no general page; no link | `haptics` |
| `B3tTYR5FSBwmC4nWy` | 2001 (HAL's speech) | no page; no link | `conversational-user-interfaces` |
| `q29bFRxKvuPjiESWZ` | 2001 (HAL's lip reading) | no page; no link | `automated-lip-reading` (new) |
| `syYZoAo37KrHEnjke` | Neuromancer (neural interfaces) | re-mapped to `vortex/brain-computer-interfaces` | `brain-computer-interface` |
| `Lm9YJupQM2dz3u89L` | Neuromancer, Devs (quantum computing) | re-mapped to `horizons/quantum-computing` | `quantum-computing` |
| `qNaGu7hh9DwAmr4CW` | Neuromancer (decentralized network) | re-mapped to `lattice/blockchain` | `blockchain` |
| `simulated-worlds-with-synthetic-life` | Black Mirror Hang the DJ and Joan Is Awful, The Matrix, Devs | re-mapped to `wintermute/simulated-synthetic-life` (same title, new `original_id`) | `simulated-worlds-with-synthetic-life` (new) |
| `neuromodulation` | Do Androids Dream of Electric Sheep? (Penfield mood organ) | no general page (four device-specific neuromodulation pages); no link | `neuromodulation` (new) |

7 re-mapped, 6 kept without a research link. Every decision and its reason is in `REMAPS` in `migrate-www.mjs` and in the depiction's `note`.
