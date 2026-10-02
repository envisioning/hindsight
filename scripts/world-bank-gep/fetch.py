"""Download the World Bank GEP real GDP growth tables and WDI outturns.

Inputs (World Bank):
- GEP "gdp-growth" table PDFs, one page per edition, from the GEP page
  https://www.worldbank.org/en/publication/global-economic-prospects
  (5 ZIP archives for 2000 to 2024, plus 4 single PDFs for 2025 and 2026).
- World Development Indicators API, indicator NY.GDP.MKTP.KD.ZG (realized values).

Needs `pdftotext` (poppler) on PATH. PDFs and text go to a temporary folder;
writes parsed.json and wdi.json next to this script (gitignored).
"""
import glob, json, os, subprocess, tempfile, urllib.request, zipfile
import parse

HERE = os.path.dirname(os.path.abspath(__file__))
ZIPS = [
    'https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2000-2004.zip',
    'https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2005-2009.zip',
    'https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2010-2014.zip',
    'https://thedocs.worldbank.org/en/doc/2d83dc6f2b64291e7c6943d1b6a2eea9-0350012021/related/GEP-GDP-growth-2015-2019.zip',
    'https://thedocs.worldbank.org/en/doc/2b672b3b0415d6b66c45b66579db4ef5-0050012026/related/GEP-GDP-growth-2020-2024.zip',
]
PDFS = [
    'https://thedocs.worldbank.org/en/doc/c50bc3c87bc2666b9e5fa6699b0b2849-0050012025/related/GEP-January-2025-gdp-growth.pdf',
    'https://thedocs.worldbank.org/en/doc/8bf0b62ec6bcb886d97295ad930059e9-0050012025/related/GEP-June-2025-gdp-growth.pdf',
    'https://thedocs.worldbank.org/en/doc/7ce50b5aa95bef66048680bba9926ec8-0050012026/related/GEP-Jan-2026-gdp-growth.pdf',
    'https://thedocs.worldbank.org/en/doc/2b672b3b0415d6b66c45b66579db4ef5-0050012026/related/GEP-Jun-2026-gdp-growth.pdf',
]
WDI = 'https://api.worldbank.org/v2/country/WLD;HIC;LMY;USA;EMU;JPN;CHN;IND;BRA/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=2000&date=1998:2025'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=300).read()


def main():
    parsed = {}
    with tempfile.TemporaryDirectory() as td:
        src = {}
        for u in ZIPS:
            p = os.path.join(td, os.path.basename(u))
            open(p, 'wb').write(get(u))
            with zipfile.ZipFile(p) as z:
                for n in z.namelist():
                    z.extract(n, td)
                    src[os.path.basename(n)] = u + ' (' + os.path.basename(n) + ')'
        for u in PDFS:
            open(os.path.join(td, os.path.basename(u)), 'wb').write(get(u))
            src[os.path.basename(u)] = u
        for pdf in sorted(glob.glob(os.path.join(td, '**', '*.pdf'), recursive=True)):
            txt = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
            years, vals, labels, flags, shifted = parse.parse(txt)
            name = os.path.basename(pdf)
            parsed[name[:-4]] = {'source': src[name], 'years': years, 'values': vals, 'labels': labels,
                                 'flags': flags, 'shifted_font': shifted, 'fiscal_note': 'fiscal year' in txt.lower(),
                                 'gdp_weights': parse.gdp_weights(txt)}
            print(name, years and (years[0], years[-1]), sorted(vals), flush=True)
    json.dump(parsed, open(os.path.join(HERE, 'parsed.json'), 'w'), indent=1)
    wdi = json.loads(get(WDI))
    json.dump({'url': WDI, 'meta': wdi[0], 'rows': wdi[1]}, open(os.path.join(HERE, 'wdi.json'), 'w'))
    print('wdi', wdi[0])


if __name__ == '__main__':
    main()
