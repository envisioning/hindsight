"""Parse the World Bank GEP "gdp-growth" table PDFs (one page each) after
`pdftotext -layout`. Returns the main block of years in the first real GDP
table on the page and {economy: {year: value}}. Standard library only.

Values are assigned to a year by the horizontal position of the number under
the year header (nearest header column, at most 7 characters away), so blank
cells and the extra "difference from previous forecast" columns are handled.
"""
import re

# en dash, minus sign, and the odd glyphs some PDFs use as a minus sign
NEG = re.compile('[–−⫺ⵚⴚ]')
YEAR = re.compile(r'^((?:19|20)\d{2})[a-z*†]{0,2}$')
NUM = re.compile(r'(?<=\s)(-?\d{1,3}\.\d)(\*?)(?=\s|$)')
FOOTNOTE_ONLY = re.compile(r'\d+(,\s*\d+)*')

# economy -> label pattern (full match on the row label, trailing footnote marks removed)
TARGETS = [
    ('World', r'World( total| GDP.*)?'),
    ('Advanced economies', r'Advanced economies'),
    ('High-income countries', r'High[- ]income( countries)?'),
    ('Emerging market and developing economies', r'(Emerging (market )?and developing economies|EMDEs)( \(EMDEs\))?'),
    ('Developing countries', r'(Developing countries( in)?|Low- and middle-income countries)'),
    ('United States', r'United States'),
    ('Euro area', r'Euro [Aa]rea'),
    ('Japan', r'Japan'),
    ('China', r'China'),
    ('India', r'India'),
    ('Brazil', r'Brazil'),
]


def decode_shifted(text):
    """Some PDFs (January 2018) use a font whose codes are the characters
    shifted down by 29 (':RUOG' = 'World', 0x15 0x13 = '20')."""
    return '\n'.join(''.join(c if c == ' ' else chr(ord(c) + 29) for c in l) for l in text.split('\n'))


def header(lines):
    for i, l in enumerate(lines):
        toks = [(m.group(0), m.start(), m.end()) for m in re.finditer(r'\S+', l)]
        yrs = [(int(YEAR.match(t).group(1)), (s + e) / 2, t) for t, s, e in toks if YEAR.match(t)]
        if len(yrs) >= 3:
            block = [yrs[0]]
            for y in yrs[1:]:
                if y[0] == block[-1][0] + 1:
                    block.append(y)
                else:
                    break
            if len(block) >= 3:
                return i, block
    return None, None


def strip_marks(label):
    return re.sub(r'([\s,]*\d+(,\s*\d+)*|(?<=[a-z])[a-z])$', '', label).strip()


def parse(text):
    shifted = ':RUOG' in text
    if shifted:
        text = decode_shifted(text)
    lines = [NEG.sub('-', l) for l in text.split('\n')]
    hi, block = header(lines)
    if hi is None:
        return None, {}, {}, {}, shifted
    out, labels, flags = {}, {}, {}
    seen_world = False
    pending = ''
    body = lines[hi + 1:]
    for idx, l in enumerate(body):
        nums = [(float(m.group(1)), m.start(), m.end(), m.group(2)) for m in NUM.finditer(l)]
        if not nums:
            t = l.strip()
            pending = (pending + ' ' + t).strip() if pending and t else t
            continue
        label = re.split(r'\s{2,}', l[:nums[0][1]].strip())[0] if l[:nums[0][1]].strip() else ''
        nxt = body[idx + 1].strip() if idx + 1 < len(body) else ''
        if pending.startswith('Emerging') and (not label or label.startswith('economies')):
            label = pending + (' ' + label if label else '')
            if 'EMDE' not in label and nxt.startswith('economies'):
                label += ' ' + nxt
        elif FOOTNOTE_ONLY.fullmatch(label) and nxt and not NUM.search(' ' + nxt):
            label = nxt  # label printed on the line below its values (January 2011 layout)
        elif not label and pending:
            label = pending
        pending = ''
        lab = strip_marks(label) if label not in ('World', 'Japan', 'China', 'India', 'Brazil') else label
        for name, pat in TARGETS:
            if name in out:
                continue
            if re.fullmatch(pat, lab) or re.fullmatch(pat, label):
                if name != 'World' and not seen_world:
                    continue
                vals = {}
                for v, s, e, star in nums:
                    c = (s + e) / 2
                    y, pos, tok = min(block, key=lambda b: abs(b[1] - c))
                    if abs(pos - c) <= 7 and y not in vals:
                        vals[y] = v
                        if star:
                            flags.setdefault(name, []).append(y)
                out[name] = vals
                labels[name] = label
                if name == 'World':
                    seen_world = True
                break
    return [b[2] for b in block], out, labels, flags, shifted
