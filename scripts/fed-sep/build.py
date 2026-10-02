"""Builds data/raw/fed-sep/ from ALFRED vintages and Federal Reserve projection tables.

Usage: python3 build.py [input_dir]
input_dir is the folder that fetch.sh filled (default: this folder).
"""
import csv, json, os, re, sys, datetime, html
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
REALIZED_ONLY = '--realized-only' in sys.argv
ARGS = [a for a in sys.argv[1:] if a != '--realized-only']
IN = ARGS[0] if ARGS else HERE
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'fed-sep')
os.makedirs(OUT, exist_ok=True)
ALF = 'https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=%s&vintage_date=%s'
ALF_LATEST = 'https://alfred.stlouisfed.org/graph/alfredgraph.csv?id=%s'
FED_TAB = 'https://www.federalreserve.gov/monetarypolicy/fomcprojtabl%s.htm'

# SEP release date -> (edition id = FOMC meeting month, meeting dates as text).
# Before April 2011 the SEP was released with the minutes, about three weeks after the meeting.
EARLY = {
    '2007-11-20': ('2007-10', '2007-10-30/31'), '2008-02-20': ('2008-01', '2008-01-29/30'),
    '2008-05-21': ('2008-04', '2008-04-29/30'), '2008-07-16': ('2008-06', '2008-06-24/25'),
    '2008-11-19': ('2008-10', '2008-10-28/29'), '2009-02-18': ('2009-01', '2009-01-27/28'),
    '2009-05-20': ('2009-04', '2009-04-28/29'), '2009-07-15': ('2009-06', '2009-06-23/24'),
    '2009-11-24': ('2009-11', '2009-11-03/04'), '2010-02-17': ('2010-01', '2010-01-26/27'),
    '2010-05-19': ('2010-04', '2010-04-27/28'), '2010-07-14': ('2010-06', '2010-06-22/23'),
    '2010-11-23': ('2010-11', '2010-11-02/03'), '2011-02-16': ('2011-01', '2011-01-25/26'),
}
CT_DATES = ['2007-11-20', '2008-02-20', '2008-05-21', '2008-07-16', '2008-11-19', '2009-02-18', '2009-05-20', '2009-07-15', '2009-11-24', '2010-02-17', '2010-05-19', '2010-07-14', '2010-11-23', '2011-02-16', '2011-04-27', '2011-06-22', '2011-11-02', '2012-01-25', '2012-04-25', '2012-06-20', '2012-09-13', '2012-12-12', '2013-03-20', '2013-06-19', '2013-09-18', '2013-12-18', '2014-03-19', '2014-06-18', '2014-09-17', '2014-12-17', '2015-03-18', '2015-06-17']
MD_DATES = ['2015-12-16', '2016-03-16', '2016-06-15', '2016-09-21', '2016-12-14', '2017-03-15', '2017-06-14', '2017-09-20', '2017-12-13', '2018-03-21', '2018-06-13', '2018-09-26', '2018-12-19', '2019-03-20', '2019-06-19', '2019-09-18', '2019-12-11', '2020-06-10', '2020-09-16', '2020-12-16', '2021-03-17', '2021-06-16', '2021-09-22', '2021-12-15', '2022-03-16', '2022-06-15', '2022-09-21', '2022-12-14', '2023-03-22', '2023-06-14', '2023-09-20', '2023-12-13', '2024-03-20', '2024-06-12', '2024-09-18', '2024-12-18', '2025-03-19', '2025-06-18', '2025-09-17', '2025-12-10', '2026-03-18', '2026-06-17', '2026-09-16']
DOT_DATES = ['2012-01-25', '2012-04-25', '2012-06-20', '2012-09-13', '2012-12-12', '2013-03-20', '2013-06-19', '2013-09-18', '2013-12-18', '2014-03-19', '2014-06-18', '2014-09-17', '2014-12-17', '2015-03-18']

