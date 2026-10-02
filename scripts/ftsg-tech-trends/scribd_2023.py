"""2023 volumes from the text layer of the archived Scribd copy of the full 2023 report.

The full 820-page report (all 14 volumes) is on Scribd (document 648865649, uploaded by a
reader, not the publisher). The Wayback capture of that page carries the report's text layer
as layout text (columns kept by position, one form feed per page). There is no font
information, so entries are classified from the body pages instead of the contents styling:

- a contents entry whose page is a divider page (only a title) is a section;
- a contents entry whose name is the band heading at the top of its page is a sub-section;
- every other contents entry is a trend; its full title is taken from the body heading on its
  page (contents lines wrap across columns), its quote is the first sentence of the
  WHAT IT IS block (one-trend-per-page layout) or of the column under its heading.

Usage:
  python3 scribd_2023.py pages <scribd.html> <pages.json>     # decompressed capture -> pages
  python3 scribd_2023.py check <pages.json>                   # compare with the six PDF volumes
  python3 scribd_2023.py volume <pages.json> <name>           # print the parsed entries of a volume
"""
import sys, os, re, json, html
from pdfxml import join_lines, first_sentence
from editions import COMMON_SKIP

SCRIBD = 'https://web.archive.org/web/20260923115621/https://www.scribd.com/document/648865649/FTI-2023-Trend-Report'

# Volume start pages in the full report (its own contents page, report page 2).
VOLUMES = [(5, 'Artificial Intelligence'), (80, 'Web3'), (115, 'Metaverse'), (164, 'Bioengineering'),
           (229, 'Climate & Energy'), (302, 'Mobility, Robotics & Drones'), (358, 'Computing'),
           (403, 'News & Information'), (450, 'Financial Services'), (508, 'Health Care & Medicine'),
           (566, 'Government, Policy & Security'), (639, 'Space'), (690, 'Supply Chain & Logistics'),
           (750, 'Entertainment'), (813, None)]

LABELS = ('HOW IT WORKS', 'WHY IT MATTERS', 'WHAT IT IS', 'KEY INSIGHT', 'TABLE OF', 'CONTENTS')


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('&', 'and'))


def to_pages(path, out):
    t = open(path, encoding='utf-8', errors='replace').read()
    t = re.sub(r'(?s)<(script|style).*?</\1>', '', t)
    t = t.replace('<br/ >', '\n').replace('</p><p>', '\n')
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    pages = {}
    for chunk in t.split('\x0c'):
        lines = [x.rstrip().replace('\t', ' ') for x in chunk.split('\n')]
        for ln in reversed(lines):
            m = re.match(r'^\s*(\d{1,3})\s+© 2023 Future Today', ln)
            if m:
                pages[int(m.group(1))] = [x for x in lines if x.strip()]
                break
    json.dump(pages, open(out, 'w'))
    print(len(pages), 'pages')


def frags(line):
    """(column, text) runs separated by two or more spaces."""
    return [(m.start(), m.group(0)) for m in re.finditer(r'\S+(?: \S+)*', line)]


def is_caps(s):
    letters = re.sub(r'[^A-Za-z]', '', s)
    lower = sum(1 for ch in letters if ch.islower())
    # one lower-case letter is allowed for plurals of acronyms ("MEMORY AND GPUs")
    return len(letters) >= 2 and (lower == 0 or (lower == 1 and len(letters) >= 8 and letters[-1].islower()))


def body_lines(page):
    """Page lines without the running header (line 0) and the footer."""
    return [ln for ln in page[1:] if not re.match(r'^\s*\d{1,3}\s+© 2023', ln)]


def headings(page, skip_band=False):
    """Upper-case headings: (line, col, text), wrapped heading lines at the same column merged."""
    lines = body_lines(page)
    if skip_band:
        lines = [''] + lines[1:]
    grid = [frags(ln) for ln in lines]
    used = set()
    out = []
    for i, fr in enumerate(grid):
        for col, txt in fr:
            if (i, col) in used or not is_caps(txt) or txt.startswith(LABELS) or 'YEAR ON THE LIST' in txt:
                continue
            parts = [txt]
            j = i + 1
            while j < len(grid):
                at = [(c, x) for c, x in grid[j] if abs(c - col) <= 2]
                if not at:
                    j += 1
                    continue
                c, x = at[0]
                if is_caps(x) and not x.startswith(LABELS) and 'YEAR ON THE LIST' not in x:
                    parts.append(x)
                    used.add((j, c))
                    j += 1
                    continue
                break
            out.append((i, col, ' '.join(parts)))
    return out, grid


