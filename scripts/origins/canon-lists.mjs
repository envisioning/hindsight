// The canon lists of Origins (#79, D57, D59) and how each Wikipedia list page is read.
// Every list yields entries: one row per (list, year, work) with its standing.
import { entities, get, pageUrl, qids, wikitext } from "./canon-lib.mjs";
import { clean, grid, render, tables } from "./wikitable.mjs";

/**
 * List definitions. `year`: what the year column of the page means (`ceremony` or `eligibility`,
 * recorded in INDEX.md). `sf`: the list is not science-fiction-only; an entry counts only when
 * Wikidata gives the work a science-fiction genre (SF rule in canon-build.mjs).
 */
export const LISTS = [
  // Prose
  { id: "hugo-best-novel", name: "Hugo Award for Best Novel", page: "Hugo Award for Best Novel", medium: "novel", family: "book", work: /novel/, creator: /author/, winner: "star", year: "ceremony", tables: (t) => !/retro/i.test(t.heading) },
  { id: "hugo-best-novel-retro", name: "Retro Hugo Award for Best Novel", page: "Hugo Award for Best Novel", medium: "novel", family: "book", work: /novel/, creator: /author/, winner: "star", year: "ceremony", tables: (t) => /retro/i.test(t.heading) },
  { id: "nebula-best-novel", name: "Nebula Award for Best Novel", page: "Nebula Award for Best Novel", medium: "novel", family: "book", work: /novel/, creator: /author/, winner: "star", year: "eligibility" },
  { id: "locus-best-sf-novel", name: "Locus Award for Best Science Fiction Novel", page: "Locus Award for Best Science Fiction Novel", medium: "novel", family: "book", work: /work|novel/, creator: /author/, winner: "all", year: "ceremony" },
  { id: "hugo-best-novella", name: "Hugo Award for Best Novella", page: "Hugo Award for Best Novella", medium: "novella", family: "book", work: /novella|work/, creator: /author/, winner: "star", year: "ceremony", tables: (t) => !/retro/i.test(t.heading) },
  { id: "hugo-best-novella-retro", name: "Retro Hugo Award for Best Novella", page: "Hugo Award for Best Novella", medium: "novella", family: "book", work: /novella|work/, creator: /author/, winner: "star", year: "ceremony", tables: (t) => /retro/i.test(t.heading) },
  { id: "nebula-best-novella", name: "Nebula Award for Best Novella", page: "Nebula Award for Best Novella", medium: "novella", family: "book", work: /novella|work/, creator: /author/, winner: "star", year: "eligibility" },
  { id: "locus-best-novella", name: "Locus Award for Best Novella", page: "Locus Award for Best Novella", medium: "novella", family: "book", work: /novella|work/, creator: /author/, winner: "all", year: "ceremony" },
  { id: "clarke-award", name: "Arthur C. Clarke Award", page: "Arthur C. Clarke Award", medium: "novel", family: "book", work: /novel|work|title/, creator: /author/, winner: "star", year: "ceremony" },
  { id: "philip-k-dick-award", name: "Philip K. Dick Award", page: "Philip K. Dick Award", medium: "novel", family: "book", work: /novel|work|title/, creator: /author/, winner: "bold", year: "ceremony", tables: (t) => t.rows.length > 10 },
  // Film and TV
  { id: "saturn-best-sf-film", name: "Saturn Award for Best Science Fiction Film", page: "Saturn Award for Best Science Fiction Film", medium: "film", family: "film", work: /film/, winner: "style", year: "eligibility" },
  { id: "afi-10-top-10-sf", name: "AFI's 10 Top 10: Science fiction", page: "AFI's 10 Top 10", medium: "film", family: "film", work: /film/, winner: "listed", year: "fixed:2008", tables: (t) => /science fiction/i.test(t.heading) },
  { id: "sight-and-sound-2022", name: "Sight and Sound Greatest Films of All Time 2022, critics' poll", url: "https://www.bfi.org.uk/sight-and-sound/greatest-films-all-time", reader: "bfi", medium: "film", family: "film", winner: "listed", year: "fixed:2022", sf: true },
  { id: "hugo-dramatic-presentation", name: "Hugo Award for Best Dramatic Presentation", page: "Hugo Award for Best Dramatic Presentation", medium: "film", family: "film", work: /work/, creator: /creator/, winner: "star", year: "ceremony", tables: (t) => /1958/.test(t.heading) },
  { id: "hugo-dramatic-presentation-long", name: "Hugo Award for Best Dramatic Presentation, Long Form", page: "Hugo Award for Best Dramatic Presentation", medium: "film", family: "film", work: /work/, creator: /creator/, winner: "star", year: "ceremony", tables: (t) => /long form/i.test(t.heading) },
  { id: "hugo-dramatic-presentation-short", name: "Hugo Award for Best Dramatic Presentation, Short Form", page: "Hugo Award for Best Dramatic Presentation", medium: "tv_episode", family: "tv", work: /work/, creator: /creator/, winner: "star", year: "ceremony", tables: (t) => /short form/i.test(t.heading) },
  { id: "hugo-dramatic-presentation-retro", name: "Retro Hugo Award for Best Dramatic Presentation", page: "Hugo Award for Best Dramatic Presentation", medium: "film", family: "film", work: /work/, creator: /creator/, winner: "star", year: "ceremony", tables: (t) => /retro/i.test(t.heading) },
  { id: "nebula-ray-bradbury", name: "Nebula Ray Bradbury Award for Outstanding Dramatic Presentation", page: "Ray Bradbury Award", medium: "film", family: "film", work: /work/, creator: /creator/, winner: "star", year: "eligibility" },
  { id: "nebula-best-script", name: "Nebula Award for Best Script", page: "Nebula Award for Best Script", medium: "film", family: "film", work: /work|script|title/, creator: /writer|author|creator/, winner: "star", year: "eligibility" },
  { id: "saturn-best-sf-tv-series", name: "Saturn Award for Best Science Fiction Television Series", page: "Saturn Award for Best Science Fiction Television Series", medium: "tv_series", family: "tv", work: /series/, winner: "style", year: "eligibility" },
  // Games
  { id: "hugo-best-game", name: "Hugo Award for Best Video Game (2021) / Best Game or Interactive Work", page: "Hugo Award for Best Game or Interactive Work", medium: "game", family: "game", work: /game|work/, winner: "star", year: "ceremony" },
  { id: "nebula-game-writing", name: "Nebula Award for Best Game Writing", page: "Nebula Award for Best Game Writing", medium: "game", family: "game", work: /game/, creator: /writer/, winner: "star", year: "eligibility" },
  { id: "bafta-best-game", name: "BAFTA Games Award for Best Game", page: "British Academy Games Award for Best Game", medium: "game", family: "game", work: /game/, winner: "style", year: "eligibility", sf: true, tables: (t) => /Winners/.test(t.heading) && t.rows.length > 5 },
  { id: "gdca-game-of-the-year", name: "Game Developers Choice Award for Game of the Year", page: "Game Developers Choice Award for Game of the Year", medium: "game", family: "game", work: /game/, winner: "style", year: "eligibility", sf: true, tables: (t) => /winners/i.test(t.heading) },
  // Comics
  { id: "hugo-graphic-story", name: "Hugo Award for Best Graphic Story or Comic", page: "Hugo Award for Best Graphic Story or Comic", medium: "comic", family: "comic", work: /work/, creator: /creator/, winner: "star", year: "ceremony", tables: (t) => !/retro/i.test(t.heading) },
  { id: "eisner-best-continuing-series", name: "Eisner Award for Best Continuing Series", page: "Eisner Award for Best Continuing Series", medium: "comic", family: "comic", work: /title/, creator: /creator/, winner: "style", year: "ceremony", sf: true, stripParen: true, tables: (t) => /Winners/.test(t.heading) },
  // Japanese SF (Seiun) and Japan Media Arts Festival
  { id: "seiun-japanese-long", name: "Seiun Award for Best Japanese Long Work", page: "Seiun Award", medium: "novel", family: "book", work: /work/, creator: /author/, winner: "style", year: "ceremony", japanese: true, tables: (t) => /Japanese Long/i.test(t.heading) },
  { id: "seiun-japanese-short", name: "Seiun Award for Best Japanese Short Story", page: "Seiun Award", medium: "short_story", family: "book", work: /work/, creator: /author/, winner: "style", year: "ceremony", japanese: true, tables: (t) => /Japanese Short/i.test(t.heading) },
  { id: "seiun-dramatic-presentation", name: "Seiun Award for Best Dramatic Presentation", page: "Seiun Award", medium: "film", family: "film", work: /work/, mediaType: /media/, winner: "style", year: "ceremony", tables: (t) => /Dramatic/i.test(t.heading) },
  { id: "seiun-comic", name: "Seiun Award for Best Comic", page: "Seiun Award", medium: "comic", family: "comic", work: /work/, creator: /author/, winner: "style", year: "ceremony", japanese: true, tables: (t) => /Best Comic/i.test(t.heading) },
  { id: "jmaf-animation", name: "Japan Media Arts Festival, Animation Division", page: "Japan Media Arts Festival", medium: "film", family: "film", winner: "jmaf", year: "ceremony", sf: true, tables: (t) => /^Animation/i.test(t.heading) },
  { id: "jmaf-manga", name: "Japan Media Arts Festival, Manga Division", page: "Japan Media Arts Festival", medium: "comic", family: "comic", winner: "jmaf", year: "ceremony", sf: true, tables: (t) => /^Manga/i.test(t.heading) },
];

