"""Build data/raw/oecd-economic-outlook/ from the files written by fetch.py
and fetch_wayback.py, plus values transcribed from three archived annex PDFs
(listed in TRANSCRIBED below). Python 3 standard library only.
"""
import json, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'oecd-economic-outlook')
os.makedirs(OUT, exist_ok=True)
PUBLISHER = 'Organisation for Economic Co-operation and Development'
SERIES = 'OECD Economic Outlook'
DBN_REPO = 'https://git.nomics.world/dbnomics-json-data/oecd-json-data'

# (display name, code in EO102-115 OECD.Stat, code in EO114-119 SDMX, row label in annex tables)
ECON = [
    ('OECD total', 'OTO', 'OECD', 'Total OECD'),
    ('United States', 'USA', 'USA', 'United States'),
    ('Euro area', 'EA17', 'EA17', 'Euro area'),
    ('Japan', 'JPN', 'JPN', 'Japan'),
    ('Germany', 'DEU', 'DEU', 'Germany'),
    ('United Kingdom', 'GBR', 'GBR', 'United Kingdom'),
    ('China', 'CHN', 'CHN', 'China'),
    ('India', 'IND', 'IND', 'India'),
    ('Brazil', 'BRA', 'BRA', 'Brazil'),
]

# EO number -> (edition id, publication month). Month from the OECD edition title
# ("Economic Outlook No NNN - Month YYYY", "Volume YYYY Issue N").
EDITIONS = {
    94: '2013-11', 95: '2014-05', 98: '2015-11', 99: '2016-06', 100: '2016-11', 101: '2017-06',
    102: '2017-11', 103: '2018-05', 104: '2018-11', 105: '2019-05', 106: '2019-11', 107: '2020-06',
    108: '2020-12', 109: '2021-05', 110: '2021-12', 111: '2022-06', 112: '2022-11', 113: '2023-06',
    114: '2023-11', 115: '2024-05', 116: '2024-12', 117: '2025-06', 118: '2025-12', 119: '2026-06',
}

# Annex Table 1 (Real GDP) read from page images of archived statistical annex PDFs.
# The PDF text layer has no usable digits, so the values were read from the page image
# and checked twice. One decimal, as printed. (current year, next year)
TRANSCRIBED = {
    99: ('https://web.archive.org/web/20210126002222/http://www.oecd.org/economy/outlook/OECD-Economic-Outlook-June-2016-ststistical-annex.pdf', 'page 247, "Source: OECD Economic Outlook 99 database"', {
        'OECD total': (1.8, 2.1), 'United States': (1.8, 2.2), 'Euro area': (1.6, 1.7), 'Japan': (0.7, 0.4),
        'Germany': (1.6, 1.7), 'United Kingdom': (1.7, 2.0), 'China': (6.5, 6.2), 'India': (7.4, 7.5), 'Brazil': (-4.3, -1.7)}),
    100: ('https://web.archive.org/web/20201124211425/http://www.oecd.org/economy/outlook/statistical-annexes-oecd-economic-outlook-november-2016.pdf', 'page 267, "Source: OECD Economic Outlook 100 database"', {
        'OECD total': (1.7, 2.0), 'United States': (1.5, 2.3), 'Euro area': (1.7, 1.6), 'Japan': (0.8, 1.0),
        'Germany': (1.7, 1.7), 'United Kingdom': (2.0, 1.2), 'China': (6.7, 6.4), 'India': (7.4, 7.6), 'Brazil': (-3.4, 0.0)}),
    101: ('https://web.archive.org/web/20210924133600/https://www.oecd.org/economy/outlook/statistical-annex-oecd-economic-outlook-june-2017.pdf', 'annex page 9, "Source: OECD Economic Outlook 101 database"', {
        'OECD total': (2.1, 2.1), 'United States': (2.1, 2.4), 'Euro area': (1.8, 1.8), 'Japan': (1.4, 1.0),
        'Germany': (2.0, 2.0), 'United Kingdom': (1.6, 1.0), 'China': (6.6, 6.4), 'India': (7.3, 7.7), 'Brazil': (0.7, 1.6)}),
}
# Wayback workbooks: capture timestamp -> (EO number, column of first year, first year, last annual year)
WAYBACK = {'20140407105600': (94, 3, 2000, 2015), '20140823025542': (95, 3, 2000, 2015), '20160313203848': (98, 4, 2002, 2017)}

def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

def entry(name, code, ty, h, val, label, url, conf, note=None):
    e = {'economy': name, 'economy_code': code, 'metric': 'real GDP growth', 'target_year': ty, 'horizon': h,
         'value': round(val, 3), 'unit': '%', 'label': label, 'source_url': url, 'confidence': conf}
    if note:
        e['note'] = note
    return e

