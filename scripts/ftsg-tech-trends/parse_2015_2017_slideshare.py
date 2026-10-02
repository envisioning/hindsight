"""Webbmedia Group / FTI Tech Trends 2015, 2016 and 2017 from the archived SlideShare transcripts.

Usage: python3 parse_2015_2017_slideshare.py <ss2015.txt> <ss2016.txt> <ss2017.txt> [--write]

Each .txt is the archived SlideShare page with <script>/<style> removed, tags replaced by newlines,
entities unescaped and blank lines dropped (one text node per line; slide markers "N." on their own
line). The trend lists below are transcribed by hand from the decks (title as printed, printed order);
the script locates each title in the transcript and takes the quote from the text: the first sentence
of the KEY INSIGHT block (one-trend pages and umbrella pages, D40) or of the paragraph under the
title (several trends on one page). Without --write it prints the rows. It refuses to overwrite an
existing edition file (D15).
"""
import sys, os, re, json
from pdfxml import join_lines, first_sentence

LIG = {'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl'}
URL = {
    '2015': 'https://web.archive.org/web/20141209105622/http://www.slideshare.net/webbmedia/2015-tech-trends',
    '2016': 'https://web.archive.org/web/20160116162654/http://www.slideshare.net/webbmedia/webbmedia-group-2016-tech-trends',
    '2017': 'https://web.archive.org/web/20201205002207/https://www2.slideshare.net/webbmedia/embargoed-until-dec-13th-future-today-institutes-2017-tech-trends-report',
}

