#!/usr/bin/env python3
"""Fetch archived trendwatching.com pages from the Wayback Machine (raw, id_ mode).

usage: python3 fetch.py <out_dir> <url> [<url> ...]
       python3 fetch.py <out_dir> --text <file.html>     # print readable text of a saved page

For each URL: query the CDX API for the earliest 200 snapshot (optionally `url@YYYYMMDD`
to start from a date), download it raw into <out_dir>, and print timestamp, size, file.
Standard library only. Retries 3 times with backoff (the archive rate-limits).
"""
import gzip, html, os, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "Mozilla/5.0"}

def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                body = r.read()
            if body[:2] == b"\x1f\x8b":  # some snapshots are stored gzipped
                body = gzip.decompress(body)
            if b"Temporarily Offline" not in body:
                return body
        except Exception as e:  # noqa: BLE001
            print(f"  retry {i+1}: {e}", file=sys.stderr)
        time.sleep(4 * (i + 1))
    return None

def snapshot(url, start=None):
    q = {"url": url, "filter": "statuscode:200", "limit": "1", "fl": "timestamp,original"}
    if start:
        q["from"] = start
    body = get("http://web.archive.org/cdx/search/cdx?" + urllib.parse.urlencode(q))
    if not body or not body.strip():
        return None
    ts, orig = body.decode().split("\n")[0].split(" ", 1)
    return ts, orig

def slug(url):
    return re.sub(r"[^A-Za-z0-9]+", "_", url.split("//")[-1]).strip("_")[:120] + ".html"

def text(path):
    raw = open(path, "rb").read()
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    t = raw.decode("utf-8", errors="ignore")
    t = re.sub(r"(?s)<script.*?</script>|<style.*?</style>|<!--.*?-->", "", t)
    t = re.sub(r"(?i)<img[^>]*alt=\"([^\"]+)\"[^>]*>", r"\n[IMG: \1]\n", t)
    t = re.sub(r"(?i)<(br|p|li|h\d|div|tr)[^>]*>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n\s*\n+", "\n", t)

def main():
    out = sys.argv[1]
    if sys.argv[2] == "--text":
        print(text(sys.argv[3]))
        return
    os.makedirs(out, exist_ok=True)
    for arg in sys.argv[2:]:
        url, _, start = arg.partition("@")
        snap = snapshot(url, start or None)
        if not snap:
            print(f"NONE {url}")
            continue
        ts, orig = snap
        body = get(f"http://web.archive.org/web/{ts}id_/{orig}")
        if body is None:
            print(f"FAIL {ts} {orig}")
            continue
        path = os.path.join(out, slug(url))
        open(path, "wb").write(body)
        print(f"{ts} {len(body)} {path} https://web.archive.org/web/{ts}/{orig}")
        time.sleep(2)

if __name__ == "__main__":
    main()
