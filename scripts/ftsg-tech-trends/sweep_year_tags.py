"""Sweep every "Nth YEAR ON THE LIST" tag in the PDF editions (2021-2025) and classify each tagged
page against the stored entries (D40 follow-up, issue #26). No writes.

The tag is matched with all whitespace removed, so the spacing variants of the text layers are
found: "10TH YEAR ON THE LIST" (XML runs), "10THYEAR ONTHE LIST" (2022 pdftotext -raw),
"1STYEAR ON THE LIST" (one 2024 page). The first D40 pass matched with a space before YEAR and
never listed 2022, so the 2022 umbrella pages were missed.

Per tagged page:
  a  an entry is stored on that page (tag_stored says whether the entry carries the tag)
  b  no entry on the page, and the page has a KEY INSIGHT or WHAT IT IS block: a D40 umbrella
     candidate (read the page before appending)
  c  no entry on the page and no key-insight block (intro or narrative page)

Sources: <S>/fti2021.xml, fti2022.xml, fti2024.xml, ftsg2025.xml (pdftohtml -xml -i), and for
2023 <S>/scribd2023.pages.json (scribd_2023.py pages; full report, all 14 volumes) plus the
volume XML files that exist (fti2023_<vol>.xml) as a cross-check.

Usage: python3 sweep_year_tags.py <S> [--json out.json]
"""
import sys, os, re, json
from pdfxml import load
import scribd_2023 as sc

R = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
WORDS = 'FIRST SECOND THIRD FOURTH FIFTH SIXTH SEVENTH EIGHTH NINTH TENTH ELEVENTH TWELFTH THIRTEENTH FOURTEENTH FIFTEENTH'.split()
TAG = re.compile(r'(\d{1,2})(ST|ND|RD|TH)YEARONTHELIST|(' + '|'.join(WORDS) + r')YEARONTHELIST')
KEY = re.compile(r'KEYINSIGHT|WHATITIS')
# 2023 volume PDFs: (file stem, volume name as in scribd_2023.VOLUMES)
VOL_XML = [('fti2023_ai', 'Artificial Intelligence'), ('fti2023_web3', 'Web3'), ('fti2023_metaverse', 'Metaverse'),
           ('fti2023_bio', 'Bioengineering'), ('fti2023_climate', 'Climate & Energy'), ('fti2023_news', 'News & Information'),
           ('fti2023_health', 'Health Care & Medicine')]


def tags_in(text):
    """Tags in a page given as text pieces (XML runs, or layout-text fragments) joined by newlines.
    Whitespace is removed inside a piece only, so a page number or column next to the tag does
    not join its digits."""
    out = []
    for piece in text.upper().split('\n'):
        for m in TAG.finditer(re.sub(r'\s+', '', piece)):
            out.append(int(m.group(1)) if m.group(1) else WORDS.index(m.group(3)) + 1)
    return out, bool(KEY.search(re.sub(r'\s+', '', text.upper())))


def tag_n(s):
    if not s:
        return None
    t, _ = tags_in(s)
    return t[0] if t else None


def title_of(page):
    big = sorted([r for r in page['runs'] if r['size'] >= 30], key=lambda r: (r['top'], r['left']))
    return re.sub(r'\s+', ' ', ' '.join(r['text'] for r in big)).strip()[:90]


def classify(ed, pages, entries_by_page):
    rows = []
    for pn, text, title in pages:
        tags, key = tags_in(text)
        if not tags:
            continue
        es = entries_by_page.get(pn, [])
        if es:
            stored = [(e['rank'], e['label'], tag_n(e.get('years_on_list'))) for e in es]
            cls = 'a'
        else:
            stored, cls = [], ('b' if key else 'c')
        rows.append(dict(edition=ed, page=pn, tags=tags, key_block=key, title=title, cls=cls,
                         entries=[dict(rank=r, label=l, tag_stored=t) for r, l, t in stored]))
    return rows


def entries(ed):
    return [e for e in json.load(open(os.path.join(R, f'{ed}.json')))['entries']]


def by_page(es, pagefn=lambda e: e.get('page')):
    out = {}
    for e in es:
        p = pagefn(e)
        if p is not None:
            out.setdefault(p, []).append(e)
    return out


