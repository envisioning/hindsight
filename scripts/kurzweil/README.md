# Kurzweil capture script

Builds `data/raw/kurzweil/*.json` (editions 1990, 1999, 2005, 2010, 2024) and `self_assessment.json`.

## Inputs

Put these next to this script. They are gitignored (`*.pdf`, `*.csv`).

| File | What | URL |
|---|---|---|
| `faring.pdf` | Ray Kurzweil, "How My Predictions Are Faring", October 2010 (148 pages) | https://www.thekurzweillibrary.com/images/How-My-Predictions-Are-Faring.pdf |
| `kurzweil_2019.csv` | 105 statements for 2019 from The Age of Spiritual Machines, tab-separated (saved as .csv so git ignores it) | https://www.dropbox.com/s/jmvciqv7u3rs7x5/Kurzweil_2019.tsv?dl=1 (linked from https://www.lesswrong.com/posts/NcGBmDEe5qXB7dFBF/assessing-kurzweil-predictions-about-2019-the-results) |

## Download

```
curl -sL -A "Mozilla/5.0" -o faring.pdf https://www.thekurzweillibrary.com/images/How-My-Predictions-Are-Faring.pdf
curl -sL -A "Mozilla/5.0" -o kurzweil_2019.csv "https://www.dropbox.com/s/jmvciqv7u3rs7x5/Kurzweil_2019.tsv?dl=1"
```

## Run

Needs `pdftotext` (poppler).

```
python3 build.py
```

The script parses the essay's numbered items ("N. Category | Title", "PREDICTION:", "ACCURACY:"), asserts 147 items for 2009 and 10 for 2010, and writes the edition files. Entries without a machine-readable source (1990, parts of 2005, 2010, 2024) are typed in `build.py`.
