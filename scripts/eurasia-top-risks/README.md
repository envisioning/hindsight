# eurasia-top-risks helper

`html_text.py` turns a saved Eurasia Group web page into plain text lines, so the risk labels and headline sentences can be read. The edition files in `data/raw/eurasia-top-risks/` were transcribed by hand from that text and from PDF text (`pdftotext -layout` / `-raw`). No step writes the JSON automatically.

## Inputs

- Current pages: `https://www.eurasiagroup.net/issues/top-risks-YYYY` (2016-2026; 2019 is `/issues/top-risks-for-2019`).
- Older pages, via the Wayback Machine raw mode (`id_`): the URLs listed in `data/raw/eurasia-top-risks/INDEX.md`.
- PDFs linked from those pages.

## Run

```
curl -sL -A "Mozilla/5.0" -o page-2026.html https://www.eurasiagroup.net/issues/top-risks-2026
python3 html_text.py page-2026.html
python3 html_text.py page-2026.html "Top Risks"
```

The optional second argument prints from that text up to the page footer. Keep downloaded files out of git.
