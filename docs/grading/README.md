# Grading prompts (D7, D16, D20)

One file per role. The coordinating session fills the placeholders (`<source>`, `<paths>`, `<target>`, caps) and gives the prompt to a fresh agent. Every agent also follows `docs/AGENT-RULES.md`.

| Step | Role | Prompt | Output |
|---|---|---|---|
| 1 | Grader A and grader B, blind | `grader.md` | `data/raw/<source>/verdicts-d16-grader{A,B}.json` |
| 2 | Agreement (script) | `scripts/kurzweil/agreement.mjs` until #41 makes it generic | `agreement-d16.json` |
| 3 | Adjudicator | `adjudicator.md` | `adjudicated-d20.json` |
| 4 | Auditor | `auditor.md` | `audit-d11.json` |
| 5 | Final (script) | `node scripts/final-d20.mjs <source>` | `final-d20.json` |

Split large sources into batches of about 75 claims per grader agent. Both graders get the same batches.

The Hype Cycle uses a variant: two blind builders write adoption timelines per subject (`timelines-builder{A,B}.json`), and verdicts are computed from edition plus band. See #42.
