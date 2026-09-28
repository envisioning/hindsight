"""Build data/raw/world-bank-gep/ from parsed.json and wdi.json (written by
fetch.py). Python 3 standard library only."""
import datetime, json, os
from editions import edition

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'world-bank-gep')
os.makedirs(OUT, exist_ok=True)
PUBLISHER = 'World Bank'
SERIES = 'Global Economic Prospects'
GEP_PAGE = 'https://www.worldbank.org/en/publication/global-economic-prospects'

# scope slot -> (preferred economy, fallback economy used when the edition has no preferred row)
SCOPE = [
    ('World', None),
    ('Advanced economies', 'High-income countries'),
    ('Emerging market and developing economies', 'Developing countries'),
    ('United States', None), ('Euro area', None), ('Japan', None),
    ('China', None), ('India', None), ('Brazil', None),
]
CODES = {'World': 'WLD', 'Advanced economies': 'AE', 'High-income countries': 'HIC',
         'Emerging market and developing economies': 'EMDE', 'Developing countries': 'LMY',
         'United States': 'USA', 'Euro area': 'EMU', 'Japan': 'JPN', 'China': 'CHN', 'India': 'IND', 'Brazil': 'BRA'}
US_2017_QUOTE = ('"The U.S. forecasts do not incorporate the effect of policy proposals by the new U.S. '
                 'administration, as their overall scope and ultimate form are still uncertain." (table note)')


