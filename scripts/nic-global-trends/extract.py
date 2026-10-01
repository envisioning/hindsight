#!/usr/bin/env python3
"""Turn downloaded Global Trends PDFs/HTML into plain text for quote checking.

Usage: python3 extract.py <download_dir> [file ...]
Writes <name>.txt next to each <name>.pdf / <name>.html in <download_dir>.
PDFs need poppler's `pdftotext` on PATH; HTML uses the standard library.
"""
import html.parser, pathlib, subprocess, sys


class Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if tag in ("p", "br", "div", "li", "h1", "h2", "h3", "h4", "tr"):
            self.out.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)


def main(d):
    d = pathlib.Path(d)
    only = set(sys.argv[2:])
    for p in sorted(d.iterdir()):
        if only and p.name not in only:
            continue
        t = p.with_suffix(".txt")
        if p.suffix == ".pdf":
            subprocess.run(["pdftotext", str(p), str(t)], check=True)
        elif p.suffix in (".html", ".htm"):
            parser = Text()
            raw = p.read_bytes()
            try:
                txt = raw.decode("utf-8")
            except UnicodeDecodeError:
                txt = raw.decode("cp1252", "replace")  # 2004-era dni.gov pages
            parser.feed(txt)
            t.write_text("".join(parser.out))
        else:
            continue
        print(t.name)


if __name__ == "__main__":
    main(sys.argv[1])
