import os,re,html,sys,subprocess
u,out=sys.argv[1],sys.argv[2]
s=subprocess.run(['curl','-sL','--compressed','-A','Mozilla/5.0',u],capture_output=True).stdout.decode('utf-8','ignore')
s=re.sub(r'<(script|style)[^>]*>.*?</\1>','',s,flags=re.S)
t=html.unescape(re.sub('<[^>]+>',' ',s)); t=re.sub(r'\s+',' ',t)
i=t.find('/PRNewswire/'); seg=t[max(0,i-80):][:7000] if i>=0 else t[:7000]
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'x',out),'w').write('SOURCE '+u+'\n'+seg); print(seg)
