"""Run after the y_reprints_*.py scripts. Adds predictions that the 2006 review
("Looking back on the future", The World in 2006) restates, to the editions they came from."""
from lib import *
F='https://worldin.economist.com/edition/2016/article/12064/world-2006-looking-back-future'
N='Restated in "Looking back on the future" (The World in 2006), a review by an outside historian; the original wording is not seen.'
ADD={
 1987:[E(None,'recalled_in_self_review','“1987”, proclaimed the cover of the very first TWI, would see (among other things) “a nasty shock for Mrs Thatcher”, “a last-ditch push by America\'s moral majority” and “a Japanese takeover of a major Wall Street firm”.','Cover-line predictions for 1987',1987,F,'medium',note=N+' The cover lines are quoted.'),
       E(None,'recalled_in_self_review','he predicted that Nomura Securities would take over Merrill Lynch.','Nomura takeover of Merrill Lynch',1987,F,'medium',note=N)],
 1988:[E(None,'recalled_in_self_review','The World in 1988 foresaw major changes in central Europe, especially in East Germany—a year out, but pretty close.','Change in central Europe',1988,F,'low',note=N)],
 1992:[E(None,'recalled_in_self_review','There was supposed to be a Bush senior election victory in 1992','US presidential election 1992',1992,F,'medium',note=N),
       E(None,'recalled_in_self_review','Anthony King called the 1992 British election correctly as a Tory victory','UK general election 1992',1992,F,'medium',note=N)],
 1996:[E(None,'recalled_in_self_review','And a Middle East peace settlement was foreseen in 1996','Middle East peace settlement',1996,F,'medium',note=N),
       E(None,'recalled_in_self_review','Other notably bad calls include a Red Sox victory in the World Series (in 1996)','World Series 1996',1996,F,'medium',note=N)],
 1997:[E(None,'recalled_in_self_review','a “bloody mess” when Hong Kong was returned to China (in 1997)','Hong Kong handover',1997,F,'low',note=N)],
 2003:[E(None,'recalled_in_self_review','a property-market crash (in 2003)','Property-market crash',2003,F,'medium',note=N),
       E(None,'recalled_in_self_review','TWI confidently predicted Saddam Hussein\'s fall in 2003','Fall of Saddam Hussein',2003,F,'medium',note=N)],
 2004:[E(None,'recalled_in_self_review','And The World in 2004 got Mr Bush\'s re-election dead right too.','US presidential election 2004',2004,F,'medium',note=N)],
}
c=corpus()
for y,es in ADD.items():
    p=OUT+str(y)+'.json'; d=json.load(open(p))
    d['entries']=[e for e in d['entries'] if e.get('source_url')!=F]+es
    for s in (F,'https://web.archive.org/web/20221215175845/'+F):
        if s not in d['sources']: d['sources'].append(s)
    for e in es:
        if nz(e['quote']) not in nz(c): print('NOT VERBATIM',e['quote'][:80])
    json.dump(d,open(p,'w'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
    print('augmented',y,len(d['entries']))
