from lib import *
def C(says,quote,subject,note=None):
    d=dict(economist_says=says,quote=quote,subject=subject)
    if note: d['note']=note
    return d
R=[]
R.append(dict(reviews_edition='2019',review_title='Hindsight on foresight',published_in='The World in 2020',published='2019-11',
 source_url='https://worldin.economist.com/edition/2020/article/17378/forecasting-hits-and-misses-2019',
 snapshot='https://web.archive.org/web/20200305060024/https://worldin.economist.com/edition/2020/article/17378/forecasting-hits-and-misses-2019',readable='full',
 claims=[
 C('right','he offered three catastrophe scenarios which could flow from the country’s chaos and paralysis: a no-deal Brexit, a divisive second referendum, or a lurch to a far-left government.','Brexit scenarios',note='The review calls these "so far, so prescient".'),
 C('wrong','Yet our central scenario—that Britain would leave the European Union as planned on March 31st—proved to be wrong.','Brexit date',note='The original article said March 29th.'),
 C('right','we rightly expected America to break its record for uninterrupted growth but amid gathering nervousness about the next recession.','US economic expansion record'),
 C('wrong','We thought India’s growth would accelerate; it did the opposite.','India GDP growth'),
 C('partly','An early contender for gold was the prediction that a couple of big European banks would merge.','European bank merger',note='The review says the banks announced talks but no merger happened, and awards it "bronze".'),
 C('right','the foretelling of the ­developing rivalry between China and America, with its “great wall of distrust” spreading well beyond trade, proved uncannily accurate.','US-China rivalry'),
 C('right','And gold? This judge awards it to the prediction that 2019 would be the “year of the vegan”.','Veganism'),
 C('wrong','Missing from the list were important shocks such as mass protests in Hong Kong or a major attack on Saudi Arabia’s oil facilities.','Unforeseen events 2019'),
 ]))
R.append(dict(reviews_edition='2020',review_title='Ahem…about last year',published_in='The World in 2021',published='2020-11-17',
 source_url='https://www.economist.com/the-world-ahead/2020/11/17/ahemhow-did-our-forecasts-for-2020-pan-out',
 snapshot='https://web.archive.org/web/20231227090528/https://www.economist.com/the-world-ahead/2020/11/17/ahemhow-did-our-forecasts-for-2020-pan-out',readable='full',
 claims=[
 C('wrong','Like almost everyone else, we were blindsided by the outbreak of covid-19','Covid-19 pandemic'),
 C('partly','We expected a global slowdown, but not the biggest economic contraction since the Depression.','Global economy 2020'),
 C('right','Donald Trump was, as expected, impeached but not convicted by the Senate.','Trump impeachment'),
 C('right','Tsai Ing-wen won re-election as president of Taiwan.','Taiwan presidential election 2020'),
 C('right','Sir Keir Starmer, whom we tipped as “a dark horse to watch” in the aftermath of Britain’s general election, became leader of the country\'s opposition Labour Party after its defeat.','UK Labour leadership'),
 C('right','TikTok ended up embroiled in a row between the superpowers, in line with our prediction that more Chinese tech firms, beyond Huawei, would find themselves caught up in such fights.','Chinese tech firms in US-China fights'),
 C('wrong','Mostly, however, we got things wrong.','Overall 2020 record'),
 ]))
