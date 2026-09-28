from lib import *
B='https://worldin.economist.com/edition/2016/article/'
S='https://web.archive.org/web/20221215175845/'
u=B+'12041/world-1990-after-communism'
reprint(1990,u,S+u,'Norman Macrae','After communism',[],note='The reprinted article is about the 1990s as a decade (for example that the Soviet Union "will certainly split into being more than one country") and holds no prediction dated to 1990.')
u=B+'12043/world-1992-and-now-next-500-years'
reprint(1992,u,S+u,'Paul Kennedy (guest writer)','And now for the next 500 years',[],note='A guest essay on long-run American power; no prediction dated to 1992.')
u=B+'12044/world-1993-new-people-new-vigour-old-ideas'
reprint(1993,u,S+u,'Mike Elliot','New people, new vigour, old ideas',[
 E(None,'article','Yet he will come under intense pressure to renegotiate the NAFTA to “protect” rustbelt jobs','NAFTA renegotiation pressure',1993,u,'low',note='Predicts pressure, not an outcome.'),
 E(None,'article','There will be some huffing and puffing about conditions in China, but, try as they may to avoid it, the world’s sole superpower and most populous country will start to speak to each other more fruitfully in 1993.','US-China relations 1993',1993,u,'low',note='Vague ("more fruitfully").'),
 ])
u=B+'12045/world-1994-join-derivatives-club'
reprint(1994,u,S+u,'Marjorie Deane','Join the derivatives club',[
 E(None,'article','And China plans to unify its exchange rates in 1994, in preparation for bringing a potential heavyweight into the splintering currency markets.','China exchange-rate unification',1994,u,'medium',note='Reports a stated plan.'),
 E(None,'article','Expect a leap in activity in derivatives related to emerging stock markets.','Emerging-market equity derivatives',1994,u,'low'),
 ])
u=B+'12046/world-1995-search-craziness'
reprint(1995,u,S+u,'Tom Peters (guest writer)','In search of craziness',[],note='A guest essay on management; no testable prediction for 1995.')
u=B+'12048/world-1996-labour-britains-promise'
reprint(1996,u,S+u,'Tony Blair (guest writer)','A Labour Britain\'s promise',[],note='A guest article by the then opposition leader setting out Labour policy; it states intentions, not The Economist\'s predictions.')
U='http://www.theworldin.com/edition/2017/article/12575/world-2017'
write(dict(edition='2017',published='2016-11',status='partial',publisher='The Economist',series='The World in 2017',editor='Daniel Franklin',edition_number=31,
 sources=[U,'https://web.archive.org/web/20161129051834/'+U],
 publicly_readable="The editor's introduction in full, via an Internet Archive snapshot of theworldin.com.",
 not_readable="The body text of the other articles and the forecast tables (paywalled or not archived).",
 entries=[
 E(None,'editor_letter','He will also set about undoing the work of his predecessor, including a rollback of Obamacare.','Obamacare repeal',2017,U,'medium'),
 E(None,'editor_letter','Britain, meanwhile, will formally launch its proceedings for divorce from the European Union, which will be bitterly fought over at home and abroad.','Article 50 notification',2017,U,'high'),
 E(None,'editor_letter','India will remain a star among big emerging markets.','India growth among emerging markets',2017,U,'medium'),
 E(None,'editor_letter','Australia will experience its 26th year of uninterrupted growth.','Australia uninterrupted growth',2017,U,'high',metric='consecutive years without recession',value='26',unit='years'),
 ],notes="Edition number 31 per coverage of the edition; it fits a first edition in 1987. Publication day in November 2016 not confirmed."))
