"""Builds data/raw/ecb-projections/ from the ECB "Past macroeconomic projections" page,
the ECB Macroeconomic Projection Database (MPD) and Eurostat.

Usage: python3 build.py [input_dir]
input_dir is the folder that fetch.sh filled (default: this folder).
"""
import csv, json, os, re, sys, datetime, html

HERE = os.path.dirname(os.path.abspath(__file__))
IN = sys.argv[1] if len(sys.argv) > 1 else HERE
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'ecb-projections')
os.makedirs(OUT, exist_ok=True)
TABLE_URL = 'https://www.ecb.europa.eu/mopo/devel/ecana/html/table.en.html'
MPD_URL = 'https://data-api.ecb.europa.eu/service/data/MPD/A.U2.YER+HIC...?format=csvdata'
MPD_SERIES = 'https://data.ecb.europa.eu/data/datasets/MPD/MPD.A.U2.%s.A.%s.0000'
MONTHS = {'March': 3, 'June': 6, 'September': 9, 'December': 12}
EXCODE = {3: 'W', 6: 'G', 9: 'S', 12: 'A'}
VARS = {'HICP': ('HICP inflation', 'HIC', 'Annual average percentage change of the euro area Harmonised Index of Consumer Prices'),
        'Real GDP': ('real GDP growth', 'YER', 'Annual percentage change of euro area real GDP')}
HOR = {0: 'current_year', 1: 'next_year', 2: 'year_plus_2', 3: 'year_plus_3'}
NUM = r'-?\d+(?:\.\d+)?'


def parse_cell(s):
    """Returns (point, low, high) from a table cell. Any part can be None."""
    s = html.unescape(s).replace('\xa0', ' ').strip()
    m = re.fullmatch(r'\[\s*(%s)\s*[,\-]\s*(%s)\s*\]' % (NUM, NUM), s)
    if m:
        return None, float(m.group(1)), float(m.group(2))
    m = re.fullmatch(r'(%s)\s*\[\s*(%s)\s*(?:,|\s-\s|-(?=\d))\s*(%s)\s*\]' % (NUM, NUM, NUM), s)
    if m:
        return float(m.group(1)), float(m.group(2)), float(m.group(3))
    m = re.fullmatch(r'\[?\s*(%s)\s*\]?' % NUM, s)
    if m:
        return float(m.group(1)), None, None
    return None, None, None


# MPD: {(exercise, item): {year: (value, status)}}
mpd = {}
with open(os.path.join(IN, 'mpd.csv')) as f:
    for r in csv.DictReader(f):
        if r['OBS_VALUE'] == '':
            continue
        mpd.setdefault((r['PD_SEAS_EX'], r['PD_ITEM']), {})[int(r['TIME_PERIOD'])] = (float(r['OBS_VALUE']), r['OBS_STATUS'])

# MPD exercises that hold exactly the same HICP and GDP values as another exercise (a database error).
mpd_sig = {}
for (x, item), v in mpd.items():
    mpd_sig.setdefault(x, {})[item] = sorted((y, a[0]) for y, a in v.items() if a[1] != 'A')
mpd_dup = {}
for x in mpd_sig:
    for o in mpd_sig:
        if x != o and mpd_sig[x] == mpd_sig[o]:
            mpd_dup[x] = o

