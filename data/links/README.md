# Links to Envisioning research technologies (D48, #59)

Hindsight subjects (kind `technology`) linked to technologies in Envisioning's research database (Core CMS `technologies`), both directions. This repo only reads the CMS (public anon key, published rows of published research projects) and never writes to it. Shapes: `src/schema.ts` (`SubjectText`, `LinkCandidate`, `LinkVerdictFile`, `LinkAuditRecord`, `SubjectTechnologyLink`).

## Files

| File | What | Written by |
|---|---|---|
| `excluded-projects.json` | Research projects never linked (D52), each with decision, date and reason. | by hand, by decision |
| `technologies-snapshot.json` | The technologies the run saw: id, URL parts, title, sha256 of the embedding text. No vectors. Excluded projects left out. | `snapshot.mjs` |
| `model-checks.json` | Embedding trap check: stored rows re-embedded, cosine must be above 0.9. Append-only log. | `check-model.mjs` |
| `subject-vectors.json` | Model, dimensions and the sha256 of each embedded subject text. No vectors. | `embed-subjects.mjs` |
| `runs/<run>/candidates.json` | Candidate pairs with similarity, ranks from each side, mutual nearest neighbour flag, match type, batch. | `candidates.mjs` |
| `runs/<run>/verdicts/verifier-<A\|B>-<batch>.json` | Blind verifier calls, copied in from the verifier directory. | verifier agents |
| `runs/<run>/agreement.json` | Kappa, consensus, contested, missing. | `agreement.mjs` |
| `runs/<run>/adjudicated.json` | Adjudicator calls on contested pairs. | adjudicator agent |
| `runs/<run>/audit.json` | Fixed-seed sample of accepted links and the auditor's records. | `audit-sample.mjs`, auditor agent |
| `runs/<run>/final.json` | Verdict counts and the audit error rate of the run. | `final.mjs` |
| `runs/<recheck>/recheck.json` | A re-check of active links (D56, D24 for links): per pair the row checked, earlier relation and run, confirm or correct, corrected relation or `no_link`, reason. Append-only record. | re-check agent |
| `runs/<recheck>/summary.json` | Re-check counts, rows written, and the audited run's residual error. | `apply-recheck.mjs` |
| `research.json` | The links. Append-only `SubjectTechnologyLink` rows; the latest row of a pair is its state. | `final.mjs` |
| `by-technology.json` | Technology to forecasts (`LinksByTechnology`), keyed by `<research_slug>/<original_id>`: the linked subjects with their relation, and the published claims about them (count, publishers alphabetical (D17), first and last year, verdict counts, up to 20 claims newest first with publisher, year and verdict). | `pnpm links` |
| `by-subject.json` | Forecast to technology (`LinksBySubject`), keyed by subject id: the linked technologies with research slug, `original_id`, title and relation, and every published claim about the subject (newest first, same fields as above). | `pnpm links` |

Subject text (the embedding input) is `data/normalized/subject-text.json`, written by `pnpm normalize`.

## Run

Secrets go only into the process environment of the command that needs them. Vectors and CMS rows are cached in `LINKS_CACHE`, a directory outside the repo; verifier input goes to another directory outside the repo (`<verifier dir>`).

```
LINKS_CACHE=<cache> CMS_URL=... CMS_ANON_KEY=... node scripts/links/snapshot.mjs
LINKS_CACHE=<cache> OPENROUTER_API_KEY=... node scripts/links/check-model.mjs        # stops unless cosine > 0.9
LINKS_CACHE=<cache> OPENROUTER_API_KEY=... node scripts/links/embed-subjects.mjs
LINKS_CACHE=<cache> node scripts/links/candidates.mjs --run <run> --out <verifier dir>
# verifiers A and B per batch (docs/grading/link-verifier.md), blind; copy their files into runs/<run>/verdicts/
node scripts/links/agreement.mjs <run> --out <verifier dir>                         # kappa >= 0.6 (D11)
# adjudicator (docs/grading/link-adjudicator.md) -> runs/<run>/adjudicated.json
node scripts/links/audit-sample.mjs <run> --out <verifier dir>
# auditor (docs/grading/link-auditor.md) -> runs/<run>/audit.json records
node scripts/links/final.mjs <run>
node scripts/links/apply-recheck.mjs                                             # every runs/*/recheck.json (D56); idempotent
pnpm links                                                                       # by-technology.json, by-subject.json
git add data/links && pnpm manifest
```

