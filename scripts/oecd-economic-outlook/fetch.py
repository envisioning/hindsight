"""Download the OECD Economic Outlook inputs for build.py.

1. EO102 to EO115: DBnomics git mirror of the retired OECD.Stat dataset "EO"
   (https://git.nomics.world/dbnomics-json-data/oecd-json-data, folder EO/).
   Each Economic Outlook replaced the previous one in that dataset, so each
   git commit holds one vintage. For each EO number we read the first and the
   last commit whose dataset.json names that EO.
2. EO114 to EO119: OECD SDMX API (OECD Data Explorer), one dataflow per EO.

Writes dbnomics_eo.json and sdmx_eo.json next to this script (gitignored).
Python 3 standard library only.
"""
import json, os, urllib.request, csv, io

HERE = os.path.dirname(os.path.abspath(__file__))
GL = 'https://git.nomics.world/api/v4/projects/140/repository'
CODES_OLD = ['OTO', 'USA', 'EA17', 'EA16', 'JPN', 'DEU', 'GBR', 'CHN', 'IND', 'BRA']
CODES_NEW = ['OECD', 'USA', 'EA17', 'JPN', 'DEU', 'GBR', 'CHN', 'IND', 'BRA']
# EO number: (dataset name in DBnomics, first commit, first commit date, last commit, last commit date)
COMMITS = {
    102: ('Economic Outlook No 102 - November 2017', '3dcfca01e5dd7a2135128a73084660987c346573', '2018-04-23', '3dcfca01e5dd7a2135128a73084660987c346573', '2018-04-23'),
    103: ('Economic Outlook No 103 - May 2018', '394947857d39da206b450eda716a1741997535a3', '2018-06-04', 'ffc5a1196b7720f0ea16b60e6be397c118722b89', '2018-09-12'),
    104: ('Economic Outlook No 104 - November 2018', '4e2614df8a1d1735df072a463da0b3d961401a48', '2018-11-23', '4f934cf13ab471e66ea8af175e7ebb559f16d8d0', '2019-04-09'),
    105: ('Economic Outlook No 105 - May 2019', '4782e944f1af73fda24eb42880b073e89ae82741', '2019-05-27', 'a0f724c9a43e983d0a80ad0a71174b967a92d6c3', '2019-11-10'),
    106: ('Economic Outlook No 106 - November 2019', 'fb707cc71e4f2089e4b80eafed2cc280adeba817', '2019-11-24', '2b7f027e937f9e92ab1a70d405bc0567b158a990', '2020-06-04'),
    107: ('Economic Outlook No 107 - June 2020 Double Hit Scenario', 'dfdaa5ff7ef03e662234dcc84ed891537370e1be', '2020-06-11', '0aed8eee754e63196ab9e4b3464bc8dc355f4d75', '2020-10-11'),
    108: ('Economic Outlook No 108 - December 2020', '0ae9308c3e0fdc0d0f782ba6ec21a0891f5794c7', '2020-12-08', 'a7a94d3fbb9c9aeac6729f09247d09a1f96baf64', '2021-03-21'),
    109: ('Economic Outlook No 109 - May 2021', '0e58e5a49d0b6d500e87a52d446c117650b457f1', '2021-06-05', '2b64d5ecf02572b86cdd5c30154054e86837e40e', '2021-11-07'),
    110: ('Economic Outlook No 110 - December 2021', 'c58b6e3bc6b2df819f41736ddc9452e61ca0ff2f', '2021-12-02', 'e300d0038f81e62fc3cced5d23406f3a5179fba7', '2022-06-06'),
    111: ('Economic Outlook No 111 - June 2022', '0ab3e12dbf874a097ba2a14825738d910f3cf241', '2022-06-09', '0baa4bce111850150369085bee0e98356f1bf35d', '2022-11-11'),
    112: ('Economic Outlook No 112 - November 2022', '2991af9630e260144f7630cf24b8671763aa3cbf', '2022-11-23', '1303887feb3d6373330ce13f32643ed7f61fb534', '2023-04-10'),
    113: ('Economic Outlook No 113 - June 2023', '7dd852a5679e8073f4f7404d5aaa7e7f98bec9df', '2023-06-08', 'fb81fe8f1399a7ac446418ae25c305c929bdcd67', '2023-11-16'),
    114: ('Economic Outlook No 114 - November 2023', 'd06de83b1bcfe553d6e4c43b14da78c7ce873986', '2023-11-30', 'b46e8de3a3b965789bd8bd6dabc51bd8d09fcec2', '2023-12-08'),
    115: ('Economic Outlook No 115 - May 2024', 'dc41e9bd5cb3022f652e5aafccf6cbbfac900e4f', '2024-05-03', 'dc41e9bd5cb3022f652e5aafccf6cbbfac900e4f', '2024-05-03'),
}
SDMX = {n: 'https://sdmx.oecd.org/public/rest/data/OECD.ECO.MAD,DSD_EO_%d@DF_EO_%d,/%s.GDPV_ANNPCT.A?startPeriod=1990&format=csvfilewithlabels' % (n, n, '+'.join(CODES_NEW)) for n in (114, 115, 116, 117, 118)}
SDMX[119] = 'https://sdmx.oecd.org/public/rest/data/OECD.ECO.MAD,DSD_EO@DF_EO,/%s.GDPV_ANNPCT.A?startPeriod=1990&format=csvfilewithlabels' % '+'.join(CODES_NEW)

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=300)

