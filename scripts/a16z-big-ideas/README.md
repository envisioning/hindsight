# a16z Big Ideas capture

Parses the public a16z Big Ideas pages into `data/raw/a16z-big-ideas/<edition>.json`. Standard-library Python 3.

## Inputs (download into a scratch folder outside the repo)

| File | URL |
|---|---|
| `2023.html` | https://a16z.com/big-ideas-in-tech-for-2023-an-a16z-omnibus/ |
| `2024.html` | https://a16z.com/big-ideas-in-tech-2024/ |
| `2025.html` | https://a16z.com/big-ideas-in-tech-2025/ |
| `2026-p1.html` | https://a16z.com/newsletter/big-ideas-2026-part-1/ |
| `2026-p2.html` | https://a16z.com/newsletter/big-ideas-2026-part-2/ |
| `2026-p3.html` | https://a16z.com/newsletter/big-ideas-2026-part-3/ |

## Run (from this folder)

```
S=<scratch folder>
curl -sL -A "Mozilla/5.0" https://a16z.com/big-ideas-in-tech-2024/ -o $S/2024.html   # and so on for each input
for f in 2023 2024 2025 2026-p1 2026-p2 2026-p3; do python3 totext.py $S/$f.html > $S/$f.txt; done
for e in 2023 2024 2025 2026; do python3 parse.py $e $S overrides.json > ../../data/raw/a16z-big-ideas/$e.json; done
```

- `totext.py`: HTML to plain text, headings marked `## `.
- `parse.py`: finds each idea (label, team section, author byline or bio, body), picks a candidate quote sentence, then applies `overrides.json`. It warns on stderr when an override quote is not found verbatim in the entry body, a quote exceeds 400 characters, or an entry has no subject.
- `overrides.json`: hand-made per edition and rank: `subject` for every entry, plus `quote` where the automatic sentence did not state the idea, and `metric`/`value`/`unit`/`horizon`/`target_year`/`team`/`note` where needed. `target_year` is otherwise set automatically when the quote names exactly one year at or after the edition year; `horizon` when the quote contains a period phrase ("the year ahead", "next year").
- `dump.py`: debug helper, prints entry bodies: `python3 dump.py <edition> $S <rank> ...`.

Entry order is the print order of the page; do not reorder after the first write (D15). Page layout changes will break the parser; the downloaded HTML of 2026-10-01 is the reference.
