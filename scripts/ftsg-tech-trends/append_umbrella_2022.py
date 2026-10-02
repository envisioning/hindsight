"""D40 follow-up: append the 2022 umbrella section pages that carry the publisher's
"Nth YEAR ON THE LIST" tag and a KEY INSIGHT block, after the existing 2022 entries (D15).

The first D40 pass (append_umbrella_d40.py) listed year tags in 2020, 2021, 2023, 2024 and 2025
only; 2022 was assumed complete because its contents already carried Recognition, Scoring and
Privacy as entries. sweep_year_tags.py (whitespace-free tag match over every tagged page of
2021-2025) found five 2022 umbrella pages that are sub-section headings in the contents and so
were never captured. Page 6 (methodology page with a sample "Scoring" page, 4TH YEAR ON THE LIST)
is not a trend.

Usage: python3 append_umbrella_2022.py <scratch dir> [--write]
  needs <scratch>/fti2022.xml (pdftohtml -xml -i -q fti2022.pdf fti2022). Running it twice is refused.
"""
import sys, os, json
from pdfxml import load, join_lines, first_sentence
from toc import reading_stream
from build import page_action
from editions import EDITIONS
from sweep_year_tags import tags_in

OUT = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', '2022.json')
URL = 'https://web.archive.org/web/20220316173530/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf'
MARK = '(D40, 2022 sweep)'
NOTE = ('Umbrella section page: carries the publisher\'s year tag and a key insight, so it counts as a trend '
        f'{MARK}. Appended 2026-10-02 after the existing entries (D15); in the contents it is a sub-section heading, '
        'not a trend line. Missed by the first D40 pass, which did not list the 2022 year tags.')
ORD = {1: 'ST', 2: 'ND', 3: 'RD'}

# (page, label as printed on the page, section, subsection: the contents path the trends under it carry)
SPEC = [
    (210, 'Altered States', 'Work, Culture & Play', 'Culture / Altered States'),
    (221, 'eSports and Gaming', 'Work, Culture & Play', 'Play / eSports and Gaming'),
    (292, 'Wearables and Biointerfaces', 'Health & Medicine', 'Wearables and Biointerfaces'),
    (609, 'Green Tech', 'Climate, Energy & Space', 'Climate and Sustainability / Green Tech Trends'),
    (615, 'Environmental, Social and Corporate Governance (ESG) Programs', 'Climate, Energy & Space',
     'Climate and Sustainability / Environmental, Social and Corporate Governance (ESG) Programs'),
]


def tag_text(n):
    suf = 'TH' if 10 <= n % 100 <= 20 else ORD.get(n % 10, 'TH')
    return f'{n}{suf} YEAR ON THE LIST'


def rows(S):
    pages = {p['page']: p for p in load(os.path.join(S, 'fti2022.xml'))}
    out = []
    for pno, label, sec, sub in SPEC:
        page = pages[pno]
        stream = reading_stream(page)
        q = None
        for i, r in enumerate(stream):
            if r['text'].strip().upper().startswith('KEY INSIGHT'):
                body, bsig = [], None
                for b in stream[i + 1:]:
                    s = (b['size'], b['family'], b['color'])
                    bsig = bsig or s
                    if s != bsig:
                        break
                    body.append(b['text'])
                q = first_sentence(join_lines(body))
                break
        tags, _ = tags_in('\n'.join(r['text'] for r in page['runs']))
        assert len(tags) == 1, (pno, tags)
        big = ' '.join(r['text'] for r in page['runs'] if r['size'] >= 30)
        assert ' '.join(big.split()) == label, (pno, big)
        out.append(dict(label=label, section=sec, subsection=sub, quote=q, years_on_list=tag_text(tags[0]),
                        horizon=page_action(page), page=pno))
    return out


def main(S, write):
    doc = json.load(open(OUT))
    if any(MARK in (e.get('note') or '') for e in doc['entries']):
        raise SystemExit('2022: umbrella pages already appended')
    rank = max(e['rank'] for e in doc['entries'])
    for r in rows(S):
        assert r['quote'] and r['years_on_list'], r
        rank += 1
        e = dict(rank=rank, label=r['label'], section=r['section'], subsection=r['subsection'], quote=r['quote'],
                 subject=r['label'])
        if r['horizon']:
            e['horizon'] = r['horizon']
        e.update(years_on_list=r['years_on_list'], page=r['page'], source_url=f"{URL}#page={r['page']}",
                 confidence='high', note=NOTE + (' ' + EDITIONS['2022']['action_note'] if r['horizon'] else ''))
        doc['entries'].append(e)
        print(rank, e['label'], '|', e['subsection'], '|', e['years_on_list'], '|', e.get('horizon'), '|', e['quote'])
    if write:
        with open(OUT, 'w') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
            f.write('\n')


if __name__ == '__main__':
    main(sys.argv[1], '--write' in sys.argv)