# (label, anchor regex on a whole transcript line, mode, section, trend number)
# mode: ki = KEY INSIGHT block of the anchor's slide; next = paragraph after the anchor line;
#       umbrella = ki for a section page with a year tag and a KEY INSIGHT block (D40).
U, K, N = 'umbrella', 'ki', 'next'
E2015 = [
    ('Algorithms', r'ALGORITHMS$', U, 'Algorithms', None),
    ('Algorithmic Design', r'Algorithmic Design$', N, 'Algorithms', None),
    ('Algorithm Marketplaces', r'Algorithm Marketplaces$', N, 'Algorithms', None),
    ('Algorithmic Curation', r'Algorithmic Curation$', N, 'Algorithms', None),
    ('Algorithm Ethics and Oversight', r'Algorithm Ethics and Oversight$', N, 'Algorithms', None),
    ('Smart Virtual Personal Assistants (SVPAs)', r'SMART VIRTUAL PERSONAL ASSISTANTS \(SVPAS\)', K, None, 5),
    ('Cognitive Computing', r'COGNITIVE COMPUTING$', K, None, 6),
    ('Deep Learning', r'DEEP LEARNING$', K, None, 7),
    ('Privacy', r'PRIVACY$', U, 'Privacy', None),
    ('Ultraprivate Phones', r'Ultraprivate Phones$', N, 'Privacy', None),
    ('Passwords', r'Passwords$', N, 'Privacy', None),
    ('Encryption Management', r'Encryption Management$', N, 'Privacy', None),
    ('Ownership', r'Ownership$', N, 'Privacy', None),
    ('Anonymity', r'Anonymity$', N, 'Privacy', None),
    ('Private Networks', r'Private Networks$', N, 'Privacy', None),
    ('Digital Consent', r'Digital Consent$', N, 'Privacy', None),
    ('Security', r'SECURITY$', U, 'Security', None),
    ('The Cloud', r'The Cloud$', N, 'Security', None),
    ('Malware', r'Malware$', N, 'Security', None),
    ('Open Source App Vulnerabilities', r'Open Source App Vulnerabilities$', N, 'Security', None),
    ('Bounty Programs', r'Bounty Programs$', N, 'Security', None),
    ('Portable Security', r'Portable Security$', N, 'Security', None),
    ('Mesh Networks', r'Mesh Networks$', N, 'Security', None),
    ('Dark Net', r'Dark Net$', N, 'Security', None),
    ('One-to-Few Publishing', r'ONE-TO-FEW PUBLISHING$', K, None, 22),
    ('Video', r'VIDEO$', K, None, 23),
    ('Intelligent Drones', r'INTELLIGENT DRONES$', K, None, 24),
    ('Intelligent Cameras', r'INTELLIGENT CAMERAS$', K, None, 25),
    ('Indexing the Cloud', r'INDEXING THE CLOUD$', K, None, 26),
    ('Ephemerality', r'EPHEMERALITY$', K, None, 27),
    ('Ambient Proximity', r'AMBIENT PROXIMITY$', K, None, 28),
    ('Virtual Reality', r'VIRTUAL REALITY$', K, None, 29),
    ('Consumer > Device', r'CONSUMER > DEVICE$', K, None, 30),
    ('Continuous Partial Attention', r'CONTINUOUS PARTIAL ATTENTION$', K, None, 31),
    ('Wearables', r'WEARABLES$', U, 'Wearables', None),
    ('Women', r'Women$', N, 'Wearables', None),
    ('Brain-to-Brain Interfaces', r'Brain-to-Brain Interfaces$', N, 'Wearables', None),
    ('Kids', r'Kids$', N, 'Wearables', None),
    ('Neuroenhancers', r'Neuroenhancers$', N, 'Wearables', None),
    ('Wireless Body Area Networks', r'WIRELESS BODY AREA NETWORKS$', K, None, 36),
    ('Biointerfaces & Gestural Interfaces', r'BIOINTERFACES & GESTURAL INTERFACES$', K, None, 37),
    ('Quantifying Emotion', r'QUANTIFYING EMOTION$', K, None, 38),
    ('Heads-Up Displays', r'HEADS-UP DISPLAYS$', K, None, 39),
    ('IoT', r'IoT$', K, None, 40),
    ('Robots', r'ROBOTS$', K, None, 41),
    ('3D Printing', r'3D PRINTING$', K, None, 42),
    ('Modular Mobile', r'MODULAR MOBILE$', K, None, 43),
    ('Bitcoin + Blockchain', r'BITCOIN \+ BLOCKCHAIN$', K, None, 44),
    ('Uber for X', r'UBER FOR X$', K, None, 45),
    ('Lendership', r'LENDERSHIP$', K, None, 46),
    ('API Protection', r'API PROTECTION$', K, None, 47),
    ('Collaborative Software', r'COLLABORATIVE SOFTWARE$', K, None, 48),
    ('Social Payments', r'SOCIAL PAYMENTS$', K, None, 49),
    ('Repurposed Technology', r'REPURPOSED TECHNOLOGY$', K, None, 50),
    ('Data', r'DATA$', K, None, 51),
    ('Climate', r'CLIMATE$', K, None, 52),
    ('Space', r'SPACE$', K, None, 53),
    ('Net Neutrality', r'NET NEUTRALITY$', K, None, 54),
    ('FTC', r'FTC$', K, None, 55),
]
E2016 = [
    ('Bots', r'BOTSFirst year on the list', K, None, 1),
    ('Algorithms', r'ALGORITHMSSecond year on the list', U, 'Algorithms', None),
    ('Zero-Knowledge Proofs', r'ZERO-KNOWLEDGE PROOFS$', N, 'Algorithms', 2),
    ('Natural Language Generation', r'NATURAL LANGUAGE GENERATION$', N, 'Algorithms', None),
    ('Generative Algorithms for Voice', r'GENERATIVE ALGORITHMS FOR VOICE$', N, 'Algorithms', None),
    ('Algorithmic Discrimination', r'ALGORITHMIC DISCRIMINATION$', N, 'Algorithms', None),
    ('Algorithmic Personality Detection', r'ALGORITHMIC PERSONALITY DETECTION$', N, 'Algorithms', None),
    ('Algorithms for Design', r'ALGORITHMS FOR DESIGN$', N, 'Algorithms', None),
    ('Algorithmic Curation', r'ALGORITHMIC CURATION$', N, 'Algorithms', None),
    ('Algorithm Marketplaces', r'ALGORITHM MARKETPLACES$', N, 'Algorithms', None),
    ('Deep Learning', r'DEEP LEARNINGSecond year on the list', K, None, 10),
    ('Cognitive Computing', r'COGNITIVE COMPUTINGFourth year on the list', K, None, 11),
    ('Quantum Computers', r'QUANTUM COMPUTERSFirst year on the list', K, None, 12),
    ('Smart Virtual Personal Assistants (SVPAs)', r'SMART VIRTUAL PERSONAL$', K, None, 13),
    ('Ambient Proximity', r'AMBIENT PROXIMITY$', K, None, 14),
    ('Ambient Interfaces', r'AMBIENT INTERFACES$', K, None, 15),
    ('Attention', r'ATTENTION$', K, None, 16),
    ('Personality Analytics', r'PERSONALITY ANALYTICS$', K, None, 17),
    ('Drone Lanes', r'DRONE LANES$', K, None, 18),
    ('Net Neutrality', r'NET NEUTRALITY$', K, None, 19),
    ('Internet Mob Justice', r'INTERNET MOB JUSTICE$', K, None, 20),
    ('Complicated Legal Decisions', r'COMPLICATED LEGAL DECISIONS$', K, None, 21),
    ('Technology Policy', r'TECHNOLOGY POLICY$', K, None, 22),
    ('Anthropocene and Climate', r'ANTHROPOCENE$', K, None, 23),
    ('Security', r'SECURITYThird year on the list', U, 'Security', None),
    ('Zero-Day Exploits Rising', r'ZERO-DAY EXPLOITS RISING$', N, 'Security', None),
    ('Backdoors', r'BACKDOORS$', N, 'Security', None),
    ('Glitches', r'GLITCHES$', N, 'Security', None),
    ('Internet of Things', r'INTERNET OF THINGS$', N, 'Security', None),
    ('Selfie Security', r'SELFIE SECURITY$', N, 'Security', None),
    ('Darknets', r'DARKNETS$', N, 'Security', None),
    ('Open Source App Vulnerabilities', r'OPEN SOURCE APP VULNERABILITIES$', N, 'Security', None),
    ('Prize Hacks', r'PRIZE HACKS$', N, 'Security', None),
    ('Privacy', r'PRIVACYFourth year on the list', U, 'Privacy', None),
    ('Digital Self-Incrimination', r'DIGITAL SELF-INCRIMINATION$', N, 'Privacy', None),
    ('Anonymity', r'ANONYMITY$', N, 'Privacy', None),
    ('Authenticity', r'AUTHENTICITY$', N, 'Privacy', None),
    ('Revenge Porn', r'REVENGE PORN$', N, 'Privacy', None),
    ('Encryption Management', r'ENCRYPTION MANAGEMENT$', N, 'Privacy', None),
    ('Right to Eavesdrop/ Be Eavesdropped On', r'RIGHT TO EAVESDROP/ BE EAVESDROPPED ON$', N, 'Privacy', None),
    ('Drone Surveillance', r'DRONE SURVEILLANCE$', N, 'Privacy', None),
    ('Private Networks', r'PRIVATE NETWORKS$', N, 'Privacy', None),
    ('Ownership', r'OWNERSHIP$', N, 'Privacy', None),
    ('Artificial Intelligence for News', r'ARTIFICIAL INTELLIGENCE$', K, None, 41),
    ('Video', r'VIDEOFifth year on the list', U, 'Video', None),
    ('WebRTC', r'WebRTC$', N, 'Video', None),
    ('Cord Cutting', r'CORD CUTTING$', N, 'Video', None),
    ('Personalized Video', r'PERSONALIZED VIDEO$', N, 'Video', None),
    ('Holograms', r'HOLOGRAMS$', N, 'Video', None),
    ('One-to-Few Publishing', r'ONE-TO-FEW PUBLISHING$', K, None, 46),
    ('Consolidation', r'CONSOLIDATION$', K, None, 47),
    ('Transparency in Metrics', r'TRANSPARENCY IN METRICS$', K, None, 48),
    ('Intentional Rabbit Holes', r'INTENTIONAL RABBIT HOLES$', K, None, 49),
    ('Digital Frailty', r'DIGITAL FRAILTY$', K, None, 50),
    ('Synthetic Data Sets', r'SYNTHETIC DATA SETS$', K, None, 51),
    ('Real-Time Fact Checking', r'REAL-TIME FACT CHECKING$', K, None, 52),
    ('Blockchain', r'BLOCKCHAIN$', K, None, 53),
    ('Torrents', r'TORRENTS$', K, None, 54),
]
# 2016 report pages after the archived deck (slides 1-47): titles and pages from the industry
# index on slides 3-4 ("each list follows the order of the trends as they are presented").
I2016 = [(49, 'Drones'), (50, 'Intelligent Cameras'), (51, 'Virtual Reality'), (52, 'Augmented Reality'),
         (53, 'Augmented Knowledge'), (54, 'Wearables'), (56, 'Gestural Interfaces and Biointerfaces'),
         (57, 'Internet of Things'), (58, 'Robots'), (59, '3D Printing'), (61, 'Space'), (62, 'Deep Linking'),
         (63, 'Internet of X'), (64, 'Lendership and Sharing'), (65, 'Collaborative Software'), (66, 'Data'),
         (67, 'Genomic Editing')]
