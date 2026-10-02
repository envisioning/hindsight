"""Older OECD Economic Outlook vintages (issue #10): EO60 to EO97, from files
that oecd.org overwrote with each edition and that the Internet Archive kept.

Inputs (Internet Archive captures, listed in CAPTURES below):
  - Annex Table 1 "Real GDP" (sheet RealGDP) of the annex workbook "Demand and output":
    http://www.oecd.org/dataoecd/6/27/2483806.xls (2002 to 2012) and
    http://www.oecd.org/eco/outlook/Demand%20and%20Output.xls (2013 to 2015).
  - The Economic Outlook "flash file" (summary of projections by country):
    http://www.oecd.org/dataoecd/18/26/2713584.xls (2003 to 2011) and
    http://www.oecd.org/eco/outlook/flash_eo93_nolinked.xls (EO93).
  - Printed tables (TRANSCRIBED): two summary-of-projections tables on the old Economic
    Outlook pages (http://www.oecd.org/eco/out/), and the text layer of Economic Outlook
    PDFs (EO63 to EO68 from https://webdoc.sub.gwdg.de/edoc/lm/ingenta/sourceoecd/, EO70
    from oecd.org).

Each capture is identified by the edition it names (source line, title or sheet
name) or, where it names none, by file metadata and its year columns (see NOTES).

Run:  python3 vintages.py [folder]
  folder (optional) holds the captures as <timestamp>.xls and skips the download.
Needs xlrd (pip install xlrd==2.0.1): the standard-library reader xls.py cannot
read the header formulas and one of the flash files.
Writes the edition files in data/raw/oecd-economic-outlook/, merges their rows into
PROGRESS.md, and writes vintages_check.json here (gitignored): the cross-check of
annex values against the flash file of the same edition.
"""
import datetime, json, os, re, sys, tempfile, urllib.request
import xlrd

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'data', 'raw', 'oecd-economic-outlook')
PUBLISHER = 'Organisation for Economic Co-operation and Development'
SERIES = 'OECD Economic Outlook'
WB = 'https://web.archive.org/web/%sid_/%s'
ANNEX_OLD = 'http://www.oecd.org:80/dataoecd/6/27/2483806.xls'
ANNEX_NEW = 'http://www.oecd.org/eco/outlook/Demand%20and%20Output.xls'
FLASH = 'http://www.oecd.org/dataoecd/18/26/2713584.xls'
FLASH93 = 'http://www.oecd.org:80/eco/outlook/flash_eo93_nolinked.xls'

ECON = ['OECD total', 'United States', 'Euro area', 'Japan', 'Germany', 'United Kingdom', 'China', 'India', 'Brazil']
INDIA_NOTE = 'India: fiscal year (April to March), per the OECD tables.'

