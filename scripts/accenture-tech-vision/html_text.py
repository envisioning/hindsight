#!/usr/bin/env python3
"""Reading aid: strip an Accenture Technology Vision web page to plain text lines.

Usage: python3 html_text.py <page.html> > page.txt
Standard library only. Writes nothing in the repo.
"""
import html
import re
import sys

t = open(sys.argv[1], encoding="utf-8", errors="replace").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
t = html.unescape(re.sub(r"<[^>]+>", "\n", t))
print("\n".join(line.strip() for line in t.split("\n") if line.strip()))