const WIN_STYLE = /lightyellow|#EEDD82|#FAEB86|#B0C4DE/i;

function years(text) {
  const t = render(text).text.replace(/\(\d+(?:st|nd|rd|th)\)/g, "");
  const m = [...t.matchAll(/\b(1[89]\d\d|20\d\d)\b(?:\s*\/\s*(\d{2,4})\b)?/g)];
  if (m.length === 0) return undefined;
  const a = m[0];
  if (a[2]) return a[2].length === 2 ? Number(a[1].slice(0, 2) + a[2]) : Number(a[2]);
  return Number(a[1]);
}

/** Split a work cell into title, link, series/episode, also-known-as. */
export function readWork(cellSrc, opts = {}) {
  const r = render(cellSrc);
  let text = r.text.replace(/\s*[*†+‡]+\s*$/, "").replace(/\s*[*†+‡]+(?=\s|$)/g, "").trim();
  const quoted = text.match(/^(.*?):\s*["“]([^"”]+)["”]/);
  const aka = text.match(/\((?:also known as|aka|published as)\s+([^)]+)\)/i);
  text = text.replace(/\s*\((?:also known as|aka|published as)[^)]*\)/i, "").trim();
  if (opts.stripParen) text = text.replace(/\s*\([^)]*\)\s*$/, "").trim();
  text = text.replace(/^["“]([^"”]+)["”]$/, "$1").trim();
  const firstLink = r.links[0];
  if (quoted && !/^\s*$/.test(quoted[1])) {
    // "Series: "Episode"" (Hugo short form, Seiun): the first link is the series, a link in the quotes the episode.
    const seriesTitle = quoted[1].trim();
    const ep = quoted[2].trim();
    const seriesLink = r.links.find((l) => clean(l.text) === seriesTitle || seriesTitle.includes(clean(l.text)));
    const epLink = r.links.find((l) => clean(l.text).replace(/["“”]/g, "") === ep && l !== seriesLink);
    return { title: ep, link: epLink?.target, series: { title: seriesTitle, link: seriesLink?.target }, originals: r.originals, bold: r.bold, flagJpn: r.flagJpn, raw: text };
  }
  return { title: text, link: firstLink?.target, aka: aka?.[1], originals: r.originals, bold: r.bold, flagJpn: r.flagJpn, raw: text };
}

/** Creators from a creator cell. Hugo DP style "Name (director), ...": keeps directors when roles are given. */
export function readCreators(cellSrc) {
  if (!cellSrc) return [];
  const r = render(cellSrc);
  if (r.persons.length > 0) return r.persons.map((p) => ({ name: p.name.replace(/\*+$/, "").trim(), link: p.link }));
  const text = r.text.replace(/\*/g, "");
  if (/\(/.test(text)) {
    const parts = text.split(/\),\s*|\)\s*and\s*|\);\s*/).map((p) => p.trim()).filter(Boolean);
    const named = parts.map((p) => {
      const m = p.match(/^(.*?)\s*\(([^)]*)\)?$/);
      return m ? { name: m[1].trim(), role: m[2] } : { name: p, role: "" };
    });
    const directors = named.filter((n) => /direct/i.test(n.role));
    const pick = directors.length > 0 ? directors : named.filter((n) => /writ|author|creat|screenplay/i.test(n.role)).slice(0, 2);
    return pick.map((n) => ({ name: n.name, link: r.links.find((l) => clean(l.text) === n.name)?.target }));
  }
  return text
    .split(/,\s*(?:and\s+)?|\s+and\s+|\s*&\s*|\n/)
    .map((s) => s.trim())
    .filter((s) => s && s.length < 60)
    .map((name) => ({ name, link: r.links.find((l) => clean(l.text) === name)?.target }));
}