# 2017: trends 1-29 are on the archived slides 35-56; the AI section page (D40 umbrella) comes first.
E2017 = [
    ('Artificial Intelligence', r'Artificial Intelligence$', U, 'Artificial Intelligence', None),
    ('Deep Neural Networks', r'001 Deep Neural Networks', N, 'Artificial Intelligence', 1),
    ('Real-Time Machine Learning', r'002 Real-Time Machine Learning$', N, 'Artificial Intelligence', 2),
    ('Image Completion', r'003 Image Completion$', N, 'Artificial Intelligence', 3),
    ('Predictive Machine Vision', r'004 Predictive Machine Vision$', N, 'Artificial Intelligence', 4),
    ('Natural Language Generation', r'005 Natural Language Generation$', N, 'Artificial Intelligence', 5),
    ('Generative Algorithms For Voice', r'006 Generative Algorithms For Voice$', N, 'Artificial Intelligence', 6),
    ('Generative Algorithms For Sound', r'007 Generative Algorithms For Sound$', N, 'Artificial Intelligence', 7),
    ('Zero-Knowledge Proofs', r'008 Zero-Knowledge Proofs$', N, 'Artificial Intelligence', 8),
    ('Algorithmic Personality Detection', r'009 Algorithmic Personality Detection$', N, 'Artificial Intelligence', 9),
    ('Algorithm Marketplaces', r'010 Algorithm Marketplaces$', N, 'Artificial Intelligence', 10),
    ('Pre-Trained AI Chips', r'011 Pre-Trained AI Chips$', N, 'Artificial Intelligence', 11),
    ('Uncovering Hidden Bias in AI', r'012 Uncovering Hidden Bias in AI$', N, 'Artificial Intelligence', 12),
    ('Accountability and Trust', r'013 Accountability and Trust$', N, 'Artificial Intelligence', 13),
    ('Bots', r'Bots$', K, None, 14),
    ('Deep Learning', r'Deep Learning$', K, None, 15),
    ('Cognitive Computing', r'Cognitive Computing$', K, None, 16),
    ('Smart Virtual Personal Assistants (SVPAs)', r'Smart Virtual Personal Assistants \(SVPAs\)$', K, None, 17),
    ('Ambient Interfaces', r'Ambient Interfaces$', K, None, 18),
    ('Deep Linking', r'Deep Linking$', K, None, 19),
    ('Consolidation in AI', r'Consolidation in AI$', K, None, 20),
    ('Human-Machine Interfaces', r'Human-Machine Interfaces$', K, None, 21),
    ('Smart Dust', r'Smart Dust$', K, None, 22),
    ('Soft Robotics', r'Soft Robotics$', K, None, 23),
    ('Robot Companions', r'Robot Companions$', K, None, 24),
    ('Collaborative Robots', r'Collaborative Robots$', K, None, 25),
    ('Ethical Manufacturing', r'Ethical Manufacturing$', K, None, 26),
    ('Universal Basic Income', r'Universal Basic Income$', K, None, 27),
    ('Artificial Intelligence in Hiring', r'Artificial Intelligence in Hiring$', K, None, 28),
    ('Productivity Bots', r'Productivity Bots$', K, None, 29),
]
# 2017 list items whose title wraps to a second line in the industry lists.
WRAP_2017 = ('and ', 'in a ', 'Be ', 'New ', 'Enforcement', 'Vulnerab', 'Generation', 'Food', 'Proofs',
             'Assistants', 'To Help', 'Communications', '(Biological)', 'for Reading', '(whole')

