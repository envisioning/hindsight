# bcb-focus

Builds `data/raw/bcb-focus/` from the Banco Central do Brasil APIs. Python 3, standard library only.

## Inputs

`build.py --fetch` downloads these JSON files into the cache folder. No authentication.

| File | Source |
|---|---|
| `focus_ipca.json`, `focus_pib_total.json`, `focus_selic.json`, `focus_cambio.json` | https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=1000000&$format=json&$filter=Indicador eq '<label>' (Focus annual expectations, all dates) |
| `sgs_13522.json`, `sgs_7326.json`, `sgs_3696.json`, `sgs_3697.json` | https://api.bcb.gov.br/dados/serie/bcdata.sgs.<code>/dados?formato=json&dataInicial=01/01/1999&dataFinal=31/12/2026 |
| `sgs_432_0.json` to `sgs_432_2.json` | SGS 432 (daily) in three windows; the SGS API allows at most 10 years per request for daily series |
| `sgs_1178.json` | SGS 1178 (effective Selic, Over-Selic, daily), 1999 to 2008: the actual for Focus surveys before 2004-04-16 (#66) |

`index_header.md` is the static top of `data/raw/bcb-focus/INDEX.md`. Edit it there.

## Run

Download and build (cache in this folder; its `*.json` files are gitignored):

```bash
python3 build.py --fetch
```

Build again from files already downloaded, or use another cache folder:

```bash
python3 build.py path/to/cache
```

Writes the edition files, `realized.json`, `INDEX.md` and `PROGRESS.md` to `data/raw/bcb-focus/`.
