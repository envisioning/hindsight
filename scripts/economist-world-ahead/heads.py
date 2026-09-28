import sys,re,html,json,urllib.request,time,gzip
def get(u,t=60):
    r=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
    b=urllib.request.urlopen(r,timeout=t).read()
    if b[:2]==b'\x1f\x8b': b=gzip.decompress(b)
    return b.decode('utf-8','ignore')
for path in sys.stdin.read().split():
    u='https://www.economist.com/'+path
    try:
        time.sleep(2)
        cdx=json.loads(get('https://web.archive.org/cdx/search/cdx?url='+u+'&filter=statuscode:200&fl=timestamp&output=json&limit=3'))
        t=cdx[1][0]; time.sleep(2)
        s=get('https://web.archive.org/web/%sid_/%s'%(t,u))
        ti=re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]*)',s); d=re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)',s)
        print(path,'|',t,'|',html.unescape(ti.group(1)) if ti else '-','|',html.unescape(d.group(1)) if d else '-')
    except Exception as e: print(path,'| ERR',e)