STOP = re.compile(r'^(Examples|EXAMPLES|What’s Next|WHAT’S NEXT|Watchlist|WATCHLIST|Key Insight|KEY INSIGHT:?|'
                  r'Trend \d.*|TRENDS|\d+( - \d+)?|\d+\.|.*© 201\d.*|.*year on the list.*|Artificial Intelligence cont\.|'
                  r'Needs Monitoring Informs Strategy Requires Action)$')


def load(path):
    t = open(path, encoding='utf-8').read()
    for a, b in LIG.items():
        t = t.replace(a, b)
    return [l.strip() for l in t.split('\n')]


def slides(lines):
    """Slide number per line, from the transcript's "N." markers."""
    out, cur = [], 0
    for l in lines:
        m = re.match(r'^(\d+)\.$', l)
        if m and int(m.group(1)) == cur + 1:
            cur += 1
        out.append(cur)
    return out


def is_heading(l):
    return len(l) > 3 and l.upper() == l and re.search(r'[A-Z]{3}', l) is not None


SENT = re.compile(r'[.!?]["\u201d\u2019)]?(?=\s+[A-Z0-9\u201c"(#])')


def quote_of(buf):
    """First sentence of the joined lines; an opening of fragments under 25 characters ("Ashley Madison. CVS.")
    runs on to the first full sentence. A line ending in a dash joins the next line without a space."""
    merged = []
    for l in buf:
        if merged and merged[-1].endswith(('\u2014', '\u2013')):
            merged[-1] += l
        else:
            merged.append(l)
    text = join_lines(merged)
    q = first_sentence(text)
    m = next((m for m in SENT.finditer(text) if not re.search(r'(\b[A-Z]\.)+$', text[:m.end()])), None)
    if m and (q is None or m.end() < len(q)):
        q = text[:m.end()].strip()
    last = q
    while last and len(last) < 25:
        rest = text[len(q):].strip()
        m = next((m for m in SENT.finditer(rest) if not re.search(r'(\b[A-Z]\.)+$', rest[:m.end()])), None)
        last = rest[:m.end()] if m else (first_sentence(rest, 10000) or '')
        if last:
            if len(q) + 1 + len(last) > 400:
                break  # keep the fragments rather than lose the quote
            q = f'{q} {last}'
    return q if q and len(q) <= 400 else None


