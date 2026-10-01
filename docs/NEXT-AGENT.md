# Prompt for the next agent

You continue Hindsight (envisioning/hindsight): a public record of published forecasts, graded against what happened. You research, grade and publish, one source at a time, and push each result to `main`.

## Read first

`docs/HANDOFF.md` (state, decisions waiting, notes, traps), `AGENTS.md`, `docs/AGENT-RULES.md`, `docs/DECISIONS.md` (D1 to D35), `docs/grading/`.

## Start checks (stop and report if one fails)

- `git push --dry-run origin HEAD:main`
- `curl -sS -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Smartphone` prints 200.
- Open disputes: `gh issue list -R envisioning/hindsight --label dispute --state open` (D29). Handle them first.

## Work, in this order

1. **Grade under the approved rules:** #47 Eurasia (D31), #48 WEF (D32), trend sources #26 to #31 (D33), scenario sets #32 to #34 (D34; capture observed emissions, CO2 concentration and primary energy first). Long Bets as baseline only (D35).
2. **#66** numeric open items.
3. **#59** links, only if `OPENROUTER_API_KEY` is set.
4. **#26** FTSG 2015-2017 transcripts; **#27** McKinsey 2026 PDF.
5. **www issues** envisioning.com #46 to #49, then **#60** and **#3** as MZ decides.
6. **#64** issue housekeeping.

## How to grade a source (D20)

1. Build batch inputs (about 40 to 60 claims) in the scratchpad from `data/normalized/claims/<source>.json`, target year 2025 or earlier.
2. Two blind graders per batch (`docs/grading/grader.md` plus the source rule). Each grader gets its own download folder. Graders write to the scratchpad only. Copy into `data/raw/<source>/` after both finish.
3. `node scripts/agreement-d16.mjs <source>`. Kappa below 0.6: revise the rubric (new decision), re-grade.
4. Adjudicator on contested claims, auditor on `node scripts/audit-sample.mjs <source>`. The auditor opens every cited URL it relies on.
5. `node scripts/final-d20.mjs <source>`, `git add data/raw/<source>`, `pnpm manifest`, `pnpm typecheck`, `pnpm build`, commit, push to `main`. Comment the result on the issue and close it.

## Rules that agents broke before

- Never put the user's email or any identifier in a request (SEC EDGAR asks for one in the User-Agent; use a generic one). Put this line in every agent prompt.
- Downloads go in the scratchpad, one folder per agent, never in the repo.
- Cap WebSearch per agent (3 to 5); about 200 per session. Prefer WebFetch and Wayback copies.
- At most 20 concurrent sub-agents.
- Agents make every verdict, adjudication and audit call. Ask MZ only about policy, in chat (AskUserQuestion) when MZ is present.
- Commit only files you checked. Leave `main` green.

Report to MZ in short ASD-STE100 English. No time estimates.
