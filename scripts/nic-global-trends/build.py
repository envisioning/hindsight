#!/usr/bin/env python3
"""Build data/raw/nic-global-trends/<edition>.json from a spec, checking every quote.

Usage: python3 build.py specs/<edition>.json <download_dir> [--force]

The spec holds the edition header plus `text_files` (extracted text, relative to
<download_dir>) and `entries`. Each entry quote marked confidence "high" must appear
verbatim in the text (compared case-insensitively with whitespace removed and
quote marks/dashes folded). Entries are written in the order their quotes appear
in the text (print order). An existing edition file is never overwritten without
--force, because claim ids are row positions (D15).
"""
import json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent.parent / "data" / "raw" / "nic-global-trends"
FOLD = str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"', "—": "-", "–": "-", "­": "", "ﬁ": "fi", "ﬂ": "fl"})


def norm(s):
    return re.sub(r"[\s\-]+", "", s.translate(FOLD).lower())


def main(spec_path, dl, force=False):
    spec = json.loads(pathlib.Path(spec_path).read_text())
    texts = [(f, norm(pathlib.Path(dl, f).read_text(errors="replace"))) for f in spec.pop("text_files")]
    out = OUT / f"{spec['edition']}.json"
    if out.exists() and not force:
        sys.exit(f"{out} exists; refusing to reorder or overwrite (D15). Use --force only before first normalize.")
    placed, bad = [], []
    for i, e in enumerate(spec["entries"]):
        q = e["quote"]
        if len(q) > 400:
            bad.append(f"too long ({len(q)}): {e['label']}")
        pos = None
        for fi, (f, t) in enumerate(texts):
            k = t.find(norm(q))
            if k >= 0:
                pos = (fi, k)
                break
        if pos is None:
            if e.get("confidence") == "high":
                bad.append(f"quote not found: {e['label']}: {q[:80]}")
            pos = (99, i)
        placed.append((pos, i, e))
    if bad:
        sys.exit("\n".join(bad))
    if spec.pop("order_by_text", True):
        placed.sort(key=lambda x: (x[0], x[1]))
    spec["entries"] = [e for _, _, e in placed]
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
    print(f"{out.name}: {len(spec['entries'])} entries")


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if x != "--force"]
    main(a[0], a[1], "--force" in sys.argv)
