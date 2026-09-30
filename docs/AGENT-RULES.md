# Rules for agents working on Hindsight

These rules apply to every agent: capture, grading, adjudication, audit, linking. Read `AGENTS.md`, `NOTICE.md`, `docs/DECISIONS.md` and `src/schema.ts` first. Read your issue with `gh issue view <N> -R envisioning/hindsight`.

## Tools

- Web: WebSearch and WebFetch only. Do not use in-app browser tools.
- Web search budget: agents in one session share about 200 WebSearch calls. Prefer WebFetch on known sources. Each task states its own cap; stay under it.
- Downloads (PDF, XLS, CSV, images): `curl -sL -A "Mozilla/5.0"` into a scratch directory outside the repo. Never copy downloaded files into the repo.
- A worker agent does not spawn sub-agents. It works sequentially.

## Progress and stalls

- Write to disk often: after every edition (capture) or every 5 to 30 claims (grading). A stopped agent must leave usable partial output.
- Keep `data/raw/<source>/PROGRESS.md` current for capture work.
- If one fetch or step fails 3 times, record the gap and move on.
- Stop starting new units after about 150 tool calls. Finish writing, then report.

## Data rules

- Facts only (`NOTICE.md`): who said what, when, about which subject, with which number or horizon, plus a short quote of 400 characters or fewer. No charts, images, figures or full text.
- Missing editions are recorded as missing. Never interpolate or guess.
- Every entry carries `source_url` and `confidence` (high, medium, low), and a `note` where useful.
- Do not name any person as a data source or contributor unless the person is the publication's author.
- Scripts that parse downloads go in `scripts/<source>/` with a `README.md` (input URLs, how to run). Use relative paths. Downloaded inputs stay out of git.

## Grading rules (D7, D16, D20)

- Agents make every verdict, adjudication and audit decision. Never ask a person at Envisioning to settle a claim.
- Graders are blind: a grader never reads the other grader's file, the agreement file, a self-assessment, or a published scorecard of the same predictions.
- Every verdict has at least one evidence row: URL, title, date, and what it shows.
- Use `unfalsifiable` only when two equally faithful readings of the claim give different verdicts.
- Prompts for each role: `docs/grading/`.

## Write scope

- Write only where your issue says. Capture agents: `data/raw/<source>/` and `scripts/<source>/`. Grading agents: the verdict files named in the task.
- Do not run `pnpm manifest` or `pnpm normalize` when several agents write at the same time. The coordinating session runs them once at the end.
- Do not edit `src/`, `docs/`, `README.md` or another source's folder unless your issue is about them.
- Worker agents do not commit or push. The coordinating session commits after `pnpm typecheck` and `pnpm build` pass.

## Report back

Short technical English: what is done, partial and missing; counts; the least certain calls; blockers; anything that looks wrong in the source itself.
