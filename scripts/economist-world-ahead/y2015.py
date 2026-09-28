from lib import *
PR='https://www.prnewswire.com/news-releases/the-world-in-2015-the-29th-edition-of-the-economists-annual-compilation-of-predictions-for-the-year-ahead-is-now-available-on-newsstands-and-on-the-world-in-2015-app-283296281.html'
write(dict(edition='2015',published='2014-11-20',status='partial',publisher='The Economist',series='The World in 2015',editor='Daniel Franklin',edition_number=29,
 sources=[PR],
 publicly_readable="The launch press release (2014-11-20), a one-paragraph summary of the issue.",
 not_readable="The editor's introduction, the articles, the forecasts for 81 countries and 14 industries, and the 'report card on what The Economist got right and wrong in 2014' (all paywalled or not archived).",
 entries=[
 E(None,'press_release',"Federal Reserve rate rises, the troubles of the euro zone's laggards and worries about Chinese growth all have the potential to cause periods of panic.",'Federal Reserve rate rises',2015,PR,'low',note='Treats Fed rate rises in 2015 as given; the prediction is about panic risk.'),
 E(None,'press_release','The world economy should grow a bit faster than it did in 2014, led by America.','World GDP growth 2015 vs 2014',2015,PR,'high'),
 E(None,'press_release','A trans-Pacific free-trade deal is within reach.','Trans-Pacific Partnership agreement',2015,PR,'medium'),
 E(None,'press_release',"So is a peace agreement between Colombia's government and the FARC guerrillas; with luck, that will end more than half a century of fighting.",'Colombia-FARC peace agreement',2015,PR,'medium'),
 E(None,'press_release',"And, after travelling for nine years and across 3 billion miles, NASA's New Horizons spacecraft will reach Pluto in July.",'New Horizons Pluto flyby',2015,PR,'high',note='Scheduled event.'),
 ],notes="Edition number 29 per the press release, which fits a first edition in 1987. The issue contained a self-review of 2014 predictions; it was not found in public form."))
