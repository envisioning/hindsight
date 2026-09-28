from lib import *
L='https://worldin.economist.com/edition/2018/article/14386/world-2018'
PR='https://www.prnewswire.com/news-releases/the-world-in-2018-from-the-economist-highlights-key-global-themes-to-watch-for-next-year-300558659.html'
write(dict(edition='2018',published='2017-11-20',status='partial',publisher='The Economist',series='The World in 2018',editor='Daniel Franklin',edition_number=32,
 sources=[PR,L,'https://web.archive.org/web/20221215175845/'+L],
 publicly_readable="The launch press release (2017-11-20), which lists twelve global themes, and the editor's introduction in full (worldin.economist.com, Internet Archive snapshot).",
 not_readable="The body text of the articles (paywalled; worldin.economist.com edition-2018 pages not read).",
 entries=[
 E(2,'press_release',"In America, the Democrats could triumph in a close contest for the House of Representatives, opening the way for the possible impeachment of Donald Trump .",'US midterm elections 2018 (House)',2018,PR,'medium',note='Hedged ("could").'),
 E(3,'press_release','Russia will stage the FIFA World Cup at a sensitive time in the country\'s relations with the West and shortly after an election that will give Vladimir Putin another term as president.','Russian presidential election 2018',2018,PR,'high'),
 E(4,'press_release',"Japan's Emperor Akihito prepares to bow out, Cuba's President Raúl Castro steps down, Saudi's King Salman may abdicate.",'Leadership changes in Japan, Cuba and Saudi Arabia',2018,PR,'medium',note='Akihito abdicated 2019-04-30 (announced for then); the Salman clause is hedged ("may").'),
 E(4,'press_release','But many leaders who have overstayed their welcome (such as Nicolás Maduro in Venezuela ) will try to cling to office.','Maduro stays in office',2018,PR,'medium'),
 E(6,'press_release','the chances of a no-deal Brexit are high.','No-deal Brexit',2018,PR,'medium',note='Refers to the March 2019 departure date.'),
 E(9,'press_release','Bhutan is forecast to top the league in economic growth; China could overtake Italy to be number one in terms of UNESCO-listed world-heritage sites; and India plans to complete the world\'s tallest statue','Fastest-growing economy; world heritage sites; tallest statue',2018,PR,'medium'),
 E(10,'press_release','sport utility vehicles and their close cousins overtaking all other types in sales of new vehicles','SUVs largest share of new-vehicle sales',2018,PR,'medium'),
 E(10,'press_release',"the rise of private space ventures reflected most dramatically in SpaceX's plan to send tourists around the Moon",'SpaceX lunar tourist flight',2018,PR,'low',note='Describes a plan, not a firm prediction.'),
 E(11,'press_release',"The most important landmark will be the approval of the world's first RNA interference drug, heralding the arrival of a new class of drug.",'First RNAi drug approval',2018,PR,'high'),
 E(11,'press_release','With luck, too, an old era will end, with the final eradication of polio.','Polio eradication',2018,PR,'low',note='Hedged ("with luck").'),
 E(5,'press_release','the world economy tends to tip into a recession every eight to ten years, and the last one ended in 2009.','Global recession timing',2018,PR,'low',note='Context for the statement that 2018 "may in fact be approaching the end" of the recovery; no firm date.'),
 E(None,'editor_letter','India will be the fastest-growing big economy. China will not be far behind.','Fastest-growing big economy',2018,L,'high'),
 E(None,'editor_letter','But it would be a surprise if the presidential election scheduled to take place in Venezuela is allowed to threaten the position of the country’s dictator, Nicolás Maduro.','Venezuelan presidential election 2018',2018,L,'high'),
 E(None,'editor_letter','In 2018 his brother Raúl will retire as president.','Raúl Castro retires as Cuban president',2018,L,'high'),
 E(None,'editor_letter','Or else they might head to Canada or California, both of which will legalise recreational marijuana.','Recreational cannabis legal in Canada and California',2018,L,'high'),
 E(None,'editor_letter','Mary Poppins will return to screens at the end of 2018','Mary Poppins Returns release',2018,L,'low',note='Scheduled release.'),
 ],notes="Edition number 32 per the press release, which fits a first edition in 1987. "))
