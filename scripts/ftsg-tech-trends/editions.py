"""Per-edition configuration: volume TOC pages, classification of TOC entries, metadata."""

COMMON_SKIP = [r'^key insights?$', r'^key terms$', r'^key questions$', r'^selected sources$',
               r'^application$', r'^scenario', r'^authors?\b', r'^state of ', r'^important terms$',
               r'^ones to watch$', r'^top headlines$', r'^state of play$', r'^key events$',
               r'^likely near[- ]term developments$', r'^opportunities and threats$',
               r'^investments and actions', r'^central themes$', r'^your guide to',
               r'^why .* trends matter', r'^when will .* (impact|disrupt)', r'^selected sources',
               r'^techniques to watch', r'^models to watch', r'^authors & contributors',
               r'^scenarios?$', r'^introduction$', r'^about ', r'^disclaimer', r'^methodology',
               r'^ones? to watch', r'^trend report', r'^exploring the scenarios',
               r'^vignettes?$', r'^a very brief list', r'.*terms every .* should know', r'^security breaches from \d{4}',
               r'^ev charging levels$', r'^\w+( \w+)? trends$', r'^what if\b', r'^how to prepare$',
               r'^letter from', r'^\d{4} tech trend reports?$', r'^using and sharing']

SKIP_SECTIONS = [p for p in COMMON_SKIP if 'trends$' not in p] + [r'^impacts? of ']


def classify_2022(e):
    if e['color'] != '#000000':
        return 'section'
    if e['family'].endswith('Md'):
        return 'subsection'
    return 'trend'


def classify_2023(e):
    if e['color'] != '#000000' or e['family'].endswith('Bd'):
        return 'section'
    if e['family'].endswith('Md'):
        return 'subsection'
    return 'trend'


def classify_2024(e):
    if e['color'] in ('#000000',):
        return 'trend'
    if e['family'].startswith('Majorant'):
        return 'section'
    return 'subsection'


def classify_2025(e):
    if e['color'] == '#000000':
        return 'trend'
    return 'section'


