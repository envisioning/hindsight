# imf-weo

Builds `data/raw/imf-weo/` from IMF files. Python 3, standard library only.

## Inputs

Download these into this folder first. imf.org answers 403 to a plain request; the static file and the DataMapper API respond when the request carries a `Range: bytes=0-` header.

| File | Source |
|---|---|
| `weohistorical.xlsx` | https://www.imf.org/-/media/files/publications/weo/weo-database/2025/april/weohistorical.xlsx (IMF Historical WEO Forecasts Database, April 2025; editions 1990 to 2025-04) |
| `oct25_all.json` | https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/+/*.NGDP_RPCH.A (edition 2025-10) |
| `dm_ngdp.json` | https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH (edition 2026-04 and realized values; live series) |
| `bd_data.json` | https://bd-econ.com/files/imfweo/data.json (publication months per vintage; third-party) |

Example:

```bash
curl -sL -A "Mozilla/5.0" -H "Range: bytes=0-" -o weohistorical.xlsx "https://www.imf.org/-/media/files/publications/weo/weo-database/2025/april/weohistorical.xlsx"
```

## Run

Unzip the workbook into `x/` (the script reads its XML directly), then build:

```bash
unzip -o -q weohistorical.xlsx -d x
```

```bash
python3 build.py
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/imf-weo/`. Downloaded inputs are not committed (see `.gitignore`).

India on a calendar-year basis (#66): `india_calendar.py` reads India `NGDP_RPCH` of the WEO April 2013 database from the DBnomics mirror (https://api.db.nomics.world/v22/series/IMF/WEO:2013-04/IND.NGDP_RPCH) and writes `india_calendar_year` into `realized.json`, leaving `entries` unchanged. Run it after `build.py`:

```bash
python3 india_calendar.py
```