# (EO number, edition id, kind, capture timestamp, original URL, confidence, identification note)
# Edition month: the month the source names (flash titles, page titles); otherwise the month of
# the printed volume (June or December) up to EO80 and the release month from EO85.
CAPTURES = [
    (72, '2002-12', 'annex', '20030724145620', ANNEX_OLD, 'medium',
     'Identified as EO72 (December 2002): last printed 2002-12-04 (file metadata), annual columns end in 2004 with 2002 to 2004 headed "Estimates and projections", and it was online in July 2003, before the EO73 file replaced it.'),
    (74, '2003-12', 'annex', '20040205041642', ANNEX_OLD, 'medium',
     'Identified as EO74 (December 2003): saved 2003-12-22 (file metadata), annual columns end in 2005, and the values match the EO74 flash file (created 2003-11-26, capture 20040215112410 of %s).' % FLASH),
    (75, '2004-06', 'annex', '20040804085215', ANNEX_OLD, 'medium',
     'Identified as EO75 (June 2004): created 2004-06-15 and saved 2004-06-25 (file metadata), annual columns end in 2005, and the values match the EO75 flash file (created 2004-05-10, capture 20041025174758 of %s).' % FLASH),
    (76, '2004-12', 'annex', '20050208141310', ANNEX_OLD, 'high', None),
    (77, '2005-06', 'annex', '20051031055108', ANNEX_OLD, 'high', None),
    (78, '2005-11', 'annex', '20051227224550', ANNEX_OLD, 'high', None),
    (79, '2006-06', 'annex', '20060822034745', ANNEX_OLD, 'high', None),
    (80, '2006-12', 'annex', '20070303103444', ANNEX_OLD, 'high', None),
    (81, '2007-05', 'flash', '20071026204033', FLASH, 'high',
     'The flash file names its edition in the sheet name ("flash_file_eo81"); saved 2007-05-23 (file metadata).'),
    (83, '2008-06', 'flash', '20081009030653', FLASH, 'high', None),
    (84, '2008-11', 'flash', '20081205183937', FLASH, 'high', None),
    (85, '2009-06', 'annex', '20091128064455', ANNEX_OLD, 'high', None),
    (86, '2009-11', 'flash', '20110805175552', FLASH, 'high', None),
    (87, '2010-05', 'annex', '20100722051540', ANNEX_OLD, 'high', None),
    (88, '2010-11', 'annex', '20101208072329', ANNEX_OLD, 'high', None),
    (89, '2011-05', 'annex', '20110608162738', ANNEX_OLD, 'high', None),
    (90, '2011-11', 'annex', '20120105062704', ANNEX_OLD, 'high', None),
    (93, '2013-05', 'annex', '20131016150847', ANNEX_NEW, 'high', None),
    (93, '2013-05', 'flash', '20130918123544', FLASH93, 'high', None),  # China, India, Brazil (not in the annex table)
    (96, '2014-11', 'annex', '20150318183337', ANNEX_NEW, 'high', None),
    (97, '2015-06', 'annex', '20150906094541', ANNEX_NEW, 'high', None),
]
# Flash files of editions also captured from the annex: used only to cross-check.
CHECK = [(74, '20040215112410'), (75, '20041025174758'), (77, '20051117151511'), (78, '20060112055701'),
         (79, '20060625233405'), (80, '20070112104150')]