R.append(dict(reviews_edition='2021',review_title='20/21 vision',published_in='The World Ahead 2022',published='2021-11-08',
 source_url='https://www.economist.com/the-world-ahead/2021/11/08/how-the-economists-predictions-for-2021-stacked-up',
 snapshot='https://web.archive.org/web/20230726092033/https://www.economist.com/the-world-ahead/2021/11/08/how-the-economists-predictions-for-2021-stacked-up',readable='full',
 claims=[
 C('right','As expected, there were fights between and within countries about access to vaccines.','Vaccine access disputes'),
 C('partly','But we failed to foresee just how widespread vaccine refusal would become','Vaccine refusal'),
 C('wrong','Nor did we anticipate the significance of coronavirus “variants”—a word that did not appear in The World in 2021.','Covid variants'),
 C('right','In politics, we were right that Donald Trump kept the Republicans in his thrall, and continued to undermine faith in America’s electoral processes.','Trump and the Republican Party'),
 C('partly','We thought Japan might get a new prime minister, but did not tip Kishida Fumio as a contender.','Japanese prime minister change'),
 C('wrong','We were wrong to suggest demand for oil would stay depressed.','Oil demand'),
 C('partly','Though we thought the Taliban had “a good chance of returning to power” in Afghanistan, we expected it to be the result of a political deal, not a military clean-sweep.','Taliban return to power'),
 C('wrong','And we were shocked by Xi Jinping’s brutal clampdown on tech companies.','China tech crackdown'),
 ]))
R.append(dict(reviews_edition='2022',review_title='Reality check',published_in='The World Ahead 2023',published='2022-11-18',
 source_url='https://www.economist.com/the-world-ahead/2022/11/18/how-the-economists-predictions-for-2022-stacked-up',
 snapshot='https://web.archive.org/web/20221118100608/https://www.economist.com/the-world-ahead/2022/11/18/how-the-economists-predictions-for-2022-stacked-up',readable='full',
 claims=[
 C('wrong','We foresaw a growing conflict between autocracy and democracy, but did not expect that conflict to manifest as a shooting war in Europe','Russian invasion of Ukraine'),
 C('wrong','That put paid to the widely held view that the surge in inflation in late 2021 would prove to be transitory—a view we could, in retrospect, have been more sceptical about.','Inflation 2022'),
 C('right','As expected, China’s zero-covid policy hampered growth, but Xi Jinping refused to change course.','China zero-covid policy'),
 C('right','We correctly predicted Emmanuel Macron’s win in France and Jair Bolsonaro’s loss in Brazil, that “Bongbong” Marcos would prevail in the Philippines, and that the MPLA would hold on in Angola.','Elections in France, Brazil, Philippines and Angola'),
 C('right','We also featured Giorgia Meloni as a person to watch, noting that she had “a fighting chance of becoming Italy’s first female prime minister”, as indeed she did after elections in September.','Giorgia Meloni'),
 C('right','Our observation that Britain was particularly vulnerable to stagflation was spot on.','UK stagflation'),
 C('right','So too was our suggestion that Boris Johnson had more to fear from his own backbench MPs than from the opposition Labour Party; they duly ejected him in July.','Boris Johnson removal'),
 C('right','we were right to suggest that Queen Elizabeth II’s platinum jubilee celebrations in June would be the last great spectacle of her reign.','Queen Elizabeth II platinum jubilee'),
 C('right','Farther away in space, nasa smashed its dart probe into a small asteroid as expected','NASA DART asteroid impact'),
 ]))
R.append(dict(reviews_edition='2023',review_title='How we did in 2023',published_in='The World Ahead 2024',published='2023-11-13',
 source_url='https://www.economist.com/the-world-ahead/2023/11/13/how-we-did-with-last-years-predictions',
 snapshot='https://web.archive.org/web/20231114082718/https://www.economist.com/the-world-ahead/2023/11/13/how-we-did-with-last-years-predictions',readable='full',
 claims=[
 C('wrong','The main thing we got wrong in The World Ahead 2023 was being too gloomy about Western economies, predicting a brief recession in America, a deep one in the EU and a long one in Britain during 2023.','Recessions in America, EU and Britain'),
 C('wrong','China’s abrupt dropping of its zero-covid rules in December 2022 also caught us out.','China zero-covid policy'),
 C('wrong','Nor did we predict October’s surprise attack on Israel by Hamas.','Hamas attack on Israel'),
 C('right','The war in Ukraine did indeed become a grinding stalemate','War in Ukraine outcome'),
 C('right','American politics settled into a Biden-Trump rematch, the BRICS signed up new members, arguments over “ESG” investments intensified and YIMBYs gained ground, all as we expected.','Biden-Trump rematch, BRICS expansion, ESG, YIMBYs'),
 C('right','we said Recep Tayyip Erdogan would probably win in Turkey, and Peter Obi would probably lose in Nigeria, much as we might wish otherwise. Sadly we were right on both counts.','Turkish and Nigerian presidential elections'),
 C('right','We noted that tensions between Sudan’s president and vice-president “could spell trouble”—and in fact a civil war broke out in April.','Sudan internal conflict'),
 C('right','In technology, as anticipated, Apple revealed its mixed-reality headset, the Vision Pro','Apple mixed-reality headset launch'),
 C('wrong','We did not, however, foresee the “iPhone moment” for artificial intelligence (AI), namely the launch of ChatGPT in late November 2022','ChatGPT launch'),
 ]))
