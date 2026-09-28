from lib import *
U25='https://www.economist.com/the-world-ahead/2024/11/18/tom-standages-ten-trends-to-watch-in-2025'
R25='https://www.economist.com/the-world-ahead/2025/10/27/a-look-back-over-the-first-40-years-of-the-world-ahead'
write(dict(edition='2025',published='2024-11-18',status='partial',publisher='The Economist',series='The World Ahead 2025',editor='Tom Standage',edition_number=39,
 sources=[U25,'https://web.archive.org/web/20241120230740/'+U25],
 publicly_readable="The editor's letter (ten trends) in full, via an Internet Archive snapshot taken two days after publication.",
 not_readable="The body text of the other articles (paywalled), the 'Wild cards' section, 'Trendlines' and the forecast tables. The self-review of 2025 predictions, if The Economist published one in The World Ahead 2026, was not found in public form.",
 entries=[
 E(3,'editor_letter','Mr Trump may push Ukraine to do a deal with Russia and give Israel a free hand in its conflicts in Gaza and Lebanon.','Ukraine-Russia deal under US pressure',2025,U25,'low',note='Hedged ("may").'),
 E(4,'editor_letter','For now, America’s rivalry with China will manifest itself as a trade war, as Mr Trump imposes restrictions and ramps up tariffs—including on America’s allies.','US tariffs on China and allies',2025,U25,'high'),
 E(6,'editor_letter','In America, Mr Trump’s policies will make things worse: hefty import tariffs could hamper growth and reignite inflation.','US inflation after tariffs',2025,U25,'low',note='Hedged ("could").'),
 E(9,'editor_letter','The backlash against “overtourism” will diminish in 2025, but restrictions introduced by many cities, from Amsterdam to Venice, will remain.','Overtourism backlash and city restrictions',2025,U25,'medium'),
 ],notes="The letter is mostly themes. The 2025 edition is the 39th (counting back from the 40th in 2026)."))
U24='https://www.economist.com/the-world-ahead/2023/11/06/tom-standages-ten-trends-to-watch-in-2024'
RV24='https://www.economist.com/the-world-ahead/2024/11/20/how-did-our-predictions-stack-up-in-2024'
write(dict(edition='2024',published='2023-11-06',status='partial',publisher='The Economist',series='The World Ahead 2024',editor='Tom Standage',edition_number=38,
 sources=[U24,'https://web.archive.org/web/20231114094006/'+U24,RV24,'https://web.archive.org/web/20241128164907/'+RV24],
 publicly_readable="The editor's letter (ten themes) in full. The first paragraph of the self-review published in The World Ahead 2025.",
 not_readable="The body text of the other articles (paywalled), 'Trendlines' and the forecast tables. The rest of the self-review of 2024 predictions.",
 entries=[
 E(1,'editor_letter','There will be more than 70 elections in 2024 in countries that are home to around 4.2bn people—for the first time, more than half of the global population.','Number of national elections in 2024',2024,U24,'medium',metric='population of countries holding elections',value='4.2',unit='bn people',note='Mostly scheduled events; the count is more than 70.'),
 E(2,'editor_letter','Voters, and the courts, will give their verdicts on Donald Trump, who has a one-in-three chance of regaining the presidency.','US presidential election 2024',2024,U24,'high',metric='probability Trump wins the presidency',value='33',unit='%',note='Probabilistic. The 2024 self-review says the edition expected the election "to be a coin-toss".'),
 E(8,'editor_letter','China may fall into deflation.','China deflation',2024,U24,'low',note='Hedged ("may").'),
 E(10,'editor_letter','Perhaps ideological differences will be put aside as the world enjoys the Paris Olympics, astronauts (maybe) looping around the Moon, and the men’s t20 cricket World Cup.','Crewed lunar flyby (Artemis II)',2024,U24,'low',note='Hedged ("maybe").'),
 ],notes="The letter is mostly themes. Only statements about a specific outcome in 2024 are captured."))
