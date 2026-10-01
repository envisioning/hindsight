# FTSG / FTI Tech Trends Report: capture scripts

Standard-library Python 3. PDF text comes from poppler (`pdftohtml -xml -i`, `pdftotext -raw`), called by hand before the scripts run. Downloads stay outside the repo (any scratch folder, called `$S` below). Run every script from this folder.

## Inputs

| Edition | File | URL |
|---|---|---|
| 2014 | wmg2014.pdf | https://web.archive.org/web/20140124011002id_/http://webbmediagroup.com:80/upload/2014-Trend-Report.pdf |
| 2019 | ss2019a.txt, ss2019b.txt | https://web.archive.org/web/20200830004208id_/https://www.slideshare.net/webbmedia/2019-emerging-tech-trends-report-part-1-of-2-136450918 and https://web.archive.org/web/20190603232304id_/https://www.slideshare.net/AmyWebb33/2019-emerging-tech-trends-report-part-2-of-2 |
| 2020 | ss2020a.txt | https://web.archive.org/web/20200818165913id_/https://www.slideshare.net/AmyWebb33/future-today-institute-2020-tech-trends-report-231311623 |
| 2021 | fti2021.pdf | https://www.dropbox.com/s/fm5c9mlmnwy9kgd/FTI_2021_Tech_Trends_Volume_All.pdf?dl=1 (target of https://2021techtrends.com/Full-Report) |
| 2022 | fti2022.pdf | https://web.archive.org/web/20220316173530id_/https://futuretodayinstitute.com/mu_uploads/2022/03/FTI_Tech_Trends_2022_All.pdf |
| 2023 | fti2023_{bio,climate,health,metaverse,news,web3}.pdf | https://web.archive.org/web/<ts>id_/https://futuretodayinstitute.com/wp-content/uploads/2023/02/{Bioengineering,Climate_Energy,Health_Care_Medicine-,Metaverse,News_Information,Web3}.pdf (timestamps in `editions.py`) |
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
```

## Files

- `pdfxml.py`: loads pdftohtml XML (text runs with font size, family, colour, bold); line joining; first-sentence quotes.
- `toc.py`: per-volume contents parser (page-number runs plus title runs by column), body heading lookup, one-trend-per-page layout (KEY INSIGHT / WHAT IT IS blocks, "Nth YEAR ON THE LIST" tag).
- `editions.py`: per-edition contents pages, volume names, entry classification by font, skip lists, metadata.
- `build.py`: writes `data/raw/ftsg-tech-trends/<edition>.json` for the PDF editions.
- `parse_2014.py`, `parse_2019_slideshare.py`, `parse_2020_slideshare.py`: editions without a usable PDF layout.
- `verify_quotes.py`: downgrades quotes not found verbatim in the PDF text to `medium`.
- `fontstats.py`, `dump_toc.py`: diagnostics used to set up `editions.py`.

Re-running a build rewrites the edition file in the same printed order. Do not re-run after claim ids are assigned unless the order is unchanged (D15).