R.append(dict(reviews_edition='2024',review_title='How we did in 2024',published_in='The World Ahead 2025',published='2024-11-20',
 source_url='https://www.economist.com/the-world-ahead/2024/11/20/how-did-our-predictions-stack-up-in-2024',
 snapshot='https://web.archive.org/web/20241128164907/https://www.economist.com/the-world-ahead/2024/11/20/how-did-our-predictions-stack-up-in-2024',readable='first paragraph and standfirst only; rest paywalled',
 claims=[
 C('wrong','We anticipated none of these extraordinary events.','Biden withdrawal, Trump assassination attempts, Ukraine incursion into Russia, death of Iran\'s president'),
 C('wrong','And we expected America’s election to be a coin-toss—and failed to foresee the scale of Donald Trump’s decisive victory.','US presidential election 2024',note='The 2024 editor\'s letter gave Trump "a one-in-three chance".'),
 C('right','But several other predictions proved accurate','Other 2024 predictions',note='From the standfirst; the list is paywalled.'),
 ]))

W='https://worldin.economist.com/edition/2016/article/12067/world-2009-about-2008-sorry'
R.insert(0,dict(reviews_edition='2008',review_title='About 2008: sorry',published_in='The World in 2009',published='2008-11',
 source_url=W,snapshot='https://web.archive.org/web/20221215175845/'+W,readable='full (as reprinted on worldin.economist.com in 2015)',
 claims=[
 C('wrong','The World in 2008 failed to predict any of this.','Global financial crisis 2008'),
 C('wrong','We also failed to foresee Russia\'s invasion of Georgia','Russian invasion of Georgia'),
 C('wrong','We said the OPEC cartel would aim to keep oil prices in the lofty range of $60-80 a barrel (the price peaked at $147 in July).','Oil price 2008'),
 C('wrong','We thought that Romano Prodi would probably see out the year as prime minister of Italy','Italian prime minister'),
 C('wrong','that Canada would pull its troops out of Afghanistan\'s Kandahar province (it didn\'t)','Canadian troops in Kandahar'),
 C('wrong','that Ken Livingstone would be re-elected as mayor of London (he was defeated by his Conservative rival, Boris Johnson)','London mayoral election 2008'),
 C('wrong','Oh, and we expected that by now Hillary Clinton would be heading for the White House.','US presidential election 2008'),
 C('right','In America, we expected slumping house prices and a battle to resist recession through government spending, interest-rate cuts and surging exports','US economy 2008'),
 C('right','In Asia, we highlighted the froth of the Shanghai Stock Exchange—which fell by two-thirds over the next 12 months.','Shanghai stockmarket'),
 C('right','In politics, as expected, José Luis Rodríguez Zapatero won a second term in Spain.','Spanish general election 2008'),
 C('right','Vladimir Putin duly retained real power in Russia despite stepping down from the presidency.','Putin retains power'),
 C('right','And, as we suggested might happen, the Kuomintang\'s victory in Taiwan\'s presidential election opened the way for a resumption of direct flights to and from mainland China.','Taiwan election and cross-strait flights'),
 C('right','And we forecast that China would for the first time overtake the United States in the gold-medal table, with Russia in third place.','Beijing Olympics gold-medal table'),
 C('partly','We missed 2008\'s extreme financial panic, but expected banks like JPMorgan Chase to expand by acquiring stricken competitors','Bank acquisitions'),
 ]))