t = open(os.path.join(IN, 'table.html')).read()
t = re.sub(r'<!--.*?-->', '', t, flags=re.S)  # the page keeps hidden scenario rows in HTML comments
editions = {}
problems = []
for m in re.finditer(r'<table>(.*?)</table>', t, re.S):
    body = m.group(1)
    cap = re.search(r'<caption>(.*?)</caption>', body, re.S)
    if not cap:
        continue
    cap = re.sub(r'\s+', ' ', html.unescape(cap.group(1))).strip()
    cm = re.match(r'(March|June|September|December) (\d{4})', cap)
    if not cm:
        problems.append('unparsed table caption: %s' % cap); continue
    mon, ey = MONTHS[cm.group(1)], int(cm.group(2))
    ed = '%d-%02d' % (ey, mon)
    yrs = [html.unescape(y).strip() for y in re.findall(r'<th class="number">([^<]*)</th>', body)]
    yrs = [int(y) for y in yrs if y.strip().isdigit()]
    ex = '%s%02d' % (EXCODE[mon], ey % 100)
    sc = re.search(r'<(?:em|td|th)[^>]*>[^<]*scenario', body, re.I)
    scen_note = None
    if sc:
        body = body[:sc.start()]  # keep the baseline rows only; scenario rows follow a label row
        scen_note = 'The ECB table for this edition also shows scenario rows; only the baseline is captured.'
    staff = 'ECB staff' if mon in (3, 9) else 'Eurosystem staff'
    ents = []
    for r in re.findall(r'<tr>(.*?)</tr>', body, re.S):
        h = re.search(r'<th>(.*?)</th>', r, re.S)
        if not h:
            continue
        name = html.unescape(h.group(1)).replace('\xa0', ' ').strip()
        if name not in VARS:
            continue
        var, item, dfn = VARS[name]
        cells = [re.sub('<[^>]+>', '', c) for c in re.findall(r'<td[^>]*>(.*?)</td>', r, re.S)]
        if len(cells) != len(yrs):
            problems.append('%s: %s has %d cells for %d years' % (ed, name, len(cells), len(yrs)))
        for y, c in zip(yrs, cells):
            if y < ey:
                continue  # estimates for past years are not projections
            p, lo, hi = parse_cell(c)
            if p is None and lo is None:
                problems.append('%s: %s %d cell not parsed: %r' % (ed, name, y, c)); continue
            value = p if p is not None else round((lo + hi) / 2, 3)
            e = {'economy': 'Euro area', 'variable': var, 'metric': var,
                 'statistic': 'point' if p is not None else 'range midpoint',
                 'target_year': y, 'horizon': HOR.get(y - ey, 'year_plus_%d' % (y - ey)), 'value': value, 'unit': '%'}
            if lo is not None:
                e['value_low'] = lo; e['value_high'] = hi
            mv = mpd.get((ex, item), {}).get(y)
            if mv is not None:
                e['mpd_value'] = mv[0]
            e['definition'] = dfn
            e['label'] = '%s / %s / %s' % (cap.split(' (')[0], name, y)
            e['source_url'] = TABLE_URL
            e['confidence'] = 'high'
            notes = []
            if p is None:
                notes.append('The ECB published a range only; value is the midpoint computed by Hindsight.')
            if mv is None:
                notes.append('No MPD value for exercise %s.' % ex)
            elif p is not None and abs(mv[0] - p) > 0.051 and ex in mpd_dup:
                notes.append('The MPD (exercise %s) gives %s, but MPD exercise %s holds the same projection values as %s, so the MPD value looks wrong; the page value is kept.' % (ex, mv[0], ex, mpd_dup[ex]))
                problems.append('MPD %s: holds the same values as %s' % (ex, mpd_dup[ex]))
            elif p is not None and abs(mv[0] - p) > 0.051:
                notes.append('The MPD (exercise %s) gives %s, not %s.' % (ex, mv[0], p))
                problems.append('%s: %s %d table %s vs MPD %s' % (ed, name, y, p, mv[0]))
                e['confidence'] = 'medium'
            if scen_note:
                notes.append(scen_note)
            if notes:
                e['note'] = ' '.join(notes)
            ents.append(e)
    if ed in editions:
        problems.append('%s: duplicate table on the page' % ed)
    editions[ed] = {'edition': ed, 'published': ed, 'publisher': 'European Central Bank', 'series': '%s macroeconomic projections for the euro area' % staff,
                    'mpd_exercise': ex, 'entries': ents}

# Page errors: two editions with identical HICP and GDP rows.
sig = {}
for ed, e in editions.items():
    k = json.dumps([(x['variable'], x['target_year'], x['value']) for x in e['entries']])
    sig.setdefault(k, []).append(ed)
dups = [v for v in sig.values() if len(v) > 1]
for v in dups:
    problems.append('identical HICP and GDP rows on the ECB page for editions %s' % ', '.join(sorted(v)))

# MPD exercises not on the page.
allex = sorted(set(k[0] for k in mpd), key=lambda e: (e[1:] if e[1:] > '50' else '1' + e[1:], 'WGSA'.index(e[0])))
page_ex = set(e['mpd_exercise'] for e in editions.values())
mpd_only = []
for x in allex:
    if x not in page_ex:
        yy = int(x[1:]); y = 1900 + yy if yy > 50 else 2000 + yy
        mpd_only.append('%d-%02d (%s)' % (y, {v: k for k, v in EXCODE.items()}[x[0]], x))

