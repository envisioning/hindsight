# Hindsight

Hindsight is a public record of published forecasts about the future, checked against what happened.

Every year, consultancies, analysts and international bodies publish trend reports, hype cycles, economic outlooks and risk rankings. Few of them are ever checked afterwards. Hindsight records each forecast as a dated claim with a named source and a stable id, then grades it. Every grade cites its evidence, and every change to a grade stays in the record.

Hindsight is made by [Envisioning](https://www.envisioning.com).

## Status

Latest dataset release: `hindsight-2026.2` (2 October 2026). It holds 28,306 dated claims from 36 sources (consultancies, analysts, central banks, international bodies, trend reports, scenario sets, and Envisioning's own posters from 2011 to 2014), with every published verdict, every numeric grade, and a validation table that gives the sample sizes, grader agreement, audit results and intervals behind each rate. The files are in `data/out` (JSON, CSV, JSON Schemas, `datapackage.json`). The site is at [envisioning.com/hindsight](https://www.envisioning.com/hindsight).

## How claims are graded

A claim is graded only against what it said when it was published, at the date it named.

| Claim type | Graded on | Verdicts |
|---|---|---|
| Forecast | Accuracy at the target date | hit, partial, miss, unfalsifiable |
| Trend | What became of it after some years | persisted, faded, renamed, recycled |
| Scenario | Did the real outcome fall inside any scenario? | covered, partly covered, not covered |
| Ranking | Did the ranked items happen? Did the shocks that happened rank low? | ranked high, ranked low, absent |
| Fiction | Did the depicted technology appear, and when? | appeared, partly appeared, not yet |

Scenarios and fiction are never graded right or wrong. A forecast too vague to test is graded "unfalsifiable", and we publish how often each source makes one.

Hindsight has no total score and does not rank forecasters.

Two AI agents grade each claim separately. When they disagree, a third agent settles it. Every verdict cites at least one source. An audit agent then re-checks a fixed random sample of the agreed verdicts, and every published interval is widened by the error rate that audit found.

## Dispute a verdict

If you think a verdict is wrong, [open a dispute](../../issues/new?template=dispute-verdict.yml) with the claim id and your evidence. A dispute reopens the claim, and its history shows what changed and why.

## How to cite

Cite the dataset release you used:

> Envisioning (2026). *Envisioning Hindsight: published forecasts, graded against what happened* (Version 2026.2) [Data set]. https://github.com/envisioning/hindsight/releases/tag/hindsight-2026.2

To cite a single claim, use its stable id and the date of its verdict: "Hindsight, claim `<id>`, `<verdict>` as of `<date>`. Envisioning." with the claim's page on [envisioning.com/hindsight](https://www.envisioning.com/hindsight). Machine-readable metadata is in [CITATION.cff](CITATION.cff); GitHub's "Cite this repository" button reads it.

A DOI is not minted yet. [.zenodo.json](.zenodo.json) holds the Zenodo metadata, so once an Envisioning org admin enables the GitHub-Zenodo integration for this repository (zenodo.org, "GitHub" settings, toggle `envisioning/hindsight`), each new tagged release gets a DOI. Then add the DOI to `CITATION.cff` and here.

## Licence

The code is MIT licensed (see [LICENSE](LICENSE)). The data is CC BY 4.0 (see [NOTICE.md](NOTICE.md)).

## Contributing

Read [AGENTS.md](AGENTS.md) and [docs/DECISIONS.md](docs/DECISIONS.md) first.
