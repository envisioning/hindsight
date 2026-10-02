"""Extract world oil demand (Mb/d) and the renewables share of primary energy
from bp Energy Outlook summary tables. Reads the .tsv dumps made by
xlsx_dump.py (one per edition, named st-<edition>.tsv) in the directory given
as the first argument, and writes st-<edition>.rows.json next to them.
See README.md for inputs."""
import json, re, sys, pathlib

YEAR = re.compile(r"^(19|20)\d\d$")

def rows(tsv, sheet):
    out = []
    for line in tsv:
        p = line.rstrip("\n").split("\t")
        if p[0] == sheet:
            out.append(p)
    return out

def columns(sheet_rows):
    """Map column index -> (scenario or None, year) from the header rows."""
    hdr = next(r for r in sheet_rows if sum(bool(YEAR.match(c)) for c in r[2:]) >= 4)
    scen_row = next((r for r in sheet_rows if int(r[1]) == int(hdr[1]) - 1), None)
    cols, current = {}, None
    for i, c in enumerate(hdr):
        if i >= 2 and scen_row is not None and i < len(scen_row) and scen_row[i].strip():
            current = scen_row[i].strip()
        if YEAR.match(c):
            cols[i] = (current, int(c))
    return cols

def world(sheet_rows, label=("World",)):
    for r in sheet_rows:
        if len(r) > 2 and r[2].strip() in label:
            return r
    raise KeyError(label)

def series(tsv, sheet, label=("World",)):
    sr = rows(tsv, sheet)
    cols = columns(sr)
    w = world(sr, label)
    return {k: float(w[i]) for i, k in cols.items() if i < len(w) and w[i] not in ("", "n/a")}

SHEETS = {
    # edition: list of (scenario name override, oil sheet, primary sheet, renewables sheet, primary label, renewables label)
    # 2014 and 2015: legacy .xls files, dumped with xls_dump.py (#71). The archive.org .xlsx at the 2015 path holds the
    # January 2014 workbook (base year 2012), not the 2015 tables; the 2015 .xls (February 2015, base year 2013) is used.
    "2014": [("Base case", None, "Consumption by fuel", "Consumption by fuel", "Total Energy Consumption", "Total Renewables Consumptionw")],
    "2015": [("Base case", None, "Consumption by fuel", "Consumption by fuel", "Total Energy Consumption", "Total Renewables Consumptionw")],
    "2016": [("Base case", None, "Consumption by fuel", "Consumption by fuel", "Total Energy Consumption", "Total Renewables Consumptionw")],
    "2017": [("Base case", None, "Consumption by fuel", "Consumption by fuel", "Total Energy Consumption", "Total Renewables Consumptionw")],
    # #15: 2018 summary tables from the NRGI GitHub mirror (archive.org holds no capture); Evolving Transition only.
    "2018": [("Evolving Transition", "Oil - Mbd", "Primary", "Renewables - Mtoe", "World", "World")],
    "2019": [("Evolving transition", "Oil - Mbd", "Primary", "Renewables - Mtoe", "World", "World"),
             ("Rapid transition", "Oil - Mbd ", "Primary ", "Renewables - Mtoe ", "World", "World")],
    "2020": [(None, "Oil - Mbd", "Primary", "Renewables - EJ", "World", "World")],
    "2022": [(None, "Oil - Mbd", "Primary energy", "Renewables - EJ", "World", "World")],
    "2023": [(None, "Oil - Mbd", "Primary energy", "Renewables - EJ", "World", "World")],
    "2024": [(None, "Oil - Mbd", "Primary energy", "Renewables - EJ", "World", "World")],
    "2025": [(None, "Oil - Mbd", "Primary energy", "Renewables - EJ", "World", "World")],
}

def main(d):
    d = pathlib.Path(d)
    for ed, specs in SHEETS.items():
        f = d / f"st-{ed}.tsv"
        if not f.exists():
            print("missing", f); continue
        tsv = f.read_text().splitlines()
        out = []
        for scen, oil, prim, ren, plab, rlab in specs:
            p = series(tsv, prim, (plab,))
            r = series(tsv, ren, (rlab,))
            o = series(tsv, oil) if oil else {}
            if ed in ("2014", "2015", "2016", "2017"):
                # bp's headline 'renewables (including biofuels)': add the biofuels row from liquids.
                b = series(tsv, prim, ("Of which Biofuels",))
                r = {k: r[k] + b.get(k, 0.0) for k in r}
            for (s, y), v in o.items():
                out.append({"scenario": scen or s or "historical", "metric": "oil demand", "year": y, "value": v, "unit": "Mb/d", "sheet": oil.strip()})
            for k in p:
                if k in r and p[k]:
                    s, y = k
                    out.append({"scenario": scen or s or "historical", "metric": "renewables share of primary energy", "year": y,
                                "value": round(100 * r[k] / p[k], 1), "unit": "percent",
                                "renewables": r[k], "primary": p[k], "sheet": f"{ren.strip()} / {prim.strip()}"})
        (d / f"st-{ed}.rows.json").write_text(json.dumps(out, indent=1))
        print(ed, len(out))

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).parent)