INDIA_NOTE = 'India: fiscal year (April to March), per the OECD annex tables.'

def main():
    dbn = json.load(open(os.path.join(HERE, 'dbnomics_eo.json')))
    sd = json.load(open(os.path.join(HERE, 'sdmx_eo.json')))
    wb = json.load(open(os.path.join(HERE, 'wayback_annex.json')))
    wbby = {}
    for x in wb:
        n, c0, y0, y1 = WAYBACK[x['capture']]
        wbby[n] = (x, c0, y0, y1)
    index_rows = []; progress = []
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    for n, pub in sorted(EDITIONS.items()):
        yr = int(pub[:4]); eid = pub
        entries = []; missing = []; sources = []; vintage = 'EO%d' % n
        if n >= 114:
            s = sd[str(n)]; url = s['url']; sources = [url]
            vals = {}
            for r in s['rows']:
                vals[(r['REF_AREA'], int(r['TIME_PERIOD']))] = num(r['OBS_VALUE'])
            srcname = 'SDMX %s' % ('DF_EO' if n == 119 else 'DF_EO_%d' % n)
            srcnote = 'OECD Data Explorer SDMX API, dataflow OECD.ECO.MAD:%s ("%s"), measure GDPV_ANNPCT (gross domestic product, volume, growth), annual.' % ('DSD_EO@DF_EO' if n == 119 else 'DSD_EO_%d@DF_EO_%d' % (n, n), s['name'])
            for name, oc, nc, al in ECON:
                for ty, h in ((yr, 'current_year'), (yr + 1, 'next_year')):
                    v = vals.get((nc, ty))
                    if v is None: missing.append('%s %d' % (name, ty)); continue
                    entries.append(entry(name, nc, ty, h, v, '%s.GDPV_ANNPCT.A / %s' % (nc, s['name']), url, 'high', INDIA_NOTE if nc == 'IND' else None))
        elif n >= 102:
            d = dbn[str(n)]; sha = d['first']['sha']
            url = '%s/-/tree/%s/EO' % (DBN_REPO, sha); sources = [url]
            srcname = 'DBnomics mirror of OECD.Stat EO'
            srcnote = 'OECD.Stat dataset EO ("%s"), variable GDPV_ANNPCT, as mirrored by DBnomics (git commit %s, %s, the first commit holding this edition). OECD.Stat is retired; this mirror is the only machine-readable copy found for this vintage. The last commit for the same edition (%s) holds the same values.' % (d['name'], sha[:10], d['first']['date'], d['last']['sha'][:10])
            ser = d['first']['series']
            for name, oc, nc, al in ECON:
                code = oc
                if oc == 'EA17' and 'EA17' not in ser and 'EA16' in ser:
                    code = 'EA16'
                for ty, h in ((yr, 'current_year'), (yr + 1, 'next_year')):
                    v = num(ser.get(code, {}).get(str(ty)))
                    if v is None: missing.append('%s %d' % (name, ty)); continue
                    note = []
                    if code == 'EA16': note.append('Euro area aggregate coded EA16 ("Euro area (16 countries)") in this vintage.')
                    if code == 'IND': note.append(INDIA_NOTE)
                    entries.append(entry(name, code, ty, h, v, '%s.GDPV_ANNPCT.A / %s' % (code, d['name']), url, 'high', ' '.join(note) or None))
            if n == 107:
                srcnote += ' EO107 (June 2020) published two equally likely scenarios; the OECD.Stat dataset holds the double-hit scenario (a second COVID-19 wave), as its title says. The single-hit scenario is not captured here.'
        elif n in TRANSCRIBED:
            url, where, vals = TRANSCRIBED[n]; sources = [url]
            srcname = 'annex PDF (transcribed)'
            srcnote = 'OECD Economic Outlook statistical annex, Annex Table 1 "Real GDP", %s, archived copy on the Internet Archive. Values transcribed from the page image at 1 decimal as printed.' % where
            for name, oc, nc, al in ECON:
                for (ty, h), v in zip(((yr, 'current_year'), (yr + 1, 'next_year')), vals[name]):
                    entries.append(entry(name, al, ty, h, v, '%s / Annex Table 1. Real GDP / EO%d' % (al, n), url, 'medium', 'Transcribed from a page image.' + (' ' + INDIA_NOTE if name == 'India' else '')))
        else:
            x, c0, y0, y1 = wbby[n]
            url = x['wayback_url']; sources = [url]
            srcname = 'annex XLS (Wayback)'
            srcnote = 'OECD Economic Outlook annex workbook Demand-and-Output.xls, sheet RealGDP (Annex Table 1. Real GDP), Internet Archive capture %s of %s.' % (x['capture'], x['original_url'])
            if n in (94, 95):
                srcnote += ' The sheet states "Source: OECD Economic Outlook %d database" and adds that "These numbers are working-day adjusted and hence may differ from the basis used for official projections."' % n
            else:
                srcnote += ' The source line of this sheet is empty. The workbook was created and saved on 2015-11-05 (file metadata), its last annual column is 2017, and it has the fiscal-year footnote of the new annex layout; this identifies EO98 (November 2015). Identification is by inference, so confidence is medium.'
            rows = {r[0].strip().rstrip('0123456789 '): r for r in x['table'] if r and isinstance(r[0], str)}  # drop footnote marks, e.g. 'India1'
            for name, oc, nc, al in ECON:
                row = rows.get(al)
                for ty, h in ((yr, 'current_year'), (yr + 1, 'next_year')):
                    v = num(row[c0 + ty - y0]) if row and c0 + ty - y0 < len(row) and ty <= y1 else None
                    if v is None: missing.append('%s %d' % (name, ty)); continue
                    note = []
                    if n in (94, 95): note.append('Working-day adjusted annex figure; may differ from the basis of the official projection.')
                    if name == 'India': note.append(INDIA_NOTE)
                    entries.append(entry(name, al, ty, h, v, '%s / Annex Table 1. Real GDP / EO%d' % (al, n), url, 'medium', ' '.join(note) or None))
        status = 'complete' if not missing else 'partial'
        notes = srcnote + ' Values are annual percent change of real GDP, rounded here to 3 decimals (transcribed values keep the printed 1 decimal). Aggregates (OECD total, euro area) use the composition of the time. The euro area aggregate in the OECD database covers euro area countries that are OECD members (EA16/EA17).'
        if missing:
            notes += ' Not in source for this edition: ' + ', '.join(missing) + '.'
        doc = {'edition': eid, 'published': pub, 'publisher': PUBLISHER, 'series': SERIES, 'source_vintage': vintage,
               'status': status, 'sources': sources, 'entries': entries, 'notes': notes}
        json.dump(doc, open(os.path.join(OUT, eid + '.json'), 'w'), indent=1, ensure_ascii=False)
        index_rows.append((eid, pub, vintage, srcname, len(entries), status, ', '.join(missing)))
        progress.append('| %s | %s | %d entries | %s |' % (eid, status, len(entries), now))
    # realized values from the latest vintage (EO119)
    s = sd['119']; rows = []
    for name, oc, nc, al in ECON:
        for r in s['rows']:
            if r['REF_AREA'] == nc and 1990 <= int(r['TIME_PERIOD']) <= 2025 and num(r['OBS_VALUE']) is not None:
                ty = int(r['TIME_PERIOD'])
                e = {'economy': name, 'economy_code': nc, 'target_year': ty, 'value': round(num(r['OBS_VALUE']), 3), 'unit': '%', 'confidence': 'medium' if ty == 2025 else 'high'}
                if nc == 'IND': e['note'] = INDIA_NOTE
                rows.append(e)
    rows.sort(key=lambda e: ([x[0] for x in ECON].index(e['economy']), e['target_year']))
    real = {'source': 'OECD Economic Outlook 119 (June 2026), via OECD Data Explorer SDMX API', 'vintage': '2026-06', 'source_url': s['url'],
            'metric': 'real GDP growth', 'unit': '%',
            'notes': 'Latest values from the OECD Economic Outlook 119 database (dataflow OECD.ECO.MAD:DSD_EO@DF_EO, measure GDPV_ANNPCT). Years 1990 to 2025 only; 2026 onward are projections and are excluded. 2025 values carry confidence medium because they can still be estimates. All values are subject to later revision. Aggregates use the EO119 composition (OECD 38 members; euro area EA17 = euro area countries that are OECD members). India is on a fiscal-year basis. Values rounded to 3 decimals. Retrieved 2026-09-28.',
            'entries': rows}
    json.dump(real, open(os.path.join(OUT, 'realized.json'), 'w'), indent=1, ensure_ascii=False)
    open(os.path.join(OUT, 'PROGRESS.md'), 'w').write('# oecd-economic-outlook progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n' + '\n'.join(progress) + '\n')
    json.dump(index_rows, open(os.path.join(HERE, 'index_rows.json'), 'w'))
    for r in index_rows: print(r)
    print('realized rows', len(rows))

if __name__ == '__main__':
    main()
