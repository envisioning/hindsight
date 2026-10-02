# Links to Envisioning research technologies (D48, #59)

Hindsight subjects (kind `technology`) linked to technologies in Envisioning's research database (Core CMS `technologies`), both directions. This repo only reads the CMS (public anon key, published rows of published research projects) and never writes to it. Shapes: `src/schema.ts` (`SubjectText`, `LinkCandidate`, `LinkVerdictFile`, `LinkAuditRecord`, `SubjectTechnologyLink`).

## Files

| File | What | Written by |
|---|---|---|
| `technologies-snapshot.json` | The technologies the run saw: id, URL parts, title, sha256 of the embedding text. No vectors. | `snapshot.mjs` |
| `model-checks.json` | Embedding trap check: stored rows re-embedded, cosine must be above 0.9. Append-only log. | `check-model.mjs` |
| `subject-vectors.json` | Model, dimensions and the sha256 of each embedded subject text. No vectors. | `embed-subjects.mjs` |
| `runs/<run>/candidates.json` | Candidate pairs with similarity, ranks from each side, mutual nearest neighbour flag, match type, batch. | `candidates.mjs` |
| `runs/<run>/verdicts/verifier-<A\|B>-<batch>.json` | Blind verifier calls, copied in from the verifier directory. | verifier agents |
| `runs/<run>/agreement.json` | Kappa, consensus, contested, missing. | `agreement.mjs` |
| `runs/<run>/adjudicated.json` | Adjudicator calls on contested pairs. | adjudicator agent |
| `runs/<run>/audit.json` | Fixed-seed sample of accepted links and the auditor's records. | `audit-sample.mjs`, auditor agent |
| `runs/<run>/final.json` | Verdict counts and the audit error rate of the run. | `final.mjs` |
| `research.json` | The links. Append-only `SubjectTechnologyLink` rows; the latest row of a pair is its state. | `final.mjs` |
| `by-technology.json` | Technology to forecasts (`LinksByTechnology`), keyed by `<research_slug>/<original_id>`: the linked subjects with their relation, and the published claims about them (count, publishers alphabetical (D17), first and last year, verdict counts, up to 20 claims newest first with publisher, year and verdict). | `pnpm links` |
| `by-subject.json` | Forecast to technology (`LinksBySubject`), keyed by subject id: the linked technologies with research slug, `original_id`, title and relation, and every published claim about the subject (newest first, same fields as above). | `pnpm links` |

Subject text (the embedding input) is `data/normalized/subject-text.json`, written by `pnpm normalize`.

## Run

Secrets go only into the process environment of the command that needs them. Vectors and CMS rows are cached in `LINKS_CACHE`, a directory outside the repo; verifier input goes to another directory outside the repo (`<verifier dir>`).

```
LINKS_CACHE=<cache> CMS_URL=... CMS_ANON_KEY=... node scripts/links/snapshot.mjs
LINKS_CACHE=<cache> OPENROUTER_API_KEY=... node scripts/links/check-model.mjs        # stops unless cosine > 0.9
LINKS_CACHE=<cache> OPENROUTER_API_KEY=... node scripts/links/embed-subjects.mjs
LINKS_CACHE=<cache> node scripts/links/candidates.mjs --run <run> --out <verifier dir>
# verifiers A and B per batch (docs/grading/link-verifier.md), blind; copy their files into runs/<run>/verdicts/
node scripts/links/agreement.mjs <run> --out <verifier dir>                         # kappa >= 0.6 (D11)
# adjudicator (docs/grading/link-adjudicator.md) -> runs/<run>/adjudicated.json
node scripts/links/audit-sample.mjs <run> --out <verifier dir>
# auditor (docs/grading/link-auditor.md) -> runs/<run>/audit.json records
node scripts/links/final.mjs <run>
pnpm links                                                                       # by-technology.json, by-subject.json
git add data/links && pnpm manifest
```

`pnpm links` (`scripts/links/publish.mjs`) reads the latest row of each pair in `research.json` (a `curated` row is never overridden by a later agent row) and keeps active rows only. Titles and URL parts come from `technologies-snapshot.json`, not from the row (D48); a link whose technology or subject is missing from the snapshot or `subjects.json` is dropped and counted. Claims are the published claims in `data/normalized/claims`; the verdict is the D20 final (`final-d20.json`), else the D33 trend final (`final-d33.json`), else a graded D19 numeric row; contested, `open` and `gap` rows carry no verdict. Run it after `pnpm normalize`, grading and `final.mjs`. The output is deterministic; `pnpm links --check` fails when the committed files are stale. `pnpm manifest` lists the tracked files of `data/links` under `links` in `data/raw/manifest.json`; www reads them from GitHub raw at `data/links/<file>` (local `../hindsight/data/links` in development).

Reading of the verdicts (D48, applied from `d48-r0`): a technology whose `original_id` has a region prefix (`china__`, `usa__`, `europe__`, `canada__`, and the other country series such as `japan__` or `india__`) is a regional landscape entry: its summary and examples are one country's or region's companies, programmes and policy. Against a subject with no regional scope it is `narrower` (a direct regional case, kept as a related link), never `link`, even when its description opens with a general definition; a project can hold both the general page and the regional one (`apogee/commercial-space-stations` and `apogee/usa__commercial-space-stations`). A page without a prefix whose summary only frames the technology for its project (urban, financial, gaming) is `link` when it describes the technology itself, and `narrower` only when it names a specific application (`cities/generative-ai`: urban design scenarios).

Amendment (D49): run `d48-r0` is titles only (`candidates.mjs --titles-only`): exact and alias title matches, no vectors, similarity null. Every later run skips pairs decided in an earlier run (`final.json` `decisions`) and pairs held by a curated link. When one verdict dominates (expected agreement 0.8 or more), the agreement gate is observed agreement 0.9 or more instead of kappa 0.6.

## State

- `d48-r0` (titles only): 100 candidates (97 exact, 3 alias), 79 subjects, 1 batch. Verifiers agree on 99 of 100 (kappa 0.97); 1 adjudicated (`synthetic-data` to `cities/synthetic-data`: `link`). Verdicts: 83 link, 15 narrower (14 region-prefixed pages, plus `cities/generative-ai`), 0 broader, 2 no_link. 98 rows appended to `research.json` (83 `same`, 15 `narrower`).
- `d48-r1` (embeddings): blocked on a working embedding key.

Audit error rate: `d48-r0` 0% (50 sampled of 98 accepted links: 43 link, 7 narrower; 50 confirm, 0 correct, 0 reject). Audited on the CMS title, summary and description, because the research pages answered 429 behind a bot checkpoint.
