"""Extract Shell scenario values for target years <= 2025 from downloaded inputs.

Standard library only. Reads files from an input folder (default: ./inputs)
named as in README.md and writes one JSON list of pathway rows per edition
to the output folder (default: ./out): <edition>.pathways.json.

Usage: python3 extract_data.py [INPUT_DIR] [OUTPUT_DIR]
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xlsb_dump  # noqa: E402
import xlsx_dump  # noqa: E402

MAX_YEAR = 2025

URL = {
    "2011": "https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_745060082/promo_copy_717248746/links/item0.stream/1652289218851/787285b3524a8522519a5708558be86cd71a68b2/shell-scenarios-2050signalssignposts.pdf",
    "2013": "https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_745060082/promo_copy/links/item0.stream/1652287059126/77705819dcc8c77394d9540947e811b8c35bda83/scenarios-newdoc-english.pdf",
    "2021": "https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/_jcr_content/root/main/section_1789847828/promo_847985331_copy/links/item0.stream/1668516256900/9d9a0a9deed06f8164943e7a399fd2d55db49afc/shell-energy-transformation-scenario-summary-data.xlsx",
    "2023": "https://www.shell.com/news-and-insights/scenarios/the-energy-security-scenarios/_jcr_content/root/main/section_926760145/promo_copy_142460259/links/item0.stream/1684499937239/acd9a3a0c03a6d84c855635f52e7157123a7d8ec/shell-energy-security-scenarios-2023-underlying-data-updated.xlsb",
    "2025": "https://www.shell.com/news-and-insights/scenarios/what-are-the-previous-shell-scenarios/the-2025-energy-security-scenarios/_jcr_content/root/main/section_1902297548/promo_1610292284/links/item0.stream/1738231997237/b64df0471395a93655f85a80b9afa3e9216e83d9/scenarios-2025-compendium-summary.xlsb",
}

SUBJECT = {"Oil": "oil", "Natural gas": "natural gas", "Coal": "coal", "Nuclear": "nuclear power",
           "Solar": "solar energy", "Solar - photovoltaic": "solar energy", "Wind": "wind energy",
           "Total": "primary energy"}


def sheet_rows(path, sheet):
    if path.endswith(".xlsb"):
        z, shared, sheets = xlsb_dump.load(path)
        part = dict(sheets)[sheet]
        return [[str(c.get(i, "")) for i in range(max(c) + 1)] for _, c in xlsb_dump.rows(z, shared, part)]
    z, shared, sheets = xlsx_dump.load(path)
    return list(xlsx_dump.rows(z, shared, dict(sheets)[sheet]))


def year_cols(rows):
    hdr = next(r for r in rows if "1980" in r)
    return {int(v): i for i, v in enumerate(hdr) if re.fullmatch(r"(19|20)\d\d", v.strip())}


def block_row(rows, anchors, label, span=60):
    """Row whose cells contain `label`, after the rows matching each anchor in turn."""
    i = 0
    for a in anchors:
        i = next(k for k in range(i, len(rows)) if any(a == c.strip() or (len(a) > 12 and a in c) for c in rows[k]))
    for k in range(i, min(i + span, len(rows))):
        if label in [c.strip() for c in rows[k]]:
            return rows[k], k + 1
    raise KeyError((anchors, label))


def workbook(edition, path, scenarios, specs, years):
    out = []
    for sc in scenarios:
        rows = sheet_rows(path, sc)
        cols = year_cols(rows)
        for anchors, label, metric, unit, subject in specs:
            row, line = block_row(rows, anchors, label)
            for y in years:
                v = row[cols[y]] if cols[y] < len(row) else ""
                if v == "":
                    continue
                out.append({
                    "kind": "pathway", "scenario": sc, "subject": subject, "metric": metric,
                    "target_year": y, "value": round(float(v), 3), "unit": unit,
                    "position": f"sheet '{sc}', row {line}, '{' > '.join(anchors)}' / '{label}'",
                    "source_url": URL[edition], "confidence": "high",
                })
    return out


def pe_specs(anchors, labels):
    return [(anchors, l, f"total primary energy: {l}" if l != "Total" else "total primary energy",
             "EJ/year", SUBJECT[l]) for l in labels]


def table_2013(txt_path):
    """New Lens appendix tables (pdftotext -layout), 2020 column, Mountains (left) and Oceans (right)."""
    lines = open(txt_path, encoding="utf-8").read().split("\n")
    out = {"Mountains": [], "Oceans": []}
    i = next(k for k, l in enumerate(lines) if "Mountains Total Primary Energy" in l and "By Source" in l)
    for l in lines[i:i + 40]:
        m = re.findall(r"([A-Z][A-Za-z/\- ]+?)\s+((?:\d+(?:\.\d+)?\s+){10}\d+(?:\.\d+)?)", l)
        for side, (lab, nums) in zip(("Mountains", "Oceans"), m):
            if lab.strip() == "Year":
                continue
            vals = nums.split()
            out[side].append((lab.strip(), "total primary energy" + ("" if lab.strip() == "Total" else f": {lab.strip()}"), float(vals[6]), "EJ/year"))
        if l.strip().startswith("Total"):
            break
    j = next(k for k, l in enumerate(lines) if "Mountains Net CO2 Emissions" in l)
    for l in lines[j:j + 60]:
        if l.strip().startswith("Total"):
            m = re.findall(r"Total\s+((?:\d+\s+){10}\d+)", l)
            for side, nums in zip(("Mountains", "Oceans"), m):
                out[side].append(("Total", "net CO2 emissions (energy system and industrial processes, by point of emission)", float(nums.split()[6]), "Gt CO2/year"))
            break
    rows = []
    for sc in ("Mountains", "Oceans"):
        for lab, metric, v, unit in out[sc]:
            subj = {"Oil": "oil", "Natural Gas": "natural gas", "Coal": "coal", "Nuclear": "nuclear power",
                    "Solar": "solar energy", "Wind": "wind energy"}.get(lab, "primary energy" if unit == "EJ/year" else "CO2 emissions")
            if subj == "primary energy" and lab != "Total":
                subj = "primary energy: " + lab.lower()
            rows.append({"kind": "pathway", "scenario": sc, "subject": subj, "metric": metric, "target_year": 2020,
                         "value": v, "unit": unit,
                         "position": "Appendix 'Summary Quantification Tables', column 2020",
                         "source_url": URL["2013"], "confidence": "high"})
    return rows


def table_2011(txt_path):
    t = re.sub(r"\s+", " ", open(txt_path, encoding="utf-8").read())
    m = re.search(r"EJ per Year 2000 2010 2020 2030 (.*?) Source", t)
    rows = []
    for lab, a, b, c, d in re.findall(r"([A-Za-z][A-Za-z ]+?)\*{0,2} (\d+) (\d+) (\d+) (\d+)", m.group(1)):
        lab = lab.strip()
        subj = {"Crude oil": "oil", "Natural gas": "natural gas", "Coal": "coal", "Nuclear": "nuclear power",
                "Solar": "solar energy", "Wind": "wind energy", "Total Primary Energy Demand": "primary energy"}.get(lab, "primary energy: " + lab.lower())
        rows.append({"kind": "pathway", "scenario": "current projected (current and expected policies)",
                     "subject": subj, "metric": f"primary energy demand: {lab}", "target_year": 2020,
                     "value": float(c), "unit": "EJ/year",
                     "position": "table 'Current projected primary energy demand (exajoules per year) - 2000-2030', column 2020",
                     "source_url": URL["2011"], "confidence": "high"})
    return rows


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "inputs"
    dst = sys.argv[2] if len(sys.argv) > 2 else "out"
    os.makedirs(dst, exist_ok=True)
    res = {}
    res["2011"] = table_2011(os.path.join(src, "src-2011.raw.txt"))
    res["2013"] = table_2013(os.path.join(src, "src-2013.txt"))
    labels21 = ["Oil", "Natural gas", "Coal", "Nuclear", "Solar", "Wind", "Total"]
    res["2021"] = workbook("2021", os.path.join(src, "src-2021x.xlsx"), ["Waves", "Islands", "Sky 1.5"],
                           pe_specs(["Total primary energy - by source"], labels21) +
                           [(["World - greenhouse gas emissions"], "CO2 - energy", "CO2 emissions from energy", "Gt CO2/year", "CO2 emissions")],
                           range(2020, MAX_YEAR + 1))
    labels = ["Oil", "Natural gas", "Coal", "Nuclear", "Solar - photovoltaic", "Wind", "Total"]
    co2 = (["World net energy-related CO2 emissions by source"], "Total", "net energy-related CO2 emissions", "Gt CO2/year", "CO2 emissions")
    res["2023"] = workbook("2023", os.path.join(src, "src-2023x.xlsb"), ["Archipelagos", "Sky 2050"],
                           pe_specs(["Primary energy", "World by source"], labels) + [co2,
                           (["Stock of electric passenger vehicles"], "Total", "stock of electric passenger vehicles (BEV and PHEV)", "million vehicles", "electric vehicles")],
                           range(2023, MAX_YEAR + 1))
    res["2025"] = workbook("2025", os.path.join(src, "src-2025x.xlsb"), ["Surge", "Archipelagos", "Horizon"],
                           pe_specs(["Primary energy", "World by source"], labels) + [co2], [2025])
    for ed, rows in res.items():
        with open(os.path.join(dst, f"{ed}.pathways.json"), "w") as f:
            json.dump(rows, f, indent=1)
        print(ed, len(rows))


if __name__ == "__main__":
    main()
