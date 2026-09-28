"""Build data/raw/kurzweil/*.json from Kurzweil's 2010 essay and the LessWrong 2019 statement list.

Inputs (next to this script, gitignored, see README.md):
  faring.pdf          "How My Predictions Are Faring", Ray Kurzweil, October 2010
  kurzweil_2019.csv   tab-separated list of the 105 statements for 2019 from
                      The Age of Spiritual Machines, as published with the LessWrong 2020 assessment

Needs `pdftotext` (poppler) on PATH. Run: python3 build.py
"""

import csv
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "data" / "raw" / "kurzweil"

FARING_URL = "https://www.thekurzweillibrary.com/images/How-My-Predictions-Are-Faring.pdf"
FARING_PAGE_URL = "https://www.thekurzweillibrary.com/how-my-predictions-are-faring-an-update-by-ray-kurzweil"
LW2019_URL = "https://www.lesswrong.com/posts/NcGBmDEe5qXB7dFBF/assessing-kurzweil-predictions-about-2019-the-results"
LW2019_TSV_URL = "https://www.dropbox.com/s/jmvciqv7u3rs7x5/Kurzweil_2019.tsv?dl=0"
WP_AIM = "https://en.wikipedia.org/wiki/The_Age_of_Intelligent_Machines"
WP_SIN = "https://en.wikipedia.org/wiki/The_Singularity_Is_Near"
WP_RK = "https://en.wikipedia.org/wiki/Ray_Kurzweil"
IA_AIM = "https://archive.org/details/ageofintelligent00kurz"
IA_SIN = "https://archive.org/details/singularityisnea00kurz"
GUARDIAN_2024 = "https://www.theguardian.com/technology/article/2024/jun/29/ray-kurzweil-google-ai-the-singularity-is-nearer"

MAX_QUOTE = 400


def clip(text):
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= MAX_QUOTE:
        return text, False
    cut = text[: MAX_QUOTE - 4].rsplit(" ", 1)[0]
    return cut + " ...", True


def faring_items():
    """Parse numbered predictions from the essay. Returns ASM 2009 items and SIN 2010 items."""
    txt = subprocess.run(
        ["pdftotext", "-layout", str(HERE / "faring.pdf"), "-"],
        check=True, capture_output=True, text=True,
    ).stdout
    lines = txt.split("\n")
    page_at = {}
    page = None
    for i in range(len(lines) - 1, -1, -1):
        m = re.search(r"P\s?a\s?g\s?e\s*\|\s*(\d+)", lines[i])
        if m:
            page = int(m.group(1))
        page_at[i] = page
    items, cur, mode = [], None, None
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith("LIBRARY JOURNAL PREDICTIONS"):
            break
        m = re.match(r"^(\d+)\. (.+?) \| (.+)$", s)
        if m:
            cur = {"n": int(m.group(1)), "category": m.group(2), "title": m.group(3).strip(),
                   "page": page_at.get(i), "pred": [], "verdict": None}
            items.append(cur)
            mode = None
            continue
        if cur is None:
            continue
        if s.startswith("PREDICTION:"):
            mode = "p"
            cur["pred"].append(s[len("PREDICTION:"):].strip())
        elif s.startswith("ACCURACY:"):
            cur["verdict"] = s[len("ACCURACY:"):].strip().rstrip(".")
            mode = None
        elif mode == "p" and s:
            cur["pred"].append(s)
    asm = [x for x in items if x["category"] != "For 2010"]
    sin = [x for x in items if x["category"] == "For 2010"]
    assert len(asm) == 147, len(asm)
    assert len(sin) == 10, len(sin)
    return asm, sin


# ASM chapter 10 ("2019") section per LessWrong statement number, and a short Hindsight subject label.
SECTIONS_2019 = [(1, 31, "The Computer Itself"), (32, 38, "Education"), (39, 49, "Disabilities"),
                 (50, 63, "Communication"), (64, 72, "Business and Economics"),
                 (73, 86, "Politics and Society"), (87, 91, "The Arts"), (92, 94, "Warfare"),
                 (95, 101, "Health and Medicine"), (102, 105, "Philosophy")]
