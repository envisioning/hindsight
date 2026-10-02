"""Contents-vs-capture check for the PDF editions 2021, 2022, 2024 and 2025 (issue #26).

Usage: python3 check_contents.py $S   (reads $S/fti2021.xml, fti2022.xml, fti2024.xml, ftsg2025.xml)

The 2023 capture lost a whole second contents page (check_2023_contents.py). This script checks the
other PDF editions the same way, without writes:
1. every page in the PDF that parses as a contents list (6 or more numbered entries pointing forward,
   in order) must be one of the contents pages in editions.py, and the one or two pages after each
   listed contents page must not continue the list;
2. every contents item on a listed page must be a stored entry label, a stored sub-section, a
   skipped item, or front/back matter (COMMON_SKIP and the per-volume overview headings).
Items it reports need a look in the PDF. On 2026-10-02 the only unlisted contents-like pages were
the report-level contents (2021 page 4, 2022 page 5: volume and methodology lists), no list continued
on a further page, and the unmatched items were section or sub-section headings without trends
(2021 "China's AI Rules", an essay; 2022 "AI: Techniques and Influential Models", a
section holding only skipped lists; 2024 "What is Europe doing?", "What is the Middle East doing?",
"How will AI change the nature of work?", "Green Processes") or full-page dividers (2025 "Emerging
Applications", "Chips"), so nothing was appended.
"""
import os, pickle, re, sys, json
from pdfxml import load
from toc import toc_entries, norm
from editions import EDITIONS, COMMON_SKIP

FILES = {'2021': 'fti2021.xml', '2022': 'fti2022.xml', '2024': 'fti2024.xml', '2025': 'ftsg2025.xml'}
FRONT = [r'^your guide', r'^top 5 things', r'^key events', r'^pioneers and power players',
         r'^letter from the authors?', r'^why .* matter', r'^when will ', r'^investments and actions',
         r'^authors', r'^selected sources', r'^\w+( \w+)? trends$']


def pages(S, fn):
    p = os.path.join(S, fn)
    pk = p + '.pkl'
    if os.path.exists(pk):
        return pickle.load(open(pk, 'rb'))
    pg = load(p)
    pickle.dump(pg, open(pk, 'wb'))
    return pg


def main(S):
    for ed, fn in FILES.items():
        pg = pages(S, fn)
        by = {x['page']: x for x in pg}
        listed = sorted({v[0] for v in EDITIONS[ed]['volumes']})
        unlisted = []
        for x in pg:
            nums = [e['page'] for e in toc_entries(x) if e['page']]
            if len(nums) >= 6 and nums == sorted(nums) and all(n >= x['page'] for n in nums) and x['page'] not in listed:
                unlisted.append(x['page'])
        cont = []
        for p in listed:
            for q in (p + 1, p + 2):
                if q in listed or q not in by:
                    continue
                if len([e for e in toc_entries(by[q]) if e['page'] and e['page'] > q]) >= 3:
                    cont.append(q)
        d = json.load(open(os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', f'{ed}.json')))
        known = set()
        for e in d['entries']:
            known.add(norm(e['label']))
            for s in (e.get('subsection') or '').split(' / '):
                known.add(norm(s))
        for s in d.get('skipped_toc_items', []):
            known.add(norm(s.split(': ', 1)[-1]))
        miss = []
        for p in listed:
            for e in toc_entries(by[p]):
                n = norm(e['label'])
                if not n or n.isdigit() or n in known:
                    continue
                if any(re.match(r, e['label'], re.I) for r in COMMON_SKIP + FRONT):
                    continue
                if any(n in k or k in n for k in known if len(k) > 6 and len(n) > 6):
                    continue
                miss.append((p, e['page'], e['label'], e['color'], e['family']))
        print(f'{ed}: {len(d["entries"])} entries; unlisted contents pages {unlisted}; continuation pages {cont}; unmatched items {len(miss)}')
        for m in miss:
            print('   contents p.%s -> p.%s %r (%s %s)' % m)


if __name__ == '__main__':
    main(sys.argv[1])
