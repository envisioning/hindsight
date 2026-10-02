"""Append the 2023 volumes missing from the first capture to data/raw/ftsg-tech-trends/2023.json.

Existing entries are never reordered or changed (D15: ids are positions, then ids.json
governs). New entries follow the last existing one, ranks continuing, in report order:
Artificial Intelligence (volume PDF, same pipeline as the other PDF volumes), then the seven
volumes read from the archived Scribd text layer of the full report (scribd_2023.py).

Usage: python3 append_2023.py <scratch dir>
  needs <scratch>/fti2023_ai.xml, fti2023_ai.raw.txt (pdftohtml -xml -i, pdftotext -raw)
  and <scratch>/scribd2023.pages.json (scribd_2023.py pages).
Running it twice is refused: it checks that the AI volume is not already present.
"""
import sys, os, json, re
import build
from editions import EDITIONS, COMMON_SKIP, SKIP_SECTIONS, classify_2023
import scribd_2023 as sc

S = sys.argv[1]
OUT = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
PATH = os.path.join(OUT, '2023.json')
AI_URL = 'https://web.archive.org/web/20231026215250/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Artificial_Intelligence-1.pdf'
SCRIBD_VOLUMES = ['Mobility, Robotics & Drones', 'Computing', 'Financial Services', 'Government, Policy & Security',
                  'Space', 'Supply Chain & Logistics', 'Entertainment']
SCRIBD_NOTE = ('Read from the text layer of the archived Scribd copy of the full 2023 report (no font information); '
               'page is the page of the full report.')


def n(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('ﬁ', 'fi').replace('ﬂ', 'fl'))


def ai_rows():
    EDITIONS['2023ai'] = dict(
        volumes=[('fti2023_ai', 3, 'Artificial Intelligence', AI_URL), ('fti2023_ai', 4, 'Artificial Intelligence', AI_URL)],
        carry_sections=True,
        classify=classify_2023, full_page=True, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS, source_url='',
        meta=dict(edition='2023ai'))
    build.OUT = S
    build.main('2023ai', S)
    d = json.load(open(os.path.join(S, '2023ai.json')))
    raw = n(open(os.path.join(S, 'fti2023_ai.raw.txt'), encoding='utf-8', errors='replace').read())
    for r in d['entries']:
        if r.get('quote') and n(r['quote']) not in raw:
            r['confidence'] = 'medium'
            r['note'] = (r.get('note', '') + ' Quote not found verbatim in the extracted PDF text (line-break hyphenation or reading order); check before publishing.').strip()
    return d['entries'], d['skipped_toc_items']


def scribd_rows():
    pages = json.load(open(os.path.join(S, 'scribd2023.pages.json')))
    names = [v for _, v in sc.VOLUMES]
    rows, skipped = [], []
    for vol in SCRIBD_VOLUMES:
        got, sk = sc.parse_volume(pages, names.index(vol))
        skipped += sk
        for g in got:
            r = dict(label=g['label'], section=vol)
            if g['subsection']:
                r['subsection'] = g['subsection']
            if g['quote']:
                r['quote'] = g['quote']
            r['subject'] = build.subject_of(g['label'])
            if g['tag']:
                r['years_on_list'] = g['tag']
            r['page'] = g['page']
            r['source_url'] = f"{sc.SCRIBD}#page={g['page']}"
            r['confidence'] = g['conf'] if g['quote'] or g['conf'] == 'low' else 'medium'
            notes = [SCRIBD_NOTE]
            if g['conf'] == 'low':
                notes.append('No body heading matched this contents entry: the label may be cut where the contents line wrapped, and no quote was taken.')
            elif not g['quote']:
                notes.append('No quote: the first sentence under the heading was not located in the text layer.')
            r['note'] = ' '.join(notes)
            rows.append(r)
    return rows, skipped


def main():
    doc = json.load(open(PATH))
    if any(e['section'] == 'Artificial Intelligence' for e in doc['entries']):
        sys.exit('2023.json already holds the Artificial Intelligence volume; refusing to append twice.')
    a, ask = ai_rows()
    b, bsk = scribd_rows()
    last = max(e['rank'] for e in doc['entries'])
    n0 = len(doc['entries'])
    for i, r in enumerate(a + b, 1):
        r['rank'] = last + i
        r.pop('horizon', None)
        doc['entries'].append({'rank': r['rank'], **{k: v for k, v in r.items() if k != 'rank'}})
    doc['skipped_toc_items'] += ask + bsk
    doc['status'] = 'complete'
    doc['sources'] = doc['sources'] + [AI_URL, sc.SCRIBD]
    doc['notes'] = (
        'Complete (2026-10-02): all 14 volumes. First capture (entries 1-257): six volume PDFs archived complete (Bioengineering, Climate & Energy, Health Care & Medicine, Metaverse, News & Information, Web3). '
        f'Appended (entries {n0 + 1}-{n0 + len(a)}): Artificial Intelligence from a later complete Wayback capture of its volume PDF (2023-10-26; the 2023-09-23 capture is truncated). '
        f'Appended (entries {n0 + len(a) + 1}-{n0 + len(a) + len(b)}): Mobility, Robotics & Drones; Computing; Financial Services; Government, Policy & Security; Space; Supply Chain & Logistics; Entertainment, '
        'whose volume PDFs were never archived (downloads were form-gated), read from the text layer of the full 820-page report as uploaded to Scribd by a reader (document 648865649, Wayback capture 2026-09-23). '
        'That parser was checked against the six PDF volumes: 255 of 257 labels and 243 quotes agree. '
        'rank is the order of capture (first capture, then appended volumes in report order), not one print order across volumes; within each volume it follows the contents. '
        'Labels are the trend entries of each volume table of contents; sections, sub-sections, Spotlight overview blocks, scenario questions, expert perspectives and front/back matter are excluded. '
        'Quotes are the first sentence under the trend heading, or of the WHAT IT IS / KEY INSIGHT block on one-trend-per-page layouts.')
    json.dump(doc, open(PATH, 'w'), ensure_ascii=False, indent=2)
    open(PATH, 'a').write('\n')
    print(f'appended {len(a)} AI + {len(b)} Scribd entries: ranks {last + 1}-{last + len(a) + len(b)}; total {len(doc["entries"])}')
    print('with quote:', sum(1 for r in a + b if r.get('quote')), 'confidence:',
          {c: sum(1 for r in a + b if r['confidence'] == c) for c in ('high', 'medium', 'low')})


if __name__ == '__main__':
    main()