async function readJmaf(def, t, src) {
  const out = [];
  const g = grid(t);
  for (const row of g) {
    if (row.headerRow) continue;
    const y = years(row.cells[0]?.content ?? "");
    if (!y) continue;
    const add = (content, category) => {
      const items = content.includes("\n*") || content.trim().startsWith("*") ? content.split(/\n\*+\s*/).map((s) => s.replace(/^\*+\s*/, "")).filter((s) => s.trim()) : [content];
      for (const it of items) {
        if (/^\s*(n\/a|none|-)?\s*$/i.test(clean(render(it).text))) continue;
        const parts = it.split(/'',\s*/);
        const workSrc = parts.length > 1 ? parts[0] + "''" : it;
        const w = readWork(workSrc);
        const creators = parts.length > 1 ? readCreators(parts.slice(1).join("'', ")) : [];
        out.push({ year: y, standing: "winner", category, work: w, creators });
      }
    };
    add(row.cells[1]?.content ?? "", "Grand Prize");
    add(row.cells[2]?.content ?? "", "Excellence Prize");
  }
  return out.map((e) => ({ ...e, source_url: src }));
}

/** Entries of one list. */
export async function readList(def) {
  if (def.reader === "bfi") return readSightAndSound(def);
  const page = await wikitext(def.page);
  const src = pageUrl(page.title);
  const ts = tables(page.text).filter((t) => (def.tables ? def.tables(t) : t.rows.length > 3));
  const raw = [];
  for (const t of ts) {
    if (def.winner === "jmaf") { raw.push(...(await readJmaf(def, t, src))); continue; }
    const g = grid(t);
    const head = g.find((r) => r.headerRow);
    if (!head) continue;
    const names = head.cells.map((c) => clean(render(c.content).text).toLowerCase());
    const col = (re) => (re ? names.findIndex((n) => re.test(n)) : -1);
    const cy = names.findIndex((n) => /year/.test(n));
    const cw = col(def.work);
    const cc = col(def.creator);
    const cm = col(def.mediaType);
    if (cw < 0) throw new Error(`${def.id}: no work column in ${names.join(" | ")}`);
    let rank = 0;
    for (const row of g) {
      if (row.headerRow && row !== head) continue;
      if (row === head) continue;
      const wc = row.cells[cw];
      if (!wc || /no award/i.test(wc.content)) continue;
      if (row.cells.length < 2) continue;
      rank++;
      let year;
      if (def.year.startsWith("fixed:")) year = Number(def.year.slice(6));
      else year = years(row.cells[cy]?.content ?? "");
      if (!year) continue;
      const w = readWork(wc.content, { stripParen: def.stripParen });
      if (!w.title) continue;
      const rowText = [row.cells[cw]?.content, row.cells[cc]?.content].filter(Boolean).join(" ");
      let standing;
      if (def.winner === "listed") standing = "listed";
      else if (def.winner === "all") standing = "winner";
      else if (def.winner === "star") standing = /\*/.test(rowText) ? "winner" : "shortlisted";
      else if (def.winner === "bold") standing = w.bold ? "winner" : "shortlisted";
      else standing = WIN_STYLE.test(row.attrs) || WIN_STYLE.test(wc.attrs) ? "winner" : "shortlisted";
      const e = { year, standing, work: w, creators: cc >= 0 ? readCreators(row.cells[cc]?.content) : [], source_url: src };
      if (def.winner === "listed") e.rank = rank;
      if (cm >= 0) e.mediaType = clean(render(row.cells[cm]?.content ?? "").text);
      if (cy >= 0 && def.winner === "listed") e.workYear = years(row.cells[names.findIndex((n) => n === "year")]?.content ?? "");
      raw.push(e);
    }
  }
  // Seiun tables mark the winner by row colour only where a year has candidates; a year with a
  // single unmarked entry lists its winner alone.
  if (def.winner === "style") {
    const byYear = new Map();
    for (const e of raw) byYear.set(e.year, [...(byYear.get(e.year) ?? []), e]);
    for (const es of byYear.values()) if (es.length === 1 && es[0].standing !== "winner") es[0].standing = "winner";
  }
  // Deduplicate rows that repeat a work in the same year (multi-author rowspans).
  const seen = new Map();
  for (const e of raw) {
    const k = `${e.year}|${e.work.series?.title ?? ""}|${e.work.title}`;
    const prev = seen.get(k);
    if (prev) {
      for (const c of e.creators) if (!prev.creators.some((p) => p.name === c.name)) prev.creators.push(c);
      if (e.standing === "winner") prev.standing = "winner";
      continue;
    }
    seen.set(k, { ...e, list_id: def.id, list_name: def.name, revid: page.revid });
  }
  return [...seen.values()];
}

