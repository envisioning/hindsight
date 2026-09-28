from lib import *
B='https://worldin.economist.com/edition/2016/article/'
S='https://web.archive.org/web/20221215175845/'
R09=B+'12067/world-2009-about-2008-sorry'
u=B+'12063/world-2005-age-phonography'
reprint(2005,u,S+u,'Tom Standage','The age of phonography',[
 E(None,'article','in 2005, sales of some 83m digital cameras will be more than double those of traditional film ones.','Digital vs film camera sales',2005,u,'high',metric='digital camera unit sales',value='83',unit='m units'),
 E(None,'article','In 2005 sales of camera-phones will soar above 300m units.','Camera-phone sales',2005,u,'high',metric='camera-phone unit sales',value='300',unit='m units (more than)'),
 ])
u=B+'12064/world-2006-looking-back-future'
reprint(2006,u,S+u,'Niall Ferguson (historian, commissioned)','Looking back on the future',[],note='The reprinted article is a review of the first 20 editions, not a forecast for 2006. Its claims are in self_assessment.json; predictions it restates are added to the editions they came from.')
u=B+'12065/world-2007-work-life-imbalance'
reprint(2007,u,S+u,'Lucy Kellaway (guest writer)','Work-life imbalance',[
 E(None,'guest_article','In 2007 there will be no rise in the number of women in senior positions; in fact the number will fall.','Women in senior corporate positions',2007,u,'medium',note='A guest writer\'s prediction, published in The World in 2007.'),
 ])
u=B+'12066/world-2008-007-008'
reprint(2008,u,S+u,'John Grimond','007 in 008',[
 E(None,'article','The second event will be the publication of a new Bond novel, “Devil May Care”, on May 28th.','New James Bond novel publication',2008,u,'low',note='Scheduled event.'),
 E(None,'recalled_in_self_review','We said the OPEC cartel would aim to keep oil prices in the lofty range of $60-80 a barrel','Oil price 2008',2008,R09,'medium',metric='OPEC target oil price range',value='60-80',unit='USD per barrel',note='Restated in the self-review "About 2008: sorry" in The World in 2009.'),
 E(None,'recalled_in_self_review','We thought that Romano Prodi would probably see out the year as prime minister of Italy','Italian prime minister',2008,R09,'medium',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','that Canada would pull its troops out of Afghanistan\'s Kandahar province','Canadian troops in Kandahar',2008,R09,'medium',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','that Ken Livingstone would be re-elected as mayor of London','London mayoral election 2008',2008,R09,'medium',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','Oh, and we expected that by now Hillary Clinton would be heading for the White House.','US presidential election 2008',2008,R09,'medium',note='Restated in the self-review, which adds that the edition also said every election season brings "at least one big surprise".'),
 E(None,'recalled_in_self_review','In politics, as expected, José Luis Rodríguez Zapatero won a second term in Spain.','Spanish general election 2008',2008,R09,'medium',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','And we forecast that China would for the first time overtake the United States in the gold-medal table, with Russia in third place.','Beijing Olympics gold-medal table',2008,R09,'medium',note='Restated in the self-review.'),
 ],extra_sources=[R09,S+R09])
reprint(2009,R09,S+R09,'the editor, Daniel Franklin','About 2008: sorry',[],note='The reprinted article is the editor\'s review of The World in 2008, not a forecast for 2009. Its claims are in self_assessment.json.',editor='Daniel Franklin')
u=B+'12068/world-2010-space-fiscal-frontier'
reprint(2010,u,S+u,'Elon Musk (guest writer)','Space, the fiscal frontier',[
 E(None,'guest_article','You will see the first SpaceX demonstration flights, a prelude to operational missions, in 2010.','SpaceX Dragon demonstration flight',2010,u,'medium',note='A guest writer\'s prediction about his own company.'),
 E(None,'guest_article','NASA will pick probably two or three companies for this task in 2010, heralding the dawn of a new era in human spaceflight.','NASA commercial crew selection',2010,u,'low',note='Guest writer; hedged ("probably").'),
 ])
u=B+'12069/world-2011-another-year-another-billion'
reprint(2011,u,S+u,'John Parker','Another year, another billion',[
 E(None,'article','At the turn of 2011-12, another Adnan will be chosen. At about that point, the seven-billionth living person will be born','World population reaches 7 billion',2011,u,'medium',metric='world population',value='7',unit='bn people',note='The article gives a window "ranging from mid-2011 to mid-2012".'),
 ])
u=B+'12070/world-2012-sharing-power-2012'
reprint(2012,u,S+u,'Sheryl Sandberg (guest writer)','Sharing to the power of 2012',[],note='A guest article on social media; no testable prediction.')
u=B+'12071/world-2013-lottery-life'
reprint(2013,u,S+u,'The Economist Intelligence Unit','The lottery of life',[],note='The article is a ranking (best country to be born in 2013), not a forecast of an event; not captured.')
u=B+'12072/world-2014-great-war'
reprint(2014,u,S+u,'Ann Wroe','The Great War',[],note='An essay on the centenary of the first world war; no testable prediction for 2014.')
