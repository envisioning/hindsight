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

Then add the scanned 1990s editions (#11): five edition files, their World weights and past-year World statements, and WDI 1990 to 1997 for the countries (Python 3 standard library):

```bash
curl -sL -A "Mozilla/5.0" -o /tmp/wdi90.json 'https://api.worldbank.org/v2/country/USA;JPN;CHN;IND;BRA/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=2000&date=1990:1998'
python3 gep_1990s.py /tmp/wdi90.json
```

The values in `gep_1990s.py` were read by OCR from the scanned reports on documents.worldbank.org (URLs and pages in the script): `pdftoppm -r 400` then `tesseract --psm 6`, checked against `pdftotext -layout` on the PDF's own OCR layer, a second table of the same edition, or arithmetic. GEP 1998/99 was read from the World Bank's Chinese edition (report 18777), because the English scan is illegible.