def volume_offsets(es, pages):
    norm = lambda x: re.sub(r'[^a-z0-9]', '', x.lower())
    P = {int(k): norm(' '.join(v)) for k, v in pages.items()}
    cnt = {}
    for e in es:
        if 'scribd.com' in e['source_url'] or not e.get('quote') or not e.get('page'):
            continue
        q = norm(e['quote'])[:40]
        for k, t in P.items():
            if q in t:
                c = cnt.setdefault(e['section'], {})
                c[k - e['page']] = c.get(k - e['page'], 0) + 1
    return {sec: max(c, key=c.get) for sec, c in cnt.items()}


def xml_pages(path):
    return [(p['page'], '\n'.join(r['text'] for r in p['runs']), title_of(p)) for p in load(path)]


def sweep(S):
    rows = []
    for ed, stem in (('2021', 'fti2021'), ('2022', 'fti2022'), ('2024', 'fti2024'), ('2025', 'ftsg2025')):
        rows += classify(ed, xml_pages(os.path.join(S, stem + '.xml')), by_page(entries(ed)))
    # 2023: the full report (Scribd text layer, printed page numbers). Entries read from a volume PDF
    # store the volume PDF page; the offset to the printed full-report page is measured per volume
    # from the stored quotes (most common offset of the pages that contain the quote).
    pages = json.load(open(os.path.join(S, 'scribd2023.pages.json')))
    es23 = entries('2023')
    offset = volume_offsets(es23, pages)
    def full_page(e):
        if 'scribd.com' in e['source_url']:
            return e.get('page')
        return e['page'] + offset[e['section']] if e.get('page') else None
    pl = []
    for k, lines in sorted(pages.items(), key=lambda x: int(x[0])):
        title = next((x.strip() for x in lines if x.strip() and not TAG.search(re.sub(r'\s+', '', x.upper()))), '')[:90]
        frags = [f for x in lines for f in re.split(r'\s{2,}', x.strip())]
        pl.append((int(k), '\n'.join(frags), title))
    rows += classify('2023', pl, by_page(es23, full_page))
    # cross-check: tags in the 2023 volume PDFs that exist locally
    vol = []
    for stem, name in VOL_XML:
        f = os.path.join(S, stem + '.xml')
        if not os.path.exists(f):
            vol.append(dict(volume=name, xml=None))
            continue
        tagged = [(p['page'], tags_in('\n'.join(r['text'] for r in p['runs']))[0]) for p in load(f)]
        tagged = [(pn, t) for pn, t in tagged if t]
        lo = dict((v, p) for p, v in sc.VOLUMES)[name]
        hi = min(p for p, v in sc.VOLUMES if p > lo)
        scr = sorted(r['page'] for r in rows if r['edition'] == '2023' and lo <= r['page'] < hi)
        full = [offset[name] + pn for pn, _ in tagged]
        vol.append(dict(volume=name, xml=stem, tagged_pages=len(tagged), scribd_tagged_pages=len(scr),
                        same_pages=sorted(full) == scr, only_xml=sorted(set(full) - set(scr)), only_scribd=sorted(set(scr) - set(full))))
    return rows, vol


def main():
    S = sys.argv[1]
    rows, vol = sweep(S)
    summ = {}
    for r in rows:
        s = summ.setdefault(r['edition'], {'pages': 0, 'tags': 0, 'a': 0, 'b': 0, 'c': 0, 'a_tag_missing': 0, 'a_tag_differs': 0})
        s['pages'] += 1
        s['tags'] += len(r['tags'])
        s[r['cls']] += 1
        for e in r['entries']:
            if e['tag_stored'] is None:
                s['a_tag_missing'] += 1
            elif e['tag_stored'] not in r['tags']:
                s['a_tag_differs'] += 1
    for ed in sorted(summ):
        print(ed, summ[ed])
    for r in rows:
        flag = r['cls'] != 'a' or any(e['tag_stored'] is None or e['tag_stored'] not in r['tags'] for e in r['entries']) or len(r['entries']) > 1
        if flag:
            print(f"{r['edition']} p{r['page']} {r['cls']} tags={r['tags']} key={r['key_block']} title={r['title']!r} entries={[(e['rank'], e['label'], e['tag_stored']) for e in r['entries']]}")
    for v in vol:
        print('2023 volume', v)
    if '--json' in sys.argv:
        json.dump(dict(rows=rows, volumes=vol, summary=summ), open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
