"""Compare every 2023 volume's contents pages with data/raw/ftsg-tech-trends/2023.json.

Reads the contents pages of all 14 volumes from the Scribd text layer of the full report
(scribd2023.pages.json, see scribd_2023.py), so the six PDF volumes and the AI volume are
checked against the same text as the seven Scribd volumes. The text layer keeps columns by
position but sometimes detaches a page number from its title (the number on one line, the
title lines further down in another column), and contents lines wrap. Per volume it reports:

  unmatched  contents items "<page> <title line>" that match no entry label, no skipped item
             and no stored sub-section, with the kind of the target page (divider: title-only
             page; band: the title is the band heading at the top of the page; page: other);
  orphans    loose title lines that are neither the wrapped rest of a matched item nor text of
             any stored label, sub-section or skipped item (titles whose number was detached,
             or the cut-off second line of a stored label);
  truncated  stored labels whose body heading (Scribd page, upper case) is the label plus one
             or two loose contents lines: the label lost its second contents line;
  title page stored entries (Scribd volumes) whose page prints only a title: a section
             divider stored as a trend;
  no quote   stored entries without a quote whose page has no upper-case heading starting with
             the label (candidates for headings that are not trends; checked by hand).

Each finding is then classified by hand with the INDEX.md rules; append_2023_missing.py holds
the result. Usage (from this folder):
  python3 check_2023_contents.py <scratch>/scribd2023.pages.json [--json out.json]
"""
import sys, os, re, json
import scribd_2023 as sc
from editions import COMMON_SKIP

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, '..', '..', 'data', 'raw', 'ftsg-tech-trends', '2023.json')
NOISE = re.compile(r'^(TABLE OF|CONTENTS|TECH|INDUSTRY)$')
# contents items checked by hand and left out on purpose (INDEX.md rules, D40)
EXPLAINED = {
    'aimodels': 'sub-section band (AI Models)',
    'top10databreaches': 'list page, not a trend (like 2022 "Security Breaches from 2021")',
    'wearablesandbiointerfaces': 'tagged intro page without a key insight block, not a trend (D40)',
    '5genabledtechnologies': 'sub-section band of page 368; stored entries 2023-412..415 lack it in subsection (Known issues)',
}


def norm(s):
    return sc.norm(s.replace('ﬁ', 'fi').replace('ﬂ', 'fl'))


def toc_pages(pages, start, end):
    first = sc.toc_page(pages, start, end)
    out = [first]
    nxt = pages.get(str(first + 1))
    if nxt and any('TABLE OF' in ln or 'CONTENTS' in ln for ln in nxt[:4]):
        out.append(first + 1)
    return out


def toc_items(page):
    """Like scribd_2023.toc_items, but a title may start with a digit ("368  5G Enabled ...")."""
    items, cont = [], []
    for ln in page[1:]:
        if re.match(r'^\s*\d{1,3}\s+© 2023', ln):
            continue
        fr = sc.frags(ln)
        k = 0
        while k < len(fr):
            col, txt = fr[k]
            m = re.match(r'^(\d{2,3}) +(\S.*)$', txt)
            if m:
                items.append((int(m.group(1)), m.group(2).strip()))
            elif re.match(r'^\d{2,3}$', txt) and k + 1 < len(fr) and not re.match(r'^\d{2,3}$', fr[k + 1][1]) \
                    and fr[k + 1][0] - col < 12:
                items.append((int(txt), fr[k + 1][1].strip()))
                k += 1
            elif not re.match(r'^\d{1,3}$', txt) and not NOISE.match(txt):
                cont.append(txt.strip())
            k += 1
    return items, cont


def volume_headings(pages, lo, hi):
    out = {}
    for p in range(lo, hi + 1):
        pg = pages.get(str(p))
        if pg:
            hs, _ = sc.headings(pg)
            out[p] = [norm(h) for _, _, h in hs]
            kind, band = sc.page_kind(pg)
            if band:
                out[p].append(norm(band))
    return out


