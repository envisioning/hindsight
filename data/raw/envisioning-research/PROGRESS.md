# Progress: envisioning-research (#95)

| Step | State |
|---|---|
| 1. Snapshot script | done: `scripts/envisioning-research/snapshot.mjs` |
| First snapshot | done: `2026-10-03.json`, 4,018 technologies in 47 projects |
| 2. Monthly schedule | written: `.github/workflows/research-snapshot.yml` (1st of the month, 10:00 UTC, after refresh-due). Runs once the repo secrets `CMS_URL` and `CMS_ANON_KEY` are set |
| 3. Grading rule | proposal for MZ: `docs/proposals/research-ratings-grading.md`. No D number, nothing graded |
| 4. Normalize | waiting for the rule. Not started |

## Snapshots

| Date | Technologies | Notes |
|---|---|---|
| 2026-10-03 | 4,018 | first snapshot, taken by hand; `last_reviewed_at` empty on every row; 15 `moradia` rows without ratings |

## Gaps

- Earlier ratings are lost: the CMS kept no history before 2026-10-03.
- `democracy` keeps its signals and custom metrics in code, not in the CMS, so it is not in any snapshot.
- Ratings in unpublished projects (789 technologies, 12 projects) are left out until their project is published.