def tree_has_jsonl(sha):
    t = json.load(get(GL + '/tree?path=EO&ref=%s&per_page=5' % sha))
    return any(x['name'] == 'series.jsonl' for x in t)

def read_commit(sha):
    out = {}
    wanted = {c + '.GDPV_ANNPCT.A' for c in CODES_OLD}
    if tree_has_jsonl(sha):
        for line in get(GL + '/files/EO%%2Fseries.jsonl/raw?ref=%s' % sha):
            if b'GDPV_ANNPCT' not in line:
                continue
            s = json.loads(line)
            if s['code'] in wanted:
                out[s['code'].split('.')[0]] = {p: v for p, v in s['observations'][1:]}
    else:
        for c in CODES_OLD:
            try:
                txt = get(GL + '/files/EO%%2F%s.GDPV_ANNPCT.A.tsv/raw?ref=%s' % (c, sha)).read().decode()
            except Exception:
                continue
            rows = [r.split('\t') for r in txt.strip().split('\n')[1:]]
            out[c] = {r[0]: (float(r[1]) if r[1] not in ('', 'NaN', 'NA') else None) for r in rows}
    return out

def main():
    db = {}
    for n, (name, f, fd, l, ld) in sorted(COMMITS.items()):
        first = read_commit(f)
        last = first if l == f else read_commit(l)
        db[n] = {'name': name, 'first': {'sha': f, 'date': fd, 'series': first}, 'last': {'sha': l, 'date': ld, 'series': last}}
        print(n, name, len(first), len(last), flush=True)
    json.dump(db, open(os.path.join(HERE, 'dbnomics_eo.json'), 'w'))
    sd = {}
    for n, url in sorted(SDMX.items()):
        r = list(csv.DictReader(io.StringIO(get(url).read().decode('utf-8-sig'))))
        sd[n] = {'url': url, 'name': r[0]['STRUCTURE_NAME'], 'rows': [{k: x[k] for k in ('REF_AREA', 'Reference area', 'TIME_PERIOD', 'OBS_VALUE', 'OBS_STATUS')} for x in r]}
        print(n, sd[n]['name'], len(r), flush=True)
    json.dump(sd, open(os.path.join(HERE, 'sdmx_eo.json'), 'w'))

if __name__ == '__main__':
    main()
