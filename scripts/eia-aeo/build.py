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
# #70: R2022 rows that match no case of the edition. AEO2015 and AEO2016 crude price and AEO2016 transportation energy
# differ from the printed Reference case (AEO2015/AEO2016 Tables 2 and 12) even in the base year (AEO2016 imported
# crude 2015: 52.865 in R2022, 46.421 in the printed table and R2025), while every other R2022 series of these editions
# equals the printed Reference case. These rows are taken from the R2025 data file, which equals the printed tables.
R22_NOT_OF_RECORD={('2015','crude_oil_price_nominal'),('2016','crude_oil_price_nominal'),('2016','transportation_energy_consumption')}
d22=xl.read('r22all.xlsx')
r22_avgabs={}
r22_replaced={}  # (edition, series) -> target years of R2022 rows that R2025 replaces (AEO2009 ARRA case; #70 rows)
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
        if (ed=='2009' and series not in R22_AEO2009_MARCH) or (ed,series) in R22_NOT_OF_RECORD:  # #66, #70: taken from R2025 below
            r22_replaced[(ed,series)]={y for j,y in cols.items() if r[j] not in ('','NA')}
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
    replace=int(ed)<=2022 and y<=2021 and any(k[0]==ed for k in r22_replaced)  # #66, #70: R2022 row not of record
    if int(ed)<=2022 and y<=2021 and not replace: continue  # covered by the 2022 retrospective tables
    for col,(series,label,unit) in C.items():
        if r[col]=='': continue
        if replace and y not in r22_replaced.get((ed,series),set()): continue
        e={'series':series,'label':label,'target_year':y,'value':rnd(float(r[col])),'unit':unit,'case':'Reference','retrospective':'AEO Retrospective 2025 (data file, pulled August 2025)','column':col,'source_url':R25_CSV,'confidence':'high'}
        if replace and ed=='2009': e['note']='AEO2009 March 2009 Reference case (the published report), from the R2025 data file. The R2022 tables give the April 2009 ARRA-updated Reference case for this series; not used (#66).'
        elif replace: e['note']=f'AEO{ed} Reference case as printed in the AEO{ed} tables, from the R2025 data file. The R2022 row for this series matches no AEO{ed} case (it differs from the printed table in the base year too); not used (#70).'
        add(ed,e)

# ---- AEO2026 tables (#13): no retrospective covers AEO2026 yet, so its main case is read from the edition's own tables.
# AEO2026 renamed the Reference case "Counterfactual Baseline" (cb2026) without changing how it is built (AEO2026
# narrative). The row codes below reproduce the R2025 data file's AEO2025 Reference rows exactly when applied to the
# AEO2025 tables (checked for every year 2024 to 2050), so the series keep their R2025 definitions.
AEO26_PAGE='https://www.eia.gov/outlooks/aeo/tables_ref.php'
def aeo26url(t): return f'https://www.eia.gov/outlooks/aeo/excel/aeotab{t}.xlsx'
T26={ # series: (table, row code, label, unit, dollar_year); labels as in the R2025 rows (C), so subjects keep their aliases
 'solar_generation':(16,'REN000:x2_AllSunnyOut','Solar net generation (all sectors)','billion kWh',None),
 'wind_generation':(16,'REN000:x2_WetandDryWind','Wind net generation (all sectors)','billion kWh',None),
 'electricity_sales':(8,'ESD000:ia_Total','Total electricity sales excluding direct use','billion kWh',None),
 'total_energy_consumption':(2,'QUA000:ia_Total','Total energy consumption (all sectors)','quadrillion Btu',None),
 'transportation_energy_consumption':(2,'QUA000:fa_DeliveredEner','Total delivered transportation energy consumption','quadrillion Btu',None),
 'co2_emissions_energy':(18,'TCE000:ga_Total','Energy-related carbon dioxide emissions','million metric tons CO2',None),
 'petroleum_liquids_consumption':(11,'PSD000:fa_Total','Total petroleum and other liquids consumption','million barrels per day',None),
 'crude_oil_price_nominal':(12,'PPP000:nom_Imported_Rea','Imported crude oil price (IRAC), nominal','nominal USD per barrel',None),
 'crude_oil_price_real':(12,'PPP000:bb_Imported_Real','Imported crude oil price (IRAC), real',T22['table_4a'][2],2025),
 'natural_gas_price_electric_power_nominal':(13,'NGS000:nom_ElectricPowr','Natural gas price, electric power sector, nominal','nominal USD per thousand cubic feet',None),
 'natural_gas_price_electric_power_real':(13,'NGS000:ja_ElectricPower','Natural gas price, electric power sector, real','constant USD per thousand cubic feet, in the dollar year of the AEO (see dollar_year)',2025),
}
def aeo_table(path):
    out={}
    for sh,v in xl.read(path).items():
        try: g=xl.grid(v)
        except ValueError: continue
        isy=lambda x: str(x).strip().isdigit() and 1990<int(str(x).strip())<2100
        hi=next(i for i,r in enumerate(g) if sum(1 for x in r if isy(x))>=5)
        cols={j:int(str(x).strip()) for j,x in enumerate(g[hi]) if isy(x)}
        for r in g:
            k=str(r[0]).strip()
            if k and k not in out: out[k]={y:float(r[j]) for j,y in cols.items() if r[j] not in ('','NA')}
    return out