`pnpm links` (`scripts/links/publish.mjs`) reads the latest row of each pair in `research.json` (a `curated` row is never overridden by a later agent row) and keeps active rows only. Titles and URL parts come from `technologies-snapshot.json`, not from the row (D48); a link whose technology or subject is missing from the snapshot or `subjects.json` is dropped and counted. Claims are the published claims in `data/normalized/claims` except Origins depictions (claim type `fiction`, D57: not forecasts); a link whose subject has no published forecast (an Origins-only subject) is held back and counted (`held_no_forecasts`) until www reads the Origins tables (#84). The verdict is the D20 final (`final-d20.json`), else the D33 trend final (`final-d33.json`), else a graded D19 numeric row; contested, `open` and `gap` rows carry no verdict. Run it after `pnpm normalize`, grading and `final.mjs`. The output is deterministic; `pnpm links --check` fails when the committed files are stale. `pnpm manifest` lists the tracked files of `data/links` under `links` in `data/raw/manifest.json`; www reads them from GitHub raw at `data/links/<file>` (local `../hindsight/data/links` in development).

Reading of the verdicts (D48, applied from `d48-r0`): a technology whose `original_id` has a region prefix (`china__`, `usa__`, `europe__`, `canada__`, and the other country series such as `japan__` or `india__`) is a regional landscape entry: its summary and examples are one country's or region's companies, programmes and policy. Against a subject with no regional scope it is `narrower` (a direct regional case, kept as a related link), never `link`, even when its description opens with a general definition; a project can hold both the general page and the regional one (`apogee/commercial-space-stations` and `apogee/usa__commercial-space-stations`). A page without a prefix whose summary only frames the technology for its project (urban, financial, gaming) is `link` when it describes the technology itself, and `narrower` only when it names a specific application (`cities/generative-ai`: urban design scenarios).

Readings settled in `d48-r1` (adjudication of 154 contested pairs, applied from `d48-r1`):

- (a) **Region page whose topic is broader or narrower than the subject.** A region-prefixed page is `narrower` only when its topic is the subject's own topic (one country's case of the same thing). When its topic is broader (`wintermute/usa__ai-for-science` against "AI-Driven Hypotheses"; `helix/usa__ai-drug-discovery` against AI molecular simulation; `link/canada__quantum-cryptography-networks`, PQC plus QKD, against post-quantum cryptography), it is narrower by region and broader by topic, neither contains the other: `no_link`. When its topic is a sub-topic of the subject (a use, one measure or one approach) it is two levels away (sub-topic and region): `no_link` (`grid/china__clean-tech-manufacturing-dominance-systemic` against clean energy technologies).
- (b) **Problem, risk or policy subjects.** A subject that is a problem or threat against a technology that counters it (bias in recognition against bias detection tools, infrastructure vulnerabilities against grid cyber-resilience, climate impact on insurers against catastrophe modeling, data localization law against compliance frameworks) is `no_link`: adjacent, not containment. A subject that is a risk, regulation or standard of a technology, whose claims are about what the technology does or how it develops (privacy risks of behavioral biometrics, regulating open banking, updating PQC standards), against that technology's page is `broader`. A subject named for the countermeasure itself (tools for exposing deepfakes) is judged as that technology.
- (c) **Country-scoped subjects.** When a subject's own claims are about one country (Megascale Desalination: Israel's Sorek plant; Regulating AI: the EU's rules; New Domestic Supply Chain: US rare earths; Chip Onshoring: the CHIPS Act), that country's region page is `link`, and another country's page on the same topic is `no_link` (Robotaxi Growth, US, against `china__robotaxis`).
- **Bundled pages and subjects.** A page that covers the subject and a named sibling ("CBDCs & Hybrid Settlement Rails", "Immersive Workspaces and Classrooms", "Carbon Accounting & Verification") is `broader`; a subject that names two things ("Open RAN and network virtualization") against a page on one is `narrower`.
- **Project framing.** As in d48-r0, framing in the summary or description of a generically titled page is `link` (`harvest/soft-robotic-grippers`, `atlas/self-sovereign-identity`); an application named in the page title is `narrower` (`aegis/intelligence-deepfake-detection`, `link/federated-learning-distributed-ai`).
- **Subject identity.** A subject is judged by its name when its claims only cite an example (Cultivated Collagen, whose one claim mentions Aleph Farms steak, is not linked to cultured meat pages).

