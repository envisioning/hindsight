#!/usr/bin/env python3
"""Reading aid for Accenture Technology Vision PDFs.

Prints sentences that state a future year, a horizon ("within five years",
"by 2025", "next three years") or a survey share ("percent of executives"),
with page numbers. Writes nothing; capture into
data/raw/accenture-tech-vision/<edition>.json is manual.

Usage: python3 extract.py <file.pdf> [--survey]
Needs pdftotext (poppler) on PATH.
"""
import re
import subprocess
import sys

HORIZON = re.compile(
    r"(by 20[1-4]\d|in 20[1-4]\d|until 20[1-4]\d|within (the )?(next )?(one|two|three|four|five|ten|\d+) years?"
    r"|(next|coming) (one|two|three|four|five|ten|\d+) years?|over the next|in the next)",
    re.I,
)
SURVEY = re.compile(r"(\d+ ?(percent|%) of (executives|respondents|organizations|businesses|leaders|companies))", re.I)


def pages(path):
    out = subprocess.run(["pdftotext", "-raw", path, "-"], capture_output=True, text=True, check=True).stdout
    return out.split("\f")


def sentences(text):
    text = re.sub(r"-\n(?=[a-z])", "", text)
    text = re.sub(r"\s+", " ", text)
    return re.split(r"(?<=[.!?])\s+(?=[A-Z\"“])", text)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    survey = "--survey" in sys.argv
    for n, page in enumerate(pages(sys.argv[1]), start=1):
        for s in sentences(page):
            if HORIZON.search(s) or (survey and SURVEY.search(s)):
                print(f"p{n}: {s.strip()[:400]}")


if __name__ == "__main__":
    main()
