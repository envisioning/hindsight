/**
 * Subject text for embedding (D48, #59): the subject name, its other aliases,
 * and one claim text per source as context. Deterministic: the claim is the
 * first one (by id) of each source that has a usable text.
 */
import type { Claim, Subject, SubjectText } from "../schema.ts";
import { fit, normKey } from "./lib.ts";

const PER_CLAIM = 300;

/** A quote that only repeats a label says nothing more; a generated statement is a template. */
function claimText(c: Claim, labelKeys: Set<string>): string | undefined {
  if (c.quote !== undefined && c.quote.length >= 40 && !labelKeys.has(normKey(c.quote))) return fit(c.quote, PER_CLAIM);
  if (c.statement !== undefined && c.statement_generated !== true) return fit(c.statement, PER_CLAIM);
  return undefined;
}

export function subjectTexts(subjects: Subject[], claimsBySource: Map<string, Claim[]>): SubjectText[] {
  const context = new Map<string, Map<string, string>>();
  const keys = new Map(subjects.map((s) => [s.id, new Set([s.name, ...s.aliases].map(normKey))]));
  for (const src of [...claimsBySource.keys()].sort()) {
    const rows = [...(claimsBySource.get(src) ?? [])].sort((a, b) => a.id.localeCompare(b.id));
    for (const c of rows) {
      if (!c.published) continue;
      for (const id of c.subject_ids) {
        const bySource = context.get(id) ?? context.set(id, new Map()).get(id);
        if (bySource === undefined || bySource.has(src)) continue;
        const labelKeys = keys.get(id);
        if (labelKeys === undefined) continue;
        const t = claimText(c, labelKeys);
        if (t !== undefined) bySource.set(src, t);
      }
    }
  }
  return subjects.map((s) => {
    const others = s.aliases.filter((a) => a !== s.name);
    const lines = [s.name];
    if (others.length > 0) lines.push(`Also called: ${others.join("; ")}`);
    lines.push(...(context.get(s.id)?.values() ?? []));
    return { subject_id: s.id, kind: s.kind, text: lines.join("\n") };
  });
}
