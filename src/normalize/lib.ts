/**
 * Shared helpers for the normalize command. Node built-ins only.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Claim, Evidence, Institution, Source, SourceEdition, VerdictRow } from "../schema.ts";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RAW = join(REPO, "data", "raw");
export const OUT = join(REPO, "data", "normalized");

// Raw files are external input: read them as unknown and narrow field by field.
// biome-ignore lint: raw JSON has no static type
export type Raw = Record<string, any>;

export function readJson(path: string): Raw {
  return JSON.parse(readFileSync(path, "utf8")) as Raw;
}

export function readJsonIf<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback;
}

export function writeJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 1)}\n`);
}

export function writeText(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

/** Edition files of a raw source (`YYYY.json` or `YYYY-MM.json`), sorted. */
export function editionFiles(source: string): string[] {
  return readdirSync(join(RAW, source))
    .filter((f) => /^\d{4}(-\d{2})?\.json$/.test(f))
    .sort();
}

export function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

/** Drop keys whose value is undefined, so optional fields stay absent (exactOptionalPropertyTypes). */
export function clean<T extends object>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) out[k] = v;
  return out as T;
}

/** First entry of a `sources` list that is a URL (some lists start with a citation). */
export function firstUrl(v: unknown): string | undefined {
  return Array.isArray(v) ? (v.find((x) => typeof x === "string" && /^https?:\/\//.test(x)) as string | undefined) : undefined;
}

export function slug(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalized label key: case, accents, punctuation and a final plural are
 * ignored. "3-D Printing" and "3D printing" share a key; so do
 * "Mesh Networks: Sensor" and "Mesh Network-Sensors".
 */
export function normKey(label: string): string {
  const words = label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w) ? w.slice(0, -1) : w));
  return words.join("");
}

/** Truncate to fit a 400-character field, at a word boundary. */
export function fit(s: string, max = 400): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 3);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

export function year(v: unknown): string | undefined {
  if (typeof v === "number" && Number.isInteger(v)) return String(v);
  if (typeof v === "string" && /^\d{4}$/.test(v)) return v;
  return undefined;
}

/** Format a number for a generated statement without inventing precision. */
export function num(v: unknown, decimals?: number): string {
  if (typeof v !== "number") return String(v);
  if (decimals !== undefined) return v.toFixed(decimals);
  return v.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/** A label that should map to a subject, with its kind and the role it plays for the claim. */
export interface LabelRef {
  label: string;
  kind: "technology" | "quantity" | "risk" | "other";
}

/** A claim before it gets its permanent id and subject ids. */
export interface Draft {
  /** Natural key: unique per source edition, stable across re-captures (see PROGRESS.md). */
  key: string;
  /**
   * Number used on first id assignment: the 1-based position of the row in
   * the raw edition file's `entries` array, counting skipped rows too. Rows
   * outside `entries` (edition-level quotes) follow the last entry. For the
   * Envisioning posters it is the number in the existing raw id.
   */
  index: number;
  edition: string;
  /** Labels resolved through subject-aliases.json. */
  labels: LabelRef[];
  /** Deterministic quantity subjects (quantities.ts). */
  quantityIds: string[];
  claim: Omit<Claim, "id" | "source_edition_id" | "subject_ids">;
  /** Raw per-entry id, when the source has one (posters). */
  rawId?: string;
}

export interface VerdictDraft {
  rawClaimKey: string;
  edition: string;
  verdict: Omit<VerdictRow, "id" | "claim_id" | "evidence_ids">;
  evidence: Omit<Evidence, "id" | "claim_id">[];
}

export interface Bundle {
  source: Source;
  institution: Institution;
  editions: SourceEdition[];
  drafts: Draft[];
  /** Raw rows not turned into claims, with the reason, for PROGRESS.md. */
  skipped: Record<string, number>;
  verdicts?: VerdictDraft[];
  /** Natural key description, for PROGRESS.md. */
  keyRule: string;
  /** Extra aliases the source itself asserts, for example WEF's retrospective relabels. */
  extraAliases?: { label: string; sameAs: string; reason: string; kind: LabelRef["kind"] }[];
}

export function editionId(source: string, edition: string): string {
  return `${source}-${edition}`;
}