SUBJECTS_2019 = {
    1: "Invisible embedded computers", 2: "3D direct-eye displays in glasses and contacts",
    3: "Retinal projection displays", 4: "Direct-eye display modes", 5: "Auditory lenses",
    6: "Keyboards rare", 7: "Gesture and speech interfaces", 8: "Human-like computer interaction",
    9: "Assistant personalities", 10: "Custom assistant personalities", 11: "Many personal computing devices",
    12: "Ubiquitous high-bandwidth communication", 13: "Cables disappear",
    14: "USD 4,000 device equals human brain capacity", 15: "Nonhuman share of total computing capacity",
    16: "Rotating memory fully replaced", 17: "3D nanotube lattice circuits",
    18: "Neural nets and genetic algorithms dominate compute", 19: "Brain reverse engineering by scanning",
    20: "Specialized brain regions recognized", 21: "Brain algorithms applied to neural nets",
    22: "Genetic code and brain wiring", 23: "Evolutionary wiring of neural nets",
    24: "Quantum diffraction optical imaging", 25: "Pinhead cameras everywhere",
    26: "Autonomous nanoengineered machines", 27: "Commercial nanomachines",
    28: "Thin high-resolution handheld displays", 29: "Reading on displays and direct-eye displays",
    30: "Paper books rarely used", 31: "Paper documents scanned and online",
    32: "Simulated teachers", 33: "Remote human teachers", 34: "Teachers as mentors",
    35: "Remote student gatherings", 36: "All students use computation", 37: "Computation everywhere for students",
    38: "Adult workers mostly learning", 39: "Reading-navigation glasses for the blind",
    40: "Reading-navigation systems read real-world text", 41: "Navigation systems for the blind",
    42: "Reading-navigation assistants voice interface", 43: "Reading-navigation systems used by sighted",
    44: "Retinal and vision implants", 45: "Speech-to-text lens displays for the deaf",
    46: "Visual and tactile music for the deaf", 47: "Cochlear implants widely used",
    48: "Exoskeletons for paraplegics", 49: "Disabilities not significant",
    50: "Remote presence for anything", 51: "3D phone calls via direct-eye displays",
    52: "3D holography displays", 53: "Telepresence realism", 54: "Telepresence resolution",
    55: "Telepresence indistinguishable from physical presence", 56: "Most meetings remote",
    57: "Speech-to-speech translation", 58: "Media consumption via wearable devices",
    59: "Full tactile virtual environment", 60: "Tactile VR resolution", 61: "Haptic VR booths",
    62: "Haptic VR for medicine and sex", 63: "Haptic VR preferred mode",
    64: "Continued economic expansion", 65: "Simulated persons in transactions",
    66: "Assistant-to-agent transactions", 67: "Agents exchange structured knowledge",
    68: "Household robots ubiquitous", 69: "Automated driving systems on nearly all roads",
    70: "Automated driving on highways", 71: "Personal flying vehicles with microflaps",
    72: "Very few transportation accidents", 73: "Relationships with automated personalities",
    74: "Automated personalities superior in some ways", 75: "Automated personalities not equal to humans",
    76: "Concern about machine intelligence", 77: "Human intelligence advantages harder to state",
    78: "Machine intelligence interwoven in civilization", 79: "Human agent of responsibility by law",
    80: "Decisions involve machine intelligence", 81: "Machine monitoring of public spaces",
    82: "Encryption and privacy", 83: "Human underclass as issue", 84: "Basic necessities provided",
    85: "Productive engagement debate", 86: "Productive engagement unclear",
    87: "Virtual artists", 88: "Cybernetic artists affiliated with humans",
    89: "Interest in creative machines", 90: "Human-machine art collaboration",
    91: "Virtual-experience software top entertainment", 92: "Security threat from small groups with AI",
    93: "Software viruses and bioengineered agents", 94: "Tiny flying weapons",
    95: "Genome life processes understood", 96: "Life expectancy increase",
    97: "Bioengineering danger recognized", 98: "Easy creation of disease agents",
    99: "Bioengineered defences", 100: "Wearable health monitors", 101: "Health monitor recommendations",
    102: "Reports of computers passing Turing test", 103: "No valid Turing test pass yet",
    104: "Machine subjective experience discussed", 105: "Machine intelligence subservient",
}


