# Pew Research Center and Elon University: Future of the Internet expert canvassings

Facts only: the question or scenario statement as asked (max 400 characters), the target year, the shares answering each way as published, the respondent count and the source. No charts or report text beyond the statement (see NOTICE.md). Nothing here is graded.

The claim for each entry is the respondents' majority view about the target year. `majority_view` is "agree" when `share_agree` is larger than `share_disagree`, else "disagree". It compares those two answers only. Other answers (challenged the prediction, no response, "no change", "50-50") are in `share_other`. A majority view is often a plurality, not an absolute majority. When the most common answer was a third option, `plurality_answer` says so.

## Verified first

- **Publisher.** The Pew Internet & American Life Project (later Pew Research Center's Internet & Technology team) and Elon University's Imagining the Internet Center ran 16 joint canvassings, fielded 2004 to early 2023. Elon counts them as "Future of Digital Life" surveys I to XVI. From the 17th canvassing (report 2024-02-29) Elon ran the series alone as the Imagining the Digital Future Center (imaginingthedigitalfuture.org); Pew has no role.
- **First edition: report of 2005-01-09** (survey I, fielded 2004-09-20 to 2004-11-01). No earlier canvassing in the series. Elon's 2003 predictions database (1990-1995 predictions) is a different product and is not captured.
- **Samples are non-random.** Opt-in canvassings of experts and engaged internet users. Pew states no margin of error and calls later results "nonscientific". Some early reports print two columns (invited experts, all respondents); each entry says which column `share_agree` holds (`share_experts` or `share_all_respondents` holds the other).
- **Which questions have a testable horizon.**
  - Survey I (report 2005): 14 agree / disagree / challenge predictions. Most name 2014; the rest say "in the next 10 years" and are read as 2014.
  - Survey II (2006): 7 agree / disagree scenarios for 2020.
  - Survey III (2008): 8 "mostly agree" / "mostly disagree" scenarios for 2020.
  - Surveys IV (2010) and V (2012): "tension pairs", a forced choice between two opposite statements about 2020 (10 pairs and 8 pairs). `quote` holds the first statement as printed, `option_b` the second. `share_agree` is the share that chose `quote`. Watch the direction: in some pairs the first statement is the sceptical one (2010-05 semantic web, 2012-05 gamification, 2012-07 higher education).
  - Survey VI (2014 reports): yes/no questions about 2025. Five captured.
  - Surveys VII (2016, reports 2017) and VIII (2017): yes/no or three-way questions about "the next decade" with no named year. Target year read as 2026 or 2027; `confidence: medium`.
  - Surveys IX to XV (reports 2018 to 2023): one closed question per report about 2028, 2030, 2035, 2040 or 2069, then open-ended essays.
  - For yes/no, two-way and three-way questions, `answer_mapping` says which answer is `share_agree`.
- **Edition ids.** 2005, 2006 and 2008 had one report each and use the year. From 2010 Pew released several reports per year, one per question, so editions use YYYY-MM. Where two or three reports fell in the same month (2010-07, 2012-07) they share one edition file and each entry carries its own `published` date and `source_url`.
- **Quotes.** Typographic dashes are written as " - ". Omissions are marked "[...]" to stay within 400 characters.

## Editions

| Edition | Published | Report | Status | Entries | Target years | Main source |
|---|---|---|---|---|---|---|
| 2005 | 2005-01-09 | The Future of the Internet (Future of the Internet I) | complete | 14 | 2014 | https://assets.pewresearch.org/wp-content/uploads/sites/14/2016/06/PIP_Future_of_Internet.pdf |
| 2006 | 2006-09-24 | The Future of the Internet II | complete | 7 | 2020 | https://assets.pewresearch.org/wp-content/uploads/sites/14/2016/06/PIP_Future_of_Internet_2006.pdf |
| 2008 | 2008-12-14 | The Future of the Internet III | complete | 8 | 2020 | https://www.pewinternet.org/wp-content/uploads/sites/9/media/Files/Reports/2008/PIP_FutureInternet3.pdf.pdf |
| 2010-02 | 2010-02-19 | The Future of the Internet (Future of the Internet IV, AAAS paper) | complete | 5 | 2020 | https://www.pewinternet.org/wp-content/uploads/sites/9/media/Files/Reports/2010/Future-of-internet-2010-AAAS-paper.pdf |
| 2010-03 | 2010-03-31 | The Impact of the Internet on Institutions in the Future | complete | 1 | 2020 | https://www.pewresearch.org/internet/2010/03/31/the-impact-of-the-internet-on-institutions-in-the-future-2/ |
| 2010-05 | 2010-05-04 | The Fate of the Semantic Web | complete | 1 | 2020 | https://www.pewresearch.org/internet/2010/05/04/the-fate-of-the-semantic-web/ |
| 2010-06 | 2010-06-11 | The future of cloud computing | complete | 1 | 2020 | https://www.pewresearch.org/internet/2010/06/11/the-future-of-cloud-computing-2/ |
| 2010-07 | 2010-07 | The future of social relations (2010-07-02); Millennials will make online sharing in networks a lifelong habit (2010-07-09) | complete | 2 | 2020 | https://www.pewresearch.org/internet/2010/07/02/the-future-of-social-relations/ |
| 2012-02 | 2012-02-29 | Millennials will benefit and suffer due to their hyperconnected lives | complete | 1 | 2020 | https://www.pewresearch.org/internet/2012/02/29/millennials-will-benefit-and-suffer-due-to-their-hyperconnected-lives/ |
| 2012-03 | 2012-03-23 | The Future of Apps and Web | complete | 1 | 2020 | https://www.pewresearch.org/internet/2012/03/23/the-future-of-apps-and-web/ |
| 2012-04 | 2012-04-17 | The Future of Money in a Mobile Age | complete | 1 | 2020 | https://www.pewresearch.org/internet/2012/04/17/the-future-of-money-in-a-mobile-age/ |
| 2012-05 | 2012-05-18 | The Future of Gamification | complete | 1 | 2020 | https://www.pewresearch.org/internet/2012/05/18/the-future-of-gamification/ |
| 2012-06 | 2012-06-29 | The Future of Smart Systems | complete | 1 | 2020 | https://www.pewresearch.org/internet/2012/06/29/the-future-of-smart-systems/ |
| 2012-07 | 2012-07 | The Future of Corporate Responsibility (2012-07-05); The Future of Big Data (2012-07-20); The Future of Higher Education (2012-07-27) | complete | 3 | 2020 | https://www.pewresearch.org/internet/2012/07/05/the-future-of-corporate-responsibility/ |
| 2014-05 | 2014-05-14 | The Internet of Things Will Thrive by 2025 | complete | 1 | 2025 | https://www.pewresearch.org/internet/2014/05/14/internet-of-things/ |
| 2014-07 | 2014-07-03 | Net Threats | complete | 1 | 2025 | https://www.pewresearch.org/internet/2014/07/03/net-threats/ |
| 2014-08 | 2014-08-06 | AI, Robotics, and the Future of Jobs | complete | 1 | 2025 | https://www.pewresearch.org/internet/2014/08/06/future-of-jobs/ |
| 2014-10 | 2014-10-29 | Cyber Attacks Likely to Increase | complete | 1 | 2025 | https://www.pewresearch.org/internet/2014/10/29/cyber-attacks-likely-to-increase/ |
| 2014-12 | 2014-12-18 | The Future of Privacy | complete | 1 | 2025 | https://www.pewresearch.org/internet/2014/12/18/future-of-privacy/ |
| 2017-02 | 2017-02-08 | Code-Dependent: Pros and Cons of the Algorithm Age | complete | 1 | 2026 | https://www.pewresearch.org/internet/2017/02/08/code-dependent-pros-and-cons-of-the-algorithm-age/ |
| 2017-03 | 2017-03-29 | The Future of Free Speech, Trolls, Anonymity and Fake News Online | complete | 1 | 2026 | https://www.pewresearch.org/internet/2017/03/29/the-future-of-free-speech-trolls-anonymity-and-fake-news-online/ |
| 2017-05 | 2017-05-03 | The Future of Jobs and Jobs Training | complete | 1 | 2026 | https://www.pewresearch.org/internet/2017/05/03/the-future-of-jobs-and-jobs-training/ |
| 2017-06 | 2017-06-06 | The Internet of Things Connectivity Binge: What Are the Implications? | complete | 1 | 2026 | https://www.pewresearch.org/internet/2017/06/06/the-internet-of-things-connectivity-binge-what-are-the-implications/ |
| 2017-08 | 2017-08-10 | The Fate of Online Trust in the Next Decade | complete | 1 | 2026 | https://www.pewresearch.org/internet/2017/08/10/the-fate-of-online-trust-in-the-next-decade/ |
| 2017-10 | 2017-10-19 | The Future of Truth and Misinformation Online | complete | 1 | 2027 | https://www.pewresearch.org/internet/2017/10/19/the-future-of-truth-and-misinformation-online/ |
| 2018-04 | 2018-04-17 | The Future of Well-Being in a Tech-Saturated World | complete | 1 | 2028 | https://www.pewresearch.org/internet/2018/04/17/the-future-of-well-being-in-a-tech-saturated-world/ |
| 2018-12 | 2018-12-10 | Artificial Intelligence and the Future of Humans | complete | 1 | 2030 | https://www.pewresearch.org/internet/2018/12/10/artificial-intelligence-and-the-future-of-humans/ |
| 2019-10 | 2019-10-28 | Experts Optimistic About the Next 50 Years of Digital Life | complete | 1 | 2069 | https://www.pewresearch.org/internet/2019/10/28/experts-optimistic-about-the-next-50-years-of-digital-life/ |
| 2020-02 | 2020-02-21 | Many Tech Experts Say Digital Disruption Will Hurt Democracy | complete | 1 | 2030 | https://www.pewresearch.org/internet/2020/02/21/many-tech-experts-say-digital-disruption-will-hurt-democracy/ |
| 2021-02 | 2021-02-18 | Experts Say the 'New Normal' in 2025 Will Be Far More Tech-Driven, Presenting More Big Challenges | complete | 1 | 2025 | https://www.pewresearch.org/internet/2021/02/18/experts-say-the-new-normal-in-2025-will-be-far-more-tech-driven-presenting-more-big-challenges/ |
| 2021-06 | 2021-06-16 | Experts Doubt Ethical AI Design Will Be Broadly Adopted as the Norm Within the Next Decade | complete | 1 | 2030 | https://www.pewresearch.org/internet/2021/06/16/experts-doubt-ethical-ai-design-will-be-broadly-adopted-as-the-norm-within-the-next-decade/ |
| 2021-11 | 2021-11-22 | The Future of Digital Spaces and Their Role in Democracy | complete | 1 | 2035 | https://www.pewresearch.org/internet/2021/11/22/the-future-of-digital-spaces-and-their-role-in-democracy/ |
| 2022-06 | 2022-06-30 | The Metaverse in 2040 | complete | 1 | 2040 | https://www.pewresearch.org/internet/2022/06/30/the-metaverse-in-2040/ |
| 2023-02 | 2023-02-24 | The Future of Human Agency | complete | 1 | 2035 | https://www.pewresearch.org/internet/2023/02/24/the-future-of-human-agency/ |

## Not captured (with reason)

| Report (published) | Canvassing | Reason |
|---|---|---|
| Future of the Internet I: 1-10 institution-change ratings (2005-01-09) | I | 11 ratings on a 1-10 scale, no agree share. |
| Future of the Internet II: spending-priority ranking (2006-09-24) | II | Ranking question, no named year. |
| Digital Life in 2025 (2014-03-11) | VI | Open-ended question on the most significant impacts to 2025. |
| Killer Apps in the Gigabit Age (2014-10-09) | VI | Yes/no question about new bandwidth-driven apps in the US by 2025, but the report prints no yes/no shares. |
| Survey VI 8th question | VI | Pew says the canvassing had eight questions; seven are identified (impacts, IoT, net threats, jobs, killer apps, cyber attacks, privacy). The eighth was not found. |
| Survey VII other questions | VII | Pew says the 2016 canvassing had eight questions; five reports were published (all captured). The other three were not found. |
| Anecdotes / Stories From Experts About the Impact of Digital Life (2018-07-03) | IX | Open-ended, about the present. |
| How Might Tech Evolution 2019 Be Judged by Historians in 2069? (2019-10-29) | X | Open-ended. |
| The Future of Social and Civic Innovation (2020-06-30) | XI | Open-ended companion to the democracy question. |
| 2020 Digital Life: Predictions in Retrospect (2020-12-28) | Elon | A retrospective on earlier predictions, not a canvassing. Useful as evidence when grading. |
| Visions of the Internet in 2035 (2022-02-07) | XIII | Open-ended. |
| As AI Spreads, Experts Predict the Best and Worst Changes in Digital Life by 2035 (2023-06-21) | XVI | The closed question asks how respondents feel (excited / concerned) about change to 2035, not what will happen. 305 respondents: 42% equally excited and concerned, 37% more concerned, 18% more excited. |
| The Impact of Artificial Intelligence by 2040 (2024-02-29) | XVII, Elon only | Open-ended expert question; Pew no longer involved. |
| Being Human in 2035 (2025-04-02) | XVIII, Elon only | Magnitude-of-change scale and 12 better/worse ratings; no agree/disagree scenario. Not captured; a candidate for a separate capture. |
| Building a Human Resilience Infrastructure for the Age of AI (2026) | Elon only | Multi-option horizon questions (for example 82% expect AI to play a significantly larger role "in the next 10 years or less"). Not captured; a candidate for a separate capture. |

No joint edition is missing: every Pew-Elon report with a closed forecast question that could be found is captured.

## Sources used

- Pew report PDFs for surveys I to IV (assets.pewresearch.org and pewinternet.org).
- Pew report pages through the `/markdown` view of each pewresearch.org/internet report, 2010 to 2023. The Pew WordPress API (category "Future of the Internet (Project)", id 298) lists the reports.
- Elon's survey index (elon.edu/u/imagining/surveys/) and the Imagining the Digital Future Center reports page, read through web.archive.org because elon.edu did not answer from this machine.

## Open problems and source oddities

1. **2008 all-respondents line for "Next-generation research".** It prints 81% agree, 19% disagree and '*' no response, which does not fit the experts' 78% / 6% / 16%. Probably a print error; the experts' column is captured as `share_agree`.
2. **2008 transparency scenario.** Experts 45% agree / 44% disagree; all respondents 44% / 45%. The majority flips with the column.
3. **Tension-pair votes are soft.** Pew repeatedly says many respondents called their choice a hope, or said both outcomes would happen. The 2012 millennials report says the real split is "more like a 50-50 outcome than the 55-42 split".
4. **Horizon read from "next decade".** 2005 (some items), 2017 and 2018-04 entries name no year; the target year is derived and `confidence` is medium. 2019-10 (2069) has low confidence because the closed-choice wording is not printed.
5. **2005 creativity item** names no year and says nothing about a decade itself; only the survey framing gives 2014.
6. **Respondent counts vary by report within one canvassing** (2020-06 canvassing: 915 for the new-normal report, 602 for ethical AI) because each report counts people who answered at least one of its questions.
7. **Net Threats (2014-07)** prints "more than 1,400" respondents; 1,400 is recorded.
8. **Share formats.** `share_other.no_response` in 2008 is the string "<1" where Pew prints "*".
9. **Subjects** are short plain labels written for this capture. Repeated themes across editions (transparency versus privacy 2006 and 2008; telework and work-life boundaries 2005 and 2008; online anonymity; AI and human well-being) use the same subject label so they can be linked.
