"""Dump every sheet of a legacy binary .xls file (BIFF8, Excel 97-2003) as tab-separated text, using only the
standard library. Same output as xlsx_dump.py: one line per non-empty row, sheet<TAB>row (1-based)<TAB>cell values.
Usage: python3 xls_dump.py FILE.xls > FILE.tsv

Reads the OLE2 compound file, then the Workbook stream: the shared string table (SST, with CONTINUE records), sheet
names (BOUNDSHEET) and cell records LABELSST, LABEL, NUMBER, RK, MULRK and FORMULA (cached numeric or string result).
Enough for bp's 2014 and 2015 Energy Outlook summary tables; not a general reader (no dates, no number formats)."""
import struct, sys

FREE, ENDCHAIN = 0xFFFFFFFF, 0xFFFFFFFE


def ole_stream(data, want=("Workbook", "Book")):
    ssz = 1 << struct.unpack_from("<H", data, 0x1E)[0]
    nfat = struct.unpack_from("<I", data, 0x2C)[0]
    dir0 = struct.unpack_from("<I", data, 0x30)[0]
    cutoff = struct.unpack_from("<I", data, 0x38)[0]
    difat0, ndifat = struct.unpack_from("<II", data, 0x44)
    sec = lambda n: data[512 + n * ssz: 512 + (n + 1) * ssz]
    fat_secs = list(struct.unpack_from("<109I", data, 0x4C))
    d = difat0
    for _ in range(ndifat):
        b = sec(d)
        fat_secs += list(struct.unpack_from(f"<{ssz // 4 - 1}I", b))
        d = struct.unpack_from("<I", b, ssz - 4)[0]
    fat = []
    for s in fat_secs[:nfat]:
        fat += struct.unpack(f"<{ssz // 4}I", sec(s))

    def chain(start):
        out, s = [], start
        while s not in (FREE, ENDCHAIN):
            out.append(sec(s))
            s = fat[s]
        return b"".join(out)

    dirs = chain(dir0)
    for i in range(0, len(dirs), 128):
        e = dirs[i:i + 128]
        nlen = struct.unpack_from("<H", e, 0x40)[0]
        name = e[:max(nlen - 2, 0)].decode("utf-16-le")
        start, size = struct.unpack_from("<II", e, 0x74)
        if name in want:
            if size < cutoff:
                raise ValueError("workbook stream in the mini stream: not supported")
            return chain(start)[:size]
    raise ValueError("no Workbook stream")


def records(wb, pos=0):
    while pos + 4 <= len(wb):
        typ, ln = struct.unpack_from("<HH", wb, pos)
        yield pos, typ, wb[pos + 4: pos + 4 + ln]
        pos += 4 + ln


class Chunks:
    """Reads across an SST record and its CONTINUE records. Character data that crosses a record boundary restarts
    with a fresh option byte (BIFF8 rule); other bytes run straight on."""

    def __init__(self, chunks):
        self.c, self.i, self.p = chunks, 0, 0

    def take(self, n):
        out = b""
        while n:
            if self.p >= len(self.c[self.i]):
                self.i, self.p = self.i + 1, 0
            b = self.c[self.i][self.p: self.p + n]
            self.p += len(b)
            n -= len(b)
            out += b
        return out

    def chars(self, n, wide):
        s = ""
        while n:
            if self.p >= len(self.c[self.i]):
                self.i, self.p = self.i + 1, 0
                wide = self.take(1)[0] & 1
            room = (len(self.c[self.i]) - self.p) // (2 if wide else 1)
            k = min(n, room)
            b = self.take(k * (2 if wide else 1))
            s += b.decode("utf-16-le" if wide else "latin-1")
            n -= k
        return s


def sst(chunks):
    r = Chunks(chunks)
    _, unique = struct.unpack("<II", r.take(8))
    out = []
    for _ in range(unique):
        cch, flags = struct.unpack("<HB", r.take(3))
        runs = struct.unpack("<H", r.take(2))[0] if flags & 8 else 0
        ext = struct.unpack("<I", r.take(4))[0] if flags & 4 else 0
        out.append(r.chars(cch, flags & 1))
        r.take(4 * runs + ext)
    return out


def unicode_str(b, off, lenbytes):
    cch = b[off] if lenbytes == 1 else struct.unpack_from("<H", b, off)[0]
    flags = b[off + lenbytes]
    s = b[off + lenbytes + 1:]
    return s[:2 * cch].decode("utf-16-le") if flags & 1 else s[:cch].decode("latin-1")


def rk(v):
    x = struct.unpack("<d", struct.pack("<Q", (v & 0xFFFFFFFC) << 32))[0] if not v & 2 else float(v >> 2 if v < 2 ** 31 else (v >> 2) - 2 ** 30)
    return x / 100 if v & 1 else x


def fmt(x):
    return str(int(x)) if isinstance(x, float) and x.is_integer() else (repr(x) if isinstance(x, float) else x.strip())


def main(path):
    wb = ole_stream(open(path, "rb").read())
    sheets, strings, sst_chunks = [], [], None
    for pos, typ, b in records(wb):
        if typ == 0x0085:
            sheets.append((struct.unpack_from("<I", b, 0)[0], unicode_str(b, 6, 1)))
        elif typ == 0x00FC:
            sst_chunks = [b]
        elif typ == 0x003C and sst_chunks is not None:
            sst_chunks.append(b)
        elif sst_chunks is not None:
            strings, sst_chunks = sst(sst_chunks), None
        if typ == 0x000A and sheets:
            break
    for start, name in sheets:
        cells, pending = {}, None
        for pos, typ, b in records(wb, start):
            if pos != start and typ == 0x000A:
                break
            if typ == 0x00FD:
                r, c, _, i = struct.unpack_from("<HHHI", b)
                cells[(r, c)] = strings[i]
            elif typ == 0x0204:
                r, c, _ = struct.unpack_from("<HHH", b)
                cells[(r, c)] = unicode_str(b, 6, 2)
            elif typ == 0x0203:
                r, c, _, v = struct.unpack_from("<HHHd", b)
                cells[(r, c)] = v
            elif typ == 0x027E:
                r, c, _, v = struct.unpack_from("<HHHI", b)
                cells[(r, c)] = rk(v)
            elif typ == 0x00BD:
                r, c0 = struct.unpack_from("<HH", b)
                for k in range((len(b) - 6) // 6):
                    cells[(r, c0 + k)] = rk(struct.unpack_from("<I", b, 4 + 6 * k + 2)[0])
            elif typ == 0x0006:
                r, c, _ = struct.unpack_from("<HHH", b)
                res = b[6:14]
                if res[6:8] == b"\xff\xff":
                    pending = (r, c) if res[0] == 0 else None
                    if res[0] == 1:
                        cells[(r, c)] = "TRUE" if res[2] else "FALSE"
                else:
                    cells[(r, c)] = struct.unpack("<d", res)[0]
            elif typ == 0x0207 and pending:
                cells[pending], pending = unicode_str(b, 0, 2), None
        rows = {}
        for (r, c), v in cells.items():
            v = fmt(v)
            if v != "":
                rows.setdefault(r, {})[c] = v
        for r in sorted(rows):
            row = rows[r]
            print(name, r + 1, *[row.get(i, "") for i in range(max(row) + 1)], sep="\t")


if __name__ == "__main__":
    main(sys.argv[1])
