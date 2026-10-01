"""Webbmedia Group 2014 Trend Report: parse `pdftotext -raw` output into 2014.json.

Usage: python3 parse_2014.py <wmg2014.raw.txt>
"""
import sys, os, re, json
from pdfxml import join_lines, first_sentence

URL = 'https://web.archive.org/web/20140124011002/http://webbmediagroup.com/upload/2014-Trend-Report.pdf'
lines = open(sys.argv[1], encoding='utf-8').read().replace('ﬃ', 'ffi').replace('ﬀ', 'ff').replace('ﬁ', 'fi').split('\n')
rows = []
i = 0
while i < len(lines):
    ln = lines[i].strip()
    m = re.match(r'^(TREND|Macro Trend): (.+)$', ln)
    if not m:
        i += 1
        continue
    kind, label = m.group(1), m.group(2).strip()
    buf = []
    j = i + 1
    if kind == 'TREND':
        while j < len(lines) and not lines[j].startswith('Key Takeaway:'):
            j += 1
        buf.append(lines[j].split(':', 1)[1])
        j += 1
        while j < len(lines) and lines[j].strip() and not re.match(r'^(Examples|Implications|Watchlist):', lines[j]):
            buf.append(lines[j]); j += 1
    else:
        while j < len(lines) and (not lines[j].strip() or lines[j].strip() in ('Explanation', 'Significance')):
            j += 1
        while j < len(lines) and lines[j].strip() and lines[j].strip() not in ('Explanation', 'Significance'):
            buf.append(lines[j]); j += 1
            if re.search(r'[.!?]\)?\s*$', lines[j - 1]):
                break
    text = join_lines(buf)
    q = first_sentence(text)
    row = dict(rank=len(rows) + 1, label=label, section='Macro trends' if kind != 'TREND' else 'Core trends')
    if q:
        row['quote'] = q
    row.update(subject=label, horizon='the coming year', target_year=2014, source_url=URL, confidence='high')
    note = 'Quote is the first sentence of the Key Takeaway.' if kind == 'TREND' else 'Quote is the first sentence of the Explanation column; the two-column layout makes the reading order less certain.'
    row['note'] = note + ' horizon/target_year from the cover line "what will impact your digital strategy most in the coming year" and "25 trends we’ll be exploring in depth in 2014".'
    if kind != 'TREND':
        row['confidence'] = 'medium'
    rows.append(row)
    i = j
doc = dict(edition='2014', published='2014-01', status='complete', sources=[URL],
           publisher='Webbmedia Group', series='Trend Report (later Future Today Institute Tech Trends Report)',
           title='2014 Trend Report', author='Amy Webb (founder, Webbmedia Group)',
           notes='22 core trends and 3 macro trends, in body order. Body headings differ slightly from the contents list (contents: "Sensors", "XaaS", "SVPAs"; body: "Sensor Fusion", "X as a Service (XaaS)", "Smart Virtual Personal Assistants (SVPAs)"); body headings are used. The contents list orders the macro trends Screens, Video, Data; the body prints Data, Screens, Video; body order is used. PDF creation date 2014-01-08.',
           entries=rows)
out = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', '2014.json')
json.dump(doc, open(out, 'w'), ensure_ascii=False, indent=2)
open(out, 'a').write('\n')
print('2014', len(rows), 'entries', sum('quote' in r for r in rows), 'with quote')
