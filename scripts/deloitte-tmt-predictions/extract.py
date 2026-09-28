#!/usr/bin/env python3
"""Print the prediction sentences of one Deloitte TMT Predictions PDF.

Usage: python3 extract.py <file.pdf> [more.pdf ...]
Needs `pdftotext` (poppler) on PATH. Output: page number and each sentence
that states a prediction ("Deloitte predicts", "we predict", "we expect", ...).
The output is a reading aid for manual capture; it writes nothing.
"""
import re
import subprocess
import sys

PAT = re.compile(r"(Deloitte(?: Global)?(?: Research)? (?:predicts|expects|forecasts|estimates|believes|anticipates)|[Ww]e (?:predict|expect|forecast|estimate)|[Oo]ur prediction)")


def pages(path):
    out = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
    return out.split("\f")


def sentences(text):
    text = re.sub(r"-\n(?=[a-z])", "", text)
    text = re.sub(r"\s*\n\s*", " ", text)
    text = re.sub(r"([a-z%\)”])(\d{1,3})(?=[ .,;:])", r"\1", text)  # strip endnote markers glued to words
    return re.split(r"(?<=[.!?])\s+(?=[A-Z“\"])", text)


for path in sys.argv[1:]:
    print(f"=== {path}")
    for n, page in enumerate(pages(path), 1):
        for s in sentences(page):
            if PAT.search(s):
                print(f"p{n}: {s.strip()[:500]}")
