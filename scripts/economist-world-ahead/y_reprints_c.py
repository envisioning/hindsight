from lib import *
B='https://worldin.economist.com/edition/2016/article/'
S='https://web.archive.org/web/20221215175845/'
u=B+'12055/world-1997-hong-kong-july-1st'
reprint(1997,u,S+u,'Christopher Patten (guest writer, governor of Hong Kong)','Hong Kong, July 1st',[],note='A guest article by the last British governor; it states hopes and regrets, not The Economist\'s predictions.')
u=B+'12056/world-1998-web-lifestyle'
reprint(1998,u,S+u,'Bill Gates (guest writer)','The Web lifestyle',[],note='A guest article. Its forecasts have a ten-year horizon ("The Web will be as much a way of life as the car by 2008") and are the guest\'s, not The Economist\'s; not captured.')
u=B+'12057/world-1999-empire-democracy'
reprint(1999,u,S+u,'Brian Beedham','The empire of democracy',[],note='An argument about intervention after Kosovo; no testable prediction for 1999.')
u=B+'12058/world-2000-can-e-commerce-deliver'
reprint(2000,u,S+u,'Peter Drucker (guest writer)','Can e-commerce deliver?',[],note='A guest article with long-run claims; no testable prediction for 2000 by The Economist.')
u=B+'12059/world-2001-wheres-worlds-worst'
reprint(2001,u,S+u,'The Economist Intelligence Unit','Where\'s the world\'s worst?',[
 E(None,'article','A drought in 2000–the worst for at least 30 years–will lead to food shortages in 2001.','Afghanistan food shortages',2001,u,'high'),
 E(None,'article','In 2001, large numbers of people in Afghanistan will die through disease, starvation or war. Many more will leave.','Afghanistan deaths and emigration',2001,u,'medium'),
 ],note='The article names Afghanistan the worst country to be a citizen of in 2001 (an EIU ranking).')
u=B+'12060/world-2002-europes-day-change'
reprint(2002,u,S+u,'Gideon Rachman','Europe\'s day of change',[
 E(None,'article','There will be a period of up to two months—varying from country to country—in which old and new currencies will circulate side by side. But by March it will be euros only.','Euro cash changeover',2002,u,'high'),
 E(None,'article','In 2002 that issue will fade and the euro may break back through the symbolic level of parity with the dollar.','Euro-dollar parity',2002,u,'low',metric='EUR/USD exchange rate',value='1.00',unit='USD per EUR',note='Hedged ("may").'),
 E(None,'article','Worryingly the euro zone’s big three—Italy, Germany and France—could all be in line for reprimands in 2002.','Stability and Growth Pact reprimands',2002,u,'low',note='Hedged ("could").'),
 ])
u=B+'12061/world-2003-safe-houses'
reprint(2003,u,S+u,'Pam Woodall','As safe as houses?',[],note='The article warns that house prices will fall ("When the house-price bubble bursts, you will feel it.") but gives no year, so no entry is captured.')
u=B+'12062/world-2004-new-impetus-old-europe'
reprint(2004,u,S+u,'Vaclav Havel (guest writer)','A new impetus for old Europe',[],note='A guest article on EU enlargement; no testable prediction for 2004.')
