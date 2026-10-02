"""D40: append FTSG umbrella section pages that carry the publisher's "Nth YEAR ON THE LIST" tag
and a KEY INSIGHT (or WHAT IT IS) block, as trends, after the existing entries of each edition.

Existing entries are never reordered or changed (D15). The pages were found by listing every
year tag in the full text of each edition and keeping the tagged pages whose title matches no
entry (2024 and 2025: none; 2022 already has them). Kept out on purpose:
- 2020 page 49 "Geopolitics, Geoeconomics and Warfare" (THIRTEENTH YEAR ON THE LIST): a
  narrative page under the AI section with no KEY INSIGHT block.
- 2023 page 551 "Wearables and Biointerfaces" (11TH YEAR ON THE LIST): an intro paragraph with
  no KEY INSIGHT or WHAT IT IS block.

Usage: python3 append_umbrella_d40.py <scratch dir> [--write]
  needs <scratch>/ss2020_full.json (parse_2020_full.py extract), <scratch>/fti2021.xml
  (pdftohtml -xml -i -q fti2021.pdf fti2021) and <scratch>/scribd2023.pages.json
  (scribd_2023.py pages). Running it twice is refused.
"""
import sys, os, json, re
from pdfxml import load, join_lines, first_sentence
from toc import reading_stream
from parse_2020_full import S1, S2, page_numbers
import scribd_2023 as sc

OUT = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
URL_2021 = 'https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf'
NOTE = ('Umbrella section page: carries the publisher\'s year tag and a key insight, so it counts as a '
        'trend (D40). Appended 2026-10-02 after the existing entries (D15); it is not a trend line in the contents.')

# edition: [(transcript part or None, slide or page, label as printed on the page, section, subsection)]
SPEC = {
    '2020': [
        ('s1', 27, 'Artificial Intelligence', 'Artificial Intelligence', None),
        ('s1', 61, 'Scoring', 'Scoring', None),
        ('s1', 69, 'Recognition', 'Recognition Technologies', None),
        ('s1', 81, 'Emerging Digital Interfaces', 'Emerging Digital Interfaces', None),
        ('s1', 89, 'Synthetic Media and Content', 'Synthetic Media and Content', None),
        ('s1', 133, 'Vices', 'Vices', None),
        ('s1', 161, 'Quantum and Edge', 'Quantum and Edge', None),
        ('s1', 187, 'Transportation Trends', 'Transportation', 'Transportation Trends'),
        ('s1', 219, 'Corporate Environmental Responsibility', 'Climate and Geoscience', 'Corporate Environmental Responsibility'),
        ('s1', 247, 'Biointerfaces', 'Biointerfaces and Wearables', 'Biointerfaces'),
        ('s1', 250, 'Wearables', 'Biointerfaces and Wearables', 'Wearables'),
        ('s1', 265, 'Home Automation', 'Home Automation', None),
        ('s2', 27, 'Security', 'Security', None),
        ('s2', 67, 'Blockchain', 'Blockchain', None),
        ('s2', 95, 'Space', 'Space and Off-Planet Trends', None),
    ],
    '2021': [
        (None, 44, 'Artificial Intelligence', 'Artificial Intelligence', None),
        (None, 97, 'Recognition', 'Scoring & Recognition', 'Recognition'),
        (None, 107, 'Scoring', 'Scoring & Recognition', 'Recognition / Scoring'),
        (None, 134, 'Synthetic Media and Content', 'New Realities & Synthetic Media', 'New Realities / Synthetic Media and Content'),
        (None, 304, 'Privacy', 'Privacy & Security', 'Privacy'),
        (None, 315, 'Security', 'Privacy & Security', 'Privacy / Security'),
        (None, 362, '5G', '5G, Robots & Transportation', '5G'),
        (None, 369, 'Edge Computing', '5G, Robots & Transportation', '5G / Edge Computing'),
        (None, 372, 'Quantum Computing', '5G, Robots & Transportation', '5G / Quantum Computing'),
        (None, 466, 'Space and Off-Planet Exploration', 'Energy, Climate & Space', 'Energy / Space and Off-Planet Exploration'),
    ],
    '2023': [
        (None, 461, 'Invisible Banking', 'Financial Services', 'Invisible Banking'),
    ],
}

