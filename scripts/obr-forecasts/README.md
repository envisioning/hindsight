# obr-forecasts

Builds `data/raw/obr-forecasts/` from the OBR historical official forecasts database and ONS series. Python 3, standard library only. Reads the workbook with `../cbo-projections/xlsx.py`.

## Inputs

Download these into one input folder outside the repo (default: `inputs/` next to this script). obr.uk answers scripted requests with a Cloudflare challenge (HTTP 403), so the workbook was read from its Internet Archive snapshot.

| Path in input folder | Source |
|---|---|
| `Historical_official_forecasts_database_Spring_2026.xlsx` | https://obr.uk/docs/dlm_uploads/Historical_official_forecasts_database_Spring_2026.xlsx (linked from https://obr.uk/data/). Snapshot used: `https://web.archive.org/web/20260326123133id_/<url>` |
| `ons/ihyp.json` | https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/ihyp/pn2/data |
| `ons/d7g7.json` | https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23/data |

Example:

```bash
curl -sL -o Historical_official_forecasts_database_Spring_2026.xlsx "https://web.archive.org/web/20260326123133id_/https://obr.uk/docs/dlm_uploads/Historical_official_forecasts_database_Spring_2026.xlsx"
```

## Run

```bash
python3 build.py /path/to/input-folder
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/obr-forecasts/`. `INDEX.md` is written by hand.
