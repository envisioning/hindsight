import os,sys,re,html,json,urllib.request,os,time
def get(u,t=60):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
    b=urllib.request.urlopen(r,timeout=t).read()
    if b[:2]==b'\x1f\x8b':
        import gzip; b=gzip.decompress(b)
    return b.decode('utf-8','ignore')
def text(s):
    out=[]
    for p in re.findall(r'<p[^>]*>(.*?)</p>',s,re.S):
        t=html.unescape(re.sub('<[^>]+>','',p)).strip()
        t=re.sub(r'\.css-[^{]*\{[^}]*\}','',t)
        if len(t)>30 and 'css-' not in t and '{' not in t: out.append(t)
    return out
path=sys.argv[1]
if not path.startswith('http'): path='https://www.economist.com/'+path
time.sleep(2)
if os.environ.get('TS'):
  cdx=json.dumps([['timestamp'],[os.environ['TS']]])
else:
 try:
  cdx=get('https://web.archive.org/cdx/search/cdx?url='+path+'&filter=statuscode:200&fl=timestamp&output=json',90)
 except Exception as e:
  print('CDX ERR',e); sys.exit(0)
ts=[r[0] for r in json.loads(cdx)[1:]] if cdx.strip() else []
ts=sorted(set([ts[0],ts[len(ts)//4] if ts else None,ts[len(ts)//2] if ts else None,ts[-1] if ts else None])-{None}) if ts else []
name=re.sub(r'\W+','_',path.split('economist.com/')[-1])[:120]
for t in ts:
    time.sleep(3)
    try: s=get('https://web.archive.org/web/%sid_/%s'%(t,path))
    except Exception as e: print('ERR',t,e); continue
    ps=text(s)
    BAD=('Unlock','Registered','MenuSkip','Weekly edition','Privacy','InstagramFacebook')
    ps=[p for p in ps if not any(b in p for b in BAD)]
    m=re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)',s)
    ps=['DESC: '+html.unescape(m.group(1)) if m else 'DESC: none']+ps
    body=[p for p in ps if len(p)>150]
    if len(body)>=3:
        open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'x',name+'.txt'),'w').write('SNAPSHOT https://web.archive.org/web/%s/%s\n'%(t,path)+'\n'.join(ps))
        print('SNAPSHOT https://web.archive.org/web/%s/%s'%(t,path)); print('\n'.join(ps)); break
    else: print('thin',t,len(ps)); print('\n'.join(ps)[:600])
else: print('NO USABLE SNAPSHOT', len(ts))
