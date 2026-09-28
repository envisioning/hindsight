"""Minimal xlsx reader, standard library only. Reads sheets by name into row dicts."""
import re, zipfile
import xml.etree.ElementTree as ET

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def col_index(ref):
    s = re.match(r'[A-Z]+', ref).group(0)
    n = 0
    for ch in s:
        n = n * 26 + ord(ch) - 64
    return n - 1


class Workbook:
    def __init__(self, path):
        self.z = zipfile.ZipFile(path)
        names = self.z.namelist()
        self.ss = []
        if 'xl/sharedStrings.xml' in names:
            root = ET.fromstring(self.z.read('xl/sharedStrings.xml'))
            for si in root.findall(NS + 'si'):
                self.ss.append(''.join(t.text or '' for t in si.iter(NS + 't')))
        wb = ET.fromstring(self.z.read('xl/workbook.xml'))
        rels = ET.fromstring(self.z.read('xl/_rels/workbook.xml.rels'))
        target = {r.get('Id'): r.get('Target') for r in rels}
        self.sheets = {}
        for s in wb.iter(NS + 'sheet'):
            t = target[s.get(RNS + 'id')].lstrip('/')
            if not t.startswith('xl/'):
                t = 'xl/' + t
            self.sheets[s.get('name')] = t

    def rows(self, name):
        """Return a list of (row_number, {col_index: value}) for one sheet."""
        root = ET.fromstring(self.z.read(self.sheets[name]))
        out = []
        for row in root.iter(NS + 'row'):
            r = {}
            for c in row.findall(NS + 'c'):
                v = c.find(NS + 'v')
                t = c.get('t')
                if v is None:
                    is_ = c.find(NS + 'is')
                    val = ''.join(x.text or '' for x in is_.iter(NS + 't')) if is_ is not None else None
                elif t == 's':
                    val = self.ss[int(v.text)]
                elif t in ('str', 'inlineStr', 'e'):
                    val = v.text
                else:
                    try:
                        val = float(v.text)
                    except (TypeError, ValueError):
                        val = v.text
                if val is not None and val != '':
                    r[col_index(c.get('r'))] = val
            if r:
                out.append((int(row.get('r')), r))
        return out
