#!/usr/bin/env python3
"""Build data/raw/ipcc-pathways/<edition>.json from IPCC scenario tables.

Standard library only. Usage (from the repo root):

    python3 scripts/ipcc-pathways/build.py --in <download dir>

The download dir holds the RCP data files and the RCMIP CSVs listed in README.md.
Values from scanned or PDF tables (SA90, IS92, SRES, TAR, AR6 Annex III) are
transcribed below with their table reference; the PDFs are only needed to re-check them.
"""
import argparse
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "data", "raw", "ipcc-pathways"))
YEARS = (2000, 2005, 2010, 2015, 2020, 2025)

S_CO2FF = "global CO2 emissions from fossil fuels and industry"
S_CO2T = "global total CO2 emissions"
S_CH4 = "global CH4 emissions"
S_CONC = "atmospheric CO2 concentration"
S_PREM = "global greenhouse gas emissions pathway"

URL = {
    "far_app1": "https://www.ipcc.ch/site/assets/uploads/2018/03/ipcc_far_wg_I_app_01.pdf",
    "far_annex": "https://www.ipcc.ch/site/assets/uploads/2018/03/ipcc_far_wg_I_annex.pdf",
    "is92": "https://www.ipcc.ch/site/assets/uploads/2018/05/ipcc_wg_I_1992_suppl_report_full_report.pdf",
    "sres": "https://www.ipcc.ch/site/assets/uploads/2018/03/emissions_scenarios-1.pdf",
    "sres_spm": "https://www.ipcc.ch/site/assets/uploads/2018/03/sres-en.pdf",
    "tar_app": "https://www.ipcc.ch/site/assets/uploads/2018/03/TAR-APPENDICES.pdf",
    "ar5_spm": "https://www.ipcc.ch/site/assets/uploads/2018/02/WG1AR5_SPM_FINAL.pdf",
    "ar5_annex2": "https://www.ipcc.ch/site/assets/uploads/2017/09/WG1AR5_AnnexII_FINAL.pdf",
    "rcp_data": "http://www.pik-potsdam.de/~mmalte/rcps/data/",
    "ar6_spm": "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM.pdf",
    "ar6_annex3": "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Annex_III.pdf",
    "rcmip_em": "https://gitlab.com/rcmip/rcmip/-/raw/master/data/protocol/rcmip-emissions-annual-means-v5-1-0.csv",
    "rcmip_conc": "https://gitlab.com/rcmip/rcmip/-/raw/master/data/protocol/rcmip-concentrations-annual-means-v5-1-0.csv",
}


def scen(scenario, family, quote, url, confidence="high", note=None, position=None):
    e = {"kind": "scenario", "scenario": scenario, "family": family, "subject": S_PREM,
         "metric": "premise", "value": None, "unit": None, "target_year": None,
         "quote": quote, "source_url": url, "confidence": confidence}
    if position:
        e["position"] = position
    if note:
        e["note"] = note
    assert len(quote) <= 400, (scenario, len(quote))
    return e


def path(scenario, family, subject, metric, value, unit, year, url, position,
         confidence="high", note=None, **extra):
    e = {"kind": "pathway", "scenario": scenario, "family": family, "subject": subject,
         "metric": metric, "value": value, "unit": unit, "target_year": year,
         "source_url": url, "position": position, "confidence": confidence}
    e.update(extra)
    if note:
        e["note"] = note
    return e


