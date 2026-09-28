import subprocess,re
def parse(pdf):
    txt=subprocess.run(['pdftotext','-layout',pdf,'-'],capture_output=True,text=True).stdout
    lines=txt.split('\n')
    hdr=None; rows={}; actual=None; order=[]
    for ln in lines:
        toks=[(m.group(),m.end()) for m in re.finditer(r'\S+',ln)]
        if hdr is None:
            ys=[(t,e) for t,e in toks if re.fullmatch(r'(19|20)\d\d',t)]
            if len(ys)>=10: hdr=[(int(t),e) for t,e in ys]
            continue
        m=re.match(r'\s*(AEO ?\d{4}\*?|Actual)\b',ln)
        if not m: continue
        key=m.group(1).replace(' ','').rstrip('*')
        if key=='Actual' and actual is not None: break
        vals={}
        for t,e in toks:
            if e<=m.end(): continue
            t2=t.replace(',','')
            if not re.fullmatch(r'-?\d+(\.\d+)?',t2): continue
            y=min(hdr,key=lambda h:abs(h[1]-e))
            if abs(y[1]-e)>6: print('WARN far',pdf,key,t,e,y); continue
            vals[y[0]]=float(t2)
        if key=='Actual': actual=vals; break
        if key in rows:
            if rows[key]==vals: continue
            if not rows[key]: rows[key]=vals; continue
            print('WARN dup',pdf,key)
            continue
        rows[key]=vals; order.append(key)
    return hdr,rows,actual
if __name__=='__main__':
    import sys
    h,r,a=parse(sys.argv[1])
    for k,v in r.items(): print(k,v)
    print('Actual',a)
