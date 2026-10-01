"""Dump sheets of an .xlsb (Excel binary, BIFF12) file to TSV on stdout.

Standard library only. Reads cell values (numbers, shared strings, inline
strings and cached formula results); ignores styles and formulas.

Usage: python3 xlsb_dump.py FILE.xlsb [SHEET_NAME_SUBSTRING] [--list]
"""
import re
import struct
import sys
import zipfile
import xml.etree.ElementTree as ET


def records(data):
    i, n = 0, len(data)
    while i < n:
        rt = data[i]; i += 1
        if rt & 0x80:
            rt = (rt & 0x7F) | ((data[i] & 0x7F) << 7); i += 1
        size, shift = 0, 0
        for _ in range(4):
            b = data[i]; i += 1
            size |= (b & 0x7F) << shift
            shift += 7
            if not b & 0x80:
                break
        yield rt, data[i:i + size]
        i += size


def wide(buf, off):
    cch = struct.unpack_from("<I", buf, off)[0]
    s = buf[off + 4: off + 4 + 2 * cch].decode("utf-16-le", "replace")
    return s, off + 4 + 2 * cch


def rk(v):
    if v & 2:
        x = v >> 2
        if x & (1 << 29):
            x -= 1 << 30
        x = float(x)
    else:
        x = struct.unpack("<d", struct.pack("<Q", (v & 0xFFFFFFFC) << 32))[0]
    return x / 100 if v & 1 else x


def load(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.bin" in z.namelist():
        for rt, b in records(z.read("xl/sharedStrings.bin")):
            if rt == 19:
                shared.append(wide(b, 1)[0])
    rels = ET.fromstring(z.read("xl/_rels/workbook.bin.rels"))
    target = {r.get("Id"): r.get("Target") for r in rels}
    sheets = []
    for rt, b in records(z.read("xl/workbook.bin")):
        if rt == 156:
            off = 8
            cch = struct.unpack_from("<I", b, off)[0]
            if cch == 0xFFFFFFFF:
                rid, off = "", off + 4
            else:
                rid, off = wide(b, off)
            name, _ = wide(b, off)
            t = target.get(rid, "").lstrip("/")
            if not t.startswith("xl/"):
                t = "xl/" + t
            sheets.append((name, t))
    return z, shared, sheets


def fmt(x):
    if isinstance(x, float):
        return repr(x) if x != int(x) or abs(x) > 1e15 else str(int(x))
    return x


def rows(z, shared, part):
    row, cur = None, {}
    for rt, b in records(z.read(part)):
        if rt == 0:  # BrtRowHdr
            if cur:
                yield row, cur
            row, cur = struct.unpack_from("<I", b, 0)[0], {}
            continue
        if rt not in (2, 5, 6, 7, 8, 9):
            continue
        col = struct.unpack_from("<I", b, 0)[0]
        if rt == 2:
            val = rk(struct.unpack_from("<I", b, 8)[0])
        elif rt in (5, 9):
            val = struct.unpack_from("<d", b, 8)[0]
        elif rt == 7:
            val = shared[struct.unpack_from("<I", b, 8)[0]]
        else:  # 6 BrtCellSt, 8 BrtFmlaString
            val = wide(b, 8)[0]
        cur[col] = fmt(val)
    if cur:
        yield row, cur


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
        for _, cells in rows(z, shared, part):
            print("\t".join(str(cells.get(i, "")) for i in range(max(cells) + 1)))


if __name__ == "__main__":
    main()
