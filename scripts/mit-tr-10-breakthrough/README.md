# mit-tr-10-breakthrough scripts

`horizons.mjs` parses the Availability line of each TR10 entry into a band of years after the edition and a placed year (D25). No downloads; it reads `data/raw/mit-tr-10-breakthrough/<edition>.json` and writes `horizons.json` next to them.

```
node scripts/mit-tr-10-breakthrough/horizons.mjs
```

Statuses: `gradable` (placed year 2025 or earlier), `open` (later), `ungradable` (no availability, or no horizon in it), `not graded` (timing only in body text, D25).

Horizon readings beyond the plain forms: "Later this year" and "N months" (N < 12, January editions) are placed at the edition year, with a parse note.

## when-who.mjs

Extracts the WHO / WHEN lines (2021: "Key players:" / "Availability:") from saved article pages. It reads local HTML only; download the pages first, outside the repo:

```
mkdir -p /tmp/mittr && cd /tmp/mittr
curl -sL -A "Mozilla/5.0" -o 2025-03.html <article source_url from data/raw/mit-tr-10-breakthrough/2025.json>
node <repo>/scripts/mit-tr-10-breakthrough/when-who.mjs *.html
```

Input URLs: each entry's `source_url` in `data/raw/mit-tr-10-breakthrough/<edition>.json` (2021-2026). It handles three layouts: the 2021 content list, the 2022-2025 body box (h4 WHO/WHEN), and the 2026 header box. Prints one JSON line per file; a null means the label is not on the page.
