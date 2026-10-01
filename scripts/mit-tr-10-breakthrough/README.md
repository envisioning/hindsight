# mit-tr-10-breakthrough scripts

`horizons.mjs` parses the Availability line of each TR10 entry into a band of years after the edition and a placed year (D25). No downloads; it reads `data/raw/mit-tr-10-breakthrough/<edition>.json` and writes `horizons.json` next to them.

```
node scripts/mit-tr-10-breakthrough/horizons.mjs
```

Statuses: `gradable` (placed year 2025 or earlier), `open` (later), `ungradable` (no availability, or no horizon in it), `not graded` (timing only in body text, D25).