Amendment (D49): run `d48-r0` is titles only (`candidates.mjs --titles-only`): exact and alias title matches, no vectors, similarity null. Every later run skips pairs decided in an earlier run (`final.json` `decisions`) and pairs held by a curated link. When one verdict dominates (expected agreement 0.8 or more), the agreement gate is observed agreement 0.9 or more instead of kappa 0.6.

## Curated rows: Origins (D57, #78)

`scripts/origins/curated-links.mjs` appends one `curated` row per (subject, research page) pair of the Origins depictions (agent `curated:envisioning-origins`, run `origins-curated`): relation `same`, or the D48 verifiers' relation where an agent row already judged the pair. A pair a D48 run decided `no_link` gets no row and is reported; a page of an excluded project never gets one. Idempotent; `--check` fails when rows are missing. First run, 2026-10-03: 67 pairs from the 165 migrated www connections (16 repeat an active D48 link, one keeping `narrower`; 51 new). `pnpm links` publishes 19 and holds 48 whose subject has no forecast yet. The 13 research ids that no longer resolve are listed in `scripts/origins/README.md` (7 re-mapped, 6 without a link).

## Excluded projects (D52)

`excluded-projects.json` lists research projects whose technologies are never linked. `snapshot.mjs` leaves them out of `technologies-snapshot.json` (the cache keeps every row the CMS returned) and `candidates.mjs` never proposes them. `snapshot.mjs --from-cache` rebuilds the snapshot from the cache after a change to the list, without a CMS call. An active link to an excluded project gets a `retracted` row (agent `project-exclusion:D52`, reason `project excluded (D52)`).

- 2026-10-02, `xenotech`: alleged UAP and exotic technology under plain technology titles. 177 technologies left out (snapshot 4,018 to 3,841). Retracted: `programmable-matter` to `xenotech/shapeshifting-technology` and `ultra-capacitors` to `xenotech/ultracapacitor-energy-storage` (both `same`, `d48-r0`).
- 2026-10-02, `subspace` (D55): science-fiction technologies (Star Trek: Medical Tricorder, Universal Translator, Genesis Device). 129 technologies left out (snapshot 3,841 to 3,712). Retracted: `medical-tricorder` to `subspace/medical-tricorder` (`same`, `d48-r0`). Its 10 candidates in `d48-r1` (drawn before the decision) were filtered out by `final.mjs` and `audit-sample.mjs`: no rows, not in `decisions`.

`final.mjs` and `audit-sample.mjs` read the list too: a run's candidates of an excluded project are left out of its decisions, adjudication, audit pool and rows, and `final.mjs` appends the retraction for any active row to an excluded project (from any run).

## Re-checks (D56)

