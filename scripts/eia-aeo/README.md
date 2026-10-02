# eia-aeo

Builds `data/raw/eia-aeo/` from EIA's own Annual Energy Outlook Retrospective Reviews. Python 3, standard library only, plus `pdftotext` (poppler) for the 2010 PDF tables.

## Inputs

Download these into this folder first.

| File | Source |
|---|---|
| `r22all.xlsx` | AEO Retrospective 2022, all tables: https://www.eia.gov/outlooks/aeo/retrospective/archive/2022/excel/AEO%202022%20Retrospective%20(all%20tables).xlsx (AEO1994 to 2022, target years to 2021) |
| `allcases.csv` | AEO Retrospective 2025 data: https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv (AEO2005 to 2025, full horizon; actuals 1970 to 2024) |
| `aeo2026_tab<N>.xlsx` (N = 2, 8, 11, 12, 13, 16, 18) | AEO2026 tables, Counterfactual Baseline case: https://www.eia.gov/outlooks/aeo/excel/aeotab<N>.xlsx (#13; skipped with a message when absent) |
| `r10/tbl_<n>.pdf` | AEO Retrospective 2010 tables: https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/pdf/tbl_<n>.pdf (AEO1982 to 1993). Table numbers: see `build.py` (``). |

```bash
curl -sL -A "Mozilla/5.0" -o allcases.csv "https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv"
```

## Run

```bash
python3 build.py
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/eia-aeo/`. Downloaded inputs are not committed. The PDF tables are read by column position; their entries carry confidence medium.

AEO2009 (#66): `build.py` takes every AEO2009 series from the R2025 data file (the March 2009 Reference case of the published report), except solar and wind, whose R2022 rows already equal it. R2022's other AEO2009 rows are the April 2009 ARRA-updated Reference case. Note: `build.py` does not reproduce the hand corrections of the `published` month in `1982.json` to `1987.json` (#53 audit); restore those files after a rebuild.

AEO2015 and AEO2016 (#70): `build.py` takes AEO2015 and AEO2016 imported crude (nominal) and AEO2016 transportation energy from R2025 for every year (`R22_NOT_OF_RECORD`); R2022's rows for them match no case of the edition. AEO2026 (#13): read from the edition's own tables with row codes checked against R2025's AEO2025 rows.
