# world-bank-gep

Builds `data/raw/world-bank-gep/` (World Bank Global Economic Prospects real GDP growth forecasts). Python 3, standard library only, plus `pdftotext` (poppler) on PATH.

## Inputs

| Source | Editions |
|---|---|
| Five ZIP archives of per-edition "gdp-growth" PDFs, linked from https://www.worldbank.org/en/publication/global-economic-prospects (URLs in `fetch.py`) | GEP 2000 to June 2024 |
| Four single "gdp-growth" PDFs from the same page (URLs in `fetch.py`) | January 2025 to June 2026 |
| World Development Indicators API, `NY.GDP.MKTP.KD.ZG` | realized values |

## Run

```bash
python3 fetch.py
```

```bash
python3 build.py
```

`fetch.py` downloads the files into a temporary folder, converts each PDF with `pdftotext -layout`, parses it with `parse.py`, and writes `parsed.json` and `wdi.json` here (gitignored). `build.py` writes the edition files, `realized.json` and `PROGRESS.md`. `editions.py` maps each file to its edition id and publication month. `INDEX.md` is written by hand from `index_rows.json`.

Then add the GEP's own later-stated World growth and each edition's weights base to `realized.json` (#66; leaves `entries` unchanged):

```bash
python3 world_restated.py
```
