"""Edition registry: one edition per publication year. Each lists the two
FutureScapes in scope (Worldwide IT Industry, Worldwide CIO Agenda).
`cache` names the fetch.py cache file; None means no prediction list was found.
"""

IT = "Worldwide IT Industry"
CIO = "Worldwide CIO Agenda"


def toc(doc: str) -> list[str]:
    return [f"https://www.idc.com/getdoc.jsp?containerId={doc}", f"https://www.idc.com/research/viewtoc.jsp?containerId={doc}"]


EDITIONS = {
    "2025": {
        "published": "2025-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2026 Predictions", "idc_doc": "US53858725",
             "published": "2025-10-22", "status": "complete", "stated_count": 10, "confidence": "high",
             "cache": "US53858725",
             "entry_source": "https://www.idc.com/resource-center/blog/three-forces-shaping-the-future-of-it-leaderships/",
             "sources": ["https://www.idc.com/resource-center/blog/three-forces-shaping-the-future-of-it-leaderships/",
                         "https://my.idc.com/getdoc.jsp?containerId=US53858725"],
             "note": "The report is a slide presentation with no public table of contents. The ten predictions are read from IDC's own blog post (October 22, 2025), which numbers them 1 to 10."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2026 Predictions", "idc_doc": "US53865325",
             "published": "2025-10", "status": "missing", "stated_count": 10, "confidence": "high", "cache": None,
             "sources": ["https://my.idc.com/getdoc.jsp?containerId=US53865325",
                         "https://my.idc.com/getdoc.jsp?containerId=prUS53883425"],
             "note": "Slide presentation (39 slides); the abstract states 'top 10 predictions' but no public page lists them. IDC's umbrella FutureScape 2026 press release (October 23, 2025) quotes seven predictions without naming the FutureScape each comes from, so none is attributed here."},
        ],
        "notes": "IT Industry list complete; CIO Agenda list not public.",
    },
    "2024": {
        "published": "2024-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2025 Predictions", "idc_doc": "US51736824",
             "published": "2024-10-30", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US51736824",
             "sources": toc("US51736824") + ["https://www.silicon.co.uk/press-release/idc-unveils-2025-futurescapes-worldwide-it-industry-predictions"]},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2025 Predictions", "idc_doc": "US52641324",
             "published": "2024-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US52641324",
             "sources": toc("US52641324")},
        ],
    },
    "2023": {
        "published": "2023-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2024 Predictions", "idc_doc": "US50435423",
             "published": "2023-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US50435423",
             "sources": toc("US50435423")},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2024 Predictions", "idc_doc": "US51294523",
             "published": "2023-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US51294523",
             "sources": toc("US51294523")},
        ],
    },
    "2022": {
        "published": "2022-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2023 Predictions", "idc_doc": "US49563122",
             "published": "2022-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US49563122",
             "sources": toc("US49563122")},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2023 Predictions", "idc_doc": "US49743322",
             "published": "2022-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US49743322",
             "sources": toc("US49743322")},
        ],
    },
    "2021": {
        "published": "2021-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2022 Predictions", "idc_doc": "US48312921",
             "published": "2021-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US48312921",
             "sources": toc("US48312921")},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2022 Predictions", "idc_doc": "US48297821",
             "published": "2021-10-27", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US48297821",
             "sources": toc("US48297821") + ["https://www.businesswire.com/news/home/20211027005081/en/IDC-Unveils-Worldwide-CIO-Agenda-2022-Predictions"]},
        ],
    },
    "2020": {
        "published": "2020-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2021 Predictions", "idc_doc": "US46942020",
             "published": "2020-10-27", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US46942020",
             "sources": toc("US46942020") + ["https://www.businesswire.com/news/home/20201027005274/en/IDC-FutureScape-Highlights-What-Will-Happen-Next-as-Enterprises-and-the-IT-Industry-Respond-to-the-Disruptions-Caused-by-COVID-19"],
             "note": "Table of contents read from an Internet Archive copy."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2021 Predictions", "idc_doc": "US46010920",
             "published": "2020-10-28", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US46010920",
             "sources": toc("US46010920") + ["https://www.businesswire.com/news/home/20201028005135/en/IDC-Unveils-Worldwide-CIO-Agenda-2021-Predictions"],
             "note": "Table of contents read from an Internet Archive copy."},
        ],
        "notes": "IT Industry prediction 4 and CIO Agenda prediction 3 share the same sentence (pandemic technical debt, 70% of CIOs, through 2023).",
    },
    "2019": {
        "published": "2019-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2020 Predictions", "idc_doc": None,
             "published": "2019-10-29", "status": "complete", "stated_count": 10, "confidence": "medium", "cache": "IT2020deck",
             "sources": ["https://keyvatech.com/wp-content/uploads/2020/01/IDC-2020-Futures.pdf"],
             "note": "Read from IDC's webinar deck (Frank Gens, October 29, 2019), hosted by a third party. IDC document number not found; the report's table of contents was not located. Quotes are the full slide sentences; IDC's hashtag labels are kept in idc_label."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2020 Predictions", "idc_doc": "US45578619",
             "published": "2019-10-30", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US45578619",
             "sources": toc("US45578619") + ["https://www.businesswire.com/news/home/20191030005767/en/IDC-Unveils-Worldwide-CIO-Agenda-2020-Predictions"],
             "note": "Table of contents read from an Internet Archive copy."},
        ],
    },
    "2018": {
        "published": "2018-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2019 Predictions", "idc_doc": "US44403818",
             "published": "2018-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US44403818",
             "sources": toc("US44403818"), "note": "Table of contents read from an Internet Archive copy."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2019 Predictions", "idc_doc": "US44390218",
             "published": "2018-10-31", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US44390218",
             "sources": toc("US44390218") + ["https://www.businesswire.com/news/home/20181031005201/en/IDC-Reveals-Worldwide-CIO-Agenda-2019-Predictions"],
             "note": "Table of contents read from an Internet Archive copy."},
        ],
    },
    "2017": {
        "published": "2017-10",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2018 Predictions", "idc_doc": "US43171317",
             "published": "2017-10", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US43171317",
             "sources": toc("US43171317"), "note": "Table of contents read from an Internet Archive copy."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2018 Predictions", "idc_doc": None,
             "published": "2017-11-01", "status": "complete", "stated_count": 10, "confidence": "medium",
             "manual_key": "CIO2018", "rank_unknown": True,
             "entry_source": "https://infotechlead.com/cio/cio-predictions-2018-ahead-digital-transformation-idc-51850",
             "manual": [
                 "75 percent of CIOs will put experiential engagement, data monetization, or digital business at scale at the top of their agenda by 2018.",
                 "75 percent of CIOs and their enterprises will fail to meet all of their digital objectives through 2019, dragged down by conflicting digital transformation imperatives, ineffective technology innovation, cloud infrastructure transition, and underfunded end-of-life core systems.",
                 "60 percent of the CIOs who have crossed the digital divide will prevail in c-suite turmoil and competition to become digital business leaders for their enterprises by 2020.",
                 "60 percent of CIOs will complete infrastructure and application re-platforming using cloud, mobile, and devops, clearing the deck for accelerated enterprise digital transformation by 2019.",
                 "60 percent of it organizations will deploy DX platforms supporting new customer- and ecosystem-facing business models by 2019.",
                 "75 percent of CIOs will refocus cybersecurity around authentication and trust to manage business risks, initiating the retirement of systems that cannot ensure data protection by 2019.",
                 "40 percent of CIOs will leverage vision- and mission-driven leadership to inspire and empower their organizations to create digital transformation capabilities by 2020.",
                 "40 percent of CIOs will adopt new digital governance models to accelerate innovation and speed by 2019 recognizing the failure of existing it governance and the need for a shared digital transformation vision.",
                 "70 percent of CIOs will take agility to the next level, gearing up to a product model using design thinking and devops by 2018.",
                 "60 percent of CIOs will implement an it business model and culture that shifts focus from it projects to digitally-oriented products by 2020.",
             ],
             "sources": ["https://infotechlead.com/cio/cio-predictions-2018-ahead-digital-transformation-idc-51850",
                         "https://www.idc.com/itexecutive/RESOURCES/ATTACHMENTS/Worldwide_CIO_Agenda_2018_Predictions.pdf"],
             "note": "Read from a trade-press copy (InfotechLead, November 1, 2017) that lists ten predictions without numbers; wording and casing are the copy's (for example 'it' for IT). IDC's own PDF link now redirects to a web page and has no Internet Archive copy. IDC document number not found."},
        ],
    },
    "2016": {
        "published": "2016-11",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2017 Predictions", "idc_doc": None,
             "published": "2016-11-01", "status": "missing", "stated_count": 10, "confidence": "high", "cache": None,
             "sources": ["https://www.forbes.com/sites/gilpress/2016/11/01/top-10-tech-predictions-for-2017-from-idc/",
                         "https://www.informationweek.com/it-infrastructure/digital-transformation-underway-many-will-fail-at-it"],
             "note": "IDC document number not found, so the table of contents could not be read. Forbes (the one known full list) returns 403 and has no Internet Archive copy. InformationWeek (November 2016) paraphrases the ten predictions; paraphrases are not captured as quotes."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2017 Predictions", "idc_doc": "US41845916",
             "published": "2016-11-02", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "US41845916",
             "sources": toc("US41845916") + ["https://www.businesswire.com/news/home/20161102005206/en/IDC-Reveals-Worldwide-CIO-Agenda-2017-Predictions"],
             "note": "Table of contents read from an Internet Archive copy."},
        ],
        "notes": "CIO Agenda complete; IT Industry list not found.",
    },
    "2015": {
        "published": "2015-11",
        "futurescapes": [
            {"name": IT, "title": "IDC FutureScape: Worldwide IT Industry 2016 Predictions — Leading Digital Transformation to Scale", "idc_doc": "259850",
             "published": "2015-11-04", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "259850",
             "sources": toc("259850") + ["https://www.businesswire.com/news/home/20151104005180/en/IDC-Predicts-Emergence-DX-Economy-Critical-Period"],
             "note": "Table of contents read from an Internet Archive copy. Each headline starts with an IDC label, kept in idc_label."},
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2016 Predictions", "idc_doc": None,
             "published": "2015-11", "status": "partial", "stated_count": None, "confidence": "medium",
             "manual_key": "CIO2016", "rank_unknown": True,
             "entry_source": "https://www.cio.com/article/242934/idc-if-cios-fail-to-step-up-on-digital-transformation-it-wont-matter.html",
             "manual": [
                 "by 2018, 35% of IT resources will be spent to support the creation of new digital revenue streams",
                 "By 2017, 80% of global CIOs will initiate a data transformation and governance framework to turn information into a competitive business differentiator",
                 "By 2016, 70% of IT organizations will shift their focus to advanced 'contain and control' security away from a perimeter mentality",
                 "By 2017, 60% of digital transformation initiatives will not be able to scale due to a lack of a strategic architecture",
             ],
             "sources": ["https://www.cio.com/article/242934/idc-if-cios-fail-to-step-up-on-digital-transformation-it-wont-matter.html"],
             "note": "Only four predictions found, in a CIO.com article (December 18, 2015) promoting the IDC webcast. The first is introduced as 'IDC predicts that ...'. IDC document number and the full list not found."},
        ],
        "notes": "IT Industry complete; CIO Agenda partial (4 found).",
    },
    "2014": {
        "published": "2014-10",
        "futurescapes": [
            {"name": CIO, "title": "IDC FutureScape: Worldwide CIO Agenda 2015 Predictions", "idc_doc": "252235",
             "published": "2014-10-29", "status": "complete", "stated_count": 10, "confidence": "high", "cache": "252235",
             "sources": ["https://vods.dm.ux.sap.com/previewhub/greece-runsimple/pdfs/downloadasset.2015-04-apr-13-11.idc-futurescape-worldwide-cio-agenda-2015-predictions-pdf.bypassReg.pdf",
                         "https://businesswire.com/news/home/20141029006429/en/IDC-Reveals-CIO-Agenda-Predictions-2015"],
             "note": "Read from the IDC report PDF (October 2014, IDC #252235) hosted by a third party. IDC calls the ten items 'decision imperatives', not predictions; each has a label (kept in idc_label) and a 'By 20XX, X% ...' statement."},
        ],
        "notes": "IDC's flagship IT industry predictions this year were 'IDC Predictions 2015: Accelerating Innovation — and Growth — on the 3rd Platform' (December 2014, IDC #252700), not a FutureScape. That document has ten topic headings with many sub-predictions each and is not captured (see INDEX.md).",
    },
}
