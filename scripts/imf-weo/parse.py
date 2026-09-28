import re, json, sys
import xml.etree.ElementTree as ET
NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
def strings():
    t=ET.parse('x/xl/sharedStrings.xml').getroot()
    out=[]
    for si in t.findall(NS+'si'):
        out.append(''.join(x.text or '' for x in si.iter(NS+'t')))
    return out
def col(ref):
    s=re.match(r'[A-Z]+',ref).group(0); n=0
    for ch in s: n=n*26+ord(ch)-64
    return n-1
def rows(path,ss):
    for ev,el in ET.iterparse(path):
        if el.tag==NS+'row':
            r={}
            for c in el.findall(NS+'c'):
                v=c.find(NS+'v')
                if v is None:
                    is_=c.find(NS+'is')
                    val=''.join(x.text or '' for x in is_.iter(NS+'t')) if is_ is not None else None
                else:
                    val=ss[int(v.text)] if c.get('t')=='s' else v.text
                r[col(c.get('r'))]=val
            yield r
            el.clear()
