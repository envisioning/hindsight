"""2019 Tech Trends Report: trends 192-244 from the archived SlideShare transcript of the
publisher's own upload (part 2 of 2; part 1 is not archived).

Usage: python3 parse_2019_slideshare.py <ss2019b.txt> <ss2019a.txt>
ss2019a.txt is the visible text of
https://web.archive.org/web/20200830004208/https://www.slideshare.net/webbmedia/2019-emerging-tech-trends-report-part-1-of-2-136450918
whose transcript includes the full table of contents (all trends, in printed order).
The .txt is the visible text of
https://web.archive.org/web/20190603232304/https://www.slideshare.net/AmyWebb33/2019-emerging-tech-trends-report-part-2-of-2
(tags and scripts stripped, one text node per line).
"""
import sys, os, re, json
from pdfxml import join_lines, first_sentence

SRC = 'https://web.archive.org/web/20190603232304/https://www.slideshare.net/AmyWebb33/2019-emerging-tech-trends-report-part-2-of-2'
L = open(sys.argv[1], encoding='utf-8').read().split('\n')
trends, section = {}, None
order = []
i = 0
while i < len(L):
    m = re.match(r'^(\d{2})([A-Z][A-Z ,&-]+)$', L[i])
    if m and int(m.group(1)) < 40:
        parts = [m.group(2)]
        j = i + 1
        while j < len(L) and re.match(r'^[A-Z][A-Z ,&-]+$', L[j]) and not re.match(r'^\d', L[j]):
            parts.append(L[j]); j += 1
        section = ' '.join(parts).strip(' ,').title().replace('And ', 'and ').replace('E-Sports', 'E-Sports')
        i = j
        continue
    m = re.match(r'^(\d{3}) (.+)$', L[i])
    if m and section and 150 < int(m.group(1)) < 400 and int(m.group(1)) not in trends:
        n = int(m.group(1))
        trends[n] = dict(label=m.group(2).strip(), section=section)
        order.append(n)
    i += 1
# quotes and "year on the list" tags: a Key Insight block belongs to the next TREND footer
pending = []
last_footer = -1
for k, l in enumerate(L):
    if l == 'Key Insight':
        buf = []
        for x in L[k + 1:k + 15]:
            if x in ('Examples', "What’s Next", 'Watchlist') or x.startswith('©'):
                break
            buf.append(x)
        pending.append(first_sentence(join_lines(buf)))
    m = re.match(r'^TREND (\d+) (\w+) (?:year|YEAR) on the list', l, re.I)
    if m:
        n = int(m.group(1))
        if n in trends and 'years_on_list' not in trends[n]:
            trends[n]['years_on_list'] = f'{m.group(2).upper()} YEAR ON THE LIST'
            if len(pending) == 1 and pending[0]:
                trends[n]['quote'] = pending[0]
        pending = []
# full contents list from part 1
A = open(sys.argv[2], encoding='utf-8').read().split('\n')
toc = []
for k, l in enumerate(A):
    if l != 'Table of Contents':
        continue
    for x in A[k + 1:]:
        if re.match(r'^\d+\.$', x) or x.startswith('\u00a9'):
            break
        m = re.match(r'^(\d{3}) (.+)$', x)
        if m:
            toc.append([int(m.group(1)), m.group(2).strip()])
        elif toc:
            toc[-1][1] += ' ' + x.strip()
SRC_A = 'https://web.archive.org/web/20200830004208/https://www.slideshare.net/webbmedia/2019-emerging-tech-trends-report-part-1-of-2-136450918'
def nn(t):
    return re.sub(r'[^a-z0-9]', '', t.lower())
bynorm = {nn(t['label']): (n, t) for n, t in trends.items()}
BACK = re.compile(r'^(\d+ Weak Signals|The Big Nine$|The Signals Are Talking$|Companies, Organizations|Weak Signals|Scenarios?$|About |Methodology|Glossar|Sources|Endnotes|Events|Smartest Cities|The Future Today Institute|Disclaimer|Using and Sharing|How To |Contact)', re.I)
rows, sec, started, skipped = [], None, False, []
for page, t in toc:
    if started is None:
        skipped.append(f'{page} {t}')
        continue
    if not started:
        if page >= 70 and t.lower() == 'artificial intelligence':
            started = True
            sec = 'Artificial Intelligence'
        continue
    if BACK.match(t):
        skipped.append(f'{page} {t}')
        if re.match(r'^\d+ Weak Signals', t):
            started = None
        continue
    if (t.upper() == t or t.lower() == t) and re.search(r'[A-Za-z]', t):
        sec = t.title().replace(' And ', ' and ').replace(' Of ', ' of ')
        continue
    row = dict(rank=len(rows) + 1, label=t, section=sec)
    hit = bynorm.get(nn(t))
    if hit and hit[1].get('quote'):
        row['quote'] = hit[1]['quote']
    row['subject'] = t
    if hit:
        row['trend_number'] = hit[0]
        if hit[1].get('years_on_list'):
            row['years_on_list'] = hit[1]['years_on_list']
    row.update(page=page, source_url=SRC_A, confidence='medium',
               note='Title and order from the contents pages in the SlideShare transcript of the publisher upload (part 1).' +
                    (' Quote and years-on-list tag from part 2 (' + SRC + ').' if hit and (hit[1].get('quote') or hit[1].get('years_on_list')) else '') +
                    ' The Act Now / Informs Strategy / Revisit Later / Keep Vigilant Watch quadrant is a graphic and cannot be read from the transcript.')
    rows.append(row)
if rows:
    order = []
rows_b = []
for n in order:
    t = trends[n]
    row = dict(rank=n, label=t['label'], section=t['section'])
    if t.get('quote'):
        row['quote'] = t['quote']
    row.update(subject=t['label'])
    if t.get('years_on_list'):
        row['years_on_list'] = t['years_on_list']
    row.update(source_url=SRC, confidence='medium',
               note='Rank is the trend number printed in the report. From the SlideShare transcript of the publisher upload; the transcript covers only the first slides of part 2, so most trends have no quote. The Act Now / Informs Strategy / Revisit Later / Keep Vigilant Watch quadrant is a graphic and cannot be read from the transcript.')
    rows_b.append(row)
if not rows:
    rows = rows_b
doc = dict(edition='2019', published='2019-03', status='partial', sources=[SRC_A, SRC],
           publisher='Future Today Institute', series='Tech Trends Report', title='2019 Tech Trends Report (12th edition)',
           author='Amy Webb (founder, Future Today Institute)',
           notes='Partial: all trend titles from the contents pages (printed order, sections from the upper-case contents headings), but quotes only for the few trends whose pages are in the archived transcript of part 2. The PDF was distributed through WeTransfer and is not archived. The publisher states 315 trends. trend_number is the printed trend number where part 2 shows it. Front matter before the Artificial Intelligence section and back matter are excluded.',
           skipped_toc_items=skipped, entries=rows)
out = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', '2019.json')
json.dump(doc, open(out, 'w'), ensure_ascii=False, indent=2)
open(out, 'a').write('\n')
print('2019', len(rows), 'entries', sum('quote' in r for r in rows), 'with quote')
