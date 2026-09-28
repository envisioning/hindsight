"""Build data/raw/idc-futurescape/<edition>.json from the fetch.py cache and annotations.py.

Usage: python3 build.py            (all editions)
       python3 build.py 2024 2025  (selected editions)
"""
import json
import re
import sys
from pathlib import Path

from annotations import A
from editions import EDITIONS

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "data" / "raw" / "idc-futurescape"

TIMING = re.compile(r"\b(by the end of|by early|by|through|into|in|from \d{4} to)\s+(20\d\d)\b", re.I)
PCT = re.compile(r"((?:over|more than|at least|nearly|almost|up to|only|just)\s+)?(\d+(?:\.\d+)?)\+?(?:%| percent)", re.I)


def parse(headline: str) -> dict:
    out = {"target_year": None, "timing": None, "value": None, "unit": None}
    m = TIMING.search(headline)
    if m:
        out["timing"] = m.group(1).lower()
        out["target_year"] = int(m.group(2))
    else:
        years = re.findall(r"\b(20\d\d)\b", headline)
        if years:
            out["target_year"] = int(years[-1])
    p = PCT.search(headline)
    if p:
        q = (p.group(1) or "").strip().lower()
        out["value"] = f"{q} {p.group(2)}".strip()
        out["unit"] = "%"
    return out


def split_label(headline: str) -> tuple[str | None, str]:
    """2016-style 'Label — By 2018, ...' and 2020-style '... #Hashtag'."""
    label = None
    tag = re.search(r"\s+#(\w[\w-]*)\s*$", headline)
    if tag:
        label = tag.group(1)
        headline = headline[: tag.start()].strip()
    m = re.match(r"^(.{3,60}?) — ((?:By|In|Through) .*)$", headline)
    if m:
        label, headline = m.group(1).strip(), m.group(2).strip()
    return label, headline


def entries_for(fs: dict) -> list[dict]:
    doc = fs.get("cache")
    if fs.get("manual"):
        # Lists typed from a secondary web page (no download to cache).
        doc = fs["manual_key"]
        cache = {"source": fs["entry_source"],
                 "predictions": [{"rank": i + 1, "headline": h} for i, h in enumerate(fs["manual"])]}
    elif doc:
        cache = json.loads((HERE / f"{doc}.json").read_text())
    else:
        return []
    notes = A.get(doc, [])
    rows = []
    for p in cache["predictions"]:
        label, quote = split_label(p["headline"])
        auto = parse(quote)
        subject, metric, over = notes[p["rank"] - 1] if len(notes) >= p["rank"] else (None, None, {})
        row = {
            "futurescape": fs["name"],
            "rank": p["rank"],
            "idc_label": label,
            "quote": quote[:400],
            "subject": subject,
            "target_year": auto["target_year"],
            "timing": auto["timing"],
            "metric": metric,
            "value": auto["value"],
            "unit": auto["unit"],
            "source_url": fs.get("entry_source") or cache["source"],
            "confidence": fs["confidence"],
            "note": None,
        }
        if fs.get("rank_unknown"):
            row["rank"] = None
            row["note"] = "Order in the source is not IDC's prediction number."
        for k, v in over.items():
            row[k] = v
        if row["idc_label"] is None:
            del row["idc_label"]
        rows.append(row)
    return rows


def build(edition: str) -> dict:
    e = EDITIONS[edition]
    entries, futurescapes = [], []
    for fs in e["futurescapes"]:
        rows = entries_for(fs)
        entries.extend(rows)
        futurescapes.append({
            "name": fs["name"],
            "title": fs["title"],
            "idc_doc": fs.get("idc_doc"),
            "published": fs.get("published"),
            "status": fs["status"],
            "stated_count": fs.get("stated_count"),
            "found_count": len(rows),
            "sources": fs["sources"],
            "note": fs.get("note"),
        })
    statuses = {f["status"] for f in futurescapes}
    return {
        "edition": edition,
        "published": e["published"],
        "status": "complete" if statuses == {"complete"} else "partial",
        "publisher": "IDC (International Data Corporation)",
        "series": "IDC FutureScape: Worldwide IT Industry Predictions; IDC FutureScape: Worldwide CIO Agenda Predictions",
        "futurescapes": futurescapes,
        "sources": sorted({s for f in futurescapes for s in f["sources"]}),
        "entries": entries,
        "notes": e.get("notes"),
    }


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for ed in sys.argv[1:] or sorted(EDITIONS):
        data = build(ed)
        (OUT / f"{ed}.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(ed, data["status"], len(data["entries"]))