VARS = [  # key, variable name, CT series stem, median series, definition
    ('gdp', 'real GDP growth', 'GDPC1', 'GDPC1MD', 'Percent change in real GDP from the fourth quarter of the previous year to the fourth quarter of the year indicated'),
    ('unemp', 'unemployment rate', 'UNRATE', 'UNRATEMD', 'Average civilian unemployment rate in the fourth quarter of the year indicated'),
    ('pce', 'PCE inflation', 'PCECTPI', 'PCECTPIMD', 'Percent change in the PCE price index from the fourth quarter of the previous year to the fourth quarter of the year indicated'),
    ('core', 'core PCE inflation', 'JCXFE', 'JCXFEMD', 'Percent change in the PCE price index excluding food and energy from the fourth quarter of the previous year to the fourth quarter of the year indicated'),
    ('ffr', 'federal funds rate', None, 'FEDTARMD', 'Value at the end of the year indicated of the appropriate target level (or midpoint of the target range) for the federal funds rate'),
]
DEF = {v[1]: v[4] for v in VARS}
HOR = {0: 'current_year', 1: 'next_year', 2: 'year_plus_2', 3: 'year_plus_3', 4: 'year_plus_4'}


def read_csv(path):
    """Returns (column header, {observation date: float})."""
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return None, {}
    with open(path) as f:
        r = list(csv.reader(f))
    if not r or r[0][0] != 'observation_date':
        return None, {}
    out = {}
    for row in r[1:]:
        if len(row) > 1 and row[1] not in ('', '.'):
            out[row[0]] = float(row[1])
    return r[0][1], out


# Realized values (latest ALFRED vintage).
def write_realized():
    """realized.json from the latest ALFRED vintages in IN/alfred. Run alone with --realized-only (#66 vintage refresh)."""
    def series(s):
        return read_csv(os.path.join(IN, 'alfred', '%s_latest.csv' % s))


    def q4avg(m, y):
        xs = [m.get('%d-%02d-01' % (y, k)) for k in (10, 11, 12)]
        return None if None in xs else sum(xs) / 3


    rz = []
    vint = {}
    hG, gdp = series('GDPC1'); hP, pce = series('PCEPI'); hC, core = series('PCEPILFE'); hU, un = series('UNRATE')
    _, tar = series('DFEDTAR'); _, tu = series('DFEDTARU'); _, tl = series('DFEDTARL')
    for y in range(2007, 2026):
        g1, g0 = gdp.get('%d-10-01' % y), gdp.get('%d-10-01' % (y - 1))
        if g1 and g0:
            rz.append({'variable': 'real GDP growth', 'target_year': y, 'value': round((g1 / g0 - 1) * 100, 2), 'unit': '%',
                       'definition': DEF['real GDP growth'], 'computed_from': 'GDPC1 (quarterly, SAAR, chained dollars): Q4 level / previous Q4 level',
                       'source_url': ALF_LATEST % 'GDPC1', 'vintage': hG, 'confidence': 'high'})
        for var, m, s, h in (('PCE inflation', pce, 'PCEPI', hP), ('core PCE inflation', core, 'PCEPILFE', hC)):
            a, b = q4avg(m, y), q4avg(m, y - 1)
            if a and b:
                rz.append({'variable': var, 'target_year': y, 'value': round((a / b - 1) * 100, 2), 'unit': '%', 'definition': DEF[var],
                           'computed_from': '%s (monthly index): average of Oct-Dec / average of Oct-Dec of the previous year' % s,
                           'source_url': ALF_LATEST % s, 'vintage': h, 'confidence': 'high'})
        u = q4avg(un, y)
        if u is None and '%d-12-01' % y in un:
            months = {k: un[k] for k in ('%d-10-01' % y, '%d-11-01' % y, '%d-12-01' % y) if k in un}
            rz.append({'variable': 'unemployment rate', 'target_year': y, 'value': None, 'unit': '%', 'definition': DEF['unemployment rate'],
                       'available_months': months, 'source_url': ALF_LATEST % 'UNRATE', 'vintage': hU, 'confidence': 'low',
                       'note': 'BLS published no unemployment rate for some fourth-quarter months (October 2025: no household survey during the federal government shutdown). The fourth-quarter average is not computed.'})
        if u is not None:
            rz.append({'variable': 'unemployment rate', 'target_year': y, 'value': round(u, 2), 'unit': '%', 'definition': DEF['unemployment rate'],
                       'computed_from': 'UNRATE (monthly, SA): average of Oct-Dec', 'source_url': ALF_LATEST % 'UNRATE', 'vintage': hU, 'confidence': 'high'})
        k = '%d-12-31' % y
        if k in tu and k in tl:
            rz.append({'variable': 'federal funds rate', 'target_year': y, 'value': round((tu[k] + tl[k]) / 2, 3), 'unit': '%', 'definition': DEF['federal funds rate'],
                       'computed_from': 'midpoint of DFEDTARU and DFEDTARL on %s' % k, 'source_url': ALF_LATEST % 'DFEDTARU', 'confidence': 'high'})
        elif k in tar:
            rz.append({'variable': 'federal funds rate', 'target_year': y, 'value': tar[k], 'unit': '%', 'definition': DEF['federal funds rate'],
                       'computed_from': 'DFEDTAR on %s' % k, 'source_url': ALF_LATEST % 'DFEDTAR', 'confidence': 'high'})
    json.dump({'source': 'FRED/ALFRED, Federal Reserve Bank of St. Louis (underlying data: BEA for GDPC1, PCEPI, PCEPILFE; BLS for UNRATE; Federal Reserve Board for DFEDTAR, DFEDTARU, DFEDTARL)',
               'retrieved': datetime.date.today().isoformat(),
               'notes': 'Latest vintage values, not first releases. GDP and PCE values change with every BEA comprehensive revision, so a later grading step may prefer first-release values (ALFRED vintages). Years 2007 to 2025. Values are computed by Hindsight from the level series with the SEP definitions; they are not errors or grades.',
               'entries': rz}, open(os.path.join(OUT, 'realized.json'), 'w'), indent=1, ensure_ascii=False)
    return rz


