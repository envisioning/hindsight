# Grading prompts (D7, D16, D20)

One file per role. The coordinating session fills the placeholders (`<source>`, `<paths>`, `<target>`, caps) and gives the prompt to a fresh agent. Every agent also follows `docs/AGENT-RULES.md`.

| Step | Role | Prompt | Output |
|---|---|---|---|
| 1 | Grader A and grader B, blind | `grader.md` | `data/raw/<source>/verdicts-d16-grader{A,B}.json` |
| 2 | Agreement (script) | `node scripts/agreement-d16.mjs <source>` | `agreement-d16.json` |
| 3 | Adjudicator | `adjudicator.md` | `adjudicated-d20.json` |
| 4a | Audit sample (script) | `node scripts/audit-sample.mjs <source>` | `audit-d11.json` (seed and sample, no records) |
| 4b | Auditor | `auditor.md` | `audit-d11.json` (records) |
| 5 | Final (script) | `node scripts/final-d20.mjs <source>` | `final-d20.json` |

Split large sources into batches of about 75 claims per grader agent. Both graders get the same batches. A batch writes `verdicts-d16-grader<A|B>-<batch>.json` (batch name in lowercase letters, digits and hyphens); the agreement script merges every batch file of a grader and fails on a duplicate id.

Step 4a runs after step 2 and before step 4b. The sample is drawn from the agreed verdicts, so it changes when the agreement changes. The script refuses to redraw over audit records. `--check` compares the stored sample with a fresh draw.

The Hype Cycle uses a variant: two blind builders write adoption timelines per subject (`timelines-builder{A,B}.json`), and verdicts are computed from edition plus band. See #42.