def main():
    parsed = json.load(open(os.path.join(HERE, 'parsed.json')))
    wdi = json.load(open(os.path.join(HERE, 'wdi.json')))
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    index_rows, progress = [], []
    items = sorted(((edition(stem), stem, p) for stem, p in parsed.items()), key=lambda x: x[0][0])
    for (eid, pub, how, title), stem, p in items:
        yr = int(eid[:4])
        tok = {int(t[:4]): t for t in p['years']}
        entries, missing, subs = [], [], []
        url = p['source']
        for want, fallback in SCOPE:
            name = want if want in p['values'] else (fallback if fallback and fallback in p['values'] else None)
            if name is None:
                missing.append(want)
                continue
            if name != want:
                subs.append('%s shown as "%s"' % (want, p['labels'][name]))
            for ty, h in ((yr, 'current_year'), (yr + 1, 'next_year')):
                v = p['values'][name].get(str(ty))
                if v is None:
                    missing.append('%s %d' % (want, ty))
                    continue
                t = tok.get(ty, str(ty))
                note = []
                if name != want:
                    note.append('This edition has no "%s" row; the value is for "%s", a different country grouping.' % (want, p['labels'][name]))
                if t[4:] in ('e', '*', 'h'):
                    note.append('Column "%s" is marked as an estimate in the table, not a forecast.' % t)
                if name == 'India' and p['fiscal_note']:
                    note.append('India: fiscal year basis per the table notes (the %d column is the fiscal year that starts in April %d).' % (ty, ty) if eid >= '2010' else 'India: the table notes mention fiscal-year reporting for some countries; basis not checked for this edition.')
                if name in p['flags'] and ty in [int(x) for x in p['flags'][name]]:
                    note.append('Marked with an asterisk in the table: ' + US_2017_QUOTE)
                if p['shifted_font']:
                    note.append('The PDF uses a shifted font encoding; text was decoded by a fixed offset of 29.')
                e = {'economy': name, 'economy_code': CODES[name], 'metric': 'real GDP growth', 'target_year': ty,
                     'horizon': h, 'value': v, 'unit': '%', 'label': '%s / %s' % (p['labels'][name], t),
                     'source_url': url.split(' (')[0], 'confidence': 'high'}
                if note:
                    e['note'] = ' '.join(note)
                entries.append(e)
        status = 'complete' if not missing else 'partial'
        notes = ('%s. Real GDP growth table ("gdp-growth" PDF, %s), read from the PDF text layer. Values as printed (1 decimal). '
                 'Aggregates use the World Bank grouping and weights of that edition (market exchange rates at the time). '
                 'Published month: %s.' % (title, url, how))
        if subs:
            notes += ' Grouping differences: ' + '; '.join(subs) + '.'
        if missing:
            notes += ' Not in source for this edition: ' + ', '.join(missing) + '.'
        doc = {'edition': eid, 'published': pub, 'publisher': PUBLISHER, 'series': SERIES, 'source_vintage': title,
               'status': status, 'sources': [url.split(' (')[0], GEP_PAGE], 'entries': entries, 'notes': notes}
        json.dump(doc, open(os.path.join(OUT, eid + '.json'), 'w'), indent=1, ensure_ascii=False)
        index_rows.append((eid, pub, title, stem, len(entries), status, ', '.join(subs), ', '.join(missing)))
        progress.append('| %s | %s | %d entries | %s |' % (eid, status, len(entries), now))
    # realized values
    rows = []
    last = parsed['GEP-Jun-2026-gdp-growth']
    for want, fallback in SCOPE:
        for ty in (2023, 2024, 2025):
            v = last['values'].get(want, {}).get(str(ty))
            if v is None:
                continue
            e = {'economy': want, 'economy_code': CODES[want], 'target_year': ty, 'value': v, 'unit': '%',
                 'source': 'GEP June 2026, Table 1.1 (column %s)' % {int(t[:4]): t for t in last['years']}[ty],
                 'confidence': 'medium' if ty == 2025 else 'high'}
            if want == 'India':
                e['note'] = 'Fiscal year starting in April of target_year, as in the GEP forecasts.'
            rows.append(e)
    wname = {'1W': 'World', 'XD': 'High-income countries', 'XO': 'Developing countries', 'US': 'United States', 'XC': 'Euro area',
             'JP': 'Japan', 'CN': 'China', 'IN': 'India', 'BR': 'Brazil'}
    for r in wdi['rows']:
        name = wname.get(r['country']['id'])
        if name is None or r['value'] is None:
            continue
        e = {'economy': name, 'economy_code': r['countryiso3code'] or {'XD': 'HIC'}.get(r['country']['id'], r['country']['id']), 'target_year': int(r['date']),
             'value': round(r['value'], 3), 'unit': '%', 'source': 'World Development Indicators NY.GDP.MKTP.KD.ZG (last updated %s)' % wdi['meta']['lastupdated'],
             'confidence': 'high'}
        if name == 'India':
            e['note'] = 'WDI reports India on a calendar-year basis here, while GEP forecasts use the fiscal year. Not directly comparable.'
        if name == 'Euro area':
            e['note'] = 'WDI aggregate EMU (euro area, current membership).'
        rows.append(e)
    order = [s[0] for s in SCOPE] + ['High-income countries', 'Developing countries']
    rows.sort(key=lambda e: (order.index(e['economy']), e['source'][:3], e['target_year']))
    real = {'source': 'World Bank: Global Economic Prospects June 2026 (2023 to 2025) and World Development Indicators (1998 to 2025)',
            'vintage': '2026-06 (GEP); WDI last updated %s' % wdi['meta']['lastupdated'],
            'source_url': [parsed['GEP-Jun-2026-gdp-growth']['source'], wdi['url']],
            'metric': 'real GDP growth', 'unit': '%',
            'notes': ('Two World Bank sources, kept apart by the `source` field on each row. (1) The June 2026 GEP table gives 2023 and 2024 outturns and a 2025 estimate '
                      'for every economy in scope, including the GEP groups "Advanced economies" and "EMDEs", which WDI does not publish. 2025 rows carry confidence medium. '
                      '(2) WDI NY.GDP.MKTP.KD.ZG gives longer history for World, United States, Euro area (EMU), Japan, China, India (calendar year), Brazil, High income (HIC) '
                      'and Low and middle income (LMY, the old "developing countries" group, current classification). WDI and GEP can differ for the same year because of '
                      'weights (GEP aggregates use market exchange rates at fixed prices) and revision timing. Retrieved 2026-09-28. All values are subject to later revision.'),
            'entries': rows}
    json.dump(real, open(os.path.join(OUT, 'realized.json'), 'w'), indent=1, ensure_ascii=False)
    open(os.path.join(OUT, 'PROGRESS.md'), 'w').write('# world-bank-gep progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n' + '\n'.join(progress) + '\n')
    json.dump(index_rows, open(os.path.join(HERE, 'index_rows.json'), 'w'))
    for r in index_rows:
        print(r)
    print('realized', len(rows))


if __name__ == '__main__':
    main()
