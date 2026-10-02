#!/usr/bin/env python3
"""Parse downloaded Long Bets pages into data/raw/crowd-baseline/long-bets.json.

Facts only (D35): number, kind, URL, claim text as a short quote (<= 400 chars),
start and target year, and the winner side as Long Bets marks it. No personal
names, user slugs, arguments, stakes or charities are stored.

Usage: python3 scripts/crowd-baseline/parse_long_bets.py <scratch-dir> [checked-date]
"""
import html
import json
import re
import sys
from pathlib import Path

QUOTE_MAX = 400
TITLE_MAX = 100
REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "data" / "raw" / "crowd-baseline" / "long-bets.json"
PASSED_BEFORE = 2026  # target year < this: target date has passed (checked 2026-10-02)
# Claims whose text names their own predictor: the name is replaced (AGENT-RULES, D35).
SELF_NAMED = {
    734: [(r"The Frank Value Fund", "[The predictor's fund]")],
    911: [(r"Alan Finkel", "[The predictor]")],
}


def text(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def cut(s: str, n: int) -> tuple[str, bool]:
    if len(s) <= n:
        return s, False
    head = s[: n - 1]
    sp = head.rfind(" ")
    if sp > n * 0.6:
        head = head[:sp]
    return head.rstrip(" ,;:") + "…", True


def year(y: str):
    y = y.strip()
    return int(y) if y.isdigit() else None


def listing(scratch: Path) -> dict[int, dict]:
    rows: dict[int, dict] = {}
    for f in sorted((scratch / "list").glob("*.html")):
        kind = "bet" if f.name.startswith("bets-") else "prediction"
        page = f.read_text(encoding="utf-8")
        for block in re.findall(r'<p class="(?:odd|even) clear">(.*?)</p>', page, re.S):
            m = re.search(r'bet_number"><a href="/(\d+)/', block)
            if not m:
                continue
            n = int(m.group(1))
            win = None
            if re.search(r'class="col5 predictor winner"', block):
                win = "predictor"
            elif re.search(r'class="col6 challenger winner"', block):
                win = "challenger"
            rows[n] = {"kind": kind, "list_winner": win}
    return rows


def detail(page: str) -> dict:
    t = re.search(r'<p class="type">\s*(Bet|Prediction)\s+(\d+)', page)
    d = re.search(r'<p class="duration"[^>]*>Duration <span class="big">([^<]*)</span>\s*\(([^)]*)\)', page)
    h = re.search(r"<h1>(.*?)</h1>", page, re.S)
    claim_html = re.sub(r'<a href="#adjudication_terms".*?</a>', "", h.group(1), flags=re.S) if h else ""
    claim = text(claim_html).strip("“”\" ")
    start = end = None
    if d:
        a, _, b = d.group(2).partition("-")
        start, end = year(a), year(b)
    # The winner badge sits in the predictor's or the challenger's column.
    pred_col = re.search(r'<div class="span-11 prepend-1">\s*(?:<img[^>]*>\s*)?<p class="predictor">', page)
    win = None
    if re.search(r'winbadge-detail\.gif[^>]*>\s*<p class="predictor">', page):
        win = "predictor"
    elif re.search(r'winbadge-detail\.gif[^>]*>\s*<p class="challenger">', page) or re.search(
        r'<p class="challenger">.{0,400}?winbadge-detail\.gif', page, re.S
    ):
        win = "challenger"
    return {
        "type": t.group(1) if t else None,
        "number": int(t.group(2)) if t else None,
        "duration": text(d.group(1)) if d else None,
        "start_year": start,
        "target_year": end,
        "claim": claim,
        "winner": win,
        "has_challenger": bool(re.search(r'<p class="challenger">\s*CHALLENGER<br />\s*<a ', page)),
        "has_terms": 'class="span-25 last adjudication_terms"' in page,
        "has_predictor_col": bool(pred_col),
    }


def main() -> None:
    scratch = Path(sys.argv[1])
    checked = sys.argv[2] if len(sys.argv) > 2 else "2026-10-02"
    rows = listing(scratch)
    entries = []
    problems = []
    for n in sorted(rows):
        f = scratch / "detail" / f"{n}.html"
        if not f.exists():
            problems.append(f"{n}: detail page missing")
            continue
        d = detail(f.read_text(encoding="utf-8"))
        kind = rows[n]["kind"]
        if d["number"] != n:
            problems.append(f"{n}: page number {d['number']}")
        winner = d["winner"]
        lw = rows[n]["list_winner"]
        conf = "high"
        notes = []
        if winner != lw:
            conf = "low"
            notes.append(f"winner mark differs: detail page {winner}, listing {lw}")
            winner = winner or lw
        if winner is not None:
            status = "resolved"
        elif d["target_year"] is None:
            status = "open_undated"
        elif d["target_year"] < PASSED_BEFORE:
            status = "open_passed"
        else:
            status = "open"
        claim = d["claim"]
        for pat, rep in SELF_NAMED.get(n, []):
            claim, k = re.subn(pat, rep, claim)
            if k:
                notes.append("claim text names its own predictor; name replaced")
        quote, truncated = cut(claim, QUOTE_MAX)
        title, _ = cut(claim, TITLE_MAX)
        if d["target_year"] is None:
            notes.append("Long Bets shows no end year for this record")
        if kind == "prediction" and status == "open_passed":
            notes.append("prediction never became a bet; Long Bets publishes no outcome for predictions")
        if kind == "bet" and status == "open_passed":
            notes.append("bet period over; no winner marked on longbets.org as of the check date")
        if d["has_terms"]:
            notes.append("detailed adjudication terms on the page, not stored")
        entries.append(
            {
                "platform": "long-bets",
                "longbets_no": n,
                "kind": kind,
                "title": title,
                "claim": quote,
                "claim_truncated": truncated,
                "start_year": d["start_year"],
                "target_year": d["target_year"],
                "duration_as_stated": d["duration"],
                "status": status,
                "resolution": None
                if winner is None
                else {
                    "winner_side": winner,
                    "claim_held": winner == "predictor",
                    "stated_as": "Winner badge on the bet page (longbets.org); no resolution date or text published",
                    "resolution_date": None,
                },
                "source_url": f"https://longbets.org/{n}/",
                "checked": checked,
                "confidence": conf,
                "note": "; ".join(notes) or None,
            }
        )
    OUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for e in entries:
        k = f"{e['kind']}:{e['status']}"
        counts[k] = counts.get(k, 0) + 1
    print(json.dumps({"entries": len(entries), "counts": counts, "problems": problems}, indent=2))


if __name__ == "__main__":
    main()
