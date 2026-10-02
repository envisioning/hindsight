"""OECD Economic Outlook PDFs on oecd.org for the 20 editions that no archived file covered
(issue #10): EO47 to EO59, EO61, EO69, EO71, EO73, EO82, EO91 and EO92.

The PDFs sit under https://www.oecd.org/content/dam/oecd/en/publications/reports/ at paths that
carry a hash. The hashes come from Internet Archive captures of the OECD publication pages
(https://www.oecd.org/en/publications/oecd-economic-outlook-volume-YYYY-issue-N_eco_outlook-vYYYY-N-en.html,
which name it in og:url), from the Internet Archive CDX index of content/dam (EO59, EO91, EO92),
or from probing neighbouring hashes, which the OECD assigned in sequence for the 1990s volumes.
Every URL in PDF below answered HTTP 200 with the PDF on 2026-10-02.

Values were read at 1 decimal as printed, twice: EO47 to EO59 are scans with an OCR text layer;
each value was read from the text layer and from a rendered page image (EO56 United States from
two renderings, the text layer has no digits for that row). EO61 and later have a native text
layer; values were read from it and checked again by mapping each row to the header years.

Scope and definition calls:
  - EO47 to EO50 (1990 to 1991) show "real GNP/GDP": the United States, Japan and Germany (western
    Germany) are on a GNP basis, and the OECD total aggregates GNP and GDP. Only the United Kingdom
    is on a GDP basis there; the other rows are not captured (a different measure).
  - EO51 (June 1992): Japan and Germany (western Germany) are GNP; not captured. The OECD total
    is captured with a note (a GDP-weighted aggregate that holds those two GNP rows).
  - From EO52 the tables are GDP for all rows; Germany is the whole of Germany from 1992.
  - Before EO66 the tables show the European Union, not the euro area; no euro area row.
  - EO47 to EO59 tables cover OECD members only; EO61 is the "Summary of projections" (OECD total,
    United States, Japan, Germany). EO82, EO91 and EO92 add China, India and Brazil from the
    "Macroeconomic indicators" tables of the non-member country notes (India: fiscal years).

Run:  python3 pdfs.py      (no download: the values are transcribed below)
Writes the edition files in data/raw/oecd-economic-outlook/ and merges their rows into PROGRESS.md.
"""
import datetime, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'oecd-economic-outlook')
PUBLISHER = 'Organisation for Economic Co-operation and Development'
SERIES = 'OECD Economic Outlook'
ECON = ['OECD total', 'United States', 'Euro area', 'Japan', 'Germany', 'United Kingdom', 'China', 'India', 'Brazil']
DAM = 'https://www.oecd.org/content/dam/oecd/en/publications/reports/%s/oecd-economic-outlook-volume-%d-issue-%d_%s/eco_outlook-v%d-%d-en.pdf'
PDF = {
    47: ('1990/06', 1990, 1, 'g1g2e2ff'), 48: ('1990/12', 1990, 2, 'g1g2e301'),
    49: ('1991/07', 1991, 1, 'g1g2e303'), 50: ('1991/12', 1991, 2, 'g1g2e305'),
    51: ('1992/06', 1992, 1, 'g1g2e306'), 52: ('1992/12', 1992, 2, 'g1g2e308'),
    53: ('1993/06', 1993, 1, 'g1g2e30a'), 54: ('1993/06', 1993, 2, 'g1g2e30c'),
    55: ('1994/06', 1994, 1, 'g1g2e30e'), 56: ('1994/12', 1994, 2, 'g1g2e310'),
    57: ('1995/06', 1995, 1, 'g1g2e312'), 58: ('1995/12', 1995, 2, 'g1g2e314'),
    59: ('1996/06', 1996, 1, 'g1g2e316'), 61: ('1997/06', 1997, 1, 'g1ghg774'),
    69: ('2001/06', 2001, 1, 'g1ghg821'), 71: ('2002/06', 2002, 1, 'g1ghg831'),
    73: ('2003/06', 2003, 1, 'g1gh31be'), 82: ('2007/12', 2007, 2, 'g1gh7627'),
    91: ('2012/05', 2012, 1, 'g1g16885'), 92: ('2012/11', 2012, 2, 'g1g16888'),
}


def url(n):
    f, y, i, h = PDF[n]
    return DAM % (f, y, i, h, y, i)


