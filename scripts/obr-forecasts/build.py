"""Build data/raw/obr-forecasts/ from the OBR historical official forecasts database and ONS series.

Python 3, standard library only. Reuses the xlsx reader in ../cbo-projections/xlsx.py.
Usage: python3 build.py /path/to/input-folder
"""
import json, os, re, sys
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'cbo-projections'))
from xlsx import Workbook  # noqa: E402

IN = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, 'inputs')
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'data', 'raw', 'obr-forecasts'))

DB_URL = 'https://obr.uk/docs/dlm_uploads/Historical_official_forecasts_database_Spring_2026.xlsx'
DB_PAGE = 'https://obr.uk/data/'
PUBLISHER = 'Office for Budget Responsibility'
FIRST = (2010, 6)  # first OBR forecast in the database (June 2010 Budget)

SHEETS = [
    # sheet, metric, unit, period kind
    ('UKGDP', 'real GDP growth', '%', 'calendar'),
    ('CPI', 'CPI inflation', '% (percentage change on a year earlier)', 'calendar'),
    ('PSNB', 'public sector net borrowing', '% of GDP', 'fiscal'),
    ('£PSNB', 'public sector net borrowing', '£ billion', 'fiscal'),
]
MONTHS = {m: i for i, m in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                      'August', 'September', 'October', 'November', 'December'], 1)}

wb = Workbook(os.path.join(IN, 'Historical_official_forecasts_database_Spring_2026.xlsx'))


def parse_label(s):
    m = re.match(r'^(Memo: (?:restated|supplementary) )?(\w+) (\d{4})( forecast)?$', s.strip())
    if not m or m.group(2) not in MONTHS:
        return None
    return int(m.group(3)), MONTHS[m.group(2)], bool(m.group(1))


def year_of(v, kind):
    s = str(v).strip()
    if kind == 'calendar':
        return int(float(s)) if re.match(r'^\d{4}(\.0)?$', s) else None
    m = re.match(r'^(\d{4})-(\d{2})$', s)
    return int(m.group(1)) if m else None  # fiscal year keyed by its start year


editions = {}
outturns = {}
for sheet, metric, unit, kind in SHEETS:
    rows = wb.rows(sheet)
    header = next(r for rn, r in rows if str(r.get(0, '')).startswith('Back to contents'))
    cols = {k: year_of(v, kind) for k, v in header.items() if k > 0 and year_of(v, kind)}
    sheet_note = ' '.join(str(r.get(1, '')) for rn, r in rows[:3] if isinstance(r.get(1), str) and r.get(1).startswith('Figures'))
    for rn, r in rows:
        lab = r.get(0)
        if not isinstance(lab, str):
            continue
        if lab.startswith('Outturn data'):
            outturns[(sheet, metric, unit, kind)] = {cols[k]: v for k, v in r.items() if k in cols and isinstance(v, float)}
            continue
        p = parse_label(lab)
        if not p:
            continue
        y, mth, memo = p
        if (y, mth) < FIRST:
            continue
        eid = f'{y}-{mth:02d}'
        e = editions.setdefault(eid, {
            'edition': eid, 'published': eid, 'publisher': PUBLISHER,
            'series': 'Economic and fiscal outlook (EFO)', 'forecast_label': lab.strip(),
            'status': 'complete', 'sources': [DB_URL], 'entries': [], 'notes': ''})
        # year_1 = calendar year of publication, or the fiscal year in progress at publication
        y1 = y if kind == 'calendar' else (y if mth >= 4 else y - 1)
        for k, v in sorted(r.items()):
            if k not in cols or not isinstance(v, float):
                continue
            ty = cols[k]
            h = ty - y1 + 1
            if h < 0:
                continue  # outturn years before the estimate year
            ent = {
                'metric': metric, 'label': f'{sheet} / {lab.strip()}',
                'target_year': ty if kind == 'calendar' else f'{ty}-{str(ty + 1)[2:]}',
                'period': 'calendar year' if kind == 'calendar' else 'fiscal year (April to March)',
                'horizon': f'year_{h}', 'value': round(v, 3), 'unit': unit,
                'source_url': DB_URL, 'confidence': 'high'}
            notes = []
            if h == 0:
                notes.append('Year before the current year at publication: an estimate, largely outturn.')
            if memo:
                notes.append(f'Memo row in the database ("{lab.strip()}"), not the headline forecast of this EFO.')
            if notes:
                ent['note'] = ' '.join(notes)
            e['entries'].append(ent)

MISSING = [
    ('2010-06', 'Pre-Budget forecast, 14 June 2010', 'The OBR\'s first forecast, made before the June 2010 Budget. The database row "June 2010" is the Budget forecast of 22 June 2010; the pre-Budget forecast is not in the database.'),
]

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if re.match(r'^\d{4}-\d{2}\.json$', f):
        os.remove(os.path.join(OUT, f))
