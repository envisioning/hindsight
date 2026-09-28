/**
 * Permanent claim ids. `data/normalized/ids.json` maps a natural key per raw
 * row to its id. An id never changes and is never reused.
 *
 * Rule: `<source>-<edition>-<nnn>`. On the first assignment in an edition,
 * nnn is the row's 1-based position in the raw edition file's `entries`
 * array, zero-padded to 3 digits, counting skipped rows (gaps are allowed).
 * The Envisioning posters keep their raw ids (`et-2012-045` becomes
 * `envisioning-technology-2012-045`). After that the registry governs:
 * known keys keep their id; a new key gets the next number above the highest
 * number ever used in that edition.
 */
import { join } from "node:path";
import { OUT, readJsonIf, writeJson } from "./lib.ts";

interface EditionIds {
  /** Highest number ever used in this edition. */
  last: number;
  keys: Record<string, string>;
}

interface Registry {
  rule: string;
  sources: Record<string, Record<string, EditionIds>>;
}

export const ID_RULE =
  "Claim id = <source>-<edition>-<nnn>. First assignment: nnn is the 1-based position of the row in data/raw/<source>/<edition>.json `entries`, zero-padded to 3 digits, counting rows that are not claims (gaps allowed); edition-level quotes outside `entries` follow the last entry. envisioning-technology keeps its raw ids (et-2012-045 -> envisioning-technology-2012-045). After the first assignment this registry governs: a known key keeps its id forever; a new key gets the next number above `last` in its edition. Ids are never reused.";

const PATH = join(OUT, "ids.json");

export class IdRegistry {
  private reg: Registry;
  constructor() {
    this.reg = readJsonIf<Registry>(PATH, { rule: ID_RULE, sources: {} });
    this.reg.rule = ID_RULE;
  }

  /** Assign ids for one edition. `rows` are in raw order. Throws on a duplicate key. */
  assign(source: string, edition: string, rows: { key: string; index: number }[]): Map<string, string> {
    const src = (this.reg.sources[source] ??= {});
    const isNew = src[edition] === undefined;
    const ed = (src[edition] ??= { last: 0, keys: {} });
    const out = new Map<string, string>();
    const seen = new Set<string>();
    const used = new Set(Object.values(ed.keys));
    for (const { key, index } of rows) {
      if (seen.has(key)) throw new Error(`duplicate natural key in ${source} ${edition}: ${key}`);
      seen.add(key);
      let id = ed.keys[key];
      if (id === undefined) {
        const n = isNew ? index : ed.last + 1;
        id = `${source}-${edition}-${String(n).padStart(3, "0")}`;
        if (used.has(id)) throw new Error(`id collision ${id} (${key})`);
        ed.keys[key] = id;
        used.add(id);
        ed.last = Math.max(ed.last, n);
      }
      out.set(key, id);
    }
    return out;
  }

  /** Copy of the registry, to undo the assignments of a source that fails validation. */
  snapshot(): string {
    return JSON.stringify(this.reg);
  }

  restore(snap: string): void {
    this.reg = JSON.parse(snap) as Registry;
  }

  save(): void {
    writeJson(PATH, this.reg);
  }
}
