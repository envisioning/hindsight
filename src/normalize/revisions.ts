/**
 * Revisions between consecutive editions of a serial source.
 * Hype Cycle: computed per subject. Posters: taken from the raw revisions file.
 */
import { join } from "node:path";
import type { Claim, Revision } from "../schema.ts";
import { RAW, type Raw, normKey, readJson } from "./lib.ts";
import { BAND_ORDER } from "./sources/hype-cycle.ts";

type ClaimRow = Claim & { edition: string };

function revId(prior: string, change: Revision["change"]): string {
  return `${prior}-${change}`;
}

export interface RevisionResult {
  rows: Revision[];
  ambiguous: number;
}

/** Compare each edition with the next one, per subject. Timing uses `horizon_band`. */
export function serialRevisions(claims: ClaimRow[], editions: string[]): RevisionResult {
  const rows: Revision[] = [];
  let ambiguous = 0;
  const bySubject = (ed: string) => {
    const m = new Map<string, ClaimRow[]>();
    for (const c of claims)
      if (c.edition === ed)
        for (const s of c.subject_ids) {
          const list = m.get(s) ?? [];
          list.push(c);
          m.set(s, list);
        }
    return m;
  };
  for (let i = 0; i + 1 < editions.length; i++) {
    const a = bySubject(editions[i] as string);
    const b = bySubject(editions[i + 1] as string);
    for (const [subject, prior] of a) {
      const next = b.get(subject);
      if (prior.length > 1 || (next !== undefined && next.length > 1)) {
        ambiguous++;
        continue;
      }
      const p = prior[0] as ClaimRow;
      if (next === undefined) {
        rows.push({ id: revId(p.id, "dropped"), prior_claim_id: p.id, change: "dropped", subject_id: subject });
        continue;
      }
      const n = next[0] as ClaimRow;
      const pl = p.quote ?? "";
      const nl = n.quote ?? "";
      if (normKey(pl) !== normKey(nl))
        rows.push({ id: revId(p.id, "renamed"), prior_claim_id: p.id, new_claim_id: n.id, change: "renamed", subject_id: subject, note: `"${pl}" -> "${nl}"` });
      const pb = p.horizon_band === undefined ? undefined : BAND_ORDER[p.horizon_band];
      const nb = n.horizon_band === undefined ? undefined : BAND_ORDER[n.horizon_band];
      if (pb !== undefined && nb !== undefined && pb !== nb) {
        const change = nb > pb ? "delayed" : "advanced";
        rows.push({
          id: revId(p.id, change),
          prior_claim_id: p.id,
          new_claim_id: n.id,
          change,
          subject_id: subject,
          note: `time to plateau ${p.horizon_band} -> ${n.horizon_band}`,
        });
      }
    }
  }
  return { rows, ambiguous };
}

/** Poster revisions from data/raw/envisioning-technology/revisions.json. "added" is not a revision and is counted, not written. */
export function posterRevisions(idOf: (rawId: string) => string | undefined): { rows: Revision[]; added: number } {
  const d = readJson(join(RAW, "envisioning-technology", "revisions.json"));
  const rows: Revision[] = [];
  let added = 0;
  for (const r of d.rows as Raw[]) {
    for (const change of r.changes as string[]) {
      if (change === "added") {
        added++;
        continue;
      }
      if (!["delayed", "advanced", "dropped", "renamed", "reversed"].includes(change)) throw new Error(`poster revision ${r.id}: unknown change ${change}`);
      const prior = idOf(String(r.prior_id));
      if (prior === undefined) throw new Error(`poster revision ${r.id}: unknown prior ${r.prior_id}`);
      const next = r.new_id ? idOf(String(r.new_id)) : undefined;
      const c = change as Revision["change"];
      const note = [
        `${r.prior_label} (${r.prior_year_min}${r.prior_year_max !== r.prior_year_min ? `-${r.prior_year_max}` : ""})${r.new_label ? ` -> ${r.new_label} (${r.new_year})` : ""}`,
        r.note,
        `Raw row ${r.id}.`,
      ]
        .filter(Boolean)
        .join(" ");
      const row: Revision = { id: revId(prior, c), prior_claim_id: prior, change: c, note };
      if (c !== "dropped") {
        if (next === undefined) throw new Error(`poster revision ${r.id}: ${change} without a new claim`);
        row.new_claim_id = next;
      }
      rows.push(row);
    }
  }
  return { rows, added };
}
