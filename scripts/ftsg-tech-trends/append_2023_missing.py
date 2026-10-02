"""Append the 2023 trends that check_2023_contents.py found missing from 2023.json (issue #26).

Existing entries are never reordered or changed (D15). New entries follow the last one, in
report order (volume, then contents order):

- Climate & Energy: the volume's contents run over two pages (volume PDF pages 3 and 4); the
  first capture read only page 3, so every trend on page 4 is missing (Comprehensive Carbon
  Accounting for Businesses ... Domed Cities). Read with the same PDF pipeline as the first
  capture (build.py, classify_2023, pages 3 and 4 with carry_sections); the rows of page 3
  must equal the stored Climate entries, else the script stops.
- Computing: "Undersea Fiber, Brought To You By Big Tech" (report page 374, Networking /
  Private Networks). Its contents number and title are split in the text layer, so the Scribd
  parser read it as the band heading of the page.
- Health Care & Medicine: "Brain Machine Interfaces, Brain-Computer Interfaces, and
  Neuroprosthetics" (volume PDF page 34): a medium-weight contents entry whose page carries
  "6TH YEAR ON THE LIST" and a WHAT IT IS block, so a trend under D40. Missed by
  append_umbrella_d40.py.
- Government, Policy & Security: "Remote Kill Switches" (report page 615, Security / Policy)
  and "Attacking Underwater IT Infrastructure" (616, Security / Cyberwarfare): their contents
  page numbers are detached from the titles in the text layer, so the Scribd parser dropped
  them; "Cyberwarfare" (616) is the sub-section band of that page.

Usage: python3 append_2023_missing.py <scratch dir> [--write]
  needs <scratch>/fti2023_climate.xml and fti2023_health.xml (pdftohtml -xml -i -q),
  fti2023_climate.raw.txt and fti2023_health.raw.txt (pdftotext -raw) and
  <scratch>/scribd2023.pages.json (scribd_2023.py pages). Without --write it prints the rows.
  Running it twice is refused.
"""
import sys, os, json, re
import build
from editions import EDITIONS, COMMON_SKIP, SKIP_SECTIONS, classify_2023
from pdfxml import load
from toc import full_page_trend
import scribd_2023 as sc

S = sys.argv[1]
WRITE = '--write' in sys.argv
OUT = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
PATH = os.path.join(OUT, '2023.json')
CLIMATE_URL = 'https://web.archive.org/web/20230517163222/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Climate_Energy.pdf'
HEALTH_URL = 'https://web.archive.org/web/20240723080427/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Health_Care_Medicine-.pdf'
AUDIT = 'Appended 2026-10-02 after the existing entries (D15) by the contents audit (check_2023_contents.py, issue #26).'
SCRIBD_NOTE = ('Read from the text layer of the archived Scribd copy of the full 2023 report (no font information); '
               'page is the page of the full report.')

# (volume, report page, label as printed in the contents, subsection, heading on the page)
SCRIBD = [
    ('Computing', 374, 'Undersea Fiber, Brought To You By Big Tech', 'Networking / Private Networks',
     'UNDERSEA FIBER, BROUGHT TO YOU BY BIG TECH',
     'Its contents page number is split from the title in the text layer, so the first capture read it as the band heading of the page.'),
    ('Government, Policy & Security', 615, 'Remote Kill Switches', 'Security / Policy', 'REMOTE KILL SWITCHES',
     'Its contents page number is detached from the title in the text layer, so the first capture dropped it.'),
    ('Government, Policy & Security', 616, 'Attacking Underwater IT Infrastructure', 'Security / Cyberwarfare',
     'ATTACKING UNDERWATER IT INFRASTRUCTURE',
     'Its contents page number is detached from the title in the text layer, so the first capture dropped it. '
     '"Cyberwarfare" (page 616) is the sub-section band of the page.'),
]


def n(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('ﬁ', 'fi').replace('ﬂ', 'fl'))


def climate_rows(old):
    EDITIONS['2023climate'] = dict(
        volumes=[('fti2023_climate', 3, 'Climate & Energy', CLIMATE_URL), ('fti2023_climate', 4, 'Climate & Energy', CLIMATE_URL)],
        carry_sections=True, classify=classify_2023, full_page=True, skip=COMMON_SKIP,
        skip_sections=SKIP_SECTIONS, source_url='', meta=dict(edition='2023climate'))
    build.OUT = S
    build.main('2023climate', S)
    d = json.load(open(os.path.join(S, '2023climate.json')))
    stored = [e for e in old if e['section'] == 'Climate & Energy']
    got = d['entries']
    for a, b in zip(stored, got):
        if a['label'] != b['label'] or a.get('quote') != b.get('quote'):
            sys.exit(f'Climate page-3 rows differ from 2023.json: {a["label"]} / {b["label"]}')
    new = [r for r in got[len(stored):] if r.get('subsection') != 'Expert Perspectives']
    raw = n(open(os.path.join(S, 'fti2023_climate.raw.txt'), encoding='utf-8', errors='replace').read())
    for r in new:
        r.pop('rank', None)
        notes = [AUDIT, 'The volume contents run over two pages; the first capture read only the first, so the trends listed on the second were missing.']
        if r.get('quote') and n(r['quote']) not in raw:
            r['confidence'] = 'medium'
            notes.append('Quote not found verbatim in the extracted PDF text; check before publishing.')
        if not r.get('quote'):
            notes.append('No quote: the trend heading or its first sentence was not located automatically in the body text.')
        r['note'] = ' '.join(notes)
    # page 4 also lists three expert perspectives (build.py's name pattern catches only one of
    # them; the other two come out as rows under "Expert Perspectives" and are dropped above)
    skipped = ['Climate & Energy: expert perspective (person name omitted)'] * 3 + \
              [x for x in d['skipped_toc_items'] if 'expert perspective' not in x]
    return new, skipped


