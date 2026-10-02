import json,os,re,csv,datetime
import xl,p10
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','raw','eia-aeo')
os.makedirs(OUT,exist_ok=True)
R22_PAGE='https://www.eia.gov/outlooks/aeo/retrospective/archive/2022/'
R22_XLSX='https://www.eia.gov/outlooks/aeo/retrospective/archive/2022/excel/AEO%202022%20Retrospective%20(all%20tables).xlsx'
R25_PAGE='https://www.eia.gov/outlooks/aeo/retrospective/'
R25_CSV='https://www.eia.gov/outlooks/aeo/retrospective/csv/dashappdata_allcases.csv'
R10_PAGE='https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/'
def r10url(t): return f'https://www.eia.gov/outlooks/aeo/retrospective/archive/2010/pdf/tbl_{t}.pdf'

entries={}  # edition -> list
realized={}  # (vintage) -> series -> {year: value}
def add(ed,e): entries.setdefault(ed,[]).append(e)
def rnd(v): return float(f'{v:.6g}')

# ---- 2022 retrospective (AEO1994-AEO2022, target years to 2021)
T22={ # sheet: (series, label, unit, has_dollar_year)
 'table_4a':('crude_oil_price_real','Imported refiner acquisition cost of crude oil (constant $)','constant USD per barrel, in the dollar year of each AEO (see dollar_year)',True),
 'table_4b':('crude_oil_price_nominal','Imported refiner acquisition cost of crude oil (nominal $)','nominal USD per barrel',False),
 'table_5':('petroleum_liquids_consumption','Total petroleum and other liquids consumption','million barrels per year',False),
 'table_8a':('natural_gas_price_electric_power_real','Natural gas price, electric power sector (constant $)','constant USD per million Btu, in the dollar year of each AEO (see dollar_year)',True),
 'table_8b':('natural_gas_price_electric_power_nominal','Natural gas price, electric power sector (nominal $)','nominal USD per million Btu',False),
 'table_16':('electricity_sales','Total electricity sales excluding direct use','billion kWh',False),
 'table_17':('solar_generation','Solar net generation (all sectors)','billion kWh',False),
 'table_18':('wind_generation','Wind net generation (all sectors)','billion kWh',False),
 'table_23':('total_energy_consumption','Total energy consumption (all sectors)','quadrillion Btu',False),
 'table_27':('transportation_energy_consumption','Total delivered transportation energy consumption','quadrillion Btu',False),
 'table_28':('co2_emissions_energy','Total energy-related carbon dioxide emissions','million metric tons CO2',False),
}
def toyear(x):
    try: v=float(x)
    except: return None
    if 1900<=v<=2100: return int(v)
    if 30000<v<60000: return (datetime.date(1899,12,30)+datetime.timedelta(days=int(v))).year
    return None
# #66: the R2022 AEO2009 rows are the April 2009 ARRA-updated Reference case (SR/OIAF/2009-03) for every series
# except solar and wind, which match the March 2009 AEO2009 report. The R2025 data file holds the March case for
# all years. Every AEO2009 series is taken from the March case, the published AEO2009 report (DOE/EIA-0383(2009)).
R22_AEO2009_MARCH={'solar_generation','wind_generation'}
d22=xl.read('r22all.xlsx')
r22_avgabs={}
r22_years_2009={}  # target years of the R2022 AEO2009 rows that the R2025 March case replaces
for sh,(series,label,unit,dy) in T22.items():
    g=xl.grid(d22[sh])
    hi=next(i for i,r in enumerate(g) if sum(1 for x in r if toyear(x))>=5)
    cols={j:toyear(x) for j,x in enumerate(g[hi]) if toyear(x)}
    tno=sh.split('_')[1]
    for r in g[hi+1:]:
        k=str(r[0]).strip()
        if k.startswith('Actual'):
            if not dy:
                realized.setdefault('retrospective_2022',{})[series]={str(y):rnd(float(r[j])) for j,y in cols.items() if r[j] not in ('','NA')}
            continue
        if k.startswith('Average abs'):
            r22_avgabs[series]={str(y):rnd(float(r[j])) for j,y in cols.items() if r[j] not in ('','NA')}
            break
        if not re.fullmatch(r'AEO\d{4}',k): continue
        ed=k[3:]
        if ed=='2009' and series not in R22_AEO2009_MARCH:  # #66: April 2009 ARRA-updated case; taken from R2025 below
            r22_years_2009[series]={y for j,y in cols.items() if r[j] not in ('','NA')}
            continue
        for j,y in cols.items():
            v=r[j]
            if v in ('','NA'): continue
            e={'series':series,'label':label,'target_year':y,'value':rnd(float(v)),'unit':unit}
            if dy: e['dollar_year']=int(float(r[1]))
            e.update({'case':'Reference','retrospective':'AEO Retrospective 2022','table':f'Table {tno}','source_url':R22_XLSX,'confidence':'high'})
            add(ed,e)

