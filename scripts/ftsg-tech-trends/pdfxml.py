"""Load `pdftohtml -xml -i` output into pages of text runs with font signatures.

Regex-based on purpose: poppler sometimes writes control characters that make
the XML ill-formed for a strict parser.
"""
import re, html

PAGE_RE = re.compile(r'<page number="(\d+)"[^>]*width="(\d+)"[^>]*>(.*?)</page>', re.S)
FONT_RE = re.compile(r'<fontspec id="(\d+)" size="(-?\d+)" family="([^"]*)" color="([^"]*)"/>')
TEXT_RE = re.compile(r'<text top="(-?\d+)" left="(-?\d+)" width="(\d+)" height="(\d+)" font="(\d+)">(.*?)</text>', re.S)
TAG_RE = re.compile(r'<[^>]+>')


def load(path):
    raw = open(path, encoding='utf-8', errors='replace').read()
    fonts = {}
    pages = []
    for m in PAGE_RE.finditer(raw):
        pn, width, body = int(m.group(1)), int(m.group(2)), m.group(3)
        for fm in FONT_RE.finditer(body):
            fam = fm.group(3).split('+')[-1]
            fonts[fm.group(1)] = (int(fm.group(2)), fam, fm.group(4).lower())
        runs = []
        for tm in TEXT_RE.finditer(body):
            inner = tm.group(6)
            bold = '<b>' in inner
            s = html.unescape(TAG_RE.sub('', inner))
            s = s.replace('­', '').replace('\t', ' ')
            if not s.strip():
                continue
            size, fam, color = fonts[tm.group(5)]
            runs.append(dict(page=pn, top=int(tm.group(1)), left=int(tm.group(2)),
                             width=int(tm.group(3)), height=int(tm.group(4)),
                             size=size, family=fam, color=color, bold=bold, text=s))
        pages.append(dict(page=pn, width=width, runs=runs))
    return pages


def sig(r):
    return (r['size'], r['family'], r['color'])


def join_lines(lines, dehyphenate=True):
    """Join wrapped lines, removing soft hyphens at line ends before a lowercase letter."""
    out = ''
    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue
        if out.endswith('-') and not dehyphenate:
            out += ln
        elif out.endswith('-') and ln[:1].islower() and not out.endswith(' -') and not out[-2:-1].isdigit():
            out = out[:-1] + ln
        elif out:
            out += ' ' + ln
        else:
            out = ln
    return re.sub(r'\s+', ' ', out).strip()


ABBR = re.compile(r'(\b[A-Z]\.)+$|\b(Mr|Mrs|Ms|Dr|St|Inc|Corp|Co|Ltd|vs|etc|e\.g|i\.e|No|Jr|Sr)\.$')


def first_sentence(text, limit=400):
    """First sentence of text, or None if no complete sentence is found within limit."""
    text = text.strip()
    for m in re.finditer(r'[.!?]["\u201d\u2019)]?(?=\s+[A-Z\u201c"(]|\s*$)', text):
        cand = text[:m.end()].strip()
        if ABBR.search(cand) and m.end() < len(text):
            continue
        return cand if len(cand) <= limit else None
    return None
