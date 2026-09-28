"""Build data/raw/cbo-projections/ from CBO and FRED files. Python 3, standard library only.

Inputs (see README.md): inputs/53090-supplementarytables.xlsx, inputs/ep/51135-*.xlsx,
inputs/baselines.csv, inputs/actuals.csv, inputs/fred/*.csv.
"""
import csv, glob, json, os, re, sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from xlsx import Workbook  # noqa: E402

IN = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'inputs')
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'data', 'raw', 'cbo-projections'))

WB = 'https://www.cbo.gov'
SUPP_URL = WB + '/system/files/115th-congress-2017-2018/reports/53090-supplementarytables.xlsx'
SUPP_PAGE = WB + '/publication/53090'
EVAL_URL = 'https://github.com/US-CBO/eval-projections/blob/main/input_data/baselines.csv'
PUBLISHER = 'Congressional Budget Office'

# Direct links to each economic projections file, as listed on https://www.cbo.gov/data/budget-economic-data
EP_URLS = {}
with open(os.path.join(HERE, 'ep_urls.txt')) as fh:
    for line in fh:
        p = line.strip()
        if p:
            EP_URLS[os.path.basename(p)] = WB + p

VARS = {
    # key: (row label regex, metric, unit, growth?)
    'real_gdp': (r'^real gdp\b', 'real GDP growth', '%', True),
    'cpi_u': (r'^consumer price index, all urban', 'CPI-U inflation', '%', True),
    'unemployment': (r'^unemployment rate, civilian', 'unemployment rate', '%', False),
    'tsy10': (r'^10-year treasury note', '10-year Treasury note rate', '%', False),
}

editions = {}  # id -> dict


def ed(eid, published):
    if eid not in editions:
        editions[eid] = {'edition': eid, 'published': published, 'publisher': PUBLISHER,
                         'series': 'The Budget and Economic Outlook (baseline projections)',
                         'status': 'complete', 'sources': [], 'entries': [], 'gaps': [], 'notes': []}
    return editions[eid]


def add_src(e, url):
    if url not in e['sources']:
        e['sources'].append(url)


def r3(x):
    return None if x is None else round(float(x), 3)


# ---------------------------------------------------------------- budget baselines (deficits)
baseline_dates = {}
with open(os.path.join(IN, 'baselines.csv')) as fh:
    for row in csv.DictReader(fh):
        if row['component'] != 'deficit' or row['category'] != 'Total':
            continue
        n = int(row['projected_year_number'])
        eid = row['baseline_date'][:7]
        baseline_dates.setdefault(eid[:4], []).append(eid)
        if n > 5:
            continue
        e = ed(eid, eid)
        add_src(e, EVAL_URL)
        e['entries'].append({
            'metric': 'federal budget deficit', 'label': 'deficit, Total (baselines.csv)',
            'target_year': int(row['projected_fiscal_year']), 'period': 'fiscal year',
            'horizon': f'year_{n}', 'value': r3(row['value']), 'unit': 'billion USD (negative = deficit)',
            'source_url': EVAL_URL, 'confidence': 'high'})
for y in baseline_dates:
    baseline_dates[y] = sorted(set(baseline_dates[y]))

# ---------------------------------------------------------------- annual economic projections (51135 files)
YEAR_RE = re.compile(r'^(19|20)\d\d(\.0)?$')


def as_year(v):
    s = str(v).strip()
    return int(float(s)) if YEAR_RE.match(s) else None


def month_name(eid):
    return datetime.strptime(eid, '%Y-%m').strftime('%B %Y')


