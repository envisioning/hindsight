# ipcc-pathways

Builds `data/raw/ipcc-pathways/<edition>.json` (1990, 1992, 2000, 2013, 2021). Python 3, standard library only.

## Inputs

Download into a folder outside the repo (not committed):

| File | Source |
|---|---|
| `RCP3PD_EMISSIONS.DAT`, `RCP45_EMISSIONS.DAT`, `RCP6_EMISSIONS.DAT`, `RCP85_EMISSIONS.DAT` | http://www.pik-potsdam.de/~mmalte/rcps/data/ |
| `RCP3PD_MIDYEAR_CONCENTRATIONS.DAT`, `RCP45_...`, `RCP6_...`, `RCP85_...` | same folder |
| `rcmip-emissions-annual-means-v5-1-0.csv` | https://gitlab.com/rcmip/rcmip/-/raw/master/data/protocol/rcmip-emissions-annual-means-v5-1-0.csv |
| `rcmip-concentrations-annual-means-v5-1-0.csv` | https://gitlab.com/rcmip/rcmip/-/raw/master/data/protocol/rcmip-concentrations-annual-means-v5-1-0.csv |

```bash
for s in RCP3PD RCP45 RCP6 RCP85; do
  curl -sL -A "Mozilla/5.0" -O http://www.pik-potsdam.de/~mmalte/rcps/data/${s}_EMISSIONS.DAT
  curl -sL -A "Mozilla/5.0" -O http://www.pik-potsdam.de/~mmalte/rcps/data/${s}_MIDYEAR_CONCENTRATIONS.DAT
done
for f in rcmip-emissions-annual-means-v5-1-0.csv rcmip-concentrations-annual-means-v5-1-0.csv; do
  curl -sL -A "Mozilla/5.0" -O https://gitlab.com/rcmip/rcmip/-/raw/master/data/protocol/$f
done
```

Values from PDF tables are transcribed in `build.py` with their table reference. To re-check them, read these PDFs (`pdftotext -layout`; the 1992 Table A3.1 is rotated and only readable as an image):

- FAR WG I Appendix 1 (SA90): https://www.ipcc.ch/site/assets/uploads/2018/03/ipcc_far_wg_I_app_01.pdf
- 1992 Supplementary Report (IS92, Section A3, Tables A3.1, A3.11): https://www.ipcc.ch/site/assets/uploads/2018/05/ipcc_wg_I_1992_suppl_report_full_report.pdf
- SRES full report (Appendix VII World tables) and SPM: https://www.ipcc.ch/site/assets/uploads/2018/03/emissions_scenarios-1.pdf, https://www.ipcc.ch/site/assets/uploads/2018/03/sres-en.pdf
- TAR WG I Appendix II (Tables II.1.1, II.2.1): https://www.ipcc.ch/site/assets/uploads/2018/03/TAR-APPENDICES.pdf
- AR5 WG I SPM (Box SPM.1) and Annex II: https://www.ipcc.ch/site/assets/uploads/2018/02/WG1AR5_SPM_FINAL.pdf, https://www.ipcc.ch/site/assets/uploads/2017/09/WG1AR5_AnnexII_FINAL.pdf
- AR6 WG I SPM (Box SPM.1) and Annex III (Table AIII.2): https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM.pdf, https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Annex_III.pdf

## Run

From the repo root:

```bash
python3 scripts/ipcc-pathways/build.py --in <download folder>
```

Writes the five edition files to `data/raw/ipcc-pathways/`. Entry order is fixed by the script (claim ids are positions, D15): do not reorder the tables in `build.py` after the first normalize. `INDEX.md` and `PROGRESS.md` are written by hand.

## Observed values (`observed.py`)

Writes `data/raw/ipcc-pathways/realized.json` (GCB 2025 CO2 emissions, NOAA global CO2, EDGAR CH4, Global Methane Budget top-down totals). Reuses `scripts/shell-scenarios/xlsx_dump.py`. Inputs, downloaded with `curl -sL -A "Mozilla/5.0" -o <name> <url>` into a folder outside the repo:

| File name | URL |
|---|---|
| `gcb-2025-global.xlsx` | https://globalcarbonbudget.org/download/2341/ (Global Carbon Budget v2025 xlsx, from https://globalcarbonbudget.org/datahub/the-latest-gcb-data-2025/) |
| `noaa-co2-annmean-gl.txt` | https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.txt |
| `EDGAR_CH4_1970_2025.xlsx` | unzip https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/EDGAR/datasets/EDGAR_2026_GHG/EDGAR_CH4_1970_2025.zip |

GCB 2025 projections for 2025 and the Global Methane Budget values are transcribed in the script from the paper abstracts (https://essd.copernicus.org/articles/18/3211/2026/, https://essd.copernicus.org/articles/17/1873/2025/).

```
python3 scripts/ipcc-pathways/observed.py <input_dir>
```
