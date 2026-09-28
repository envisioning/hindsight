"""Build data/raw/bnef-evo/realized.json from IEA Global EV Outlook data
(via Our World in Data grapher CSVs). Run from any directory:
    python3 scripts/bnef-evo/realized.py
Inputs are downloaded next to this script (gitignored *.csv)."""
import csv, json, pathlib, urllib.request

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent.parent / "data" / "raw" / "bnef-evo" / "realized.json"
SERIES = {
    "electric-car-sales": ("global electric car sales (BEV + PHEV)", "vehicles", "Electric cars sold"),
    "electric-car-sales-share": ("EV share of new car sales, global", "percent", "Share of new cars that are electric"),
}
BASE = "https://ourworldindata.org/grapher/{}.csv?v=1&csvType=full&useColumnShortNames=false"

entries = []
for slug, (metric, unit, col) in SERIES.items():
    path = HERE / f"{slug}.csv"
    if not path.exists():
        req = urllib.request.Request(BASE.format(slug), headers={"User-Agent": "Mozilla/5.0"})
        path.write_bytes(urllib.request.urlopen(req).read())
    for row in csv.DictReader(path.open()):
        if row["Entity"] != "World":
            continue
        v = float(row[col])
        entries.append({
            "subject": "electric vehicles", "metric": metric, "year": int(row["Year"]),
            "value": int(v) if unit == "vehicles" else v, "unit": unit,
            "publisher": "International Energy Agency",
            "source_url": f"https://ourworldindata.org/grapher/{slug}",
            "confidence": "high",
        })
entries.sort(key=lambda e: (e["year"], e["metric"]))
OUT.write_text(json.dumps({
    "subject": "Realized global electric car sales and sales share",
    "status": "complete",
    "retrieved": "2026-09-28",
    "vintage": "IEA Global EV Outlook 2026 (data to 2025), as processed by Our World in Data, updated 2026-06-15",
    "sources": [
        "https://www.iea.org/reports/global-ev-outlook-2026/trends-in-electric-cars",
        "https://www.iea.org/data-and-statistics/data-tools/global-ev-data-explorer",
    ] + [f"https://ourworldindata.org/grapher/{s}" for s in SERIES],
    "notes": "Electric cars = BEV + PHEV passenger cars. IEA shares are rounded (2 significant figures from 2022). BNEF editions 2016-2018 used 'light-duty vehicles' as the denominator; IEA uses cars. IEA revises back years between editions; this file holds the GEVO 2026 vintage only.",
    "entries": entries,
}, indent=1, ensure_ascii=False) + "\n")
print(OUT, len(entries))
