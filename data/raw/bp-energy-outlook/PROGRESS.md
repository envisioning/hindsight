# Progress: bp-energy-outlook
- 08:25 started; verify-first on editions and data tables
- 08:50 downloaded 13 report PDFs from bp.com archive page; summary tables 2014-2024 from archive.org (2018, 2022 failed 3x)
- 08:50 2011-2025 edition files written (14 editions, no 2021 edition); realized.json written
- 2026-10-02 (#15) 2018 summary tables from the NRGI mirror (archive.org has no capture of any 2018 table file); 2022 summary tables from archive.org (2023-01-28 capture); 12 rows appended to 2018.json and 30 to 2022.json (append_tables.py)
- 2026-10-02 (#71) 2014 summary tables (.xls, archive.org 2014-02-24) read with the new stdlib xls_dump.py: 5 renewables-share rows (2015 to 2035) and the 2012 base year appended to 2014.json (append_tables.py). 2015 liquids demand 2035 (111 Mb/d, report p. 30) appended to 2015.json. Found: the archive.org .xlsx at the 2015 path is the January 2014 workbook; bp's 2015 tables are the .xls captured 2015-03-01.
