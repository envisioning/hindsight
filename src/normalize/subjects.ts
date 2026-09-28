/**
 * Subjects for publisher labels (technologies, risks, quantities named in
 * prose). `subject-aliases.json` is the registry: a label keeps its subject
 * across runs. `subject-curation.json` holds the judgment calls (merges,
 * related links, notes, deliberate non-mappings) and wins over the registry.
 *
 * Order of resolution for a label:
 *   1. curation alias (method `judgment`)
 *   2. registry row from an earlier run (method kept)
 *   3. same normalized key as a label already mapped (method `normalized`)
 *   4. new subject named after the label (method `exact`)
 */
import { join } from "node:path";
import { type Subject, SubjectAlias } from "../schema.ts";
import { type LabelRef, OUT, normKey, readJsonIf, slug, writeJson } from "./lib.ts";
import { QUANTITIES } from "./quantities.ts";

interface Curation {
  aliases: { label: string; subject_id: string; reason: string }[];
  subjects: (Partial<Omit<Subject, "aliases">> & { id: string })[];
  unmapped: { label: string; reason: string }[];
}

const ALIASES = join(OUT, "subject-aliases.json");
const CURATION = join(OUT, "subject-curation.json");

export class SubjectResolver {
  readonly curation: Curation;
  private curatedAlias = new Map<string, { subject_id: string; reason: string }>();
  private curatedTargets = new Set<string>();
  private registry = new Map<string, SubjectAlias>();
  /** This run's table, label -> alias row. */
  readonly table = new Map<string, SubjectAlias>();
  private byKey = new Map<string, string>();
  readonly kinds = new Map<string, Map<LabelRef["kind"], number>>();
  readonly unmappedSeen = new Map<string, { reason: string; sources: Set<string> }>();

  constructor() {
    this.curation = readJsonIf<Curation>(CURATION, { aliases: [], subjects: [], unmapped: [] });
    for (const a of this.curation.aliases) {
      this.curatedAlias.set(a.label, a);
      this.curatedTargets.add(a.subject_id);
    }
    for (const row of readJsonIf<unknown[]>(ALIASES, [])) {
      const a = SubjectAlias.parse(row);
      this.registry.set(a.label, a);
    }
  }

  private kindCount(id: string, kind: LabelRef["kind"]): void {
    const m = this.kinds.get(id) ?? new Map<LabelRef["kind"], number>();
    m.set(kind, (m.get(kind) ?? 0) + 1);
    this.kinds.set(id, m);
  }

  private taken(id: string): boolean {
    for (const a of this.table.values()) if (a.subject_id === id) return true;
    return QUANTITIES.some((q) => q.id === id);
  }

  /** Resolve a label to a subject id, or undefined when the curation leaves it unmapped on purpose. */
  resolve(ref: LabelRef, source: string): string | undefined {
    const { label, kind } = ref;
    const un = this.curation.unmapped.find((u) => u.label === label);
    if (un !== undefined) {
      const seen = this.unmappedSeen.get(label) ?? { reason: un.reason, sources: new Set<string>() };
      seen.sources.add(source);
      this.unmappedSeen.set(label, seen);
      return undefined;
    }
    const existing = this.table.get(label);
    if (existing !== undefined) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      this.kindCount(existing.subject_id, kind);
      return existing.subject_id;
    }
    let row: SubjectAlias;
    const cur = this.curatedAlias.get(label);
    const reg = this.registry.get(label);
    const key = normKey(label);
    if (cur !== undefined) {
      row = { label, subject_id: cur.subject_id, method: "judgment", reason: cur.reason, sources: [source] };
    } else if (reg !== undefined && reg.method !== "judgment") {
      row = { ...reg, sources: [source] };
    } else if (this.byKey.has(key)) {
      row = { label, subject_id: this.byKey.get(key) as string, method: "normalized", sources: [source] };
    } else {
      let id = slug(label);
      if (id.length === 0) throw new Error(`label with an empty slug: "${label}"`);
      // A curated merge can create the canonical subject before its own label is seen: reuse it.
      if (this.taken(id) && !this.curatedTargets.has(id)) id = `${id}-${kind}`;
      row = { label, subject_id: id, method: "exact", sources: [source] };
    }
    this.table.set(label, row);
    if (!this.byKey.has(key)) this.byKey.set(key, row.subject_id);
    this.kindCount(row.subject_id, kind);
    return row.subject_id;
  }

  /** Register an alias that the source itself asserts (for example a publisher's own relabel). */
  assertSame(label: string, sameAs: string, reason: string, kind: LabelRef["kind"], source: string): void {
    const target = this.resolve({ label: sameAs, kind }, source);
    if (target === undefined || this.table.has(label) || this.curatedAlias.has(label)) return;
    this.table.set(label, { label, subject_id: target, method: "judgment", reason, sources: [source] });
    this.kindCount(target, kind);
  }

  /** Copy of this run's table, to undo the mappings of a source that fails validation. */
  snapshot(): { table: [string, SubjectAlias][]; byKey: [string, string][]; kinds: [string, [LabelRef["kind"], number][]][] } {
    return {
      table: [...this.table].map(([k, v]) => [k, { ...v, sources: [...v.sources] }]),
      byKey: [...this.byKey],
      kinds: [...this.kinds].map(([k, m]) => [k, [...m]]),
    };
  }

  restore(s: ReturnType<SubjectResolver["snapshot"]>): void {
    this.table.clear();
    for (const [k, v] of s.table) this.table.set(k, v);
    this.byKey = new Map(s.byKey);
    this.kinds.clear();
    for (const [k, m] of s.kinds) this.kinds.set(k, new Map(m));
  }

  /** This run's mappings plus registry rows for labels not seen in this run, so the registry only grows. */
  rows(): SubjectAlias[] {
    const kept = [...this.registry.values()].filter((a) => !this.table.has(a.label));
    return [...this.table.values(), ...kept]
      .map((a) => ({ ...a, sources: [...a.sources].sort() }))
      .sort((a, b) => a.subject_id.localeCompare(b.subject_id) || a.label.localeCompare(b.label));
  }

  save(): void {
    const rows = this.rows();
    for (const r of rows) SubjectAlias.parse(r);
    writeJson(ALIASES, rows);
  }
}