def column_text(grid, line, col, limit=1200):
    """Text of the column starting below (line, col) until the next heading in that column."""
    body = []
    for fr in grid[line + 1:]:
        at = [x for c, x in fr if abs(c - col) <= 3]
        if not at:
            continue
        x = at[0]
        if is_caps(x) and len(x) > 3 and not body:
            continue  # wrapped heading remainder
        if is_caps(x) and len(x) > 3:
            break
        body.append(x)
        if sum(len(b) for b in body) > limit:
            break
    return join_lines(body)


def toc_page(pages, start, end):
    for p in range(start, min(end, start + 5)):
        pg = pages.get(str(p))
        if pg and any('TABLE OF' in ln for ln in pg[:4]):
            return p
    return None


def toc_items(page):
    """Contents entries (page number, first title line) and the loose continuation fragments."""
    items, cont = [], []
    for ln in page[1:]:
        if re.match(r'^\s*\d{1,3}\s+© 2023', ln):
            continue
        fr = frags(ln)
        k = 0
        while k < len(fr):
            col, txt = fr[k]
            m = re.match(r'^(\d{2,3}) +(\S.*)$', txt)
            if m:
                items.append((int(m.group(1)), m.group(2).strip()))
            elif re.match(r'^\d{2,3}$', txt) and k + 1 < len(fr) and not re.match(r'^\d', fr[k + 1][1]):
                items.append((int(txt), fr[k + 1][1].strip()))
                k += 1
            elif not re.match(r'^\d{1,3}$', txt) and txt not in ('TABLE OF', 'CONTENTS'):
                cont.append(txt.strip())
            k += 1
    return items, cont


def page_kind(pg):
    """'divider' for a title-only page; else the band heading at the top of the page."""
    lines = body_lines(pg)
    if len(lines) <= 4 and sum(len(x.strip()) for x in lines) < 80:
        return 'divider', ' '.join(x.strip() for x in lines)
    first = frags(lines[0]) if lines else []
    if first and is_caps(first[0][1]) and not first[0][1].startswith(LABELS) and 'YEAR ON THE LIST' not in first[0][1]:
        # a band heading stands alone on its line
        if len(first) == 1:
            return 'band', first[0][1]
    return 'page', None


PERSON_RE = re.compile(r'^[A-Z][a-z]+(?: [A-Z][\w.\u2019\'-]*)+,(\s|$)')


def full_label(first, cont, texts):
    """Contents title lines wrap across columns: rebuild the title from the first line and the
    loose fragment that, appended, gives a heading printed on the page."""
    nf = norm(first)
    best, exact = first, False
    for t in texts:
        if norm(t) == nf:
            return first, True
    for c in cont:
        cand = first + ' ' + c
        nc = norm(cand)
        for t in texts:
            nt = norm(t)
            if nt == nc or (nt.startswith(nc) and len(nt) - len(nc) <= 1):
                if len(nc) > len(norm(best)):
                    best, exact = cand, True
    return best, exact


