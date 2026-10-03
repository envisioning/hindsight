# ClaimReview markup: not used

Decision (3 October 2026, issue #93): Hindsight claim pages do not emit schema.org `ClaimReview`. They emit a `WebPage` that is part of the Hindsight `Dataset`, and a plain-text citation line.

## Why not

- **Google is phasing it out.** Google's fact check documentation (developers.google.com/search/docs/appearance/structured-data/factcheck, read 3 October 2026) says Google is phasing out support for `ClaimReview` in Search. It stays readable by the Fact Check Explorer tool. No end date is given. Adding markup for a rich result that is going away buys little.
- **A forecast verdict is not a fact check.** `ClaimReview` rates whether a claim is true. Hindsight grades a forecast against its own target date, and half of its verdict families are not truth ratings at all: trends (persisted, faded, renamed, recycled), scenarios (covered, not covered), rankings and fiction are never graded right or wrong (D6). Mapping them onto a `reviewRating` scale would say something Hindsight does not say. Google's documentation has no guidance on claims whose truth was not yet determinable when made.
- **It would rate each claim on one scale.** A numeric `reviewRating` on every page invites aggregation into a per-publisher score, which Hindsight deliberately does not publish (no total score, no ranking).
- **Open and contested claims have no rating.** Many claims are not due yet or have no published verdict (D7). `ClaimReview` requires a `reviewRating`.

## What we meet and what we would not

Hindsight meets most of Google's eligibility rules: the claim is attributed to a distinct origin (publisher, edition, position), methods and sources are public, there is a dispute route (D29), and each page would carry one claim. That is not the obstacle; the fit and the phase-out are.

## What would overturn this

- Google, or another consumer that matters (Fact Check Explorer, a research index), states that it reads `ClaimReview` for predictions and accepts non-truth verdicts.
- Hindsight decides to publish a numeric grade per claim on one scale (it currently does not).

If overturned, emit `ClaimReview` only for forecast claims with a published hit, partial or miss verdict, with `claimReviewed` under 75 characters, `itemReviewed` a `Claim` with `author` the publisher and `datePublished` the edition date, and `reviewRating.alternateName` the verdict word.
