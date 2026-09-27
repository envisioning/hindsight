# Hindsight

Hindsight is a public record of published forecasts about the future, graded against what happened.

Forecasters publish every year: trend reports, hype cycles, economic outlooks, risk rankings. Almost nobody goes back to check them. Hindsight does. Each forecast becomes a dated, attributed claim with a stable id. Each claim gets a verdict, the evidence behind it, and a history of every change.

Hindsight is made by [Envisioning](https://www.envisioning.com).

## Status

Pre-release. Nothing is published yet. The first release is planned as "30 years of the Hype Cycle, graded": every entry of the Gartner Hype Cycle for Emerging Technologies, checked against what happened, with the full dataset.

## How claims are graded

Each claim is graded only against what it said at the time, at its own target date.

| Claim type | Graded on | Verdicts |
|---|---|---|
| Forecast | Accuracy at the target date | hit, partial, miss, unfalsifiable |
| Trend | What became of it after some years | persisted, faded, renamed, recycled |
| Scenario | Did the real outcome fall inside any scenario? | covered, partly covered, not covered |
| Ranking | Did the ranked items happen? Did the shocks that happened rank low? | ranked high, ranked low, absent |
| Fiction | Did the depicted technology appear, and when? | appeared, partly appeared, not yet |

Scenarios and fiction are never graded right or wrong. "Unfalsifiable" is a finding in its own right.

There is no total score and no ranking of forecasters.

Two independent AI agents grade each claim. A verdict is published only when both agree, and every verdict must cite at least one source. Before each release, a person reads a random sample of verdicts, and the result of that check is published with the release.

## Dispute a verdict

If you think a verdict is wrong, [open a dispute](../../issues/new?template=dispute-verdict.yml). Include the claim id and your evidence. A dispute reopens the claim, and the verdict history shows what changed and why.

## Licence

Code: MIT, see [LICENSE](LICENSE). Data: CC BY 4.0, see [NOTICE.md](NOTICE.md).

## For contributors

Read [AGENTS.md](AGENTS.md) and [docs/DECISIONS.md](docs/DECISIONS.md) first.