if REALIZED_ONLY:
    print(len(write_realized()), 'realized rows')
    sys.exit(0)


def ed_of(d):
    if d in EARLY:
        return EARLY[d]
    return d[:7], d


def rnd(x):
    return None if x is None else round(x, 3)


class Tables(HTMLParser):
    def __init__(s):
        super().__init__(); s.tables = []; s.row = None; s.cell = None
    def handle_starttag(s, t, a):
        if t == 'table': s.tables.append([])
        elif t == 'tr': s.row = []
        elif t in ('td', 'th'): s.cell = ''
    def handle_endtag(s, t):
        if t in ('td', 'th') and s.row is not None and s.cell is not None:
            s.row.append(s.cell.strip()); s.cell = None
        elif t == 'tr' and s.row is not None and s.tables:
            s.tables[-1].append(s.row); s.row = None
    def handle_data(s, d):
        if s.cell is not None: s.cell += d


TAB_FILE = {'2012-12-12': '20121217'}  # the December 2012 accessible page has a different file name


def tab_url(date):
    return FED_TAB % TAB_FILE.get(date, date.replace('-', ''))


def fed_tables(date):
    p = Tables()
    f = os.path.join(IN, 'fed', 'fomcprojtabl%s.htm' % date.replace('-', ''))
    t = open(f).read()
    if 'Page not Found' in t and os.path.exists(f + '.alt'):
        t = open(f + '.alt').read()
    p.feed(t)
    return p.tables


SEPC_URL = 'https://www.federalreserve.gov/monetarypolicy/files/FOMC%sSEPcompilation.pdf'
SEPC_VARS = ['real GDP growth', 'unemployment rate', 'PCE inflation', 'core PCE inflation', 'federal funds rate']


def compilation(meet2):
    """Individual projections from Table 2 of the SEP compilation. Returns {(variable, year or None): [values]}."""
    f = os.path.join(IN, 'sepc', '%s.txt' % meet2)
    if not os.path.exists(f):
        return {}
    out = {}; on = False; nvar = 4
    for line in open(f, errors='replace'):
        if re.search(r'Table 2\b', line) and 'Appendix' not in line:
            on = True
            if 'continued' not in line:
                nvar = 4
        elif re.search(r'Table 2 Appendix|Table 3|Figure 1', line):
            on = False
        if not on:
            continue
        if re.search(r'Federal|[Ff]unds rate|Funds Rate', line):
            nvar = 5
        m = re.match(r'\s*(\d{1,2})\s+(\d{4}|LR|Longer[ -]?[Rr]un)\s+(.*)$', line)
        if not m:
            continue
        nums = re.findall(r'-?\d+\.\d+|-?\d+(?=\s|$)', m.group(3))
        nums = [float(x) for x in nums]
        yr = int(m.group(2)) if m.group(2).isdigit() else None
        if yr is not None:
            if len(nums) != nvar:
                continue
            names = SEPC_VARS[:nvar]
        else:
            if nvar == 5 and len(nums) == 4:
                names = ['real GDP growth', 'unemployment rate', 'PCE inflation', 'federal funds rate']
            elif nvar == 4 and len(nums) == 3:
                names = ['real GDP growth', 'unemployment rate', 'PCE inflation']
            else:
                continue
        for n, v in zip(names, nums):
            out.setdefault((n, yr), []).append(v)
    return out


