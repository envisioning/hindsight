import json,os,glob,re
def nz(x): return re.sub(r'\s+','',x.replace('\u00ad',''))
HERE=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(HERE,'..','..','data','raw','economist-world-ahead')+os.sep
SCR=os.path.join(HERE,'x')+os.sep
def corpus():
    t=''
    for f in glob.glob(SCR+'*.txt'): t+=open(f).read()+'\n'
    return t
def E(rank,kind,quote,subject,target,url,conf,metric=None,value=None,unit=None,note=None):
    e=dict(rank=rank,kind=kind,quote=quote,subject=subject,target_year=target,metric=metric,value=value,unit=unit,source_url=url,confidence=conf)
    if note: e['note']=note
    return e
def write(ed,check=True):
    c=corpus()
    for e in ed['entries']:
        assert len(e['quote'])<=400,(e['quote'])
        if check and e.get('verify',True) and nz(e['quote']) not in nz(c): print('NOT VERBATIM:',e['quote'][:90])
    json.dump(ed,open(OUT+ed['edition']+'.json','w'),ensure_ascii=False,indent=2); open(OUT+ed['edition']+'.json','a').write('\n')
    print('wrote',ed['edition'],len(ed['entries']))

IDX='http://www.theworldin.com/article/12091/world-1987-2016'
def reprint(year,url,snap,author,title,entries,note='',extra_sources=(),editor=None):
    """An edition known only from the article The World in 2016 reprinted from it."""
    d=dict(edition=str(year),published=str(year-1),status='partial',publisher='The Economist',series='The World in %d'%year)
    if editor: d['editor']=editor
    d.update(edition_number=year-1986,sources=[url,snap,IDX]+list(extra_sources),
      publicly_readable="One article, reprinted on worldin.economist.com in 2015 for the 30th edition (\"%s\", by %s), read from an Internet Archive snapshot."%(title,author),
      not_readable="Everything else in the issue. No other text of this edition was found in public form.",
      entries=entries,notes=("Edition number counted from The World in 1987 = 1. Publication month not confirmed; year only. The reprint is The Economist's own web copy of the original article. "+note).strip())
    write(d)
