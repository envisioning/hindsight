# Why technology forecasts miss (D63)

For each sampled technology forecast whose final verdict is `miss` or `partial`, two blind coder agents name the main cause of the shortfall from a closed list. The test and its thresholds are in D63 (`docs/DECISIONS.md`) and were committed before any coding.

## Files

- `runs/<run>/candidates.json`: the sample (`node scripts/causes/candidates.mjs <run>`, seed `d63:<run>`), with the graders' readings, reasons and evidence for each claim.
- `runs/<run>/calls/coder-<A|B>-<batch>.json`: the blind coder calls (`MissCauseFile`, prompt `docs/grading/cause-coder.md`).
- `runs/<run>/agreement.json`, `contested.json`, `audit-sample.json`: `node scripts/causes/agreement.mjs <run>`.
- `runs/<run>/calls/adjudicator.json`, `calls/auditor.json`: the adjudicator's and the auditor's calls (`docs/grading/cause-adjudicator.md`, `docs/grading/cause-auditor.md`).
- `runs/<run>/final.json`: one row per claim and the test (`node scripts/causes/final.mjs <run>`).

## Causes

| Cause | Family | Meaning |
|---|---|---|
| technical | technical | did not work, perform or scale well enough |
| cost | non_technical | worked, but too expensive for the forecast market |
| regulation | non_technical | law, approval, licensing, liability, public standards |
| acceptance | non_technical | people or organisations did not want it |
| complements | non_technical | missing infrastructure, ecosystem, content, standards, supply chain |
| market | non_technical | business model, incumbents, platform contests, company failure, funding |
| substitution | forecast_error | another technology met the need |
| overreach | forecast_error | ordinary adoption path; the forecast set the date or level beyond it |
| unknown | unknown | no opened evidence shows the cause |
