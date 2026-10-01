"""Diagnostic: print every TOC entry of an edition XML (pages given as args)."""
import sys, pickle, os
from pdfxml import load
from toc import toc_entries
path = sys.argv[1]
pk = path + '.pkl'
pages = pickle.load(open(pk, 'rb')) if os.path.exists(pk) else load(path)
if not os.path.exists(pk):
    pickle.dump(pages, open(pk, 'wb'))
want = set(int(x) for x in sys.argv[2:]) if len(sys.argv) > 2 else None
for p in pages:
    if not any(r['text'].strip().upper() in ('TABLE OF CONTENTS', 'CONTENTS') for r in p['runs']):
        continue
    if want and p['page'] not in want:
        continue
    for e in toc_entries(p):
        kind = 'T' if e['color'] in ('#000000',) else 'S'
        print(p['page'], kind, e['page'], e['size'], e['family'], e['color'], e['label'][:90])
