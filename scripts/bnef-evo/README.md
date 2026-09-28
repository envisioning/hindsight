# bnef-evo realized values

`realized.py` writes `data/raw/bnef-evo/realized.json`: global electric car sales and EV share of new car sales, 2010 to 2025.

## Inputs

IEA Global EV Outlook 2026 data, as republished by Our World in Data:

- https://ourworldindata.org/grapher/electric-car-sales.csv?v=1&csvType=full&useColumnShortNames=false
- https://ourworldindata.org/grapher/electric-car-sales-share.csv?v=1&csvType=full&useColumnShortNames=false

The script downloads each CSV next to itself if it is missing. The CSVs are gitignored.

## Run

```
python3 scripts/bnef-evo/realized.py
```

Delete the CSVs first to fetch a newer vintage, then update the `vintage` string in the script.
