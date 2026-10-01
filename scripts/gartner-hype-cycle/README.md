# Gartner Hype Cycle verdicts (D21)

Computes D16 verdicts for Hype Cycle entries from adoption timelines. No downloads; all inputs are in `data/raw/gartner-hype-cycle/` and `data/normalized/claims/gartner-hype-cycle.json`.

| Script | Reads | Writes |
|---|---|---|
| `rule.mjs` | (module) | The D16 rule: timeline + placed year -> verdict |
| `verdicts.mjs` | edition files, `timeline-subjects.json`, `timelines-builder{A,B}.json` | `verdicts-d16-grader{A,B}.json` |
| `adjudicate.mjs` | `agreement-d16.json`, `timelines-adjudicated-d20.json` | `adjudicated-d20.json` |

## Run

```
node scripts/gartner-hype-cycle/verdicts.mjs
node scripts/agreement-d16.mjs gartner-hype-cycle
node scripts/audit-sample.mjs gartner-hype-cycle
# adjudicator agents write timelines-adjudicated-d20.json; auditor agents add records to audit-d11.json
node scripts/gartner-hype-cycle/adjudicate.mjs
node scripts/final-d20.mjs gartner-hype-cycle
```
