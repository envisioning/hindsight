# accenture-tech-vision scripts

Reading aids for capturing Accenture Technology Vision editions into `data/raw/accenture-tech-vision/<edition>.json`. Capture itself was manual. Neither script writes into the repo.

- `extract.py <file.pdf> [--survey]` prints sentences that state a future year or horizon ("by 2020", "within five years", "next three years"), and with `--survey` also survey shares ("77 percent of executives"), with page numbers. Needs `pdftotext` (poppler).
- `html_text.py <page.html>` strips an accenture.com edition page to plain text lines.

Standard-library Python 3 only. Downloads stay outside the repo (PDFs are not committed).

## Inputs

Download into a scratch folder outside the repo, for example:

```
mkdir -p ../../../scratch-accenture && cd ../../../scratch-accenture
W=https://web.archive.org/web
curl -sL -A "Mozilla/5.0" -o tv2011.pdf "$W/2015id_/http://www.accenture.com:80/SiteCollectionDocuments/PDF/Accenture_Report_TechVision2011.pdf"
curl -sL -A "Mozilla/5.0" -o tv2012.pdf "$W/20120227004947id_/http://www.accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2012.pdf"
curl -sL -A "Mozilla/5.0" -o tv2013.pdf "$W/20130228025902id_/http://www.accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2013.pdf"
curl -sL -A "Mozilla/5.0" -o tv2014.pdf "$W/20140209055114id_/http://www.accenture.com/SiteCollectionDocuments/PDF/Accenture-Technology-Vision-2014.pdf"
curl -sL -A "Mozilla/5.0" -o tv2015.pdf "$W/2016id_/http://www.accenture.com:80/SiteCollectionDocuments/PDF/Accenture-Tech-Vision-2015-Full-Report.pdf"
curl -sL -A "Mozilla/5.0" -o tv2016.pdf "$W/20160202id_/https://www.accenture.com/t20160202T102002__w__/us-en/_acnmedia/Accenture/Omobono/TechnologyVision/pdf/Technology-Trends-Technology-Vision-2016.pdf"
curl -sL -A "Mozilla/5.0" -o tv2017.pdf "$W/20170206id_/https://www.accenture.com/t20170206T064234__w__/us-en/_acnmedia/Accenture/next-gen-4/tech-vision-2017/pdf/Accenture-TV17-Full.pdf"
curl -sL -A "Mozilla/5.0" -o tv2018.pdf "$W/20180222id_/https://www.accenture.com/t20180222T121500Z__w__/us-en/_acnmedia/Accenture/next-gen-7/tech-vision-2018/pdf/Accenture-TechVision-2018-Tech-Trends-Report.pdf"
curl -sL -A "Mozilla/5.0" -o tv2019.pdf "$W/2019id_/https://www.accenture.com/_acnmedia/PDF-94/Accenture-TechVision-2019-Tech-Trends-Report.pdf"
curl -sL -A "Mozilla/5.0" -o tv2020.pdf https://www.accenture.com/content/dam/accenture/final/a-com-migration/thought-leadership-assets/accenture-technology-vision-2020-full-report.pdf
curl -sL -A "Mozilla/5.0" -o tv2021.pdf https://www.accenture.com/content/dam/accenture/final/a-com-migration/thought-leadership-assets/accenture-tech-vision-2021-full-report.pdf
curl -sL -A "Mozilla/5.0" -o tv2022en.pdf "$W/20220316203333id_/https://www.accenture.com/_acnmedia/Thought-Leadership-Assets/PDF-5/Accenture-Meet-Me-in-the-Metaverse-Full-Report.pdf"
curl -sL -A "Mozilla/5.0" -o tv2023.pdf https://www.accenture.com/content/dam/accenture/final/accenture-com/a-com-custom-component/iconic/document/Accenture-Technology-Vision-2023-Full-Report.pdf
curl -sL -A "Mozilla/5.0" -o tv2024.pdf https://www.accenture.com/content/dam/accenture/final/accenture-com/document-2/Accenture-Tech-Vision-2024.pdf
curl -sL -A "Mozilla/5.0" -o tv2025.pdf https://www.accenture.com/content/dam/accenture/final/accenture-com/document-3/Accenture-Tech-Vision-2025.pdf
curl -sL -A "Mozilla/5.0" -o p2024.html https://www.accenture.com/us-en/insights/technology/technology-trends-2024
curl -sL -A "Mozilla/5.0" -o p2025.html https://www.accenture.com/us-en/insights/technology/technology-trends-2025
```

The Wayback Machine is sometimes "Temporarily Offline"; retry after a pause. accenture.com needs a browser-like User-Agent for the live pages.

## Run

```
python3 extract.py tv2017.pdf --survey
python3 html_text.py p2025.html > p2025.txt
```

PDFs from 2017 to 2023 put sidebar survey numbers out of reading order in `pdftotext -raw` output. Check a figure's statement with `pdftotext -f <page> -l <page> -bbox file.pdf -` before recording it.
