#!/usr/bin/env python3
"""Check that every quote in data/raw/deloitte-tech-trends/<edition>.json occurs in the edition text.

Input: a folder holding tt<edition>.pdf files (see README.md). The script runs
`pdftotext -raw` on each PDF (poppler) and compares quotes and text after
lowercasing and dropping everything except letters and digits, so line breaks,
hyphenation and ligatures do not matter.

Usage:
  python3 verify_quotes.py <folder-with-pdfs> [edition ...]
"""
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
DATA = HERE.parent.parent / "data" / "raw" / "deloitte-tech-trends"


def norm(s):
    s = s.replace("ﬁ", "fi").replace("ﬂ", "fl").replace("­", "")
    s = re.sub(r"-\s*\n\s*", "", s)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    folder = pathlib.Path(sys.argv[1])
    editions = sys.argv[2:] or sorted(p.stem for p in DATA.glob("20*.json"))
    bad = 0
    for ed in editions:
        pdf = folder / f"tt{ed}.pdf"
        if not pdf.exists():
            print(f"{ed}: no PDF at {pdf}")
            continue
        text = subprocess.run(["pdftotext", "-raw", str(pdf), "-"], capture_output=True, text=True).stdout
        t = norm(text)
        d = json.loads((DATA / f"{ed}.json").read_text())
        miss = [e["rank"] for e in d["entries"] if norm(e["quote"]) not in t]
        bad += len(miss)
        print(f"{ed}: {len(d['entries'])} entries, quotes not found: {miss}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
