"""Build data/raw/bp-energy-outlook/realized.json: world oil consumption and
renewables share of primary energy (Energy Institute Statistical Review, via
Our World in Data energy-data) and electric car stock (IEA Global EV Outlook,
via Our World in Data). Run: python3 scripts/bp-energy-outlook/realized.py
Inputs are downloaded next to this script if missing (gitignored *.csv)."""
import csv, json, pathlib, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent.parent / "data" / "raw" / "bp-energy-outlook" / "realized.json"
ENERGY = "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv"
EVSTOCK = "https://ourworldindata.org/grapher/electric-car-stocks.csv?v=1&csvType=full&useColumnShortNames=false"

def get(url, name):
    p = HERE / name
    if not p.exists():
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        p.write_bytes(urllib.request.urlopen(req).read())
    return list(csv.DictReader(p.open()))

def row(metric, year, value, unit, publisher, src, note=None, **kw):
    d = {"metric": metric, "year": year, "value": value, "unit": unit, "publisher": publisher,
         "source_url": src, "confidence": "high"}
    d.update(kw)
    if note:
        d["note"] = note
    return d

entries = []
for r in get(ENERGY, "owid-energy-data.csv"):
    if r["country"] != "World" or int(r["year"]) < 2005:
        continue
    y = int(r["year"])
    ei = "Energy Institute (via Our World in Data)"
    if r["oil_consumption"]:
        entries.append(row("oil consumption (primary energy from oil)", y, round(float(r["oil_consumption"]), 1), "TWh", ei, ENERGY,
                           subject="oil", note="Energy units, not Mb/d. EI oil consumption excludes biofuels. Not converted."))
    if r["renewables_share_energy"]:
        entries.append(row("renewables share of primary energy (incl. hydro, substitution method)", y,
                           round(float(r["renewables_share_energy"]), 2), "percent", ei, ENERGY, subject="renewables"))
    if r["renewables_share_energy"] and r["hydro_share_energy"]:
        v = float(r["renewables_share_energy"]) - float(r["hydro_share_energy"])
        entries.append(row("renewables share of primary energy (excl. hydro, substitution method)", y, round(v, 2), "percent", ei, ENERGY,
                           subject="renewables", derived=True,
                           note="Computed as renewables_share_energy minus hydro_share_energy. bp Outlooks exclude hydro from 'renewables'."))
for r in get(EVSTOCK, "electric-car-stocks.csv"):
    if r["Entity"] == "World":
        entries.append(row("electric car stock (BEV + PHEV)", int(r["Year"]), int(float(r["Electric car stocks"])), "vehicles",
                           "International Energy Agency (via Our World in Data)", "https://ourworldindata.org/grapher/electric-car-stocks",
                           subject="electric vehicles"))
entries.sort(key=lambda e: (e["subject"], e["metric"], e["year"]))
OUT.write_text(json.dumps({
    "subject": "Realized world oil consumption, renewables share of primary energy, and electric car stock",
    "status": "partial",
    "retrieved": "2026-09-28",
    "vintage": "Oil and renewables: EI Statistical Review of World Energy 2025 (data to 2024), via the OWID energy-data GitHub CSV; the EI 2026 edition (data to 2025) was not reachable in a plain-text format. EV stock: IEA Global EV Outlook 2026 via OWID, updated 2026-06-15.",
    "sources": [ENERGY, "https://ourworldindata.org/grapher/electric-car-stocks", "https://www.energyinst.org/statistical-review"],
    "notes": ("Oil demand in Mb/d is not available here: the EI consolidated dataset requires an email-verified download and the EI PDF sits "
              "behind a bot check, and the OWID catalog copy is in a binary format with no stdlib reader. Oil is therefore in TWh; bp "
              "forecasts are in Mb/d and include or exclude biofuels by edition. Renewables share uses EI's substitution method, which "
              "differs from bp's own primary-energy accounting in each edition. Compare with care. bp's own historical columns in each "
              "edition's summary table are stored as base_year rows in the edition files."),
    "entries": entries,
}, indent=1, ensure_ascii=False) + "\n")
print(OUT, len(entries))