def collect(lines, j, slide_of, s):
    buf = []
    while j < len(lines) and slide_of[j] == s and len(buf) < 14:
        l = lines[j]
        if STOP.match(l) or (buf and is_heading(l)) or re.match(r'^\d{3} [A-Z]', l):
            break
        buf.append(l)
        j += 1
    return quote_of(buf)


def build(ed, path, spec, first_slide=1):
    lines = load(path)
    slide_of = slides(lines)
    start = next(k for k, s in enumerate(slide_of) if s >= first_slide)
    cur, rows = start, []
    for label, anchor, mode, section, num in spec:
        j = next((k for k in range(cur, len(lines)) if re.match(anchor, lines[k]) and slide_of[k] > 0), None)
        if j is None:
            raise SystemExit(f'{ed}: anchor not found after line {cur}: {label}')
        s = slide_of[j]
        idx = [k for k in range(len(lines)) if slide_of[k] == s]
        q = None
        if mode == N:
            q = collect(lines, j + 1, slide_of, s)
        else:
            ki = next((k for k in idx if re.match(r'^(Key Insight|KEY INSIGHT):?$', lines[k])), None)
            if ki is not None:
                q = collect(lines, ki + 1, slide_of, s)
        tag = None
        if mode != N:
            near = [lines[k] for k in idx if 'year on the list' in lines[k]]
            if near:
                tag = re.sub(r'^.*?((First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth) year on the list.*)$', r'\1', near[0])
        row = dict(rank=len(rows) + 1, label=label)
        if section:
            row['section'] = section
        if q:
            row['quote'] = q
        row['subject'] = label
        if num is not None:
            row['trend_number'] = num
        if tag:
            row['years_on_list'] = tag
        row['page'] = s
        row['source_url'] = URL[ed]
        row['confidence'] = 'high' if q else 'medium'
        note = {U: 'Umbrella page: section page with the publisher\'s year tag and a KEY INSIGHT block, a trend under D40. Quote is the first sentence of the KEY INSIGHT block.',
                K: 'Quote is the first sentence of the KEY INSIGHT block.',
                N: 'Quote is the first sentence of the paragraph under the title (several trends share the page).'}[mode]
        if not q:
            note = 'No quote: no complete first sentence found in the transcript.'
        elif q != (first_sentence(q) or q):
            note += ' The text opens with short fragments; the quote keeps them together, up to the first full sentence where that fits in 400 characters.'
        row['note'] = note + ' page is the slide number in the archived SlideShare transcript.'
        rows.append(row)
        # Columns put titles on a page out of order in the transcript; search the next title from this page's start.
        cur = idx[0]
    return rows


