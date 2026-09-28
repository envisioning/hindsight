# Ray Kurzweil: dated predictions

Facts only: prediction (short quote, max 400 characters), target year, subject label, position (chapter or page), source. No body text, charts or figures (see NOTICE.md). Nothing here is graded. Built by `scripts/kurzweil/build.py`.

## Verify-first answers

- **Which books carry explicit years.** Four books and one essay:
  - *The Age of Intelligent Machines* (MIT Press, 1990). No numbered list. Dated claims are scattered through the text, mostly in the last chapter (pp. 405-449): computer chess champion by 2000 (p. 133), translating telephone by 2010 (p. 411), Turing test between 2020 and 2070 (p. 416), educational computers by the end of the first decade of the 21st century (pp. 429-430), personal computers of 2010 (pp. 432-434).
  - *The Age of Spiritual Machines* (Viking, 1999). Four prediction chapters: Chapter 9 "2009", Chapter 10 "2019", Chapter 11 "2029", Chapter 12 "2099" (Wikipedia gives pp. 189-235 for the range).
  - *The Singularity Is Near* (Viking, 2005). Chapter 6 has one page of predictions for 2010 and one for 2030. Other dated claims (2010, 2020, mid-2020s, 2029, early 2030s, 2045) are spread through the book.
  - "How My Predictions Are Faring" (self-published PDF essay, October 2010). The author's self-assessment. It reprints all 147 predictions for 2009 from the 1999 book, the ten 2010 predictions from the 2005 book, and passages from the 1990 book with page numbers. It restates a few forward claims.
  - *The Singularity Is Nearer* (Viking, 2024-06-25). Restates 2029 (human-level AI, AGI, Turing test) and 2045 (singularity); adds 2030s claims (longevity escape velocity, nanobots, UBI).
- **Edition id** is the publication year.
- **Public readability.** The books are copyrighted and not public. The Internet Archive holds lending copies of the 1990, 1999 and 2005 books (`ageofintelligent00kurz`, `ageofspiritualma0000kurz`, `singularityisnea00kurz`), but their full text and search-inside are not public (the search-inside endpoint returned "Item not available"). The author's 2010 essay is public and is the main source.

## Editions

| Edition | Title | Published | Status | Entries | Main source |
|---|---|---|---|---|---|
| 1990 | The Age of Intelligent Machines | 1990 | partial | 8 | Kurzweil 2010 essay (reprinted passages with pages); Wikipedia quotes with pages |
| 1999 | The Age of Spiritual Machines | 1999-01 | partial | 252 (147 for 2009, 105 for 2019) | Kurzweil 2010 essay (2009); LessWrong 2020 statement list (2019) |
| 2005 | The Singularity Is Near | 2005-09 | partial | 16 (10 for 2010 from Chapter 6, 6 others) | Kurzweil 2010 essay; Wikipedia quotes with pages |
| 2010 | How My Predictions Are Faring | 2010-10 | complete | 3 | https://www.thekurzweillibrary.com/images/How-My-Predictions-Are-Faring.pdf |
| 2024 | The Singularity Is Nearer | 2024-06-25 | partial | 8 | Launch interview, The Observer (Guardian), 2024-06-29 |

Total: 287 entries.

Kurzweil's other books (*The 10% Solution*, *Fantastic Voyage* 2004, *Transcend* 2009, *How to Create a Mind* 2012, *Danielle* 2019) are health, fiction or theory books and are not in the task scope. The 1992-1993 *Library Journal* essays on e-books (listed in the 2010 essay) are not captured.

## Self-assessment

`self_assessment.json` holds the author's own verdicts from the 2010 essay: 147 rows for the 1999 book's 2009 predictions and 10 rows for the 2005 book's 2010 predictions. Each row has `edition`, `entry_rank` (the entry in that edition file), the prediction text, `verdict` (normalised case) and `verdict_text` (as printed), and the essay page.

- The essay states: 147 predictions for 2009; 115 correct, 12 "essentially correct", 17 partially correct, 3 wrong. The parsed rows match these counts exactly.
- The author defines "essentially correct" as likely to come true within a year or a couple of years, arguing that predictions were stated by decade.
- These are the author's claims, not Hindsight grades. The 1990 passages are discussed in the essay without verdicts.

## External assessments (not copied into entries)

Independent reviews exist. Their verdicts are not stored here.

