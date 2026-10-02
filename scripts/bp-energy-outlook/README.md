# bp-energy-outlook scripts

## Inputs (downloaded by hand into this folder; gitignored)

Summary tables per edition. Current edition from bp.com, older ones from archive.org:

| Edition | URL |
|---|---|
| 2014 | https://web.archive.org/web/20140224041754/http://www.bp.com:80/content/dam/bp/excel/Energy%20Economics/BP_Energy_Outlook_2035_Summary_Tables_2014.xls (legacy .xls, #71) |
| 2015 | https://web.archive.org/web/20150301044017/http://www.bp.com:80/content/dam/bp/excel/Energy-Economics/energy-outlook-2015/BP-Energy-Outlook-2035-Summary-Tables-2015.xls (legacy .xls, #71). Not the .xlsx at https://web.archive.org/web/20150311012005/http://www.bp.com/content/dam/bp/excel/Energy-Economics/energy-outlook-2015/BP_Energy_Outlook_2035_Summary_Tables_2015.xlsx, which holds the January 2014 workbook. |
| 2016 | https://web.archive.org/web/20160325152311/http://www.bp.com/content/dam/bp/excel/energy-economics/energy-outlook-2016/bp-energy-outlook-2016-summary-tables.xlsx |
| 2017 | https://web.archive.org/web/20170128204854/http://www.bp.com/content/dam/bp/excel/energy-economics/energy-outlook-2017/bp-energy-outlook-2017-summary-tables.xlsx |
| 2018 | https://raw.githubusercontent.com/NRGI/bp-energy-outlook-tracking/HEAD/bp-energy-outlook-2018-summary-tables.xlsx (NRGI mirror; archive.org has no capture, #15) |
| 2019 | https://web.archive.org/web/20190311212120/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2019-summary-tables.xlsx |
| 2020 | https://web.archive.org/web/20200920151417/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2020-summary-tables.xlsx |
| 2022 | https://web.archive.org/web/20230128204915/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2022-summary-tables.xlsx (not the 2022-04-03 capture, whose renewables sheet is stale; #15) |
| 2023 | https://web.archive.org/web/20240703100600/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2023-summary-tables.xlsx |
| 2024 | https://web.archive.org/web/20240717215847/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2024-summary-tables.xlsx |
| 2025 | https://www.bp.com/press-and-publications/energy-outlook/downloads-and-archive (link "Energy Outlook – summary tables") |

Download each with `curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" -o st-<edition>.xlsx <url>` (use the `id_` form of archive.org URLs, for example `web/20150311012005id_/http://...`, to get the raw file). bp.com returns an error page to a short user agent.

## Run

```
python3 xlsx_dump.py st-2019.xlsx > st-2019.tsv
python3 xls_dump.py st-2014.xls > st-2014.tsv     # 2014 and 2015 are legacy .xls
python3 extract.py .
python3 append_tables.py .
python3 realized.py
```

- `xlsx_dump.py`: stdlib-only .xlsx reader; writes one tab-separated line per row.
- `xls_dump.py` (#71): stdlib-only reader for legacy binary .xls (BIFF8); same output format as `xlsx_dump.py`. Checked against xlrd 2.0.1 on the 2014 and 2015 files: identical output.
- `extract.py`: reads `st-<edition>.tsv` and writes `st-<edition>.rows.json` with world oil demand (Mb/d) and renewables share of primary energy per scenario and year. The share is computed as renewables / total primary energy from the table. For 2014 to 2017 the biofuels row is added to renewables, to match bp's headline "renewables (including biofuels)".
- `append_tables.py` (#15, #71): appends the 2014, 2018 and 2022 summary-table rows (`st-<edition>.rows.json`; an edition without a rows file is skipped) to those edition files without changing existing rows; re-runnable.
- `realized.py`: writes `data/raw/bp-energy-outlook/realized.json` from Our World in Data CSVs (EI Statistical Review, IEA Global EV Outlook). It downloads its inputs if missing.

The edition JSON files were assembled from the `rows.json` output plus facts read from each edition's report PDF (see `data/raw/bp-energy-outlook/INDEX.md`).
