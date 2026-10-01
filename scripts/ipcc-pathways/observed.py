"""Observed values for the IPCC pathway metrics, 1990-2025 -> data/raw/ipcc-pathways/realized.json.

Standard library only (reuses scripts/shell-scenarios/xlsx_dump.py). Inputs (names as in
README.md, section "Observed values"):
  gcb-2025-global.xlsx         Global Carbon Budget 2025, global budget workbook
  noaa-co2-annmean-gl.txt      NOAA GML global annual mean CO2
  EDGAR_CH4_1970_2025.xlsx     EDGAR_2026_GHG CH4 totals by country (from EDGAR_CH4_1970_2025.zip)

Values printed only in paper abstracts (GCB 2025 projections for 2025, Global Methane
Budget 2000-2020 top-down totals) are transcribed below with their source.

Usage: python3 scripts/ipcc-pathways/observed.py INPUT_DIR [OUT_JSON]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "shell-scenarios"))
import xlsx_dump  # noqa: E402

YEARS = range(1990, 2026)
C2CO2 = 3.664  # GCB conversion factor, stated in the workbook

GCB_URL = "https://globalcarbonbudget.org/download/2341/"
GCB_PAGE = "https://globalcarbonbudget.org/datahub/the-latest-gcb-data-2025/"
GCB_PAPER = "https://essd.copernicus.org/articles/18/3211/2026/"
GCB_V = "Global Carbon Budget 2025 (Friedlingstein et al. 2025), Global_Carbon_Budget_2025 workbook as served by globalcarbonbudget.org (file modified 2025-11-05), data to 2024"
NOAA_URL = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_gl.txt"
EDGAR_URL = "https://jeodpp.jrc.ec.europa.eu/ftp/jrc-opendata/EDGAR/datasets/EDGAR_2026_GHG/EDGAR_CH4_1970_2025.zip"
EDGAR_PAGE = "https://edgar.jrc.ec.europa.eu/dataset_ghg2026"
GMB_PAPER = "https://essd.copernicus.org/articles/17/1873/2025/"

FOSSIL_DEF = ("GCB fossil emissions excluding the cement carbonation sink: fossil fuel combustion (coal, oil, gas) "
              "+ cement production + flaring + other industrial; includes international bunkers. Matches the IPCC "
              "'fossil fuels and industry' metric (IS92 energy+cement, SRES fossil fuel CO2, RCP fossil & industrial, SSP fossil and industrial).")
LUC_DEF = ("GCB land-use change emissions (ELUC): mean of three bookkeeping models (BLUE, OSCAR, LUCE). "
           "Bookkeeping ELUC is not the same quantity as IAM or national-inventory land-use CO2 in the scenarios.")
TOTAL_DEF = ("GCB fossil emissions excluding carbonation sink + ELUC (sum computed here). Matches the IPCC 'total CO2' metric "
             "(IS92 'energy, deforestation, cement', SRES 'Total CO2 (fossil fuel and other)').")


def xlsx_rows(path, sheet):
    z, shared, sheets = xlsx_dump.load(path)
    return list(xlsx_dump.rows(z, shared, dict(sheets)[sheet]))


def e(series, subject, metric, year, value, unit, publisher, url, vintage, definition, matches, conf, nd=4, **kw):
    r = {"series": series, "subject": subject, "metric": metric, "year": year, "value": round(value, nd), "unit": unit,
         "publisher": publisher, "source_url": url, "vintage": vintage, "definition": definition,
         "matches_ipcc_metric": matches, "confidence": conf}
    r.update({k: v for k, v in kw.items() if v is not None})
    return r


def gcb(path):
    rows = xlsx_rows(path, "Global Carbon Budget")
    hdr_i = next(i for i, r in enumerate(rows) if r and r[0].strip() == "Year")
    hdr = [c.strip() for c in rows[hdr_i]]
    ci = {h: i for i, h in enumerate(hdr)}
    out = {}
    for r in rows[hdr_i + 1:]:
        if r and r[0].strip().isdigit():
            y = int(r[0])
            out[y] = {h: float(r[i]) for h, i in ci.items() if h != "Year" and i < len(r) and r[i] != ""}
    return out, hdr_i + 1


def noaa(path):
    out = {}
    for line in open(path, encoding="utf-8"):
        if line.startswith("#") or not line.strip():
            continue
        p = line.split()
        out[int(p[0])] = (float(p[1]), float(p[2]))
    created = next((l.split(":", 1)[1].strip() for l in open(path, encoding="utf-8") if l.startswith("# File Creation")), "")
    return out, created


def edgar(path):
    rows = xlsx_rows(path, "TOTALS BY COUNTRY")
    hi = next(i for i, r in enumerate(rows) if "Y_1990" in r)
    hdr = rows[hi]
    cols = {int(h[2:]): i for i, h in enumerate(hdr) if h.startswith("Y_")}
    sub = hdr.index("Substance")
    tot = {y: 0.0 for y in cols}
    n = 0
    for r in rows[hi + 1:]:
        if len(r) > sub and r[sub] == "CH4":
            n += 1
            for y, i in cols.items():
                if i < len(r) and r[i] not in ("", "NULL"):
                    tot[y] += float(r[i])
    return tot, n


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "inputs"
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "..", "..", "data", "raw", "ipcc-pathways", "realized.json")
    ent = []

    g, first = gcb(os.path.join(src, "gcb-2025-global.xlsx"))
    pos = "sheet 'Global Carbon Budget', columns 'fossil emissions excluding carbonation', 'land-use change emissions', 'cement carbonation sink'"
    for y in YEARS:
        if y not in g:
            continue
        f, l, cs = g[y]["fossil emissions excluding carbonation"], g[y]["land-use change emissions"], g[y]["cement carbonation sink"]
        F, L, T = "global CO2 emissions from fossil fuels and industry", "global land-use change CO2 emissions", "global total CO2 emissions"
        for unit, k in (("GtC/yr", 1.0), ("Gt CO2/yr", C2CO2)):
            ent.append(e("gcb", F, "fossil and industrial CO2 emissions (excluding cement carbonation sink)", y, f * k, unit, "Global Carbon Project", GCB_URL, GCB_V, FOSSIL_DEF, "fossil and industrial", "high", position=pos, source_page=GCB_PAGE))
            ent.append(e("gcb", L, "land-use change CO2 emissions (ELUC)", y, l * k, unit, "Global Carbon Project", GCB_URL, GCB_V, LUC_DEF, "land use (component of total)", "high", position=pos, source_page=GCB_PAGE))
            ent.append(e("gcb", T, "total anthropogenic CO2 emissions (fossil and industrial + land-use change)", y, (f + l) * k, unit, "Global Carbon Project", GCB_URL, GCB_V, TOTAL_DEF, "total", "high", derived="sum of the two GCB columns", position=pos, source_page=GCB_PAGE))
        ent.append(e("gcb", "cement carbonation sink", "cement carbonation sink", y, cs, "GtC/yr", "Global Carbon Project", GCB_URL, GCB_V,
                     "CO2 reabsorbed by cement over its lifetime; GCB headline 'fossil emissions' = fossil and industrial minus this sink.", "none (for netting only)", "high", position=pos, source_page=GCB_PAGE))

    # GCB 2025 projections for 2025 (abstract of the ESSD paper, published 2026-05-13). Headline EFOS includes the carbonation sink.
    proj = [
        ("global CO2 emissions from fossil fuels and industry", "fossil CO2 emissions, net of cement carbonation sink (GCB headline EFOS), projection", 10.4, 38.1,
         "GCB headline EFOS = fossil and industrial minus cement carbonation sink (about 0.2 GtC). Projection for the year of publication.", "fossil and industrial (net of carbonation, about 0.2 GtC below the gross series)"),
        ("global land-use change CO2 emissions", "land-use change CO2 emissions (ELUC), projection", 1.1, 4.1, LUC_DEF + " Projection.", "land use (component of total)"),
        ("global total CO2 emissions", "total anthropogenic CO2 emissions, projection", 11.5, 42.2, "GCB EFOS (net of carbonation sink) + ELUC. Projection.", "total (net of carbonation)"),
    ]
    for subj, metric, gtc, gtco2, d, m in proj:
        for unit, v in (("GtC/yr", gtc), ("Gt CO2/yr", gtco2)):
            ent.append(e("gcb_projection", subj, metric, 2025, v, unit, "Global Carbon Project", GCB_PAPER,
                         "Global Carbon Budget 2025, ESSD 18, 3211 (2026), abstract; projection for 2025", d, m, "medium", nd=2, projection=True))

    co2, created = noaa(os.path.join(src, "noaa-co2-annmean-gl.txt"))
    for y in YEARS:
        if y in co2:
            ent.append(e("noaa", "atmospheric CO2 concentration", "global annual mean CO2 (marine surface sites)", y, co2[y][0], "ppm", "NOAA Global Monitoring Laboratory",
                         NOAA_URL, f"NOAA GML co2_annmean_gl.txt, file creation {created}",
                         "NOAA global mean of marine boundary layer surface sites, dry-air mole fraction, WMO X2019 scale. Matches 'CO2 concentration, annual global mean' (RCP, SSP); SRES ISAM and IS92 values are model outputs.",
                         "atmospheric CO2 concentration", "high", nd=2, uncertainty=co2[y][1]))

    ch4, n = edgar(os.path.join(src, "EDGAR_CH4_1970_2025.xlsx"))
    for y in YEARS:
        if y in ch4:
            ent.append(e("edgar", "global CH4 emissions", "anthropogenic CH4 emissions (EDGAR, all sectors)", y, ch4[y] / 1000.0, "Mt CH4/yr", "European Commission JRC (EDGAR)",
                         EDGAR_URL, "EDGAR_2026_GHG (2026), EDGAR CH4 1970-2025",
                         f"Sum of all {n} rows of 'TOTALS BY COUNTRY' (countries + international aviation and shipping), Gg converted to Mt. Anthropogenic only: energy, agriculture, waste, industry, agricultural waste burning; excludes wildfires and savanna/forest burning and all natural sources.",
                         "anthropogenic CH4 (SRES, RCP, SSP); not IS92a 'total including natural'", "high", nd=2,
                         note="RCP and SSP CH4 include open biomass burning (about 15-30 Mt/yr), which EDGAR leaves out; EDGAR is therefore slightly low against those definitions.",
                         source_page=EDGAR_PAGE))

    gmb_v = "Global Methane Budget 2000-2020 (Saunois et al. 2025, ESSD 17, 1873), abstract"
    for metric, ys, ye, v, lo, hi, d, m in (
        ("total CH4 emissions, top-down (atmospheric inversions), decadal mean", 2010, 2019, 575, 553, 586,
         "Anthropogenic plus natural sources, top-down estimate, 2010-2019 mean.", "total including natural (IS92a 'CH4 emissions, total including natural')"),
        ("total CH4 emissions, top-down (atmospheric inversions)", 2020, 2020, 608, 581, 627,
         "Anthropogenic plus natural sources, top-down estimate, year 2020.", "total including natural (IS92a 'CH4 emissions, total including natural')"),
        ("direct anthropogenic CH4 emissions, top-down, decadal mean", 2010, 2019, 369, 350, 391,
         "Direct anthropogenic sources (fossil fuels, agriculture and waste, biomass and biofuel burning), top-down, 2010-2019 mean.", "anthropogenic CH4 (top-down cross-check)"),
    ):
        ent.append(e("gmb", "global CH4 emissions", metric, ye if ys == ye else None, v, "Mt CH4/yr", "Global Carbon Project (Global Methane Budget)", GMB_PAPER,
                     gmb_v, d, m, "medium", nd=0, period=[ys, ye], range=[lo, hi],
                     note=("Decadal mean, not a single-year value; 'year' is null. " if ys != ye else "") + "Per-year top-down series is in the GMB data at ICOS (doi 10.18160/GKQ9-2RHT), behind a licence click-through; not fetched."))

    ent.sort(key=lambda r: (r["subject"], r["metric"], r["unit"], r["year"] if r["year"] is not None else 0))
    doc = {
        "subject": "Observed values for the IPCC pathway metrics (CO2 emissions, CO2 concentration, CH4 emissions), 1990-2025",
        "status": "complete",
        "retrieved": "2026-10-01",
        "sources": [GCB_URL, GCB_PAGE, GCB_PAPER, NOAA_URL, EDGAR_URL, EDGAR_PAGE, GMB_PAPER],
        "notes": [
            "Each row carries 'definition' and 'matches_ipcc_metric'. Fossil and industrial = GCB 'fossil emissions excluding carbonation' (gross); total = that + ELUC.",
            "GCB 2025 workbook data end in 2024. 2025 values are the paper's projections (series 'gcb_projection', projection: true), on the headline basis net of the cement carbonation sink.",
            "The ICOS v1.0 copy of the GCB 2025 workbook (May 2026) sits behind a licence click-through and was not fetched; the globalcarbonbudget.org copy (November 2025 release) was used.",
            "IS92a CH4 'total including natural' (155 Tg natural) can only be compared with the Global Methane Budget top-down totals (2010-2019 mean, 2020). All other IPCC CH4 metrics are anthropogenic: compare with EDGAR.",
            "1 GtC = 3.664 Gt CO2 (GCB factor).",
            "EDGAR_2026 global CH4 is about 330 Mt in 2023 (EDGAR_2025 gives the same), below the Global Methane Budget top-down direct anthropogenic estimate (369 Mt, 2010-2019 mean). Coverage differs (no open biomass burning in EDGAR).",
        ],
        "entries": ent,
    }
    with open(out_path, "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
        f.write("\n")
    print(out_path, len(ent))


if __name__ == "__main__":
    main()