def check(pages):
    doc = json.load(open(PATH))
    entries = doc['entries']
    skipped = doc['skipped_toc_items']
    report = []
    for vi, (start, volume) in enumerate(sc.VOLUMES[:-1]):
        end = sc.VOLUMES[vi + 1][0]
        ents = [(i + 1, e) for i, e in enumerate(entries) if e['section'] == volume]
        labs = [(norm(e['label']), e) for _, e in ents]
        sk = [norm(x.split(': ', 1)[1]) for x in skipped if x.startswith(volume + ': ')]
        subs = set()
        for _, e in ents:
            for part in (e.get('subsection') or '').split(' / '):
                if part:
                    subs.add(norm(part))
        items, cont = [], []
        for tp in toc_pages(pages, start, end):
            it, co = toc_items(pages[str(tp)])
            items += it
            cont += co
        known = [nl for nl, _ in labs] + sk + sorted(subs)
        unmatched, used = [], set()
        for p, first in items:
            nf = norm(first)
            if not nf:
                continue
            hit = [k for k in known if k.startswith(nf) or (nf.startswith(k) and len(k) > 6)]
            for k in hit:
                rest = k[len(nf):]
                for c in cont:
                    nc = norm(c)
                    if rest and nc and nc in rest:
                        used.add(c)
            if hit:
                continue
            if any(re.match(pat, first, re.I) for pat in COMMON_SKIP) or sc.PERSON_RE.match(first) \
                    or first.rstrip().endswith(','):
                continue  # front/back matter, scenarios, expert perspectives (person names)
            if any(nf.startswith(k) for k in EXPLAINED):
                continue
            pg = pages.get(str(p))
            if pg and sc.page_kind(pg)[0] == 'divider':
                continue  # section divider page
            unmatched.append(dict(page=p, title=first, page_kind=sc.page_kind(pg)[0] if pg else 'no page'))
        alltext = ' '.join(known)
        orphans = [c for c in cont if c not in used and norm(c) and norm(c) not in alltext]
        # page offset: volume PDF page + (start - 2) = report page; Scribd entries carry report pages
        heads = volume_headings(pages, start, end - 1)
        conts = [norm(c) for c in cont if norm(c)]
        extras = set(conts) | {a + b for a, b in zip(conts, conts[1:])}
        truncated, noquote, headings_ = [], [], []
        for idx, e in ents:
            nl = norm(e['label'])
            rp = e['page'] if 'scribd' in e.get('source_url', '') else e['page'] + start - 2
            near = [h for q in range(rp - 1, rp + 4) for h in heads.get(q, [])]
            if nl not in near:
                for h in near:
                    if h.startswith(nl) and h[len(nl):] in extras:
                        truncated.append(dict(id=f'2023-{idx:03d}', label=e['label'], report_page=rp, heading=h))
                        break
                else:
                    # the contents title (label + loose lines) is longer than the label and its last
                    # line ends a heading on the page ("Catering Amusement Park" + "Experiences to an
                    # Audience" + "of One"; the heading omits "Park")
                    for x in sorted(extras, key=len, reverse=True):
                        if len(x) >= 8 and any(h.endswith(x) and len(os.path.commonprefix([h, nl])) >= 12 for h in near) \
                                and not any(h.startswith(nl) and len(h) > len(nl) + len(x) for h in near):
                            truncated.append(dict(id=f'2023-{idx:03d}', label=e['label'], report_page=rp,
                                                  heading=[h for h in near if h.endswith(x)][0]))
                            break
            pg = pages.get(str(rp)) if 'scribd' in e.get('source_url', '') else None
            if pg:
                lines = sc.body_lines(pg)
                if len(lines) <= 9 and sum(len(x.strip()) for x in lines) < 140:
                    headings_.append(dict(id=f'2023-{idx:03d}', label=e['label'], report_page=rp,
                                          page=' '.join(x.strip() for x in lines)))
            if not e.get('quote') and not any(h.startswith(nl) for h in near):
                noquote.append(dict(id=f'2023-{idx:03d}', label=e['label'], report_page=rp,
                                    confidence=e['confidence']))
        report.append(dict(volume=volume, contents_items=len(items), entries=len(ents),
                           unmatched=unmatched, orphans=orphans, truncated=truncated, title_page=headings_,
                           no_quote_no_heading=noquote))
    return report


if __name__ == '__main__':
    pages = json.load(open(sys.argv[1]))
    rep = check(pages)
    for r in rep:
        print(f"== {r['volume']}: {r['contents_items']} contents items, {r['entries']} entries")
        for u in r['unmatched']:
            print(f"   unmatched  p{u['page']} [{u['page_kind']}] {u['title']}")
        for o in r['orphans']:
            print(f"   orphan     {o}")
        for t in r['truncated']:
            print(f"   truncated  {t['id']} '{t['label']}' heading '{t['heading']}' (p{t['report_page']})")
        for t in r['title_page']:
            print(f"   title page {t['id']} '{t['label']}' (p{t['report_page']}: {t['page']})")
        for t in r['no_quote_no_heading']:
            print(f"   no quote   {t['id']} '{t['label']}' (p{t['report_page']}, {t['confidence']})")
    if '--json' in sys.argv:
        json.dump(rep, open(sys.argv[sys.argv.index('--json') + 1], 'w'), ensure_ascii=False, indent=1)
