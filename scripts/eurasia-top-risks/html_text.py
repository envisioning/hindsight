import re,html,sys
s=open(sys.argv[1],errors='ignore').read()
s=re.sub(r'<script.*?</script>|<style.*?</style>','',s,flags=re.S)
t=re.sub(r'<[^>]+>','\n',s); t=html.unescape(t)
lines=[l.strip() for l in t.split('\n') if l.strip()]
out='\n'.join(lines)
a=out.find(sys.argv[2]) if len(sys.argv)>2 else 0
b=out.find('\nPRINT\n',a+30) if len(sys.argv)>2 else len(out)
print(out[a: (b if b>0 else a+8000)])
