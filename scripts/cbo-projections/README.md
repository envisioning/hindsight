# cbo-projections

Builds `data/raw/cbo-projections/` from CBO and FRED files. Python 3, standard library only (`xlsx.py` reads the workbooks).

## Inputs

Download these into one input folder outside the repo (default: `inputs/` next to this script). cbo.gov answers bot-protected requests with a 403 page (DataDome). The CBO files below were fetched from the Internet Archive (`https://web.archive.org/web/<timestamp>id_/<cbo url>`). Use a snapshot from around the publication month: recent snapshots of some files hold the 403 page, not the workbook. Check each download with `file` before building.

| Path in input folder | Source |
|---|---|
| `53090-supplementarytables.xlsx` | https://www.cbo.gov/system/files/115th-congress-2017-2018/reports/53090-supplementarytables.xlsx (CBO's Economic Forecasting Record: 2017 Update, supplementary tables; two-year and five-year average forecasts for forecasts made 1976 to 2014) |
| `ep/51135-*.xlsx` | The 44 files listed in `ep_urls.txt` (relative to https://www.cbo.gov), as linked from https://www.cbo.gov/data/budget-economic-data ("10-year economic projections"). Keep the original file names. |
| `baselines.csv`, `actuals.csv` | https://raw.githubusercontent.com/US-CBO/eval-projections/main/input_data/baselines.csv and `.../actuals.csv` |
| `fred/<ID>.csv` | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=<query>` for A191RL1A225NBEA, A001RL1A225NBEA, `UNRATE&fq=Annual&fam=avg`, `CPIAUCNS&fq=Annual&fam=avg&transformation=pc1`, `GS10&fq=Annual&fam=avg`, FYFSD, FYFSGDA188S. Save each as `fred/<ID>.csv`. FRED rejects some custom user agents; plain `curl -sL` works. |

Example:

```bash
curl -sL -o 53090-supplementarytables.xlsx "https://web.archive.org/web/2023id_/https://www.cbo.gov/system/files/115th-congress-2017-2018/reports/53090-supplementarytables.xlsx"
```

## Run

```bash
python3 build.py /path/to/input-folder
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/cbo-projections/`. `INDEX.md` is written by hand.