def lw_2019():
    rows = list(csv.reader(open(HERE / "kurzweil_2019.csv", encoding="utf-8"), delimiter="\t"))
    assert len(rows) == 105, len(rows)
    out = []
    for n_str, statement in rows:
        n = int(n_str)
        context = None
        text = statement.strip()
        m = re.match(r"^\[([^\]]*)\]\s*(.+)$", text)
        if m and len(m.group(1)) > 25:  # leading context block added by the list compiler
            context, text = m.group(1), m.group(2)
        m = re.match(r"^(.+?)\s*\[(\"similar\"[^\]]*)\]$", text)
        if m:
            text = m.group(1)
        quote, clipped = clip(text)
        section = next(name for lo, hi, name in SECTIONS_2019 if lo <= n <= hi)
        notes = ["Statement text from the data file published with the LessWrong 2020 assessment (" + LW2019_TSV_URL + "), which splits the chapter into 105 statements."]
        if context:
            notes.append("The source list repeats the preceding sentence as bracketed context; the context is not repeated here.")
        if clipped:
            notes.append("Quote clipped to 400 characters.")
        e = {
            "rank": n,
            "kind": "decade_prediction",
            "section": section,
            "quote": quote,
            "subject": SUBJECTS_2019[n],
            "target_year": 2019,
            "timing": "in",
            "position": "Chapter 10, \"2019\"",
            "source_url": LW2019_URL,
            "confidence": "medium",
        }
        if notes:
            e["note"] = " ".join(notes)
        out.append(e)
    return out


def edition_1999(asm):
    entries = []
    for i, x in enumerate(asm, 1):
        quote, clipped = clip(" ".join(x["pred"]))
        e = {
            "rank": i,
            "kind": "decade_prediction",
            "section": x["category"],
            "quote": quote,
            "subject": x["title"],
            "target_year": 2009,
            "timing": "in",
            "position": f"Chapter 9, \"2009\"; item {x['category']} {x['n']} in Kurzweil 2010, p. {x['page']}",
            "source_url": FARING_URL,
            "confidence": "high",
        }
        note = "Wording as reproduced by the author in \"How My Predictions Are Faring\" (2010); book page not given there. Subject label is the essay's own item heading."
        if clipped:
            note += " Quote clipped to 400 characters."
        e["note"] = note
        entries.append(e)
    start = len(entries)
    for e in lw_2019():
        e["rank"] = start + e["rank"]
        entries.append(e)
    return {
        "edition": "1999",
        "published": "1999-01",
        "status": "partial",
        "publisher": "Viking",
        "title": "The Age of Spiritual Machines: When Computers Exceed Human Intelligence",
        "author": "Ray Kurzweil",
        "stated_count": None,
        "found_count": len(entries),
        "sources": [FARING_URL, LW2019_URL, LW2019_TSV_URL, "https://archive.org/details/ageofspiritualma0000kurz"],
        "entries": entries,
        "notes": (
            "The book has four prediction chapters: 2009 (Chapter 9), 2019 (Chapter 10), 2029 (Chapter 11) and 2099 (Chapter 12). "
            "2009: all 147 predictions, as the author lists them in his 2010 essay (the essay states 147). "
            "2019: 105 statements, as split and transcribed by the LessWrong 2020 assessment (secondary; confidence medium). "
            "2029 and 2099: not captured. No public page with the text was found; the book is only in the Internet Archive lending library, whose text is not public. "
            "Dollar figures are in 1999 dollars (stated in the book)."
        ),
    }


