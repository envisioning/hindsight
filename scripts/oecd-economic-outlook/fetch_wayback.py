"""Download OECD Economic Outlook annex table "Demand and Output" workbooks
from the Internet Archive and extract Annex Table 1 (Real GDP).

oecd.org overwrote Demand-and-Output.xls with each edition, so each Wayback
capture holds the vintage that was online at that time. The workbook states
its own vintage in the "Source: OECD Economic Outlook NN database" line.

Writes wayback_annex.json next to this script (gitignored). The .xls files
are read from a temporary folder and not kept. Optional argument: a folder
that already holds the captures as <timestamp>.xls (skips the download).
"""
import json, os, sys, tempfile, urllib.request
import xls

HERE = os.path.dirname(os.path.abspath(__file__))
CAPTURES = [
    ('20140407105600', 'http://www.oecd.org/eco/outlook/Demand-and-Output.xls'),
    ('20140823025542', 'http://www.oecd.org/eco/outlook/Demand-and-Output.xls'),
    ('20160313203848', 'http://www.oecd.org/eco/outlook/Demand-and-Output.xls'),
]

def main():
    out = []
    for ts, url in CAPTURES:
        wb_url = 'https://web.archive.org/web/%sid_/%s' % (ts, url)
        local = os.path.join(sys.argv[1], ts + '.xls') if len(sys.argv) > 1 else None
        if local and os.path.exists(local):
            data = open(local, 'rb').read()
        else:
            req = urllib.request.Request(wb_url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=300).read()
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, 'f.xls')
            open(p, 'wb').write(data)
            sheet = xls.read(p)['RealGDP']
        rows = {}
        texts = []
        for (r, c), v in sheet.items():
            rows.setdefault(r, {})[c] = v
        table = []
        for r in sorted(rows):
            cells = rows[r]
            if isinstance(cells.get(0), str):
                texts.append(cells[0].strip())
            table.append([cells.get(c) for c in range(max(cells) + 1)])
        out.append({'wayback_url': wb_url, 'original_url': url, 'capture': ts, 'table': table})
        print(ts, [t for t in texts if t.startswith('Source')], flush=True)
    json.dump(out, open(os.path.join(HERE, 'wayback_annex.json'), 'w'))

if __name__ == '__main__':
    main()
