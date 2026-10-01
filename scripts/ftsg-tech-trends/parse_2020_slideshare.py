"""2020 Tech Trends Report: trend titles from the table of contents in the archived
SlideShare transcript of the publisher's own upload (section 1 of 2).

Usage: python3 parse_2020_slideshare.py <ss2020a.txt> [--dump]
The .txt is the visible text of
https://web.archive.org/web/20200818165913/https://www.slideshare.net/AmyWebb33/future-today-institute-2020-tech-trends-report-231311623
(tags and scripts stripped, one text node per line).

The transcript keeps each contents column in order but not the column order on a
slide, so entries are sorted by page number (stable). Section headers are not marked in
the transcript; an entry is treated as a section header when it is the only entry on its
page and the next entry starts two or more pages later, or when it names a known
front/back-matter page.
"""
import sys, os, re, json

SRC = 'https://web.archive.org/web/20200818165913/https://www.slideshare.net/AmyWebb33/future-today-institute-2020-tech-trends-report-231311623'
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(lines) if l.startswith('04\t') or re.match(r'^0?4\s*\tKey Takeaways', l))
end = next(i for i in range(start, len(lines)) if lines[i].startswith('Each trend offers'))
entries = []
for l in lines[start:end]:
    m = re.match(r'^(\d{1,3})\s*\t\s*(.*)$', l)
    if m:
        entries.append([int(m.group(1)), m.group(2).strip()])
    elif entries and not re.match(r'^(\d+\.?|©.*|Table of Contents)$', l.strip()):
        prev = entries[-1][1]
        entries[-1][1] = (prev + ('' if prev.endswith('-') else ' ') + l.strip()).strip()
seen = set()
uniq = []
for p, t in entries:
    t = re.sub(r'\s+', ' ', t)
    if (p, t) in seen or not t:
        continue
    seen.add((p, t))
    uniq.append((p, t))
uniq.sort(key=lambda x: x[0])
FRONT = re.compile(r'^(Key Takeaways|How To Use Our Report|Strategic Questions|Methodology|Weak Signals|Events That Will|About |How to Think|Scenario|Key Questions|Introduction|Table of Contents|Closing|Selected Sources)', re.I)
pages = {}
for p, t in uniq:
    pages.setdefault(p, []).append(t)
plist = sorted(pages)
# The 31 trend sections named in the publisher's contents (reviewed by hand against the
# page-gap heuristic; single-page trends such as "Digital Frailty" are kept as trends).
SECTIONS = {'Artificial Intelligence', 'Scoring', 'Recognition Technologies', 'Emerging Digital Interfaces',
            'Synthetic Media and Content', 'Content', 'Social Media Platforms', 'Sports and Games', 'Toys', 'Vices',
            'Journalism', 'Censorship', 'Quantum and Edge', '5G, Robotics and the Industrial Internet of Things',
            'Transportation', 'Logistics and Supply Chain', 'Energy', 'Climate and Geoscience',
            'AgTech & Global Supply of Food', 'Synthetic Biology and Genomic Editing', 'Biointerfaces and Wearables',
            'Health and Medical Technologies', 'Home Automation', 'Privacy', 'Security', 'Geopolitics', 'Smart Cities',
            'Blockchain', 'Financial Technologies and Cryptocurrencies', 'Space and Off-Planet Trends'}
# Group headings inside a section (first entry of a page group, no trend body of their own).
SUBSECTIONS = {'Enterprise', 'Business Ecosystem', 'Processes, Systems and Computational Neuroscience',
               'Content and Creativity', 'Consumer Products and Services', 'Geopolitics, Geoeconomics and Warfare',
               'Society', 'Synthetic Media Technologies', 'Synthetic Media and Society', 'Transportation Trends',
               'Corporate Environmental Responsibility', 'Biointerfaces', 'Wearables'}
NOT_TRENDS = re.compile(r'^Strategic Guidance', re.I)
rows, sections, skipped = [], [], []
cur_section = sub = None
for idx, (p, t) in enumerate(uniq):
    if FRONT.match(t) or NOT_TRENDS.match(t):
        skipped.append(f'{p} {t}')
        continue
    if t in SECTIONS:
        cur_section, sub = t, None
        sections.append(f'{p} {t}')
        continue
    if t in SUBSECTIONS:
        sub = t
        sections.append(f'{p} {t} (sub-section)')
        continue
    row = dict(rank=len(rows) + 1, label=t, section=cur_section)
    if sub:
        row['subsection'] = sub
    rows.append(row)
    row.update(subject=t, page=p,
               source_url=SRC, confidence='medium',
               note='Title from the contents list in the SlideShare transcript of the publisher upload; order and section from contents page numbers.')
if '--dump' in sys.argv:
    for s in sections: print('S', s)
    for r in rows: print(r['page'], r['section'], r.get('subsection'), '|', r['label'])
    sys.exit()
doc = dict(edition='2020', published='2020-03', status='partial', sources=[SRC,
           'https://web.archive.org/web/20200524095558/http://futuretodayinstitute.com/2020-tech-trends/'],
           publisher='Future Today Institute', series='Tech Trends Report', title='2020 Tech Trends Report (13th edition)',
           author='Amy Webb (founder, Future Today Institute)',
           notes='Partial. The PDF was distributed through WeTransfer and is not archived. Titles come from the contents pages in the archived SlideShare transcript of the publisher\'s own upload (account AmyWebb33, section 1 of 2). The publisher states 406 trends in 31 sections. No quotes: the transcript covers only the first slides. Contents entries are sorted by page number; the transcript does not mark headers, so the 30 section names and 13 sub-section names were identified by hand (inferred_sections); other group headings may remain among the trends.',
           inferred_sections=sections, skipped_toc_items=skipped, entries=rows)
out = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', '2020.json')
json.dump(doc, open(out, 'w'), ensure_ascii=False, indent=2)
open(out, 'a').write('\n')
print('2020', len(rows), 'entries;', len(sections), 'inferred sections;', len(skipped), 'skipped')