def median(xs):
    xs = sorted(xs); n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def dot_medians(date):
    """Median of the published dot plot per column. Returns ({column: median}, {column: n})."""
    for t in fed_tables(date):
        if t and t[0] and t[0][0].lower().startswith(('target federal funds rate', 'midpoint of target range')):
            cols = t[0][1:]
            dots = {c: [] for c in cols}
            for row in t[1:]:
                rate = float(row[0])
                for c, cell in zip(cols, row[1:]):
                    if cell.strip():
                        dots[c] += [rate] * int(cell)
            return {c: median(v) for c, v in dots.items() if v}, {c: len(v) for c, v in dots.items()}
    return {}, {}


def entry(var, stat, year, ey, value, src, conf='high', low=None, high=None, note=None, label=None):
    e = {'variable': var, 'metric': var, 'statistic': stat,
         'target_year': year, 'horizon': 'longer_run' if year is None else HOR.get(year - ey, 'year_plus_%d' % (year - ey)),
         'value': rnd(value), 'unit': '%'}
    if low is not None: e['value_low'] = rnd(low)
    if high is not None: e['value_high'] = rnd(high)
    e['definition'] = DEF[var]
    if label: e['label'] = label
    e['source_url'] = src
    e['confidence'] = conf
    if note: e['note'] = note
    return e


# Longer-run series are indexed by release date in the latest vintage.
LR = {}
for s in ['GDPC1MDLR', 'UNRATEMDLR', 'PCECTPIMDLR', 'FEDTARMDLR', 'GDPC1CTHLR', 'GDPC1CTLLR', 'GDPC1CTMLR', 'UNRATECTHLR', 'UNRATECTLLR', 'UNRATECTMLR', 'PCECTPICTHLR', 'PCECTPICTLLR', 'PCECTPICTMLR']:
    LR[s] = read_csv(os.path.join(IN, 'alfred', '%s_latest.csv' % s))[1]

editions = {}
problems = []

# 1. Central-tendency editions 2007-10 to 2015-06.
for d in CT_DATES:
    ed, meet = ed_of(d); ey = int(meet[:4])
    ents = []; srcs = []
    for key, var, stem, _, _ in VARS:
        if stem is None:
            continue
        h, H = read_csv(os.path.join(IN, 'alfred', '%sCTH_%s.csv' % (stem, d)))
        _, L = read_csv(os.path.join(IN, 'alfred', '%sCTL_%s.csv' % (stem, d)))
        _, M = read_csv(os.path.join(IN, 'alfred', '%sCTM_%s.csv' % (stem, d)))
        if h is None:
            problems.append('%s: %s central tendency not read' % (ed, var)); continue
        if not h.endswith(d.replace('-', '')):
            problems.append('%s: %s vintage header %s does not match release %s' % (ed, var, h, d))
        src = ALF % (stem + 'CTM', d); srcs += [ALF % (stem + x, d) for x in ('CTH', 'CTL', 'CTM')]
        for od in sorted(M):
            y = int(od[:4])
            if y < ey:
                continue
            ents.append(entry(var, 'central tendency midpoint', y, ey, M[od], src, low=L.get(od), high=H.get(od),
                              label='%sCTM / %sCTL / %sCTH, vintage %s' % (stem, stem, stem, d)))
        if key != 'core' and d in LR.get(stem + 'CTMLR', {}):
            ents.append(entry(var, 'central tendency midpoint', None, ey, LR[stem + 'CTMLR'][d], ALF_LATEST % (stem + 'CTMLR'),
                              low=LR[stem + 'CTLLR'].get(d), high=LR[stem + 'CTHLR'].get(d),
                              label='%sCTMLR / CTLLR / CTHLR, observation %s' % (stem, d)))
            srcs.append(ALF_LATEST % (stem + 'CTMLR'))
    editions[ed] = {'edition': ed, 'published': d, 'meeting': meet, 'entries': ents, 'sources': srcs, 'notes': []}