now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
prog = ['# ecb-projections progress', '', '| Edition | Status | Entries | Written |', '|---|---|---|---|']
summary = {}
for ed in sorted(editions):
    e = editions[ed]
    probs = [p for p in problems if p.startswith(ed + ':')] + [p for p in problems if ed in p and p.startswith('identical')]
    have = set(x['variable'] for x in e['entries'])
    status = 'complete' if have == {'HICP inflation', 'real GDP growth'} else 'partial'
    stats = sorted(set(x['statistic'] for x in e['entries']))
    notes = []
    if 'range midpoint' in stats:
        notes.append('The ECB published ranges for this edition; value is the range midpoint computed by Hindsight; value_low and value_high are the published bounds.')
    if 'point' in stats and any('value_low' in x for x in e['entries']):
        notes.append('The ECB published a point projection with a range; value is the point.')
    notes.append('mpd_value is the point value that the ECB Macroeconomic Projection Database holds for exercise %s (retrieved later; for range editions it is not a published number at the time).' % e['mpd_exercise'])
    if probs:
        notes.append('Problems: ' + '; '.join(probs))
        if any(p.startswith('identical') for p in probs):
            status = 'partial'
            for x in e['entries']:
                x['confidence'] = 'low' if x.get('mpd_value') is None or abs(x['mpd_value'] - x['value']) > 0.051 else x['confidence']
    out = dict(e)
    out['status'] = status
    out['sources'] = [TABLE_URL, MPD_SERIES % ('HIC', e['mpd_exercise']), MPD_SERIES % ('YER', e['mpd_exercise'])]
    out['entries'] = e['entries']
    out['notes'] = ' '.join(notes)
    out = {k: out[k] for k in ['edition', 'published', 'publisher', 'series', 'mpd_exercise', 'status', 'sources', 'entries', 'notes']}
    json.dump(out, open(os.path.join(OUT, ed + '.json'), 'w'), indent=1, ensure_ascii=False)
    prog.append('| %s | %s | %d entries | %s |' % (ed, status, len(e['entries']), now))
    summary[ed] = [status, stats, len(e['entries'])]
open(os.path.join(OUT, 'PROGRESS.md'), 'w').write('\n'.join(prog) + '\n')

# Realized values from Eurostat.
def es(path):
    d = json.load(open(os.path.join(IN, path)))
    ids, size = d['id'], d['size']
    tix = {v: k for k, v in d['dimension']['time']['category']['index'].items()}
    gix = {v: k for k, v in d['dimension']['geo']['category']['index'].items()}
    gpos = ids.index('geo'); tpos = ids.index('time')
    out = {}
    for k, v in d['value'].items():
        k = int(k); idx = []
        for s in reversed(size):
            idx.append(k % s); k //= s
        idx = list(reversed(idx))
        out.setdefault(gix[idx[gpos]], {})[int(tix[idx[tpos]])] = v
    return out, d.get('updated')

hicp, hu = es('hicp.json')
gdp, gu = es('gdp.json')
rz = []
for y in range(1999, 2026):
    if y in hicp.get('EA', {}):
        rz.append({'economy': 'Euro area', 'variable': 'HICP inflation', 'target_year': y, 'value': hicp['EA'][y], 'unit': '%',
                   'definition': 'Annual average rate of change, all-items HICP, euro area (changing composition)',
                   'source_url': 'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_aind/default/table?lang=en',
                   'series': 'prc_hicp_aind, geo=EA, coicop=CP00, unit=RCH_A_AVG', 'vintage': hu, 'confidence': 'high'})
    if y in gdp.get('EA', {}):
        e = {'economy': 'Euro area', 'variable': 'real GDP growth', 'target_year': y, 'value': gdp['EA'][y], 'unit': '%',
             'definition': 'Chain-linked volumes, percentage change on previous year, not calendar adjusted, euro area (changing composition)',
             'source_url': 'https://ec.europa.eu/eurostat/databrowser/view/nama_10_gdp/default/table?lang=en',
             'series': 'nama_10_gdp, geo=EA, na_item=B1GQ, unit=CLV_PCH_PRE', 'vintage': gu, 'confidence': 'high'}
        if y in gdp.get('EA20', {}):
            e['value_ea20'] = gdp['EA20'][y]
        rz.append(e)
json.dump({'source': 'Eurostat', 'retrieved': datetime.date.today().isoformat(),
           'notes': 'Latest Eurostat values, not first releases. EA is the euro area with changing composition (EA11 in 1999 to EA21 in 2026); value_ea20 is the fixed 20-country aggregate. ECB projections refer to the euro area composition of the projection year. The ECB projects working-day-adjusted real GDP in most editions; the annual Eurostat series here is not calendar adjusted, so small differences are expected. No errors or grades are computed.',
           'entries': rz}, open(os.path.join(OUT, 'realized.json'), 'w'), indent=1, ensure_ascii=False)

json.dump({'problems': problems, 'mpd_only': mpd_only, 'dups': dups, 'editions': summary}, open(os.path.join(IN, 'build_summary.json'), 'w'), indent=1)
print(len(editions), 'editions;', len(rz), 'realized;', len(problems), 'problems')
for p in problems:
    print(' ', p)
print('MPD only:', mpd_only)