def write(edition, meta, entries):
    doc = {"edition": edition}
    doc.update(meta)
    doc["entries"] = entries
    with open(os.path.join(OUT, f"{edition}.json"), "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
        f.write("\n")
    return len(entries)


# ---------------------------------------------------------------- 1990 SA90
def sa90():
    fam = "SA90"
    pos = "FAR WG I Appendix 1"
    oc = "Scanned page; quote follows the OCR text with obvious scan errors corrected."
    e = [
        scen("SA90 Business-as-Usual (Scenario A)", fam,
             "In the Business-as-Usual Scenario (Scenario A) the energy supply is coal intensive and on the demand side only modest efficiency increases are achieved. Carbon monoxide controls are modest, deforestation continues until the tropical forests are depleted and agricultural emissions of methane and nitrous oxide are uncontrolled.",
             URL["far_app1"], "medium", oc, pos),
        scen("SA90 Scenario B", fam,
             "In Scenario B the energy supply mix shifts towards lower carbon fuels, notably natural gas. Large efficiency increases are achieved. Carbon monoxide controls are stringent, deforestation is reversed and the Montreal Protocol implemented with full participation.",
             URL["far_app1"], "medium", oc, pos),
        scen("SA90 Scenario C", fam,
             "In Scenario C a shift towards renewables and nuclear energy takes place in the second half of next century. CFCs are now phased out and agricultural emissions limited.",
             URL["far_app1"], "medium", oc, pos),
        scen("SA90 Scenario D", fam,
             "For Scenario D a shift to renewables and nuclear in the first half of the next century reduces the emissions of carbon dioxide, initially more or less stabilizing emissions in the industrialized countries. ... Carbon dioxide emissions are reduced to 50% of 1985 levels by the middle of the next century.",
             URL["far_app1"], "medium", oc, pos),
    ]
    meta = {
        "published": "1990",
        "status": "partial",
        "sources": [URL["far_app1"], URL["far_annex"]],
        "publisher": "Intergovernmental Panel on Climate Change (IPCC), Working Group I (scenarios from Working Group III)",
        "series": "IPCC emission scenarios: SA90 (First Assessment Report)",
        "scenario_count": 4,
        "notes": "Premises only. SA90 emissions of CO2 and CH4 are printed only as figures (FAR WG I Annex Figures A.2a/b) and concentrations as figures A.3; no table with values for 2000-2025 was found in FAR WG I. Values were not read off the figures (no interpolation, no figure reproduction). The WG III report (1990) and the Expert Group on Emissions Scenarios report were not checked.",
    }
    return write("1990", meta, e)


# ---------------------------------------------------------------- 1992 IS92
def is92():
    fam = "IS92"
    u = URL["is92"]
    e = [
        scen("IS92a", fam,
             "IS92a includes only those policies affecting greenhouse gas emissions which are agreed internationally or enacted into national laws (as of December 1991). [Table A3.1: World Bank 1991, 11.3 B by 2100; economic growth 1990-2025: 2.9%, 1990-2100: 2.3%; 12,000 EJ Conventional Oil, 13,000 EJ Natural Gas]",
             u, position="Section A3.10 and Table A3.1",
             note="Bracketed part is from Table A3.1 (read from the page image)."),
        scen("IS92b", fam,
             "IS92b, a modification of IS92a, suggests that current commitments by many OECD Member countries to stabilize or reduce CO2 might have a small impact on greenhouse gas emissions over the next few decades, but would not offset the substantial growth in the rest of the world.",
             u, position="Section A3, Executive Summary"),
        scen("IS92c", fam,
             "IS92c has a CO2 emission path which eventually falls below its 1990 starting level. It assumes that population grows, then declines by the middle of the next century, that economic growth is low, and that there are severe constraints on fossil fuel supplies.",
             u, position="Section A3, Executive Summary"),
        scen("IS92d", fam,
             "IS92d | UN Medium-Low Case, 6.4 B by 2100 | 1990-2025 2.7%, 1990-2100 2.0% | Oil and gas same as \"c\"; Solar costs fall to $0.065/kWh; 272 EJ of biofuels available at $50/barrel | Emission controls extended worldwide for CO, NOx, NMVOC and SOx. Halt deforestation. Capture and use of emissions from coal mining and gas production and use.",
             u, position="Table A3.1",
             note="Table row, cells joined with '|'; read from the page image (the OCR text of this rotated table is unusable)."),
        scen("IS92e", fam,
             "The highest greenhouse gas levels result from IS92e which combines, among other assumptions, moderate population growth, high economic growth, high fossil fuel availability and eventual hypothetical phase-out of nuclear power.",
             u, position="Section A3, Executive Summary"),
        scen("IS92f", fam,
             "IS92f | UN Medium-High Case, 17.6 B by 2100 | 1990-2025: 2.9%, 1990-2100: 2.3% | Oil and gas same as \"e\"; Solar costs fall to $0.083/kWh; Nuclear costs increase to $0.09/kWh | Other: Same as \"a\" | CFCs: Same as \"a\"",
             u, position="Table A3.1",
             note="Table row, cells joined with '|'; read from the page image."),
        # IS92a, Table A3.11 (global emissions under IS92a): 1990, 2000, 2025, 2050, 2100.
        path("IS92a", fam, S_CO2FF, "CO2 emissions, energy", 7.0, "GtC/yr", 2000, u, "Table A3.11",
             note="Energy only; cement is a separate row (0.2 GtC in 2000). Base year of the scenario is 1990, so 2000 is a projection."),
        path("IS92a", fam, S_CO2FF, "CO2 emissions, energy", 10.7, "GtC/yr", 2025, u, "Table A3.11",
             note="Energy only; cement is a separate row (0.4 GtC in 2025)."),
        path("IS92a", fam, S_CO2T, "CO2 emissions, total (energy, deforestation, cement)", 8.4, "GtC/yr", 2000, u, "Table A3.11"),
        path("IS92a", fam, S_CO2T, "CO2 emissions, total (energy, deforestation, cement)", 12.2, "GtC/yr", 2025, u, "Table A3.11"),
        path("IS92a", fam, S_CH4, "CH4 emissions, total including natural", 545, "Tg CH4/yr", 2000, u, "Table A3.11",
             note="Total includes a constant natural source of 155 Tg. Not comparable with anthropogenic-only series without removing it."),
        path("IS92a", fam, S_CH4, "CH4 emissions, total including natural", 659, "Tg CH4/yr", 2025, u, "Table A3.11",
             note="Total includes a constant natural source of 155 Tg."),
        path("IS92a and IS92b", fam, S_CO2FF, "CO2 emissions from fossil fuels, range of IS92a and IS92b", "10.3-10.7", "GtC/yr", 2025, u,
             "Section A3.10 (Conclusions)",
             quote="IS92a and b, which most resemble the SA90 in terms of assumptions for key parameters, show a range of emissions of 10.3 to 10.7 GtC in 2025, and 18.6 to 19.8 GtC in 2100.",
             note="Range over two scenarios. The per-scenario IS92b value is not printed as text or table."),
        path("IS92a-f", fam, S_CO2FF, "CO2 emissions from fossil fuels, range of the six IS92 scenarios", "7-14", "GtC/yr", 2025, u,
             "Section A3.10 (Conclusions)",
             quote="The range of emissions estimated for the wider set of alternative scenarios is 7 to 14 GtC in 2025 and 5 to 35 GtC in 2100.",
             note="Range over all six scenarios. Per-scenario values for IS92b-f appear only in figures (Section A3); not read."),
        # IS92a as restated by the IPCC TAR (2001), Appendix II.
        path("IS92a", fam, S_CO2FF, "CO2 emissions from fossil fuel and industrial processes", 8.68, "GtC/yr", 2010, URL["tar_app"],
             "TAR WG I Appendix II, Table II.1.1", published_in="IPCC TAR WG I Appendix II (2001)",
             note="Restated by the IPCC in 2001; the 1992 report prints no 2010 value. TAR may have interpolated it from the IS92a data. TAR's IS92a 2000 value is 7.1."),
        path("IS92a", fam, S_CO2FF, "CO2 emissions from fossil fuel and industrial processes", 10.26, "GtC/yr", 2020, URL["tar_app"],
             "TAR WG I Appendix II, Table II.1.1", published_in="IPCC TAR WG I Appendix II (2001)",
             note="Restated by the IPCC in 2001; the 1992 report prints no 2020 value."),
        path("IS92a", fam, S_CONC, "CO2 concentration, as reported in the SAR", 372, "ppm", 2000, URL["tar_app"],
             "TAR WG I Appendix II, Table II.2.1, column IS92a/SAR", published_in="IPCC SAR (1995), as restated in TAR WG I Appendix II (2001)",
             confidence="medium", note="Concentrations were not published in the 1992 report. TAR labels this column 'values as reported in the SAR using IS92a emissions'. Values are for the beginning of the year."),
        path("IS92a", fam, S_CONC, "CO2 concentration, as reported in the SAR", 393, "ppm", 2010, URL["tar_app"],
             "TAR WG I Appendix II, Table II.2.1, column IS92a/SAR", published_in="IPCC SAR (1995), as restated in TAR WG I Appendix II (2001)",
             confidence="medium"),
        path("IS92a", fam, S_CONC, "CO2 concentration, as reported in the SAR", 418, "ppm", 2020, URL["tar_app"],
             "TAR WG I Appendix II, Table II.2.1, column IS92a/SAR", published_in="IPCC SAR (1995), as restated in TAR WG I Appendix II (2001)",
             confidence="medium"),
    ]
    meta = {
        "published": "1992",
        "status": "partial",
        "sources": [u, URL["tar_app"]],
        "publisher": "Intergovernmental Panel on Climate Change (IPCC), Working Group I",
        "series": "IPCC emission scenarios: IS92 (1992 Supplementary Report, Section A3 'Emissions Scenarios for the IPCC: an Update')",
        "scenario_count": 6,
        "notes": "Six scenarios IS92a-f. Only IS92a has a table of global emissions (Tables A3.7, A3.11, A3.12: 1990, 2000, 2025, 2050, 2100). IS92b-f values are printed only in figures, so they are captured as the published ranges. IS92a values for 2010 and 2020 and CO2 concentrations are IPCC restatements from TAR WG I Appendix II (2001), flagged with published_in.",
    }
    return write("1992", meta, e)


# ---------------------------------------------------------------- 2000 SRES
SRES_EM = {  # SRES Appendix VII, World table, 'Anthropogenic Emissions (standardized)': 2000, 2010, 2020
    "A1B": ("A1", "Marker Scenario A1B-AIM", {"ff": (6.90, 9.68, 12.12), "tot": (7.97, 10.88, 12.64), "ch4": (323, 373, 421)}),
    "A1FI": ("A1", "Illustrative Scenario A1FI-MiniCAM", {"ff": (6.90, 8.65, 11.19), "tot": (7.97, 9.73, 12.73), "ch4": (323, 359, 416)}),
    "A1T": ("A1", "Illustrative Scenario A1T-MESSAGE", {"ff": (6.90, 8.33, 10.00), "tot": (7.97, 9.38, 10.26), "ch4": (323, 362, 415)}),
    "A2": ("A2", "Marker Scenario A2-ASF", {"ff": (6.90, 8.46, 11.01), "tot": (7.97, 9.58, 12.25), "ch4": (323, 370, 424)}),
    "B1": ("B1", "Marker Scenario B1-IMAGE", {"ff": (6.90, 8.50, 10.00), "tot": (7.97, 9.28, 10.63), "ch4": (323, 349, 377)}),
    "B2": ("B2", "Marker Scenario B2-MESSAGE", {"ff": (6.90, 7.99, 9.02), "tot": (7.97, 8.78, 9.05), "ch4": (323, 349, 384)}),
}
# TAR WG I Appendix II Table II.2.1, ISAM model (reference), CO2 abundances: 2000, 2010, 2020
SRES_CONC = {"A1B": (369, 391, 420), "A1FI": (369, 389, 417), "A1T": (369, 389, 412),
             "A2": (369, 390, 417), "B1": (369, 388, 412), "B2": (369, 388, 408)}
SRES_PREMISE = {
    "A1": "The A1 storyline and scenario family describes a future world of very rapid economic growth, global population that peaks in mid-century and declines thereafter, and the rapid introduction of new and more efficient technologies.",
    "A2": "The A2 storyline and scenario family describes a very heterogeneous world. The underlying theme is self-reliance and preservation of local identities. Fertility patterns across regions converge very slowly, which results in continuously increasing global population.",
    "B1": "The B1 storyline and scenario family describes a convergent world with the same global population that peaks in mid-century and declines thereafter, as in the A1 storyline, but with rapid changes in economic structures toward a service and information economy, with reductions in material intensity, and the introduction of clean and resource-efficient technologies.",
    "B2": "The B2 storyline and scenario family describes a world in which the emphasis is on local solutions to economic, social, and environmental sustainability. It is a world with continuously increasing global population at a rate lower than A2, intermediate levels of economic development, and less rapid and more diverse technological change than in the B1 and A1 storylines.",
}
SRES_A1_GROUP = {
    "A1B": "distinguished by their technological emphasis: fossil intensive (A1FI), non-fossil energy sources (A1T), or a balance across all sources (A1B).",
}


def sres():
    u = URL["sres"]
    e = []
    for name, (fam, label, v) in SRES_EM.items():
        if fam == "A1":
            q = SRES_PREMISE["A1"] + " ... " + SRES_A1_GROUP["A1B"]
        else:
            q = SRES_PREMISE[fam]
        e.append(scen(name, fam, q, URL["sres_spm"], position="SRES Summary for Policymakers, storylines",
                      note=f"Published as '{label}'. The quote describes the {fam} family" + (" and its three technology groups." if fam == "A1" else ".")))
        pos = f"SRES Appendix VII, {label}, World, Anthropogenic Emissions (standardized)"
        for i, y in enumerate((2000, 2010, 2020)):
            n = "SRES base year is 1990; the 2000 value is standardized across scenarios and is a projection." if y == 2000 else None
            e.append(path(name, fam, S_CO2FF, "Fossil Fuel CO2", v["ff"][i], "GtC/yr", y, u, pos, note=n))
        for i, y in enumerate((2000, 2010, 2020)):
            e.append(path(name, fam, S_CO2T, "Total CO2 (fossil fuel and other)", v["tot"][i], "GtC/yr", y, u, pos))
        for i, y in enumerate((2000, 2010, 2020)):
            e.append(path(name, fam, S_CH4, "CH4 total", v["ch4"][i], "Mt CH4/yr", y, u, pos))
        for i, y in enumerate((2000, 2010, 2020)):
            e.append(path(name, fam, S_CONC, "CO2 abundance, ISAM model (reference)", SRES_CONC[name][i], "ppm", y, URL["tar_app"],
                          "TAR WG I Appendix II, Table II.2.1", published_in="IPCC TAR WG I Appendix II (2001)",
                          note="SRES itself publishes no concentrations; this is the IPCC TAR projection from SRES emissions (ISAM reference case; Bern-CC values differ slightly). TAR also prints low and high ISAM cases."))
    meta = {
        "published": "2000-03",
        "status": "complete",
        "sources": [u, URL["sres_spm"], URL["tar_app"]],
        "publisher": "Intergovernmental Panel on Climate Change (IPCC), Working Group III",
        "series": "IPCC Special Report on Emissions Scenarios (SRES)",
        "scenario_count": 6,
        "notes": "Six illustrative scenarios (markers A1B, A2, B1, B2 and illustrative A1FI, A1T) of the 40 SRES scenarios. SRES prints decadal values (1990, 2000, 2010, ...), so 2005, 2015 and 2025 are absent. Emission values match TAR WG I Appendix II Table II.1.1/II.1.2 exactly. CO2 concentrations are from TAR (2001), flagged with published_in. The other 34 SRES scenarios are not captured.",
    }
    return write("2000", meta, e)


# ---------------------------------------------------------------- 2013 RCP
def read_dat(fn):
    rows = {}
    cols = None
    with open(fn, encoding="latin-1") as f:
        for line in f:
            p = line.split()
            if p and p[0] == "YEARS":
                cols = p[1:]
                continue
            if cols and p and p[0].isdigit() and len(p) == len(cols) + 1:
                rows[int(p[0])] = dict(zip(cols, (float(x) for x in p[1:])))
    return rows


RCP = [  # name, file stem, premise fragment
    ("RCP2.6", "RCP3PD", "These four RCPs include one mitigation scenario leading to a very low forcing level (RCP2.6)", "for RCP2.6 it peaks and declines"),
    ("RCP4.5", "RCP45", "These four RCPs include ... two stabilization scenarios (RCP4.5 and RCP6)", "for RCP4.5 it stabilizes by 2100"),
    ("RCP6.0", "RCP6", "These four RCPs include ... two stabilization scenarios (RCP4.5 and RCP6)", "For RCP6.0 and RCP8.5, radiative forcing does not peak by year 2100"),
    ("RCP8.5", "RCP85", "These four RCPs include ... one scenario with very high greenhouse gas emissions (RCP8.5)", "For RCP6.0 and RCP8.5, radiative forcing does not peak by year 2100"),
]
RCP_FORCING = {"RCP2.6": "2.6", "RCP4.5": "4.5", "RCP6.0": "6.0", "RCP8.5": "8.5"}
RCP_CONC2100 = {"RCP2.6": "421", "RCP4.5": "538", "RCP6.0": "670", "RCP8.5": "936"}


def rcp(indir):
    e = []
    for name, stem, frag, peak in RCP:
        q = (f"{frag} ... {peak} ... Most of the CMIP5 and Earth System Model simulations were performed with prescribed CO2 concentrations reaching "
             f"{RCP_CONC2100[name]} ppm ({name.replace('RCP6.0', 'RCP6.0').replace('RCP8.5', 'RCP 8.5')}) by the year 2100.")
        e.append(scen(name, "RCP", q, URL["ar5_spm"], position="AR5 WG I SPM, Box SPM.1",
                      note=f"Identified by approximate total radiative forcing in 2100 relative to 1750 of {RCP_FORCING[name]} W m-2 (Box SPM.1). Quote joins three sentences of the box with '...'."))
        em = read_dat(os.path.join(indir, f"{stem}_EMISSIONS.DAT"))
        co = read_dat(os.path.join(indir, f"{stem}_MIDYEAR_CONCENTRATIONS.DAT"))
        src_e = URL["rcp_data"] + f"{stem}_EMISSIONS.DAT"
        src_c = URL["rcp_data"] + f"{stem}_MIDYEAR_CONCENTRATIONS.DAT"
        for key, subj, metric, unit, rows, src in (
            ("FossilCO2", S_CO2FF, "Fossil & Industrial CO2 (fossil, cement, gas flaring and bunker fuels)", "GtC/yr", em, src_e),
            ("CH4", S_CH4, "CH4 emissions", "Mt CH4/yr", em, src_e),
            ("CO2", S_CONC, "CO2 concentration, annual global mean", "ppm", co, src_c),
        ):
            for y in YEARS:
                if y < 2005:
                    continue
                val = round(rows[y][key], 4 if unit == "GtC/yr" else 2)
                extra = {"base_year": True} if y == 2005 else {}
                n = "RCPs start in 2005; the 2005 value is the harmonised historical starting point." if y == 2005 else None
                e.append(path(name, "RCP", subj, metric, val, unit, y, src, f"RCP data file {stem}, column {key}", note=n, **extra))
    meta = {
        "published": "2013-09",
        "status": "complete",
        "sources": [URL["ar5_spm"], URL["ar5_annex2"], URL["rcp_data"]],
        "publisher": "Intergovernmental Panel on Climate Change (IPCC), Working Group I (pathways by the RCP integrated assessment modelling teams, data by the RCP Concentration Calculation & Data Group)",
        "series": "Representative Concentration Pathways (RCPs), AR5",
        "scenario_count": 4,
        "notes": "Edition = AR5 WG I (September 2013), which adopted the RCPs; final RCP data release 26 November 2009 (RCP6: 30 May 2010), documented in Climatic Change 2011. Yearly values from the RCP data files (CMIP5 recommendation, MAGICC 6.3), which AR5 WG I Annex II cites as its source. Annex II itself prints decadal means for emissions (2000d, 2010d, 2020d) and yearly concentrations for 2000, 2005, 2010, 2020; these agree with the data files (for example CO2 2020: RCP2.6 412.1, RCP4.5 411.1, RCP6.0 409.4, RCP8.5 415.8 ppm; fossil CO2 2010d: 8.61, 8.54, 8.39, 8.90 GtC). 2000 is history in the RCPs and is not captured. Values rounded to 4 decimals (GtC) or 2 decimals (Mt, ppm).",
    }
    return write("2013", meta, e)


# ---------------------------------------------------------------- 2021 SSP
SSP = [  # AR6 name, RCMIP scenario, family
    ("SSP1-1.9", "ssp119", "SSP1"),
    ("SSP1-2.6", "ssp126", "SSP1"),
    ("SSP2-4.5", "ssp245", "SSP2"),
    ("SSP3-7.0", "ssp370", "SSP3"),
    ("SSP5-8.5", "ssp585", "SSP5"),
]
# AR6 WG I Annex III, Table AIII.2, CO2 (ppm) in 2020
AR6_CONC_2020 = {"SSP1-1.9": 414, "SSP1-2.6": 414, "SSP2-4.5": 414, "SSP3-7.0": 415, "SSP5-8.5": 415}
SSP_PREMISE = {
    "SSP3-7.0": "They start in 2015, and include scenarios with high and very high GHG emissions (SSP3-7.0 and SSP5-8.5) and CO2 emissions that roughly double from current levels by 2100 and 2050, respectively",
    "SSP5-8.5": "They start in 2015, and include scenarios with high and very high GHG emissions (SSP3-7.0 and SSP5-8.5) and CO2 emissions that roughly double from current levels by 2100 and 2050, respectively",
    "SSP2-4.5": "scenarios with intermediate GHG emissions (SSP2-4.5) and CO2 emissions remaining around current levels until the middle of the century",
    "SSP1-1.9": "scenarios with very low and low GHG emissions and CO2 emissions declining to net zero around or after 2050, followed by varying levels of net negative CO2 emissions (SSP1-1.9 and SSP1-2.6)",
    "SSP1-2.6": "scenarios with very low and low GHG emissions and CO2 emissions declining to net zero around or after 2050, followed by varying levels of net negative CO2 emissions (SSP1-1.9 and SSP1-2.6)",
}


def rcmip(fn, wanted):
    out = {}
    with open(fn, newline="") as f:
        for row in csv.DictReader(f):
            if row["Region"] != "World":
                continue
            k = (row["Scenario"], row["Variable"])
            if k in wanted:
                out[k] = (row["Model"], row)
    return out


def ssp(indir):
    v_ff, v_ch4, v_c = "Emissions|CO2|MAGICC Fossil and Industrial", "Emissions|CH4", "Atmospheric Concentrations|CO2"
    em = rcmip(os.path.join(indir, "rcmip-emissions-annual-means-v5-1-0.csv"),
               {(s, v) for _, s, _ in SSP for v in (v_ff, v_ch4)})
    co = rcmip(os.path.join(indir, "rcmip-concentrations-annual-means-v5-1-0.csv"),
               {(s, v_c) for _, s, _ in SSP})
    e = []
    rc_note = "RCMIP v5.1.0 protocol file, a public compilation of the CMIP6 ScenarioMIP harmonised emissions (IIASA SSP database, Gidden et al. 2019); not an IPCC table. Rounded to 0.1 Mt."
    for name, code, fam in SSP:
        model = em[(code, v_ff)][0]
        e.append(scen(name, fam, SSP_PREMISE[name], URL["ar6_spm"], position="AR6 WG I SPM, Box SPM.1.1",
                      note=f"Integrated assessment model behind the marker: {model}. The 'y' in SSPx-y is the approximate radiative forcing in 2100 in W m-2 (SPM footnote 22)."))
        for var, subj, metric, unit in ((v_ff, S_CO2FF, "CO2 emissions, fossil and industrial (MAGICC)", "Mt CO2/yr"),
                                        (v_ch4, S_CH4, "CH4 emissions", "Mt CH4/yr")):
            row = em[(code, var)][1]
            for y in YEARS:
                if y < 2015:
                    continue
                s = row.get(str(y), "")
                if s == "":
                    continue  # SSP data are 2015, 2020, then decadal: no 2025
                extra = {"base_year": True} if y == 2015 else {}
                n = rc_note + (" 2015 is the harmonisation year (history, identical across SSPs)." if y == 2015 else "")
                e.append(path(name, fam, subj, metric, round(float(s), 1), unit, y, URL["rcmip_em"],
                              f"RCMIP emissions, scenario {code}, variable {var}", "medium", n, **extra))
        crow = co[(code, v_c)][1]
        for y in (2015, 2020, 2025):
            if y == 2020:
                e.append(path(name, fam, S_CONC, "CO2 concentration", AR6_CONC_2020[name], "ppm", 2020, URL["ar6_annex3"],
                              "AR6 WG I Annex III, Table AIII.2", note=f"Integer ppm as printed. Unrounded input4MIPs value: {round(float(crow['2020']), 2)} ppm."))
            else:
                extra = {"base_year": True} if y == 2015 else {}
                e.append(path(name, fam, S_CONC, "CO2 concentration, annual global mean", round(float(crow[str(y)]), 2), "ppm", y, URL["rcmip_conc"],
                              f"RCMIP concentrations, scenario {code}", "medium",
                              "CMIP6 input4MIPs concentrations (Meinshausen et al. 2020) via RCMIP v5.1.0; AR6 Annex III prints only 2020 and decadal values." + (" 2015 is the first scenario year (history-matched)." if y == 2015 else ""),
                              **extra))
    meta = {
        "published": "2021-08",
        "status": "complete",
        "sources": [URL["ar6_spm"], URL["ar6_annex3"], URL["rcmip_em"], URL["rcmip_conc"]],
        "publisher": "Intergovernmental Panel on Climate Change (IPCC), Working Group I (scenarios from CMIP6 ScenarioMIP / SSP integrated assessment modelling teams)",
        "series": "SSP-RCP illustrative scenarios, AR6",
        "scenario_count": 5,
        "notes": "Edition = AR6 WG I (August 2021). The five illustrative scenarios of AR6 WG I; underlying data published 2016-2020 (ScenarioMIP protocol 2016, SSP marker scenarios 2017, harmonised emissions 2019, concentrations 2020). Emissions are at 2015, 2020 and then decadal, so no 2025 emission value. 2015 values are harmonised history (base_year). Other ScenarioMIP scenarios (SSP4-3.4, SSP4-6.0, SSP5-3.4-OS) and AR6 WG III scenario categories are not captured. The AR6 Annex III PDF read is the 'Final Government Distribution' version served at the URL given.",
    }
    return write("2021", meta, e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="indir", default="downloads", help="folder with the RCP .DAT files and the RCMIP CSVs")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    for ed, fn in (("1990", sa90), ("1992", is92), ("2000", sres)):
        print(ed, fn())
    print("2013", rcp(a.indir))
    print("2021", ssp(a.indir))


if __name__ == "__main__":
    main()
