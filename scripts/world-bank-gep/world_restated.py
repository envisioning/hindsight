"""Add the GEP's own later-stated World growth to data/raw/world-bank-gep/realized.json (#66).

Before 2019 the GEP weighted World growth at 1995, 2000, 2005 or 2010 prices; the WDI World actual uses
2015 USD weights, a different aggregate. Each GEP table also prints World growth for one to three past
years, on that edition's own weights. This script stores those past-year columns with the edition's
weights base (from the table note, `parse.gdp_weights`), so a forecast can be graded against the latest
later statement on its own base.

Reads parsed.json (written by fetch.py; pass another path as the first argument). Writes two keys into
realized.json and leaves its `entries` unchanged:
- `world_weights`: edition -> price base of its market-exchange-rate GDP weights (null when the table states none);
- `world_restated`: one row per edition and past-year World column (target year before the edition's
  publication year).
Python 3 standard library only.
"""
import json, os, sys
from editions import edition

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'world-bank-gep', 'realized.json')


def main():
    parsed = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'parsed.json')))
    weights, rows = {}, []
    for stem, p in sorted(parsed.items(), key=lambda kv: edition(kv[0])[0]):
        eid, pub = edition(stem)[:2]
        base = p.get('gdp_weights')
        if 'gdp_weights' not in p:
            raise SystemExit('parsed.json has no gdp_weights; re-run fetch.py')
        weights[eid] = base
        world = p['values'].get('World') or {}
        tok = {int(t[:4]): t for t in p['years']}
        for y, v in sorted(world.items(), key=lambda kv: int(kv[0])):
            y = int(y)
            if y >= int(pub[:4]):
                continue  # current or future year of this edition: a forecast, not a later statement
            t = tok.get(y, str(y))
            rows.append({'economy': 'World', 'target_year': y, 'value': v, 'unit': '%', 'stated_in': eid,
                         'column': t, 'estimate': t[4:] in ('e', '*', 'h'), 'weights': base,
                         'source_url': p['source'].split(' (')[0], 'confidence': 'high' if base else 'low'})
    real = json.load(open(OUT))
    real['world_weights'] = weights
    real['world_restated'] = rows
    real['world_restated_note'] = (
        'World real GDP growth for past years as printed in each GEP edition table, on that edition\'s weights '
        '(`world_weights`: the price base of the market-exchange-rate GDP weights in the table note). GEP 2001 and 2002 '
        'print no GDP note; their base is read from the note that their price aggregates use "1995 GDP weights". '
        'GEP 2000 states no base (null). Columns marked e are estimates. Written by scripts/world-bank-gep/world_restated.py (#66).')
    json.dump(real, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print(len(rows), 'rows;', {str(b): sum(1 for v in weights.values() if v == b) for b in set(weights.values())})


if __name__ == '__main__':
    main()
