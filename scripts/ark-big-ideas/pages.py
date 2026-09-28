"""Print the pages of a Big Ideas text dump that contain a dated forward claim.

Usage: python3 pages.py <edition>.txt [min_year]
Input: the output of `pdftotext -layout <edition>.pdf <edition>.txt`.
Output: page number, then the page text with runs of whitespace collapsed.
A page prints only if it names a year >= min_year (default: the edition year)
next to a forecast word. The output is a reading aid; entries are written by hand.
"""
import re
import sys

path = sys.argv[1]
edition = int(re.search(r"(20\d\d)", path.split("/")[-1]).group(1))
min_year = int(sys.argv[2]) if len(sys.argv) > 2 else edition
text = open(path, encoding="utf-8", errors="ignore").read()
words = re.compile(r"\b(forecast|expect|estimat|could|will|should|project|by|in|through|target|base case|bull|bear)\b", re.I)
for i, page in enumerate(text.split("\f"), start=1):
    flat = re.sub(r"[ \t]+", " ", page)
    flat = re.sub(r"\n\s*\n+", "\n", flat).strip()
    years = [int(y) for y in re.findall(r"\b(20[1-5]\d)\b", flat)]
    if any(y >= min_year for y in years) and words.search(flat):
        # drop the boilerplate disclaimer lines
        lines = [l for l in flat.split("\n") if not re.search(r"not a recommendation|Forecasts are inherently limited|past performance|informational purposes|ark-invest\.com\s*$", l, re.I)]
        print(f"=== p{i}")
        print("\n".join(lines))