def health_row():
    pages = {p['page']: p for p in load(os.path.join(S, 'fti2023_health.xml'))}
    label = 'Brain Machine Interfaces, Brain-Computer Interfaces, and Neuroprosthetics'
    quote, tag, qpage = full_page_trend(pages, label, 34)
    raw = n(open(os.path.join(S, 'fti2023_health.raw.txt'), encoding='utf-8', errors='replace').read())
    conf = 'high' if quote and n(quote) in raw else 'medium'
    r = dict(label=label, section='Health Care & Medicine', subsection='Health Care & Medicine Trends')
    if quote:
        r['quote'] = quote
    r['subject'] = build.subject_of(label)
    if tag:
        r['years_on_list'] = tag
    r['page'] = 34
    r['source_url'] = f'{HEALTH_URL}#page=34'
    r['confidence'] = conf
    r['note'] = (AUDIT + ' Umbrella page: a medium-weight (sub-section) contents entry whose page carries the publisher\'s '
                 'year tag and a WHAT IT IS block, so it counts as a trend (D40); append_umbrella_d40.py missed it. '
                 'The trends under it (Neural Engineering) are separate entries.')
    return r


def scribd_rows():
    pages = json.load(open(os.path.join(S, 'scribd2023.pages.json')))
    rows = []
    for vol, p, label, sub, heading, why in SCRIBD:
        pg = pages[str(p)]
        hs, grid = sc.headings(pg, skip_band=(sc.page_kind(pg)[0] == 'band'))
        hit = [(ln, col) for ln, col, h in hs if sc.norm(h) == sc.norm(heading)]
        if not hit:
            sys.exit(f'heading {heading} not found on page {p}')
        text = sc.column_text(grid, *hit[0])
        quote = sc.first_sentence(text) if text else None
        # verbatim check against the raw lines of the heading's column (columns interleave in the page text)
        col = hit[0][1]
        body = sc.norm(''.join(x for fr in grid for c, x in fr if abs(c - col) <= 3))
        r = dict(label=label, section=vol, subsection=sub)
        if quote:
            r['quote'] = quote
        r['subject'] = build.subject_of(label)
        r['page'] = p
        r['source_url'] = f'{sc.SCRIBD}#page={p}'
        r['confidence'] = 'high' if quote and sc.norm(quote) in body else 'medium'
        r['note'] = ' '.join([AUDIT, why, SCRIBD_NOTE])
        rows.append(r)
    return rows


def main():
    doc = json.load(open(PATH))
    if any(e['label'] == 'Remote Kill Switches' for e in doc['entries']):
        sys.exit('2023.json already holds the audit rows; refusing to append twice.')
    clim, clim_skipped = climate_rows(doc['entries'])
    sr = scribd_rows()
    new = clim + [sr[0], health_row()] + sr[1:]
    for r in new:
        if r.get('quote') and len(r['quote']) > 400:
            sys.exit(f'quote over 400 characters: {r["label"]}')
    last = max(e['rank'] for e in doc['entries'])
    n0 = len(doc['entries'])
    for i, r in enumerate(new, 1):
        print(n0 + i, r['section'], r['page'], r['confidence'], '|', r['label'], '|', r.get('subsection'), '|', (r.get('quote') or '-')[:70])
    if not WRITE:
        return
    for i, r in enumerate(new, 1):
        doc['entries'].append({'rank': last + i, **{k: v for k, v in r.items() if k not in ('rank', 'horizon')}})
    doc['skipped_toc_items'] += clim_skipped
    doc['notes'] += (
        f' Update 2026-10-02 (contents audit, issue #26): every volume contents list was compared with the entries '
        f'(check_2023_contents.py) and {len(new)} missing trends were appended as entries {n0 + 1}-{n0 + len(new)}: '
        f'{len(clim)} Climate & Energy trends from the second contents page of that volume, which the first capture did not read; '
        '"Undersea Fiber, Brought To You By Big Tech" (Computing); "Brain Machine Interfaces, Brain-Computer Interfaces, and '
        'Neuroprosthetics" (Health Care & Medicine, tagged umbrella page, D40); "Remote Kill Switches" and "Attacking Underwater IT '
        'Infrastructure" (Government, Policy & Security). Stored labels cut at a contents line wrap are listed in INDEX.md (Known issues), not edited.')
    json.dump(doc, open(PATH, 'w'), ensure_ascii=False, indent=2)
    open(PATH, 'a').write('\n')
    print(f'appended {len(new)}: entries {n0 + 1}-{n0 + len(new)}; total {len(doc["entries"])}; '
          f'with quote {sum(1 for e in doc["entries"] if e.get("quote"))}')


if __name__ == '__main__':
    main()
