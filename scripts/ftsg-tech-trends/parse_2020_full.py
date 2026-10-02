"""2020: quotes from the full slide transcripts of the publisher's two SlideShare uploads.

The 2020 report was uploaded by the publisher in two sections (AmyWebb33). Later Wayback
captures of the new SlideShare page format (2025-08-29 for section 1, 2026-08-30 for
section 2) embed the full per-slide transcript in the page data (`transcript`: 271 and 110
slides), which covers the whole report: section 1 pages 1-270, section 2 pages 271-365.

This script never reorders, removes or relabels an entry (D15). For entries without a quote it
adds the first sentence of the trend's KEY INSIGHT block (one-trend-per-page layout) or of the
text under its heading, and points `source_url` at the section that holds the page. It also
lists "Nth YEAR ON THE LIST" trend pages whose title matches no entry (candidates to append).

Usage:
  python3 parse_2020_full.py extract <section1.html> <section2.html> <out.json>   # decompressed captures
  python3 parse_2020_full.py apply <transcripts.json> [--write]
"""
import sys, os, re, json
from pdfxml import join_lines, first_sentence

S1 = 'https://web.archive.org/web/20250829074411/https://www.slideshare.net/slideshow/future-today-institute-2020-tech-trends-report-231311623/231311623'
S2 = 'https://web.archive.org/web/20260830162850/https://www.slideshare.net/slideshow/future-today-institute-2020-tech-trends-report-section-2-of-2/231311737'
PATH = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', '2020.json')
NOTE = ('Quote added 2026-10-02 from the full slide transcript of the publisher upload (SlideShare, '
        'Wayback capture of the newer page format); source_url points at the section that holds the page.')


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('&', 'and'))


def extract(a, b, out):
    res = {}
    for key, f in (('s1', a), ('s2', b)):
        t = open(f, encoding='utf-8').read()
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', t, re.S)
        res[key] = json.loads(m.group(1))['props']['pageProps']['slideshow']['transcript']
    json.dump(res, open(out, 'w'))
    print({k: len(v) for k, v in res.items()})


def page_numbers(slides):
    """Printed page per slide: odd pages print their number; others are interpolated."""
    num = []
    for t in slides:
        lines = [x.strip() for x in t.strip().split('\n') if x.strip()]
        p = None
        for x in (lines[-2:] if lines else []):
            if re.fullmatch(r'\d{1,3}', x):
                p = int(x)
        num.append(p)
    out, last, idx = [], None, None
    for i, p in enumerate(num):
        if p is not None:
            last, idx = p, i
            out.append(p)
        elif last is not None:
            out.append(last + (i - idx))
        else:
            out.append(None)
    return out


def norm_map(text):
    """Normalized text and, per normalized char, its index in text."""
    chars, idx = [], []
    for i, ch in enumerate(text.lower().replace('&', '+')):
        if ch == '+':
            for c in 'and':
                chars.append(c)
                idx.append(i)
        elif ch.isalnum() and ch.isascii():
            chars.append(ch)
            idx.append(i)
    return ''.join(chars), idx


def quote_after(text, label):
    nt, idx = norm_map(text)
    nl = norm(label)
    k = nt.find(nl)
    if k < 0 or not nl:
        return None
    end = idx[k + len(nl) - 1] + 1
    rest = text[end:]
    m = re.search(r'Key Insight\s*\n', rest[:200], re.I)
    if m:
        block = rest[m.end():]
        block = re.split(r'\n(?:WHAT YOU NEED TO KNOW|What You Need To Know|WHY IT MATTERS|Why It Matters)\b', block)[0]
    else:
        block = rest
    lines = [x for x in block.split('\n')]
    # drop a page-header line and stray page numbers
    lines = [x for x in lines if x.strip() and not re.fullmatch(r'\s*\d{1,3}\s*', x) and 'FUTURE TODAY INSTITUTE' not in x]
    text2 = join_lines(lines[:40]).replace('\xad', '').lstrip(').,;:–—- ')
    q = first_sentence(text2)
    # a heading run on, a figure caption or a stray fragment is not a quote
    if not q or len(q) < 25 or not re.match(r'[A-Z0-9\u201c"]', q):
        return None
    return q


def apply(tpath, write):
    tr = json.load(open(tpath))
    slides = []
    for key, url in (('s1', S1), ('s2', S2)):
        pn = page_numbers(tr[key])
        for i, t in enumerate(tr[key]):
            slides.append(dict(text=t, page=pn[i], url=url, slide=i + 1))
    doc = json.load(open(PATH))
    added = 0
    found_pages = set()
    for e in doc['entries']:
        p = e.get('page')
        cands = [s for s in slides if s['page'] is not None and p is not None and p - 1 <= s['page'] <= p + 3 and s['page'] > 12]
        hit = None
        for s in sorted(cands, key=lambda s: abs(s['page'] - p)):
            if norm(e['label']) and norm(e['label']) in norm(s['text']):
                hit = s
                break
        if not hit:
            continue
        found_pages.add((hit['url'], hit['slide']))
        q = quote_after(hit['text'], e['label'])
        if q and len(q) <= 400 and not e.get('quote'):
            e['quote'] = q
            e['source_url'] = f"{hit['url']}#page={hit['slide']}"
            e['note'] = (e.get('note', '') + ' ' + NOTE).strip()
            e['confidence'] = 'medium'
            added += 1
    print('entries', len(doc['entries']), 'quotes added', added, 'with quote now', sum(1 for e in doc['entries'] if e.get('quote')))
    # full-page trends whose title matches no entry
    have = {norm(e['label']) for e in doc['entries']}
    for s in slides:
        m = re.search(r'(\d+(?:ST|ND|RD|TH) YEAR ON THE LIST)\n(.+)\n', s['text'])
        if m and s['page'] and s['page'] > 20:
            t = norm(m.group(2))
            if t and not any(t == h or t in h or h in t for h in have if len(h) > 5):
                print('  unmatched full-page title:', s['page'], m.group(1), '|', m.group(2))
    if write:
        json.dump(doc, open(PATH, 'w'), ensure_ascii=False, indent=2)
        open(PATH, 'a').write('\n')


if __name__ == '__main__':
    if sys.argv[1] == 'extract':
        extract(*sys.argv[2:5])
    else:
        apply(sys.argv[2], '--write' in sys.argv)