GNP_4750 = ('Not captured: the United States, Japan and Germany (western Germany) are real GNP in this table, '
            'and the OECD total is a GNP/GDP aggregate; a different measure from real GDP.')
SCAN = 'Scanned PDF: each value read from the OCR text layer and from a rendered page image; both reads agree.'
GROWTH = 'Table "Growth of real GNP/GDP in %s" (detailed projections, Demand and output), annual percent change.'

# EO: (edition id, table label, where, {economy: (current year, next year)}, confidence, {economy: (confidence, note)}, edition notes)
EDITIONS = {
    47: ('1990-06', 'Table 22. Growth of real GNP/GDP', 'OECD Economic Outlook No. 47 (June 1990), Table 22 "Growth of real GNP/GDP in the OECD area", page 113. The United Kingdom row is marked GDP.',
         {'United Kingdom': (0.9, 1.9)}, 'high', {}, [GNP_4750, SCAN]),
    48: ('1990-12', 'Table 24. Growth of real GNP/GDP', 'OECD Economic Outlook No. 48 (December 1990), Table 24 "Growth of real GNP/GDP in the OECD area", page 107. The United Kingdom row is marked GDP.',
         {'United Kingdom': (1.6, 0.7)}, 'high', {}, [GNP_4750, SCAN]),
    49: ('1991-07', 'Table 21. Growth of real GNP/GDP', 'OECD Economic Outlook No. 49 (July 1991), Table 21 "Growth of real GNP/GDP in major OECD countries and country groups", page 107. The United Kingdom row is marked GDP.',
         {'United Kingdom': (-1.8, 1.6)}, 'high', {}, [GNP_4750, SCAN]),
    50: ('1991-12', 'Table 26. Growth of real GNP/GDP', 'OECD Economic Outlook No. 50 (December 1991), Table 26 "Growth of real GNP/GDP in major OECD countries and country groups", page 123. The United Kingdom row is marked GDP.',
         {'United Kingdom': (-1.9, 2.2)}, 'high', {}, [GNP_4750, SCAN]),
    51: ('1992-06', 'Table 25. Growth of real GDP', 'OECD Economic Outlook No. 51 (June 1992), Table 25 "Growth of real GDP in major OECD countries and country groups".',
         {'OECD total': (1.8, 3.0), 'United States': (2.1, 3.6), 'United Kingdom': (0.4, 2.6)}, 'high',
         {'OECD total': ('medium', 'The table aggregates on 1987 GDP weights but its Japan and Germany (western Germany) rows are GNP.')},
         ['Not captured: Japan (marked GNP) and Germany (western Germany, marked GNP).', SCAN]),
    52: ('1992-12', 'Table 28. Growth of real GDP', 'OECD Economic Outlook No. 52 (December 1992), Table 28 "Growth of real GDP in major OECD countries and country groups". Germany: the whole of Germany from 1992 (box, page iii).',
         {'OECD total': (1.5, 1.9), 'United States': (1.8, 2.4), 'Japan': (1.8, 2.3), 'Germany': (1.4, 1.2), 'United Kingdom': (-1.0, 1.3)}, 'high', {}, [SCAN]),
    53: ('1993-06', 'Table 32. Growth of real GDP', 'OECD Economic Outlook No. 53 (June 1993), Table 32 "Growth of real GDP in major OECD countries and country groups", page 133. Germany: the whole of Germany from 1992 (box, page iii).',
         {'OECD total': (1.2, 2.7), 'United States': (2.6, 3.1), 'Japan': (1.0, 3.3), 'Germany': (-1.9, 1.4), 'United Kingdom': (1.8, 2.9)}, 'high', {}, [SCAN]),
    54: ('1993-12', 'Table A50. Growth of real GDP', 'OECD Economic Outlook No. 54 (December 1993), Table A50 "Growth of real GDP in major OECD countries and country groups", page 176. Germany: the whole of Germany from 1992.',
         {'OECD total': (1.1, 2.1), 'United States': (2.8, 3.1), 'Japan': (-0.5, 0.5), 'Germany': (-1.5, 0.8), 'United Kingdom': (2.0, 2.9)}, 'high', {}, [SCAN]),
    55: ('1994-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 55 (June 1994), Annex Table 1 "Real GDP", page A4. In this issue only, the OECD total does not include Mexico.',
         {'OECD total': (2.6, 2.9), 'United States': (4.0, 3.0), 'Japan': (0.8, 2.7), 'Germany': (1.8, 2.6), 'United Kingdom': (2.8, 3.2)}, 'high',
         {'OECD total': ('high', 'In this issue only, the OECD total does not include Mexico.')}, [SCAN]),
    56: ('1994-12', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 56 (December 1994), Annex Table 1 "Real GDP", page A4.',
         {'OECD total': (2.8, 3.0), 'United States': (3.9, 3.1), 'Japan': (1.0, 2.5), 'Germany': (2.8, 2.8), 'United Kingdom': (3.5, 3.4)}, 'high',
         {'United States': ('medium', 'The OCR text layer has no digits for this row; read twice from rendered page images.')}, [SCAN]),
    57: ('1995-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 57 (June 1995), Annex Table 1 "Real GDP", page A4.',
         {'OECD total': (2.7, 2.7), 'United States': (3.2, 2.3), 'Japan': (1.3, 2.3), 'Germany': (2.9, 2.7), 'United Kingdom': (3.4, 3.0)}, 'high', {}, [SCAN]),
    58: ('1995-12', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 58 (December 1995), Annex Table 1 "Real GDP", page A4.',
         {'OECD total': (2.4, 2.6), 'United States': (3.3, 2.7), 'Japan': (0.3, 2.0), 'Germany': (2.1, 2.4), 'United Kingdom': (2.7, 2.4)}, 'high', {}, [SCAN]),
    59: ('1996-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 59 (June 1996), Annex Table 1 "Real GDP", page A4. The "Summary of projections" shows the same values for the OECD total, the United States, Japan and Germany.',
         {'OECD total': (2.1, 2.5), 'United States': (2.3, 2.0), 'Japan': (2.2, 2.4), 'Germany': (0.5, 2.4), 'United Kingdom': (2.2, 3.0)}, 'high', {}, [SCAN]),
    61: ('1997-06', 'Summary of projections, Real GDP', 'OECD Economic Outlook No. 61 (June 1997), "Summary of projections" (page x), PDF text layer. The summary table shows the European Union, not the euro area, and no United Kingdom row.',
         {'OECD total': (3.0, 2.7), 'United States': (3.6, 2.0), 'Japan': (2.3, 2.9), 'Germany': (2.2, 2.8)}, 'high', {}, []),
    69: ('2001-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 69 (June 2001), Annex Table 1 "Real GDP", PDF text layer. The sheet says "Source: OECD."',
         {'OECD total': (2.0, 2.8), 'United States': (1.7, 3.1), 'Euro area': (2.6, 2.7), 'Japan': (1.0, 1.1), 'Germany': (2.2, 2.4), 'United Kingdom': (2.5, 2.6)}, 'high', {}, []),
    71: ('2002-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 71 (June 2002), Annex Table 1 "Real GDP", PDF text layer.',
         {'OECD total': (1.8, 3.0), 'United States': (2.5, 3.5), 'Euro area': (1.3, 2.9), 'Japan': (-0.7, 0.3), 'Germany': (0.7, 2.5), 'United Kingdom': (1.9, 2.8)}, 'high', {}, []),
    73: ('2003-06', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 73 (June 2003), Annex Table 1 "Real GDP", PDF text layer.',
         {'OECD total': (1.9, 3.0), 'United States': (2.5, 4.0), 'Euro area': (1.0, 2.4), 'Japan': (1.0, 1.1), 'Germany': (0.3, 1.7), 'United Kingdom': (2.1, 2.6)}, 'high', {}, []),
    82: ('2007-12', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 82 (December 2007), Annex Table 1 "Real GDP" ("Source: OECD Economic Outlook 82 database"), PDF text layer; China, India and Brazil from the "Macroeconomic indicators" tables of the non-member country notes.',
         {'OECD total': (2.7, 2.3), 'United States': (2.2, 2.0), 'Euro area': (2.6, 1.9), 'Japan': (1.9, 1.6), 'Germany': (2.6, 1.8), 'United Kingdom': (3.1, 2.0),
          'China': (11.4, 10.7), 'India': (8.8, 8.6), 'Brazil': (4.8, 4.5)}, 'high', {}, []),
    91: ('2012-05', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 91 (May 2012, Volume 2012 Issue 1), Annex Table 1 "Real GDP" ("Source: OECD Economic Outlook 91 database"), PDF text layer; China, India and Brazil from the "Macroeconomic indicators" tables of the non-member country notes. Table 1.1 shows the same values for the OECD total, the United States, the euro area and Japan.',
         {'OECD total': (1.6, 2.2), 'United States': (2.4, 2.6), 'Euro area': (-0.1, 0.9), 'Japan': (2.0, 1.5), 'Germany': (1.2, 2.0), 'United Kingdom': (0.5, 1.9),
          'China': (8.2, 9.3), 'India': (7.3, 7.8), 'Brazil': (3.2, 4.2)}, 'high', {}, []),
    92: ('2012-11', 'Annex Table 1. Real GDP', 'OECD Economic Outlook No. 92 (November 2012, Volume 2012 Issue 2), Annex Table 1 "Real GDP" ("Source: OECD Economic Outlook 92 database"), PDF text layer; China, India and Brazil from the "Macroeconomic indicators" tables of the non-member country notes.',
         {'OECD total': (1.4, 1.4), 'United States': (2.2, 2.0), 'Euro area': (-0.4, -0.1), 'Japan': (1.6, 0.7), 'Germany': (0.9, 0.6), 'United Kingdom': (-0.1, 0.9),
          'China': (7.5, 8.5), 'India': (4.4, 6.5), 'Brazil': (1.5, 4.0)}, 'high', {}, []),
}
WD = 'Working-day adjusted annex figure; may differ from the basis of the official projection.'


