# economist-world-ahead scripts

Builds `data/raw/economist-world-ahead/` from the publicly readable parts of The Economist's annual "The World in <year>" / "The World Ahead <year>" issue. The entries are chosen by hand; the scripts fetch text, hold the hand-picked entries, check that every quote appears word for word in the fetched text, and write the edition files and `INDEX.md`.

No paywall is bypassed. economist.com and worldin.economist.com return a Cloudflare challenge to scripts, so pages are read from Internet Archive snapshots (`web.archive.org/web/<timestamp>id_/<url>`). A snapshot that shows only the paywall teaser gives only the teaser.

## Files

| File | What it does |
|---|---|
| `wb.py <url-or-economist-path>` | Finds archive snapshots of a page (CDX API), fetches up to four, keeps the first with article text, and saves the paragraphs to `x/<name>.txt`. Set `TS=<timestamp>` to skip the CDX lookup and use that snapshot. |
| `pr.py <url> <out.txt>` | Fetches a press release (PR Newswire) and saves its text to `x/<out.txt>`. |
| `heads.py` | Reads economist.com paths on stdin and prints each snapshot's headline and standfirst. Not used for any entry (snapshots were unreliable). |
| `lib.py` | Shared helpers: `E()` builds an entry, `write()` checks quotes against `x/*.txt` and writes `<edition>.json`, `reprint()` builds an edition known only from one reprinted article. |
| `y*.py` | One script per edition or group of editions. Each holds the hand-picked entries and writes the edition files. `y_reprints_*.py` write the editions known from the World in 2016 reprints. `y_recalled.py` then adds predictions that the 2006 review restates; run it after the reprint scripts. |
| `selfassess.py` | Writes `self_assessment.json` from The Economist's own reviews of its previous edition. |
| `index.py`, `index_head.md`, `index_tail.md`, `missing.py` | Write `INDEX.md` from the edition files. `missing.py` holds the reason for each missing edition. |

`x/` is the download cache. It is gitignored and never committed.

## Inputs

- Editor's letters and self-reviews, economist.com (2020 to 2025), for example https://www.economist.com/the-world-ahead/2025/11/10/tom-standages-ten-trends-to-watch-in-2026. The full list is in each edition file's `sources`.
- Launch press releases on PR Newswire (2015, 2018, 2019, 2020, 2026). The URLs are in the edition files.
- The World in 2016 reprinted one article from each edition 1987 to 2015 on worldin.economist.com. The index is at http://www.theworldin.com/article/12091/world-1987-2016 and the article URLs are `https://worldin.economist.com/edition/2016/article/<id>/<slug>`. Snapshots dated 2022-12-15 hold the full text.

## Run

```
python3 wb.py the-world-ahead/2025/11/10/tom-standages-ten-trends-to-watch-in-2026
TS=20221215175845 python3 wb.py https://worldin.economist.com/edition/2016/article/11814/world-1987-political-outlook
python3 pr.py https://www.prnewswire.com/news-releases/its-judgment-time-according-to-the-economists-the-world-in-2020-300962898.html pr2020.txt
python3 y2020.py
python3 y_reprints_a.py && python3 y_reprints_b.py && python3 y_reprints_c.py && python3 y_reprints_d.py
python3 y_recalled.py
python3 selfassess.py
python3 index.py
```

Run the fetch commands first: `write()` reports any quote it cannot find in `x/*.txt` as `NOT VERBATIM`. The archive rate-limits; `wb.py` sleeps between requests, and a 503 or 504 means wait and retry later.