F='https://worldin.economist.com/edition/2016/article/12064/world-2006-looking-back-future'
R.insert(0,dict(reviews_edition='1987-2005',review_title='Looking back on the future',published_in='The World in 2006',published='2005-11',
 source_url=F,snapshot='https://web.archive.org/web/20221215175845/'+F,readable='full (as reprinted on worldin.economist.com in 2015)',
 reviewer='Niall Ferguson (historian commissioned by the editor; named as author in the World in 2016 index page)',
 note='A review of the first 20 editions, commissioned by the editor from an outside historian and published in the issue. It also says The World in 2005 "broke with tradition by admitting that a few of its predictions for 2004 had not come true"; that 2005 review was not found in public form.',
 claims=[
 C('wrong','Only one contributor was badly wide of the mark: he predicted that Nomura Securities would take over Merrill Lynch.','Japanese takeover of a Wall Street firm (1987)'),
 C('wrong','The obvious political omission was the dramatic collapse of Communist rule in eastern Europe in 1989, which (like so many analysts) TWI did not manage to predict.','Collapse of communism 1989'),
 C('wrong','The Japanese stockmarket crash of 1990 was a bolt from the blue; also unheralded was the 1994-95 Mexican crisis. No one foresaw the Asian crisis of 1997','Financial crises 1990-1998'),
 C('wrong','There was supposed to be a Bush senior election victory in 1992 (Bill Clinton was not even mentioned before becoming president).','US presidential election 1992'),
 C('wrong','And a Middle East peace settlement was foreseen in 1996, as was the failure of the planned European Monetary Union','Middle East peace 1996; European Monetary Union'),
 C('wrong','Other notably bad calls include a Red Sox victory in the World Series (in 1996), a “bloody mess” when Hong Kong was returned to China (in 1997), an “Islamic Reformation” in the Middle East (in 2000), a property-market crash (in 2003) and a sustained Japanese economic recovery (in almost every year since 1990).','Assorted misses 1996-2003'),
 C('wrong','Here the laurels unquestionably belong to Fidel Castro, whose fall from power TWI consistently and vainly predicted in the aftermath of the 1989 revolutions','Fall of Fidel Castro'),
 C('right','The World in 1988 foresaw major changes in central Europe, especially in East Germany—a year out, but pretty close.','Change in central Europe (1988)'),
 C('right','Anthony King called the 1992 British election correctly as a Tory victory—when most media folk favoured Labour.','UK general election 1992'),
 C('right','George Bush junior was identified early (1998) as the next president','US presidential election 2000'),
 C('right','TWI confidently predicted Saddam Hussein\'s fall in 2003 (though it had done the same ten years before). And The World in 2004 got Mr Bush\'s re-election dead right too.','Fall of Saddam Hussein 2003; US election 2004'),
 ]))
c=corpus()
for r in R:
    for x in r['claims']:
        assert len(x['quote'])<=400
        if nz(x['quote']) not in nz(c): print('NOT VERBATIM',x['quote'][:80])
d=dict(publisher='The Economist',series='The World in / The World Ahead',note="The Economist's own reviews of its previous edition's predictions. economist_says records the publisher's claim (right / wrong / partly), not a Hindsight grade. Quotes are from the review articles.",reviews=R)
json.dump(d,open(OUT+'self_assessment.json','w'),ensure_ascii=False,indent=2); open(OUT+'self_assessment.json','a').write('\n')
print('reviews',len(R),sum(len(r['claims']) for r in R))
