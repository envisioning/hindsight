# Hindsight handoff (2026-10-02, fourth session, local)

Read this first, with `docs/OBJECTIVES.md` (what the research is for and how far each objective has come; update it as objectives move) (a short start prompt for a new agent is in `docs/NEXT-AGENT.md`), then `AGENTS.md`, `docs/AGENT-RULES.md` and `docs/DECISIONS.md` (D1 to D56). Every next step is an open issue in envisioning/hindsight.

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
| Strategy spec | Meet docs `/strategy/expectations-ledger-pilot-spec-2026-09-27` and `/strategy/hindsight-pages-spec-2026-09-27` (dated; current state at the top of each) |

## State

- **Captured:** 37 sources in `data/raw/` (crowd-baseline holds Long Bets as baseline data only, D35, not normalized). Normalized: 28,012 claims.
- **Judgment sources under D20** (two blind graders, adjudicator, agent audit; hit rate over hit + partial + miss, Wilson 95%; audit-adjusted interval D28 in brackets):
  - Envisioning posters: technology 2011-2012 45% (36-55) [28-63] over 108; education 2012 75% over 28; health 2012 43% over 28; Horizons 2014 75% over 55 (D37, not comparable with D16). 72 later placements open (#69).
  - Gartner Hype Cycle 60% (55-64) [45-74] over 403. Kurzweil 38% (32-44) [27-49] over 262. Gartner Strategic Predictions 30% over 47 [7-56]. ARK 14% over 42. IDC counts only.
  - Deloitte TMT 70% (64-75) [56-83] over 245: waves w1-w3 (every edition 2002-2026; 2003 report recovered; w3 gated on pooled kappa, D50), D24 passes 1 and 2.
  - MIT TR10 48% (36-60) [31-65] over 65: waves w1 and w2 (availability lines for 2021-2026).
  - The Economist 59% over 127. Pew/Elon 40% over 45. NIC projections 69% over 68. McKinsey and Accenture dated forecasts counts only.
- **Numeric (D19):** 12 publishers. Matching audit (#53) plus D24 re-checks (#66, #70, #71, bp 2015) and a supplementary audit for rows added later (D46, OECD). Residual errors: bnef-evo 1, all other sources 0; pending re-checks 0. Hit rates: ECB 58%, Fed SEP 51%, EIA 46%, OECD 43% (918 graded, all 73 editions EO47-EO119), World Bank 41% (GEP 1991-1998 added from scans, #11), IMF 41%, BCB 38%, OBR 34%, CBO 31%, IEA 10%; bp and BNEF counts only. Actuals on the forecast's own definition (D38, D39, D41, D42), one-decimal threshold flags.
- **Trends (D33, D36, D40, D43):** faded within two editions: Accenture 62%, a16z 60%, Deloitte Tech Trends 53%, trendwatching 64%, McKinsey 6%, FTSG 22.5% over 2,750 after passes 2 to 7 (2015, 2020, 2022, 2023 complete; 2016, 2017, 2019 partial; umbrella pages as trends, D40, swept for every year tag; 101 capture corrections, D43; recycled only after a rename check, D47; 54 rows in `gap`).
- **Rankings and scenarios (D31, D32, D34, D45):** Eurasia top risks materialised in 70% of 184, red herrings calm in 68% of 72. WEF 2007-2020 ranked 12 of 51 major events high (23.5%, 14-37) [10-41] after its first audit (48/50). Shell 14 of 51 values covered (27.5%, 17-41); IPCC counts only (10 graded after the matching audit); NIC sets 2 covered, 1 not covered, 3 open (audit 9/9).
- **Disputes (D29), refresh (#58):** built. No dispute issues yet. The refresh workflow opens issues on the 1st of each month.
- **Releases:** `hindsight-2026.1` and `hindsight-2026.2` (both 2026-10-02, approved by MZ). 2026.2: 28,306 claims, 1,952 verdicts, 18,751 numeric grades, 68 validation rows. `data/out` holds 2026.2; later work changes it only at the next tag. envisioning.com/hindsight links the latest release.
- **Subjects:** 5,893 after the D13 duplicate review (data/reviews/subject-dupes-d48.json, 47 retired; merges move link rows and can change trend persistence, D51).
- **Links to research technologies (#59, D48, D49):** pipeline built (`scripts/links/`, `pnpm links`). Run d48-r0 (title matches) published: 98 links (83 same, 15 narrower; region-prefixed pages are narrower), agreement 99/100, audit 50/50. Shown on envisioning.com research pages ("What was expected"), claim pages ("In our research") and `/hindsight/subjects/[id]`. Embedding run d48-r1 (D54) published 2026-10-02: 1,971 pairs decided (10 `subspace` pairs filtered out, D55), 1,514 links added (577 same, 156 broader, 781 narrower), audit error rate 9.8% (8.5% on same). Region pages re-checked (D56, 87 corrections): 1,529 active links (658 same, 159 broader, 712 narrower) over 867 subjects and 961 technologies; d48-r1 audit residual 4.6%. Excluded projects: xenotech (D52), subspace (D55). #59 closed; upkeep in #74.
- **Site:** launched 2026-10-01 (envisioning.com dd9e9ceb). Reads `main` through GitHub raw; new files show after `git add` and `pnpm manifest`.
- **Meet:** project "Hindsight" (2026-10-02). Spec docs marked dated with a current-state section (#65 closed).

## Running in a cloud session

- **Paths:** the cloud session starts in a clone of this repo. Use repo-relative paths. Scratch files go in `/tmp`, never in the repo.
- **www:** the site repo is private and is not cloned. Clone it next to this repo as `../www` (`gh repo clone envisioning/envisioning.com ../www`) only for site issues (the site part of #59). The site loader reads `../hindsight` in development, so keep the sibling layout.
- **Secrets:** `.env` files do not exist in the cloud. #59 needs `OPENROUTER_API_KEY` and read access to the Core CMS (`NEXT_PUBLIC_SUPABASE_URL_CMS`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_CMS`). MZ sets them as environment variables of the cloud environment. Never ask for them in chat, never print them.
- **Not available:** the Meet connector and local apps. Leave work that needs them for a local session.
- **Fits the cloud best:** #41, #42, the grading waves (#43 to #51, #63), #52, #53, #54, #61, #62. These need only this repo and the web.
- **Pushing:** commit to `main` and push after `pnpm typecheck` and `pnpm build` pass, the same as locally. The live site reads `main` through GitHub raw. Check push first: `git push --dry-run origin HEAD:main`. A 403 "Claude doesn't have GitHub access" means the Claude GitHub App is not installed on this repo; MZ fixes that in the org's GitHub App settings. Do not work around it through `gh api` writes; the proxy blocks them.
- **Network:** check page access first: `curl -sS -o /dev/null -w "%{http_code}" https://en.wikipedia.org/wiki/Smartphone` must print 200. The "Trusted" network level blocks almost every data source (Wikipedia, IEA, BEA, Pew). Grading needs the "Full" level. Without it, agents see search snippets only and the audit cannot check sources. Do not start a grading wave without page access.
- **Model ids:** grader files must not name a specific model. Write `"model": "agent (model not recorded in the public repo)"`.
- **Search budget used in the second session (2026-10-01):** about 180 WebSearch calls over 45 agents (caps of 3 to 5 per agent, 20 for the two ARK graders). A new session has a new budget.
- **Wayback Machine** (web.archive.org) is not reachable from the cloud session, through WebFetch or curl. Gartner, IDC, Newzoo, Ofcom and some Pew pages return 403. Many ungradable calls in Deloitte, IDC and Gartner Strategic Predictions are fetch failures; a local session with a browser could re-check them as a new pass (D24).
- **Grader prompts must say:** never put the user's email or any identifier in a request header (SEC EDGAR asks for one in the User-Agent; use a generic one), and never write downloads into the repo root.
- **Agent limit:** 20 concurrent sub-agents per session.

## Order of work

Every next step is an open issue in envisioning/hindsight:

1. **#74** links upkeep (new or changed technologies and subjects; retract links to unpublished or excluded pages); a later run can verify the 29,172 candidates left under the D54 floor.
2. **#75** D33 follow-ups: pass audit summaries, FTSG 2020-234 match id, FTSG 2016-029 subject.
3. **#76** release `hindsight-2026.3` (with the links as an export table); ask MZ before tagging, then update the link in www `app/hindsight/page.tsx`.
4. Research objectives (docs/OBJECTIVES.md): **#86** adaptation lag, **#87** accuracy by horizon, **#88** herding, **#89** adaptability audit (client product), **#90** capability-benchmark tie-in; findability: **#91** finding pages (Hype Cycle report first), **#92** DOI and Dataset markup, **#93** structured data and citations, **#94** annual January report.
5. **#85** Origins epic (#77 to #84): fiction as a source; canon, depictions, three milestones, imagination lead time, links, site. Objectives decided by MZ 2026-10-02 (in the epic).
6. Missing editions: **#27** McKinsey 2026 PDF (needs a manual browser download); **#26** FTSG 2008-2013 and 2018 (not public; 2019 stays titles only).
7. Recurring: **#69** poster placements each January (D26 waves); **#58** refresh issues opened on the 1st of each month.

Run grading waves in parallel only within the search budget. Push each source when it passes kappa 0.6 and has its final file.

## Decisions taken by MZ (2026-10-02, in chat)

Tag release 2026.1 (done). Use an existing OpenRouter key for #59 (the www key turned out dead). Keep D49 (skewed link runs gate on observed agreement). Keep D23 as is (no later-survey bounds). Pool small grading waves for the kappa gate (D50). FTSG umbrella pages with the publisher's year tag and key insight count as trends in every edition (D40). Build the append-only capture-corrections file once a real misaligned quote appears (D43; real cases appeared the same day). MZ set a working OpenRouter key (scripts/set-openrouter-key.sh). Verify links at similarity 0.65 or mutual NN (D54). Exclude subspace (D55). Release 2026.2 (done).

## Notes from the fourth session (local, 2026-10-02)

- **Coordinator pattern that worked:** one agent per lane, numeric lanes in their own worktrees (merge, renumber decisions, re-run `pnpm grade:numeric`), capture agents in the main checkout with disjoint write scopes. Only one agent runs `pnpm normalize` at a time.
- **Agents pick the same decision number.** Tell parallel agents to write `## D<N> (lane X)` and renumber at merge.
- **A capture marked complete can still miss a contents page.** FTSG 2023 Climate lost its second contents page (53 trends). `scripts/ftsg-tech-trends/check_contents.py` and `check_2023_contents.py` compare contents pages with the capture.
- **Archive copies at a stable URL can be a different edition.** bp's archived 2015 .xlsx was the 2014 workbook. Check the file's own edition label.
- **Trend passes:** a later pass supersedes earlier ones for its scope rows (`renames-d33-pass<N>-scope.json`); give the adjudicator the published sibling verdicts, since checkers cannot see earlier passes.
- **Year tags count labels, not phenomena** (FTSG): a "1st year on the list" tag is weak evidence against a rename.
- **Search budget used:** about 150 WebSearch calls over about 90 agents.

## Decisions taken by MZ (2026-10-01, in chat)

D31 Eurasia (#47), D32 WEF (#48), D33 trends, D34 scenarios, D35 individual forecasters (#64): all approved as proposed. #60: launch after www #46, #48, #49; the forecasts block on research pages ships later. #36: keep the crowd baseline in scope for meta-analysis; no outreach to Metaculus or Good Judgment for now. MZ prefers to answer Hindsight questions in chat, not in the Meet queue.

Never ask MZ to settle a verdict, a reading, or an audit decision (D20).

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
- **Year tags count labels, not phenomena** (FTSG): a "1st year on the list" tag is weak evidence against a rename.
- **Search budget used:** about 150 WebSearch calls over about 90 agents.

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
