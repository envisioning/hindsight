# Prompt for the next agent

You continue Hindsight (envisioning/hindsight): a public record of published forecasts, graded against what happened. You research, grade and publish, one source at a time, and push each result to `main`.

## Read first

`docs/HANDOFF.md` (state, cloud notes, traps), `AGENTS.md`, `docs/AGENT-RULES.md`, `docs/DECISIONS.md` (D1 to D26), `docs/grading/`.

## Start checks (stop and report if one fails)

- `git push --dry-run origin HEAD:main`
- `curl -sS -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Smartphone` prints 200.

## Work, in this order

1. **#52** Normalize adapters for eurasia, economist, kurzweil, pew-elon. No web search. Unblocks 2 and 3.
2. **#46** Economist The World Ahead and **#50** Pew/Elon: grade with the D20 pipeline.
3. **#47, #48** (Eurasia, WEF risk forecasts): write the rule as a proposed decision. MZ approves the policy, then grade.
4. **#53** Agent audit of numeric forecast-to-actual matching, then **#61** (apply audit error to rates) and **#54** (definition calls in code).
5. **Fetch-failure pass (D24)** on Deloitte, IDC and Gartner Strategic Predictions: re-check one-sided or agreed `ungradable` calls whose reason says the source was blocked. Write a new pass file; never overwrite.
6. **#62** Dispute handling. **#59** Links to research technologies (only if `OPENROUTER_API_KEY` is set).
7. **Site (www repo, private):** open issues for a wave-aware `drawSample` check (D26, Kurzweil wave 2), a per-edition Kurzweil rate, `rate_withheld` display (IDC), and **#56**.
8. **Capture** the sources not yet captured (#26 to #34, #36), then grade them.
9. **#58** Yearly refresh: when a target year passes, grade the newly gradable claims as a new wave (D26). **#3** Release.

## How to grade a source (D20)

1. Build batch inputs (about 60 claims) in the scratchpad from `data/normalized/claims/<source>.json`, target year 2025 or earlier.
2. Two blind graders per batch (`docs/grading/grader.md` plus the source rule). Graders write to the scratchpad only. Copy into `data/raw/<source>/` after both finish.
3. `node scripts/agreement-d16.mjs <source>`. Kappa below 0.6: revise the rubric (new decision), re-grade.
4. Adjudicator on contested claims, auditor on `node scripts/audit-sample.mjs <source>`.
5. `node scripts/final-d20.mjs <source>`, `git add data/raw/<source>`, `pnpm manifest`, `pnpm typecheck`, `pnpm build`, commit, push to `main`. Comment the result on the issue and close it.

## Rules that agents broke before

- Never put the user's email or any identifier in a request (SEC EDGAR asks for one in the User-Agent; use a generic one). Put this line in every agent prompt.
- Downloads go in the scratchpad, never in the repo root.
- Cap WebSearch per agent (3 to 5); about 200 per session. Prefer WebFetch. Wayback is not reachable from the cloud.
- At most 20 concurrent sub-agents.
- Agents make every verdict, adjudication and audit call. Ask MZ only about the decisions in HANDOFF.md.
- Commit only files you checked. Leave `main` green.

Report to MZ in short ASD-STE100 English. No time estimates.
