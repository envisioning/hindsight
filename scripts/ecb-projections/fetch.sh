#!/bin/sh
# Downloads the inputs for build.py into the folder given as $1 (default: this folder).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${1:-$HERE}
mkdir -p "$OUT"
E="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data"
curl -sS -m 90 -A "Mozilla/5.0" -o "$OUT/table.html" "https://www.ecb.europa.eu/mopo/devel/ecana/html/table.en.html"
curl -sS -m 180 -A "Mozilla/5.0" -H "Accept: text/csv" -o "$OUT/mpd.csv" "https://data-api.ecb.europa.eu/service/data/MPD/A.U2.YER+HIC...?format=csvdata"
curl -sS -m 60 -o "$OUT/hicp.json" "$E/prc_hicp_aind?geo=EA&coicop=CP00&unit=RCH_A_AVG&lang=en"
curl -sS -m 60 -o "$OUT/gdp.json" "$E/nama_10_gdp?geo=EA&geo=EA20&na_item=B1GQ&unit=CLV_PCH_PRE&lang=en"
curl -sS -m 90 -o "$OUT/namq_gdp.json" "$E/namq_10_gdp?geo=EA20&na_item=B1GQ&unit=CLV20_MEUR&s_adj=SCA&lang=en"