# ---- 2010 retrospective (AEO1982-AEO2010, target years 1985-2009)
T10={4:('crude_oil_price_nominal','World oil prices (imported refiner acquisition cost of crude oil, IRAC)','nominal USD per barrel',True),
     5:('petroleum_liquids_consumption','Total petroleum consumption','million barrels per day',True),
     8:('natural_gas_wellhead_price_nominal','Natural gas wellhead prices','nominal USD per thousand cubic feet',False),
     16:('electricity_sales','Total electricity sales','billion kWh',True),
     17:('total_energy_consumption','Total energy consumption','quadrillion Btu',True),
     21:('transportation_energy_consumption','Total transportation energy consumption','quadrillion Btu',True),
     22:('co2_emissions_energy','Total carbon dioxide emissions','million metric tons CO2',True)}
for t,(series,label,unit,only_pre94) in T10.items():
    h,rows,act=p10.parse(f'r10/tbl_{t}.pdf')
    realized.setdefault('retrospective_2010',{})[series]={str(y):v for y,v in act.items()}
    for k,vals in rows.items():
        ed=k[3:]
        if only_pre94 and int(ed)>=1994: continue  # covered by the 2022 retrospective
        for y,v in sorted(vals.items()):
            add(ed,{'series':series,'label':label,'target_year':y,'value':v,'unit':unit,'case':'Reference (Mid-Price case in early editions)','retrospective':'AEO Retrospective Review 2010','table':f'Table {t}','source_url':r10url(t),'confidence':'medium','note':'Read from PDF table text by column position; values rounded as printed.'})

# ---- 2025 retrospective data file (AEO2005-AEO2025, full horizon)
C={'GEN_NA_ALLS_NA_SLR_NA_NA_BLNKWH':('solar_generation','Solar net generation (all sectors)','billion kWh'),
   'GEN_NA_ALLS_NA_WND_NA_NA_BLNKWH':('wind_generation','Wind net generation (all sectors)','billion kWh'),
   'CNSM_NA_ELEP_NA_ELS_NA_USA_BLNKWH':('electricity_sales','Total electricity sales excluding direct use','billion kWh'),
   'CNSM_ENU_TEN_NA_TOT_NA_NA_QBTU':('total_energy_consumption','Total energy consumption (all sectors)','quadrillion Btu'),
   'CNSM_ENU_TRN_NA_DELE_NA_NA_QBTU':('transportation_energy_consumption','Total delivered transportation energy consumption','quadrillion Btu'),
   'EMI_CO2_NA_NA_NA_NA_NA_MILLMTCO2EQ':('co2_emissions_energy','Energy-related carbon dioxide emissions','million metric tons CO2'),
   'CNSM_NA_LFL_NA_TOT_NA_USA_MILLBRLPDY':('petroleum_liquids_consumption','Total petroleum and other liquids consumption','million barrels per day'),
   'PRCE_NA_NA_NA_CR_IMCO_USA_NDLRPBRL':('crude_oil_price_nominal','Imported crude oil price (IRAC), nominal','nominal USD per barrel'),
   'PRCE_NA_NA_NA_CR_IMCO_USA_RDLRPBRL':('crude_oil_price_real','Imported crude oil price (IRAC), real','2012 USD per barrel'),
   'PRCE_DELV_ELEP_NA_NG_NA_USA_NDLRPMCF':('natural_gas_price_electric_power_nominal','Natural gas price, electric power sector, nominal','nominal USD per thousand cubic feet'),
   'PRCE_DELV_ELEP_NA_NG_NA_USA_RDLRPMCF':('natural_gas_price_electric_power_real','Natural gas price, electric power sector, real','2012 USD per thousand cubic feet'),
}
rows=list(csv.DictReader(open('allcases.csv',encoding='utf-8-sig')))
for r in rows:
    y=int(r['year'])
    if r['case_name']=='ACTUAL':
        for col,(series,label,unit) in C.items():
            if r[col]!='': realized.setdefault('retrospective_2025',{}).setdefault(series,{})[str(y)]=rnd(float(r[col]))
        continue
    if r['case_name']!='REFERENCE': continue
    ed=r['edition']
    march09=ed=='2009' and y<=2021  # #66: AEO2009 March case for the series whose R2022 row is the ARRA case
    if int(ed)<=2022 and y<=2021 and not march09: continue  # covered by the 2022 retrospective tables
    for col,(series,label,unit) in C.items():
        if r[col]=='': continue
        if march09 and (series in R22_AEO2009_MARCH or y not in r22_years_2009.get(series,set())): continue
        e={'series':series,'label':label,'target_year':y,'value':rnd(float(r[col])),'unit':unit,'case':'Reference','retrospective':'AEO Retrospective 2025 (data file, pulled August 2025)','column':col,'source_url':R25_CSV,'confidence':'high'}
        if march09: e['note']='AEO2009 March 2009 Reference case (the published report), from the R2025 data file. The R2022 tables give the April 2009 ARRA-updated Reference case for this series; not used (#66).'
        add(ed,e)