for path in sorted(glob.glob(os.path.join(IN, 'ep', '51135-*.xlsx'))):
    fname = os.path.basename(path)
    eid = re.match(r'51135-(\d{4}-\d{2})', fname).group(1)
    url = EP_URLS[fname]
    wb = Workbook(path)
    if '2. Calendar Year' not in wb.sheets:
        continue  # 2023-12: a short "current view" table, not a baseline; recorded in INDEX.md
    rows = wb.rows('2. Calendar Year')
    ycol = None
    for rn, r in rows[:12]:
        yc = {k: as_year(v) for k, v in r.items() if as_year(v)}
        if len(yc) > 5:
            ycol = {y: k for k, y in yc.items()}
            break
    if ycol is None:
        raise SystemExit(f'no year header in {fname}')
    base_year = int(eid[:4])
    e = ed(eid, eid)
    add_src(e, url)
    title = str(rows[0][1].get(0, ''))
    e['notes'].append('Economic projections: ' + title.strip()[:300])
    for key, (rx, metric, unit, growth) in VARS.items():
        idx = None
        for i, (rn, r) in enumerate(rows):
            lab = ' '.join(str(r[k]) for k in sorted(r) if k < 2 and isinstance(r[k], str)).strip().lower()
            if re.search(rx, lab):
                idx = i
                break
        if idx is None:
            e['gaps'].append(f'{metric}: row not found')
            continue
        level = rows[idx][1]
        pct = None
        if idx + 1 < len(rows):
            nr = rows[idx + 1][1]
            nl = ' '.join(str(v) for k, v in nr.items() if k < 2 and isinstance(v, str)).lower()
            if 'percentage change' in nl:
                pct = nr
        label = ' '.join(str(level[k]) for k in sorted(level) if k < 2 and isinstance(level[k], str)).strip()
        for h in range(5):
            ty = base_year + h
            if ty not in ycol:
                e['gaps'].append(f'{metric} {ty}: year not in file')
                continue
            c = ycol[ty]
            note = None
            conf = 'high'
            if growth:
                if pct is not None and isinstance(pct.get(c), float):
                    val = pct[c]
                    lbl = label + ' / Percentage change, annual rate'
                else:
                    cur, prev = level.get(c), level.get(ycol.get(ty - 1))
                    if not (isinstance(cur, float) and isinstance(prev, float)):
                        e['gaps'].append(f'{metric} {ty}: value missing')
                        continue
                    val = (cur / prev - 1) * 100
                    lbl = label + ' (level)'
                    note = (f'Growth computed from the calendar-year levels in the file ({ty} over {ty - 1}); '
                            'the file gives levels only.')
                    conf = 'medium'
            else:
                val = level.get(c)
                lbl = label
                if not isinstance(val, float):
                    e['gaps'].append(f'{metric} {ty}: value missing')
                    continue
            ent = {'metric': metric, 'label': lbl[:200], 'target_year': ty, 'period': 'calendar year',
                   'horizon': f'year_{h + 1}', 'value': r3(val), 'unit': unit,
                   'source_url': url, 'confidence': conf}
            if note:
                ent['note'] = note
            if h == 0:
                ent['note'] = ((ent.get('note', '') + ' ') if ent.get('note') else '') + \
                    'Year 1 is the calendar year of publication; part of it was already observed.'
            e['entries'].append(ent)

# ---------------------------------------------------------------- two-year and five-year averages (2017 supplement)
wbs = Workbook(os.path.join(IN, '53090-supplementarytables.xlsx'))
SUPP = [
    # sheet, span, metric key, CBO forecast column
    ('Fig. 7', 2, 'real_output', 7), ('Fig. 16', 5, 'real_output', 7),
    ('Fig. 9', 2, 'cpi', 5), ('Fig. 18', 5, 'cpi', 5),
    ('Fig. 13', 2, 'tsy10', 5), ('Fig. 22', 5, 'tsy10', 5),
]
supp_editions = {}


def supp_edition(year):
    """The forecast comes from CBO's winter Budget and Economic Outlook of that year."""
    jan = os.path.join(IN, 'ep', f'51135-{year}-01-economicprojections.xlsx')
    if os.path.exists(jan):
        return f'{year}-01'
    if str(year) in baseline_dates:
        return baseline_dates[str(year)][0]
    return str(year)