def main():
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    prog_new = {}
    for n, (eid, tab, where, vals, conf, per, extra) in EDITIONS.items():
        yr = int(eid[:4])
        u = url(n)
        entries, missing = [], []
        for name in ECON:
            for (ty, h), i in (((yr, 'current_year'), 0), ((yr + 1, 'next_year'), 1)):
                if name not in vals:
                    missing.append('%s %d' % (name, ty))
                    continue
                c, pnote = per.get(name, (conf, None))
                note = ['Read from the printed table (1 decimal).']
                if pnote: note.append(pnote)
                if name in ('China', 'India', 'Brazil'):
                    note = ['Read from the printed "Macroeconomic indicators" table of the country note (1 decimal).']
                if name == 'India': note.append('India: fiscal year (April to March), per the OECD tables.')
                if name == 'Euro area': note.append('Euro area as defined in this vintage (euro area countries that are OECD members).')
                if n in (82, 91, 92) and name not in ('China', 'India', 'Brazil'): note.append(WD)
                label = '%s / %s / EO%d' % (name, 'Macroeconomic indicators, Real GDP growth' if name in ('China', 'India', 'Brazil') else tab, n)
                entries.append({'economy': name, 'economy_code': name, 'metric': 'real GDP growth', 'target_year': ty, 'horizon': h,
                                'value': round(vals[name][i], 3), 'unit': '%', 'label': label, 'source_url': u, 'confidence': c,
                                'note': ' '.join(note)})
        status = 'complete' if not missing else 'partial'
        notes = 'Source: ' + where + ' PDF at oecd.org (path found via the Internet Archive; see scripts/oecd-economic-outlook/pdfs.py). Values at 1 decimal as printed.'
        if extra: notes += ' ' + ' '.join(extra)
        notes += ' Aggregates (OECD total, euro area) use the composition of the time.'
        if missing: notes += ' Not in source for this edition: ' + ', '.join(missing) + '.'
        doc = {'edition': eid, 'published': eid, 'publisher': PUBLISHER, 'series': SERIES, 'source_vintage': 'EO%d' % n,
               'status': status, 'sources': [u], 'entries': entries, 'notes': notes}
        path = os.path.join(OUT, eid + '.json')
        if os.path.exists(path) and json.load(open(path)).get('source_vintage') != 'EO%d' % n:
            raise SystemExit('edition id clash: ' + eid)
        json.dump(doc, open(path, 'w'), indent=1, ensure_ascii=False)
        prog_new[eid] = '| %s | %s | %d entries | %s |' % (eid, status, len(entries), now)
        print('EO%d' % n, eid, status, len(entries))
    pp = os.path.join(OUT, 'PROGRESS.md')
    rows = {}
    for line in open(pp).read().splitlines():
        m = re.match(r'\| (\d{4}-\d{2}) \|', line)
        if m:
            rows[m.group(1)] = line
    rows.update(prog_new)
    open(pp, 'w').write('# oecd-economic-outlook progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n' + '\n'.join(rows[k] for k in sorted(rows)) + '\n')


if __name__ == '__main__':
    main()