# ---- write editions
ALL=['1979']+[str(y) for y in range(1982,1988)]+[str(y) for y in range(1989,2024)]+['2025','2026']
now=datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
prog=[]; idx=[]
for ed in ALL:
    es=sorted(entries.get(ed,[]),key=lambda e:(e['series'],e['target_year'],e['retrospective']))
    srcs=sorted({e['source_url'] for e in es})
    pages=[]
    if any('archive/2022' in s for s in srcs): pages.append(R22_PAGE)
    if any('archive/2010' in s for s in srcs): pages.append(R10_PAGE)
    if any('dashappdata' in s for s in srcs): pages.append(R25_PAGE)
    if not es:
        note={'1979':'Listed in the EIA AEO archive (1979 Annual Report to Congress). Not covered by any AEO Retrospective found. Not extracted.',
              '2026':'AEO2026 released 2026-04-08. Not yet covered by an AEO Retrospective (latest is Retrospective 2025, data pulled August 2025). Not extracted.'}.get(ed,'No projections in the retrospectives read.')
        status='missing'
    else:
        series=sorted({e['series'] for e in es})
        status='partial'
        note=f'Reference case values as tabulated in EIA AEO Retrospectives, not read from the AEO report itself. Series: {", ".join(series)}.'
    doc={'edition':ed,'published':ed,'status':status if es else 'partial','sources':pages+srcs,'entries':es,
         'notes':note+' published field is the AEO edition year; exact release date not verified.'}
    if es or ed in ('1979','2026'):
        if es:
            head={k:v for k,v in doc.items() if k!='entries'}
            txt=json.dumps(head,indent=1)[:-2]+',\n "entries": [\n'+',\n'.join('  '+json.dumps(e) for e in doc['entries'])+'\n ]\n}\n'
            open(f'{OUT}/{ed}.json','w').write(txt)
    prog.append(f'| {ed} | {"missing" if not es else "partial"} | {len(es)} | {now} |')
    idx.append((ed,'missing' if not es else 'partial',len(es),es))
json.dump({'note':'Actual values as printed in each EIA AEO Retrospective. Each vintage uses the historical data EIA had at the time; later vintages include revisions. Constant-dollar series from the 2022 tables are omitted (their dollar year differs by AEO edition).',
 'vintages':{
  'retrospective_2010':{'source_url':R10_PAGE,'data_as_of':'Annual Energy Review 2009 and Monthly Energy Review August 2010','units':{s:u for _,(s,_,u,_) in T10.items()},'series':realized['retrospective_2010']},
  'retrospective_2022':{'source_url':R22_XLSX,'data_as_of':'EIA open data API, accessed April 2022','units':{s:u for s,_,u,dy in T22.values() if not dy},'series':realized['retrospective_2022']},
  'retrospective_2025':{'source_url':R25_CSV,'data_as_of':'EIA data file, August 2025 (case_name ACTUAL, product MER)','units':{s:u for s,_,u in C.values()},'series':realized['retrospective_2025']},
 }},open(f'{OUT}/realized.json','w'),indent=1)
json.dump({'r22_avg_abs_by_year':r22_avgabs},open('r22_avgabs.json','w'),indent=1)
open(f'{OUT}/PROGRESS.md','w').write('# eia-aeo progress\n\n| Edition | Status | Entries | Written |\n|---|---|---|---|\n'+'\n'.join(prog)+'\n')
json.dump([(a,b,c,sorted({e['series'] for e in d}),min([e['target_year'] for e in d],default=None),max([e['target_year'] for e in d],default=None),sorted({e['retrospective'] for e in d})) for a,b,c,d in idx],open('idx.json','w'))
print(sum(len(v) for v in entries.values()))
for a,b,c,d in idx: print(a,b,c)