def index_rows_2016(start_rank):
    rows = []
    for page, label in I2016:
        rows.append(dict(rank=start_rank + len(rows), label=label, subject=label, page=page, source_url=URL['2016'], confidence='medium',
                         note='Title and report page from the industry index on slides 3-4 of the archived deck; the trend page itself is past the 47 archived slides, so there is no quote. Whether the page holds one trend or a group with sub-trends cannot be seen.'))
    return rows


def list_rows_2017(path, start_rank):
    lines = load(path)
    s, e = lines.index('6.'), lines.index('29.')
    seg = lines[s:e]
    votes = {}
    for i, l in enumerate(seg):
        m = re.match(r'^(\d{2,3}) (.+)$', l)
        if not m:
            continue
        t = m.group(2)
        nx = seg[i + 1] if i + 1 < len(seg) else ''
        if nx and not re.match(r'^\d', nx) and (nx[0].islower() or nx.startswith(WRAP_2017)):
            t = f'{t} {nx}'
        t = re.sub(r'\s*\(whole section\)$', '', t)
        votes.setdefault(int(m.group(1)), {}).setdefault(t, 0)
        votes[int(m.group(1))][t] += 1
    rows, conflicts = [], []
    for n in sorted(votes):
        if n <= 29:
            continue
        v = votes[n]
        best = max(v.items(), key=lambda kv: (kv[1], len(kv[0])))[0]
        # a shorter variant that is a prefix of the best one is the same title cut at a line wrap
        others = [t for t in v if t != best and not best.startswith(t)]
        if others:
            conflicts.append((n, v))
        note = 'Title and trend number from the industry lists on slides 6-28 of the archived deck; the trend page is past the 56 archived slides, so there is no quote.'
        if others:
            note += ' The lists also print number ' + str(n) + ' once for ' + '; '.join(f'"{t}"' for t in others) + '; the majority title is kept.'
        rows.append(dict(rank=start_rank + len(rows), label=best, subject=best, trend_number=n, source_url=URL['2017'], confidence='medium', note=note))
    return rows, conflicts, sorted(set(range(30, 160)) - set(votes))


