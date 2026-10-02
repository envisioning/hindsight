# MIT Technology Review, 10 Breakthrough Technologies: collected editions

Facts only: label, availability as stated, key players (organizations only), a short quote of the one-line claim, source. Nothing here is graded.

## Verified before extraction

- **First edition: 2001.** Technology Review, January/February 2001 issue, first published as "10 emerging technologies that will change the world". The TR10 archive (https://www.technologyreview.com/supertopic/tr10-archive/) starts at 2001.
- **No 2002 edition.** The archive lists 2001 and then 2003. See the 2002 row.
- **Availability is not stated in every edition.** 2001-2016: no Availability field. Some entries give a timing in body text; it is in the entry `note`, never in `availability`. 2017-2020: an Availability line on the list or article page. 2021: 'Availability:' and 'Key players:' lines on each article page, not on the list page. 2022-2026: a 'WHEN' (availability) and 'WHO' (key players) line on each article page, not on the list page (2026: in the article header box). The reader-voted 11th entries (2023-2025) have no WHEN/WHO line.
- **Count is not always ten.** 2022, 2023, 2024 and 2025 have ten editors' picks plus a reader-voted 11th entry added months later. The 11th entry is recorded last, with a note.
- The 2001 list was published as "10 emerging technologies that will change the world" in the January/February issue. Publication month moved over the years (May 2005, March 2006-2007, April-May 2010-2014, February 2015-2022, January 2023-2026).

## Fields

`rank` (list order on the page, not a ranking), `label`, `availability` (verbatim, null if the edition has no availability statement), `horizon` (parsed band, only where clear), `key_players` (organizations only), `quote`, `source_url`, `confidence`, `note`.

## Open problems (not read, and why)

- **2021, 2023-2026 availability pass (2026-10-02, #6).** Every editors' article page read from raw HTML with curl (no WebFetch), parsed by `scripts/mit-tr-10-breakthrough/when-who.mjs`: 49 entries filled, availability and key players verbatim (`availability_confidence: high`). Entry `confidence` stays as it was, since it covers the quote. 2021 `source_url` now points to each article; its quote is still from the list page. Reader-voted 11th entries (Hydrogen planes 2023, Thermal batteries 2024, Brain-computer interfaces 2025) have no WHEN line and stay without availability.
- **Horizon readings that are not literal:** 2021 Lithium-metal batteries 'WHEN' is a calendar year ('2025'); 2024 Apple Vision Pro 'Later this year' read as the edition year; 2025 Vera C. Rubin Observatory and 2026 Commercial space stations '6 months' read as the edition year (January editions). 2021 Data trusts lists "National governments" as a key player; left out (not an organization). 2026 Generative coding WHO names products (Copilot, Cursor, Lovable, Replit); kept as printed.
- **2019:** New-wave nuclear power and An ECG on your wrist: availability returned only as paraphrase. Neither article page has the label. Low confidence, availability null.
- **2013:** the web articles have no Key Players field. Organizations named in each article are in the note.
- **2014:** Neuromorphic Chips has no sidebar on its web page.
- **Read method.** Before the 2026-10-02 availability pass, every page was read through WebFetch, which passes content through a summarising model. Quotes and labels marked `high` came from explicit labels asked for verbatim; `medium` quotes may carry small wording differences. A verbatim re-check against raw HTML is advised before quotes are published.
- **Mapping to Subjects/Revisions** was not done. Candidate revision chains: quantum computing (2017, 2018, 2020), next-gen nuclear (2009, 2019, 2022, 2026), carbon removal (2019, 2022), brain-computer interfaces (2001, 2017, 2025), gene editing (2014, 2016, 2024, 2026).

## Editions

| Year | Status | Entries | With availability | Main source | Notes |
|---|---|---|---|---|---|
| 2001 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2001/ | No availability field. Body-text timings in entry notes. |
| 2002 | missing | 0 | 0 | - | No edition published. The TR10 archive goes from 2001 to 2003. |
| 2003 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2003/ | No availability field. Some body-text timings in entry notes. |
| 2004 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2004/ | No availability field. No dated timings in body text. |
| 2005 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2005/ | No availability field. Body-text timings in entry notes. Published May 2005. |
| 2006 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2006/ | No availability field. Body-text timings in entry notes. Published March 2006. |
| 2007 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2007/ | No availability field. Body-text timings in entry notes. Published March 2007. |
| 2008 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2008/ | No availability field. Few dated timings in body text. |
| 2009 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2009/ | No availability field. Body-text timings in entry notes. |
| 2010 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2010/ | No availability field. Body-text timings in entry notes. Published April 2010. |
| 2011 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2011/ | No availability field. Few body-text timings. |
| 2012 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2012/ | No availability field. Timings are company plans for the same year. |
| 2013 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2013/ | No availability or key-player field on the web pages. Quotes are article deks. |
| 2014 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2014/ | No availability field. Key Players field present (except Neuromorphic Chips on the web page). Quotes are article deks. |
| 2015 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2015/ | No availability field. Key Players field present. Quotes are article deks. |
| 2016 | complete | 10 | 0 | https://www.technologyreview.com/10-breakthrough-technologies/2016/ | No availability field on the web articles. Key Players field present. |
| 2017 | complete | 10 | 10 | https://www.technologyreview.com/10-breakthrough-technologies/2017/ | First edition with an Availability field on every entry. |
| 2018 | complete | 10 | 10 | https://www.technologyreview.com/10-breakthrough-technologies/2018/ | Availability field on every entry. |
| 2019 | complete | 10 | 8 | https://www.technologyreview.com/10-breakthrough-technologies/2019/ | Availability on 8 of 10 entries read verbatim; 2 read only as paraphrase (low confidence). |
| 2020 | complete | 10 | 10 | https://www.technologyreview.com/10-breakthrough-technologies/2020/ | Availability on every entry. |
| 2021 | complete | 10 | 10 | https://www.technologyreview.com/2021/02/24/1014369/10-breakthrough-technologies-2021/ | Availability and key players read from each article page (list page has neither). |
| 2022 | complete | 11 | 10 | https://www.technologyreview.com/2022/02/23/1045416/10-breakthrough-technologies-2022/ | Availability and key players read from each article. 11th entry reader-voted (no availability read). |
| 2023 | complete | 11 | 10 | https://www.technologyreview.com/2023/01/09/1066394/10-breakthrough-technologies-2023/ | Availability and key players read from each article. 11th entry reader-voted (no WHEN line). |
| 2024 | complete | 11 | 10 | https://www.technologyreview.com/2024/01/08/1085094/10-breakthrough-technologies-2024/ | Availability and key players read from each article. 11th entry reader-voted (no WHEN line). |
| 2025 | complete | 11 | 10 | https://www.technologyreview.com/2025/01/03/1109178/10-breakthrough-technologies-2025/ | Availability and key players read from each article. 11th entry reader-voted (no WHEN line). |
| 2026 | complete | 10 | 10 | https://www.technologyreview.com/2026/01/12/1130697/10-breakthrough-technologies-2026/ | Availability and key players read from each article's header box. |