# 2. Federal funds rate medians computed from the dot plot, 2012-01 to 2015-03.
for d in DOT_DATES:
    ed, meet = ed_of(d); ey = int(meet[:4])
    url = tab_url(d)
    med, n = dot_medians(d)
    if not med:
        problems.append('%s: dot plot not parsed' % ed); continue
    for c, v in med.items():
        yr = None if c.lower().startswith('longer') else int(c)
        note = 'Median computed by Hindsight from the published dot plot (%d participants); the SEP did not publish a median before September 2015.' % n[c]
        if yr is None and d in LR['FEDTARMDLR']:
            note += ' FRED series FEDTARMDLR gives %s for this release.' % LR['FEDTARMDLR'][d]
        editions[ed]['entries'].append(entry('federal funds rate', 'median (computed from dot plot)', yr, ey, v, url, conf='medium', note=note,
                                             label='Target federal funds rate at year-end, dot plot column %s' % c))
    editions[ed]['sources'].append(url)
    editions[ed]['notes'].append('Federal funds rate: median computed from the published dot plot.')

# 3. September 2015: first published medians; the same table reports the June 2015 medians.
URL915 = FED_TAB % '20150917'
t0 = fed_tables('2015-09-17')[0]
yrs = t0[1][:5]
name_map = {'Change in real GDP': 'real GDP growth', 'Unemployment rate': 'unemployment rate', 'PCE inflation': 'PCE inflation',
            'Core PCE inflation4': 'core PCE inflation', 'Federal funds rate': 'federal funds rate'}
sep15 = []; jun15 = []; cur = None
for row in t0[2:]:
    if row[0] in name_map:
        cur = name_map[row[0]]; target = sep15
    elif row[0] == 'June projection' and cur:
        target = jun15
    else:
        continue
    for c, v in zip(yrs, row[1:6]):
        if v in ('', 'n.a.'):
            continue
        yr = None if c.lower().startswith('longer') else int(c)
        target.append((cur, yr, float(v)))
editions['2015-09'] = {'edition': '2015-09', 'published': '2015-09-17', 'meeting': '2015-09-16/17', 'sources': [URL915], 'notes': [],
                       'entries': [entry(v, 'median', y, 2015, x, URL915, label='Table 1, median') for v, y, x in sep15]}
e6 = editions['2015-06']
e6['entries'] = [x for x in e6['entries'] if x['variable'] != 'federal funds rate']
e6['entries'] += [entry(v, 'median', y, 2015, x, URL915, label='Table 1 of the September 2015 SEP, row "June projection", median',
                        note='The June 2015 SEP did not publish medians. The September 2015 SEP reported the June 2015 medians for comparison.')
                  for v, y, x in jun15]
e6['sources'].append(URL915)
e6['notes'].append('Medians for June 2015 come from the September 2015 SEP comparison rows. Central tendency midpoints are also kept.')
# Cross-check: dot-plot median for 2015-06 against the official June 2015 medians.
med615, _ = dot_medians('2015-06-17') if os.path.exists(os.path.join(IN, 'fed', 'fomcprojtabl20150617.htm')) else ({}, {})
for v, y, x in jun15:
    if v == 'federal funds rate':
        c = 'Longer Run' if y is None else str(y)
        if c in med615 and abs(med615[c] - x) > 0.051:
            problems.append('2015-06: dot-plot median %s for %s differs from the published June median %s' % (med615[c], c, x))

# 2b. Medians computed from the individual projections in the SEP compilations (released with a five-year lag).
for d in CT_DATES:
    ed, meet = ed_of(d); ey = int(meet[:4])
    m2 = meet[:8] + meet.split('/')[-1] if '/' in meet else d
    m2 = m2.replace('-', '')
    comp = compilation(m2)
    if d == '2015-06-17':
        for v, y, x in jun15:
            xs = comp.get((v, y))
            if xs and abs(median(xs) - x) > 0.051:
                problems.append('2015-06: compilation median %s for %s %s differs from the published June median %s' % (median(xs), v, y, x))
        continue
    if not comp:
        problems.append('%s: SEP compilation not parsed' % ed); continue
    url = SEPC_URL % m2
    ns = set()
    for (var, yr), xs in sorted(comp.items(), key=lambda k: (k[0][0], k[0][1] or 9999)):
        if yr is not None and yr < ey:
            continue
        ns.add(len(xs))
        editions[ed]['entries'].append(entry(var, 'median (computed from individual projections)', yr, ey, median(xs), url, conf='medium',
            note='Not published at the time. Median computed by Hindsight from the %d individual projections in Table 2 of the SEP compilation, which the Federal Reserve released with a five-year lag. The central tendency was the published statistic at the time.' % len(xs),
            label='SEP compilation Table 2, %s, %s' % (var, 'longer run' if yr is None else yr)))
    editions[ed]['sources'].append(url)
    if len(ns) > 1:
        problems.append('%s: compilation participant counts differ across rows %s' % (ed, sorted(ns)))