for sheet, span, key, col in SUPP:
    rows = wbs.rows(sheet)
    hdr = ' '.join(str(r.get(col, '')) for rn, r in rows[:6])
    section = None
    for rn, r in rows:
        if r.get(0) in ('Real GNP', 'Real GDP'):
            section = r[0]
        per = r.get(1) if isinstance(r.get(1), str) and re.match(r'^\d{4}-\d{4}$', r.get(1).strip()) else None
        if per is None and isinstance(r.get(0), str) and re.match(r'^\d{4}-\d{4}$', r.get(0).strip()):
            per = r.get(0)
        if not per:
            continue
        y0, y1 = (int(x) for x in per.strip().split('-'))
        val = r.get(col)
        eid = supp_edition(y0)
        e = ed(eid, eid)
        add_src(e, SUPP_URL)
        note = None
        conf = 'high'
        if key == 'real_output':
            metric = 'real GNP growth, average' if y0 < 1992 else 'real GDP growth, average'
            note = 'Average annual growth of real output over the period (geometric average of calendar-year growth).'
        elif key == 'cpi':
            metric = 'CPI inflation, average'
            note = 'Average annual CPI growth over the period. CBO forecast the CPI-U except in 1986 to 1989 (CPI-W), per the 2025 report appendix.'
        else:
            if y0 in (1984, 1985):
                metric = 'Aaa corporate bond rate, average'
                note = 'CBO did not forecast the 10-year Treasury note rate in 1984 or 1985; the value is its forecast of the Aaa corporate bond rate (sheet note).'
            else:
                metric = '10-year Treasury note rate, average'
                note = 'Arithmetic average of the annual rate over the period.'
        if span == 5 and key == 'tsy10':
            note += f' The source sheet labels this row "{per.strip()}", but the values are five-year averages (see INDEX.md); the period here is {y0}-{y0 + 4}.'
            y1 = y0 + 4
            conf = 'medium'
        if not isinstance(val, float):
            e['gaps'].append(f'{metric} {y0}-{y1}: n.a. in source')
            continue
        e['entries'].append({
            'metric': metric, 'label': f'{sheet} / CBO Forecast / {per.strip()}',
            'target_year': y1, 'target_period': f'{y0}-{y1}', 'horizon': f'{span}_year_average',
            'value': r3(val), 'unit': '%', 'source_url': SUPP_URL, 'confidence': conf, 'note': note})
        if len(eid) == 4:
            e['notes'].append('Month of the winter report is not recorded in the supplement; edition id is the year only.')

# ---------------------------------------------------------------- write editions
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '[0-9]*.json')):
    os.remove(f)
