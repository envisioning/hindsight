"""Print font signature frequencies with sample text (diagnostic)."""
import sys, collections
from pdfxml import load, sig
pages = load(sys.argv[1])
lo = int(sys.argv[2]) if len(sys.argv) > 2 else 0
hi = int(sys.argv[3]) if len(sys.argv) > 3 else 10**6
cnt = collections.Counter(); samples = collections.defaultdict(list)
for p in pages:
    if not lo <= p['page'] <= hi: continue
    for r in p['runs']:
        k = sig(r) + (r['bold'],)
        cnt[k] += 1
        if len(samples[k]) < 5: samples[k].append((r['page'], r['text'][:40]))
for k, c in cnt.most_common(45):
    print(c, k, samples[k])
