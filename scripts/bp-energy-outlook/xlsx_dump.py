"""Dump every sheet of an .xlsx file as tab-separated text, using only the
standard library. Usage: python3 xlsx_dump.py FILE.xlsx > FILE.txt
Each output line is: sheet<TAB>row<TAB>cell values..."""
import re, sys, zipfile
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}

def col_index(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1

def main(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    target = {r.get("Id"): r.get("Target") for r in rels}
    for sh in wb.find("m:sheets", NS):
        name = sh.get("name")
        t = target[sh.get(f"{{{NS['r']}}}id")].lstrip("/")
        t = t if t.startswith("xl/") else "xl/" + t
        root = ET.fromstring(z.read(t))
        for row in root.iter(f"{{{NS['m']}}}row"):
            cells = {}
            for c in row.findall("m:c", NS):
                v = c.find("m:v", NS)
                if v is None:
                    isv = c.find("m:is", NS)
                    val = "".join(x.text or "" for x in isv.iter(f"{{{NS['m']}}}t")) if isv is not None else ""
                else:
                    val = shared[int(v.text)] if c.get("t") == "s" else v.text
                if val not in ("", None):
                    cells[col_index(c.get("r"))] = val.strip()
            if cells:
                out = [cells.get(i, "") for i in range(max(cells) + 1)]
                print(name, row.get("r"), *out, sep="\t")

if __name__ == "__main__":
    main(sys.argv[1])