def edition_1990():
    e = [
        dict(quote="we will see a [computer] world champion by the year 2000", subject="Computer chess world champion",
             target_year=2000, timing="by", position="p. 133", source_url=f"{IA_AIM}/page/133", confidence="medium",
             note="Quoted by Wikipedia (The Age of Intelligent Machines), bracket added there. Book page in the Internet Archive lending copy."),
        dict(quote="A personal computer with the necessary attributes should become available around the end of this century.",
             subject="Educational workstation computer available", target_year=2000, timing="around",
             position="pp. 429-430", source_url=FARING_URL, confidence="high",
             note="Reprinted with page reference by the author in \"How My Predictions Are Faring\" (2010), p. 125. 'This century' is the 20th century."),
        dict(quote="With the historical ten-year lag of the educational field in adopting new computer technology, we can expect a critical mass level of ubiquitous utilization of such technology by the end of the first decade of the next century.",
             subject="Ubiquitous computers in education", target_year=2010, timing="by the end of",
             position="pp. 429-430", source_url=FARING_URL, confidence="high",
             note="Reprinted by the author in \"How My Predictions Are Faring\" (2010), p. 125. The technology is the listed 'educational workstation': every child has a portable, wireless, voice-capable computer with intelligent courseware."),
        dict(quote="We can expect the personal computers of 2010 to have considerable knowledge of where to find knowledge.",
             subject="Personal computers as knowledge finders", target_year=2010, timing="in",
             position="pp. 432-434", source_url=FARING_URL, confidence="high",
             note="Reprinted by the author in \"How My Predictions Are Faring\" (2010), p. 126. The passage continues with computers that find, organize and present information through wireless networks and engage in dialog."),
        dict(quote="Adoption of the advanced media technologies described here will begin in the late 1990s and mature over the first half of the next century.",
             subject="Advanced media technologies adoption", target_year=2050, timing="over the first half of",
             position="p. 414", source_url=FARING_URL, confidence="high",
             note="Reprinted by the author in \"How My Predictions Are Faring\" (2010), p. 126. Range: adoption begins late 1990s, matures by 2050. target_year is the end of the range."),
        dict(quote=None, subject="Translating telephone", target_year=2010, timing="by",
             position="p. 411", source_url=WP_AIM, confidence="low",
             paraphrase="If trends continue, a \"translating telephone\" by 2010 (Wikipedia summary of the book; only the phrase in quotation marks is the book's).",
             note="No verbatim public quotation found."),
        dict(quote=None, subject="Driverless car", target_year=2050, timing="well into the first half of the 21st century",
             position="p. 411", source_url=WP_AIM, confidence="low",
             paraphrase="A \"completely driverless car\" by \"well into the first half\" of the 21st century (Wikipedia summary; quoted fragments are the book's).",
             note="No explicit year; target_year 2050 is the end of the stated range."),
        dict(quote="sometime between 2020 and 2070", subject="Turing test passed", target_year=2070, target_year_earliest=2020,
             timing="between", position="p. 416", source_url=WP_AIM, confidence="medium",
             note="Fragment quoted by Wikipedia: the test will be passed 'sometime between 2020 and 2070' to a degree that no reasonable person familiar with the field questions the result."),
    ]
    for i, x in enumerate(e, 1):
        x["rank"] = i
        x["kind"] = "dated_prediction"
    return {
        "edition": "1990",
        "published": "1990",
        "status": "partial",
        "publisher": "MIT Press",
        "title": "The Age of Intelligent Machines",
        "author": "Ray Kurzweil",
        "stated_count": None,
        "found_count": len(e),
        "sources": [FARING_URL, WP_AIM, IA_AIM],
        "entries": [reorder(x) for x in e],
        "notes": (
            "The book has no numbered prediction list. Captured: passages with an explicit year or year range that are public "
            "(the author's 2010 essay reprints several passages with page numbers; Wikipedia quotes others with page numbers). "
            "Passages without a year (robotic home servants 'early next century' p. 322, customized clothes pp. 427-428, national patient databanks p. 439, reading machines for the blind p. 441, Soviet Union and open communication pp. 445-447) are not captured. "
            "The author's 2010 essay discusses these passages but gives no verdicts for them."
        ),
    }


