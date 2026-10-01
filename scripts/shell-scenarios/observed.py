"""Observed values for the Shell scenario metrics, 1990-2025 -> data/raw/shell-scenarios/realized.json.

Standard library only. Inputs (names as in README.md, section "Observed values"):
  src-2025x.xlsb, src-2023x.xlsb   Shell scenario data workbooks (history columns)
  ei-2026-all.xlsx                 Energy Institute Statistical Review 2026, all data
  iea-ev.json                      IEA Global EV Outlook data (EV stock, cars, World)

Rule (D19 principle): Shell's own later-stated history comes first. A year counts as
Shell history when every scenario sheet of the workbook carries the same value for it.
The 2025 workbook is used for every metric it carries; the 2023 workbook only for
metrics the 2025 workbook lacks (EV stock). Years Shell does not state get the
Energy Institute value, on the EI basis named in each row. EV stock also gets the
IEA Global EV Outlook series.

Usage: python3 scripts/shell-scenarios/observed.py INPUT_DIR [OUT_JSON]
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import extract_data  # noqa: E402
import xlsx_dump  # noqa: E402

YEARS = range(1990, 2026)
URL25 = extract_data.URL["2025"]
URL23 = extract_data.URL["2023"]
EI_URL = "https://web.archive.org/web/20260705072155id_/https://www.energyinst.org/__data/assets/file/0008/1827620/EI-Stats-Review-ALL-data.xlsx"
EI_PAGE = "https://www.energyinst.org/statistical-review"
IEA_URL = "https://api.iea.org/evs?parameters=EV%20stock&category=Historical&mode=Cars&region=World"
IEA_PAGE = "https://www.iea.org/reports/global-ev-outlook-2026"

SHELL_BASIS = ("Shell scenario workbook history; primary energy on Shell's own accounting: "
               "nuclear at input heat (thermal equivalent), non-combustible renewables "
               "(wind, solar PV, hydro) at the energy content of the electricity (direct "
               "equivalent); includes traditional biomass and all bioenergy")
EI_PE_BASIS = ("EI Statistical Review 2026 basis: commercially traded fuels only (excludes "
               "traditional biomass); nuclear and combustible non-fossil power at input heat, "
               "non-combustible renewables at the energy content of gross electrical output "
               "(the 2026 edition no longer uses the substitution method)")

# Shell label (World by source) -> metric, EI sheet for the fallback
PE = [
    ("Oil", "total primary energy: Oil", "Oil Consumption - EJ"),
    ("Natural gas", "total primary energy: Natural gas", "Gas Consumption - EJ"),
    ("Coal", "total primary energy: Coal", "Coal Consumption - EJ"),
    ("Nuclear", "total primary energy: Nuclear", "Nuclear Consumption - EJ"),
    ("Hydroelectricity", "total primary energy: Hydroelectricity", "Hydro Consumption - EJ"),
    ("Solar - photovoltaic", "total primary energy: Solar - photovoltaic", None),
    ("Solar - thermal", "total primary energy: Solar - thermal", None),
    ("Wind", "total primary energy: Wind", "Wind Consumption - EJ"),
    ("Total", "total primary energy", "Total Energy Supply (TES) -EJ"),
]
SOLAR_ALL = "total primary energy: Solar"  # PV + thermal; EI fallback "Solar Consumption - EJ"
# The 2025 workbook was published in early 2025 (stream timestamp 2025-01-30): its 2024
# column is a shared pre-year-end estimate, not history. Flagged, and EI is added for it.
EST25 = {2024}
EST23 = {2022}

EST_NOTE = ("Shell 2025 workbook value for 2024, equal in all scenarios but published in early 2025: "
            "a pre-year-end estimate, not settled history. An EI row for the same year is also given.")

EI_NOTE = {
    "Oil Consumption - EJ": "EI oil consumption; excludes biofuels (Shell 'Oil' is fossil oil incl. NGLs).",
    "Gas Consumption - EJ": "EI natural gas consumption.",
    "Coal Consumption - EJ": "EI coal consumption; excludes coal converted to liquids or gas.",
    "Nuclear Consumption - EJ": "EI nuclear, input heat from gross generation.",
    "Hydro Consumption - EJ": "EI hydro, energy content of gross generation.",
    "Wind Consumption - EJ": "EI wind, energy content of gross generation.",
    "Solar Consumption - EJ": "EI solar power (PV and CSP electricity); excludes solar heat. Compare with Shell 'Solar' (PV + thermal) or 'Solar - photovoltaic' with care.",
    "Total Energy Supply (TES) -EJ": "EI total energy supply; excludes traditional biomass and non-traded bioenergy, so it is about 50-60 EJ below Shell's total in the same year. Not on Shell's basis.",
    "CO2 from Energy": "EI CO2 from combustion of oil, gas and coal (IPCC 2006 default factors); no CCS netting, no bioenergy CO2, no process emissions.",
}


def shell_history(path, sheets, anchors, label):
    """{year: value} for years where all scenario sheets agree (relative tol 1e-9)."""
    per = []
    for sc in sheets:
        rows = extract_data.sheet_rows(path, sc)
        cols = extract_data.year_cols(rows)
        row, line = extract_data.block_row(rows, anchors, label)
        vals = {}
        for y, c in cols.items():
            if c < len(row) and row[c] not in ("", " "):
                vals[y] = float(row[c])
        per.append((vals, line))
    out = {}
    for y in per[0][0]:
        vs = [p[0].get(y) for p in per]
        if None in vs:
            continue
        if all(abs(v - vs[0]) <= 1e-9 * max(1.0, abs(vs[0])) for v in vs):
            out[y] = vs[0]
    return out, per[0][1]


def ei_world(path, sheet):
    z, shared, sheets = xlsx_dump.load(path)
    rows = list(xlsx_dump.rows(z, shared, dict(sheets)[sheet]))
    hdr = next(r for r in rows if r and r[0].strip() in ("Exajoules", "Million tonnes of carbon dioxide"))
    cols = {}
    for i, v in enumerate(hdr):
        v = v.strip()
        if v.isdigit() and 1965 <= int(v) <= 2100 and int(v) not in cols:
            cols[int(v)] = i
    row = next(r for r in rows if r and r[0].strip() == "Total World")
    return {y: float(row[c]) for y, c in cols.items() if c < len(row) and row[c] not in ("", "n/a")}


def entry(series, metric, year, value, unit, publisher, url, vintage, basis, conf, note=None, **kw):
    e = {"series": series, "metric": metric, "year": year, "value": round(value, 4), "unit": unit,
         "publisher": publisher, "source_url": url, "vintage": vintage, "basis": basis, "confidence": conf}
    e.update(kw)
    if note:
        e["note"] = note
    return e


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "inputs"
    out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "raw", "shell-scenarios", "realized.json")
    wb25 = os.path.join(src, "src-2025x.xlsb")
    wb23 = os.path.join(src, "src-2023x.xlsb")
    ei = os.path.join(src, "ei-2026-all.xlsx")
    sc25 = ["Surge", "Archipelagos", "Horizon"]
    sc23 = ["Archipelagos", "Sky 2050"]
    v25 = "Shell 2025 Energy Security Scenarios data workbook (scenarios-2025-compendium-summary.xlsb)"
    v23 = "Shell 2023 Energy Security Scenarios data workbook (May 2023 update)"
    vei = "Energy Institute Statistical Review of World Energy 2026 (75th edition, data to 2025)"
    entries = []
    shell_years = {}

    # Primary energy by source, Shell history
    hist = {}
    for label, metric, _ in PE:
        h, line = shell_history(wb25, sc25, ["Primary energy", "World by source"], label)
        hist[metric] = h
        for y in sorted(h):
            if y in YEARS:
                entries.append(entry("shell_history", metric, y, h[y], "EJ/year", "Shell", URL25, v25, SHELL_BASIS,
                                     "medium" if y in EST25 else "high", EST_NOTE if y in EST25 else None,
                                     **({"estimate": True} if y in EST25 else {}), position=f"sheets {', '.join(sc25)}, row {line}, 'Primary energy > World by source' / '{label}' (same value in every scenario)"))
    pv, th = hist["total primary energy: Solar - photovoltaic"], hist["total primary energy: Solar - thermal"]
    for y in sorted(set(pv) & set(th)):
        if y in YEARS:
            entries.append(entry("shell_history", SOLAR_ALL, y, pv[y] + th[y], "EJ/year", "Shell", URL25, v25, SHELL_BASIS,
                                 "medium" if y in EST25 else "high", (EST_NOTE + " " if y in EST25 else "") + "Sum of Shell 'Solar - photovoltaic' and 'Solar - thermal' (Shell prints the two rows, not the sum); matches the 2013 and 2021 'Solar' metric.", **({"estimate": True} if y in EST25 else {})))
    hist[SOLAR_ALL] = {y: pv[y] + th[y] for y in set(pv) & set(th)}

    # Net energy-related CO2, Shell history
    co2_metric = "net energy-related CO2 emissions"
    h, line = shell_history(wb25, sc25, ["World net energy-related CO2 emissions by source"], "Total")
    hist[co2_metric] = h
    for y in sorted(h):
        if y in YEARS:
            entries.append(entry("shell_history", co2_metric, y, h[y], "Gt CO2/year", "Shell", URL25, v25,
                                 "Shell: CO2 from production and use of energy (oil, gas, coal, bioenergy, DAC), net of CCS; excludes land use and non-energy process CO2 outside the energy system",
                                 "medium" if y in EST25 else "high", (EST_NOTE + " " if y in EST25 else "") + "Also the observed value for the 2021 'CO2 emissions from energy' and 2013 'net CO2 emissions (energy system and industrial processes)' metrics; scope may differ slightly by edition.",
                                 **({"estimate": True} if y in EST25 else {}), position=f"sheets {', '.join(sc25)}, row {line}, 'World net energy-related CO2 emissions by source' / 'Total'"))

    # EV stock, Shell 2023 history (the 2025 workbook has no EV stock table)
    ev_metric = "stock of electric passenger vehicles (BEV and PHEV)"
    h, line = shell_history(wb23, sc23, ["Stock of electric passenger vehicles"], "Total")
    for y in sorted(h):
        if y in YEARS:
            entries.append(entry("shell_history", ev_metric, y, h[y], "million vehicles", "Shell", URL23, v23,
                                 "Shell 2023 workbook history: PHEV + BEV passenger vehicles", "medium" if y in EST23 else "high",
                                 EST_NOTE.replace("2025", "2023").replace("2024", "2022") if y in EST23 else None,
                                 **({"estimate": True} if y in EST23 else {}), position=f"sheets {', '.join(sc23)}, row {line}, 'Stock of electric passenger vehicles' / 'Total'"))

    # EI fallback where Shell states no history
    ei_sets = [(m, s) for _, m, s in PE if s] + [(SOLAR_ALL, "Solar Consumption - EJ"),
                                                 ("total primary energy: Solar - photovoltaic", "Solar Consumption - EJ")]
    for metric, sheet in ei_sets:
        w = ei_world(ei, sheet)
        for y in YEARS:
            if (y in hist.get(metric, {}) and y not in EST25) or y not in w:
                continue
            conf = "low" if sheet == "Total Energy Supply (TES) -EJ" else "medium"
            entries.append(entry("ei_fallback", metric, y, w[y], "EJ/year", "Energy Institute", EI_URL, vei, EI_PE_BASIS, conf,
                                 EI_NOTE[sheet], position=f"sheet '{sheet}', row 'Total World'", source_page=EI_PAGE))
    w = ei_world(ei, "CO2 from Energy")
    for y in YEARS:
        if (y in hist[co2_metric] and y not in EST25) or y not in w:
            continue
        entries.append(entry("ei_fallback", co2_metric, y, w[y] / 1000.0, "Gt CO2/year", "Energy Institute", EI_URL, vei,
                             "EI CO2 from energy (fuel combustion of oil, gas, coal), converted from Mt CO2", "medium",
                             EI_NOTE["CO2 from Energy"], position="sheet 'CO2 from Energy', row 'Total World'", source_page=EI_PAGE))

    # IEA Global EV Outlook, EV stock (cars), World
    iea = json.load(open(os.path.join(src, "iea-ev.json")))
    for r in sorted(iea, key=lambda r: r["year"]):
        if r["parameter"] == "EV stock" and r["powertrain"] == "EV" and r["year"] in YEARS:
            entries.append(entry("iea_gevo", ev_metric, r["year"], r["value"] / 1e6, "million vehicles", "International Energy Agency",
                                 IEA_URL, "IEA Global EV Outlook 2026 data (Global EV Data Explorer, historical, data to 2025)",
                                 "IEA: electric car stock, BEV + PHEV (powertrain 'EV'), passenger cars, World; values rounded to two significant figures by the IEA API",
                                 "high", source_page=IEA_PAGE))

    entries.sort(key=lambda e: (e["metric"], e["year"], e["series"]))
    doc = {
        "subject": "Observed values for the Shell scenario metrics (primary energy by source, energy CO2, EV stock), 1990-2025",
        "status": "complete",
        "retrieved": "2026-10-01",
        "rule": ("D19 principle applied to Shell: Shell's own later-stated history (series 'shell_history', 2025 workbook; "
                 "2023 workbook for EV stock) first; 'ei_fallback' only for metric-years Shell does not state; "
                 "'iea_gevo' for EV stock as an independent observed series."),
        "sources": [URL25, URL23, EI_URL, EI_PAGE, IEA_URL, IEA_PAGE],
        "notes": [
            "Shell history years in the 2025 workbook: 1990, 1995, 2000, 2005, 2010, 2015, 2019-2023 (all scenarios equal). 2024 is also equal in all scenarios but the workbook dates from early 2025, so it is flagged estimate and EI is added for 2024. 2025 is a scenario year. Other years come from EI.",
            "EV stock: the 2023 workbook states 2019-2020 as shared history (2021 onward differs by scenario); 2010 and 2015 also shared. IEA GEVO covers 2010-2025.",
            "Shell primary energy follows the IEA physical energy content convention; EI 2026 also switched to it (nuclear at input heat, wind/solar/hydro at electricity output), so EI by-fuel values are close to Shell's for oil, gas, coal, nuclear, hydro and wind. EI totals exclude traditional biomass and are not comparable with Shell totals.",
            "Shell 2023/2025 scenario rows use 'Solar - photovoltaic'; 2013 and 2021 use 'Solar' (all solar). 'total primary energy: Solar' here is Shell PV + Shell solar thermal.",
            "Shell's own PV series breaks in 2021: 1990-2020 it is within 5% of EI solar power, 2021-2024 it is 1.5-1.7x EI (6.5 vs 3.8 EJ in 2021, 11.9 vs 7.8 EJ in 2024), and the 2023 workbook gave 3.38 EJ for 2021. Read as a basis change inside the 2025 workbook, not as a fact about solar output; grade PV claims with care.",
            "Shell oil and total run a few percent apart from EI oil and EI total on their own bases; Shell net energy CO2 runs 1-4% above EI CO2 from energy (Shell includes bioenergy CO2 and attributes all energy CO2; EI covers fossil combustion only).",
            "2011 edition metrics ('primary energy demand: ...') and 2013 by-source metrics other than those above (biofuels, biomass, geothermal, other renewables) have no observed series here.",
        ],
        "entries": entries,
    }
    with open(out_path, "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
        f.write("\n")
    print(out_path, len(entries))


if __name__ == "__main__":
    main()
