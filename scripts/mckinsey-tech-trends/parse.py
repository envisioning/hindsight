#!/usr/bin/env python3
"""Parse McKinsey Technology Trends Outlook PDFs (2022-2025) into a candidate file per edition.

Input: <dir>/tto-<year>.pdf (see README.md for the URLs). Needs `pdftotext` (poppler) on PATH.
Output: <dir>/candidates-<year>.json with, per trend in printed order: label, section,
definition sentence, equity investment and job-postings figures as printed, and every
sentence in the trend's pages that names a year at or after the edition year.

The candidate file is a reading aid. Entries in data/raw/mckinsey-tech-trends/<year>.json
were chosen and checked by hand from it.

Usage: python3 parse.py <dir>
"""
import json
import re
import subprocess
import sys
from pathlib import Path

# Printed order and sections, from each edition's contents page.
TRENDS = {
    "2022": [
        ("Silicon Age", ["Advanced connectivity", "Applied AI", "Cloud and edge computing",
                         "Immersive-reality technologies", "Industrializing machine learning",
                         "Next-generation software development", "Quantum technologies",
                         "Trust architectures and digital identity", "Web3"]),
        ("Engineering Tomorrow", ["Future of bioengineering", "Future of clean energy",
                                  "Future of mobility", "Future of space technologies",
                                  "Future of sustainable consumption"]),
    ],
    "2023": [
        ("The AI revolution", ["Applied AI", "Industrializing machine learning", "Generative AI"]),
        ("Building the digital future", ["Next-generation software development",
                                         "Trust architectures and digital identity", "Web3"]),
        ("Compute and connectivity frontiers", ["Advanced connectivity", "Immersive-reality technologies",
                                                "Cloud and edge computing", "Quantum technologies"]),
        ("Cutting-edge engineering", ["Future of mobility", "Future of bioengineering",
                                      "Future of space technologies"]),
        ("A sustainable world", ["Electrification and renewables",
                                 "Climate technologies beyond electrification and renewables"]),
    ],
    "2024": [
        ("The AI revolution", ["Generative AI", "Applied AI", "Industrializing machine learning"]),
        ("Building the digital future", ["Next-generation software development",
                                         "Digital trust and cybersecurity"]),
        ("Compute and connectivity frontiers", ["Advanced connectivity", "Immersive-reality technologies",
                                                "Cloud and edge computing", "Quantum technologies"]),
        ("Cutting-edge engineering", ["Future of robotics", "Future of mobility",
                                      "Future of bioengineering", "Future of space technologies"]),
        ("A sustainable world", ["Electrification and renewables",
                                 "Climate technologies beyond electrification and renewables"]),
    ],
    "2025": [
        ("AI revolution", ["Agentic AI", "Artificial intelligence"]),
        ("Compute and connectivity frontiers", ["Application-specific semiconductors", "Advanced connectivity",
                                                "Cloud and edge computing", "Immersive-reality technologies",
                                                "Digital trust and cybersecurity", "Quantum technologies"]),
        ("Cutting-edge engineering", ["Future of robotics", "Future of mobility", "Future of bioengineering",
                                      "Future of space technologies",
                                      "Future of energy and sustainability technologies"]),
    ],
}

FORWARD = re.compile(r"\b(will|could|would|expected|expect|projected|project|forecast|estimat|anticipat|"
                     r"may|might|likely|potential|reach|by 20\d\d|target|plan|aim)", re.I)
YEAR = re.compile(r"\b(20[2-9]\d)\b")


def pdftotext(pdf: Path, layout: bool) -> str:
    args = ["pdftotext"] + (["-layout"] if layout else []) + [str(pdf), "-"]
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout


def flatten(lines):
    text = " ".join(l.strip() for l in lines if l.strip())
    text = re.sub(r"(\w)- (\w)", r"\1-\2", text)
    return re.sub(r"\s+", " ", text)


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z“\"(])", text) if s.strip()]


def block_starts(raw_lines, year, labels):
    """Line index where each trend's profile starts in the raw (reading-order) text."""
    starts = []
    pos = 0
    for label in labels:
        first = label.split()[0]
        found = None
        for i in range(pos, len(raw_lines)):
            line = raw_lines[i].strip()
            if year == "2022":
                # Profile cover: "Outlook 2022" then the trend name.
                if line.startswith(label[:25]) and i >= 2 and "Outlook 2022" in raw_lines[i - 1]:
                    found = i
                    break
            else:
                window = " ".join(l.strip() for l in raw_lines[i:i + 4])
                if line.startswith(first) and window.startswith(label[:30]):
                    tail = "\n".join(raw_lines[i:i + 40])
                    if "The trend—and why it matters" in tail:
                        found = i
                        break
        if found is None:
            starts.append(None)
            continue
        starts.append(found)
        pos = found + 1
    return starts


def metrics(layout_text, year):
    if year == "2023":
        pat = re.compile(r"^\s+(\d[\d.,]*)\s+([+–−-]\d+)(?:\s|$)", re.M)
    elif year == "2024":
        pat = re.compile(r"^\s+(\$\d[\d.,]*)\s+([+–−-]\d+%)", re.M)
    elif year == "2025":
        pat = re.compile(r"(\$\d[\d.,]* billion)\s+([+–−-]\d[\d,]*%)")
    else:
        return []
    return [(m.group(1), m.group(2)) for m in pat.finditer(layout_text)]


def main():
    d = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    for year, groups in TRENDS.items():
        pdf = d / f"tto-{year}.pdf"
        if not pdf.exists():
            print(f"skip {year}: {pdf} missing")
            continue
        raw = pdftotext(pdf, layout=False).splitlines()
        lay = pdftotext(pdf, layout=True)
        labels = [(s, t) for s, ts in groups for t in ts]
        starts = block_starts(raw, year, [t for _, t in labels])
        ms = metrics(lay, year)
        out = []
        for k, ((section, label), start) in enumerate(zip(labels, starts)):
            end = next((s for s in starts[k + 1:] if s is not None), len(raw))
            block = raw[start:end] if start is not None else []
            text = flatten(block)
            definition = None
            if year == "2025":
                m = re.search(re.escape(label) + r" (.+?)The trend—and why it matters", text)
                definition = sentences(m.group(1))[0] if m else None
            elif year == "2022":
                m = re.search(r"noteworthy technologies\? (.+)", text)
                definition = sentences(m.group(1))[0] if m else None
            else:
                m = re.search(r"The trend—and why it matters (.+)", text)
                definition = " ".join(sentences(m.group(1))[:2]) if m else None
            future = []
            for s in sentences(text):
                ys = [int(y) for y in YEAR.findall(s)]
                if any(y >= int(year) for y in ys) and FORWARD.search(s) and len(s) < 600:
                    future.append(s)
            inv, jobs = (ms[k] if k < len(ms) else (None, None))
            out.append({"rank": k + 1, "section": section, "label": label, "start_line": start,
                        "definition": definition, "equity_investment": inv, "job_postings_change": jobs,
                        "future_year_sentences": future})
        (d / f"candidates-{year}.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
        print(year, len(out), "trends;", sum(1 for s in starts if s is None), "not located;", len(ms), "metric pairs")


if __name__ == "__main__":
    main()
