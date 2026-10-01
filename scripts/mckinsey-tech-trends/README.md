# McKinsey Technology Trends Outlook: capture scripts

mckinsey.com refuses scripted requests, so every input comes from the Wayback Machine (`id_` URLs return the original bytes).

## Inputs

| File | URL |
|---|---|
| tto-2021.pdf | https://web.archive.org/web/20210930082044id_/https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%20final/tech-trends-exec-summary.pdf |
| tto-2022.pdf | https://web.archive.org/web/20220910124235id_/https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202022/mckinsey-tech-trends-outlook-2022-full-report.pdf |
| tto-2023.pdf | https://web.archive.org/web/20250201232726id_/https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202023/mckinsey-technology-trends-outlook-2023-v5.pdf (the 2024-09-14 capture is truncated) |
| tto-2024.pdf | https://web.archive.org/web/20240717233936id_/https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202024/mckinsey-technology-trends-outlook-2024.pdf |
| tto-2025.pdf | https://web.archive.org/web/20250728164924id_/https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202025/mckinsey-technology-trends-outlook-2025.pdf |
| p2026.html | https://web.archive.org/web/20260915183134id_/https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-top-trends-in-tech (gzip-encoded; gunzip it) |

## Run

Needs `pdftotext` (poppler) and Python 3 (standard library). Work in a scratch folder outside the repo.

```
sh fetch.sh <url> tto-2024.pdf          # retries; Wayback returns intermittent 503s
for y in 2021 2022 2023 2024 2025; do pdftotext -layout tto-$y.pdf tto-$y.txt; pdftotext tto-$y.pdf tto-$y.raw.txt; done
gunzip -c p2026.html > p2026d.html       # then strip tags to p2026.txt (one text line per element)
python3 parse.py .                       # candidates-<year>.json: trends, investment and job-posting figures, dated sentences
python3 build.py .                       # writes data/raw/mckinsey-tech-trends/<year>.json and checks each quote
```

`parse.py` is a reading aid. `build.py` holds the hand-chosen entries and reports quotes it cannot find verbatim in the extracted text: for 2021 and 2022 these are slide figure labels whose columns pdftotext interleaves (each word is checked to be printed), plus two 2023 quotes with a footnote marker or page header removed.
