# bp-energy-outlook scripts

## Inputs (downloaded by hand into this folder; gitignored)

Summary tables per edition. Current edition from bp.com, older ones from archive.org:

| Edition | URL |
|---|---|
| 2015 | https://web.archive.org/web/20150311012005/http://www.bp.com/content/dam/bp/excel/Energy-Economics/energy-outlook-2015/BP_Energy_Outlook_2035_Summary_Tables_2015.xlsx |
| 2016 | https://web.archive.org/web/20160325152311/http://www.bp.com/content/dam/bp/excel/energy-economics/energy-outlook-2016/bp-energy-outlook-2016-summary-tables.xlsx |
| 2017 | https://web.archive.org/web/20170128204854/http://www.bp.com/content/dam/bp/excel/energy-economics/energy-outlook-2017/bp-energy-outlook-2017-summary-tables.xlsx |
| 2019 | https://web.archive.org/web/20190311212120/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2019-summary-tables.xlsx |
| 2020 | https://web.archive.org/web/20200920151417/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2020-summary-tables.xlsx |
| 2023 | https://web.archive.org/web/20240703100600/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2023-summary-tables.xlsx |
| 2024 | https://web.archive.org/web/20240717215847/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2024-summary-tables.xlsx |
| 2025 | https://www.bp.com/press-and-publications/energy-outlook/downloads-and-archive (link "Energy Outlook – summary tables") |

Download each with `curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" -o st-<edition>.xlsx <url>` (use the `id_` form of archive.org URLs, for example `web/20150311012005id_/http://...`, to get the raw file). bp.com returns an error page to a short user agent.

## Run

```
python3 xlsx_dump.py st-2019.xlsx > st-2019.tsv
python3 extract.py .
python3 realized.py
```

- `xlsx_dump.py`: stdlib-only .xlsx reader; writes one tab-separated line per row.
- `extract.py`: reads `st-<edition>.tsv` and writes `st-<edition>.rows.json` with world oil demand (Mb/d) and renewables share of primary energy per scenario and year. The share is computed as renewables / total primary energy from the table. For 2015 to 2017 the biofuels row is added to renewables, to match bp's headline "renewables (including biofuels)".
- `realized.py`: writes `data/raw/bp-energy-outlook/realized.json` from Our World in Data CSVs (EI Statistical Review, IEA Global EV Outlook). It downloads its inputs if missing.

The edition JSON files were assembled from the `rows.json` output plus facts read from each edition's report PDF (see `data/raw/bp-energy-outlook/INDEX.md`).
