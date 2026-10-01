# trendwatching scripts

`fetch.py` downloads archived trendwatching.com pages from the Wayback Machine (raw `id_` snapshots, earliest HTTP 200 capture) and prints a page's readable text (heading image alt text kept as `[IMG: ...]`). Standard library only. Downloads stay outside the repo.

```
# download (one file per URL into <out_dir>); optional @YYYYMMDD sets the earliest capture date
python3 scripts/trendwatching/fetch.py <out_dir> trendwatching.com/trends/2007top5.htm ...

# readable text of a saved page
python3 scripts/trendwatching/fetch.py <out_dir> --text <out_dir>/<file>.html
```

Input URLs, one per edition (the file `data/raw/trendwatching/<edition>.json` records the exact snapshot used):

| Edition | URL |
|---|---|
| 2007 | trendwatching.com/trends/2007top5.htm (no CDX hit for this form; snapshot 20070111000117 of www.trendwatching.com/trends/2007top5.htm fetched directly) |
| 2008 | trendwatching.com/trends/8trends2008.htm |
| 2009 | trendwatching.com/trends/halfdozentrends2009/ |
| 2010 | trendwatching.com/trends/10trends2010/ |
| 2011 | trendwatching.com/trends/11trends2011/ |
| 2012 | trendwatching.com/trends/12trends2012/ |
| 2013 | trendwatching.com/trends/10trends2013/ |
| 2014 | www.trendwatching.com/trends/7trends2014/ |
| 2015 | trendwatching.com/trends/10-trends-for-2015/ |
| 2016 | trendwatching.com/trends/5-trends-for-2016/ |
| 2017 | trendwatching.com/trends/5-trends-for-2017/ |
| 2018 | trendwatching.com/quarterly/2017-11/5-trends-2018/ |
| 2019 | trendwatching.com/quarterly/2018-11/5-trends-2019/ |
| 2020 | trendwatching.com/quarterly/2019-11/5-trends-2020 |
| 2021 | info.trendwatching.com/21-trends-for-2021 |
| 2022 | trendwatching.com/22-trends-for-2022 |
| 2023 | trendwatching.com/2023-trend-check |
| 2024 | trendwatching.com/2024-trend-check |
| 2025 | trendwatching.com/2025-trend-report-highlights |

Context pages used for verification: trendwatching.com/trends/2003/ to /2006/ (monthly briefing archives, no year lists).

The edition JSON files were written by hand from the `--text` output; each quote was checked as a verbatim substring of the page text (after normalising curly quotes and whitespace) before writing.

The archive rate-limits: the script retries three times with a growing pause and waits 2 s between URLs. Some snapshots are stored gzipped; the script decompresses them.
