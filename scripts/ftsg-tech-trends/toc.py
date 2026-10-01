"""Parse per-volume tables of contents and trend bodies from pdftohtml XML pages.

A TOC entry is a page-number run plus title runs on the same line in the same
column; title runs below it without their own number are wrapped lines.
Entries whose title is black are trends; coloured titles are section headers.
"""
import re
from pdfxml import join_lines, first_sentence

NUM_RE = re.compile(r'^\s*(\d{1,3})(?:\s*$|\s+(.*)$)', re.S)
BLACK = {'#000000', '#231f20', '#1a1a1a', '#221f1f'}


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('&', 'and'))


def toc_entries(page, num_left_max=None, top_min=80, top_max=770):
    runs = [r for r in page['runs'] if top_min < r['top'] < top_max and r['size'] < 30
            and r['color'] != '#ffffff' and 'CONTENTS' not in r['text'].upper()]
    nums = []
    for r in runs:
        m = NUM_RE.match(r['text'])
        if m and (r['bold'] or r['color'] not in BLACK or True):
            # a number run must be followed by a title on the same line or carry it
            nums.append(r)
    # keep number runs that are the leftmost element of their line
    cols = sorted({r['left'] for r in nums})
    clusters = []
    for x in cols:
        if clusters and x - clusters[-1][-1] <= 20:
            clusters[-1].append(x)
        else:
            clusters.append([x])
    colx = [c[0] for c in clusters]
    if not colx:
        return []

    def col_of(r):
        c = None
        for i, x in enumerate(colx):
            if x <= r['left'] + 8:
                c = i
        return c

    numruns = set(id(r) for r in nums)
    bycol = {}
    for r in runs:
        c = col_of(r)
        if c is None:
            continue
        bycol.setdefault(c, []).append(r)
    entries = []
    for c in sorted(bycol):
        col = sorted(bycol[c], key=lambda r: (r['top'], r['left']))
        cur = None
        for r in col:
            if id(r) in numruns and r['left'] - colx[c] <= 20:
                m = NUM_RE.match(r['text'])
                cur = dict(page=int(m.group(1)), top=r['top'], parts=[], color=None, size=None,
                           family=None, toc_page=page['page'])
                rest = (m.group(2) or '').strip()
                if rest:
                    cur['parts'].append((r['top'], rest))
                    cur['color'], cur['size'], cur['family'] = r['color'], r['size'], r['family']
                entries.append(cur)
                continue
            if cur is None:
                cur = dict(page=None, top=r['top'], parts=[], color=None, size=None, family=None,
                           toc_page=page['page'])
                entries.append(cur)
            if cur['color'] is None:
                cur['color'], cur['size'], cur['family'] = r['color'], r['size'], r['family']
            cur['parts'].append((r['top'], r['text']))
    out = []
    for e in entries:
        lines = []
        for top, t in e['parts']:
            if lines and abs(top - lines[-1][0]) <= 3:
                lines[-1][1] += t
            else:
                lines.append([top, t])
        e['label'] = join_lines([t for _, t in lines], dehyphenate=False)
        if e['label']:
            out.append(e)
    return out


def reading_stream(page):
    runs = page['runs']
    lefts = sorted({r['left'] for r in runs})
    clusters = []
    for x in lefts:
        if clusters and x - clusters[-1][-1] <= 25:
            clusters[-1].append(x)
        else:
            clusters.append([x])
    cmap = {}
    for i, c in enumerate(clusters):
        for x in c:
            cmap[x] = i
    return sorted(runs, key=lambda r: (cmap[r['left']], r['top']))


def find_body(pages_by_no, label, start_page, look=2, heading_bold=True):
    """Locate the trend heading on start_page..start_page+look and return its first sentence."""
    target = norm(label)
    if not target:
        return None, None
    for pn in range(start_page, start_page + look + 1):
        page = pages_by_no.get(pn)
        if not page:
            continue
        stream = reading_stream(page)
        for i, r in enumerate(stream):
            if heading_bold and not r['bold']:
                continue
            acc = norm(r['text'])
            j = i
            # accumulate wrapped heading lines with the same font
            while acc and target.startswith(acc) and acc != target and j + 1 < len(stream):
                nxt = stream[j + 1]
                if (nxt['size'], nxt['color'], nxt['bold']) != (r['size'], r['color'], r['bold']):
                    break
                acc += norm(nxt['text'])
                j += 1
            if not acc or not (acc == target or (len(target) > 12 and acc.startswith(target))):
                continue
            # body: following runs in the stream with the first body signature
            body, bsig = [], None
            for b in stream[j + 1:]:
                s = (b['size'], b['family'], b['color'], b['bold'])
                if bsig is None:
                    if b['bold'] or b['size'] > 20 or b['color'] == '#ffffff':
                        continue
                    bsig = s
                if s != bsig:
                    if body:
                        break
                    continue
                body.append(b['text'])
                if len(' '.join(body)) > 900:
                    break
            text = join_lines(body)
            return (first_sentence(text) if text else None), pn
    return None, None


def full_page_trend(pages_by_no, label, start_page, look=1):
    """2022/2023 one-trend-per-page layout: large serif title, a 'KEY INSIGHT' block and an
    'Nth YEAR ON THE LIST' tag. Returns (first sentence of the key insight, tag, page)."""
    target = norm(label)
    for pn in range(start_page, start_page + look + 1):
        page = pages_by_no.get(pn)
        if not page:
            continue
        big = sorted([r for r in page['runs'] if r['size'] >= 30], key=lambda r: (r['top'], r['left']))
        title = norm(''.join(r['text'] for r in big))
        t2 = target[:max(8, len(target) - 3)]
        if not target or t2 not in title[:len(target) + 40]:
            continue
        tag = None
        for r in page['runs']:
            m = re.search(r'(\d+)\s*(ST|ND|RD|TH)\s+YEAR ON THE LIST', r['text'].upper())
            if m:
                tag = r['text'].strip()
        stream = reading_stream(page)
        quote = None
        for i, r in enumerate(stream):
            if r['text'].strip().upper().startswith(('KEY INSIGHT', 'WHAT IT IS')):
                body, bsig = [], None
                for b in stream[i + 1:]:
                    s = (b['size'], b['family'], b['color'])
                    if bsig is None:
                        bsig = s
                    if s != bsig:
                        break
                    body.append(b['text'])
                text = join_lines(body)
                quote = first_sentence(text) if text else None
                break
        return quote, tag, pn
    return None, None, None