META = {
    '2015': dict(published='2014-12', title='2015 Trend Report', publisher='Webbmedia Group', author='Amy Webb (founder, Webbmedia Group)',
                 series='Trend Report (later Future Today Institute Tech Trends Report)'),
    '2016': dict(published='2015-12', title='2016 Trend Report', publisher='Webbmedia Group Digital Strategy (renamed Future Today Institute in 2016)', author='Amy Webb (founder, Webbmedia Group)',
                 series='Trend Report (later Future Today Institute Tech Trends Report)'),
    '2017': dict(published='2016-12', title='2017 Tech Trend Report (10th year)', publisher='Future Today Institute', author='Amy Webb (founder, Future Today Institute)',
                 series='Tech Trends Report'),
}


def main():
    p15, p16, p17 = sys.argv[1:4]
    write = '--write' in sys.argv
    r15 = build('2015', p15, E2015)
    r16 = build('2016', p16, E2016)
    r16 += index_rows_2016(len(r16) + 1)
    r17 = build('2017', p17, E2017, first_slide=35)
    tail, conflicts, missing = list_rows_2017(p17, len(r17) + 1)
    r17 += tail
    notes = {
        '2015': ('Complete: the archived transcript covers the whole 52-slide deck, which numbers 55 trends (01-55); every numbered trend is here, plus the four umbrella pages with a year tag and a KEY INSIGHT block '
                 '(Algorithms, Privacy, Security, Wearables; D40), 59 entries. The PDF was not found. Sub-trends that share a page carry the section of their umbrella page; their printed numbers sit beside the text in an order the transcript does not keep, so trend_number is given only for one-trend pages. '
                 'One-trend pages print the title in capitals; labels are in title case. horizon and target_year from the introduction: "the immediate trends that we think will matter most in the coming year".'),
        '2016': ('Partial: the archived transcript covers slides 1-47 of the deck (trends 1-54 and four umbrella pages, D40: Algorithms, Security, Privacy, Video); the report states 81 trends and runs past page 67. '
                 'Titles of the later pages (49-67) come from the industry index on slides 3-4, without quotes; the index lists page-level titles only, so sub-trends on those pages are missing (17 titles for about 27 trends). The PDF link was never archived. '
                 'trend_number is the printed "Trend N" where the slide shows a single number. horizon and target_year from the introduction: "the immediate trends that will matter most to you in the coming year".'),
        '2017': ('Partial: the archived transcript covers slides 1-56 of the deck: trends 1-29 with their pages (quotes), and the industry lists on slides 6-28, which give the number and title of most of the 159 trends. '
                 f'Trends 30-158 are titles from those lists without quotes; numbers {", ".join(map(str, missing))} appear in no list and are missing. The Artificial Intelligence section page (year tag and Key Insight) is an umbrella trend (D40) before trend 1. '
                 'Where a list prints a number with a different title once, the majority title is kept and the variant is in the entry note. The PDF was distributed through WeTransfer and is not archived.'),
    }
    status = {'2015': 'complete', '2016': 'partial', '2017': 'partial'}
    for ed, rows in (('2015', r15), ('2016', r16), ('2017', r17)):
        for r in rows:
            r['horizon'] = 'the coming year'
            r['target_year'] = int(ed)
        doc = dict(edition=ed, status=status[ed], sources=[URL[ed]], **META[ed], notes=notes[ed], entries=rows)
        out = os.path.join('..', '..', 'data', 'raw', 'ftsg-tech-trends', f'{ed}.json')
        print(ed, status[ed], len(rows), 'entries', sum('quote' in r for r in rows), 'with quote')
        if write:
            if os.path.exists(out):
                raise SystemExit(f'{out} exists; refusing to overwrite (D15)')
            json.dump(doc, open(out, 'w'), ensure_ascii=False, indent=2)
            open(out, 'a').write('\n')
        else:
            for r in rows:
                print(' ', r['rank'], r.get('trend_number', ''), r['label'], '|', r.get('section', ''), '|', r.get('years_on_list', ''), '|', (r.get('quote') or '-')[:150])
    print('2017 conflicts', conflicts, 'missing', missing)


main()
