"""Build data/raw/bcb-focus/ from the BCB Focus (Olinda) and SGS APIs.

Usage:
  python3 build.py --fetch [CACHE_DIR]   download inputs into CACHE_DIR, then build
  python3 build.py [CACHE_DIR]           build from inputs already in CACHE_DIR

CACHE_DIR defaults to this script's folder (its *.json files are gitignored).
Python 3, standard library only.
"""
import datetime, json, os, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'bcb-focus')

OLINDA = 'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais'
SGS = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados'

# (Focus label, cache file, metric, unit, subject)
INDICATORS = [
    ('IPCA', 'focus_ipca.json', 'IPCA inflation, December to December', '%', 'brazil-ipca-inflation'),
    ('PIB Total', 'focus_pib_total.json', 'real GDP growth', '%', 'brazil-real-gdp-growth'),
    ('Selic', 'focus_selic.json', 'Selic target rate at year end', '% p.a.', 'brazil-selic-rate'),
    ('Câmbio', 'focus_cambio.json', 'exchange rate at year end', 'BRL per USD', 'brazil-usd-brl-exchange-rate'),
]
# Focus changed the year-end exchange rate definition (BCB announcement 2021-01-15, in force 2021-01-25).
CAMBIO_SWITCH = '2021-01-25'
FIRST_YEAR, LAST_YEAR = 1999, 2026
QUARTER_MONTHS = (3, 6, 9, 12)
REALIZED_LAST_YEAR = 2025

SGS_SERIES = {
    13522: ('sgs_13522.json', None),  # IPCA, 12-month accumulated, monthly (IBGE)
    7326: ('sgs_7326.json', None),    # GDP real growth rate, annual (IBGE)
    3696: ('sgs_3696.json', None),    # USD/BRL PTAX sell, end of period, monthly
    3697: ('sgs_3697.json', None),    # USD/BRL PTAX sell, period average, monthly
}
SELIC_WINDOWS = [('01/01/1999', '31/12/2008'), ('01/01/2009', '31/12/2018'), ('01/01/2019', '31/12/2026')]


