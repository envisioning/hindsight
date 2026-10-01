# shell-scenarios scripts

Parse the downloaded Shell scenario data workbooks and printed tables into pathway rows. Standard-library Python 3 only. Downloads stay out of git.

## Inputs

Download into one folder (outside the repo) with `curl -sL -A "Mozilla/5.0" -o <name> <url>`:

| File name | URL |
|---|---|
| `src-2011.pdf` | https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_745060082/promo_copy_717248746/links/item0.stream/1652289218851/787285b3524a8522519a5708558be86cd71a68b2/shell-scenarios-2050signalssignposts.pdf |
| `src-2013.pdf` | https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_745060082/promo_copy/links/item0.stream/1652287059126/77705819dcc8c77394d9540947e811b8c35bda83/scenarios-newdoc-english.pdf |
| `src-2021x.xlsx` | https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_1789847828/promo_847985331_copy/links/item0.stream/1668516256900/9d9a0a9deed06f8164943e7a399fd2d55db49afc/shell-energy-transformation-scenario-summary-data.xlsx |
| `src-2023x.xlsb` | https://www.shell.com/news-and-insights/scenarios/the-energy-security-scenarios/_jcr_content/root/main/section_926760145/promo_copy_142460259/links/item0.stream/1684499937239/acd9a3a0c03a6d84c855635f52e7157123a7d8ec/shell-energy-security-scenarios-2023-underlying-data-updated.xlsb |
| `src-2025x.xlsb` | https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/the-2025-energy-security-scenarios/_jcr_content/root/main/section_1902297548/promo_1610292284/links/item0.stream/1738231997237/b64df0471395a93655f85a80b9afa3e9216e83d9/scenarios-2025-compendium-summary.xlsb |

Then make the two text files with poppler's `pdftotext`:

```
pdftotext src-2011.pdf src-2011.raw.txt
pdftotext -layout src-2013.pdf src-2013.txt
```

The other edition PDFs (listed in `data/raw/shell-scenarios/*.json` `sources`) were read by hand; the 1993 PDF is image-only and was OCR'd with `ocrmypdf --force-ocr --sidecar`.

## Run

```
python3 scripts/shell-scenarios/extract_data.py <input_dir> <output_dir>
```

Writes `<output_dir>/<edition>.pathways.json` for 2011, 2013, 2021, 2023 and 2025: world primary energy by source and total (EJ/year), energy CO2 (Gt CO2/year) and, for 2023, the electric passenger vehicle stock, for every scenario and every target year from the first year the scenarios diverge up to 2025. Those rows were appended, in that order, after the hand-curated text entries in each edition file.

Helpers: `xlsx_dump.py` and `xlsb_dump.py` dump a workbook sheet to TSV (`--list` lists sheets). `xlsb_dump.py` is a minimal BIFF12 reader (numbers, RK, shared and inline strings, cached formula results).
