"""Fetch the public prediction headlines of IDC FutureScape documents.

IDC's public table-of-contents page (research/viewtoc.jsp) lists each
prediction headline ("Prediction 1: By 2027, ..."). When the live page is
gone, the Internet Archive copy is used. Output: one cache file per document,
<doc_id>.json, next to this script (gitignored).

Usage: python3 fetch.py US49563122 US50435423 ...
       python3 fetch.py --blog <doc_id> <blog_url>   (numbered "By 20XX" list in an IDC blog)
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception:
        return ""


def text(page: str) -> list[str]:
    page = re.sub(r"<script.*?</script>|<style.*?</style>", "", page, flags=re.S)
    page = html.unescape(re.sub(r"<[^>]+>", "\n", page))
    return [re.sub(r"\s+", " ", l).strip() for l in page.split("\n") if l.strip()]


def wayback(url: str) -> tuple[str, str]:
    api = "https://archive.org/wayback/available?url=" + urllib.parse.quote(url, safe="")
    try:
        snap = json.loads(get(api)).get("archived_snapshots", {}).get("closest")
    except Exception:
        snap = None
    if not snap:
        return "", ""
    raw = re.sub(r"/web/(\d+)/", r"/web/\1id_/", snap["url"])
    return get(raw), snap["url"]


def predictions(lines: list[str]) -> list[str]:
    return [l for l in lines if re.match(r"^Prediction \d+:", l)]


def fetch_toc(doc_id: str) -> dict:
    live = [f"https://www.idc.com/research/viewtoc.jsp?containerId={doc_id}",
            f"https://my.idc.com/research/viewtoc.jsp?containerId={doc_id}"]
    archived = live[:1] + [f"http://www.idc.com/research/viewtoc.jsp?containerId={doc_id}",
                           f"https://www.idc.com/getdoc.jsp?containerId={doc_id}",
                           f"http://www.idc.com/getdoc.jsp?containerId={doc_id}"]
    for url in live:
        lines = text(get(url))
        if predictions(lines):
            return pack(doc_id, lines, url)
    for url in archived:
        page, snap = wayback(url)
        lines = text(page)
        if predictions(lines):
            return pack(doc_id, lines, snap)
        time.sleep(1)
    return {"doc_id": doc_id, "source": None, "predictions": []}


def pack(doc_id: str, lines: list[str], source: str) -> dict:
    title = next((l for l in lines if "FutureScape" in l or "Predictions" in l), None)
    pub = None
    for i, l in enumerate(lines):
        if l.startswith("Publication date") and i + 1 < len(lines):
            pub = lines[i + 1].rstrip(" -")
            break
    preds = []
    for l in predictions(lines):
        m = re.match(r"^Prediction (\d+):\s*(.*)$", l)
        preds.append({"rank": int(m.group(1)), "headline": m.group(2).strip()})
    return {"doc_id": doc_id, "title": title, "publication": pub, "source": source, "predictions": preds}


def fetch_blog(doc_id: str, url: str) -> dict:
    lines = text(get(url))
    preds, rank = [], 0
    for i, l in enumerate(lines):
        if re.match(r"^\d+\. ", l) and i + 1 < len(lines) and re.match(r"^By 20\d\d", lines[i + 1]):
            rank = int(l.split(".")[0])
            preds.append({"rank": rank, "headline": lines[i + 1].strip()})
    return {"doc_id": doc_id, "title": None, "publication": None, "source": url, "predictions": preds}


def fetch_deck(key: str, url: str) -> dict:
    """An IDC deck or report (PDF) with "Prediction N: ..." or "Decision Imperative N: ..." headings. Needs pdftotext."""
    import subprocess
    pdf = HERE / f"{key}.pdf"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        pdf.write_bytes(r.read())
    raw = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True).stdout
    head = re.compile(r"^(?:Prediction|Decision Imperative) (\d+):\s*(.*)$")
    lines = raw.split("\n")
    preds = []
    for i, line in enumerate(lines):
        m = head.match(line.strip())
        if not m or int(m.group(1)) in [p["rank"] for p in preds]:
            continue
        parts = [m.group(2)]
        # A heading wraps over short lines; body text lines are longer, or a blank line ends it.
        for nxt in lines[i + 1:]:
            if not nxt.strip() or len(nxt) >= 88 or head.match(nxt.strip()):
                break
            parts.append(nxt.strip())
        preds.append({"rank": int(m.group(1)), "headline": re.sub(r"\s+", " ", " ".join(parts)).strip()})
    return {"doc_id": key, "title": None, "publication": None, "source": url, "predictions": preds}


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--deck"]:
        out = fetch_deck(args[1], args[2])
        (HERE / f"{args[1]}.json").write_text(json.dumps(out, indent=2))
        print(args[1], len(out["predictions"]))
    elif args[:1] == ["--blog"]:
        out = fetch_blog(args[1], args[2])
        (HERE / f"{args[1]}.json").write_text(json.dumps(out, indent=2))
        print(args[1], len(out["predictions"]))
    else:
        for doc_id in args:
            out = fetch_toc(doc_id)
            (HERE / f"{doc_id}.json").write_text(json.dumps(out, indent=2))
            print(doc_id, len(out["predictions"]), out["source"])
