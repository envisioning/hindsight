"""Parse a16z Big Ideas pages (text from totext.py) into entry drafts.

Usage: python3 parse.py <edition> <scratch_dir> [overrides.json]
Writes JSON (list of entries) to stdout. Quote is the best-scoring sentence
unless overrides.json gives {"<edition>": {"<rank>": {"quote": ..., ...}}}.
"""
import json, re, sys, os

ED = sys.argv[1]; D = sys.argv[2]
OV = json.load(open(sys.argv[3])).get(ED, {}) if len(sys.argv) > 3 else {}
SKIP = {"Table of Contents", "table of contents", "Back to top", "Follow", "X", "Linkedin",
        "Read", "About the Contributor", "More From this Contributor", ""}
URLS = {
    "2023": ["https://a16z.com/big-ideas-in-tech-for-2023-an-a16z-omnibus/"],
    "2024": ["https://a16z.com/big-ideas-in-tech-2024/"],
    "2025": ["https://a16z.com/big-ideas-in-tech-2025/"],
    "2026": ["https://a16z.com/newsletter/big-ideas-2026-part-1/",
             "https://a16z.com/newsletter/big-ideas-2026-part-2/",
             "https://a16z.com/newsletter/big-ideas-2026-part-3/"],
}

def lines(name):
    return open(os.path.join(D, name), encoding="utf-8").read().split("\n")

def parse_2023():
    L = lines("2023.txt"); out = []; cur = None
    start = next(i for i, l in enumerate(L) if l.startswith("## Breakthroughs in buying"))
    for l in L[start:]:
        if l.startswith("## a16z editorial"): break
        if l.startswith("## "):
            cur = {"label": l[3:].strip(), "section": None, "body": [], "byline": None, "url": URLS["2023"][0]}
            out.append(cur)
        elif l.startswith("—"):
            cur["byline"] = l[1:].strip()
        elif cur and l not in SKIP:
            cur["body"].append(l)
    for e in out:
        b = re.sub(r"\s*\(@[^)]*\)", "", e["byline"] or "").strip()
        m = re.search(r",\s*([^,]+?) team\s*$", b)
        e["team"] = m.group(1).strip() if m else None
        names = re.sub(r",\s*[^,]+? team\s*$", "", b)
        # drop titles: "A, general partner, and B, partner" / "A and B, partners"
        parts = re.split(r",\s*and\s+|\s+and\s+", names)
        ns = []
        for p in parts:
            ns.append(p.split(",")[0].strip())
        e["author"] = " and ".join(re.sub(r"\s+", " ", n) for n in ns if n)
    return out

SECTIONS = {"american dynamism", "bio + health", "consumer tech", "crypto", "fintech", "games",
            "growth-stage tech", "infra + enterprise", "enterprise + fintech", "infrastructure"}

def parse_2425(ed):
    L = lines(f"{ed}.txt"); out = []; cur = None; section = None; after_bio = False
    intro = next(i for i, l in enumerate(L) if "We asked" in l and "partners" in l)
    for l in L[intro + 1:]:
        if l.startswith("## Want more a16z"): break
        if l.startswith("## "):
            h = l[3:].strip()
            if h.lower() in SECTIONS:
                section = h; cur = None; continue
            cur = {"label": h, "section": section, "team": section, "body": [], "bios": [], "url": URLS[ed][0]}
            out.append(cur); after_bio = False
        elif cur is not None and l not in SKIP:
            m = re.match(r"^(.+?)\s{2,}(?:\1\s+)?(is|are|leads|was) ", l)
            if m:
                cur["bios"].append(l); after_bio = True
            elif not after_bio:
                cur["body"].append(l)
    for e in out:
        e["author"] = " and ".join(re.split(r"\s{2,}", b)[0].strip() for b in e["bios"]) or None
    return out

def parse_2026():
    out = []
    for p, url in enumerate(URLS["2026"], 1):
        L = lines(f"2026-p{p}.txt")
        if p == 3:
            start = next(i for i, l in enumerate(L) if l == "Here we go:") + 1
            section = "Crypto"
        else:
            start = next(i for i, l in enumerate(L) if l.startswith("## ") and i > 90 and "Related Content" not in l and not l.startswith("## Big Ideas")) 
            section = None
        cur = None; mode = None
        i = start
        while i < len(L):
            l = L[i]
            if l.startswith("## a16z New Media"): break
            if l.startswith("## "):
                h = l[3:].strip()
                nxt = L[i + 1] if i + 1 < len(L) else ""
                if mode == "about" and cur and h == cur["author"]:
                    mode = "bio"
                elif nxt.startswith("## ") and not nxt[3:].strip() in [x.strip() for x in []] and p != 3 and not (cur is None and False):
                    # section heading directly followed by an entry heading
                    if L[i + 2:i + 3] and not L[i + 2].startswith("## "):
                        section = h; mode = None
                    else:
                        section = h; mode = None
                else:
                    cur = {"label": h, "section": section, "team": section, "author": nxt.strip(), "body": [], "bios": [], "url": url}
                    out.append(cur); mode = "body"; i += 2; continue
            elif l == "About the Contributor":
                mode = "about"
            elif l == "More From this Contributor":
                mode = "more"
            elif cur and mode == "body" and l not in SKIP:
                cur["body"].append(l)
            elif cur and mode == "bio" and l not in SKIP:
                cur["bios"].append(l); mode = "more"
            i += 1
    return out

