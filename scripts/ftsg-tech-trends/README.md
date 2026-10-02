# FTSG / FTI Tech Trends Report: capture scripts

Standard-library Python 3. PDF text comes from poppler (`pdftohtml -xml -i`, `pdftotext -raw`), called by hand before the scripts run. Downloads stay outside the repo (any scratch folder, called `$S` below). Run every script from this folder.

## Inputs

| Edition | File | URL |
|---|---|---|
| 2014 | wmg2014.pdf | https://web.archive.org/web/20140124011002id_/http://webbmediagroup.com:80/upload/2014-Trend-Report.pdf |
| 2019 | ss2019a.txt, ss2019b.txt | https://web.archive.org/web/20200830004208id_/https://www.slideshare.net/webbmedia/2019-emerging-tech-trends-report-part-1-of-2-136450918 and https://web.archive.org/web/20190603232304id_/https://www.slideshare.net/AmyWebb33/2019-emerging-tech-trends-report-part-2-of-2 |
| 2020 | ss2020a.txt; ss2020a_2025.html, ss2020b_2025.html (gunzip) | https://web.archive.org/web/20200818165913id_/https://www.slideshare.net/AmyWebb33/future-today-institute-2020-tech-trends-report-231311623 ; full transcripts: https://web.archive.org/web/20250829074411id_/https://www.slideshare.net/slideshow/future-today-institute-2020-tech-trends-report-231311623/231311623 and https://web.archive.org/web/20260830162850id_/https://www.slideshare.net/slideshow/future-today-institute-2020-tech-trends-report-section-2-of-2/231311737 |
| 2021 | fti2021.pdf | https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf?dl=1 (target of https://2021techtrends.com/Full-Report) |
| 2022 | fti2022.pdf | https://web.archive.org/web/20220316173530id_/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf |
| 2023 | fti2023_{bio,climate,health,metaverse,news,web3}.pdf | https://web.archive.org/web/<ts>id_/https://futuretodayinstitute.com/wp-content/uploads/2023/02/{Bioengineering,Climate_Energy,Health_Care_Medicine-,Metaverse,News_Information,Web3}.pdf (timestamps in `editions.py`); appended: fti2023_ai.pdf https://web.archive.org/web/20231026215250id_/https://futuretodayinstitute.com/wp-content/uploads/2023/02/Artificial_Intelligence-1.pdf and scribd2023.html (gunzip) https://web.archive.org/web/20260923115621id_/https://www.scribd.com/document/648865649/FTI-2023-Trend-Report |
| 2024 | fti2024.pdf | https://web.archive.org/web/20240309173748id_/https://futuretodayinstitute.com/wp-content/uploads/2024/03/TR2024_Full-Report_FINAL_LINKED.pdf |
| 2025 | ftsg2025.pdf | https://web.archive.org/web/20250310153559id_/https://ftsg.com/wp-content/uploads/2025/03/FTSG_2025_TR_FINAL_LINKED.pdf |

SlideShare `.txt` files are the archived page HTML with `<script>`/`<style>` removed, tags replaced by newlines, entities unescaped, and blank lines dropped (one text node per line).

## Run

```sh
curl -sL -A "Mozilla/5.0" -o $S/fti2022.pdf <url>
pdftohtml -xml -i -q $S/fti2022.pdf $S/fti2022        # writes $S/fti2022.xml
pdftotext -raw $S/fti2022.pdf $S/fti2022.raw.txt
python3 build.py 2022 $S/fti2022.xml                    # 2021, 2022, 2024, 2025 the same way
python3 build.py 2023 $S                                # reads $S/fti2023_*.xml
python3 parse_2014.py $S/wmg2014.raw.txt
python3 parse_2019_slideshare.py $S/ss2019b.txt $S/ss2019a.txt
python3 parse_2020_slideshare.py $S/ss2020a.txt
python3 verify_quotes.py 2022 $S/fti2022.raw.txt        # per PDF edition; 2023 takes the six raw files
# 2026-10-02 additions (append only; never re-run build.py 2023 after ids exist):
python3 scribd_2023.py pages $S/scribd2023.html $S/scribd2023.pages.json
python3 scribd_2023.py check $S/scribd2023.pages.json     # compare with the six PDF volumes
python3 append_2023.py $S                               # AI volume PDF + seven Scribd volumes, appended
python3 parse_2020_full.py extract $S/ss2020a_2025.html $S/ss2020b_2025.html $S/ss2020_full.json
python3 parse_2020_full.py apply $S/ss2020_full.json --write   # adds quotes to entries without one
python3 check_quotes.py 2021 2022 2023 2024 2025         # flags suspicious quotes (no writes)
# D40 umbrella pages (append only; refuses a second run):
pdftohtml -xml -i -q $S/fti2021.pdf $S/fti2021
python3 append_umbrella_d40.py $S                       # dry run: prints the rows
python3 append_umbrella_d40.py $S --write               # appends to 2020, 2021, 2023
# 2023 contents audit (issue #26; append only; refuses a second run):
pdftohtml -xml -i -q $S/fti2023_climate.pdf $S/fti2023_climate; pdftotext -raw $S/fti2023_climate.pdf $S/fti2023_climate.raw.txt
pdftohtml -xml -i -q $S/fti2023_health.pdf $S/fti2023_health;   pdftotext -raw $S/fti2023_health.pdf $S/fti2023_health.raw.txt
python3 check_2023_contents.py $S/scribd2023.pages.json [--json out.json]   # all 14 contents lists vs 2023.json (no writes)
python3 append_2023_missing.py $S                       # dry run: prints the rows
python3 append_2023_missing.py $S --write               # appends the missing trends to 2023
```

## Files

- `pdfxml.py`: loads pdftohtml XML (text runs with font size, family, colour, bold); line joining; first-sentence quotes.
- `toc.py`: per-volume contents parser (page-number runs plus title runs by column), body heading lookup, one-trend-per-page layout (KEY INSIGHT / WHAT IT IS blocks, "Nth YEAR ON THE LIST" tag).
- `editions.py`: per-edition contents pages, volume names, entry classification by font, skip lists, metadata.
- `build.py`: writes `data/raw/ftsg-tech-trends/<edition>.json` for the PDF editions.
- `parse_2014.py`, `parse_2019_slideshare.py`, `parse_2020_slideshare.py`: editions without a usable PDF layout.
- `verify_quotes.py`: downgrades quotes not found verbatim in the PDF text to `medium`.
- `fontstats.py`, `dump_toc.py`: diagnostics used to set up `editions.py`.
- `scribd_2023.py`: 2023 volumes from the Scribd text layer (layout text, no fonts); `append_2023.py` appends the missing 2023 volumes after the existing entries (D15). `build.py` has `carry_sections` for a contents list continued on a second page (used only by the appended AI volume).
- `parse_2020_full.py`: 2020 quotes from the full SlideShare transcripts.
- `check_quotes.py`: boilerplate, shared and neighbour-matching quote flags.
- `append_umbrella_d40.py`: appends umbrella section pages with a year tag and a KEY INSIGHT / WHAT IT IS block (D40) to 2020 (transcripts), 2021 (PDF XML) and 2023 (Scribd text layer), after the existing entries. The page list is fixed in the script; it was found by listing every year tag in the full text of each edition and keeping tagged pages that match no entry.
- `check_2023_contents.py`: compares the contents pages of all 14 volumes of 2023 (Scribd text layer, which also carries the seven PDF volumes) with `2023.json`. Reports contents items that match no entry, skipped item or stored sub-section (front/back matter, scenarios, expert perspectives, divider pages and a short hand-checked list are left out); loose title lines that belong to no stored text (titles whose page number the text layer detached); stored labels cut at a contents line wrap (body heading = label + loose contents line); stored entries whose page prints only a title (a section divider stored as a trend); and entries without quote or matching heading. No writes. First run 2026-10-02 found the Climate & Energy contents page 2 unread, plus four other missing trends; `append_2023_missing.py` appended them (entries 622-674). Labels it reports as cut are listed in INDEX.md "Known issues" and not edited (D15).
- An entry that is not a trend is marked `not_a_trend: true` (with a note) in place; the normalize adapter skips it.

Re-running a build rewrites the edition file in the same printed order. Do not re-run after claim ids are assigned unless the order is unchanged (D15).
