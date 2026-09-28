from lib import *
PR='https://www.prnewswire.com/news-releases/its-judgment-time-according-to-the-economists-the-world-in-2020-300962898.html'
L='https://worldin.economist.com/edition/2020/article/17308/world-2020'
RC='https://www.economist.com/the-world-in/2019/12/27/dont-bet-on-a-recession-in-2020'
RV='https://www.economist.com/the-world-ahead/2020/11/17/ahemhow-did-our-forecasts-for-2020-pan-out'
write(dict(edition='2020',published='2019-11-21',status='partial',publisher='The Economist',series='The World in 2020',editor='Daniel Franklin',edition_number=34,
 sources=[PR,L,'https://web.archive.org/web/20221215175845/'+L,RV,'https://web.archive.org/web/20231227090528/'+RV,RC,'https://web.archive.org/web/20191228003919/'+RC],
 publicly_readable="The launch press release (2019-11-21) and the editor's introduction (worldin.economist.com, Internet Archive snapshot), which list the same twelve themes. One article that was metered-free at publication (markets, 'Don't bet on a recession in 2020'). The self-review 'Ahem…about last year' in The World in 2021.",
 not_readable="The body text of the articles (paywalled).",
 entries=[
 E(1,'press_release',"That's doubly true for President Donald Trump : first in Congress with the Democrats' drive to remove him from office (the Republican-controlled Senate will save him), then in a febrile election in November.",'Trump impeachment and Senate acquittal',2020,PR,'high'),
 E(1,'press_release',"It will be ugly; the artificial intelligence we consulted reckons Mr Trump will lose.",'US presidential election 2020',2020,PR,'low',note='The forecast is attributed to an AI program (GPT-2) the edition "interviewed", not to The Economist.'),
 E(1,'press_release',"Britons, meanwhile, probably will get a chance to pass judgment on Boris Johnson .",'UK general election',2020,PR,'low',note='The election took place on 2019-12-12, three weeks after publication. Hedged ("probably").'),
 E(2,'press_release',"Banks, especially in Europe , will battle with negative interest rates. America will flirt with recession—but don't be surprised if disaster fails to strike, and markets revive.",'US recession',2020,PR,'medium'),
 E(3,'press_release','It will claim to have met its target of achieving "moderate prosperity" by 2020.','China "moderate prosperity" target',2020,PR,'high'),
 E(4,'press_release','The Tokyo Olympics will draw a huge global audience. The Euro 2020 football championship will be spread across 12 countries.','Tokyo Olympics and Euro 2020 held in 2020',2020,PR,'high',note='Scheduled events.'),
 E(5,'press_release','The five-yearly review of the Nuclear Non-Proliferation Treaty will be a fraught affair','NPT review conference',2020,PR,'medium',note='Scheduled event.'),
 E(6,'press_release','In Glasgow they will make pledges on carbon emissions.','COP26 Glasgow',2020,PR,'high',note='Scheduled event.'),
 E(8,'press_release','America, Europe , China and the uae all plan missions.','Mars missions launched in 2020',2020,PR,'high'),
 E(10,'press_release',"But James Bond fans will head to old-fashioned cinemas for the 25th film in the franchise.",'James Bond film release',2020,PR,'high',note='Scheduled release.'),
 E(11,'press_release','For the first time, the world will have more people aged over 30 than under.','World median age above 30',2020,PR,'high',metric='world population aged over 30',value='more than half',unit=None),
 E(None,'article','As recession fears build to a peak, stock prices will come under greater pressure. Long-term bond yields will fall further in America and plunge deeper into negative territory in Europe.','Stock prices and long-term bond yields',2020,RC,'medium'),
 E(None,'article','But interest-rate cuts in America and China, and bond purchases by the European Central Bank, will at least keep credit flowing smoothly to businesses and consumers.','US and China rate cuts; ECB bond purchases',2020,RC,'high'),
 E(None,'article','As investors start to price in aggressive fiscal stimulus, stock prices will revive and bond yields will start to rise.','Market recovery by end-2020',2020,RC,'medium'),
 E(None,'recalled_in_self_review','Tsai Ing-wen won re-election as president of Taiwan.','Taiwan presidential election 2020',2020,RV,'medium',note='The self-review lists this among things "we got right"; original wording not seen.'),
 E(None,'recalled_in_self_review','Sir Keir Starmer, whom we tipped as “a dark horse to watch” in the aftermath of Britain’s general election','UK Labour leadership',2020,RV,'low',note='"Dark horse to watch" is quoted from the original; not a firm prediction.'),
 E(None,'recalled_in_self_review','in line with our prediction that more Chinese tech firms, beyond Huawei, would find themselves caught up in such fights.','Chinese tech firms in US-China fights',2020,RV,'medium',note='Restated in the self-review.'),
 ],notes="Edition number 34 per the press release. The press release says Daniel Franklin stepped down as editor after 17 years with this edition and Tom Standage took over. The press-release text has spaces before some punctuation, kept as published. Several scheduled events (Olympics, Euro 2020, COP26, Bond film) were postponed by covid-19."))
