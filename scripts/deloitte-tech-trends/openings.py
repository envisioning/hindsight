#!/usr/bin/env python3
"""Print chapter openings and horizon sentences from a Tech Trends edition.

Input: plain text made by `pdftotext <edition>.pdf <edition>.raw.txt` (no -layout),
pages separated by form feeds. Chapter titles are passed as arguments, in printed
order; each chapter runs from the first page (after the contents) whose top
contains the title to the next chapter's first page.

Usage:
  python3 openings.py <edition>.raw.txt [--skip N] "Title one" "Title two" ...

Prints, per chapter: start page, the first ~900 characters, and every sentence in
the chapter that states a time horizon (18 to 24 months, next N years, by 20NN).
The output is a reading aid only; the JSON files are written by hand from it.
"""
import re
import sys

HORIZON = re.compile(
    r"(18\s*(to|–|-)\s*24 months|next (two|three|five|few|18|\d+) (years|months)|"
    r"coming (two|three|five|few|\d+) years|within (two|three|five|\d+) years|"
    r"by 20[1-4]\d|\bnow\b.{0,40}\bnext\b)",
    re.I,
)


def clean(s):
    s = s.replace("ﬁ", "fi").replace("ﬂ", "fl").replace("­", "")
    s = re.sub(r"-\n(?=[a-z])", "", s)
    return re.sub(r"\s+", " ", s)


def main():
    args = sys.argv[1:]
    path = args.pop(0)
    skip = 3
    if args and args[0] == "--skip":
        args.pop(0)
        skip = int(args.pop(0))
    pages = open(path, encoding="utf-8", errors="replace").read().split("\f")
    starts = []
    for title in args:
        key = clean(title).lower()
        lo = starts[-1] + 1 if starts else skip
        found = None
        for i in range(lo, len(pages)):
            head = clean(pages[i][:600]).lower()
            if key in head:
                found = i
                break
        starts.append(found if found is not None else lo)
        if found is None:
            print(f"!! not found: {title}")
    for n, title in enumerate(args):
        a = starts[n]
        b = starts[n + 1] if n + 1 < len(args) else min(a + 20, len(pages))
        text = clean(" ".join(pages[a:b]))
        print(f"===== {n + 1}. {title} (pages {a}-{b - 1})")
        print(text[:900])
        sents = re.split(r"(?<=[.!?])\s+(?=[A-Z“\"])", text)
        hits = [s for s in sents if HORIZON.search(s)]
        for s in hits[:8]:
            print("  >>", s[:400])
        print()


if __name__ == "__main__":
    main()
