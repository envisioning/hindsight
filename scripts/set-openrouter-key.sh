#!/bin/zsh
# Ask for an OpenRouter API key without echoing it, and write it to the
# git-ignored .env files of hindsight and research. The key is never printed.
set -eu

ROOT="${0:A:h:h:h}"
TARGETS=("$ROOT/hindsight/.env" "$ROOT/research/.env")

print -n "Paste the OpenRouter API key (input is hidden): "
read -rs KEY
print
KEY="${KEY//[[:space:]]/}"

if [[ ! "$KEY" =~ '^sk-or-[A-Za-z0-9_-]{20,}$' ]]; then
	print "That does not look like an OpenRouter key (sk-or-...). Nothing was written."
	exit 1
fi

for f in "${TARGETS[@]}"; do
	dir="${f:h}"
	if ! git -C "$dir" check-ignore -q .env; then
		print "Skipped ${f}: .env is not git-ignored in that repo."
		continue
	fi
	touch "$f"
	chmod 600 "$f"
	tmp="$(mktemp)"
	grep -v '^OPENROUTER_API_KEY=' "$f" > "$tmp" || true
	print -r -- "OPENROUTER_API_KEY=$KEY" >> "$tmp"
	mv "$tmp" "$f"
	chmod 600 "$f"
	print "Wrote OPENROUTER_API_KEY to $f"
done

print -n "Checking the key with OpenRouter... "
code="$(curl -s -o /dev/null -w '%{http_code}' https://openrouter.ai/api/v1/key -H "Authorization: Bearer $KEY")"
if [[ "$code" == "200" ]]; then print "valid."; else print "OpenRouter answered HTTP $code. Check the key."; fi
unset KEY