now = datetime.now().strftime('%Y-%m-%d %H:%M')
prog = []
for eid in sorted(editions):
    e = editions[eid]
    have = {(x['metric'], x['unit']) for x in e['entries'] if 'Memo row' not in x.get('note', '')}
    want = {(m, u) for s, m, u, k in SHEETS}
    miss = sorted(f'{m} ({u})' for m, u in want - have)
    if miss:
        e['status'] = 'partial'
        e['notes'] = 'Not in database for this forecast: ' + '; '.join(miss) + '.'
    if eid == '2010-06':
        e['notes'] = (e['notes'] + ' ' + MISSING[0][2]).strip()
    e['entries'].sort(key=lambda x: (x['metric'], x['unit'], str(x['target_year']), x['label']))
    with open(os.path.join(OUT, f'{eid}.json'), 'w') as fh:
        json.dump(e, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    prog.append((eid, e['status'], len(e['entries'])))

with open(os.path.join(OUT, 'PROGRESS.md'), 'w') as fh:
    fh.write('# obr-forecasts progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n')
    for eid, st, n in prog:
        fh.write(f'| {eid} | {st} | {n} entries | {now} |\n')

# ---------------------------------------------------------------- realized values
series = []
for (sheet, metric, unit, kind), vals in outturns.items():
    ents = []
    for ty, v in sorted(vals.items()):
        if ty < 2009:
            continue
        ents.append({'target_year': ty if kind == 'calendar' else f'{ty}-{str(ty + 1)[2:]}',
                     'value': round(v, 3), 'unit': unit,
                     'confidence': 'medium' if ty >= 2025 or (kind == 'fiscal' and ty >= 2024) else 'high'})
    series.append({'metric': metric, 'series_id': f'OBR database "{sheet}" outturn row',
                   'source': 'ONS outturns as compiled by the OBR in the historical official forecasts database, "as available at last forecast" (March 2026)',
                   'source_url': DB_URL, 'entries': ents})
ONS = [
    ('ihyp', 'pn2', 'economy/grossdomesticproductgdp', 'real GDP growth'),
    ('d7g7', 'mm23', 'economy/inflationandpriceindices', 'CPI inflation'),
]
for cdid, ds, path, metric in ONS:
    d = json.load(open(os.path.join(IN, 'ons', f'{cdid}.json')))
    ents = [{'target_year': int(x['date']), 'value': float(x['value']), 'unit': '%',
             'confidence': 'medium' if int(x['date']) >= 2025 else 'high'}
            for x in d['years'] if x['value'] not in ('', None) and int(x['date']) >= 2009]
    series.append({'metric': metric, 'series_id': f'ONS {cdid.upper()} ({ds.upper()})',
                   'source': 'ONS: ' + d['description']['title'],
                   'source_url': f'https://www.ons.gov.uk/{path}/timeseries/{cdid}/{ds}',
                   'release_date': d['description'].get('releaseDate'), 'entries': ents})
# Real GDP growth from ONS ABMI levels (chained volume, £m), unrounded. IHYP is the same measure printed
# to one decimal; rounding moves errors near the D18 thresholds (#53 audit).
d = json.load(open(os.path.join(IN, 'ons', 'abmi.json')))
lv = {int(x['date']): float(x['value']) for x in d['years'] if x['value'] not in ('', None)}
ents = [{'target_year': y, 'value': round((lv[y] / lv[y - 1] - 1) * 100, 3), 'unit': '%',
         'confidence': 'medium' if y >= 2025 else 'high'}
        for y in sorted(lv) if y >= 2009 and y - 1 in lv]
series.append({'metric': 'real GDP growth', 'series_id': 'ONS ABMI (PN2) growth',
               'source': 'ONS: ' + d['description']['title'] + '; annual growth computed from the levels',
               'source_url': 'https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/abmi/pn2',
               'release_date': d['description'].get('releaseDate'), 'entries': ents})
real = {
    'source': 'ONS, directly and as compiled by the OBR',
    'vintage': 'OBR database March 2026; ONS series retrieved 2026-09-28 (release dates per series)',
    'notes': ('Annual values from 2009. Calendar years for GDP and CPI; fiscal years (April to March) for PSNB. '
              'Latest values, not first estimates. Recent years carry confidence medium because they are subject '
              'to revision. No errors are computed.'),
    'series': series,
}
with open(os.path.join(OUT, 'realized.json'), 'w') as fh:
    json.dump(real, fh, indent=1, ensure_ascii=False)
    fh.write('\n')
print(len(editions), 'editions;', sum(n for _, _, n in prog), 'entries')
for eid, st, n in prog:
    if st != 'complete':
        print(eid, st, editions[eid]['notes'])