# Printed tables, read at 1 decimal as printed:
#  - the "Summary of projections" table on the old Economic Outlook pages (EO60 as a table image,
#    EO62 as an HTML table); these show the European Union, not the euro area, and no United Kingdom;
#  - the text layer of Economic Outlook PDFs: the University of Goettingen library copy of the
#    publisher's SourceOECD files (EO63 to EO68, https://webdoc.sub.gwdg.de/edoc/lm/ingenta/sourceoecd/)
#    and the OECD's own PDF (EO70). Annex Table 1 "Real GDP" where the PDF has the statistical annex
#    (EO66, EO67, EO70), otherwise the "Summary of projections" table (page viii).
# (edition id, source URL, where, {economy: (current year, next year)}, confidence)
GWDG = 'https://webdoc.sub.gwdg.de/edoc/lm/ingenta/sourceoecd/%d.pdf'
TRANSCRIBED = {
    60: ('1996-12', 'https://web.archive.org/web/19970802180925/http://www.oecd.org:80/eco/out/tab1.gif',
         'Table image "Summary of projections" on the OECD Economic Outlook page (http://www.oecd.org/eco/out/eo.htm, capture 19970212081452, which names "OECD Economic Outlook No. 60, December 1996"). The image capture is dated 1997-08-02; its half-year columns (United States 1997 H1 1.9) fit the December 1996 projection, not June 1997. Values read from the image.',
         {'OECD total': (2.4, 2.4), 'United States': (2.4, 2.2), 'Japan': (3.6, 1.6), 'Germany': (1.1, 2.2)}, 'medium'),
    62: ('1997-12', 'https://web.archive.org/web/19980210062352/http://www.oecd.org:80/eco/out/eo.htm',
         'HTML table "Summary of projections" on the OECD Economic Outlook page, which names "OECD Economic Outlook No. 62, December 1997" (cut-off 10 November 1997).',
         {'OECD total': (3.0, 2.9), 'United States': (3.8, 2.7), 'Japan': (0.5, 1.7), 'Germany': (2.4, 3.0)}, 'high'),
    63: ('1998-06', GWDG % 63,
         'OECD Economic Outlook No. 63 (June 1998), "Summary of projections" (page viii), PDF text layer; library copy of the SourceOECD file.',
         {'OECD total': (2.4, 2.5), 'United States': (2.7, 2.1), 'Japan': (-0.3, 1.3), 'Germany': (2.7, 2.9)}, 'high'),
    64: ('1998-12', GWDG % 64,
         'OECD Economic Outlook No. 64 (December 1998), "Summary of projections" (page viii), PDF text layer; library copy of the SourceOECD file.',
         {'OECD total': (2.2, 1.7), 'United States': (3.5, 1.5), 'Japan': (-2.6, 0.2), 'Germany': (2.7, 2.2)}, 'high'),
    65: ('1999-06', GWDG % 65,
         'OECD Economic Outlook No. 65 (June 1999), "Summary of projections" (page viii), PDF text layer; library copy of the SourceOECD file. The same values are in the table image T65.gif (https://web.archive.org/web/20000903033244/http://www.oecd.org:80/eco/img/T65.gif).',
         {'OECD total': (2.2, 2.1), 'United States': (3.6, 2.0), 'Japan': (-0.9, 0.0), 'Germany': (1.7, 2.3)}, 'high'),
    66: ('1999-12', GWDG % 66,
         'OECD Economic Outlook No. 66 (December 1999), Annex Table 1 "Real GDP" (statistical annex, page 195), PDF text layer; library copy of the SourceOECD file.',
         {'OECD total': (2.8, 2.9), 'United States': (3.8, 3.1), 'Euro area': (2.1, 2.8), 'Japan': (1.4, 1.4), 'Germany': (1.3, 2.3), 'United Kingdom': (1.7, 2.7)}, 'high'),
    67: ('2000-06', GWDG % 67,
         'OECD Economic Outlook No. 67 (June 2000), Annex Table 1 "Real GDP" (statistical annex, page 245), PDF text layer; library copy of the SourceOECD file. The summary table image t67.gif (https://web.archive.org/web/20000817224307/http://www.oecd.org:80/eco/img/t67.gif) shows the same values.',
         {'OECD total': (4.0, 3.1), 'United States': (4.9, 3.0), 'Euro area': (3.5, 3.3), 'Japan': (1.7, 2.2), 'Germany': (2.9, 3.0), 'United Kingdom': (2.9, 2.3)}, 'high'),
    68: ('2000-11', GWDG % 68,
         'OECD Economic Outlook No. 68, Preliminary Edition (November 2000), "Summary of projections", PDF text layer; library copy of the SourceOECD file. The preliminary edition has no statistical annex; the summary table has no Germany or United Kingdom row.',
         {'OECD total': (4.3, 3.3), 'United States': (5.2, 3.5), 'Euro area': (3.5, 3.1), 'Japan': (1.9, 2.3)}, 'high'),
    70: ('2001-12', 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2001/12/oecd-economic-outlook-volume-2001-issue-2_g1ghg828/eco_outlook-v2001-2-en.pdf',
         'OECD Economic Outlook No. 70 (December 2001, Volume 2001 Issue 2), Annex Table 1 "Real GDP", PDF text layer of the OECD file.',
         {'OECD total': (1.0, 1.0), 'United States': (1.1, 0.7), 'Euro area': (1.6, 1.4), 'Japan': (-0.7, -1.0), 'Germany': (0.7, 1.0), 'United Kingdom': (2.3, 1.7)}, 'high'),
}


def get(ts, url, folder):
    local = os.path.join(folder, ts + '.xls') if folder else None
    if local and os.path.exists(local):
        return open(local, 'rb').read()
    req = urllib.request.Request(WB % (ts, url), headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=300).read()


def book(data):
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, 'f.xls')
        open(p, 'wb').write(data)
        return xlrd.open_workbook(p)


