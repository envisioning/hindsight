#!/usr/bin/env python3
"""Find the PDF page that holds a quote, for the #page= anchor of source_url.

Usage: python3 findpage.py <file.pdf> "<quote>" ["<quote>" ...]
       python3 findpage.py <file.pdf> --check <edition.json> <source_url prefix>

Matching ignores case, whitespace, hyphenation and punctuation, so a quote copied
from two-column text still matches. "..." in a quote splits it into parts that must
all be found on the same page. Prints the page number, or MISSING. Writes nothing.
"""
import json
import re
import subprocess
import sys


def norm(s: str) -> str:
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"[^a-z0-9]", "", s.lower())


def pages(pdf: str) -> list[str]:
    n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
    out = []
    for p in range(1, n + 1):
        t = subprocess.run(["pdftotext", "-raw", "-f", str(p), "-l", str(p), pdf, "-"], capture_output=True, text=True).stdout
        out.append(norm(t))
    return out


def find(pg: list[str], quote: str) -> str:
    parts = [norm(x) for x in re.split(r"\.\.\.|…", quote) if norm(x)]
    for i, t in enumerate(pg, 1):
        if all(p in t for p in parts):
            return str(i)
    return "MISSING"


def main() -> None:
    pdf = sys.argv[1]
    pg = pages(pdf)
    if len(sys.argv) > 2 and sys.argv[2] == "--check":
        d = json.load(open(sys.argv[3]))
        for e in d["entries"]:
            if e["source_url"].startswith(sys.argv[4]):
                anchor = e["source_url"].split("#page=")[-1]
                got = find(pg, e["quote"])
                flag = "ok" if got == anchor else "MISMATCH"
                print(f"{flag}\t{anchor}\t{got}\t{e['title'][:60]}")
        return
    for q in sys.argv[2:]:
        print(find(pg, q), "\t", q[:70])


if __name__ == "__main__":
    main()
