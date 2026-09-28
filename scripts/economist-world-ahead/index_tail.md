## Entry fields

`rank` (position in the editor's letter where numbered, else null), `kind`, `quote`, `subject` (plain label, Hindsight's own), `target_year`, `metric`, `value`, `unit` (null where not stated), `source_url` (original economist.com or worldin.economist.com URL; the archive snapshot read is listed in the edition's `sources`), `confidence`, `note`.

## self_assessment.json

The Economist's own reviews of its previous edition, one record per review: which edition it reviews, where it was published, and each hit or miss as The Economist states it (`economist_says`: right / wrong / partly), with a short quote. These are the publisher's claims, not Hindsight grades.

## Open problems

- **Superforecasters.** From The World Ahead 2023 the issue carries "What the superforecasters predict for major events", with probabilities from Good Judgment. Those are Good Judgment's forecasts, not The Economist's, and are not captured here. They could be a separate source.
- **Headline-level predictions.** Many paywalled article headlines are themselves predictions (for 2026: "India's economy will become the world's fourth-largest", "The world's first climate refugees will arrive in Australia in 2026"). Headlines and standfirsts are public, but the archive snapshots were unreliable (no 200 capture, 503 errors), so they are not captured. Only URL slugs were seen, and slugs are not quotes.
- **Self-review of 2004.** The 2006 review says The World in 2005 admitted "a few of its predictions for 2004 had not come true"; that article was not found. The 2015 press release mentions "a report card on what The Economist got right and wrong in 2014"; not found. Franklin-era reviews for other years (2005 to 2018) were not found in public form.
- **Self-review of 2025.** "A look back over the first 40 years of The World Ahead" (2025-10-27) is paywalled; no public review of 2025 predictions was found.
- **Revisions (not yet mapped to Subject ids).** Recurring subjects across editions: US recession (2019, 2020, 2023), China zero-covid policy (2022, 2023), US-China trade war (2021, 2025), Brexit (2018, 2019, 2020), Federal Reserve rates (2015, 2016, 2019, 2026), fastest-growing economy (2018, 2019), New Horizons (2015, 2019), US presidential elections (1992, 2004, 2008, 2016, 2020, 2024).
- **Scheduled events.** Some entries are scheduled events (Olympics, film releases, flybys). They are kept because they are dated and testable, and flagged in `note`.

## Source-side oddities

- The 2019 self-review ("Hindsight on foresight") says the central scenario was that Britain would leave the EU "as planned on March 31st". The World in 2019 article said "on March 29th".
- The 2024 self-review says the edition "expected America's election to be a coin-toss"; the 2024 editor's letter gave Donald Trump "a one-in-three chance of regaining the presidency".
- The World in 1987 reprint spells "solders" for soldiers and "long the arms control road" for "along".
- The 2006 review says the series "first appeared back in 1986" (publication year of The World in 1987), consistent with a first edition titled 1987.
- The 2020 press release has spaces before some punctuation ("Donald Trump :"); quotes keep them.
- The 2023 self-review repeats a word: "who who is indeed in a run-off".