U23='https://www.economist.com/the-world-ahead/2022/11/14/ten-trends-to-watch-in-the-coming-year'
RV23='https://www.economist.com/the-world-ahead/2023/11/13/how-we-did-with-last-years-predictions'
write(dict(edition='2023',published='2022-11-14',status='partial',publisher='The Economist',series='The World Ahead 2023',editor='Tom Standage',edition_number=37,
 sources=[U23,'https://web.archive.org/web/20221114204954/'+U23,RV23,'https://web.archive.org/web/20231114082718/'+RV23],
 publicly_readable="The editor's letter (ten themes) in full. The full self-review published in The World Ahead 2024, which restates several predictions from articles that are otherwise paywalled.",
 not_readable="The body text of the other articles (paywalled), the 'Understand This' section and the forecast tables.",
 entries=[
 E(1,'editor_letter','Rapid progress by Ukraine could threaten Vladimir Putin, but a grinding stalemate seems the most likely outcome.','War in Ukraine outcome',2023,U23,'high'),
 E(2,'editor_letter','Major economies will go into recession as central banks raise interest rates to stifle inflation','Recession in major economies',2023,U23,'high'),
 E(2,'editor_letter','America’s recession should be relatively mild; Europe’s will be more brutal.','US and European recessions',2023,U23,'high'),
 E(4,'editor_letter','Some time in April China’s population will be overtaken by India’s, at around 1.43bn.','India overtakes China in population',2023,U23,'high',metric='population at crossover',value='1.43',unit='bn people'),
 E(7,'editor_letter','NATO, revitalised by the war in Ukraine, will welcome two new members.','NATO enlargement (Finland, Sweden)',2023,U23,'high',metric='new NATO members',value='2',unit='countries'),
 E(8,'editor_letter','traveller spending will almost regain its 2019 level of $1.4trn, but only because inflation has pushed up prices.','International tourism spending',2023,U23,'high',metric='international traveller spending',value='1.4',unit='trn USD (almost regained)'),
 E(8,'editor_letter','The actual number of international tourist trips, at 1.6bn, will still be below the pre-pandemic level of 1.8bn in 2019.','International tourist trips',2023,U23,'high',metric='international tourist trips',value='1.6',unit='bn'),
 E(9,'editor_letter','2023 will provide some answers as Apple launches its first headset','Apple mixed-reality headset launch',2023,U23,'high'),
 E(None,'recalled_in_self_review','predicting a brief recession in America, a deep one in the EU and a long one in Britain during 2023.','Recessions in America, EU and Britain',2023,RV23,'medium',note='Restated by The Economist in its self-review; the original article text is paywalled.'),
 E(None,'recalled_in_self_review','we said Recep Tayyip Erdogan would probably win in Turkey, and Peter Obi would probably lose in Nigeria','Turkish and Nigerian presidential elections',2023,RV23,'medium',note='Restated in the self-review; original wording not seen.'),
 E(None,'recalled_in_self_review','We noted that tensions between Sudan’s president and vice-president “could spell trouble”','Sudan internal conflict',2023,RV23,'low',note='Restated in the self-review; hedged.'),
 E(None,'recalled_in_self_review','We had expected some loosening during 2023, but not a total reversal of the policy','China zero-covid policy',2023,RV23,'medium',note='Restated in the self-review.'),
 ],notes="Entries of kind 'recalled_in_self_review' are predictions as The Economist later restated them, not the original wording."))
