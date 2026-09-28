import json,glob,os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','raw','economist-world-ahead')
eds={}
for f in glob.glob(OUT+'/*.json'):
    b=os.path.basename(f)[:-5]
    if b.isdigit(): eds[int(b)]=json.load(open(f))
HERE=os.path.dirname(os.path.abspath(__file__))
from missing import MISSING as missing
head=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'index_head.md')).read()
tail=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'index_tail.md')).read()
rows=['| Edition | Title | Published | Status | Entries | Publicly readable | Not readable |','|---|---|---|---|---|---|---|']
n=0
for y in range(2026,1986,-1):
    if y in eds:
        e=eds[y]; n+=len(e['entries'])
        rows.append('| %d | %s | %s | %s | %d | %s | %s |'%(y,e['series'],e['published'],e['status'],len(e['entries']),e.get('publicly_readable',''),e.get('not_readable','')))
    else:
        rows.append('| %d | The World in %d | %d | missing | 0 | %s | Whole issue. |'%(y,y,y-1,missing.get(str(y),'Nothing found in public free form.')))
open(OUT+'/INDEX.md','w').write(head+'\n'.join(rows)+'\n\nTotal entries: %d in %d edition files.\n\n'%(n,len(eds))+tail)
print('index',n,len(eds))
