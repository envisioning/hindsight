import json, os, datetime
from parse import strings, rows
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','raw','imf-weo')
os.makedirs(OUT, exist_ok=True)
HIST_URL='https://www.imf.org/-/media/files/publications/weo/weo-database/2025/april/weohistorical.xlsx'
SDMX_URL='https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/+/*.NGDP_RPCH.A'
DM_URL='https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH'
MONTHS={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
vlabels=json.load(open('bd_data.json'))['v']
pubmonth={}
for m,y in vlabels:
    season='S' if MONTHS[m]<=6 else 'F'
    pubmonth[(season,y)]='%d-%02d'%(y,MONTHS[m])
# (display name, hist-file name, hist code, sdmx code, datamapper code)
ECON=[('World','World','1','G001','WEOWORLD'),
('Advanced economies','Advanced Economies','110','G110','ADVEC'),
('Emerging market and developing economies','Emerging Market and Developing Economies','200','G200','OEMDC'),
('United States','United States','111','USA','USA'),
('Euro area','Euro area','163','G163','EURO'),
('China','China','924','CHN','CHN'),
('India','India','534','IND','IND'),
('Brazil','Brazil','223','BRA','BRA'),
('Japan','Japan','158','JPN','JPN'),
('Germany','Germany','134','DEU','DEU'),
('United Kingdom','United Kingdom','112','GBR','GBR')]
def num(v):
    if v in (None,'','.','n/a','--'): return None
    try: return float(v)
    except: return None
def rnd(x): return round(x,3)

# historical file
ss=strings(); hdr=None; hist={}  # (name, vintage col) -> {year: value}
for i,r in enumerate(rows('x/xl/worksheets/sheet2.xml',ss)):
    if i==0: hdr=r; continue
    for e in ECON:
        if r.get(0)==e[1] and r.get(1)==e[2]:
            y=int(r[3])
            for c,h in hdr.items():
                if c>=4:
                    hist.setdefault((e[0],h[:5]),{})[y]=num(r.get(c))
vintages=[hdr[c][:5] for c in sorted(hdr) if c>=4]

# Oct 2025 SDMX vintage
d=json.load(open('oct25_all.json'))['data']; st=d['structures'][0]
cids=[v['id'] for v in st['dimensions']['series'][0]['values']]
yrs=[v['value'] for v in st['dimensions']['observation'][0]['values']]
sd={}
for k,s in d['dataSets'][0]['series'].items():
    cid=cids[int(k.split(':')[0])]
    sd[cid]={int(yrs[int(o)]):num(v[0]) for o,v in s['observations'].items()}
# datamapper (April 2026)
dm=json.load(open('dm_ngdp.json'))['values']['NGDP_RPCH']

editions=[]
for v in vintages:
    editions.append(('hist',v,('%s-%s'%(v[1:], '04' if v[0]=='S' else '10')),int(v[1:]),v[0]))
editions.append(('sdmx','F2025','2025-10',2025,'F'))
editions.append(('dm','S2026','2026-04',2026,'S'))

index_rows=[]; progress=[]
now=lambda: datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
for kind,v,eid,yr,season in editions:
    entries=[]; missing=[]
    if kind=='hist':
        url=HIST_URL; srcnote='IMF Historical WEO Forecasts Database (weohistorical.xlsx, sheet ngdp_rpch, column %sngdp_rpch)'%v
    elif kind=='sdmx':
        url='https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/+/{code}.NGDP_RPCH.A'
        srcnote='IMF SDMX 3.0 API, dataflow IMF.RES:WEO_2025_OCT_VINTAGE(1.0.0), indicator NGDP_RPCH'
    else:
        url=DM_URL; srcnote='IMF DataMapper API v1, indicator NGDP_RPCH, source "World Economic Outlook (April 2026)", last-modified 2026-04-08 16:07:34'
    for name,hn,hc,sc,dc in ECON:
        for ty,h in ((yr,'current_year'),(yr+1,'next_year')):
            if kind=='hist': val=hist.get((name,v),{}).get(ty); code=hc; label='%s / %sngdp_rpch'%(hn,v)
            elif kind=='sdmx': val=sd.get(sc,{}).get(ty); code=sc; label='%s.NGDP_RPCH.A'%sc
            else:
                raw=dm.get(dc,{}).get(str(ty)); val=float(raw) if raw is not None else None; code=dc; label='%s / NGDP_RPCH'%dc
            if val is None: missing.append('%s %d'%(name,ty)); continue
            e={'economy':name,'economy_code':code,'metric':'real GDP growth','target_year':ty,'horizon':h,
               'value':rnd(val),'unit':'%','label':label,
               'source_url':url.replace('{code}',sc) if kind=='sdmx' else url,'confidence':'high'}
            entries.append(e)
    pub=pubmonth.get((season,yr))
    notes=[srcnote+'.',
           'Values are annual percent change, rounded here to 3 decimals from the source value.',
           'Group aggregates use the country composition at the time of the vintage.']
    if pub: notes.append('Published month %s is the WEO database release month for this vintage (the historical file labels vintages only Spring/Fall); edition id follows the April/October convention.'%pub)
    if missing: notes.append('Not in source for this vintage: '+', '.join(missing)+'.')
    if kind=='hist' and yr<2000: notes.append('The euro area aggregate begins in the Spring 2000 vintage (source Info sheet).')
    if kind=='dm': notes.append('The April 2026 values come from the live DataMapper series, not an archived vintage file. The DataMapper API returns values at 1 decimal only.')
    status='complete' if len(missing)==0 or all(m.startswith('Euro area') for m in missing) and yr<2000 else 'partial'
    ed={'edition':eid,'published':pub or str(yr),'publisher':'International Monetary Fund','series':'World Economic Outlook',
        'source_vintage':v,'status':status,'sources':[url.replace('{code}','*') if kind=='sdmx' else url],'entries':entries,'notes':' '.join(notes)}
    json.dump(ed,open(os.path.join(OUT,eid+'.json'),'w'),indent=1,ensure_ascii=False)
    index_rows.append((eid,pub or str(yr),status,len(entries),v,kind,missing))
    progress.append('| %s | %s | %d entries | %s |'%(eid,status,len(entries),now()))
    open(os.path.join(OUT,'PROGRESS.md'),'w').write('# imf-weo progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n'+'\n'.join(progress)+'\n')

# realized
real={'source':'IMF World Economic Outlook (April 2026), via IMF DataMapper API','vintage':'2026-04','vintage_last_modified':'2026-04-08 16:07:34',
      'source_url':DM_URL,'metric':'real GDP growth','unit':'%',
      'notes':'Latest values from the April 2026 WEO. Years up to 2025 only; 2026 onward are projections and are excluded. Values for 2025 (and for some economies 2024) can still be IMF staff estimates, and all values are subject to later revision. Group aggregates use the April 2026 country composition (current membership), not the composition at the time of each forecast. The DataMapper API returns values at 1 decimal.',
      'entries':[]}
for name,hn,hc,sc,dc in ECON:
    for y in range(1990,2026):
        raw=dm.get(dc,{}).get(str(y))
        if raw is None: continue
        real['entries'].append({'economy':name,'economy_code':dc,'target_year':y,'value':rnd(float(raw)),'unit':'%','confidence':'high' if y<=2024 else 'medium',
            **({'note':'Latest-year value; may be an IMF staff estimate.'} if y==2025 else {})})
json.dump(real,open(os.path.join(OUT,'realized.json'),'w'),indent=1,ensure_ascii=False)
json.dump(index_rows,open('index_rows.json','w'))
print(len(index_rows),'editions;',sum(r[3] for r in index_rows),'entries;',len(real['entries']),'realized')
for r in index_rows:
    if r[2]!='complete' or r[6]: print(r)