def get(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            json.loads(data)
            with open(path, 'wb') as f:
                f.write(data)
            return
        except Exception as e:  # noqa: BLE001
            err = e
    raise SystemExit('fetch failed 3 times: %s (%s)' % (url, err))


def olinda_url(params):
    return OLINDA + '?' + urllib.parse.urlencode(params, quote_via=urllib.parse.quote, safe="$,'")


def fetch(cache):
    for label, fn, *_ in INDICATORS:
        get(olinda_url({'$top': '1000000', '$format': 'json', '$filter': "Indicador eq '%s'" % label}),
            os.path.join(cache, fn))
    for code, (fn, _) in SGS_SERIES.items():
        get(SGS.format(code=code) + '?formato=json&dataInicial=01/01/1999&dataFinal=31/12/2026', os.path.join(cache, fn))
    for i, (a, b) in enumerate(SELIC_WINDOWS):
        get(SGS.format(code=432) + '?formato=json&dataInicial=%s&dataFinal=%s' % (a, b),
            os.path.join(cache, 'sgs_432_%d.json' % i))


def num(v):
    return None if v is None else round(float(v), 4)


def entry_url(label, date):
    return olinda_url({'$format': 'json',
                       '$filter': "Indicador eq '%s' and Data eq '%s' and baseCalculo eq 0" % (label, date)})


def build(cache):
    os.makedirs(OUT, exist_ok=True)
    today = datetime.date.today().isoformat()
    now = lambda: datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    # rows[label][date][year] = row (baseCalculo 0 only)
    rows = {}
    for label, fn, *_ in INDICATORS:
        d = json.load(open(os.path.join(cache, fn)))['value']
        by = rows.setdefault(label, {})
        for x in d:
            if x['Indicador'] != label or x['baseCalculo'] != 0:
                continue
            by.setdefault(x['Data'], {})[int(x['DataReferencia'])] = x
    latest = max(max(v) for v in rows.values())

    index_rows, progress = [], []
    for year in range(FIRST_YEAR, LAST_YEAR + 1):
        for month in QUARTER_MONTHS:
            eid = '%d-%02d' % (year, month)
            if eid < '1999-05':  # survey started May 1999
                continue
            month_end = datetime.date(year + (month == 12), month % 12 + 1, 1) - datetime.timedelta(days=1)
            if month_end.isoformat() > latest:
                if eid <= latest[:7]:
                    index_rows.append((eid, '', '', 0, 'missing',
                                       'month not ended in source data (latest survey date %s)' % latest))
                continue
            entries, gaps, dates = [], [], set()
            for label, fn, metric, unit, subject in INDICATORS:
                days = sorted(dt for dt in rows[label] if dt.startswith(eid))
                if not days:
                    gaps.append('%s: no survey data in month' % label)
                    continue
                dt = days[-1]
                dates.add(dt)
                for ty, horizon in ((year, 'current_year'), (year + 1, 'next_year')):
                    x = rows[label][dt].get(ty)
                    if x is None or x['Mediana'] is None:
                        prior = [d for d in days if ty in rows[label][d]]
                        if not prior:
                            prior = [d for d in rows[label] if d < dt and ty in rows[label][d]]
                        gaps.append('%s %d: not in source on %s%s' % (
                            label, ty, dt, ' (last value on %s)' % max(prior) if prior else ''))
                        continue
                    e = {'economy': 'Brazil', 'economy_code': 'BRA', 'label': label, 'metric': metric,
                         'subject': subject, 'statistic': 'median', 'target_year': ty, 'horizon': horizon,
                         'value': num(x['Mediana']), 'unit': unit, 'survey_date': dt,
                         'respondents': x.get('numeroRespondentes'), 'base_calculo': 0,
                         'source_url': entry_url(label, dt), 'confidence': 'high'}
                    if e['respondents'] is None:
                        del e['respondents']
                    if label == 'Câmbio':
                        if dt < CAMBIO_SWITCH:
                            e['definition'] = 'PTAX sell rate on the last business day of the year'
                        else:
                            e['definition'] = 'average PTAX sell rate in December'
                    entries.append(e)
            if not entries:
                index_rows.append((eid, '', '', 0, 'missing', '; '.join(gaps)))
                continue
            status = 'complete' if not gaps else 'partial'
            published = max(dates)
            notes = ('Median of market expectations (Focus, Sistema Expectativas de Mercado), statistics over '
                     'forecasts submitted in the 30 days up to the survey date (baseCalculo 0). Sample: last '
                     'survey date of %s in the Olinda daily series.' % eid)
            if len(dates) > 1:
                notes += ' Indicators have different last survey dates in this month: %s.' % ', '.join(sorted(dates))
            if gaps:
                notes += ' Gaps: %s.' % '; '.join(gaps)
            doc = {'edition': eid, 'published': published, 'publisher': 'Banco Central do Brasil',
                   'series': 'Focus market expectations survey (Sistema Expectativas de Mercado)',
                   'status': status, 'sources': [OLINDA], 'retrieved': today,
                   'entries': entries, 'notes': notes}
            with open(os.path.join(OUT, eid + '.json'), 'w') as f:
                json.dump(doc, f, ensure_ascii=False, indent=1)
                f.write('\n')
            index_rows.append((eid, published, ', '.join(sorted(dates)), len(entries), status, '; '.join(gaps)))
            progress.append('| %s | %s | %d entries | %s |' % (eid, status, len(entries), now()))
            with open(os.path.join(OUT, 'PROGRESS.md'), 'w') as f:
                f.write('# bcb-focus progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n')
                f.write('\n'.join(progress) + '\n')

    header = open(os.path.join(HERE, 'index_header.md')).read()
    with open(os.path.join(OUT, 'INDEX.md'), 'w') as f:
        f.write(header.rstrip() + '\n\n## Editions\n\n')
        f.write('| Edition | Published | Survey dates | Entries | Status | Gaps |\n|---|---|---|---|---|---|\n')
        for r in index_rows:
            f.write('| %s | %s | %s | %d | %s | %s |\n' % r)

    write_realized(cache, today)


def sgs(cache, fn):
    out = []
    for x in json.load(open(os.path.join(cache, fn))):
        d, m, y = x['data'].split('/')
        out.append(('%s-%s-%s' % (y, m, d), float(x['valor'])))
    return out


def write_realized(cache, today):
    entries = []

    def add(subject, label, metric, unit, year, value, date, code, note=None):
        e = {'economy': 'Brazil', 'economy_code': 'BRA', 'label': label, 'subject': subject, 'metric': metric,
             'target_year': year, 'value': value, 'unit': unit, 'observation_date': date,
             'sgs_series': code,
             'source_url': SGS.format(code=code) + '?formato=json',
             'confidence': 'high'}
        if note:
            e['note'] = note
        entries.append(e)

    for date, v in sgs(cache, 'sgs_13522.json'):
        y = int(date[:4])
        if date[5:7] == '12' and y <= REALIZED_LAST_YEAR:
            add('brazil-ipca-inflation', 'IPCA', 'IPCA inflation, December to December', '%', y, v, date, 13522)
    for date, v in sgs(cache, 'sgs_7326.json'):
        y = int(date[:4])
        if y <= REALIZED_LAST_YEAR:
            add('brazil-real-gdp-growth', 'PIB Total', 'real GDP growth', '%', y, v, date, 7326,
                'IBGE national accounts, latest vintage; subject to revision.')
    selic = []
    for i in range(len(SELIC_WINDOWS)):
        selic += sgs(cache, 'sgs_432_%d.json' % i)
    last = {}
    for date, v in selic:
        last[int(date[:4])] = (date, v)
    for y in sorted(last):
        if y <= REALIZED_LAST_YEAR:
            date, v = last[y]
            add('brazil-selic-rate', 'Selic', 'Selic target rate at year end', '% p.a.', y, v, date, 432)
    for date, v in sgs(cache, 'sgs_3696.json'):
        y = int(date[:4])
        if date[5:7] == '12' and y <= REALIZED_LAST_YEAR:
            add('brazil-usd-brl-exchange-rate', 'Câmbio', 'exchange rate at year end: PTAX sell, last business day',
                'BRL per USD', y, v, date, 3696,
                'Matches the Focus definition for forecasts made before 2021-01-25.')
    for date, v in sgs(cache, 'sgs_3697.json'):
        y = int(date[:4])
        if date[5:7] == '12' and y <= REALIZED_LAST_YEAR:
            add('brazil-usd-brl-exchange-rate', 'Câmbio', 'exchange rate at year end: PTAX sell, December average',
                'BRL per USD', y, v, date, 3697,
                'Matches the Focus definition for forecasts made from 2021-01-25.')
    doc = {'source': 'Banco Central do Brasil, SGS (Sistema Gerenciador de Séries Temporais) API; IPCA and GDP originate at IBGE',
           'vintage': today,
           'source_url': 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{code}/dados?formato=json',
           'notes': ('Realized values for %d to %d. 2026 and later are excluded (not yet realized). '
                     'SGS 13522: IPCA accumulated over 12 months, December value. SGS 7326: real GDP growth, annual, '
                     'latest IBGE vintage. SGS 432: Copom Selic target, value in force on the last date of the year. '
                     'SGS 3696 and 3697: USD/BRL PTAX sell rate, December end of period and December average. '
                     'No errors or grades are computed.') % (FIRST_YEAR, REALIZED_LAST_YEAR),
           'entries': entries}
    with open(os.path.join(OUT, 'realized.json'), 'w') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    args = sys.argv[1:]
    do_fetch = '--fetch' in args
    args = [a for a in args if a != '--fetch']
    cache = os.path.abspath(args[0]) if args else HERE
    os.makedirs(cache, exist_ok=True)
    if do_fetch:
        fetch(cache)
    build(cache)
