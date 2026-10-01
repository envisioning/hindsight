# NIC Global Trends capture scripts

Builds `data/raw/nic-global-trends/<edition>.json` from hand-written specs, checking every quote against the downloaded text.

## Inputs

dni.gov and archive.dni.gov return 403 to scripts, so every input comes from the Wayback Machine (`id_` URLs give the original bytes).

| Edition | File | URL |
|---|---|---|
| 1997 (GT2010) | `gt2010.html` | https://web.archive.org/web/20191208013221id_/https://www.dni.gov/index.php/who-we-are/organizations/mission-integration/nic/nic-related-menus/nic-related-content/global-trends-2010 |
| 2000 (GT2015) | `gt2015.pdf` | https://web.archive.org/web/20030617174230id_/http://www.cia.gov:80/cia/reports/globaltrends2015/globaltrends2015.pdf |
| 2004 (GT2020) | `gt2020_{es,intro,meth,s1,s2,s3,s4,imp}.html` | https://web.archive.org/web/2006id_/http://www.dni.gov:80/nic/NIC_globaltrend2020_es.html (and `_intro`, `_meth`, `_s1` to `_s4`, `_imp`) |
| 2008 (GT2025) | `gt2025.pdf` | https://web.archive.org/web/20081122005637id_/http://www.dni.gov/nic/PDF_2025/2025_Global_Trends_Final_Report.pdf |
| 2012 (GT2030) | `gt2030.pdf` | https://web.archive.org/web/20130217221556id_/http://www.dni.gov/files/documents/GlobalTrends_2030.pdf |
| 2017 (Paradox of Progress) | `gt2035.pdf` | https://web.archive.org/web/20170427081735id_/https://www.dni.gov/files/documents/nic/GT-Full-Report.pdf |
| 2021 (GT2040) | `gt2040.pdf` | https://web.archive.org/web/20210408143540id_/https://www.dni.gov/files/ODNI/documents/assessments/GlobalTrends_2040.pdf |

Download into a scratch folder outside the repo, for example:

```sh
mkdir -p /tmp/nic && cd /tmp/nic
curl -sL -A "Mozilla/5.0" -o gt2030.pdf "https://web.archive.org/web/20130217221556id_/http://www.dni.gov/files/documents/GlobalTrends_2030.pdf"
```

The Wayback Machine is slow and sometimes answers with an empty body or "Temporarily Offline"; retry. Check with `file *.pdf` that each PDF is a PDF.

## Run

Requires Python 3 (standard library) and poppler's `pdftotext`.

```sh
python3 extract.py /tmp/nic            # writes <name>.txt next to each .pdf/.html
python3 build.py specs/2012.json /tmp/nic
```

`build.py` fails if a `high`-confidence quote is not found in the text (case, whitespace, hyphens, curly quotes, dashes and fi/fl ligatures are folded), or a quote is over 400 characters. Entries are written in text order (print order) unless the spec sets `"order_by_text": false` (used for 2000, whose PDF text layer puts Scenario Two before Scenario One). It refuses to overwrite an existing edition file without `--force`, because claim ids are row positions (D15). Do not use `--force` after the edition has been normalized.

The specs in `specs/` are the source of truth for the extraction (labels, quotes, notes); the edition files are their checked output.
