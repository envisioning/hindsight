# Hindsight

Hindsight is a public record of published forecasts about the future, checked against what happened.

Every year, consultancies, analysts and international bodies publish trend reports, hype cycles, economic outlooks and risk rankings. Few of them are ever checked afterwards. Hindsight records each forecast as a dated claim with a named source and a stable id, then grades it. Every grade cites its evidence, and every change to a grade stays in the record.

Hindsight is made by [Envisioning](https://www.envisioning.com).

## Status

Pre-release. Envisioning has published nothing from Hindsight yet. The first release will be "30 years of the Hype Cycle, graded": every entry of the Gartner Hype Cycle for Emerging Technologies, checked against what happened, with the full dataset. Envisioning grades its own old forecasts first.

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

Two AI agents grade each claim separately. A verdict is published only when they agree and it cites at least one source. Before each release, a person reads a random sample of verdicts, and we publish what that check found.

## Dispute a verdict

If you think a verdict is wrong, [open a dispute](../../issues/new?template=dispute-verdict.yml) with the claim id and your evidence. A dispute reopens the claim, and its history shows what changed and why.

## Licence

The code is MIT licensed (see [LICENSE](LICENSE)). The data is CC BY 4.0 (see [NOTICE.md](NOTICE.md)).

## Contributing

Read [AGENTS.md](AGENTS.md) and [docs/DECISIONS.md](docs/DECISIONS.md) first.
