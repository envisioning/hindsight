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
