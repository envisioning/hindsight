# eia-aeo

Builds `data/raw/eia-aeo/` from EIA's own Annual Energy Outlook Retrospective Reviews. Python 3, standard library only, plus `pdftotext` (poppler) for the 2010 PDF tables.

## Inputs

Download these into this folder first.

| File | Source |
|---|---|
| `r22all.xlsx` | AEO Retrospective 2022, all tables: https://www.eia.gov/outlooks/aeo/retrospective/archive/2022/excel/AEO%202022%20Retrospective%20(all%20tables).xlsx (AEO1994 to 2022, target years to 2021) |
| `allcases.csv` | AEO Retrospective 2025 data: https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv (AEO2005 to 2025, full horizon; actuals 1970 to 2024) |
| `r10/tbl_<n>.pdf` | AEO Retrospective 2010 tables: https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/pdf/tbl_<n>.pdf (AEO1982 to 1993). Table numbers: see `build.py` (``). |

```bash
curl -sL -A "Mozilla/5.0" -o allcases.csv "https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv"
```

## Run

```bash
python3 build.py
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/eia-aeo/`. Downloaded inputs are not committed. The PDF tables are read by column position; their entries carry confidence medium.
