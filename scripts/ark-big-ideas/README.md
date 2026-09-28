# ark-big-ideas scripts

`pages.py` is a reading aid. It prints the pages of a Big Ideas text dump that name a future year next to a forecast word. Entries in `data/raw/ark-big-ideas/` were written by hand from that output and from the full text.

## Inputs

Download each PDF into this folder (PDFs are gitignored), then convert it with `pdftotext` (poppler).

| Edition | URL |
|---|---|
| 2017 | https://assets.arkinvest.com/media-8e522a83-1b23-4d58-a202-792712f8d2d3/30ebc53a-c5d0-479f-8bea-63f1a9fbdc70/big-ideas-2017.pdf |
| 2018 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Infographics/Big%20Ideas%202018%20-%20ARK%20Invest.pdf |
| 2019 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/Big-Ideas-2019-ARKInvest.pdf |
| 2020 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/Big%20Ideas%202020-Final_011020.pdf |
| 2021 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/ARK%E2%80%93Invest_BigIdeas_2021.pdf |
| 2022 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/ARK_BigIdeas2022.pdf |
| 2023 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Big_Ideas/ARK%20Invest_013123_Presentation_Big%20Ideas%202023_Final.pdf |
| 2024 | https://assets.arkinvest.com/media-8e522a83-1b23-4d58-a202-792712f8d2d3/8cea086f-21b4-47bf-8ac6-666b96a84a04/ARK-Invest_Big-Ideas-2024.pdf |
| 2025 | https://web.archive.org/web/2025id_/https://europe.ark-funds.com/wp-content/uploads/2025/02/ARK-Invest-Big-Ideas-2025.pdf |
| 2026 | https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/Big_Ideas/ARKInvest%20BigIdeas2026.pdf |

## Run

```
curl -sL -A "Mozilla/5.0" -o 2020.pdf "<url>"
pdftotext -layout 2020.pdf 2020.txt
python3 pages.py 2020.txt 2021
```

The second argument is the earliest year to show (use edition + 1 to skip footers that print the edition year).