progress = []
now = datetime.now().strftime('%Y-%m-%d %H:%M')
for eid in sorted(editions):
    e = editions[eid]
    e['notes'] = ' '.join(dict.fromkeys(e['notes']))
    gaps = e.pop('gaps')
    structural = [g for g in gaps if 'year not in file' in g or 'n.a. in source' in g]
    gaps = [g for g in gaps if g not in structural]
    if structural:
        e['notes'] = (e['notes'] + ' Not in source (short horizon or n.a.): ' + '; '.join(structural) + '.').strip()
    metrics = {x['metric'] for x in e['entries']}
    has_annual = any(x['horizon'].startswith('year_') and x['unit'] == '%' for x in e['entries'])
    first_of_year = eid == (baseline_dates.get(eid[:4]) or [eid])[0] or len(eid) == 4
    summer = len(eid) == 7 and int(eid[5:]) >= 7
    if not has_annual and summer and not first_of_year:
        gaps.append('economic projections (summer/fall updates usually revise the economic forecast; '
                    'no economic data file for this baseline is posted on CBO\'s data page)')
    if not has_annual and first_of_year:
        miss = ['unemployment rate (not in the 2017 supplement; no annual data file for this baseline)']
        if not any(m.startswith('real') for m in metrics):
            miss.append('real GDP growth')
        if not any(m.startswith('CPI') for m in metrics):
            miss.append('CPI inflation')
        if not any('10-year' in m or 'Aaa' in m for m in metrics):
            miss.append('10-year Treasury rate')
        if 'federal budget deficit' not in metrics:
            miss.append('federal deficit (eval-projections starts with the 1984 baseline)')
        gaps += miss
    elif not has_annual and not summer:
        e['notes'] = (e['notes'] + ' Spring budget re-estimate: deficit projections only. Spring re-estimates '
                      'usually reuse the winter economic forecast; no economic data file is posted for this '
                      'baseline.').strip()
    if gaps:
        e['status'] = 'partial'
        e['notes'] = (e['notes'] + ' Gaps: ' + '; '.join(gaps) + '.').strip()
    e['entries'].sort(key=lambda x: (x['metric'], x['horizon'], x['target_year']))
    with open(os.path.join(OUT, f'{eid}.json'), 'w') as fh:
        json.dump(e, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    kinds = sorted({('econ' if x['unit'] == '%' and 'average' not in x['horizon'] else
                     'avg' if 'average' in x['horizon'] else 'deficit') for x in e['entries']})
    progress.append((eid, e['status'], len(e['entries']), '+'.join(kinds), gaps))

with open(os.path.join(OUT, 'PROGRESS.md'), 'w') as fh:
    fh.write('# cbo-projections progress\n\n| Edition | Status | Entries | Content | Written |\n|---|---|---|---|---|\n')
    for eid, st, n, k, g in progress:
        fh.write(f'| {eid} | {st} | {n} entries | {k} | {now} |\n')

# ---------------------------------------------------------------- realized values
FRED = {
    'A191RL1A225NBEA': ('real GDP growth', '%', 'BEA via FRED, Real Gross Domestic Product, percent change from preceding period, annual'),
    'A001RL1A225NBEA': ('real GNP growth', '%', 'BEA via FRED, Real Gross National Product, percent change from preceding period, annual'),
    'UNRATE': ('unemployment rate', '%', 'BLS via FRED, civilian unemployment rate, annual average of monthly data (fq=Annual, fam=avg)'),
    'CPIAUCNS': ('CPI-U inflation', '%', 'BLS via FRED, CPI-U not seasonally adjusted, annual average, percent change from a year ago (fq=Annual, fam=avg, transformation=pc1)'),
    'GS10': ('10-year Treasury note rate', '%', 'Federal Reserve via FRED, 10-year Treasury constant maturity rate, annual average (fq=Annual, fam=avg)'),
    'FYFSD': ('federal budget deficit', 'million USD (negative = deficit), fiscal year', 'OMB/Treasury via FRED, Federal Surplus or Deficit [-], fiscal year'),
    'FYFSGDA188S': ('federal budget deficit, % of GDP', '% of GDP', 'OMB/Treasury via FRED, Federal Surplus or Deficit [-] as Percent of GDP'),
}
series = []
for sid, (metric, unit, desc) in FRED.items():
    ents = []
    with open(os.path.join(IN, 'fred', f'{sid}.csv')) as fh:
        for row in csv.reader(fh):
            if row[0] == 'observation_date' or len(row) < 2 or row[1] in ('', '.'):
                continue
            y = int(row[0][:4])
            if y < 1975 or y > 2025:
                continue
            ents.append({'target_year': y, 'value': r3(row[1]), 'unit': unit,
                         'confidence': 'medium' if y == 2025 else 'high'})
    series.append({'metric': metric, 'series_id': sid, 'source': desc,
                   'source_url': f'https://fred.stlouisfed.org/series/{sid}', 'entries': ents})
cbo_act = []
with open(os.path.join(IN, 'actuals.csv')) as fh:
    for row in csv.DictReader(fh):
        if row['component'] == 'deficit' and row['category'] == 'Total':
            cbo_act.append({'target_year': int(row['fiscal_year']), 'value': r3(row['actual_value']),
                            'unit': 'billion USD (negative = deficit), fiscal year', 'confidence': 'high'})
series.append({'metric': 'federal budget deficit', 'series_id': 'eval-projections/actuals.csv',
               'source': 'CBO eval-projections actuals (Monthly Treasury Statement basis, as used by CBO)',
               'source_url': 'https://github.com/US-CBO/eval-projections/blob/main/input_data/actuals.csv',
               'entries': cbo_act})
real = {
    'source': 'FRED (St. Louis Fed) for BEA, BLS, Federal Reserve and OMB series; CBO eval-projections for deficits',
    'vintage': 'retrieved 2026-09-28',
    'notes': ('Latest vintage values, not first releases. Years 1975 to 2025. 2025 values carry confidence medium '
              '(recent, subject to revision). Real output before 1992 is GNP in CBO forecasts: the real GNP series is '
              'included for that period. FRED CPIAUCNS annual averages match the CBO method (calendar-year average of '
              'monthly CPI-U). CBO computes two-year and five-year averages from these annual series; this file holds '
              'annual values only and computes no averages or errors.'),
    'series': series,
}
with open(os.path.join(OUT, 'realized.json'), 'w') as fh:
    json.dump(real, fh, indent=1, ensure_ascii=False)
    fh.write('\n')
print(len(editions), 'editions;', sum(len(e['entries']) for e in editions.values()), 'entries')
for eid, st, n, k, g in progress:
    if g:
        print(eid, st, g[:4])
