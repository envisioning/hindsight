#!/bin/sh
# Download Long Bets listings and detail pages into a scratch directory outside the repo.
# Usage: scripts/crowd-baseline/fetch_long_bets.sh <scratch-dir>
set -eu
D="${1:?scratch dir}"
mkdir -p "$D/list" "$D/detail"
UA="Mozilla/5.0"
for p in bets predictions; do
  n=1
  while :; do
    f="$D/list/$p-$n.html"
    curl -sL -A "$UA" "https://longbets.org/$p/?page=$n" -o "$f"
    grep -q "?page=$((n + 1))\"" "$f" || break
    n=$((n + 1)); sleep 1
  done
done
cat "$D"/list/*.html | grep -oE 'bet_number"><a href="/[0-9]+/' | grep -oE '[0-9]+' | sort -un > "$D/ids.txt"
for n in $(cat "$D/ids.txt"); do
  [ -s "$D/detail/$n.html" ] && continue
  curl -sL -A "$UA" "https://longbets.org/$n/" -o "$D/detail/$n.html"
  sleep 0.5
done
