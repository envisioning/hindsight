# Deloitte Tech Trends: capture helpers

The edition files in `data/raw/deloitte-tech-trends/` were written by hand from the PDFs. These scripts are reading and checking aids. They need Python 3 (standard library) and poppler's `pdftotext`.

## Inputs

Download each edition PDF to a scratch folder outside the repo as `tt<edition>.pdf` (`curl -sL -A "Mozilla/5.0" -o tt2017.pdf <url>`). Do not commit the PDFs.

| Edition | URL |
|---|---|
| 2010 | https://web.archive.org/web/2020id_/https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2010-dozen-technology-trends.pdf |
| 2011 | https://web.archive.org/web/2020id_/https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2011-natural-convergence.pdf |
| 2012 | https://web.archive.org/web/20121002205928id_/http://www.deloitte.com/assets/Dcom-UnitedStates/Local%20Assets/Documents/us_cons_techtrends2012_013112.pdf |
| 2013 | https://web.archive.org/web/20221123212355id_/http://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2013-elements-postdigital.pdf |
| 2014 | https://web.archive.org/web/20220120025537id_/https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2014-inspiring-disruption.pdf |
| 2015 | https://web.archive.org/web/2019id_/https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-cons-tech-trends-2015-fusion-business-it.pdf |
| 2016 | https://web.archive.org/web/20180828185225id_/https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology/gx-tech-trends-2016-innovating-digital-era.pdf |
| 2017 | https://www.deloitte.com/content/dam/insights/articles/2017/3468_techtrends2017/dup-techtrends2017.pdf |
| 2018 | https://www.deloitte.com/content/dam/insights/articles/2018/tech-trends-2018/4109-techtrends-2018-final.pdf |
| 2019 | https://www.deloitte.com/content/dam/insights/articles/2024/5080_techtrend2019_collection/pdf/DI_TechTrends2019.pdf |
| 2020 | https://www.deloitte.com/content/dam/insights/articles/2020/tech-trends-2020/di-techtrends2020.pdf |
| 2021 | https://www.deloitte.com/content/dam/insights/articles/2021/6730_tt-landing-page/DI_2021-Tech-Trends.pdf |
| 2022 | https://www.deloitte.com/content/dam/insights/articles/2024/us164706_tech-trends-2022/pdf/di-tech-trends-2022.pdf |
| 2023 | https://www.deloitte.com/content/dam/insights/articles/2023/us175897_tech-trends-2023/DI_tech-trends-2023.pdf |
| 2024 | https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/2024.html (serves the PDF) |
| 2025 | https://www.deloitte.com/content/dam/insights/articles/2024/us187540_tech-trends-2025/DI_Tech-trends-2025.pdf |
| 2026 | https://www.deloitte.com/content/dam/insights/articles/2025/us188546_tt-26/pdf/DI_Tech-trends-2026.pdf |

The Wayback Machine sometimes cuts a download at exactly 1,048,576 bytes; check with `pdfinfo` and retry with another capture timestamp (CDX: `curl -g "https://web.archive.org/cdx/search/cdx?url=<url>&fl=timestamp,statuscode,length"`). Use `curl -g` for CDX queries with `[...]` in a filter.

## Scripts

- `openings.py`: prints each chapter's opening text and every sentence that states a horizon ("18 to 24 months", "next decade", "by 20NN").
  `pdftotext tt2017.pdf tt2017.raw.txt && python3 openings.py tt2017.raw.txt --skip 5 "IT unbounded" "Dark analytics" ...`
- `verify_quotes.py`: checks that every `quote` in the edition JSON occurs in the PDF text (`pdftotext -raw`, compared on letters and digits only).
  `python3 verify_quotes.py <folder-with-pdfs> [edition ...]`

Known mismatch: 2018 entry 7 (a page header splits the sentence in the PDF text).
