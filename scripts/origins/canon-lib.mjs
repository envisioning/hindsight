// Shared helpers for the Origins canon capture (#79, D57, D59). Network reads are cached in
// CANON_CACHE (default: <os tmpdir>/hindsight-canon), never in the repository.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const CACHE = process.env.CANON_CACHE ?? join(tmpdir(), "hindsight-canon");
const UA = "Mozilla/5.0 (compatible; research-script)";
mkdirSync(CACHE, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET a URL as text, cached by URL hash. */
export async function get(url) {
  const f = join(CACHE, createHash("sha1").update(url).digest("hex") + ".txt");
  if (existsSync(f)) return readFileSync(f, "utf8");
  let status = 0;
  for (let i = 0; i < 4; i++) {
    let r;
    try {
      r = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA }, signal: AbortSignal.timeout(60000) });
    } catch (err) {
      status = String(err?.name ?? err);
      await sleep(5000 * (i + 1));
      continue;
    }
    status = r.status;
    if (r.ok) {
      const t = await r.text();
      writeFileSync(f, t);
      await sleep(400);
      return t;
    }
    if (process.env.CANON_VERBOSE) console.error(`HTTP ${status} ${url.slice(0, 120)}`);
    await sleep(5000 * (i + 1));
  }
  throw new Error(`GET ${url} failed (HTTP ${status})`);
}

/** Wikitext of a page on a Wikipedia (`en`, `ja`), redirects followed. */
export async function wikitext(title, lang = "en") {
  const u = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  u.search = new URLSearchParams({ action: "parse", format: "json", prop: "wikitext|revid", redirects: "1", page: title, formatversion: "2" });
  const d = JSON.parse(await get(String(u)));
  if (d.error) throw new Error(`${title}: ${d.error.info}`);
  return { text: d.parse.wikitext, revid: d.parse.revid, title: d.parse.title };
}

export const pageUrl = (title, lang = "en") => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_")).replace(/%2C/g, ",").replace(/%3A/g, ":")}`;

/** Resolve article titles to Wikidata ids (redirects followed). Returns Map title -> {qid, title}. */
export async function qids(titles, lang = "en") {
  const out = new Map();
  const uniq = [...new Set(titles.filter(Boolean))];
  for (let i = 0; i < uniq.length; i += 50) {
    const batch = uniq.slice(i, i + 50);
    const u = new URL(`https://${lang}.wikipedia.org/w/api.php`);
    u.search = new URLSearchParams({ action: "query", format: "json", redirects: "1", prop: "pageprops", ppprop: "wikibase_item", titles: batch.join("|"), formatversion: "2" });
    const d = JSON.parse(await get(String(u))).query;
    const map = new Map(batch.map((t) => [t, t]));
    const norm = new Map((d.normalized ?? []).map((n) => [n.from, n.to]));
    const redir = new Map((d.redirects ?? []).map((n) => [n.from, n]));
    const pages = new Map(d.pages.map((p) => [p.title, p]));
    for (const t of batch) {
      let x = norm.get(t) ?? t;
      const r = redir.get(x);
      const frag = r?.tofragment;
      if (r) x = r.to;
      const p = pages.get(x);
      if (p && !p.missing && p.pageprops?.wikibase_item) out.set(t, { qid: p.pageprops.wikibase_item, title: p.title, fragment: frag });
    }
    void map;
  }
  return out;
}

/** Wikidata entities (claims + labels), batched. */
export async function entities(ids) {
  const out = new Map();
  const uniq = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < uniq.length; i += 50) {
    const u = new URL("https://www.wikidata.org/w/api.php");
    u.search = new URLSearchParams({ action: "wbgetentities", format: "json", ids: uniq.slice(i, i + 50).join("|"), props: "claims|labels|sitelinks", languages: "en|ja", sitefilter: "enwiki|jawiki" });
    const d = JSON.parse(await get(String(u)));
    for (const [k, v] of Object.entries(d.entities ?? {})) out.set(k, v);
  }
  return out;
}

/** Values of a Wikidata property: item ids, times, strings, monolingual texts. */
export function claimValues(e, p) {
  return (e?.claims?.[p] ?? [])
    .filter((c) => c.rank !== "deprecated" && c.mainsnak.snaktype === "value")
    .map((c) => c.mainsnak.datavalue.value)
    .map((v) => (typeof v === "string" ? v : v.id ?? v.time ?? v.text ?? v));
}
