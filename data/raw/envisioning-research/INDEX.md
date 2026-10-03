# Envisioning research database ratings (#95)

Envisioning's own current assessments: every published technology in a published research project of the Core CMS, with its three ratings, as they stood on each snapshot date. The CMS overwrites ratings in place and keeps no history, so these files are the only record of earlier ratings. Tracked in envisioning/hindsight#95.

Not graded. How ratings become claims is a proposal for MZ: `docs/proposals/research-ratings-grading.md`. Normalize (#95 step 4) waits for that decision.

## Files

One file per snapshot, `<YYYY-MM-DD>.json`, written by `scripts/envisioning-research/snapshot.mjs` (see its README) and monthly by `.github/workflows/research-snapshot.yml`. Append-only: a file is never rewritten; the script refuses to overwrite a date.

| Snapshot | Projects | Technologies | Excluded from linking | Custom-scale projects |
|---|---|---|---|---|
| 2026-10-03 | 47 | 4,018 | 306 (subspace 129, xenotech 177) | cities, moradia, subspace, xenotech |

## Shape

Header: `source`, `institution`, `snapshot_date`, `taken_at`, `method`, `licence`, `excluded_from_linking`, `counts` (published projects and technologies, technologies in unpublished projects left out, rows without ratings, labels not resolved), `distribution` (values per metric, all scales together), `projects_with_custom_metrics`, `projects` (technology count and scale per project), `scales` (`default` and each custom scale: metric name, where it came from, value to label).

`technologies`, one per line, sorted by project and `original_id`:

| Field | What |
|---|---|
| `id` | CMS technology UUID (stable; `original_id` and slugs can be renamed) |
| `research_slug`, `original_id`, `title` | project and page |
| `collection`, `collection_label` | CMS `collection_id` and label (label only when the CMS has one) |
| `metric1`, `metric2`, `metric3` | `{ name, value, label }`; value null when the CMS has none |
| `updated_at` | CMS row update time. A bulk date for most rows (2026-05-25, 2026-09-28), not the date a rating was set |
| `last_reviewed_at` | CMS review time; empty on every row on 2026-10-03 |
| `excluded_from_linking` | the decision (D52, D55) for projects never linked to subjects; kept here because they are Envisioning's assessments too |

## Scales

Resolved as the research apps resolve them: CMS `research_metrics` for the project and collection, else for the project, else the app-common defaults.

- Default (43 projects, 3,447 technologies): metric1 Technology Readiness Level 1 to 9 (Speculative, Theoretical, Conceptual, Formative, Validated, Demonstrated, Operational, Deployed, Established); metric2 Impact 1 to 5 and metric3 Investment 1 to 5 (Minimal, Low, Medium, High, Very High).
- `cities`: TRL with its own labels, Diffusion of Innovation 1 to 5, Technology Life Cycle 1 to 4.
- `moradia`: Grau de Adoção, Escala de Inclusividade, Fricção Operacional e Cultural, 1 to 5 each. 15 rows have no ratings.
- `subspace`: TRL 1 to 9, Prominence 1 to 5, Scientific Basis 1 to 3 (science fiction).
- `xenotech`: Citation Frequency, Plausibility Score, TRL (alleged exotic technology).

The research issue text named metric2 and metric3 as interest and product stage (`interestDefinitions`, `maturityDefinitions` in `metrics.ts`); no project uses those scales.

## Licence

CC BY 4.0 (`NOTICE.md`). Facts only: values, labels and dates of Envisioning's own ratings. Summaries and descriptions are not copied.
