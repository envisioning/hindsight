import zipfile,re,xml.etree.ElementTree as ET,sys
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
def col2n(c):
    n=0
    for ch in c: n=n*26+ord(ch)-64
    return n
def read(path):
    z=zipfile.ZipFile(path)
    ss=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',NS):
            ss.append(''.join(t.text or '' for t in si.iter('{%s}t'%NS['m'])))
    wb=ET.fromstring(z.read('xl/workbook.xml'))
    rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rmap={r.get('Id'):r.get('Target') for r in rels}
    out={}
    for s in wb.find('m:sheets',NS):
        t=rmap[s.get('{%s}id'%NS['r'])].lstrip('/')
        if not t.startswith('xl/'): t='xl/'+t
        rows={}
        for c in ET.fromstring(z.read(t)).iter('{%s}c'%NS['m']):
            ref=c.get('r'); m=re.match(r'([A-Z]+)(\d+)',ref)
            v=c.find('m:v',NS); ty=c.get('t')
            if ty=='inlineStr':
                val=''.join(x.text or '' for x in c.iter('{%s}t'%NS['m']))
            elif v is None: continue
            elif ty=='s': val=ss[int(v.text)]
            else: val=v.text
            rows.setdefault(int(m.group(2)),{})[col2n(m.group(1))]=val
        out[s.get('name')]=rows
    return out
def grid(rows):
    mx=max((max(r) for r in rows.values() if r),default=0)
    return [[rows.get(i,{}).get(j,'') for j in range(1,mx+1)] for i in range(1,max(rows)+1)]
if __name__=='__main__':
    d=read(sys.argv[1])
    for name in sys.argv[2:]:
        print('==',name)
        for row in grid(d[name]): print('|'.join(str(x)[:10] for x in row))
