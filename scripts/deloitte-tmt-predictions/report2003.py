"""Append the 2003 report's 12 predictions to data/raw/deloitte-tmt-predictions/2003.json (D15:
the eight press-release rows stay; report rows are new rows).

Input: Deloitte Research, "Mobile Outlook for 2003: Predictions for the Mobile Sector in Europe from
Deloitte Research" (Deloitte Consulting, 4 pages, file title "MPredictions 2003", created 2002-12-16),
Internet Archive capture 20031204215942 of
http://www.deloitte.com/dtt/cda/doc/content/dtt_research_mobileoutlookeurope_070103.pdf
(found with the Wayback CDX API: url=deloitte.com/dtt/&matchType=prefix, filter original ~ mobile.?outlook).
The dc.com research page "Mobile Outlook for 2003" (capture 20030622090818 of
http://www.dc.com/Insights/research/communications/mobile_outlook_2003.asp) describes the same report
("12 things to watch for in 2003"); its download sat behind a registration.

Run once:  python3 report2003.py   (refuses to append twice)
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, '..', '..', 'data', 'raw', 'deloitte-tmt-predictions', '2003.json')
URL = 'https://web.archive.org/web/20031204215942/http://www.deloitte.com:80/dtt/cda/doc/content/dtt_research_mobileoutlookeurope_070103.pdf'
NOTE = "Read from the Internet Archive copy of the Deloitte Research PDF 'Mobile Outlook for 2003: Predictions for the Mobile Sector in Europe' (the 2003 report). Rank and title are the report's own number and headline."

# (rank, page, title, quote, metric, value, unit, subject, press-release row it restates)
ROWS = [
    (1, 2, 'Mobile data + process improvement = ROI.',
     '1. Mobile data + process improvement = ROI. The minority of companies that match mobile data implementation to business process analysis will earn high returns on investment and payback periods within two years or less.',
     'payback period of business mobile data projects', '<=2', 'years', 'Enterprise mobile applications', 1),
    (2, 2, 'Mobile data in business disappoints.',
     '2. Mobile data in business disappoints. ... Close to two thirds of businesses in Europe will have deployed mobile data at least at trial level by the end of 2003. But companies will make mistakes of adding to lap-tops, instead of choosing PDAs. Disappointing trials will halt further deployment of mobile data.',
     'share of European businesses with mobile data deployed at least at trial level', '~67', 'percent', 'Enterprise mobile data', '2 and 3'),
    (3, 2, '3G launches with a whimper, not a bang.',
     '3. 3G launches with a whimper, not a bang. Users will be confined in 2003 to early adopters and beta testers, and will number a few million at most in Europe. ... Only a few 3G handsets will be launched by the end of 2003.',
     '3G users in Europe', 'a few million at most', 'users', '3G mobile networks', None),
    (4, 3, 'Mobilising machines will be ignored.',
     '4. Mobilising machines will be ignored. The mobile industry will fail to develop the fledgling market for mobile embedded into machines.',
     None, None, None, 'Machine-to-machine communication', 8),
    (5, 3, 'SMS flourishes.',
     '5. SMS flourishes. SMS volumes will rise strongly in 2003, driven by business rather than consumer use. ... SMS revenues will also grow, boosted by premium SMS services. SMS volumes made by consumers will tail off as early adopter consumers migrate to instant messaging platforms running on GPRS.',
     None, None, None, 'SMS', 4),
    (6, 3, 'Slowly, slowly for mobile payments.',
     '6. Slowly, slowly for mobile payments. Operators will launch a mobile payment facility as pre-pay top-up from phones. Operators will also make it easier to transfer credit between phones. Limited trials will test the use of mobile phones for buying goods and services from machines via Bluetooth and infrared connections.',
     None, None, None, 'Mobile payments', 7),
    (7, 3, 'Mobile gaming makes serious money.',
     '7. Mobile gaming makes serious money. Phones with colour screens, GPRS and Java will propel the market for mobile games. ... The industry will overlook the opportunity to create multi player games, based either on connections over cellular or over Bluetooth.',
     None, None, None, 'Mobile gaming', 6),
    (8, 3, 'MMS is troubled - but ultimately pulls through.',
     '8. MMS is troubled - but ultimately pulls through. Interoperability between networks and MMS roaming will remain limited for the first half of the year. But the growth of MMS phones will drive the consumer take-up of MMS.',
     None, None, None, 'Multimedia messaging (MMS)', None),
    (9, 4, 'WAP rises from the ashes.',
     '9. WAP rises from the ashes. Colour, higher powered, new generation phones and improving GPRS coverage mean that content providers will develop compelling content specifically for mobile users.',
     None, None, None, 'WAP mobile internet', 5),
    (10, 4, 'Public WLAN will not threaten GPRS or 3G.',
     '10. Public WLAN will not threaten GPRS or 3G. Publicly offered WLAN will make little or no impact on the prospects for GPRS, or where this is available, 3G. ... there will be few WLAN hotspots in Europe.',
     None, None, None, 'Public Wi-Fi hotspots', None),
    (11, 4, 'Operators share to save.',
     '11. Operators share to save. Mobile operators, as part of their year long campaign to reduce capital expenditure, will increasingly look to network sharing to reduce costs. This will apply to both GSM and 3G networks.',
     None, None, None, 'Mobile network sharing', None),
    (12, 4, 'Data will drive revenue growth.',
     '12. Data will drive revenue growth. Voice revenues will remain stable, with price and quality unlikely to change significantly over the year. ... Thus data needs to be the main driver for growth.',
     None, None, None, 'Mobile data services', None),
]


def main():
    d = json.load(open(PATH))
    if any(e.get('source_url', '').startswith(URL) for e in d['entries']):
        raise SystemExit('report rows already appended')
    for rank, page, title, quote, metric, value, unit, subject, pr in ROWS:
        assert len(quote) <= 400, rank
        note = NOTE
        if pr:
            note += ' Press-release row(s) %s of this file (rows numbered in file order) restate this prediction.' % pr
        d['entries'].append({'rank': rank, 'section': 'Mobile', 'title': title, 'quote': quote, 'target_year': 2003,
                             'metric': metric, 'value': value, 'unit': unit, 'subject': subject,
                             'source_url': '%s#page=%d' % (URL, page), 'confidence': 'high', 'note': note})
    d['status'] = 'complete'
    d['found_count'] = 12
    d['sources'].append(URL)
    d['notes'] = ("2nd edition by Deloitte's count. Deloitte Research 'Mobile Outlook for 2003: Predictions for the Mobile Sector in Europe' "
                  "(Deloitte Consulting, 4 pages, file title 'MPredictions 2003', created 2002-12-16), twelve numbered predictions, all captured from the "
                  "Internet Archive copy of the PDF on deloitte.com/dtt (capture 2003-12-04). Published with Deloitte Consulting's press release of "
                  "9 January 2003 on dc.com ('Forecast: mobile rollercoaster to continue through 2003'). The first eight entries are press-release "
                  "statements captured before the report was found (confidence low, Hindsight's titles); they stay as captured (D15). The report entries "
                  "follow, with the report's numbers and headlines; each note names the press-release row it restates. Rank is the printed number.")
    json.dump(d, open(PATH, 'w'), indent=2, ensure_ascii=False)
    print('appended', len(ROWS))


if __name__ == '__main__':
    main()
