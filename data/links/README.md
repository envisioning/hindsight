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
```

## State

No run has been decided yet. Audit error rate: not yet measured.
