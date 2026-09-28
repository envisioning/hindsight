from lib import *
PR='https://www.prnewswire.com/news-releases/the-world-looks-wobbly-according-to-the-world-in-2019-300755122.html'
BX='https://www.economist.com/the-world-in/2018/11/20/britain-will-leave-the-eu-in-2019-but-uncertainties-will-drag-on'
HO='https://www.economist.com/the-world-in/2018/11/20/half-the-world-will-be-online-in-2019'
EX='https://www.economist.com/the-world-in/2018/11/29/americas-longest-ever-expansion-will-approach-its-end-in-2019'
RV='https://worldin.economist.com/edition/2020/article/17378/forecasting-hits-and-misses-2019'
L="Half the world is online, India's GDP overtakes Britain's, Nigeria's population reaches 200m and in America millennials outnumber baby-boomers to become the country's largest generation."
write(dict(edition='2019',published='2018-11-22',status='partial',publisher='The Economist',series='The World in 2019',editor='Daniel Franklin',edition_number=33,
 sources=[PR,BX,'https://web.archive.org/web/20181211172128/'+BX,HO,'https://web.archive.org/web/20181211172019/'+HO,EX,'https://web.archive.org/web/20181224215201/'+EX,RV,'https://web.archive.org/web/20200305060024/'+RV],
 publicly_readable="The launch press release (2018-11-26), which lists the editor's 'dozen takeaways' in full. Three articles that were metered-free at publication (Brexit; half the world online; the world economy), read from December 2018 archive snapshots. The self-review 'Hindsight on foresight' in The World in 2020.",
 not_readable="The editor's introduction as printed, and the body text of the other articles (paywalled or not archived). The worldin2019.economist.com site was archived only as script fragments.",
 entries=[
 E(1,'press_release','By mid-year America will break its record for its longest uninterrupted expansion, but by the end of the year it could be heading into a recession.','US economic expansion record',2019,PR,'high',note='The recession clause is hedged ("could").'),
 E(1,'press_release',"China's growth rate will slow down, while India's speeds up.",'China and India GDP growth',2019,PR,'high'),
 E(1,'press_release','Post-chaos Syria will top the global growth league; at the other end will be a shrinking Venezuela and Iran.','Fastest- and slowest-growing economies',2019,PR,'high'),
 E(1,'press_release','In Europe, Italy will flirt with financial crisis.','Italy financial crisis',2019,PR,'low',note='Vague ("flirt with").'),
 E(2,'press_release',"Will America's stockmarket fall back, or the rest of the world rise? The smart bet is on the latter.",'US vs rest-of-world stockmarkets',2019,PR,'medium'),
 E(4,'press_release','Brexit happens. And as Britain leaves the European Union the recriminations will intensify.','Brexit in 2019',2019,PR,'high'),
 E(4,'press_release','The EU, meanwhile, will get a new commission, a new parliament and a new head for the European Central Bank.','EU institutional turnover',2019,PR,'high',note='Scheduled events.'),
 E(7,'press_release',"Meanwhile, NASA's New Horizons probe reaches Ultima Thule, in the most distant encounter in the history of spaceflight.",'New Horizons flyby of Ultima Thule',2019,PR,'high',note='Scheduled event.'),
 E(10,'press_release',L,'Half the world online',2019,PR,'high',metric='share of world population online',value='50',unit='%'),
 E(10,'press_release',L,'India GDP overtakes UK GDP',2019,PR,'high'),
 E(10,'press_release',L,'Nigeria population',2019,PR,'high',metric='population of Nigeria',value='200',unit='m'),
 E(10,'press_release',L,'US millennials outnumber baby-boomers',2019,PR,'high'),
 E(None,'article','The likeliest scenario (though there are plenty of others) is that Mrs May will at least secure a deal that ensures Britain formally exits the EU, as planned, on March 29th.','Brexit date',2019,BX,'high'),
 E(None,'article','The chances are that there will be a leadership challenge in 2019.','Conservative Party leadership challenge',2019,BX,'high'),
 E(None,'article','But like Mrs Thatcher, she is likely to lose. The front-runner to take over is Sajid Javid, home secretary and son of a Pakistani-born bus driver.','Theresa May successor',2019,BX,'medium'),
 E(None,'article','The headline will write itself in 2019 when, based on estimates by the International Tele­communication Union (ITU), a un agency, more than 50% of humanity will have access to the internet.','Half the world online',2019,HO,'high',metric='share of world population online (ITU)',value='50',unit='%'),
 E(None,'article','America’s Federal Reserve, having raised its main borrowing rate several times in 2018, will do so again in 2019.','Federal Reserve rate rise in 2019',2019,EX,'high'),
 E(None,'article','the country’s budget deficit will approach 6% of GDP in 2019','US federal budget deficit',2019,EX,'high',metric='US budget deficit',value='6 (approaching)',unit='% of GDP'),
 E(None,'article','India’s consumers are doing just the opposite: they will push GDP growth to 7.6%, the best of any big economy.','India GDP growth 2019',2019,EX,'high',metric='India real GDP growth',value='7.6',unit='%'),
 E(None,'article','Any American recession, in any case, won’t begin until the back end of the year, as the fractures in the economy widen.','US recession timing',2019,EX,'medium'),
 E(None,'recalled_in_self_review','An early contender for gold was the prediction that a couple of big European banks would merge.','European bank merger',2019,RV,'medium',note='Restated in the self-review; original wording not seen.'),
 ],notes="Edition number 33 per the press release, which fits a first edition in 1987. Entries of kind 'press_release' quote the editor's takeaways as the press release lists them. The Britain article is by the Britain editor; the self-review says 'Our Britain editor ... predicted no one would be happy with Brexit'."))