SENT = re.compile(r"(?<=[.!?”])\s+(?=[A-Z“\"‘(])")
def score(s, ed, idx):
    sc = 0.0
    if ed in s: sc += 3
    if re.search(r"\b(will|we’ll|we'll|I expect|I believe|predict|expect|becomes?|the year)\b", s, re.I): sc += 2
    if re.search(r"\?$", s): sc -= 3
    if len(s) < 40 or len(s) > 320: sc -= 4
    return sc - idx * 0.08

HZ = re.compile(r"\b(the year ahead|the coming year|this coming year|the upcoming year|the next year|next year|the next decade|over the next decade|the next (?:few|several|five|ten|\d+) years|in the long term|this decade)\b", re.I)

META = {
    "2023": {"title": "Big Ideas in Tech for 2023: An a16z Omnibus", "published": "2022-12-15"},
    "2024": {"title": "Big Ideas in Tech for 2024", "published": "2023-11-29",
             "published_note": "No visible date on the page. Page metadata datePublished 2023-11-29; first Wayback capture 2023-12-06."},
    "2025": {"title": "Big Ideas in Tech for 2025", "published": "2024-11-15",
             "published_note": "No visible date on the page. Page metadata datePublished 2024-11-15 (may be a draft date); first public appearance not confirmed."},
    "2026": {"title": "Big Ideas 2026 (Parts 1-3)", "published": "2025-12-09",
             "published_note": "Part 1 posted 2025-12-09, Part 2 2025-12-10, Part 3 2025-12-11."},
}

def finish(entries, ed):
    res = []
    for r, e in enumerate(entries, 1):
        body = [b for b in e["body"] if not b.startswith("Source:")]
        sents = []
        for b in body:
            sents += [x.strip() for x in SENT.split(b) if x.strip()]
        best = max(range(len(sents)), key=lambda k: score(sents[k], ed, k)) if sents else None
        q = sents[best] if best is not None else None
        ov = OV.get(str(r), {})
        q = ov.get("quote", q)
        if ov.get("quote") and not any(ov["quote"] in b for b in body):
            sys.stderr.write(f"WARN {ed} #{r}: override quote not found verbatim in body\n")
        row = {"rank": r, "label": e["label"], "section": e["section"], "quote": q,
               "subject": ov.get("subject")}
        yrs = sorted({int(y) for y in re.findall(r"\b(20[2-9]\d)\b", q or "") if int(y) >= int(ed)})
        hz = HZ.search(q or "")
        if hz: row["horizon"] = hz.group(1)
        if len(yrs) == 1: row["target_year"] = yrs[0]
        for k in ("horizon", "target_year", "metric", "value", "unit"):
            if k in ov:
                if ov[k] is None: row.pop(k, None)
                else: row[k] = ov[k]
        row.update({"author": e["author"], "team": e["team"], "source_url": e["url"],
                    "confidence": ov.get("confidence", "high")})
        if "team" in ov: row["team"] = ov["team"]
        if ov.get("note"): row["note"] = ov["note"]
        if q and len(q) > 400: sys.stderr.write(f"WARN {ed} #{r}: quote over 400 chars\n")
        if not row["subject"]: sys.stderr.write(f"WARN {ed} #{r}: no subject\n")
        res.append(row)
    return res

ents = parse_2023() if ED == "2023" else parse_2026() if ED == "2026" else parse_2425(ED)
rows = finish(ents, ED)
m = META[ED]
out = {"edition": ED, "published": m["published"], "status": "complete", "sources": URLS[ED],
       "publisher": "Andreessen Horowitz (a16z)", "series": "Big Ideas", "title": m["title"],
       "claim_type": "trend",
       "edition_framing": "Each idea is what a16z partners expect builders to tackle in " + ED + ".",
       "notes": m.get("published_note", ""), "entries": rows}
print(json.dumps(out, ensure_ascii=False, indent=2))
