# Hindsight handoff (2026-09-30)

Read this first, then `AGENTS.md`, `docs/AGENT-RULES.md` and `docs/DECISIONS.md` (D1 to D20). Every next step is an open issue in envisioning/hindsight.

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
- **Hype Cycle:** two blind adoption timelines for 199 subjects are saved. Verdicts are not computed (#42).
- **Subjects:** 1,746, alias review done (#55 closed).
- **Links to research technologies:** planned, not built (#59).
- **Site:** live but `noindex`, with a "review build" banner (#60).

## Running in a cloud session

- **Paths:** the cloud session starts in a clone of this repo. Use repo-relative paths. Scratch files go in `/tmp`, never in the repo.
- **www:** the site repo is private and is not cloned. Clone it next to this repo as `../www` (`gh repo clone envisioning/envisioning.com ../www`) only for site issues (#56, #60, the site part of #59). The site loader reads `../hindsight` in development, so keep the sibling layout.
- **Secrets:** `.env` files do not exist in the cloud. #59 needs `OPENROUTER_API_KEY` and read access to the Core CMS (`NEXT_PUBLIC_SUPABASE_URL_CMS`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_CMS`). MZ sets them as environment variables of the cloud environment. Never ask for them in chat, never print them.
- **Not available:** the Meet connector (#65) and local apps. Leave those issues for a local session.
- **Fits the cloud best:** #41, #42, the grading waves (#43 to #51, #63), #52, #53, #54, #61, #62. These need only this repo and the web.
- **Pushing:** commit to `main` and push after `pnpm typecheck` and `pnpm build` pass, the same as locally. The live site reads `main` through GitHub raw.

## Order of work

1. **#41** Grading pipeline: generic agreement script, sample draw in this repo, prompts in `docs/grading/` (drafted). Everything after uses it.
2. **#42** Hype Cycle verdicts from the saved timelines. Record the method as D21. Needs no new web research until adjudication.
3. **#59** Links, phase 1 (both directions). No web search needed. Key is in `.env`. Model: `text-embedding-3-large`, `dimensions: 1536`. The site part goes to a new issue in envisioning/envisioning.com once the data exists.
4. **#53** Numeric matching audit, then **#61** (audit error in rates) and **#54** (definition calls).
5. **#62** Dispute handling.
6. **#52** Normalize adapters for eurasia, economist, kurzweil, pew-elon. Needed before #46, #47, #50.
7. Grading waves, bounded by the web-search budget: **#43, #44, #45, #49, #51, #63**, then **#46, #50**. **#47 and #48** need a rule decision first.
8. **#56** (site numeric verdicts), **#64** (issue housekeeping), **#58** (yearly refresh), **#3** (release).

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
