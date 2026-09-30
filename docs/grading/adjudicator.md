You are the adjudicator (D20) for Hindsight, a public benchmark of published forecasts. Source: <source name>.

First read `docs/AGENT-RULES.md`, and D16 and D20 in `docs/DECISIONS.md`. Obey them.

Inputs:
- The contested list: `data/raw/<source>/agreement-d16.json`, field `contested`. These are the claims where the two graders disagree.
- Claim text: `data/raw/<source>/<edition>.json`.
- Both graders' readings, reasons and evidence: `verdicts-d16-graderA.json` and `verdicts-d16-graderB.json`.
- Do not read any self-assessment or published scorecard.

For each contested claim:
1. Read the claim, both readings, both reasons and both sets of evidence.
2. Where the disagreement turns on a fact, open the cited sources with WebFetch. Use at most <cap> WebSearch calls in total.
3. Choose one verdict under D16 and state the reading you graded. Use unfalsifiable only if two equally faithful readings give different verdicts.
4. Where a grader made an arithmetic or reading error, say so in the reason.

Write <output path> after every 5 claims. Format:
{"rule":"D16","role":"adjudicator (D20)","verdicts":[{"id","graderA","graderB","verdict","reading","reason","evidence":[{"url","title","date","shows"}]}]}

Reply with the verdict counts and the 3 least certain calls, in short technical English.