def edition_2005(sin):
    e = []
    for x in sin:
        quote, _ = clip(" ".join(x["pred"]).rstrip("”\""))
        e.append(dict(quote=quote, subject=x["title"], target_year=2010, timing="around",
                      position=f"Chapter 6; item {x['n']} in Kurzweil 2010, p. {x['page']}",
                      source_url=FARING_URL, confidence="high",
                      note="Wording as reproduced by the author in \"How My Predictions Are Faring\" (2010), which says the book has 'one page of predictions for 2010 in Chapter 6'. Subject label is the essay's own item heading."))
    e += [
        dict(quote=None, subject="Supercomputer with human brain capacity", target_year=2010, timing="by",
             position="p. 25", source_url=WP_SIN, confidence="medium",
             paraphrase="By 2010 a supercomputer will have the computational capacity to emulate human intelligence (Wikipedia summary)."),
        dict(quote="by around 2020 ... for one thousand dollars", subject="USD 1,000 computer with human brain capacity", target_year=2020,
             timing="by around", position="p. 126", source_url=WP_SIN, confidence="medium",
             note="Fragments quoted by Wikipedia: the capacity to emulate human intelligence will be available 'by around 2020' 'for one thousand dollars'."),
        dict(quote="by the mid-2020s", subject="Effective software model of human intelligence", target_year=2025,
             timing="by the mid", position="p. 25", source_url=WP_SIN, confidence="medium",
             note="Fragment quoted by Wikipedia: brain scanning will contribute to an effective model of human intelligence 'by the mid-2020s'. target_year 2025 marks the mid-decade."),
        dict(quote=None, subject="Turing test passed", target_year=2029, timing="by",
             position="p. 200", source_url=WP_SIN, confidence="medium",
             paraphrase="Computers will pass the Turing test by 2029 (Wikipedia summary)."),
        dict(quote="capacity of all living biological human intelligence", subject="Nonbiological computation exceeds human intelligence",
             target_year=2030, timing="by the early", position="p. 135", source_url=WP_SIN, confidence="medium",
             note="Fragment quoted by Wikipedia: by the early 2030s nonbiological computation will exceed the 'capacity of all living biological human intelligence'. target_year 2030 marks the start of the decade."),
        dict(quote="I set the date for the Singularity—representing a profound and disruptive transformation in human capability—as 2045.",
             subject="Technological singularity", target_year=2045, timing="in", position="p. 136",
             source_url=WP_SIN, confidence="medium", note="Quoted by Wikipedia with page reference. Book in the Internet Archive lending library: " + IA_SIN),
    ]
    for i, x in enumerate(e, 1):
        x["rank"] = i
        x["kind"] = "dated_prediction"
    return {
        "edition": "2005",
        "published": "2005-09",
        "status": "partial",
        "publisher": "Viking",
        "title": "The Singularity Is Near: When Humans Transcend Biology",
        "author": "Ray Kurzweil",
        "stated_count": None,
        "found_count": len(e),
        "sources": [FARING_URL, WP_SIN, IA_SIN],
        "entries": [reorder(x) for x in e],
        "notes": (
            "Chapter 6 has a page of predictions for 2010 (all ten captured from the author's 2010 essay) and a page for 2030 (not captured: no public text found). "
            "Other dated claims are spread through the book; captured only where Wikipedia quotes or summarises them with a page number. "
            "Paraphrased entries have quote null and a 'paraphrase' field."
        ),
    }


