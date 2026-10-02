# crowd-baseline scripts

Comparison data for the crowd baseline (issue #36, D35). Nothing here is graded by Hindsight, and `src/normalize` has no adapter for this source.

## Long Bets

Input URLs (public, no account):

- `https://longbets.org/bets/?page=N` and `https://longbets.org/predictions/?page=N` (listings, 10 per page)
- `https://longbets.org/<number>/` (one page per bet or prediction)

Run from the repo root:

```
scripts/crowd-baseline/fetch_long_bets.sh <scratch-dir>      # curl -sL -A "Mozilla/5.0", 0.5 to 1 s between requests
python3 scripts/crowd-baseline/parse_long_bets.py <scratch-dir> [checked-date]
```

The scratch directory stays outside the repo. The parser writes `data/raw/crowd-baseline/long-bets.json` and prints counts per kind and status.

What is stored: number, kind (bet or prediction), the claim as printed (cut to 400 characters), a 100-character title cut from it, start and end year from the page's duration line, status, the winner side from the "Winner!" badge, the URL. What is not stored: predictor or challenger names, user slugs, arguments, detailed terms, stakes, charities, comments. Claims that name their own predictor have the name replaced (`SELF_NAMED` in the parser).

Status rules: `resolved` when a winner badge is shown; otherwise `open_passed` when the end year is before 2026, `open` when it is 2026 or later, `open_undated` when the page shows `???` as end year. A badge on the predictor side sets `claim_held: true` (the claim text is the predictor's position).