A re-check judges a whole class of active links again when an audit finds a systematic error (the #53 pattern: fix every row, not only the sampled ones). It is a file `runs/<recheck>/recheck.json` (`LinkRecheckFile`): the scope (`scope_original_id`, a regex on `original_id`; every active row matching it is checked), the audited run whose residual it updates (`audit_run`), and one record per pair. `apply-recheck.mjs` reads every `recheck.json` in run-name order and appends, for each correction, a row copied from the checked one: `retracted` for `no_link`, else `active` with the new relation; agent `rechecker:<agent>`, run `<recheck>`, created_at the record's `at`, reason `re-check <recheck> (D56) of <run> <relation>: <reason>`. It stops when a checked pair's latest row is neither the checked row nor its own (the pair changed after the re-check), and a re-run appends nothing. `final.mjs` leaves pairs whose latest row is a re-check row alone. `audit.json` is never changed: `summary.json` counts the run's audit records in the re-check scope as fixed and reports the rest as the residual.

- 2026-10-02, `d48-recheck-region`: every active link to a region-prefixed page (336: 314 `narrower`, 18 `same`, 4 `broader`; 14 from `d48-r0`, 322 from `d48-r1`), judged under readings (a) and (c) on the subject text and claims and the cached CMS title, summary and description. 249 confirmed, 87 corrected: 80 `narrower` to `no_link` (sub-topic or broader topic and a region away, or another country's page); 3 `narrower` to `same` (country-scoped subjects against their own country's page: satellite-to-smartphone, two China UHV subjects); 2 `narrower` to `broader` (AI data-center electricity, US; surveilling Uighurs, China); 1 `same` to `narrower` (China's AI rules against China's surveillance page); 1 `same` to `broader` (updating PQC standards against the US PQC page, reading b). 87 rows appended (80 `retracted`, 7 `active`).

## Subject merges

A judgment merge (D13, `subject-curation.json`) moves every label of the retired subject to the surviving one, so the retired id leaves `subjects.json` (ids are never reused). Link rows do not follow by themselves: `final.mjs` keys pairs by subject id. For each active row of a retired subject, two rows are appended to `research.json`: a `retracted` row on the old pair (agent `subject-merge:<review>`), and an `active` row on the surviving subject's pair with the same relation, method, run and verifier agent, its reason naming the row it moves. A pair the survivor already holds active gets only the retraction. The moved pair is not in any run's `decisions`, so a later run may decide it again (D48: a merged subject needs a new run for its pairs).

- 2026-10-02, `data/reviews/subject-dupes-d48.json`: `space-based-solar-power-sbsp` merged into `space-based-solar-power`; its 2 `same` links (`apogee/space-based-solar-power`, `substrate/sbsp`) moved. No other retired subject had link rows.

## State

- `d48-r0` (titles only): 100 candidates (97 exact, 3 alias), 79 subjects, 1 batch. Verifiers agree on 99 of 100 (kappa 0.97); 1 adjudicated (`synthetic-data` to `cities/synthetic-data`: `link`). Verdicts: 83 link, 15 narrower (14 region-prefixed pages, plus `cities/generative-ai`), 0 broader, 2 no_link. 98 rows appended to `research.json` (83 `same`, 15 `narrower`). 2 of the `same` links (to `xenotech`) retracted on 2026-10-02 (D52).
- `d48-r1` (embeddings, D54): 31,153 candidates, 1,981 verified (cosine 0.65 or more, mutual nearest neighbours, title matches); 10 of them `subspace`, filtered out (D55), so 1,971 decided. Verifiers agree on 1,827 of 1,981 (agreement 0.92, kappa 0.89); 154 adjudicated (17 link, 31 broader, 54 narrower, 52 no_link). Decided after audit: 579 link, 156 broader, 781 narrower, 455 no_link. 1,514 rows appended to `research.json` (577 `same`, 156 `broader`, 781 `narrower`; 2 SBSP pairs moved by the subject merge were already active) plus the `subspace` retraction. Active links after the run: 1,609 (657 `same`, 156 `broader`, 796 `narrower`) over 899 subjects and 999 technologies.

After the region re-check (D56): active links 1,529 (658 `same`, 159 `broader`, 712 `narrower`) over 867 subjects and 961 technologies; 256 of them to region pages (19 `same`, 7 `broader`, 230 `narrower`).

Audit error rate: `d48-r1` 9.8% (153 sampled of 1,525 accepted links: 59 link, 15 broader, 79 narrower; 138 confirm, 6 correct, 9 reject). On `link` (relation `same`) 5 of 59 (8.5%), all corrected to `broader` or `narrower`, none rejected. Rejections: 7 region pages broader by topic, two levels from the subject, or of another country (readings a and c), and 2 adjacent pairs. Audited on the batch texts and the cached CMS title, summary and description (research pages sit behind a bot checkpoint). Residual after the region re-check (D56, `runs/d48-recheck-region/summary.json`): 4.6% (7 of 153). The 8 audit findings on region pages (the 7 rejections and the `regulating-ai` correction to `link`) are of the class the re-check fixed for every row, so they count as fixed; the other 7 (5 `link` corrections, 2 adjacent rejections) remain the residual estimate for unsampled non-region links. The re-check also corrected 4 sampled region pairs the auditor had confirmed (`digital-twin`, `green-steel-and-iron`, `private-led-fusion-projects`, `the-ai-driven-chip-war` against `china__inference-optimized-ai-ecosystem`): judged by the re-check's reading, the audit's error rate on region pages was 12 of 40, not 8.

Audit error rate: `d48-r0` 0% (50 sampled of 98 accepted links: 43 link, 7 narrower; 50 confirm, 0 correct, 0 reject). One confirmed sample, `ultra-capacitors` to `xenotech/ultracapacitor-energy-storage`, was later retracted by project exclusion (D52), not by the audit. Audited on the CMS title, summary and description, because the research pages answered 429 behind a bot checkpoint.
