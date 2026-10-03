/**
 * Origins: fiction as a source (D57, epic #85). A work of fiction is a source edition of `origins`
 * (edition = work id, published = the work's year); each depiction is a Claim of type `fiction`
 * with its fiction-specific fields in a `FictionDepiction` row. Authors are Institutions of kind
 * `author`; studios are metadata. Raw files: `data/raw/origins/works-<medium>.json` (`OriginsRawFile`).
 * Claim ids follow D15: `origins-<work id>-<nnn>`, nnn = the depiction's 1-based position in the
 * work's `depictions` on first assignment; natural key = the depiction's `key`.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { type Institution, type OriginsRawWork, type OriginsWork, OriginsRawFile } from "../../schema.ts";
import { type Bundle, RAW, clean, editionId, fit, readJson, slug } from "../lib.ts";

const SOURCE = "origins";
const SITE = "https://envisioning.com/research/origins";

/** Raw files of the source, sorted. An empty directory (INDEX.md only) is a valid, empty source. */
function workFiles(): string[] {
  return readdirSync(join(RAW, SOURCE))
    .filter((f) => /^works-[a-z0-9-]+\.json$/.test(f))
    .sort();
}

export function origins(): Bundle {
  const b: Bundle = {
    source: {
      id: SOURCE,
      publisher_id: "envisioning",
      series: "Origins: technologies imagined in fiction",
      url: SITE,
      licence_notes: "Facts about works (title, year, creators, medium) and one-sentence descriptions written by Envisioning. No text, stills or artwork from the works (NOTICE.md).",
    },
    institution: { id: "envisioning", name: "Envisioning", kind: "research_firm" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "depiction key (migrated connections: www:<research original_id>)",
    extraInstitutions: [],
    works: [],
  };
  const works: OriginsRawWork[] = [];
  for (const f of workFiles()) {
    const parsed = OriginsRawFile.safeParse(readJson(join(RAW, SOURCE, f)));
    if (!parsed.success) throw new Error(`${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    works.push(...parsed.data.works);
  }
  const byId = new Map<string, OriginsRawWork>();
  for (const w of works) {
    if (byId.has(w.id)) throw new Error(`duplicate work id ${w.id}`);
    byId.set(w.id, w);
  }
  const authors = new Map<string, Institution>();
  for (const w of works) {
    const parent = w.parent === undefined ? undefined : byId.get(w.parent);
    if (w.parent !== undefined && parent === undefined) throw new Error(`${w.id}: unknown parent ${w.parent}`);
    if (parent?.parent !== undefined) throw new Error(`${w.id}: parent ${w.parent} is itself a child work`);
    const creatorIds = w.creators.map((c) => {
      const id = slug(c.name);
      authors.set(id, { id, name: c.name, kind: "author" });
      return id;
    });
    const ed = editionId(SOURCE, w.id);
    const work: OriginsWork = clean({
      id: ed,
      source_id: SOURCE,
      edition: w.id,
      published: String(w.year),
      url: w.www?.slug !== undefined && w.parent === undefined ? `${SITE}/${w.www.slug}` : undefined,
      title: w.title,
      original_title: w.original_title,
      medium: w.medium,
      year: w.year,
      creator_ids: creatorIds,
      studio: w.studio,
      countries: w.countries,
      parent_edition_id: parent === undefined ? undefined : editionId(SOURCE, parent.id),
      canon: w.canon,
      inclusion: w.inclusion,
      image_url: w.image_url,
    });
    b.works?.push(work);
    b.editions.push(clean({ id: ed, source_id: SOURCE, edition: w.id, published: String(w.year), url: work.url }));
    const shown = parent === undefined ? w.title : `${parent.title}: ${w.title}`;
    w.depictions.forEach((d, i) => {
      const verb = d.basis === "connection" ? `Envisioning's Origins catalogue connects ${shown} (${w.year}) to ${d.label}` : `${shown} (${w.year}) depicts ${d.label}`;
      const noteParts = [
        d.basis === "connection"
          ? "Hand-made connection from the envisioning.com Origins catalogue (migrated, #78). The subject is the research technology the connection named; whether the work depicts it is checked by the extraction (#80)."
          : undefined,
        d.research_status === "unresolved" ? `The research technology id ${d.www_technology_id} has no current page; no research link.` : undefined,
        d.research_status === "remapped" ? `The research technology id ${d.www_technology_id} has no current page; linked to ${d.research.map((r) => `${r.research_slug}/${r.original_id}`).join(", ")}.` : undefined,
        // Migration notes (re-map reasons) stay in the raw file; an extraction's note is the claim's.
        d.basis === "extraction" ? d.note : undefined,
      ].filter((x): x is string => x !== undefined);
      b.drafts.push({
        key: d.key,
        index: i + 1,
        edition: w.id,
        labels: [{ label: d.label, kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote: d.quote,
          statement: fit(`${verb}: ${d.description}`),
          statement_generated: true,
          position: d.context === undefined ? shown : `${shown}, ${d.context}`,
          claim_type: "fiction" as const,
          note: noteParts.length > 0 ? fit(noteParts.join(" ")) : undefined,
          status: "open" as const,
          published: true,
        }),
        depiction: clean({
          source_edition_id: ed,
          year: w.year,
          basis: d.basis,
          centrality: d.centrality,
          physically_impossible: d.physically_impossible,
          www_technology_id: d.www_technology_id,
          research_status: d.research_status,
          research: d.research,
        }),
      });
    });
  }
  b.extraInstitutions = [...authors.values()].sort((a, c) => a.id.localeCompare(c.id));
  return b;
}