EDITIONS = {
    '2021': dict(
        volumes=[(41, 'Artificial Intelligence'), (94, 'Scoring & Recognition'), (118, 'New Realities & Synthetic Media'), (165, 'Work, Culture & Play'), (197, 'Health, Medical & Wearables'), (238, 'Home Automation & Consumer Electronics'), (261, 'Policy & Government'), (301, 'Privacy & Security'), (336, 'Blockchain, Fintech & Crypto'), (359, '5G, Robots & Transportation'), (435, 'Energy, Climate & Space'), (478, 'Synthetic Biology & Biotech')],
        classify=classify_2022, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS, full_page=True, heading_bold=False,
        extra_skip=[r'^expert insight', r'^sources$', r'^summary$', r'^an executive', r'^machine learning$',
                    r'^deep learning$', r'^weak and strong ai$'],
        action_note='horizon is the label the page header highlights (Watch Closely / Informs Strategy / Act Now); it applies to the page the trend starts on.',
        source_url='https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf',
        meta=dict(edition='2021', published='2021-03', status='complete', sources=[
            'https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf',
            'https://web.archive.org/web/20210402214204/https://2021techtrends.com/Full-Report',
            'https://web.archive.org/web/20210415000000/https://futuretodayinstitute.com/trends/'],
            publisher='Future Today Institute', series='Tech Trends Report', title='2021 Tech Trends Report (14th edition)',
            author='Amy Webb (founder, Future Today Institute)',
            notes='Full report (12 volumes plus volume 0, 504 pages) from the publisher Dropbox link that the 2021techtrends.com/Full-Report short link redirected to (Wayback capture 2021-04-02); the Dropbox file was still live on 2026-10-01. Labels are the regular-weight entries of each volume contents page, in printed order; medium-weight entries are sub-sections. Volume 0, Expert Insight essays, Scenario, Application, Key Questions and Sources entries are excluded. Volume names abbreviate the cover titles. PDF created 2021-03-08; launched at SXSW in March 2021.')),
    '2023': dict(
        volumes=[
            ('fti2023_bio', 3, 'Bioengineering', 'https://web.archive.org/web/20240218190002/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Bioengineering.pdf'),
            ('fti2023_climate', 3, 'Climate & Energy', 'https://web.archive.org/web/20230517163222/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Climate_Energy.pdf'),
            ('fti2023_health', 3, 'Health Care & Medicine', 'https://web.archive.org/web/20240723080427/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Health_Care_Medicine-.pdf'),
            ('fti2023_metaverse', 3, 'Metaverse', 'https://web.archive.org/web/20240511082639/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Metaverse.pdf'),
            ('fti2023_news', 3, 'News & Information', 'https://web.archive.org/web/20230313172132/https://futuretodayinstitute.com/wp-content/uploads/2023/02/News_Information.pdf'),
            ('fti2023_web3', 3, 'Web3', 'https://web.archive.org/web/20240808114043/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Web3.pdf'),
        ],
        classify=classify_2023, full_page=True, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS,
        source_url='',
        meta=dict(edition='2023', published='2023-03', status='partial', sources=[
            'https://web.archive.org/web/20240218190002/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Bioengineering.pdf',
            'https://web.archive.org/web/20230517163222/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Climate_Energy.pdf',
            'https://web.archive.org/web/20240723080427/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Health_Care_Medicine-.pdf',
            'https://web.archive.org/web/20240511082639/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Metaverse.pdf',
            'https://web.archive.org/web/20230313172132/https://futuretodayinstitute.com/wp-content/uploads/2023/02/News_Information.pdf',
            'https://web.archive.org/web/20240808114043/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Web3.pdf',
            'https://web.archive.org/web/20230313115103/https://futuretodayinstitute.com/wp-content/uploads/2023/03/2023_TR_Executive_Summary.pdf'],
            publisher='Future Today Institute', series='Tech Trends Report', title='2023 Tech Trends Report (16th edition)',
            author='Amy Webb (CEO, Future Today Institute)',
            notes='Partial. The 2023 edition was published as 14 separate volume PDFs plus an executive summary; no single full-report PDF was found in the Wayback Machine. Six volumes are archived complete and extracted here (Bioengineering, Climate & Energy, Health Care & Medicine, Metaverse, News & Information, Web3). The Artificial Intelligence volume capture is truncated (1 MB of the file) and unreadable; the other seven volumes were not found. Labels are the regular-weight entries of each volume table of contents, in printed order; medium-weight entries are sub-sections, bold entries are sections. Scenario questions (What if ...) and front/back matter are excluded. The executive summary lists no trend titles.')),
    '2022': dict(
        volumes=[(39, 'Artificial Intelligence'), (102, 'Recognition, Scoring & Privacy'),
                 (152, 'Metaverse, AR/VR & Synthetic Media'), (195, 'Work, Culture & Play'),
                 (237, 'News & Information'), (269, 'Health & Medicine'), (308, 'Home of Things'),
                 (332, 'Policy, Government & Security'), (396, 'Logistics, Robotics & Transportation'),
                 (459, 'Decentralization & Blockchain'), (510, 'Telecommunications & Computing'),
                 (544, 'Synthetic Biology, Biotechnology & AgTech'), (589, 'Climate, Energy & Space')],
        classify=classify_2022, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS, action=True, full_page=True,
        action_note='horizon is the label the page header highlights (Watch Closely / Informs Strategy / Act Now); it applies to the page the trend starts on.',
        source_url='https://web.archive.org/web/20220316173530/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf',
        meta=dict(edition='2022', published='2022-03', status='complete', sources=[
            'https://web.archive.org/web/20220316173530/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf',
            'https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf'],
            publisher='Future Today Institute', series='Tech Trends Report', title='2022 Tech Trends Report (15th edition)',
            author='Amy Webb (founder, Future Today Institute)',
            notes='Labels are the black regular-weight entries of each volume table of contents (volumes 01-13), in printed order. Coloured bold entries are sections, black medium-weight entries are sub-sections. Volume 00 (methodology) and per-volume Key Insights, Key Terms, Scenario, Application, Key Questions and Selected Sources entries are excluded and listed in skipped_toc_items. Quotes are the first sentence under the trend heading in the body. The PDF was released in mid-March 2022 (SXSW); Wayback first capture 2022-03-16.')),
    '2024': dict(
        volumes=[(50, 'Artificial Intelligence'), (51, 'Artificial Intelligence'), (166, 'Web3'), (207, 'Metaverse'),
                 (257, 'Bioengineering'), (258, 'Bioengineering'), (328, 'Energy & Climate'), (329, 'Energy & Climate'),
                 (401, 'Mobility, Robotics & Drones'), (456, 'Computing'), (517, 'Built Environment'),
                 (572, 'News & Information'), (615, 'Health Care & Medicine'), (687, 'Financial Services & Insurance'),
                 (733, 'Sports'), (776, 'Space'), (840, 'Hospitality'), (882, 'Supply Chain & Logistics'),
                 (919, 'Entertainment')],
        classify=classify_2024, full_page=True, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS,
        source_url='https://web.archive.org/web/20240309173748/https://futuretodayinstitute.com/wp-content/uploads/2024/03/TR2024_Full-Report_FINAL_LINKED.pdf',
        meta=dict(edition='2024', published='2024-03', status='complete', sources=[
            'https://web.archive.org/web/20240309173748/https://futuretodayinstitute.com/wp-content/uploads/2024/03/TR2024_Full-Report_FINAL_LINKED.pdf'],
            publisher='Future Today Institute', series='Tech Trends Report', title='2024 Tech Trends Report (17th edition)',
            author='Amy Webb (CEO, Future Today Institute)',
            notes='Labels are the black entries of each volume table of contents, in printed order. Red bold entries are sections, red regular entries (mostly questions) are sub-sections. Front-matter entries (Top Headlines, State of Play, Key Events, Likely Near Term Developments, Opportunities and Threats, Important Terms, Scenarios, Authors, Selected Sources) are excluded and listed in skipped_toc_items. Quotes are the first sentence under the trend heading in the body. The report gives a time-of-impact chart per industry, not per trend, so horizon is empty.')),
    '2025': dict(
        volumes=[(41, 'Artificial Intelligence'), (42, 'Artificial Intelligence'), (43, 'Artificial Intelligence'),
                 (149, 'Web3'), (214, 'Metaverse & New Realities'), (284, 'Biotechnology'), (285, 'Biotechnology'),
                 (286, 'Biotechnology'), (361, 'Energy & Climate'), (362, 'Energy & Climate'),
                 (433, 'Mobility, Robotics & Drones'), (434, 'Mobility, Robotics & Drones'), (499, 'Computing'),
                 (500, 'Computing'), (570, 'Built Environment'), (627, 'News & Information'),
                 (667, 'Health Care & Medicine'), (736, 'Financial Services & Insurance'), (783, 'Space'),
                 (858, 'Hospitality & Restaurants'), (901, 'Supply Chain, Logistics & Manufacturing'),
                 (945, 'Entertainment')],
        classify=classify_2025, full_page=True, divider_size=60, skip=COMMON_SKIP, skip_sections=SKIP_SECTIONS, heading_bold=False,
        source_url='https://web.archive.org/web/20250310153559/https://ftsg.com/wp-content/uploads/2025/03/FTSG_2025_TR_FINAL_LINKED.pdf',
        meta=dict(edition='2025', published='2025-03', status='complete', sources=[
            'https://web.archive.org/web/20250310153559/https://ftsg.com/wp-content/uploads/2025/03/FTSG_2025_TR_FINAL_LINKED.pdf'],
            publisher='Future Today Strategy Group', series='Tech Trends Report', title='2025 Tech Trends Report (18th edition)',
            author='Amy Webb (CEO, Future Today Strategy Group)',
            notes='Labels are the black entries of each volume table of contents, in printed order. Coloured entries are sections. Front-matter and back-matter entries are excluded and listed in skipped_toc_items. Quotes are the first sentence under the trend heading in the body. The report gives a time-of-impact chart per industry (Now, 1-3, 3-5, 5-7, 7-10 years), not per trend, so horizon is empty.')),
}
