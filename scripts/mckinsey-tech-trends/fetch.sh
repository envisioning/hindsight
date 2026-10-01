#!/bin/sh
# Usage: fetch.sh <url> <outfile>
# Retries a GET up to 6 times (Wayback returns intermittent 503s). Generic User-Agent, no identifiers.
url="$1"; out="$2"; n=0
while [ $n -lt 6 ]; do
  code=$(curl -sL -m 120 -A "Mozilla/5.0" -o "$out" -w "%{http_code}" "$url")
  if [ "$code" = "200" ] && ! grep -q "Temporarily Offline" "$out" 2>/dev/null; then echo "ok $code $(wc -c < "$out") $url"; exit 0; fi
  n=$((n+1)); sleep 15
done
echo "FAIL $code $url"; exit 1