# 4. Median editions 2015-12 onward.
MEDLR = {'real GDP growth': 'GDPC1MDLR', 'unemployment rate': 'UNRATEMDLR', 'PCE inflation': 'PCECTPIMDLR', 'federal funds rate': 'FEDTARMDLR'}
for d in MD_DATES:
    ed, meet = ed_of(d); ey = int(d[:4])
    ents = []; srcs = []
    for key, var, stem, mser, _ in VARS:
        h, M = read_csv(os.path.join(IN, 'alfred', '%s_%s.csv' % (mser, d)))
        if h is None:
            problems.append('%s: %s median not read' % (ed, var)); continue
        if not h.endswith(d.replace('-', '')):
            problems.append('%s: %s vintage header %s does not match release %s' % (ed, var, h, d))
        src = ALF % (mser, d); srcs.append(src)
        for od in sorted(M):
            y = int(od[:4])
            if y < ey:
                continue
            ents.append(entry(var, 'median', y, ey, M[od], src, label='%s, vintage %s' % (mser, d)))
        if var in MEDLR and d in LR[MEDLR[var]]:
            ents.append(entry(var, 'median', None, ey, LR[MEDLR[var]][d], ALF_LATEST % MEDLR[var], label='%s, observation %s' % (MEDLR[var], d)))
            srcs.append(ALF_LATEST % MEDLR[var])
        elif var in MEDLR:
            problems.append('%s: no longer-run median for %s' % (ed, var))
    editions[ed] = {'edition': ed, 'published': d, 'meeting': meet, 'entries': ents, 'sources': srcs, 'notes': []}

# Missing edition: March 2020 (the FOMC did not publish an SEP).
MISSING = {'2020-03': 'No SEP. The FOMC cancelled the March 17-18, 2020 meeting and did not submit projections; the March 15, 2020 statement came from an unscheduled meeting.'}

now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
prog = ['# fed-sep progress', '', '| Edition | Status | Entries | Written |', '|---|---|---|---|']
for ed in sorted(editions):
    e = editions[ed]
    vars_ = set(x['variable'] for x in e['entries'])
    status = 'complete'
    ey = int(e['meeting'][:4])
    if ed < '2012-01':
        exp = {'real GDP growth', 'unemployment rate', 'PCE inflation', 'core PCE inflation'}
    else:
        exp = {'real GDP growth', 'unemployment rate', 'PCE inflation', 'core PCE inflation', 'federal funds rate'}
    if not exp <= vars_:
        status = 'partial'
    probs = [p for p in problems if p.startswith(ed + ':')]
    if probs:
        status = 'partial'
    stats = sorted(set(x['statistic'] for x in e['entries']))
    note = ' '.join(e['notes'])
    if 'median' not in stats:
        note = ('The SEP published only the central tendency and range until June 2015; medians began with the September 2015 SEP. '
                '"value" is the midpoint of the central tendency as computed by FRED; value_low and value_high are the published central tendency bounds. ' + note).strip()
    if probs:
        note += ' Problems: ' + '; '.join(p.split(': ', 1)[1] for p in probs)
    out = {'edition': ed, 'published': e['published'], 'publisher': 'Federal Open Market Committee (Board of Governors of the Federal Reserve System)',
           'series': 'Summary of Economic Projections', 'meeting': e['meeting'], 'status': status,
           'sources': sorted(set(e['sources'])), 'entries': e['entries'], 'notes': note.strip()}
    json.dump(out, open(os.path.join(OUT, ed + '.json'), 'w'), indent=1, ensure_ascii=False)
    e['status'] = status; e['stats'] = stats
    prog.append('| %s | %s | %d entries | %s |' % (ed, status, len(e['entries']), now))
for ed, why in MISSING.items():
    prog.append('| %s | missing | 0 | %s |' % (ed, now))
open(os.path.join(OUT, 'PROGRESS.md'), 'w').write('\n'.join(prog) + '\n')

rz = write_realized()

json.dump({'problems': problems, 'editions': {k: [v['status'], v['stats'], len(v['entries'])] for k, v in editions.items()}},
          open(os.path.join(IN, 'build_summary.json'), 'w'), indent=1)
print(len(editions), 'editions;', len(rz), 'realized rows;', len(problems), 'problems')
for p in problems:
    print(' ', p)