if os.path.exists('aeo2026_tab2.xlsx'):
    tabs={}
    for series,(t,code,label,unit,dy) in T26.items():
        if t not in tabs: tabs[t]=aeo_table(f'aeo2026_tab{t}.xlsx')
        for y,v in sorted(tabs[t][code].items()):
            e={'series':series,'label':label,'target_year':y,'value':rnd(v),'unit':unit}
            if dy: e['dollar_year']=dy
            e.update({'case':'Counterfactual Baseline (the Reference case, renamed in AEO2026)','table':f'AEO2026 Table {t}','column':code,'source_url':aeo26url(t),'confidence':'high'})
            add('2026',e)
else:
    print('aeo2026_tab*.xlsx not found: AEO2026 not written')

# ---- write editions
ALL=['1979']+[str(y) for y in range(1982,1988)]+[str(y) for y in range(1989,2024)]+['2025','2026']
now=datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
prog=[]; idx=[]
for ed in ALL:
    es=sorted(entries.get(ed,[]),key=lambda e:(e['series'],e['target_year'],e.get('retrospective','')))
    srcs=sorted({e['source_url'] for e in es})
    pages=[]
    if any('archive/2022' in s for s in srcs): pages.append(R22_PAGE)
    if any('archive/2010' in s for s in srcs): pages.append(R10_PAGE)
    if any('dashappdata' in s for s in srcs): pages.append(R25_PAGE)
    if any('/aeo/excel/aeotab' in s for s in srcs): pages.append(AEO26_PAGE)
    if not es:
        note={'1979':'Listed in the EIA AEO archive (1979 Annual Report to Congress). Not covered by any AEO Retrospective found. Not extracted.',
              '2026':'AEO2026 released 2026-04-08. Not yet covered by an AEO Retrospective (latest is Retrospective 2025, data pulled August 2025). Not extracted.'}.get(ed,'No projections in the retrospectives read.')
        status='missing'
    else:
        series=sorted({e['series'] for e in es})
        status='partial'
        note=f'Reference case values as tabulated in EIA AEO Retrospectives, not read from the AEO report itself. Series: {", ".join(series)}.'
        if ed=='2026': note=f'Counterfactual Baseline case (the Reference case, renamed in AEO2026 with no change of method), read from the AEO2026 tables (cb2026.d021826b); no AEO Retrospective covers AEO2026 yet (#13). Row codes checked against the R2025 data file on the AEO2025 tables. Series: {", ".join(series)}.'
    doc={'edition':ed,'published':'2026-04-08' if ed=='2026' else ed,'status':status if es else 'partial','sources':pages+srcs,'entries':es,
         'notes':note+(' Released 2026-04-08 (AEO home page).' if ed=='2026' else ' published field is the AEO edition year; exact release date not verified.')}
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
json.dump([(a,b,c,sorted({e['series'] for e in d}),min([e['target_year'] for e in d],default=None),max([e['target_year'] for e in d],default=None),sorted({e.get('retrospective',e.get('table','')) for e in d})) for a,b,c,d in idx],open('idx.json','w'))
print(sum(len(v) for v in entries.values()))
for a,b,c,d in idx: print(a,b,c)