def edition_2010():
    e = [
        dict(quote="Translating telephone technology is likely to become quite popular on many smartphones worldwide in 2010.",
             subject="Translating telephone apps", target_year=2010, timing="in", position="p. 8",
             source_url=FARING_URL, confidence="high"),
        dict(quote="One of my key (and consistent) predictions is that a computer will pass the Turing test by 2029.",
             subject="Turing test passed", target_year=2029, timing="by", position="p. 9",
             source_url=FARING_URL, confidence="high",
             note="Restates earlier books. The essay refers to the Long Bets wager with Mitch Kapor (Long Bet 1) on the same claim."),
        dict(quote="In my view, it will take about two decades to fully simulate the human brain, around 2029, but that is still not far away.",
             subject="Full human brain simulation", target_year=2029, timing="around", position="p. 122",
             source_url=FARING_URL, confidence="high"),
    ]
    for i, x in enumerate(e, 1):
        x["rank"] = i
        x["kind"] = "dated_prediction"
    return {
        "edition": "2010",
        "published": "2010-10",
        "status": "complete",
        "publisher": "KurzweilAI (self-published essay, PDF)",
        "title": "How My Predictions Are Faring",
        "author": "Ray Kurzweil",
        "stated_count": None,
        "found_count": len(e),
        "sources": [FARING_URL, FARING_PAGE_URL],
        "entries": [reorder(x) for x in e],
        "notes": (
            "Mainly a self-assessment of earlier books; the author's verdicts are in self_assessment.json. "
            "This file holds only the new or restated forward claims in the author's own voice with an explicit year. "
            "Forecasts the essay attributes to others (IDC, analysts, IBM, Cray, Blue Brain) are not captured."
        ),
    }


def edition_2024():
    note = "Stated by the author in an Observer (Guardian) interview about the book, published 2024-06-29; not the book text."
    e = [
        dict(quote="So 2029, both for human-level intelligence and for artificial general intelligence (AGI) – which is a little bit different.",
             subject="Human-level AI and AGI", target_year=2029, timing="by"),
        dict(quote="LLM hallucinations [where they create nonsensical or inaccurate outputs] will become much less of a problem, certainly by 2029",
             subject="LLM hallucinations", target_year=2029, timing="by"),
        dict(quote="We are going to expand intelligence a millionfold by 2045 and it is going to deepen our awareness and consciousness.",
             subject="Technological singularity", target_year=2045, timing="by", metric="expansion of intelligence", value="1000000", unit="x"),
        dict(quote="Universal basic income will start in the 2030s, which will help cushion the harms of job disruptions.",
             subject="Universal basic income", target_year=2030, timing="in the",
             extra="target_year 2030 marks the start of the decade."),
        dict(quote="In the early 2030s we can expect to reach longevity escape velocity where every year of life we lose through ageing we get back from scientific progress.",
             subject="Longevity escape velocity", target_year=2030, timing="in the early",
             extra="target_year 2030 marks the start of the decade."),
        dict(quote="I'm also intending to create a replicant of myself [an afterlife AI avatar], which is an option I think we'll all have in the late 2020s.",
             subject="AI replicants of people", target_year=2027, timing="in the late",
             extra="target_year 2027 marks the late 2020s."),
        dict(quote=None, subject="Medical nanobots", target_year=2030, timing="in the",
             paraphrase="Medical nanobots arriving in the 2030s that enter the body and carry out repairs (the interviewer's summary of the book).",
             confidence="low"),
        dict(quote=None, subject="Mind uploading and after-life technology", target_year=2040, timing="in the",
             paraphrase="'After life' technology in the 2040s that uploads minds so they can be restored (the interviewer's summary of the book).",
             confidence="low"),
    ]
    out = []
    for i, x in enumerate(e, 1):
        extra = x.pop("extra", None)
        x.setdefault("confidence", "medium")
        x["position"] = "interview"
        x["source_url"] = GUARDIAN_2024
        x["note"] = note + (" " + extra if extra else "")
        x["rank"] = i
        x["kind"] = "dated_prediction"
        out.append(reorder(x))
    return {
        "edition": "2024",
        "published": "2024-06-25",
        "status": "partial",
        "publisher": "Viking",
        "title": "The Singularity Is Nearer: When We Merge with AI",
        "author": "Ray Kurzweil",
        "stated_count": None,
        "found_count": len(out),
        "sources": [GUARDIAN_2024, "https://en.wikipedia.org/wiki/The_Singularity_Is_Nearer"],
        "entries": out,
        "notes": (
            "No public text or publisher excerpt of the book was read in this capture. Entries come from the author's statements "
            "in a launch interview (The Observer, 2024-06-29), which restate the book's dates (2029 AGI, 2045 singularity). "
            "Confidence medium for the author's own words, low for the interviewer's summaries. Book page references are missing."
        ),
    }


