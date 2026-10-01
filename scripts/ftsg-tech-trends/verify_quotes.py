"""Check every quote against `pdftotext -raw` text of its source (letters and digits only).
Quotes not found verbatim are downgraded to confidence 'medium' with a note. Entry order is
never changed.

Usage: python3 verify_quotes.py <edition> <raw.txt> [<raw.txt> ...]
"""
import sys, os, re, json

def n(s):
    s = s.replace('ﬃ', 'ffi').replace('ﬁ', 'fi').replace('ﬀ', 'ff').replace('ﬂ', 'fl')
    return re.sub(r'[^a-z0-9]', '', s.lower())

ed = sys.argv[1]
raw = n(''.join(open(p, encoding='utf-8', errors='replace').read() for p in sys.argv[2:]))
path = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', f'{ed}.json')
doc = json.load(open(path))
bad = 0
NOTE = 'Quote not found verbatim in the extracted PDF text (line-break hyphenation or reading order); check before publishing.'
for r in doc['entries']:
    q = r.get('quote')
    if q and n(q) not in raw:
        bad += 1
        r['confidence'] = 'medium'
        if NOTE not in r.get('note', ''):
            r['note'] = (r.get('note', '') + ' ' + NOTE).strip()
json.dump(doc, open(path, 'w'), ensure_ascii=False, indent=2)
open(path, 'a').write('\n')
print(ed, 'quotes not verbatim:', bad)
