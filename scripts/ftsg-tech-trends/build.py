"""Build data/raw/ftsg-tech-trends/<edition>.json from pdftohtml XML of a Tech Trends PDF.

Usage: python3 build.py <edition> <path-to-xml>
Run from this folder. See README.md for inputs.
"""
import sys, os, json, pickle, re, datetime
from pdfxml import load
from toc import toc_entries, find_body, full_page_trend, norm
from editions import EDITIONS

OUT = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends')
PERSON_RE = re.compile(r'^[A-Z][a-z]+(?: [A-Z][\w.]*)+, ')
ROLE_RE = re.compile(r'\b(Senior|Director|Lead|Counsel|President|Editor|Professor|Founder|CEO|Chief|Head|Manager|Officer|Fellow|Partner|Researcher|Scientist|Analyst)\b')
ACTIONS = ('Watch Closely', 'Informs Strategy', 'Act Now')


def page_action(page):
    """2022: the page header highlights one of three labels in white."""
    for r in page['runs']:
        t = r['text'].strip()
        if t in ACTIONS and r['color'] == '#ffffff':
            return t
    return None


def main(edition, xml):
    cfg = EDITIONS[edition]
    cache = {}

    def pages_of(path):
        if path not in cache:
            pk = path + '.pkl'
            if os.path.exists(pk):
                pages = pickle.load(open(pk, 'rb'))
            else:
                pages = load(path)
                pickle.dump(pages, open(pk, 'wb'))
            cache[path] = {p['page']: p for p in pages}
        return cache[path]

    entries = []
    skipped = []
    sections, skip_sec, prev_volume = [], False, None
    for vol in cfg['volumes']:
        if len(vol) == 2:
            (toc_page, volume), stem, url = vol, None, cfg['source_url']
        else:
            stem, toc_page, volume, url = vol
        by_no = pages_of(xml if stem is None else os.path.join(xml, stem + '.xml'))
        # carry_sections: a contents list continued on the next page keeps its open section
        # (used only for the 2023 AI volume appended later; other editions unchanged)
        if not (cfg.get('carry_sections') and volume == prev_volume):
            sections = []
            skip_sec = False
        prev_volume = volume
        for e in toc_entries(by_no[toc_page], **cfg.get('toc_kwargs', {})):
            if re.match(r'^scenario', e['label'], re.I):
                skipped.append(f"{volume}: {e['label']}")
                continue
            kind = cfg['classify'](e)
            if kind == 'trend' and cfg.get('divider_size') and e['page'] in by_no:
                big = [r for r in by_no[e['page']]['runs'] if r['size'] >= cfg['divider_size']]
                if big and norm(e['label'])[:10] in norm(''.join(r['text'] for r in big)):
                    kind = 'subsection'
            if kind == 'section':
                sections = [e['label']]
                skip_sec = any(re.match(p, e['label'], re.I) for p in cfg['skip_sections'])
                continue
            if kind == 'subsection':
                sections = sections[:1] + [e['label']]
                continue
            if PERSON_RE.match(e['label']) and ROLE_RE.search(e['label']):
                skipped.append(f"{volume}: expert perspective (person name omitted)")
                continue
            if kind == 'skip' or skip_sec or any(re.match(p, e['label'], re.I) for p in cfg['skip'] + cfg.get('extra_skip', [])):
                skipped.append(f"{volume}: {e['label']}")
                continue
            entries.append(dict(volume=volume, sections=list(sections), e=e, by_no=by_no, url=url))
    rows = []
    for i, x in enumerate(entries, 1):
        e, by_no = x['e'], x['by_no']
        quote, qpage, tag = None, None, None
        if e['page'] and cfg.get('full_page'):
            quote, tag, qpage = full_page_trend(by_no, e['label'], e['page'])
        if e['page'] and not quote:
            quote, qpage = find_body(by_no, e['label'], e['page'], look=cfg.get('look', 2),
                                     heading_bold=cfg.get('heading_bold', True))
        row = dict(rank=i, label=e['label'], section=x['volume'])
        if x['sections']:
            row['subsection'] = ' / '.join(x['sections'])
        if quote:
            row['quote'] = quote
        row['subject'] = None
        if cfg.get('action') and e['page'] and e['page'] in by_no:
            act = page_action(by_no[qpage or e['page']])
            if act:
                row['horizon'] = act
        if tag:
            row['years_on_list'] = tag
        row['page'] = e['page']
        row['source_url'] = x['url'] + (f"#page={e['page']}" if e['page'] else '')
        row['confidence'] = 'high'
        notes = []
        if not quote:
            notes.append('No quote: the trend heading or its first sentence was not located automatically in the body text.')
        if row.get('horizon'):
            notes.append(cfg['action_note'])
        if notes:
            row['note'] = ' '.join(notes)
        rows.append(row)
    for r in rows:
        r['subject'] = subject_of(r['label'])
    doc = dict(cfg['meta'])
    doc['entries'] = rows
    doc['skipped_toc_items'] = skipped
    path = os.path.join(OUT, f'{edition}.json')
    with open(path, 'w') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write('\n')
    nq = sum(1 for r in rows if 'quote' in r)
    print(edition, len(rows), 'entries,', nq, 'with quote,', len(skipped), 'skipped')


def subject_of(label):
    """Short subject label: the printed trend name without a trailing parenthetical gloss."""
    s = re.sub(r'\s+', ' ', label).strip()
    return s


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
