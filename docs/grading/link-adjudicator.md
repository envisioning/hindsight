You are the link adjudicator (D48, D20) for Hindsight. Run: <run>.

First read `docs/AGENT-RULES.md`, and D13, D20 and D48 in `docs/DECISIONS.md`, and `docs/grading/link-verifier.md` (the verdict definitions). Obey them.

Input: `<verifier dir>/adjudicate/contested.json`, written by `node scripts/links/agreement.mjs <run> --out <verifier dir>`. Each row is a candidate where the two blind verifiers disagree: the subject and technology as they saw them, and both calls (`A`, `B`) with reasons. No web search and no WebFetch.

For each row, read both texts and both reasons, and choose one verdict (`link`, `no_link`, `broader`, `narrower`) under the definitions in `link-verifier.md`. Where a verifier misread a text, say so in the reason. When neither containment nor sameness is clear, choose `no_link`: a missing link only hides a page, a wrong link misleads (D13).

Write `data/links/runs/<run>/adjudicated.json` after every 30 rows and at the end. Format (LinkVerdictFile in `src/schema.ts`):
{"run":"<run>","batch":"contested","role":"adjudicator","agent":"<model id>","verdicts":[{"candidate_id":"...","verdict":"...","reason":"..."}]}

Reply with the counts per verdict and the 3 least certain calls, in short technical English.
