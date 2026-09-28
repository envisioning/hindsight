/**
 * Envisioning Technology posters (2011, 2012). One claim per placement. The
 * posters keep their raw ids: et-2012-045 becomes envisioning-technology-2012-045.
 * Proposed verdicts (grader 1 of 2, D7) go to verdicts.json, not into the claim.
 */
import { join } from "node:path";
import { firstUrl, type Bundle, type Raw, RAW, type VerdictDraft, clean, editionFiles, editionId, fit, readJson, str, year } from "../lib.ts";

const SOURCE = "envisioning-technology";
const ISO = /^\d{4}(-\d{2}(-\d{2})?)?$/;

export function envisioningPosters(): Bundle {
  const b: Bundle = {
    source: { id: SOURCE, publisher_id: "envisioning", series: "Envisioning Technology posters", url: "https://www.envisioning.com/work/2012" },
    institution: { id: "envisioning", name: "Envisioning", kind: "research_firm" },
    editions: [],
    drafts: [],
    skipped: {},
    verdicts: [],
    keyRule: "raw placement id (et-<edition>-<nnn>); the id number is kept",
  };
  for (const f of editionFiles(SOURCE)) {
    const d = readJson(join(RAW, SOURCE, f));
    const ed = String(d.edition);
    const sources = Array.isArray(d.sources) ? (d.sources as string[]) : [];
    b.editions.push(clean({ id: editionId(SOURCE, ed), source_id: SOURCE, edition: ed, published: String(d.published), url: firstUrl(sources) }));
    for (const e of d.entries as Raw[]) {
      const rawId = String(e.id);
      const m = /^et-(\d{4})-(\d+)$/.exec(rawId);
      if (m === null || m[1] !== ed) throw new Error(`poster ${ed}: unexpected id ${rawId}`);
      const quantitative = e.kind === "quantitative";
      const band = str(e.band);
      const bandText = band === undefined ? undefined : band.endsWith("+") ? `after ${band.slice(0, -1)}` : band.replace("-", " to ");
      const notes = [
        str(e.note),
        str(e.interpretation) ? `Reading: ${e.interpretation}` : undefined,
        e.verdict_status === "graded_via_2012" ? `Graded once, on its 2012 placement (${String(e.graded_via).replace(/^et-/, `${SOURCE}-`)}).` : undefined,
        str(e.open_reason),
        e.confidence && e.confidence !== "high" ? `Extraction confidence: ${e.confidence}.` : undefined,
      ].filter((s): s is string => s !== undefined);
      b.drafts.push({
        key: rawId,
        index: Number(m[2]),
        edition: ed,
        rawId,
        labels: [{ label: quantitative ? String(e.metric) : String(e.label), kind: quantitative ? "quantity" : "technology" }],
        quantityIds: [],
        claim: clean({
          quote: String(e.label),
          statement: fit(String(e.claim)),
          statement_generated: true,
          position: [str(e.category), band ? `band ${band}` : `year ${e.placed_year}`].filter(Boolean).join("; "),
          claim_type: "forecast" as const,
          metric: quantitative ? str(e.metric) : undefined,
          value: quantitative ? str(e.value) : undefined,
          unit: quantitative ? str(e.unit) : undefined,
          target_date: band?.endsWith("+") ? undefined : year(e.placed_year),
          horizon_band: bandText,
          direction: quantitative ? undefined : ("arrive" as const),
          note: notes.length > 0 ? fit(notes.join(" ")) : undefined,
          status: "open" as const,
          published: true,
        }),
      });
      const verdict = str(e.proposed_verdict);
      if (verdict !== undefined) {
        const reason = [e.provisional ? `Provisional: the 5-year window closes in ${e.window_closes}.` : undefined, String(e.verdict_reason)]
          .filter(Boolean)
          .join(" ");
        const v: VerdictDraft = {
          rawClaimKey: rawId,
          edition: ed,
          verdict: {
            verdict: verdict as VerdictDraft["verdict"]["verdict"],
            reason,
            agent: "grader-1",
            model: "unrecorded",
            prompt_version: "unrecorded",
            created_at: "2026-09-27T00:00:00Z",
          },
          evidence: ((e.evidence ?? []) as Raw[]).map((ev) =>
            clean({
              url: String(ev.url),
              date: ISO.test(String(ev.date)) ? String(ev.date) : undefined,
              title: String(ev.title),
              note: str(ev.shows),
            }),
          ),
        };
        b.verdicts?.push(v);
      }
    }
  }
  return b;
}