/**
 * Sight and Sound Greatest Films of All Time 2022, critics' poll (BFI): the published ranking
 * (top 250 with ties), read from the BFI page. Each film is resolved to its Wikipedia article by
 * title and year ("Title (YYYY film)", "Title (film)", "Title"), kept only when the article's
 * Wikidata release year is within one year of the poll's.
 */
export async function readSightAndSound(def) {
  const html = await get(def.url);
  const out = [];
  const re = /<article id="[^"]*" class="PreviewCard__Article[^"]*"><a href="[^"]*"><h1>([^<]*)<\/h1>.*?PreviewCard__label">(.*?)<\/p>.*?ResultsPage__P[^"]*">(\d{4})(?:<!-- -->)?\s*([^<]*)<\/p>(?:<p class="ResultsPage__P[^"]*">Directed by (?:<!-- -->)?([^<]*)<\/p>)?/gs;
  const dec = (s) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
  const seen = new Set();
  for (const m of html.matchAll(re)) {
    const title = dec(m[1]);
    const y = Number(m[3]);
    if (seen.has(`${title}|${y}`)) continue;
    seen.add(`${title}|${y}`);
    const tries = [`${title} (${y} film)`, `${title} (film)`, title];
    const found = await qids(tries);
    let link;
    for (const t of tries) {
      const r = found.get(t);
      if (!r) continue;
      const e = (await entities([r.qid])).get(r.qid);
      const yrs = (e?.claims?.P577 ?? []).map((c) => Number(c.mainsnak.datavalue?.value?.time?.slice(1, 5))).filter(Boolean);
      if (yrs.some((x) => Math.abs(x - y) <= 1)) { link = r.title; break; }
    }
    const directors = m[5] ? dec(m[5]).split(/,\s*|\s+&\s+|\s+and\s+/).map((name) => ({ name })) : [];
    out.push({ year: 2022, standing: "listed", workYear: y, work: { title, link, originals: [], bold: false, flagJpn: false, raw: title }, creators: directors, source_url: def.url, list_id: def.id, list_name: def.name });
  }
  return out;
}
