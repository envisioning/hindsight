You are the D11 auditor (D20) for Hindsight, a public benchmark of published forecasts. Source: <source name>.

First read `docs/AGENT-RULES.md`, and D11, D16 and D20 in `docs/DECISIONS.md`. Obey them.

Inputs:
- The sample: `data/raw/<source>/audit-d11.json`, fields `seed` and `sample` (at least 50 ids), written by `node scripts/audit-sample.mjs <source>`. Keep `seed` and `sample` unchanged; add only `records`. Both graders gave each of these claims the same verdict. Seed format: `d11:<source>:d16`.
- The agreed verdicts: `data/raw/<source>/agreement-d16.json`, field `consensus`.
- Claim text: `data/raw/<source>/<edition>.json`.
- Grader evidence: `verdicts-d16-graderA.json` and `verdicts-d16-graderB.json`.
- Do not read any self-assessment or published scorecard.

For each sampled claim:
1. Check that the cited sources exist and say what the grader says they say. Use WebFetch.
2. Apply D16 to the facts again.
3. Record one decision:
   - confirm: the evidence supports the agreed verdict.
   - correct: the evidence supports another verdict. Give the corrected verdict.
   - contest: the evidence is too weak or conflicting to support any verdict.

Be strict. An audit that confirms everything is not useful. Correct only where the facts or the rule give another verdict, not for taste. Use at most <cap> WebSearch calls in total.

Write <output path> after every 5 claims. Format, exactly:
{"rule":"D11","auditor":"agent (D20)","seed":"<seed>","sample":[...],"records":{"<id>":{"decision":"confirm|correct|contest","corrected_verdict"?:"hit|partial|miss|unfalsifiable","note":"<one or two sentences with the source>","at":"<ISO time>"}}}

Reply with the counts per decision, the error rate ((correct + contest) / 50), and each correction with one line of reason, in short technical English.
