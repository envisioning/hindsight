"""Minimal reader for legacy Excel .xls (BIFF8) files. Standard library only.

Returns {sheet name: {(row, col): value}} with numbers as float and text as str.
Handles the OLE compound file, SST, LABELSST, LABEL, NUMBER, RK, MULRK and FORMULA
(cached numeric result) records. Enough for the OECD annex tables; not general.
"""
import struct

def _ole_stream(data, want='Workbook'):
    hdr = data[:512]
    ssz = 1 << struct.unpack('<H', hdr[30:32])[0]
    nfat = struct.unpack('<I', hdr[44:48])[0]
    dir_start = struct.unpack('<I', hdr[48:52])[0]
    mini_cutoff = struct.unpack('<I', hdr[56:60])[0]
    difat = list(struct.unpack('<109I', hdr[76:512]))
    dif_start, ndif = struct.unpack('<II', hdr[68:76])
    sec = lambda i: data[512 + i * ssz: 512 + (i + 1) * ssz]
    while ndif and dif_start < 0xFFFFFFFA:
        d = struct.unpack('<%dI' % (ssz // 4), sec(dif_start))
        difat += d[:-1]; dif_start = d[-1]; ndif -= 1
    fat = []
    for s in difat[:nfat]:
        fat += struct.unpack('<%dI' % (ssz // 4), sec(s))
    def chain(start):
        out = []; s = start
        while s < 0xFFFFFFFA:
            out.append(sec(s)); s = fat[s]
        return b''.join(out)
    d = chain(dir_start)
    for i in range(0, len(d), 128):
        e = d[i:i + 128]
        nl = struct.unpack('<H', e[64:66])[0]
        name = e[:max(nl - 2, 0)].decode('utf-16-le')
        start, size = struct.unpack('<II', e[116:124])
        if name in (want, 'Book'):
            if size < mini_cutoff:
                raise ValueError('mini stream not supported')
            return chain(start)[:size]
    raise ValueError('no workbook stream')

def _unicode(b, pos, nchars=None):
    if nchars is None:
        nchars = struct.unpack('<H', b[pos:pos + 2])[0]; pos += 2
    flags = b[pos]; pos += 1
    rt = sz = 0
    if flags & 8: rt = struct.unpack('<H', b[pos:pos + 2])[0]; pos += 2
    if flags & 4: sz = struct.unpack('<I', b[pos:pos + 4])[0]; pos += 4
    if flags & 1:
        s = b[pos:pos + 2 * nchars].decode('utf-16-le'); pos += 2 * nchars
    else:
        s = b[pos:pos + nchars].decode('latin-1'); pos += nchars
    return s, pos + 4 * rt + sz

def _rk(v):
    if v & 2:
        x = float(v >> 2 if not (v & 0x80000000) else (v >> 2) - (1 << 30))
    else:
        x = struct.unpack('<d', struct.pack('<Q', (v & 0xFFFFFFFC) << 32))[0]
    return x / 100 if v & 1 else x

def _sst(recs):
    """Parse SST across CONTINUE records."""
    strings = []
    total = struct.unpack('<I', recs[0][8:12])[0] if False else None
    buf = recs[0]; parts = recs[1:]
    n = struct.unpack('<I', buf[4:8])[0]
    pos = 8; seg = buf
    for _ in range(n):
        if pos >= len(seg):
            seg = parts.pop(0); pos = 0
        nchars = struct.unpack('<H', seg[pos:pos + 2])[0]; pos += 2
        flags = seg[pos]; pos += 1
        rt = sz = 0
        if flags & 8: rt = struct.unpack('<H', seg[pos:pos + 2])[0]; pos += 2
        if flags & 4: sz = struct.unpack('<I', seg[pos:pos + 4])[0]; pos += 4
        s = ''; left = nchars; wide = flags & 1
        while True:
            w = 2 if wide else 1
            take = min(left, (len(seg) - pos) // w)
            chunk = seg[pos:pos + take * w]
            s += chunk.decode('utf-16-le') if wide else chunk.decode('latin-1')
            pos += take * w; left -= take
            if left == 0: break
            seg = parts.pop(0); wide = seg[0] & 1; pos = 1
        skip = 4 * rt + sz
        while skip:
            if pos >= len(seg):
                seg = parts.pop(0); pos = 0
            t = min(skip, len(seg) - pos); pos += t; skip -= t
        strings.append(s)
    return strings

def read(path):
    wb = _ole_stream(open(path, 'rb').read())
    recs = []; p = 0
    while p + 4 <= len(wb):
        t, l = struct.unpack('<HH', wb[p:p + 4]); recs.append((p, t, wb[p + 4:p + 4 + l])); p += 4 + l
    sheets = []; sst = []
    for i, (off, t, b) in enumerate(recs):
        if t == 0x85:
            pos = struct.unpack('<I', b[:4])[0]
            name, _ = _unicode(b, 7, b[6])
            sheets.append((pos, name))
        elif t == 0xFC:
            group = [b]; j = i + 1
            while recs[j][1] == 0x3C: group.append(recs[j][2]); j += 1
            sst = _sst(group)
    offs = {off: i for i, (off, t, b) in enumerate(recs)}
    out = {}
    for pos, name in sheets:
        cells = {}; i = offs[pos]
        while True:
            i += 1; off, t, b = recs[i]
            if t == 0x0A: break
            if t == 0xFD:
                r, c, _, k = struct.unpack('<HHHI', b[:10]); cells[(r, c)] = sst[k]
            elif t == 0x203:
                r, c, _, v = struct.unpack('<HHHd', b[:14]); cells[(r, c)] = v
            elif t == 0x27E:
                r, c, _, v = struct.unpack('<HHHI', b[:10]); cells[(r, c)] = _rk(v)
            elif t == 0xBD:
                r, c = struct.unpack('<HH', b[:4]); n = (len(b) - 6) // 6
                for k in range(n):
                    v = struct.unpack('<I', b[6 + 6 * k + 2: 6 + 6 * k + 6])[0]; cells[(r, c + k)] = _rk(v)
            elif t == 0x06:
                r, c = struct.unpack('<HH', b[:4])
                if b[12:14] != b'\xff\xff':
                    cells[(r, c)] = struct.unpack('<d', b[6:14])[0]
            elif t == 0x204:
                r, c = struct.unpack('<HH', b[:4]); s, _ = _unicode(b, 6); cells[(r, c)] = s
        out[name] = cells
    return out
