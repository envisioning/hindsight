"""Dump sheets of an .xlsx file to TSV on stdout (standard library only).

Usage: python3 xlsx_dump.py FILE.xlsx [SHEET_NAME_SUBSTRING] [--list]
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}


def col_index(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def load(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])))
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    target = {r.get("Id"): r.get("Target") for r in rels}
    sheets = []
    for s in wb.find("m:sheets", NS):
        rid = s.get("{%s}id" % NS["r"])
        t = target[rid].lstrip("/")
        if not t.startswith("xl/"):
            t = "xl/" + t
        sheets.append((s.get("name"), t))
    return z, shared, sheets


def rows(z, shared, part):
    root = ET.fromstring(z.read(part))
    for row in root.iter("{%s}row" % NS["m"]):
        cells = {}
        for c in row.findall("m:c", NS):
            v = c.find("m:v", NS)
            t = c.get("t")
            if t == "inlineStr":
                val = "".join(x.text or "" for x in c.iter("{%s}t" % NS["m"]))
            elif v is None:
                continue
            elif t == "s":
                val = shared[int(v.text)]
            else:
                val = v.text
            cells[col_index(c.get("r"))] = val
        if cells:
            yield [cells.get(i, "") for i in range(max(cells) + 1)]


def main():
    path = sys.argv[1]
    z, shared, sheets = load(path)
    if "--list" in sys.argv:
        for name, part in sheets:
            print(name)
        return
    want = sys.argv[2] if len(sys.argv) > 2 else ""
    for name, part in sheets:
        if want and want.lower() not in name.lower():
            continue
        print("### " + name)
        for r in rows(z, shared, part):
            print("\t".join(r))


if __name__ == "__main__":
    main()
