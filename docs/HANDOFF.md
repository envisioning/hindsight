# Hindsight handoff (2026-10-01)

Read this first, then `AGENTS.md`, `docs/AGENT-RULES.md` and `docs/DECISIONS.md` (D1 to D23). Every next step is an open issue in envisioning/hindsight.

## What Hindsight is

A public, citable record of published forecasts (publications x predictions), graded against what happened. Each prediction has a permanent permalink, a verdict with evidence, and an accuracy rate per publication, shown side by side and never ranked (D6, D17). It sits under Capability on envisioning.com: it tests the Anticipation dimension with the record.

## Where things are

| Thing | Location |
|---|---|
| Dataset, rules, scripts (public, MIT code, CC BY 4.0 data, BCB Focus ODbL) | this repo (envisioning/hindsight). Local checkout: `/Users/mz/Dev/Envisioning/hindsight` |
| Site pages | www repo (envisioning/envisioning.com, private), `app/hindsight/`. Local checkout: `/Users/mz/Dev/Envisioning/www` |
| Site data loader | www `app/hindsight/_lib/data.ts`: local `../hindsight` in development, GitHub raw in production (manifest.json lists git-tracked files only) |
| Final verdicts the site reads | `data/raw/<source>/final-d20.json`, else `agreement-d16.json` |
| Numeric grades | `data/graded/numeric/` (`pnpm grade:numeric`, D19) |
| Research database technologies | Core CMS `technologies` (4,807 rows, all embedded) |
| Embedding script | research repo `scripts/sync-cms-embeddings.ts` |
| Strategy spec | Meet docs `/strategy/expectations-ledger-pilot-spec-2026-09-27` and `/strategy/hindsight-pages-spec-2026-09-27` (out of date, #65) |

## State

- **Captured:** 24 sources in `data/raw/`. Not captured: #26 to #34, #36.
- **Fully graded under D20** (two graders, adjudicator, agent audit):
  - Envisioning posters: 45% hit (95% interval 36 to 55), audit error 8%.
  - Kurzweil 1999 for 2009: 45% hit (38 to 54), audit error 6%.
- **Numeric, graded by command (D19):** 12 publishers with a rate from IEA 10% to ECB 57% (BP and BNEF under 20 graded, counts only). No matching audit yet (#53).
- **Hype Cycle (D21):** 409 gradable claims, kappa 0.66, 86 adjudicated from 53 settled timelines. 60% hit (95% interval 55 to 64), audit error 12% (2 corrected, 4 contested). Source checks in the adjudication and audit used search summaries only, because the cloud network policy blocked page fetches. Re-check with page access before release.
- **ARK Big Ideas (#49):** first blind grading of 75 claims, kappa 0.53, below D11. Rubric revised (D23). Next: re-grade all 75 with two new blind graders under D23, with page access. The first-round files are kept as the record in `data/raw/ark-big-ideas/round1/`, out of the manifest, so the site does not show them. No `final-d20.json`.
- **Subjects:** 1,746, alias review done (#55 closed).
- **Links to research technologies:** planned, not built (#59).
- **Site:** live but `noindex`, with a "review build" banner (#60).

## Running in a cloud session

- **Paths:** the cloud session starts in a clone of this repo. Use repo-relative paths. Scratch files go in `/tmp`, never in the repo.
- **www:** the site repo is private and is not cloned. Clone it next to this repo as `../www` (`gh repo clone envisioning/envisioning.com ../www`) only for site issues (#56, #60, the site part of #59). The site loader reads `../hindsight` in development, so keep the sibling layout.
- **Secrets:** `.env` files do not exist in the cloud. #59 needs `OPENROUTER_API_KEY` and read access to the Core CMS (`NEXT_PUBLIC_SUPABASE_URL_CMS`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_CMS`). MZ sets them as environment variables of the cloud environment. Never ask for them in chat, never print them.
- **Not available:** the Meet connector (#65) and local apps. Leave those issues for a local session.
- **Fits the cloud best:** #41, #42, the grading waves (#43 to #51, #63), #52, #53, #54, #61, #62. These need only this repo and the web.
- **Pushing:** commit to `main` and push after `pnpm typecheck` and `pnpm build` pass, the same as locally. The live site reads `main` through GitHub raw. Check push first: `git push --dry-run origin HEAD:main`. A 403 "Claude doesn't have GitHub access" means the Claude GitHub App is not installed on this repo; MZ fixes that in the org's GitHub App settings. Do not work around it through `gh api` writes; the proxy blocks them.
- **Network:** check page access first: `curl -sS -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Smartphone` must print 200. The "Trusted" network level blocks almost every data source (Wikipedia, IEA, BEA, Pew). Grading needs the "Full" level. Without it, agents see search snippets only and the audit cannot check sources. Do not start a grading wave without page access.
- **Model ids:** grader files must not name a specific model. Write `"model": "agent (model not recorded in the public repo)"`.
- **Search budget used on 2026-10-01:** about 130 of 200 (Hype Cycle adjudication and audit, ARK round 1). A new session has a new budget.

## Order of work

1. **#41** Grading pipeline: done. Commands in `AGENTS.md` (Agentic verdicts), prompts in `docs/grading/`.
2. **#42** Hype Cycle: done (D21). `final-d20.json` written.
3. **Re-checks from 2026-10-01** (with page access): ARK re-grade under D23 (#49): two new blind graders on all 75 claims (`docs/grading/grader.md` plus the D23 rules), then the standard pipeline. Then re-check the Hype Cycle adjudicated timelines and audit sources that cite "search summary" or "not re-fetched" (`timelines-adjudicated-d20.json`, `audit-d11.json`); record changes as a new adjudication or audit pass, never overwrite.
4. **#59** Links, phase 1 (both directions). No web search needed. Key is in `.env`. Model: `text-embedding-3-large`, `dimensions: 1536`. The site part goes to a new issue in envisioning/envisioning.com once the data exists.
5. **#53** Numeric matching audit, then **#61** (audit error in rates) and **#54** (definition calls).
6. **#62** Dispute handling.
7. **#52** Normalize adapters for eurasia, economist, kurzweil, pew-elon. Needed before #46, #47, #50.
8. Grading waves, bounded by the web-search budget: **#43, #44, #45, #51, #63**, then **#46, #50**. **#47 and #48** need a rule decision first.
9. **#56** (site numeric verdicts), **#64** (issue housekeeping), **#58** (yearly refresh), **#3** (release).

Run grading waves in parallel only within the search budget. Push each source when it passes kappa 0.6 and has its final file.

## Decisions waiting for MZ

- **#60:** launch timing, and whether the forecasts block (#59) shows on public research pages before launch.
- **#64:** are individual forecasters (Long Bets) in scope?
- **#47, #48:** agents propose the risk-forecast rules; MZ approves the policy, not individual verdicts.

Never ask MZ to settle a verdict, a reading, or an audit decision (D20).

## Blocked

- **#65:** Meet sync. The Meet connector needs MZ to re-authorize it.

## Traps

- **Embedding model:** the CMS stores `text-embedding-3-large` at 1536 dimensions. `3-small` gives cosine about 0. Always check two stored rows before writing vectors.
- **OpenAI key:** the key in `research/.env` has no credits. Use `OPENROUTER_API_KEY`. It is in `hindsight/.env` and `research/.env`; to replace it, run `scripts/set-openrouter-key.sh`.
- **Claim ids:** `<source>-<edition>-<nnn>`, where nnn is the position in the raw edition file. Poster ids: `et-2012-045` → `envisioning-technology-2012-045`. After first assignment, `ids.json` governs. Never reorder raw entries.
- **Manifest:** `pnpm manifest` lists git-tracked files only. Run `git add` first, then the manifest, or new files do not show on the live site.
- **www build race:** `ENOTEMPTY .next/server` means another build touched `.next`. Rerun, and check the exit code before committing.
- **Stale types after deleting a www route:** clear `.next/types` and `.next/dev/types`.
- **Meet docs updates** replace tags, subjects and frontmatter as a whole. Pass all of them on every update.
- **Human-facing copy** goes through the humanizer skill. No em dashes in rendered copy.
- **Contributor names:** do not name contributors or private data sources in the repo or on the site.

## House rules (from MZ)

- pnpm only. The build is the gate. MZ tests by hand: no automated tests, no UI driving unless asked.
- No time estimates.
- Write to MZ in ASD-STE100 technical English.
- Leave both repos green and pushed. The commit trailer is used in this repo's history.
- Secrets only in `.env`, never echoed.
