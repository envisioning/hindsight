#!/bin/sh
# Downloads the inputs for build.py into the folder given as $1 (default: this folder).
# ALFRED answers plain curl; fred.stlouisfed.org/graph/fredgraph.csv timed out from curl, so every series comes from alfred.stlouisfed.org.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${1:-$HERE}
mkdir -p "$OUT/alfred" "$OUT/fed"
A="https://alfred.stlouisfed.org/graph/alfredgraph.csv"
get() { [ -s "$2" ] || { curl -sS -m 40 -A "curl/8.0" -o "$2" "$1" || true; sleep 0.3; }; }
# SEP release dates (ALFRED vintage dates). Central tendency editions 2007-11 to 2015-06, median editions 2015-12 onward.
CT_DATES="2007-11-20 2008-02-20 2008-05-21 2008-07-16 2008-11-19 2009-02-18 2009-05-20 2009-07-15 2009-11-24 2010-02-17 2010-05-19 2010-07-14 2010-11-23 2011-02-16 2011-04-27 2011-06-22 2011-11-02 2012-01-25 2012-04-25 2012-06-20 2012-09-13 2012-12-12 2013-03-20 2013-06-19 2013-09-18 2013-12-18 2014-03-19 2014-06-18 2014-09-17 2014-12-17 2015-03-18 2015-06-17"
MD_DATES="2015-12-16 2016-03-16 2016-06-15 2016-09-21 2016-12-14 2017-03-15 2017-06-14 2017-09-20 2017-12-13 2018-03-21 2018-06-13 2018-09-26 2018-12-19 2019-03-20 2019-06-19 2019-09-18 2019-12-11 2020-06-10 2020-09-16 2020-12-16 2021-03-17 2021-06-16 2021-09-22 2021-12-15 2022-03-16 2022-06-15 2022-09-21 2022-12-14 2023-03-22 2023-06-14 2023-09-20 2023-12-13 2024-03-20 2024-06-12 2024-09-18 2024-12-18 2025-03-19 2025-06-18 2025-09-17 2025-12-10 2026-03-18 2026-06-17 2026-09-16"
for d in $CT_DATES; do for s in GDPC1CTH GDPC1CTL GDPC1CTM UNRATECTH UNRATECTL UNRATECTM PCECTPICTH PCECTPICTL PCECTPICTM JCXFECTH JCXFECTL JCXFECTM; do
  get "$A?id=$s&vintage_date=$d" "$OUT/alfred/${s}_$d.csv"; done; done
for d in $MD_DATES; do for s in GDPC1MD UNRATEMD PCECTPIMD JCXFEMD FEDTARMD; do
  get "$A?id=$s&vintage_date=$d" "$OUT/alfred/${s}_$d.csv"; done; done
# Longer-run series are indexed by release date; the latest vintage holds every release.
for s in GDPC1MDLR UNRATEMDLR PCECTPIMDLR FEDTARMDLR GDPC1CTHLR GDPC1CTLLR GDPC1CTMLR UNRATECTHLR UNRATECTLLR UNRATECTMLR PCECTPICTHLR PCECTPICTLLR PCECTPICTMLR; do
  get "$A?id=$s" "$OUT/alfred/${s}_latest.csv"; done
# Realized values (latest vintage).
for s in GDPC1 PCEPI PCEPILFE UNRATE DFEDTAR DFEDTARU DFEDTARL; do get "$A?id=$s" "$OUT/alfred/${s}_latest.csv"; done
# Fed accessible projection materials: dot plots 2012-01 to 2015-06, medians 2015-09.
for d in 20120125 20120425 20120620 20120913 20121212 20130320 20130619 20130918 20131218 20140319 20140618 20140917 20141217 20150318 20150617 20150917; do
  get "https://www.federalreserve.gov/monetarypolicy/fomcprojtabl$d.htm" "$OUT/fed/fomcprojtabl$d.htm"; done
# The December 2012 accessible page has a different file name.
get "https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20121217.htm" "$OUT/fed/fomcprojtabl20121212.htm.alt"
# SEP compilations of individual projections (released with a five-year lag), 2007-10 to 2015-06. Needs pdftotext (poppler) for build.py.
mkdir -p "$OUT/sepc"
for d in 20071031 20080130 20080430 20080625 20081029 20090128 20090429 20090624 20091104 20100127 20100428 20100623 20101103 20110126 20110427 20110622 20111102 20120125 20120425 20120620 20120913 20121212 20130320 20130619 20130918 20131218 20140319 20140618 20140917 20141217 20150318 20150617; do
  get "https://www.federalreserve.gov/monetarypolicy/files/FOMC${d}SEPcompilation.pdf" "$OUT/sepc/FOMC${d}SEPcompilation.pdf"
  [ -s "$OUT/sepc/$d.txt" ] || pdftotext -layout "$OUT/sepc/FOMC${d}SEPcompilation.pdf" "$OUT/sepc/$d.txt" || true
done
