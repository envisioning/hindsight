# Crowd forecasting baseline (Metaculus, Good Judgment Open): collected editions

Claim type: `forecast`. Not graded by Hindsight: a calibration baseline (issue #36). Long Bets is out of scope pending #64 and was not captured.

**Result of this pass: nothing extracted.** Both platforms' terms of use forbid what the capture needs (automated collection, and copying or redistributing site content into a CC BY 4.0 dataset) unless the platform gives written permission. Metaculus's API now requires an account token, and agents may not create accounts. Every edition is recorded as missing below. No `<edition>.json` file was written.

## Verified before extraction (data access and terms of reuse)

Checked 2026-10-01.

### Metaculus (metaculus.com)

- **First edition.** Metaculus was founded in 2015 (Wikipedia, https://en.wikipedia.org/wiki/Metaculus). The year its first question closed was not verified: that needs the question listing, which was not read (see below). Edition ids would run from 2015 or 2016 to 2026.
- **API.** `https://www.metaculus.com/api/posts/` and `/api2/questions/` return HTTP 403 without a token: "Permission Error: The API is only available to authenticated users. Please create an account and use your API token to access the API." (tested 2026-10-01 with curl). The API documentation (OpenAPI spec 2.0.0, archived copy https://web.archive.org/web/20250903075945/https://www.metaculus.com/static/openapi.9c2e4eea8c2a.yml) explains token authentication (`Authorization: Token ...`) and a throttle of 1,000 requests per hour. It states no data licence and no attribution rule. The token is tied to a user account; agents may not create accounts, so the API was not used.
- **Licence.** No open data licence found. The site code is BSD-2-Clause since 2024 (Wikipedia); that licence covers code, not questions or forecasts.
- **Terms of use** (https://www.metaculus.com/terms-of-use/, live page returns 403 to scripts; read from the Internet Archive copy of 2026-08-27, https://web.archive.org/web/20260827212217/https://www.metaculus.com/terms-of-use/):
  - Metaculus grants "a limited, personal, non-exclusive, non-commercial, revocable and non-transferable license to view the Metaculus Content".
  - Users agree not to procure content "by automated means (such as scripts, bots, spiders, crawlers, or scrapers)", except through and subject to the terms of a Metaculus API, or under a separate written agreement.
  - "No materials from the Service may be copied, reproduced, modified, republished, downloaded, uploaded, posted, transmitted, or distributed" (the sentence continues with exceptions not read in full).
- **What this means for each field.** `question` (title as printed): Metaculus Content, not storable. `forecast` (community prediction): extracted data, not storable without the API or written permission. `url`, `opened`, `closed`, `resolved`, `resolution`: the fields closest to bare facts, but reading them still needs the question pages or the API, which the terms cover. Nothing was stored.
- **Not read.** The FAQ (https://www.metaculus.com/faq/) returned 403 to curl and WebFetch. Whether Metaculus offers a public dataset under an open licence (for example from the 2022 "Forecasting Our World in Data" project) was not confirmed.

### Good Judgment Open (gjopen.com)

- **First edition.** Good Judgment Inc began running a public forecasting tournament at the GJ Open site in September 2015 (secondary: Good Judgment pages via search; not read directly). Edition ids would run from 2015 to 2026.
- **API.** None found. The question listing (`https://www.gjopen.com/questions?status=closed`) returns HTTP 406 to curl.
- **Licence.** None. The terms grant a personal-use licence only.
- **Terms of service** (https://www.gjopen.com/terms, "Last updated: October 1, 2021", read 2026-10-01):
  - GJ grants "a limited, revocable, nonexclusive license to access and use the Service and the Content for your own personal use".
  - The licence "does not include any collection, aggregation, copying, duplication, display or derivative use of the Service nor any use of data mining, robots, spiders, or similar data gathering and extraction tools for any purpose unless expressly permitted by GJ in writing."
  - Collecting, aggregating, copying or displaying content for other purposes requires GJ's permission.
- **What this means for each field.** Every field (`question`, `url`, dates, `resolution`, `forecast`) would be collection and aggregation of GJ Open content. Not storable without written permission. Nothing was stored.

### Summary

| Platform | First edition | Public read | API | Open licence | Storable fields |
|---|---|---|---|---|---|
| Metaculus | 2015 or 2016 (founded 2015; first close not verified) | Question pages in a browser | Token required (account) | None for content | None without API terms or written permission |
| Good Judgment Open | 2015 (site launched September 2015) | Question pages in a browser (406 to scripts) | None | None | None without written permission |

## Fields (as planned, none filled)

`platform`, `question` (title as printed, as quote), `url`, `opened`, `closed`, `resolved`, `resolution`, `forecast` (community or crowd forecast at close, and at about 12 months before resolution where available), `forecast_at`, `subject`, `target_year`, `metric`, `unit`, `source_url`, `confidence`, `note`. Scope: questions near subjects Hindsight grades (real GDP growth, inflation, unemployment, policy rates of the US, euro area, UK, Brazil, China, India; oil price; EV sales and shares; solar and wind capacity; AI and technology adoption milestones), resolved by 2026-10-01. Edition id = year the question closed.

## Editions

| Edition | Title | Published | Status | Entries | Main source | Notes |
|---|---|---|---|---|---|---|
| 2015 | Metaculus and Good Judgment Open questions closed in 2015 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2016 | Metaculus and Good Judgment Open questions closed in 2016 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2017 | Metaculus and Good Judgment Open questions closed in 2017 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2018 | Metaculus and Good Judgment Open questions closed in 2018 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2019 | Metaculus and Good Judgment Open questions closed in 2019 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2020 | Metaculus and Good Judgment Open questions closed in 2020 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2021 | Metaculus and Good Judgment Open questions closed in 2021 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2022 | Metaculus and Good Judgment Open questions closed in 2022 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2023 | Metaculus and Good Judgment Open questions closed in 2023 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2024 | Metaculus and Good Judgment Open questions closed in 2024 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2025 | Metaculus and Good Judgment Open questions closed in 2025 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |
| 2026 | Metaculus and Good Judgment Open questions closed in 2026 | - | missing | 0 | - | Not captured: terms of use bar automated extraction and republication (see above). |

## What could not be read, and why

- **All question data, both platforms.** Not read: the terms of use forbid automated collection and redistribution (quoted above). The Metaculus API needs an account token; agents may not create accounts.
- **Metaculus FAQ** and **Good Judgment / Metaculus collaboration page** (https://goodjudgment.com/owidproject/): HTTP 403 to curl and WebFetch. The Internet Archive was "Temporarily Offline" for later lookups in this session (it served the Metaculus terms and the API spec earlier).
- **First closed question per platform.** Needs the question listing; not read.

## Open problems

1. **Permission or API access.** Either (a) Envisioning creates a Metaculus account and token and the API terms are checked for storage and republication, or (b) Envisioning asks Metaculus (api-requests@metaculus.com) and Good Judgment in writing for permission to store question title, URL, dates, resolution and crowd forecast in a CC BY 4.0 dataset with attribution. Until then this source stays empty. This is a decision for a person at Envisioning, not an agent.
2. **Facts versus contract.** Resolution values and crowd probabilities are facts, but both sites bind users by contract, not only copyright. Storing them through a browser read by a person would still be "collection, aggregation" under the GJ Open terms.
3. **Alternative baselines with open terms (not checked in depth).** The Good Judgment Project tournament data (IARPA ACE, 2011-2015) is published as a research dataset; check its licence. Survey-based expectations already in Hindsight (BCB Focus) serve the same calibration purpose for Brazil.
4. **Long Bets** out of scope until #64 is decided.
