# ecb-projections

Builds `data/raw/ecb-projections/` (ECB and Eurosystem staff macroeconomic projections for the euro area). Python 3, standard library only.

## Inputs

`fetch.sh` downloads into a folder (default: this folder):

| File | Source |
|---|---|
| `table.html` | ECB "Past macroeconomic projections", https://www.ecb.europa.eu/mopo/devel/ecana/html/table.en.html |
| `mpd.csv` | ECB Macroeconomic Projection Database, annual euro-area real GDP (YER) and HICP (HIC), https://data-api.ecb.europa.eu/service/data/MPD/A.U2.YER+HIC...?format=csvdata |
| `hicp.json` | Eurostat `prc_hicp_aind`, geo=EA, CP00, RCH_A_AVG |
| `gdp.json` | Eurostat `nama_10_gdp`, geo=EA and EA20, B1GQ, CLV_PCH_PRE |

## Run

```bash
./fetch.sh /path/to/scratch
```

```bash
python3 build.py /path/to/scratch
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/ecb-projections/`, and `build_summary.json` to the input folder. `INDEX.md` is written by hand.