| Year | Publication | Scope | URL |
|---|---|---|---|
| 2009 | Newsweek, "Ray Kurzweil Wants to Be a Robot" | selected 2009 predictions | https://www.newsweek.com/ray-kurzweil-wants-be-robot-80265 |
| 2010 | IEEE Spectrum, "Ray Kurzweil's Slippery Futurism" | selected predictions | https://spectrum.ieee.org/ray-kurzweils-slippery-futurism |
| 2012 | LessWrong, "Assessing Kurzweil: the results" | 1999 book, predictions for 2009, volunteer panel | https://www.lesswrong.com/posts/kbA6T3xpxtko36GgP/assessing-kurzweil-the-results |
| not checked | LessWrong post (slug "kurzweil-s-predictions-scores"), linked from the 2020 results post | 2009 predictions, scores | https://www.lesswrong.com/posts/YvbS2KdDRNDsLrKHq/kurzweil-s-predictions-scores |
| 2012 | Forbes, "Ray Kurzweil's Predictions For 2009 Were Mostly Inaccurate" | selected 2009 predictions | https://www.forbes.com/sites/alexknapp/2012/03/20/ray-kurzweils-predictions-for-2009-were-mostly-inaccurate/ |
| 2020 | LessWrong, "Assessing Kurzweil's 1999 predictions for 2019" (call) and "Assessing Kurzweil predictions about 2019: the results" | 1999 book, 105 statements for 2019, 34 assessors | https://www.lesswrong.com/posts/GhDfTAtRMxcTqAFmc/assessing-kurzweil-s-1999-predictions-for-2019 ; https://www.lesswrong.com/posts/NcGBmDEe5qXB7dFBF/assessing-kurzweil-predictions-about-2019-the-results |
| not checked | Militant Futurist blog, "How Ray Kurzweil's 2019 predictions are faring" (5 parts) | 1999 book, 2019 chapter | https://www.militantfuturist.com/how-ray-kurzweils-2019-predictions-are-faring/ |
| not checked | FutureTimeline forum, "Kurzweil's 2009 is our 2019" | 2009 predictions read against 2019 | https://www.futuretimeline.net/forum/topic/17903-kurzweils-2009-is-our-2019/ |

## Entry fields

`rank`, `kind` (`decade_prediction` for the 1999 decade chapters, `dated_prediction` otherwise), `section` (1999 only: the essay's or chapter's section), `quote`, `paraphrase` (only when no verbatim quote was found; then `quote` is null), `subject`, `target_year`, `target_year_earliest` (ranges only), `timing`, `metric`/`value`/`unit` (only where the claim has a number), `position` (chapter or page), `source_url`, `confidence`, `note`.

- **target_year for decades.** "early 2030s" and "in the 2030s" use 2030, "mid-2020s" uses 2025, "late 2020s" uses 2027, "first half of the next century" uses 2050. Each such entry says so in `note`.
- **Confidence.** high: the author's own public text (the 2010 essay). medium: a reputable secondary quotation (Wikipedia with page reference, LessWrong statement list, the author's words in an interview). low: a paraphrase only.
- **Subjects.** For 2009 and the 2005 2010-list, `subject` is the author's own item heading from the 2010 essay. For 2019 and the rest, `subject` is Hindsight's short label.

## Open problems

- **1999, 2029 and 2099 chapters: missing.** No public page quoting the text was found. The Wikipedia article in its pre-2022 form ("Predictions made by Ray Kurzweil", archived at https://web.archive.org/web/2020/https://en.wikipedia.org/wiki/Predictions_made_by_Ray_Kurzweil) lists them only as paraphrases without page numbers. Not captured.
- **1999 wording.** The 2009 predictions are the text as the author reproduced it in 2010. Some items begin or end with an ellipsis where the author split one book sentence into several graded items. The wording was not checked against the book pages.
- **1999, 2019 split.** The 105 statements are the LessWrong 2020 split. Where the list repeats a preceding sentence as bracketed context, the context is dropped; shorter bracketed insertions (for example "[For the deaf]") are kept. Two 2019 statements are clipped to 400 characters (five 2009 predictions are clipped too; each clipped entry says so in `note`).
- **2005: Chapter 6 page for 2030 missing.** Only the 2010 page is public (via the 2010 essay). Six other 2005 entries rest on Wikipedia quotes or summaries with page numbers; two are paraphrases with `quote: null`.
- **1990: two paraphrases** (translating telephone by 2010, driverless car in the first half of the 21st century) have no verbatim public quotation.
- **2024: book text not read.** Entries come from the launch interview. The book's page references are missing. A publisher excerpt was not found (the Penguin Random House page tried returned an unrelated book).
- **Revisions (not yet mapped to Subject ids).** Turing test: 1990 "between 2020 and 2070"; 1999 "prevalent reports" by 2019, routinely passed by 2029; 2005 by 2029; 2010 by 2029 (Long Bet with Mitch Kapor); 2024 by 2029. Singularity: 2005 and 2024 both 2045. Human-brain-equivalent computing for USD 1,000: 1999 says USD 4,000 in 2019; 2005 says USD 1,000 around 2020. Translating telephone: 1990 by 2010; 1999 common by 2009; 2005 real-time translation by 2010.

## Source-side oddities

- The essay's cover says October 2010 but its text mentions a Samsung announcement of December 2010 and Tianhe-1A (announced November 2010), so the PDF was revised after October 2010.
- One verdict is printed as "Partially Correct" and one as "Partially correct." (with a period); one "Wrong" carries "(about ten years off)".
- The essay's 2010 list (from the 2005 book) was graded while 2010 was not yet over; the essay says so.
- Business & Economics item 19 (trillion-dollar company "west of the Mississippi and north of the Mason-Dixon Line") is graded "Wrong" by the author.
- Capture tools: WebSearch and WebFetch hit a session limit early in this capture; the remaining public pages (Wikipedia wikitext, LessWrong via greaterwrong.com, The Guardian, the PDF and the TSV) were read with curl into a scratch folder.
