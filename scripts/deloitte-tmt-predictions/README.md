# deloitte-tmt-predictions scripts

`extract.py` prints the prediction sentences ("Deloitte predicts", "we predict", "DTT TMT predicts", ...) of a Deloitte TMT Predictions PDF, with page numbers. It is a reading aid for manual capture into `data/raw/deloitte-tmt-predictions/<edition>.json`. It writes nothing.

## Inputs

Download the PDFs next to this script (PDFs are gitignored):

```
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-tmt-predictions2011.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-tmt-predictions-2012.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-TMT-Predictions2013-Final.pdf
curl -sL -A "Mozilla/5.0" -o dttl_TMT_Predictions-2014-lc2.pdf "https://web.archive.org/web/2015id_/http://www2.deloitte.com/content/dam/Deloitte/global/Documents/Technology-Media-Telecommunications/dttl_TMT_Predictions-2014-lc2.pdf"
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-tmt-pred15-full-report.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-tmt-prediction-2016-full-report.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-deloitte-2017-tmt-predictions.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/assets-shared/legacy/docs/perspectives/2022/gx-deloitte-tmt-2018-predictions-full-report.pdf
curl -sL -A "Mozilla/5.0" -O https://www.deloitte.com/content/dam/insights/articles/2019/tmt-predictions_2019/di-tmt-predictions-2019.pdf
curl -sL -A "Mozilla/5.0" -o tmt2020.pdf https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2020.html
curl -sL -A "Mozilla/5.0" -o m2010.pdf https://media.hotnews.ro/assets/document/2010/01/19/6828395-0.pdf
```

The Deloitte Insights edition URLs for 2020 to 2024 (`.../technology-media-and-telecom-predictions/<year>.html`) return the full report PDF. For those two-column PDFs, `pdftotext -raw` keeps sentences in reading order better than the default mode.

## Run

Needs `pdftotext` (poppler).

```
python3 extract.py gx-tmt-predictions2011.pdf
```

## Internet Archive inputs (2002 to 2010)

Found with the Wayback CDX API, for example:

```
curl -sL -A "Mozilla/5.0" "https://web.archive.org/cdx/search/cdx?url=deloitte.com/dtt/&matchType=prefix&filter=mimetype:application/pdf&collapse=urlkey&fl=timestamp,original,statuscode,length&limit=20000"
curl -sL -A "Mozilla/5.0" "https://web.archive.org/cdx/search/cdx?url=deloitte.com/assets/&matchType=prefix&collapse=urlkey&fl=timestamp,original,mimetype,statuscode&limit=200000"
curl -sL -A "Mozilla/5.0" "https://web.archive.org/cdx/search/cdx?url=dc.com&matchType=domain&collapse=urlkey&fl=timestamp,original,mimetype,statuscode&filter=original:.*redict.*&to=2005"
```

Download a capture byte-for-byte with the `id_` suffix: `https://web.archive.org/web/<timestamp>id_/<original>`. The capture URLs used (timestamp and original) are the `source_url` values in the 2002 to 2010 edition files, without `#page=`. Wayback answers 429 or 504 under load: wait and retry.

## report2003.py

`python3 report2003.py` appends the twelve predictions of the 2003 report (Deloitte Research, "Mobile Outlook for 2003", Internet Archive capture 20031204215942 of http://www.deloitte.com/dtt/cda/doc/content/dtt_research_mobileoutlookeurope_070103.pdf) to `2003.json`, after the press-release rows. It refuses to run twice. The quotes are transcribed in the script.

## findpage.py

`python3 findpage.py <file.pdf> "<quote>"` prints the PDF page holding a quote (for the `#page=` anchor), ignoring case, spacing and punctuation; "..." splits a quote into parts that must share a page. `python3 findpage.py <file.pdf> --check <edition.json> <source_url prefix>` re-checks the anchors of an edition's entries from that PDF. It writes nothing.