def parse_volume(pages, vi):
    start, volume = VOLUMES[vi]
    end = VOLUMES[vi + 1][0]
    tp = toc_page(pages, start, end)
    items, cont = toc_items(pages[str(tp)])
    items = [(p, t) for p, t in items if start <= p < end]
    rows, skipped = [], []
    section, sub = None, None
    seen = set()
    resolved = []
    for p, first in items:
        pg = pages.get(str(p))
        if pg is None:
            resolved.append(dict(p=p, label=first, kind='trend', conf='low', missing=True, order=(p, 1, 999, 999)))
            continue
        pk, ptxt = page_kind(pg)
        hs, grid = headings(pg, skip_band=(pk == 'band'))
        if pk == 'divider':
            resolved.append(dict(p=p, label=first, kind='section', order=(p, 0, 0, 0)))
            continue
        nf = norm(first)
        if pk == 'band' and nf and norm(ptxt).startswith(nf):
            lab, _ = full_label(first, cont, [ptxt])
            if norm(lab) == norm(ptxt):
                resolved.append(dict(p=p, label=lab, kind='subsection', order=(p, 0, 0, 0)))
                continue
        lab, exact = full_label(first, cont, [h for _, _, h in hs])
        match = None
        for (ln, col, h) in hs:
            nh = norm(h)
            if nf and nh.startswith(nf):
                if match is None or abs(len(nh) - len(norm(lab))) < abs(len(norm(match[2])) - len(norm(lab))):
                    match = (ln, col, h)
        quote, tag, hline, hcol = None, None, 999, 999
        conf = 'high' if exact else 'medium'
        if match:
            hline, hcol = match[0], match[1]
            text = None
            for i, fr in enumerate(grid):
                for c2, x in fr:
                    if x.startswith('WHAT IT IS') or x.startswith('KEY INSIGHT'):
                        text = column_text(grid, i, c2)
                        break
                if text:
                    break
            if not text:
                text = column_text(grid, hline, hcol)
            quote = first_sentence(text) if text else None
            for x in body_lines(pg)[:3]:
                m = re.search(r'(\d+(?:ST|ND|RD|TH) YEAR ON THE LIST)', x)
                if m:
                    tag = m.group(1)
        else:
            conf = 'low'
        resolved.append(dict(p=p, label=lab, kind='trend', conf=conf, quote=quote, tag=tag,
                             order=(p, 1, hcol, hline)))
    resolved.sort(key=lambda r: r['order'])
    for r in resolved:
        lab = r['label']
        if r['kind'] == 'section':
            section, sub = lab, None
            continue
        if r['kind'] == 'subsection':
            sub = lab
            continue
        if (section and re.match(r'^expert perspectives?$', section, re.I)) or re.search(r'\b(trends|terms)$', lab, re.I):
            skipped.append(f'{volume}: {lab}' if not (section and section.lower().startswith('expert')) else f'{volume}: expert perspective (person name omitted)')
            continue
        if re.match(r'^spotlight\b', lab, re.I):
            skipped.append(f'{volume}: {lab} (overview block, not a trend)')
            continue
        if PERSON_RE.match(lab):
            skipped.append(f'{volume}: expert perspective (person name omitted)')
            continue
        if any(re.match(pat, lab, re.I) for pat in COMMON_SKIP) or (section and re.match(r'^scenarios?$', section, re.I)):
            skipped.append(f'{volume}: {lab}')
            continue
        key = (norm(lab), r['p'])
        if key in seen:
            continue
        seen.add(key)
        rows.append(dict(volume=volume, page=r['p'], label=lab,
                         subsection=' / '.join(x for x in (section, sub) if x) or None,
                         quote=r.get('quote'), tag=r.get('tag'), conf=r.get('conf', 'low'),
                         missing=r.get('missing', False)))
    return rows, skipped


def check(pages):
    here = os.path.dirname(os.path.abspath(__file__))
    d = json.load(open(os.path.join(here, '..', '..', 'data', 'raw', 'ftsg-tech-trends', '2023.json')))
    for vi, (start, volume) in enumerate(VOLUMES[:-1]):
        old = [e for e in d['entries'] if e['section'] == volume]
        if not old:
            continue
        rows, _ = parse_volume(pages, vi)
        a = {norm(e['label']) for e in old}
        b = {norm(r['label']) for r in rows}
        qa = {norm(e['label']): norm(e.get('quote') or '') for e in old}
        qok = sum(1 for r in rows if r['quote'] and qa.get(norm(r['label'])) == norm(r['quote']))
        print(f'{volume}: pdf {len(old)}, scribd {len(rows)}, both {len(a & b)}, same quote {qok}')
        for x in sorted(a - b):
            print('   only pdf   :', x)
        for x in sorted(b - a):
            print('   only scribd:', x)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'pages':
        to_pages(sys.argv[2], sys.argv[3])
    else:
        pages = json.load(open(sys.argv[2]))
        if cmd == 'check':
            check(pages)
        elif cmd == 'volume':
            vi = [v for _, v in VOLUMES].index(sys.argv[3])
            rows, skipped = parse_volume(pages, vi)
            for r in rows:
                print(r['page'], r['conf'], '|', r['label'], '|', r['subsection'], '|', (r['quote'] or '')[:80], r['tag'] or '')
            print('skipped:', skipped)