U22='https://www.economist.com/the-world-ahead/2021/11/08/ten-trends-to-watch-in-the-coming-year'
RV22='https://www.economist.com/the-world-ahead/2022/11/18/how-the-economists-predictions-for-2022-stacked-up'
write(dict(edition='2022',published='2021-11-08',status='partial',publisher='The Economist',series='The World Ahead 2022',editor='Tom Standage',edition_number=36,
 sources=[U22,'https://web.archive.org/web/20211108211549/'+U22,RV22,'https://web.archive.org/web/20221118100608/'+RV22],
 publicly_readable="The editor's letter (ten trends) in full. The full self-review published in The World Ahead 2023.",
 not_readable="The body text of the other articles (paywalled), including the '22 emerging technologies' section and the forecast tables.",
 entries=[
 E(3,'editor_letter','Britain is at particular risk of stagflation, due to post-Brexit labour shortages and its dependence on expensive natural gas.','UK stagflation',2022,U22,'medium',note='A risk statement.'),
 E(8,'editor_letter','Meanwhile, as much as half of business travel is gone for good.','Business travel recovery',2022,U22,'medium',metric='share of business travel permanently lost',value='up to 50',unit='%',note='No target year beyond "for good".'),
 E(9,'editor_letter','2022 will be the first year in which more people go to space as paying passengers than government employees, carried aloft by rival space-tourism firms.','Space tourism passengers vs government astronauts',2022,U22,'high'),
 E(9,'editor_letter','China will finish its new space station.','Tiangong space station completion',2022,U22,'high'),
 E(9,'editor_letter','And nasa will crash a space probe into an asteroid, in a real-life mission that sounds like a Hollywood film.','NASA DART asteroid impact',2022,U22,'high'),
 E(10,'editor_letter','Expect protests directed at both host countries, though boycotts by national teams seem unlikely.','Beijing Winter Olympics and Qatar World Cup boycotts',2022,U22,'high'),
 E(None,'recalled_in_self_review','We correctly predicted Emmanuel Macron’s win in France and Jair Bolsonaro’s loss in Brazil, that “Bongbong” Marcos would prevail in the Philippines, and that the MPLA would hold on in Angola.','Elections in France, Brazil, Philippines and Angola',2022,RV22,'medium',note='Restated in the self-review; original wording not seen.'),
 E(None,'recalled_in_self_review','noting that she had “a fighting chance of becoming Italy’s first female prime minister”','Giorgia Meloni becomes Italian prime minister',2022,RV22,'medium',note='Quoted from the original by the self-review.'),
 E(None,'recalled_in_self_review','our suggestion that Boris Johnson had more to fear from his own backbench MPs than from the opposition Labour Party','Boris Johnson removal',2022,RV22,'low',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','we were right to suggest that Queen Elizabeth II’s platinum jubilee celebrations in June would be the last great spectacle of her reign.','Queen Elizabeth II platinum jubilee',2022,RV22,'low',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','As expected, China’s zero-covid policy hampered growth, but Xi Jinping refused to change course.','China zero-covid policy',2022,RV22,'medium',note='Restated in the self-review.'),
 ],notes="The World in was renamed The World Ahead with this edition (stated in the editor's letter)."))
U21='https://www.economist.com/the-world-ahead/2020/11/16/ten-trends-to-watch-in-the-coming-year'
RV21='https://www.economist.com/the-world-ahead/2021/11/08/how-the-economists-predictions-for-2021-stacked-up'
write(dict(edition='2021',published='2020-11-16',status='partial',publisher='The Economist',series='The World in 2021',editor='Tom Standage',edition_number=35,
 sources=[U21,'https://web.archive.org/web/20201117120835/'+U21,RV21,'https://web.archive.org/web/20230726092033/'+RV21],
 publicly_readable="The editor's letter (ten trends) in full. The full self-review published in The World Ahead 2022.",
 not_readable="The body text of the other articles (paywalled), the 'Aftershocks' section and the forecast tables.",
 entries=[
 E(4,'editor_letter','Don’t expect Mr Biden to call off the trade war with China.','US-China trade war under Biden',2021,U21,'high'),
 E(7,'editor_letter','Tourism will shrink and change shape, with more emphasis on domestic travel.','International tourism',2021,U21,'medium'),
 E(9,'editor_letter','events including the Olympics, the Dubai Expo and many other political, sporting and commercial gatherings do their best to open a year later than planned. Not all will succeed.','Postponed 2020 events held in 2021',2021,U21,'low',note='Does not name which events will fail.'),
 E(None,'recalled_in_self_review','Though we thought the Taliban had “a good chance of returning to power” in Afghanistan, we expected it to be the result of a political deal, not a military clean-sweep.','Taliban return to power',2021,RV21,'medium',note='Quoted from the original by the self-review.'),
 E(None,'recalled_in_self_review','We thought Japan might get a new prime minister, but did not tip Kishida Fumio as a contender.','Japanese prime minister change',2021,RV21,'low',note='Restated in the self-review; hedged.'),
 E(None,'recalled_in_self_review','We were wrong to suggest demand for oil would stay depressed.','Oil demand',2021,RV21,'medium',note='Restated in the self-review.'),
 E(None,'recalled_in_self_review','We pointed to the risk of post-election violence.','US post-election violence',2021,RV21,'low',note='Restated in the self-review; a risk statement.'),
 ],notes="Last edition under the name The World in."))