FIELD_ORDER = ["rank", "kind", "section", "quote", "paraphrase", "subject", "target_year", "target_year_earliest",
               "timing", "metric", "value", "unit", "position", "source_url", "confidence", "note"]


def reorder(x):
    return {k: x[k] for k in FIELD_ORDER if k in x}


def norm_verdict(v):
    v = v.split("(")[0].strip()
    return v[:1].upper() + v[1:].lower()


def self_assessment(asm, sin):
    rows = []
    for i, x in enumerate(asm, 1):
        quote, _ = clip(" ".join(x["pred"]))
        rows.append({"edition": "1999", "entry_rank": i, "item": f"{x['category']} {x['n']}", "prediction": quote,
                     "target_year": 2009, "verdict": norm_verdict(x["verdict"]), "verdict_text": x["verdict"],
                     "essay_page": x["page"]})
    for i, x in enumerate(sin, 1):
        quote, _ = clip(" ".join(x["pred"]).rstrip("”\""))
        rows.append({"edition": "2005", "entry_rank": i, "item": f"{x['category']} {x['n']}", "prediction": quote,
                     "target_year": 2010, "verdict": norm_verdict(x["verdict"]), "verdict_text": x["verdict"],
                     "essay_page": x["page"]})
    counts = {}
    for r in rows:
        if r["edition"] == "1999":
            counts[r["verdict"]] = counts.get(r["verdict"], 0) + 1
    return {
        "assessor": "Ray Kurzweil (the author grading his own predictions)",
        "title": "How My Predictions Are Faring",
        "published": "2010-10",
        "source_url": FARING_URL,
        "status_note": "These are the author's own claims about his accuracy, not Hindsight grades.",
        "stated_totals_1999_for_2009": {"predictions": 147, "Correct": 115, "Essentially correct": 12,
                                        "Partially correct": 17, "Wrong": 3},
        "found_totals_1999_for_2009": counts,
        "verdict_scale": "Correct; Essentially correct (the author: likely true within a year or a couple of years); Partially correct; Wrong. 'verdict' is normalised for case; 'verdict_text' is as printed (one item reads 'Wrong (about ten years off)').",
        "rows": rows,
        "notes": "The essay also reprints passages from The Age of Intelligent Machines (1990) with discussion but no verdicts; they are not rows here. For The Singularity Is Near the essay grades the ten 2010 predictions while 2010 was not yet over.",
    }


def write(name, obj):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", name, len(obj.get("entries", obj.get("rows", []))))


def main():
    asm, sin = faring_items()
    write("1990.json", edition_1990())
    write("1999.json", edition_1999(asm))
    write("2005.json", edition_2005(sin))
    write("2010.json", edition_2010())
    write("2024.json", edition_2024())
    write("self_assessment.json", self_assessment(asm, sin))


if __name__ == "__main__":
    main()
