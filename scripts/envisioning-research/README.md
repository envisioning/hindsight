# Research ratings snapshot (#95)

Writes `data/raw/envisioning-research/<YYYY-MM-DD>.json` (UTC date of the run): every published technology in a published research project of the Core CMS, with metric1 to metric3, the resolved labels and metric names, collection, `updated_at` and `last_reviewed_at`. Shape and scales: `data/raw/envisioning-research/INDEX.md`.

## Input

The Core CMS PostgREST API, read with the public anon key (published rows only; never writes). Tables: `research` (slug, published), `research_metrics` (per-project and per-collection `metrics_config`), `technologies`. Same client as the links snapshot (`scripts/links/lib.mjs` `cmsRows`). Projects in `data/links/excluded-projects.json` are kept and marked `excluded_from_linking`.

Label resolution follows the research apps (research `projects/_shared/lib/supabase-technologies.ts`, `getMetricsConfigFromSupabase`): the `research_metrics` row for the project and collection, else the project row (`collection_id` null), else the app-common defaults (TRL 1 to 9; Impact and Investment 1 to 5). A value with no label in its scale keeps `label: null` and is counted in `counts.unresolved_labels`.

## Run

Secrets go only into the process environment of the command; never into a file in the repo, never printed.

```
CMS_URL=... CMS_ANON_KEY=... node scripts/envisioning-research/snapshot.mjs           # writes today's file
CMS_URL=... CMS_ANON_KEY=... node scripts/envisioning-research/snapshot.mjs --check   # reads and counts, writes nothing
```

Append-only: if today's file exists the script stops and writes nothing. One snapshot per date.

## Schedule

`.github/workflows/research-snapshot.yml` runs on the 1st of each month at 10:00 UTC (an hour after `refresh-due`) and on manual dispatch. It runs the script and commits the new file to `main` as `github-actions[bot]`. It needs two repository secrets (Settings, Secrets and variables, Actions):

- `CMS_URL`: the Core CMS project URL (`NEXT_PUBLIC_SUPABASE_URL_CMS` in the research repo's `.env`).
- `CMS_ANON_KEY`: the public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY_CMS`).

Setting them is a manual step for MZ: `gh secret set CMS_URL -R envisioning/hindsight` and `gh secret set CMS_ANON_KEY -R envisioning/hindsight` (each prompts for the value). Until they are set the workflow fails at the snapshot step and commits nothing.

The workflow does not run `pnpm manifest` or `pnpm normalize`: the files are not yet read by normalize or the site (#95 step 4 waits for the grading rule).