def econ_of(label):
    l = re.sub(r'[\d*]+$', '', label.strip()).strip()
    if l in ('Total OECD', 'OECD total', 'OECD total (<= 2003)'):
        return 'OECD total'
    if l.startswith('Euro area'):
        return 'Euro area'
    if l.startswith('China'):
        return 'China'
    return l if l in ECON else None


def is_year(v):
    return isinstance(v, float) and 1980 <= v <= 2030 and v == int(v)


def annex(bk):
    sh = bk.sheet_by_name('RealGDP')
    r2, r3 = sh.row_values(2), sh.row_values(3)
    years = {}
    stop = next((c for c, v in enumerate(r2) if isinstance(v, str) and 'quarter' in v.lower()), sh.ncols)
    for c in range(stop):
        y = r2[c] if is_year(r2[c]) else (r3[c] if c < len(r3) and is_year(r3[c]) else None)
        if y:
            years[int(y)] = c
    texts = [str(sh.cell_value(r, 0)).strip() for r in range(sh.nrows)]
    source = next((t for t in texts if t.startswith('Source')), '')
    vals = {}
    for r in range(sh.nrows):
        e = econ_of(str(sh.cell_value(r, 0)))
        if not e:
            continue
        for y, c in years.items():
            v = sh.cell_value(r, c)
            if isinstance(v, float):
                vals[(e, y)] = v
    wd = any('working-day' in t or 'working day' in t for t in texts)
    return vals, source, sh.name, wd


def flash(bk):
    sh = bk.sheet_by_index(0)
    years = {}
    for r in range(6):
        row = sh.row_values(r)
        if sum(is_year(v) for v in row) >= 4:
            years = {int(v): c for c, v in enumerate(row) if is_year(v)}
            break
    title = ' '.join(str(v).strip() for r in range(2) for v in sh.row_values(r) if isinstance(v, str) and v.strip())
    vals = {}; cur = None
    for r in range(sh.nrows):
        row = sh.row_values(r)
        strs = [str(v).strip() for v in row if isinstance(v, str) and v.strip()]
        nums = [v for v in row[1:] if isinstance(v, float)]
        if strs and not nums:
            cur = next((econ_of(x) for x in strs if econ_of(x)), None)
            continue
        lab = ' '.join(s.lower() for s in strs)  # older files: variable code in column 0, label in column 1
        if cur and ('gross domestic product' in lab and 'volume' in lab or strs and strs[0] == 'GDPV'):
            for y, c in years.items():
                if isinstance(row[c], float):
                    vals.setdefault((cur, y), row[c])
    return vals, title, sh.name


