/**
 * Gartner Hype Cycle for Emerging Technologies, 1995 onward.
 * One claim per entry per edition. The claim is the time-to-plateau band.
 * Editions 2005 to 2017 carry positions but no phase: the phase is derived
 * from `x_time` and the measured boundaries in
 * data/normalized/hype-cycle-phase-boundaries.json (D14).
 */
import { join } from "node:path";
import { HypePhaseBoundaries, type HypePhase } from "../../schema.ts";
import { firstUrl, type Bundle, OUT, RAW, clean, editionFiles, editionId, fit, readJson, str } from "../lib.ts";

const SOURCE = "gartner-hype-cycle";

export const BAND_TEXT: Record<string, string> = {
  "<2": "less than 2 years",
  "2-5": "2 to 5 years",
  "5-10": "5 to 10 years",
  ">10": "more than 10 years",
  obsolete_before_plateau: "obsolete before plateau",
};
/** Order for delayed/advanced. Obsolete has no order. */
export const BAND_ORDER: Record<string, number> = {
  "less than 2 years": 1,
  "2 to 5 years": 2,
  "5 to 10 years": 3,
  "more than 10 years": 4,
};

const PHASES: HypePhase[] = ["innovation_trigger", "peak", "trough", "slope", "plateau"];
const PHASE_NAME: Record<HypePhase, string> = {
  innovation_trigger: "Innovation Trigger",
  peak: "Peak of Inflated Expectations",
  trough: "Trough of Disillusionment",
  slope: "Slope of Enlightenment",
  plateau: "Plateau of Productivity",
};

/** Within this many points of a boundary, the derived phase is flagged as uncertain. */
const NEAR = 0.5;

export function loadBoundaries(): Map<string, HypePhaseBoundaries> {
  const d = readJson(join(OUT, "hype-cycle-phase-boundaries.json"));
  const m = new Map<string, HypePhaseBoundaries>();
  for (const row of d.editions as unknown[]) {
    const b = HypePhaseBoundaries.parse(row);
    m.set(b.edition, b);
  }
  return m;
}

export function phaseAt(x: number, b: readonly number[]): HypePhase {
  const i = b.findIndex((v) => x < v);
  return PHASES[i === -1 ? 4 : i] as HypePhase;
}

export interface PhaseCheck {
  edition: string;
  compared: number;
  agree: number;
  disagreements: { label: string; raw: string; derived: string; x: number }[];
}

export function hypeCycle(): Bundle & { phaseChecks: PhaseCheck[] } {
  const boundaries = loadBoundaries();
  const b: Bundle & { phaseChecks: PhaseCheck[] } = {
    source: {
      id: SOURCE,
      publisher_id: "gartner",
      series: "Hype Cycle for Emerging Technologies",
      url: "https://www.gartner.com/en/research/methodologies/gartner-hype-cycle",
    },
    institution: { id: "gartner", name: "Gartner, Inc.", kind: "research_firm", country: "USA" },
    editions: [],
    drafts: [],
    skipped: {},
    keyRule: "label (exact, as captured); unique within an edition",
    phaseChecks: [],
  };
  for (const f of editionFiles(SOURCE)) {
    const d = readJson(join(RAW, SOURCE, f));
    const ed = String(d.edition);
    const sources = Array.isArray(d.sources) ? (d.sources as string[]) : [];
    b.editions.push(
      clean({ id: editionId(SOURCE, ed), source_id: SOURCE, edition: ed, published: String(d.published ?? ed), url: firstUrl(sources) }),
    );
    const bounds = boundaries.get(ed);
    const check: PhaseCheck = { edition: ed, compared: 0, agree: 0, disagreements: [] };
    (d.entries as Record<string, unknown>[]).forEach((e, i) => {
      const label = String(e.label);
      const bandRaw = str(e.band);
      const band = bandRaw === undefined ? undefined : BAND_TEXT[bandRaw];
      if (bandRaw !== undefined && band === undefined) throw new Error(`hype cycle ${ed}: unknown band ${bandRaw}`);
      const x = typeof e.x_time === "number" ? e.x_time : undefined;
      const rawPhase = str(e.phase) as HypePhase | undefined;
      let derived: HypePhase | undefined;
      let near = false;
      if (x !== undefined) {
        if (bounds === undefined) throw new Error(`hype cycle ${ed}: positions but no phase boundaries`);
        derived = phaseAt(x, bounds.boundaries);
        near = bounds.boundaries.some((v) => Math.abs(v - x) < NEAR);
        if (rawPhase !== undefined) {
          check.compared++;
          if (rawPhase === derived) check.agree++;
          else check.disagreements.push({ label, raw: rawPhase, derived, x });
        }
      }
      const phase = rawPhase ?? derived;
      const notes: string[] = [];
      if (Number(ed) <= 1998) notes.push("Position, not a forecast: the chart has no time-to-plateau markers, so this entry cannot be graded on timing.");
      else if (band === undefined) notes.push("No time-to-plateau band could be read for this entry.");
      if (rawPhase === undefined && derived !== undefined)
        notes.push(`Phase derived from x_time ${x} and the ${bounds?.method} boundaries for ${ed}${near ? "; within 0.5 points of a boundary, so the phase is uncertain" : ""}.`);
      if (rawPhase !== undefined && derived !== undefined && rawPhase !== derived)
        notes.push(`Phase as read on the chart; the measured boundaries give ${derived}.`);
      const rawNote = str(e.note);
      if (rawNote) notes.push(rawNote);
      if (e.confidence && e.confidence !== "high") notes.push(`Extraction confidence: ${e.confidence}.`);
      const position = [
        phase ? PHASE_NAME[phase] : undefined,
        x !== undefined ? `x ${x}, y ${e.y_expectations}` : undefined,
        e.rank !== undefined && e.rank !== null ? `rank ${e.rank}` : undefined,
      ]
        .filter(Boolean)
        .join("; ");
      b.drafts.push({
        key: label,
        index: i + 1,
        edition: ed,
        labels: [{ label, kind: "technology" }],
        quantityIds: [],
        claim: clean({
          quote: label,
          statement: `Gartner Hype Cycle for Emerging Technologies ${ed}: ${label}${phase ? `, ${PHASE_NAME[phase]}` : ""}${band ? `, plateau in ${band}` : ""}.`,
          statement_generated: true,
          position: position || undefined,
          claim_type: "forecast" as const,
          horizon_band: band,
          phase,
          note: notes.length > 0 ? fit(notes.join(" ")) : undefined,
          status: "open" as const,
          published: true,
        }),
      });
    });
    if (check.compared > 0) b.phaseChecks.push(check);
  }
  return b;
}
