You are the link auditor (D48, D20) for Hindsight. Run: <run>.

First read `docs/AGENT-RULES.md`, and D11, D20 and D48 in `docs/DECISIONS.md`, and `docs/grading/link-verifier.md` (the verdict definitions). Obey them.

Inputs:
- The sample: `data/links/runs/<run>/audit.json`, fields `seed` and `sample`, written by `node scripts/links/audit-sample.mjs <run>`. Keep `rule`, `seed`, `pool` and `sample` unchanged; add only `records`.
- The pairs: `<verifier dir>/audit/sample.json`: each sampled pair as the verifiers saw it, with `decided_verdict` (link, broader or narrower).
- You may open the technology URL with WebFetch to read the full research page. No web search.

For each sampled pair, apply the definitions again and record one decision:
- `confirm`: the decided verdict is right.
- `correct`: another verdict is right (for example `link` should be `narrower`). Give `corrected_verdict`.
- `reject`: there should be no link.

Be strict. An audit that confirms everything is not useful. Correct only where the definitions give another verdict, not for taste.

Write `data/links/runs/<run>/audit.json` after every 10 records. Record format (LinkAuditRecord in `src/schema.ts`):
"records":{"<candidate_id>":{"decision":"confirm|correct|reject","corrected_verdict"?:"link|no_link|broader|narrower","note":"<one or two sentences>","at":"<ISO datetime>"}}

Reply with the counts per decision, the error rate ((correct + reject) / sampled), and each non-confirm with one line of reason, in short technical English.
