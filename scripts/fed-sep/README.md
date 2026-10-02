# fed-sep

Builds `data/raw/fed-sep/` (Federal Reserve Summary of Economic Projections). Python 3, standard library only, plus `pdftotext` (poppler) for the SEP compilation PDFs.

## Inputs

`fetch.sh` downloads everything into a folder (default: this folder; downloaded files are gitignored or kept outside the repo):

| Folder | Source |
|---|---|
| `alfred/` | ALFRED real-time vintages, `https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=<SERIES>&vintage_date=<SEP release date>` (medians, central tendencies), latest vintage of the longer-run series and of GDPC1, PCEPI, PCEPILFE, UNRATE, DFEDTAR, DFEDTARU, DFEDTARL |
| `fed/` | Fed projection materials, accessible version, `https://www.federalreserve.gov/monetarypolicy/fomcprojtablYYYYMMDD.htm` (dot plots 2012 to 2015, September 2015 medians) |
| `sepc/` | SEP compilations of individual projections, `https://www.federalreserve.gov/monetarypolicy/files/FOMC<date>SEPcompilation.pdf`, converted to text |

## Run

```bash
./fetch.sh /path/to/scratch
```

```bash
python3 build.py /path/to/scratch
```

Writes the edition files, `realized.json` and `PROGRESS.md` to `data/raw/fed-sep/`, and `build_summary.json` (problems, per-edition statistics) to the input folder. `INDEX.md` is written by hand.

Vintage refresh (only `realized.json`; needs only `alfred/<SERIES>_latest.csv` for GDPC1, PCEPI, PCEPILFE, UNRATE, DFEDTAR, DFEDTARU, DFEDTARL):

```bash
python3 build.py --realized-only /path/to/scratch
```
