"""Add the scanned GEP editions of the 1990s to data/raw/world-bank-gep/ (issue #11).

The World Bank "gdp-growth" table files start with GEP 2000. Earlier editions exist only as scanned
reports on documents.worldbank.org. Their tables were read by OCR (tesseract at 400 dpi on the page image)
and checked against a second read (the PDF's own OCR text layer via `pdftotext -layout`, a second table of
the same edition, or arithmetic: GDP minus GDP per capita growth gives a steady population growth rate).
The values below are those reads, typed in once; nothing is guessed. A digit that two reads did not agree on
is left out.

Writes one edition file per edition with an annual forecast table, then adds to realized.json:
- `world_weights` for these editions ("1987 prices": every table note of the period says GDP is measured at
  market prices in 1987 prices and exchange rates);
- `world_restated` rows for past-year World columns printed by 1990s tables (1995-08, 1996-08, 1997-09,
  1998-12), so World forecasts are graded against the GEP's own later statement on 1987 weights (D39, D41);
- WDI NY.GDP.MKTP.KD.ZG rows for 1990 to 1997 (United States, Japan, China, India, Brazil), the same
  vintage as the existing 1998 to 2025 rows (pass the WDI API JSON as the first argument, see README).

Run after build.py and world_restated.py (both rewrite realized.json). Idempotent. Python 3 standard library.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', '..', 'data', 'raw', 'world-bank-gep')
DOCS = 'https://documents.worldbank.org/curated/en/'
WDI_URL = 'https://api.worldbank.org/v2/country/USA;JPN;CHN;IND;BRA/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=2000&date=1990:1998'

CODES = {
    'World': 'WLD', 'High-income countries': 'HIC', 'Developing countries': 'LMY', 'United States': 'USA', 'Japan': 'JPN',
    'China': 'CHN', 'India': 'IND', 'Brazil': 'BRA', 'East Asia and Pacific': 'EAP', 'South Asia': 'SAS',
    'Sub-Saharan Africa': 'SSA', 'Latin America and the Caribbean': 'LAC', 'Middle East and North Africa': 'MNA',
    'Europe and Central Asia': 'ECA',
}
GROUP_NOTE = {
    'High-income countries': 'This edition has no "Advanced economies" row; the value is for "%s", a different country grouping.',
    'Developing countries': 'This edition has no "Emerging market and developing economies" row; the value is for "%s", a different country grouping.',
}
REGION_NOTE = 'World Bank regional aggregate as defined in this edition ("%s"); membership and weights differ from later regional groupings.'
INDIA_NOTE = 'The table does not state the basis of the India figures (calendar or April-March).'

# edition -> metadata and rows: (economy, printed label, current-year value, next-year value, confidence)
EDITIONS = {
    '1991-05': {
        'title': 'Global Economic Prospects and the Developing Countries 1991',
        'url': DOCS + '165281468765552221/pdf/Global-economic-prospects-and-the-developing-countries-1991.pdf',
        'page': 41, 'table': 'Table 3.4 Growth in developing countries, 1989-92 (GDP columns)',
        'published': 'World Bank Documents & Reports catalog date 1991-05-31',
        'check': 'tesseract at 400 dpi agrees with the PDF text layer for every value; GDP minus GDP per capita growth is steady across 1991 and 1992 in every row (population growth 1.9 to 3.2 percent).',
        'table_note': 'Estimates and projections for 1990-92 exclude Iran and Iraq.',
        'missing': 'World, High-income countries, United States, Japan, China, India, Brazil (the edition prints no annual forecast for them; Table 3.2 gives G-7 GNP, not GDP, and is not captured); "Europe, Middle East, and North Africa" (a grouping with no later counterpart) is not captured.',
        'rows': [
            ('Developing countries', 'All developing countries', 3.1, 4.3, 'medium'),
            ('Sub-Saharan Africa', 'Sub-Saharan Africa', 2.3, 3.0, 'medium'),
            ('East Asia and Pacific', 'East Asia', 5.7, 6.2, 'medium'),
            ('South Asia', 'South Asia', 4.0, 4.5, 'medium'),
            ('Latin America and the Caribbean', 'Latin America', 1.1, 2.8, 'medium'),
        ],
    },
    '1992-04': {
        'title': 'Global Economic Prospects and the Developing Countries 1992',
        'url': DOCS + '875251468762297323/pdf/Global-economic-prospects-and-the-developing-countries-1992.pdf',
        'page': 18, 'table': 'Table 1-6 Real GDP growth rates of developing countries, 1980-2000 (column 1992; 1991 is an estimate, 1990-2000 a decade average)',
        'published': 'World Bank announcement of the report, 16 April 1992 (documents.worldbank.org)',
        'check': 'tesseract at 400 dpi agrees with the PDF text layer; the February 1992 draft of the same table (report 10493) prints the same 1992 values for Sub-Saharan Africa, East Asia, South Asia and Latin America.',
        'table_note': 'Former Soviet Union not included in totals. 1987 prices and exchange rates.',
        'next_year': False,
        'missing': 'next-year (1993) forecasts (the table has none); World, High-income countries and countries (no annual forecast table); "Eastern Europe" (no later counterpart) is not captured.',
        'rows': [
            ('Developing countries', 'All developing countries', 3.9, None, 'medium'),
            ('Sub-Saharan Africa', 'Sub-Saharan Africa', 3.4, None, 'medium'),
            ('East Asia and Pacific', 'East Asia', 7.1, None, 'medium'),
            ('South Asia', 'South Asia', 2.8, None, 'medium'),
            ('Middle East and North Africa', 'Middle East and North Africa', 4.9, None, 'medium'),
            ('Latin America and the Caribbean', 'Latin America', 2.6, None, 'medium'),
        ],
    },
    '1995-08': {
        'title': 'Global Economic Prospects and the Developing Countries 1995: short-term update',
        'url': DOCS + '446141492622943161/pdf/multi0page.pdf',
        'page': 49, 'table': 'Annex C, Table C.1 World and Major Regions: Growth of Real GDP (in constant 1987 U.S. dollars)',
        'published': 'source line "International Economics Department, August 1995"',
        'check': 'tesseract at 400 dpi agrees with the PDF text layer for every value; World and low- and middle-income growth also agree with the edition\'s Table 1 (page 7).',
        'table_note': 'In constant 1987 U.S. dollars. Low and middle income includes Eastern Europe and the former Soviet Union; Sub-Saharan Africa includes the Republic of South Africa.',
        'missing': 'none of the scope slots but Advanced/EMDE groups, which did not exist; Germany and sub-regional rows are not captured.',
        'rows': [
            ('World', 'WORLD Total', 2.8, 3.1, 'medium'),
            ('High-income countries', 'HIGH-INCOME Countries', 2.6, 2.5, 'medium'),
            ('Developing countries', 'LOW and MIDDLE INCOME', 3.5, 5.0, 'medium'),
            ('United States', 'United States', 2.8, 2.3, 'medium'),
            ('Japan', 'Japan', 0.7, 1.9, 'medium'),
            ('China', 'China', 9.9, 9.2, 'medium'),
            ('India', 'India', 5.2, 5.1, 'medium'),
            ('Brazil', 'Brazil', 4.9, 4.5, 'medium'),
            ('East Asia and Pacific', 'East Asia', 9.0, 8.2, 'medium'),
            ('South Asia', 'South Asia', 5.2, 5.1, 'medium'),
            ('Sub-Saharan Africa', 'SUB-SAHARAN AFRICA', 3.5, 3.8, 'medium'),
            ('Europe and Central Asia', 'EUROPE and CENTRAL ASIA', -1.6, 3.3, 'medium'),
            ('Middle East and North Africa', 'MIDDLE EAST & N. AFRICA', 2.2, 3.8, 'medium'),
            ('Latin America and the Caribbean', 'LATIN AMERICA & CARIB.', 1.9, 3.6, 'medium'),
        ],
        'world_past': [(1993, '1993', False, 1.2), (1994, '1994 (estimate)', True, 2.8)],
    },
    '1996-08': {
        'title': 'Global Economic Prospects and the Developing Countries 1996: short-term update',
        'url': DOCS + '324381492624417285/pdf/multi0page.pdf',
        'page': 39, 'table': 'Annex A, Table A.1 World and Major Regions: Growth of Real GDP (in constant 1987 U.S. dollars), "Current Forecasts" columns',
        'published': 'cut-off date for data stated in the report: 22 August 1996',
        'check': 'tesseract at 400 dpi agrees with the PDF text layer for every value but World, whose row the text layer garbles; World (2.4, 2.7, 3.2) was read from the page image and equals the edition\'s Table 1 (page 10), as do low- and middle-income growth.',
        'table_note': 'In constant 1987 U.S. dollars. Low and middle income includes Central and Eastern Europe and the former Soviet Union. The table also reprints the March 1996 (GEP 1996) forecasts; those are not captured as forecasts of this edition.',
        'missing': 'Brazil (no row in this table); Germany and sub-regional rows are not captured.',
        'rows': [
            ('World', 'WORLD Total', 2.7, 3.2, 'medium'),
            ('High-income countries', 'HIGH-INCOME Countries', 2.4, 2.7, 'medium'),
            ('Developing countries', 'LOW and MIDDLE INCOME', 4.1, 5.1, 'medium'),
            ('United States', 'United States', 2.3, 2.0, 'medium'),
            ('Japan', 'Japan', 3.3, 3.3, 'medium'),
            ('China', 'China', 9.5, 9.7, 'medium'),
            ('India', 'India', 5.9, 5.7, 'medium'),
            ('East Asia and Pacific', 'East Asia and Pacific', 8.7, 8.8, 'medium'),
            ('South Asia', 'South Asia', 5.9, 5.4, 'medium'),
            ('Sub-Saharan Africa', 'SUB-SAHARAN AFRICA', 3.8, 3.5, 'medium'),
            ('Europe and Central Asia', 'EUROPE and CENTRAL ASIA', 0.6, 3.6, 'medium'),
            ('Middle East and North Africa', 'MIDDLE EAST & NORTH AFRICA', 3.2, 3.6, 'medium'),
            ('Latin America and the Caribbean', 'LATIN AMERICA and CARIBBEAN', 2.5, 3.6, 'medium'),
        ],
        'world_past': [(1995, '1995 (estimate)', True, 2.4)],
    },
    '1998-12': {
        'title': 'Global Economic Prospects and the Developing Countries 1998/99: Beyond Financial Crisis',
        'url': DOCS + '739741468175437049/pdf/187770REPLACEM11500514207100CHINESE.pdf',
        'page': 25, 'table': 'Table 1-2 World output growth, 1981-2007 (columns 1998 and 1999, under "Forecast")',
        'published': 'World Bank Documents & Reports catalog date 1998-12-31 (may be a placeholder); the table source line says "baseline projections, November 1998"',
        'check': 'The English scan (' + DOCS + '600471468127172589/pdf/Global-economic-prospects-and-the-developing-countries-1998-1999-beyond-financial-crisis.pdf#page=32) is a 1-bit image whose digits are broken; values were read from the World Bank\'s Chinese edition of the same report (report 18777), whose table has the same rows, columns and note. The Chinese PDF text layer agrees with a reading of the page image for every value; the legible fragments of the English scan agree; World growth lies between high-income and developing growth in every column.',
        'table_note': 'GDP is measured at market prices and expressed in 1987 prices and exchange rates.',
        'estimate_note': 'Published in December 1998 from a November 1998 baseline; the table prints 1998 under "Forecast".',
        'missing': 'United States, Japan, China, India, Brazil (no rows in this table).',
        'rows': [
            ('World', 'World total', 1.8, 1.9, 'medium'),
            ('High-income countries', 'High-income countries', 1.7, 1.6, 'medium'),
            ('Developing countries', 'Developing countries', 2.0, 2.7, 'medium'),
            ('East Asia and Pacific', 'East Asia and Pacific', 1.3, 4.8, 'medium'),
            ('Europe and Central Asia', 'Europe and Central Asia', 0.5, 0.1, 'medium'),
            ('Latin America and the Caribbean', 'Latin America and the Caribbean', 2.5, 0.6, 'medium'),
            ('Middle East and North Africa', 'Middle East and North Africa', 2.0, 2.8, 'medium'),
            ('South Asia', 'South Asia', 4.6, 4.9, 'medium'),
            ('Sub-Saharan Africa', 'Sub-Saharan Africa', 2.4, 3.2, 'medium'),
        ],
        'world_past': [(1997, '1997', False, 3.2)],
    },
}

# World statements in 1990s editions that carry no annual forecast (only the past-year column is used).
EXTRA_WORLD_PAST = [
    ('1997-09', DOCS + '650721468774883393/pdf/multi0page.pdf', 15, 1996, '1996 (estimate)', True, 2.9),
]

NOT_FOUND = {
    '1993-04': 'Global Economic Prospects and the Developing Countries 1993: forecast tables give decade averages only (1992-2002).',
    '1994-04': 'Global Economic Prospects and the Developing Countries 1994: Table 1-1 gives 1991-93 estimates and a 1994-2003 average only.',
    '1995-04': 'Global Economic Prospects and the Developing Countries 1995: Table 1-1 gives a 1994 estimate, a 1995-96 two-year average and a 1995-2004 average; no single-year forecast.',
    '1996-04': 'Global Economic Prospects and the Developing Countries 1996: Table 1-3 gives a 1995 estimate, a 1996-97 two-year average and a 1996-2005 average; no single-year forecast.',
    '1997-09': 'Global Economic Prospects and the Developing Countries 1997: Table 1-2 gives a 1996 estimate and a 1997-2006 average; no single-year forecast.',
}


def entry(ed, meta, economy, label, year, horizon, value, conf):
    e = {'economy': economy, 'economy_code': CODES[economy], 'metric': 'real GDP growth', 'target_year': year, 'horizon': horizon,
         'value': value, 'unit': '%', 'label': '%s / %d' % (label, year), 'source_url': '%s#page=%d' % (meta['url'], meta['page']),
         'confidence': conf}
    notes = []
    if economy in GROUP_NOTE:
        notes.append(GROUP_NOTE[economy] % label)
    if CODES[economy] in ('EAP', 'SAS', 'SSA', 'LAC', 'MNA', 'ECA'):
        notes.append(REGION_NOTE % label)
    if economy == 'India':
        notes.append(INDIA_NOTE)
    if horizon == 'current_year' and meta.get('estimate_note'):
        notes.append(meta['estimate_note'])
    notes.append('Read by OCR from a scanned table; checked by a second read.')
    e['note'] = ' '.join(notes)
    return e


def main():
    for ed, meta in EDITIONS.items():
        y = int(ed[:4])
        entries = []
        for economy, label, cur, nxt, conf in meta['rows']:
            entries.append(entry(ed, meta, economy, label, y, 'current_year', cur, conf))
            if meta.get('next_year', True):
                entries.append(entry(ed, meta, economy, label, y + 1, 'next_year', nxt, conf))
        doc = {
            'edition': ed, 'published': ed, 'publisher': 'World Bank', 'series': 'Global Economic Prospects',
            'source_vintage': meta['title'], 'status': 'partial',
            'sources': ['%s#page=%d' % (meta['url'], meta['page'])],
            'entries': entries,
            'notes': '%s. %s, page %d of %s, a scanned report. Read by OCR: %s Table note: %s Values as printed (1 decimal); '
                     'aggregates use the World Bank grouping and 1987 weights of that edition. Published month: %s. Not captured: %s'
                     % (meta['title'], meta['table'], meta['page'], meta['url'], meta['check'], meta['table_note'], meta['published'], meta['missing']),
        }
        with open(os.path.join(RAW, ed + '.json'), 'w') as f:
            json.dump(doc, f, indent=1, ensure_ascii=False)
        print(ed, len(entries))

    path = os.path.join(RAW, 'realized.json')
    r = json.load(open(path))
    ours = set(EDITIONS) | {x[0] for x in EXTRA_WORLD_PAST}
    weights = dict(r['world_weights'])
    for ed in EDITIONS:
        weights[ed] = '1987 prices'
    r['world_weights'] = dict(sorted(weights.items()))
    past = [x for x in r['world_restated'] if x['stated_in'] not in ours]
    add = []
    for ed, meta in EDITIONS.items():
        for year, col, est, v in meta.get('world_past', []):
            add.append((ed, '%s#page=%d' % (meta['url'], meta['page']), year, col, est, v))
    add += [(ed, '%s#page=%d' % (u, p), year, col, est, v) for ed, u, p, year, col, est, v in EXTRA_WORLD_PAST]
    for ed, url, year, col, est, v in add:
        past.append({'economy': 'World', 'target_year': year, 'value': v, 'unit': '%', 'stated_in': ed, 'column': col, 'estimate': est,
                     'weights': '1987 prices', 'source_url': url, 'confidence': 'medium'})
    r['world_restated'] = sorted(past, key=lambda x: (x['stated_in'], x['target_year']))
    if '1987 prices' not in r['world_restated_note']:
        r['world_restated_note'] += (' 1990s editions (scanned reports, OCR, #11; scripts/world-bank-gep/gep_1990s.py): GEP 1995 and 1996 short-term'
                                     ' updates, GEP 1997 and GEP 1998/99 state 1987 prices and exchange rates.')

    if len(sys.argv) > 1:
        meta, rows = json.load(open(sys.argv[1]))
        src = 'World Development Indicators NY.GDP.MKTP.KD.ZG (last updated %s)' % meta['lastupdated']
        have = {(e['economy'], e['target_year']) for e in r['entries']}
        names = {'United States': 'United States', 'Japan': 'Japan', 'China': 'China', 'India': 'India', 'Brazil': 'Brazil'}
        india_note = next((e.get('note') for e in r['entries'] if e['economy'] == 'India' and e['source'].startswith('World Development')), None)
        for x in rows:
            eco, yr = names[x['country']['value']], int(x['date'])
            if yr >= 1998 or x['value'] is None or (eco, yr) in have:
                continue
            e = {'economy': eco, 'economy_code': x['countryiso3code'], 'target_year': yr, 'value': round(x['value'], 3), 'unit': '%',
                 'source': src, 'confidence': 'high'}
            if eco == 'India' and india_note:
                e['note'] = india_note
            r['entries'].append(e)
        r['source'] = r['source'].replace('World Development Indicators (1998 to 2025)', 'World Development Indicators (1990 to 2025; 1990 to 1997 for United States, Japan, China, India and Brazil only)')
        if WDI_URL not in r['source_url']:
            r['source_url'].append(WDI_URL)
    with open(path, 'w') as f:
        json.dump(r, f, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
