"""Add India calendar-year real GDP growth to data/raw/imf-weo/realized.json (#66).

IMF WEO India forecasts before the July 2013 WEO Update are calendar-year figures; from then on the IMF
reports India on a fiscal-year basis (April to March), and the April 2026 actuals in realized.json are
fiscal-year. The last WEO database on the calendar-year basis is April 2013. This script takes India
NGDP_RPCH from that vintage, 1980 to 2012 (2012 is the vintage's latest year, likely a staff estimate),
and writes it to realized.json under `india_calendar_year`, leaving `entries` unchanged.

Source: IMF WEO database, April 2013 release, as mirrored by DBnomics (dataset IMF/WEO:2013-04), because
imf.org answers HTTP 403 to scripted requests. Python 3 standard library only.
"""
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'imf-weo', 'realized.json')
URL = 'https://api.db.nomics.world/v22/series/IMF/WEO:2013-04/IND.NGDP_RPCH?observations=1'
LAST = 2012  # the April 2013 vintage's last non-forecast year


def main():
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    s = json.loads(urllib.request.urlopen(req, timeout=120).read())['series']['docs'][0]
    assert s['dataset_code'] == 'WEO:2013-04' and s['series_code'].startswith('IND.NGDP_RPCH'), s['series_code']
    rows = []
    for p, v in zip(s['period'], s['value']):
        y = int(p)
        if y > LAST or v in (None, 'NA'):
            continue
        rows.append({'economy': 'India', 'economy_code': 'IND', 'target_year': y, 'value': round(float(v), 3), 'unit': '%',
                     'basis': 'calendar year', 'confidence': 'medium' if y == LAST else 'high'})
    real = json.load(open(OUT))
    real['india_calendar_year'] = {
        'source': 'IMF World Economic Outlook database, April 2013 (the last vintage reporting India on a calendar-year basis), NGDP_RPCH, India',
        'vintage': '2013-04',
        'source_url': 'https://www.imf.org/external/pubs/ft/weo/2013/01/weodata/index.aspx',
        'retrieved_via': URL,
        'notes': ('India real GDP growth on a calendar-year basis, for grading IMF India forecasts made before the July 2013 WEO Update (#66). '
                  'From the July 2013 Update the IMF reports India on a fiscal-year basis (April to March). Values are those of the April 2013 '
                  'vintage, so later revisions of Indian national accounts (new base years) are not reflected. 2012 is the vintage\'s latest year '
                  'and can be a staff estimate (confidence medium). imf.org returned HTTP 403; the values were read from the DBnomics mirror of '
                  'the IMF file (dataset IMF/WEO:2013-04). Check: the April 2013 India forecasts in 2013-04.json (5.676 for 2013, 6.23 for 2014) '
                  'equal this vintage\'s values.'),
        'entries': rows,
    }
    json.dump(real, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(len(rows), 'rows', rows[0]['target_year'], 'to', rows[-1]['target_year'])


if __name__ == '__main__':
    main()