TAG = re.compile(r'(\d+(?:ST|ND|RD|TH)|THIRTEENTH)\s*YEAR ON THE LIST', re.I)


def tag_of(text):
    m = TAG.search(text)
    return f'{m.group(1).upper()} YEAR ON THE LIST' if m else None


def rows_2020(S):
    tr = json.load(open(os.path.join(S, 'ss2020_full.json')))
    pn = {k: page_numbers(tr[k]) for k in ('s1', 's2')}
    out = []
    for part, slide, label, sec, sub in SPEC['2020']:
        t = tr[part][slide - 1]
        k = t.upper().find('KEY INSIGHT')
        block = re.split(r"\n[^\n\w]*(?:WHAT YOU NEED TO KNOW|WHY IT MATTERS|THE IMPACT|DEEPER DIVE)\b", t[k + len('KEY INSIGHT'):], flags=re.I)[0]
        q = first_sentence(join_lines(block.split('\n')).replace('\xad', ''))
        url = S1 if part == 's1' else S2
        out.append(dict(label=label, section=sec, subsection=sub, quote=q, years_on_list=tag_of(t), page=pn[part][slide - 1],
                        source_url=f'{url}#page={slide}', confidence='medium',
                        note=NOTE + ' Read from the full slide transcript of the publisher upload (SlideShare, Wayback); page is the printed report page.'))
    return out


def rows_2021(S):
    pages = {p['page']: p for p in load(os.path.join(S, 'fti2021.xml'))}
    out = []
    for _, pno, label, sec, sub in SPEC['2021']:
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
        tag = tag_of(' '.join(r['text'] for r in page['runs']))
        out.append(dict(label=label, section=sec, subsection=sub, quote=q, years_on_list=tag, page=pno,
                        source_url=f'{URL_2021}#page={pno}', confidence='high', note=NOTE))
    return out


def rows_2023(S):
    pages = json.load(open(os.path.join(S, 'scribd2023.pages.json')))
    out = []
    for _, pno, label, sec, sub in SPEC['2023']:
        lines = [x for x in pages[str(pno)] if x.strip()]
        i = next(j for j, x in enumerate(lines) if x.strip().startswith('WHAT IT IS'))
        left = []
        for x in lines[i + 1:]:
            if len(x) - len(x.lstrip()) >= 10:
                continue  # a line of the middle or right column only
            left.append(re.split(r'\s{3,}', x.strip())[0])
        q = first_sentence(join_lines(left))
        out.append(dict(label=label, section=sec, subsection=sub, quote=q, years_on_list=tag_of('\n'.join(lines)), page=pno,
                        source_url=f'{sc.SCRIBD}#page={pno}', confidence='medium',
                        note=NOTE + ' Read from the text layer of the archived Scribd copy of the full 2023 report (no font information); page is the page of the full report.'))
    return out


def main(S, write):
    for ed, fn in (('2020', rows_2020), ('2021', rows_2021), ('2023', rows_2023)):
        path = os.path.join(OUT, f'{ed}.json')
        doc = json.load(open(path))
        if any('(D40)' in (e.get('note') or '') for e in doc['entries']):
            raise SystemExit(f'{ed}: umbrella pages already appended')
        rank = max(e['rank'] for e in doc['entries'])
        for r in fn(S):
            assert r['quote'] and r['years_on_list'], (ed, r)
            rank += 1
            e = dict(rank=rank, label=r['label'], section=r['section'])
            if r['subsection']:
                e['subsection'] = r['subsection']
            e.update(quote=r['quote'], subject=r['label'], years_on_list=r['years_on_list'], page=r['page'],
                     source_url=r['source_url'], confidence=r['confidence'], note=r['note'])
            doc['entries'].append(e)
            print(ed, rank, e['label'], '|', e['years_on_list'], '|', e['quote'])
        if write:
            with open(path, 'w') as f:
                json.dump(doc, f, ensure_ascii=False, indent=2)
                f.write('\n')


if __name__ == '__main__':
    main(sys.argv[1], '--write' in sys.argv)
