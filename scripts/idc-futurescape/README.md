# IDC FutureScape capture scripts

Builds `data/raw/idc-futurescape/<edition>.json` for two IDC FutureScapes: Worldwide IT Industry and Worldwide CIO Agenda.

## Files

- `fetch.py`: downloads the public prediction headlines into a cache file `<key>.json` next to this script (gitignored).
- `editions.py`: the edition registry. One edition per publication year. It names the IDC document, its sources, status and notes. Short lists read from secondary web pages are typed here (`manual`).
- `annotations.py`: Hindsight's own subject and metric labels per prediction, plus fixes to the automatic parse.
- `build.py`: merges the cache, `editions.py` and `annotations.py` and writes the edition files. It parses target year, timing and the first percentage from each headline.

## Inputs

| Key | What | URL |
|---|---|---|
| IDC document numbers (for example `US49563122`) | IDC table-of-contents page, which lists "Prediction N: ..." headlines | `https://www.idc.com/research/viewtoc.jsp?containerId=<id>`, else the Internet Archive copy |
| `US53858725` | IDC blog post with the ten IT Industry 2026 predictions | https://www.idc.com/resource-center/blog/three-forces-shaping-the-future-of-it-leaderships/ |
| `IT2020deck` | IDC webinar deck, IT Industry 2020 (PDF) | https://keyvatech.com/wp-content/uploads/2020/01/IDC-2020-Futures.pdf |
| `252235` | IDC report, CIO Agenda 2015 (PDF) | https://vods.dm.ux.sap.com/previewhub/greece-runsimple/pdfs/downloadasset.2015-04-apr-13-11.idc-futurescape-worldwide-cio-agenda-2015-predictions-pdf.bypassReg.pdf |

## Run

```
python3 fetch.py US51736824 US52641324 US50435423 US51294523 US49563122 US49743322 US48312921 US48297821 US46942020 US46010920 US45578619 US44390218 US44403818 US43171317 US41845916 259850
python3 fetch.py --blog US53858725 https://www.idc.com/resource-center/blog/three-forces-shaping-the-future-of-it-leaderships/
python3 fetch.py --deck IT2020deck https://keyvatech.com/wp-content/uploads/2020/01/IDC-2020-Futures.pdf
python3 fetch.py --deck 252235 https://vods.dm.ux.sap.com/previewhub/greece-runsimple/pdfs/downloadasset.2015-04-apr-13-11.idc-futurescape-worldwide-cio-agenda-2015-predictions-pdf.bypassReg.pdf
python3 build.py
```

`--deck` needs `pdftotext` (poppler). Python 3.10 or later, standard library only.