def entry(name, code, ty, h, val, label, url, conf, note=None):
    e = {'economy': name, 'economy_code': code, 'metric': 'real GDP growth', 'target_year': ty, 'horizon': h,
         'value': round(val, 3), 'unit': '%', 'label': label, 'source_url': url, 'confidence': conf}
    if note:
        e['note'] = note
    return e


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else None
    eds = {}
    for n, eid, kind, ts, url, conf, ident in CAPTURES:
        bk = book(get(ts, url, folder))
        wurl = WB % (ts, url)
        d = eds.setdefault(n, {'eid': eid, 'entries': {}, 'sources': [], 'notes': []})
        d['sources'].append(wurl)
        yr = int(eid[:4])
        if kind == 'annex':
            vals, source, sheet, wd = annex(bk)
            what = 'annex workbook "Demand and output", sheet %s (Annex Table 1. Real GDP), Internet Archive capture %s of %s' % (sheet, ts, url.replace(':80', ''))
            d['notes'].append('Source: OECD Economic Outlook %s. The sheet says "%s".' % (what, source) + (' ' + ident if ident else ''))
            label = 'Annex Table 1. Real GDP / EO%d' % n
        else:
            vals, title, sheet = flash(bk)
            what = 'flash file (summary of projections), sheet %s, Internet Archive capture %s of %s' % (sheet, ts, url.replace(':80', ''))
            d['notes'].append('Source: OECD Economic Outlook %s.' % what + (' Title: "%s".' % title if title else '') + (' ' + ident if ident else ''))
            label = 'Flash file, Gross domestic product, volume / EO%d' % n
            wd = False
        for name in ECON:
            if n == 93 and kind == 'flash' and name not in ('China', 'India', 'Brazil'):
                continue
            for ty, h in ((yr, 'current_year'), (yr + 1, 'next_year')):
                v = vals.get((name, ty))
                if v is None or (name, ty) in d['entries']:
                    continue
                note = []
                if wd: note.append('Working-day adjusted annex figure; may differ from the basis of the official projection.')
                if name == 'India': note.append(INDIA_NOTE)
                if name == 'Euro area': note.append('Euro area as defined in this vintage (euro area countries that are OECD members).')
                if kind == 'flash' and n in (86, 93): note.append('The flash file holds values rounded to 1 decimal.')
                d['entries'][(name, ty)] = entry(name, name, ty, h, v, '%s / %s' % (name, label), wurl, conf, ' '.join(note) or None)
    # cross-check annex vs flash of the same edition
    check = []
    for n, ts in CHECK:
        fv, title, sheet = flash(book(get(ts, FLASH, folder)))
        yr = int(eds[n]['eid'][:4])
        diffs = []
        for (name, ty), e in eds[n]['entries'].items():
            if (name, ty) in fv:
                diffs.append(abs(fv[(name, ty)] - e['value']))
        check.append({'eo': n, 'flash_capture': ts, 'flash_sheet': sheet, 'compared': len(diffs), 'max_abs_diff': round(max(diffs), 4) if diffs else None})
    json.dump(check, open(os.path.join(HERE, 'vintages_check.json'), 'w'), indent=1)
    for c in check: print('check', c)
    for n, (eid, url, where, vals, conf) in TRANSCRIBED.items():
        yr = int(eid[:4])
        d = eds.setdefault(n, {'eid': eid, 'entries': {}, 'sources': [url], 'notes': []})
        d['notes'].append('Source: ' + where + ' Values at 1 decimal as printed.')
        for name in ECON:
            if name not in vals:
                continue
            for (ty, h), v in zip(((yr, 'current_year'), (yr + 1, 'next_year')), vals[name]):
                tab = 'Annex Table 1. Real GDP' if 'Annex Table 1' in where else 'Summary of projections, Real GDP'
                d['entries'][(name, ty)] = entry(name, name, ty, h, v, '%s / %s / EO%d' % (name, tab, n), url, conf,
                                                 'Read from the printed table (1 decimal).')
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    prog_new = {}
    for n in sorted(eds):
        d = eds[n]; eid = d['eid']; yr = int(eid[:4])
        entries = [d['entries'][(name, ty)] for name in ECON for ty in (yr, yr + 1) if (name, ty) in d['entries']]
        missing = ['%s %d' % (name, ty) for name in ECON for ty in (yr, yr + 1) if (name, ty) not in d['entries']]
        status = 'complete' if not missing else 'partial'
        notes = ' '.join(d['notes']) + ' Values are annual percent change of real GDP, rounded here to 3 decimals (transcribed values keep the printed 1 decimal). Aggregates (OECD total, euro area) use the composition of the time.'
        if missing:
            notes += ' Not in source for this edition: ' + ', '.join(missing) + '.'
        doc = {'edition': eid, 'published': eid, 'publisher': PUBLISHER, 'series': SERIES, 'source_vintage': 'EO%d' % n,
               'status': status, 'sources': d['sources'], 'entries': entries, 'notes': notes}
        path = os.path.join(OUT, eid + '.json')
        if os.path.exists(path) and json.load(open(path)).get('source_vintage') != 'EO%d' % n:
            raise SystemExit('edition id clash: ' + eid)
        json.dump(doc, open(path, 'w'), indent=1, ensure_ascii=False)
        prog_new[eid] = '| %s | %s | %d entries | %s |' % (eid, status, len(entries), now)
        print('EO%d' % n, eid, status, len(entries), 'missing:', ', '.join(missing))
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
