"""Convert a downloaded a16z page to plain text with '## ' heading markers.
Usage: python3 totext.py <in.html> > out.txt"""
import re, html, sys
s = open(sys.argv[1], encoding="utf-8").read()
s = re.sub(r'<(script|style|noscript|svg)\b.*?</\1>', '', s, flags=re.S)
s = re.sub(r'<(h[1-6])[^>]*>', '\n## ', s)
s = re.sub(r'</h[1-6]>', '\n', s)
s = re.sub(r'<(p|li|br|div|figcaption|blockquote)\b[^>]*>', '\n', s)
t = html.unescape(re.sub(r'<[^>]+>', '', s)).replace('\xa0', ' ')
t = '\n'.join(l.strip() for l in t.split('\n'))
t = re.sub(r'\n\s*\n+', '\n', t)
print(t)
