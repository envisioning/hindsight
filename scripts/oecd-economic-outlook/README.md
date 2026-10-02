# oecd-economic-outlook

Builds `data/raw/oecd-economic-outlook/` (OECD Economic Outlook real GDP growth forecasts). Python 3, standard library only (`vintages.py` also needs xlrd).

## Inputs

| Script | Source | Editions |
|---|---|---|
| `fetch.py` | OECD SDMX API, dataflows `OECD.ECO.MAD:DSD_EO_114@DF_EO_114` to `DSD_EO_118@DF_EO_118` and `DSD_EO@DF_EO` (https://sdmx.oecd.org/public/rest/) | EO114 to EO119 |
| `fetch.py` | DBnomics git mirror of the retired OECD.Stat dataset `EO` (https://git.nomics.world/dbnomics-json-data/oecd-json-data, folder `EO/`), one commit per edition, commit ids listed in the script | EO102 to EO115 |
| `fetch_wayback.py` | Internet Archive captures of http://www.oecd.org/eco/outlook/Demand-and-Output.xls (timestamps in the script); read with `xls.py` | EO94, EO95, EO98 |
| `build.py` (`TRANSCRIBED`) | Internet Archive copies of the statistical annex PDFs (URLs in the script), values read from the page image | EO99, EO100, EO101 |
| `vintages.py` | Internet Archive captures of the annex workbook "Demand and output" (http://www.oecd.org/dataoecd/6/27/2483806.xls, http://www.oecd.org/eco/outlook/Demand%20and%20Output.xls) and the flash file (http://www.oecd.org/dataoecd/18/26/2713584.xls, http://www.oecd.org/eco/outlook/flash_eo93_nolinked.xls), timestamps in the script; plus printed tables (`TRANSCRIBED`): EO web page summary tables and EO PDFs (https://webdoc.sub.gwdg.de/edoc/lm/ingenta/sourceoecd/, oecd.org) | EO60, EO62 to EO68, EO70, EO72, EO74 to EO81, EO83 to EO90, EO93, EO96, EO97 |

`fetch.py` downloads about 26 files of 35 MB from the DBnomics mirror and keeps only the nine series in scope. The Internet Archive can refuse connections; pass a folder that holds the captures as `<timestamp>.xls` to `fetch_wayback.py` to skip the download.

## Run

```bash
python3 fetch.py
```

```bash
python3 fetch_wayback.py
```

```bash
python3 build.py
```

```bash
pip install xlrd==2.0.1
python3 vintages.py [folder]
```

`vintages.py` needs xlrd: the standard-library reader `xls.py` cannot read the year header formulas or one of the flash files. It downloads about 30 captures (about 15 MB) unless `folder` holds them as `<timestamp>.xls`. It writes only the editions it covers, merges their rows into `PROGRESS.md`, and writes `vintages_check.json` here (gitignored), the cross-check of annex values against the flash file of the same edition. Run it after `build.py`, which rewrites `PROGRESS.md` with its own editions only.

`fetch*.py` write `dbnomics_eo.json`, `sdmx_eo.json` and `wayback_annex.json` here (gitignored). `build.py` writes the edition files, `realized.json` and `PROGRESS.md`. `INDEX.md` is written by hand from `index_rows.json`.
