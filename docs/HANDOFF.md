# Hindsight handoff (2026-10-01, third session, local)

Read this first (a short start prompt for a new agent is in `docs/NEXT-AGENT.md`), then `AGENTS.md`, `docs/AGENT-RULES.md` and `docs/DECISIONS.md` (D1 to D30). Every next step is an open issue in envisioning/hindsight.

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

- **Captured:** 33 sources in `data/raw/` (24 before, plus McKinsey, Accenture, Deloitte Tech Trends, trendwatching, a16z, FTSG, NIC, Shell, IPCC; crowd-baseline holds only its terms findings). All are normalized (26,274 claims).
- **Judgment sources graded under D20** (two blind graders, adjudicator, agent audit; hit rate over hit + partial + miss, Wilson 95%; audit-adjusted interval D28 in brackets):
  - Envisioning posters 45% (36-55) [28-63]. Kurzweil 38% (32-44) [27-49], waves 1 and 2. Gartner Hype Cycle 60% (55-64) [45-74]. Gartner Strategic Predictions 30% over 47 [7-57]. MIT TR10 31% over 35. ARK Big Ideas 14% over 42. IDC FutureScape counts only (8 graded).
  - Deloitte TMT 61% (52-70) over 116, after the fetch-failure pass (D24, `adjudicated-d20-pass1.json`): 7 of 29 re-checked claims now graded. IDC 49 re-checked, all stay ungradable (paywalled, not blocked). Gartner SP 1 of 6 now graded.
  - New this session: The Economist (#46, D27) 59% (50-67) [42-75] over 127, kappa 0.90. Pew/Elon (#50, D27) 40% (27-55) [24-57] over 45, kappa 0.64. NIC Global Trends projections (D30) 69% (57-79) [55-81] over 68, kappa 0.89. McKinsey dated forecasts (D30) counts only (7 graded: 6 hit, 1 partial; 10 ungradable, mostly third-party figures). Accenture 2017 predictions counts only (1 hit, 1 partial, 1 miss).
- **Numeric (D19):** 12 publishers, matching audit done (#53): 1,184 sampled rows; errors fixed in code for every row (IMF India before July 2013 and old group definitions; World Bank World before 2019; OBR unrounded actuals; EIA early publication dates and two Retrospective 2025 series; CBO deficits in percent of GDP; World Bank India fiscal year). Residual: ECB 4, BCB 3, EIA 4, BNEF 1, BP 1. Open items: #66.
- **Not graded yet, waiting on rules:** Eurasia (#47), WEF (#48), the trend claims of six trend sources and the scenario sets (NIC scenarios, Shell, IPCC). Proposed rules are in the Meet decision queue (see below).
- **Disputes (D29), refresh (#58), export (#3):** built. No dispute issues yet. The refresh workflow opens issues on the 1st of each month (6 sources due on 2026-11-01). Export runs (`pnpm export`); no release tagged.
- **Subjects:** 5,360. **Links to research technologies (#59):** not built; `OPENROUTER_API_KEY` is not set in this checkout (`scripts/set-openrouter-key.sh`).
- **Site:** live but `noindex`, "review build" banner (#60). www issues: envisioning.com#46 (wave-aware sample check), #47 (per-edition Kurzweil rate), #48 (rate_withheld and audit-adjusted interval), #49 (per-claim numeric verdicts, D17 tables).

## Running in a cloud session

- **Paths:** the cloud session starts in a clone of this repo. Use repo-relative paths. Scratch files go in `/tmp`, never in the repo.
- **www:** the site repo is private and is not cloned. Clone it next to this repo as `../www` (`gh repo clone envisioning/envisioning.com ../www`) only for site issues (#56, #60, the site part of #59). The site loader reads `../hindsight` in development, so keep the sibling layout.
- **Secrets:** `.env` files do not exist in the cloud. #59 needs `OPENROUTER_API_KEY` and read access to the Core CMS (`NEXT_PUBLIC_SUPABASE_URL_CMS`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_CMS`). MZ sets them as environment variables of the cloud environment. Never ask for them in chat, never print them.
- **Not available:** the Meet connector (#65) and local apps. Leave those issues for a local session.
- **Fits the cloud best:** #41, #42, the grading waves (#43 to #51, #63), #52, #53, #54, #61, #62. These need only this repo and the web.
- **Pushing:** commit to `main` and push after `pnpm typecheck` and `pnpm build` pass, the same as locally. The live site reads `main` through GitHub raw. Check push first: `git push --dry-run origin HEAD:main`. A 403 "Claude doesn't have GitHub access" means the Claude GitHub App is not installed on this repo; MZ fixes that in the org's GitHub App settings. Do not work around it through `gh api` writes; the proxy blocks them.
- **Network:** check page access first: `curl -sS -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Smartphone` must print 200. The "Trusted" network level blocks almost every data source (Wikipedia, IEA, BEA, Pew). Grading needs the "Full" level. Without it, agents see search snippets only and the audit cannot check sources. Do not start a grading wave without page access.
- **Model ids:** grader files must not name a specific model. Write `"model": "agent (model not recorded in the public repo)"`.
- **Search budget used in the second session (2026-10-01):** about 180 WebSearch calls over 45 agents (caps of 3 to 5 per agent, 20 for the two ARK graders). A new session has a new budget.
- **Wayback Machine** (web.archive.org) is not reachable from the cloud session, through WebFetch or curl. Gartner, IDC, Newzoo, Ofcom and some Pew pages return 403. Many ungradable calls in Deloitte, IDC and Gartner Strategic Predictions are fetch failures; a local session with a browser could re-check them as a new pass (D24).
- **Grader prompts must say:** never put the user's email or any identifier in a request header (SEC EDGAR asks for one in the User-Agent; use a generic one), and never write downloads into the repo root.
- **Agent limit:** 20 concurrent sub-agents per session.

## Order of work

1. **Decisions in Meet** (below). When answered: record each approved rule as a decision (the numbers D28/D29 named in the asks are now D31 and up; D28 is the audit interval, D29 disputes), then grade under it.
2. **#47 Eurasia, #48 WEF** after their rules. **Trend sources** (#26 to #31) and **scenario sets** (#32 to #34) after the trend and scenario rules. Scenario coverage needs observed series first (Global Carbon Budget, NOAA CO2, Energy Institute).
3. **#66** numeric open items (ECB GDP basis, AEO2009 case, BCB Selic, World Bank World, IMF India, IEA restatements, FRED vintage refresh before release).
4. **#59** links (needs `OPENROUTER_API_KEY`). **#26** FTSG 2015-2017 transcripts. **#27** McKinsey 2026 PDF re-capture.
5. **www** issues #46 to #49 (envisioning.com), then **#60** launch and **#3** first tagged release, as MZ decides.
6. **#64** housekeeping: close or comment the older capture issues (#2, #4 to #25) from each PROGRESS.md.

Run grading waves in parallel only within the search budget. Push each source when it passes kappa 0.6 and has its final file.

## Decisions waiting for MZ (Meet decision queue)

- **#47** Eurasia rule, **#48** WEF surprise measure (default 2026-10-06).
- **Trend and scenario rules** (D31/D32 proposals, default 2026-10-08).
- **#64** Long Bets in scope (default 2026-10-08). **#60** launch timing (default 2026-10-08).
- **#36** written permission request to Metaculus and Good Judgment (default 2026-10-15).

Read answers with the Meet `ask_decision` tool (`action: list`) before acting. Never ask MZ to settle a verdict, a reading, or an audit decision (D20).

## Blocked

- **#65:** Meet sync. The Meet connector works in a local session (the decision queue was used on 2026-10-01); the sync itself was not done.

## Grading notes from the second session

- Batch inputs and prompts were generated in the session scratchpad; the template is `docs/grading/grader.md` plus the source rule (D16, D18, D22, D23, D25). Graders wrote to the scratchpad; the coordinator copied files into `data/raw/<source>/` after both graders finished, so neither grader could read the other.
- `final-d20.mjs` now withholds the rate below 20 graded claims (`rate_withheld`), merges grading waves (D26) and audit re-check passes (D24).
- The site's `drawSample` check (www `app/hindsight/_lib/audit.ts`) does not know waves. For Kurzweil, it must filter consensus rows by `wave` (absent = w1) and use seed `d11:kurzweil:d16:w2` with `audit-d11-w2.json` for wave 2. Open a www issue before release.
- Kurzweil's rate now pools all editions. If the site should show the 1999-for-2009 rate separately, it must filter by edition.

## Notes from the third session (local, 2026-10-01)

- **Local access:** the Wayback Machine (web.archive.org, CDX API) is reachable locally and unlocked many blocked publisher pages; its CDX API is rate-limited at times ("Temporarily Offline", 429). Gartner, Newzoo, mckinsey.com, dni.gov and data-api.ecb.europa.eu still block scripts.
- **Give every agent its own download folder.** Two graders shared one `dl/` folder and overwrote each other's working files; both rebuilt their output. Put `dl-<source>-<batch>-<grader>` in every prompt.
- **Graders cite from memory.** Several graders cited Wikipedia pages without fetching them; the auditors found dead or non-supporting citations. Tell auditors to open every cited URL they rely on.
- **Pass files:** `final-d20.mjs` reads `adjudicated-d20-pass<N>.json` (D24) and `disputes.json` (D29). Re-checked rows have status `rechecked`.
- **Numeric audit samples** are fixed (`data/graded/audit/`); `numeric-audit-sample.mjs --check` reports a mismatch after a code fix changes which rows are graded. That is expected: the stored sample governs.
- **Search budget used:** about 110 WebSearch calls over about 60 agents.

## Traps

- **`scripts/*/*.json` is gitignored:** a parse script that needs a JSON input in its own folder must get a `!` exception in `.gitignore` (done for `scripts/a16z-big-ideas/overrides.json`).
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
