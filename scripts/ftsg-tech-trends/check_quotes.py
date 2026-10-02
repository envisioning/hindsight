"""Flag quotes that probably do not belong to their trend (D33 checkers found some by hand).

Rules, per edition file:
  boilerplate  the quote is a page footer / copyright line / URL, not a sentence of the trend;
  shared       the same quote is stored on two or more entries (at most one can be right);
  neighbour    the quote shares no content word with its own label but does with the label of
               another entry on the same or adjacent page (the heading lookup slid to a neighbour).
Prints one line per flag; with --json writes the list to the given path.

Usage: python3 check_quotes.py [--json out.json] 2021 2022 2023 2024 2025
"""
import sys, os, re, json
from collections import defaultdict

RAW = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
STOP = set('the a an and or of in for to on with by from as at is are be its it this that new more how what why who will can into over use using based our your their ai'.split())


def words(s):
    out = set()
    for w in re.findall(r'[a-z0-9]+', s.lower()):
        if w in STOP or len(w) < 3:
            continue
        out.add(w[:5])  # crude stem
    return out


def check(ed):
    d = json.load(open(os.path.join(RAW, f'{ed}.json')))
    E = d['entries']
    flags = []
    by_q = defaultdict(list)
    for i, e in enumerate(E, 1):
        q = e.get('quote')
        if q:
            by_q[re.sub(r'\W+', ' ', q.lower()).strip()].append(i)
    for i, e in enumerate(E, 1):
        q = e.get('quote')
        if not q:
            continue
        if re.search(r'©|future today (institute|strategy group)\.?$|^www\.|https?://', q, re.I) or len(q) < 15:
            flags.append(dict(edition=ed, position=i, rule='boilerplate', label=e['label'], quote=q))
            continue
        same = by_q[re.sub(r'\W+', ' ', q.lower()).strip()]
        if len(same) > 1:
            flags.append(dict(edition=ed, position=i, rule='shared', label=e['label'], quote=q, shared_with=[x for x in same if x != i]))
            continue
        lw, qw = words(e['label']), words(q)
        if lw and not (lw & qw):
            for j, o in enumerate(E, 1):
                if j == i or not o.get('page') or not e.get('page') or abs(o['page'] - e['page']) > 1:
                    continue
                ow = words(o['label'])
                if len(ow & qw) >= max(1, min(2, len(ow))):
                    flags.append(dict(edition=ed, position=i, rule='neighbour', label=e['label'], quote=q,
                                      matches_label_of=j, other_label=o['label']))
                    break
    return flags


if __name__ == '__main__':
    args = sys.argv[1:]
    out = None
    if args and args[0] == '--json':
        out, args = args[1], args[2:]
    allf = []
    for ed in args:
        f = check(ed)
        allf += f
        print(ed, len(f), {r: sum(1 for x in f if x['rule'] == r) for r in ('boilerplate', 'shared', 'neighbour')})
        for x in f:
            print('  ', x['position'], x['rule'], '|', x['label'], '|', x['quote'][:70], '|', x.get('other_label', x.get('shared_with', '')))
    if out:
        json.dump(allf, open(out, 'w'), ensure_ascii=False, indent=1)
