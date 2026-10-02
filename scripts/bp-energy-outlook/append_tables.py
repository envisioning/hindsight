"""Append summary-table rows to the 2014, 2018 and 2022 edition files (#15, #71).

Reads st-<edition>.rows.json (written by extract.py) from the directory given as the first argument and
appends world oil demand (Mb/d; 2018 and 2022) and the renewables share of primary energy to
data/raw/bp-energy-outlook/<edition>.json. An edition whose rows file is missing is skipped. Existing rows are never changed or reordered (D15);
a row whose metric, year and scenario are already in the file is skipped, so the script can be re-run.
Projection rows come first and base-year rows last.

Inputs (see README.md):
- 2014: BP_Energy_Outlook_2035_Summary_Tables_2014.xls, archive.org capture of 2014-02-24 (legacy .xls, read
  with xls_dump.py). Renewables share only: the tables give liquids in Mtoe, not Mb/d. Renewables include the
  biofuels row, as for 2015 to 2017 (bp's headline 'renewables (including biofuels)').
- 2018: bp-energy-outlook-2018-summary-tables.xlsx. archive.org holds no capture of any 2018 table file
  (CDX, 2026-10-02: only a 404 for the 2018 data pack), so the file is read from the NRGI mirror
  (github.com/NRGI/bp-energy-outlook-tracking). That mirror's 2019 summary tables are identical, cell for
  cell, to the archive.org copy of bp's 2019 file.
- 2022: bp-energy-outlook-2022-summary-tables.xlsx, archive.org capture of 2023-01-28. The capture of
  2022-04-03 carries a stale 'Renewables - EJ' sheet (scenario labels and 2018 base year of the 2020
  edition); its oil sheet is identical to the 2023-01-28 capture.
2022 rows for 2050 and the 2019 base year are already in the file from 'data at a glance'; only 2025 to
2045 are appended.
Python 3 standard library only.
"""
import json, os, sys, pathlib

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', '..', 'data', 'raw', 'bp-energy-outlook')
SRC = {
    '2014': 'https://web.archive.org/web/20140224041754/http://www.bp.com:80/content/dam/bp/excel/Energy%20Economics/BP_Energy_Outlook_2035_Summary_Tables_2014.xls',
    '2018': 'https://raw.githubusercontent.com/NRGI/bp-energy-outlook-tracking/HEAD/bp-energy-outlook-2018-summary-tables.xlsx',
    '2022': 'https://web.archive.org/web/20230128204915/https://www.bp.com/content/dam/bp/business-sites/en/global/corporate/xlsx/energy-economics/energy-outlook/bp-energy-outlook-2022-summary-tables.xlsx',
}
METRIC = {
    ('2014', 'renewables share of primary energy'): 'renewables share of primary energy (renewables (incl. biofuels, excl. hydro))',
    ('2018', 'oil demand'): "oil demand (summary table 'Oil - Mbd')",
    ('2018', 'renewables share of primary energy'): "renewables share of primary energy (renewables (excl. hydro; bp 'Renewables' table))",
    ('2022', 'oil demand'): "oil demand (summary table 'Oil - Mbd')",
    ('2022', 'renewables share of primary energy'): 'renewables share of primary energy (renewables (incl. bioenergy, excl. hydro))',
}
BASE_YEAR = {'2014': 2012, '2018': 2016, '2022': 2019}
CENTRAL = {'2014': 'base case', '2018': 'Evolving Transition (ET)'}  # editions with a central case: rows are forecasts


def entry(ed, r):
    metric = METRIC[(ed, r['metric'])]
    oil = r['metric'] == 'oil demand'
    base = r['year'] == BASE_YEAR[ed]
    scen = 'historical (base year)' if base else CENTRAL.get(ed, r['scenario'])
    e = {'subject': 'oil' if oil else 'renewables', 'metric': metric, 'target_year': r['year'],
         'value': round(r['value'], 2) if oil else r['value'], 'unit': 'Mb/d' if oil else 'percent', 'scenario': scen,
         'main_scenario': ed in CENTRAL and not base}
    if ed == '2022' and scen == 'New Momentum':
        e['current_trajectory_scenario'] = True
    e['claim_type'] = 'base_year' if base else ('forecast' if ed in CENTRAL else 'scenario')
    sheet = r['sheet'].replace(' / ', ' / ')
    if oil:
        e['position'] = f"Summary tables, sheet '{sheet}', row 'World'"
    elif ed == '2014':
        e['position'] = "Summary tables, sheet 'Consumption by fuel', rows 'Total Renewables Consumption' plus 'Of which Biofuels' over 'Total Energy Consumption'"
    else:
        e['position'] = f"Summary tables, sheets {sheet}, row 'World'"
    e['source_url'] = SRC[ed]
    e['confidence'] = 'medium' if ed == '2018' else 'high'
    notes = []
    if not oil:
        e['derived'] = True
        notes.append(f"Computed as renewables / total primary energy from the table ({r['renewables']:.1f} / {r['primary']:.1f}). Not a figure bp prints.")
        if ed == '2014':
            notes.append("Renewables include the table's biofuels row (bp's 'renewables (including biofuels)').")
    if ed == '2018':
        notes.append('Read from a third-party mirror of bp\'s summary tables file (NRGI); archive.org holds no capture.')
    if notes:
        e['note'] = ' '.join(notes)
    return e


def main(d):
    d = pathlib.Path(d)
    for ed in ('2014', '2018', '2022'):
        if not (d / f'st-{ed}.rows.json').exists():
            print(ed, 'skipped: no rows file')
            continue
        rows = json.load(open(d / f'st-{ed}.rows.json'))
        path = os.path.join(RAW, f'{ed}.json')
        doc = json.load(open(path))
        have = {(e['metric'], e.get('target_year'), e.get('scenario')) for e in doc['entries']}
        new = []
        for r in rows:
            if r['year'] < BASE_YEAR[ed] or (ed == '2022' and r['year'] in (2019, 2050)):
                continue
            e = entry(ed, r)
            if (e['metric'], e['target_year'], e['scenario']) not in have:
                new.append(e)
        new.sort(key=lambda e: e['claim_type'] == 'base_year')  # stable: projections first, base-year rows last
        doc['entries'] += new
        if SRC[ed] not in doc['sources']:
            doc['sources'].append(SRC[ed])
        json.dump(doc, open(path, 'w'), indent=1, ensure_ascii=False)
        print(ed, 'appended', len(new))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else HERE)
