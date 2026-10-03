// Origins canon capture (#79, D57, D59): read the canon lists (canon-lists.mjs), resolve each
// listed work to Wikidata for its facts (year of first release, country of origin, creators,
// original title, medium), dedupe works across lists, merge them into the works files, and
// write the membership rows. Deterministic on a warm cache; a re-run rewrites the same files.
//
//   node scripts/origins/canon-build.mjs            write data/raw/origins/works-*.json
//   node scripts/origins/canon-build.mjs --dry      print counts only
//
// Network reads (Wikipedia and Wikidata APIs) are cached in CANON_CACHE (canon-lib.mjs).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { claimValues, entities, qids } from "./canon-lib.mjs";
import { LISTS, readList } from "./canon-lists.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = join(ROOT, "data", "raw", "origins");
const DRY = process.argv.includes("--dry");
const FAMILY_FILE = { book: "works-book.json", film: "works-film.json", tv: "works-tv.json", game: "works-game.json", comic: "works-comic.json", short: "works-short-film.json" };
const FAMILY_OF = { novel: "book", novella: "book", short_story: "book", collection: "book", film: "film", short_film: "short", tv_series: "tv", tv_season: "tv", tv_episode: "tv", miniseries: "tv", game: "game", comic: "comic" };

// SF rule for lists that are not science-fiction-only (`sf: true`): a membership counts when a
// Wikidata genre (P136) or class (P31) of the work is science fiction or one of its subgenres,
// or when the work is also on a science-fiction or genre list.
const SF = /science fiction|sci-fi|cyberpunk|space opera|dystopi|apocalyptic|mecha|biopunk|steampunk|time travel|space western|solarpunk|tech noir|alien invasion|kaiju|tokusatsu|military fiction.*science/i;

const norm = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "work";
const lastName = (n) => norm((n ?? "").split(/\s+/).at(-1) ?? "");
const year = (t) => (typeof t === "string" ? Number(t.match(/^[+-](\d{4})/)?.[1]) || undefined : undefined);

function classify(labels) {
  const l = labels.join(" | ").toLowerCase();
  if (/episode/.test(l)) return "tv_episode";
  // A book series, franchise or fictional universe is not the listed work.
  if (/series|franchise|universe|saga|trilogy|sequence|cycle/.test(l) && !/television|tv |tv series|web series|anime|comic|manga|graphic novel|video game|webcomic/.test(l)) return "series";
  if (/television series season|season of|anime season/.test(l)) return "tv_season";
  if (/miniseries|original video animation|\bova\b/.test(l)) return "miniseries";
  if (/short film/.test(l)) return "short_film";
  if (/video game|computer game|interactive fiction|browser game|mobile game/.test(l)) return "game";
  if (/television|tv series|web series|anime series|animated series|tv program/.test(l)) return "tv_series";
  if (/manga|comic|graphic novel|webcomic|bande dessin|manhwa|manhua/.test(l)) return "comic";
  if (/\bfilm\b|motion picture|feature|anime film|animated film|movie/.test(l) && !/film series|franchise/.test(l)) return "film";
  if (/novella/.test(l)) return "novella";
  if (/short story/.test(l)) return "short_story";
  if (/collection|anthology/.test(l)) return "collection";
  if (/novel|literary work|book|written work/.test(l)) return "novel";
  return undefined;
}

function seiunMedium(t) {
  const s = (t ?? "").toLowerCase();
  if (/ova/.test(s)) return "miniseries";
  if (/episode/.test(s)) return "tv_episode";
  if (/tv|television|series/.test(s)) return "tv_series";
  if (/film|movie/.test(s)) return "film";
  if (/game/.test(s)) return "game";
  return undefined; // play, radio, music, event, book, website: outside the media of D57
}

async function main() {
  // 1. Entries of every list.
  const entries = [];
  const listInfo = [];
  for (const def of LISTS) {
    const es = await readList(def);
    for (const e of es) entries.push({ ...e, def });
    listInfo.push({ id: def.id, name: def.name, rows: es.length, revid: es[0]?.revid });
  }

  // 2. Wikidata ids of linked works and series.
  const titles = entries.flatMap((e) => [e.work.link, e.work.series?.link]).filter(Boolean);
  const q = await qids(titles);
  const ents = await entities([...q.values()].map((x) => x.qid));
  // Parents of episodes and seasons (P179 series, P361 part of).
  const parentIds = [];
  for (const e of ents.values()) for (const p of [...claimValues(e, "P179"), ...claimValues(e, "P4908")]) parentIds.push(p);
  for (const [k, v] of await entities(parentIds.filter((p) => !ents.has(p)))) ents.set(k, v);
  // Labels of classes, genres, countries and people.
  const refIds = new Set();
  for (const e of ents.values()) for (const p of ["P31", "P136", "P495", "P57", "P170", "P50", "P178", "P58"]) for (const v of claimValues(e, p)) refIds.add(v);
  const refs = await entities([...refIds]);
  const label = (id) => refs.get(id)?.labels?.en?.value ?? ents.get(id)?.labels?.en?.value;
  const iso3 = (id) => claimValues(refs.get(id), "P298")[0];

  const facts = (qid) => {
    const e = ents.get(qid);
    if (!e) return undefined;
    const classes = claimValues(e, "P31").map(label).filter(Boolean);
    if (claimValues(e, "P31").some((c) => ["Q5", "Q4167410", "Q43229", "Q95074", "Q15632617", "Q13442814", "Q1914636"].includes(c))) return undefined;
    // First publication or release (P577); else start time (P580); else inception (P571).
    const pick = (p) => claimValues(e, p).map(year).filter(Boolean);
    const yrs = pick("P577").length ? pick("P577") : pick("P580").length ? pick("P580") : pick("P571");
    const genres = claimValues(e, "P136").map(label).filter(Boolean);
    const titleClaim = (e.claims?.P1476 ?? []).map((c) => c.mainsnak.datavalue?.value).find((v) => v && !/^en/.test(v.language));
    const enwiki = e.sitelinks?.enwiki?.title;
    return {
      qid,
      classes,
      medium: classify(classes),
      year: yrs.length ? Math.min(...yrs) : undefined,
      genres,
      sf: SF.test([...genres, ...classes].join(" | ")),
      countries: [...new Set(claimValues(e, "P495").map(iso3).filter(Boolean))],
      directors: claimValues(e, "P57").map(label).filter(Boolean),
      authors: [...claimValues(e, "P50"), ...claimValues(e, "P58")].map(label).filter(Boolean),
      creators: claimValues(e, "P170").map(label).filter(Boolean),
      developers: claimValues(e, "P178").map(label).filter(Boolean),
      parent: claimValues(e, "P179")[0] ?? claimValues(e, "P4908")[0],
      label: e.labels?.en?.value ?? (enwiki ? enwiki.replace(/\s*\([^)]*\)$/, "") : undefined),
      original: titleClaim?.text,
      enwiki,
    };
  };

  // 3. One candidate work per entry.
  const excluded = [];
  const cands = [];
  for (const e of entries) {
    const def = e.def;
    const r = e.work.link ? q.get(e.work.link) : undefined;
    let f = r ? facts(r.qid) : undefined;
    // The link names the work's source, series or adaptation rather than the listed work
    // (a film entry linking to the novel, a novel entry linking to its series): no Wikidata facts.
    if (f) {
      const fFam = f.medium === "series" ? "series" : FAMILY_OF[f.medium];
      const lFam = def.id === "seiun-dramatic-presentation" ? FAMILY_OF[seiunMedium(e.mediaType) ?? "film"] : def.family;
      const ok = fFam === undefined ? true : lFam === "book" ? fFam === "book" : lFam === "comic" ? fFam === "comic" : ["film", "tv", "short", "game"].includes(fFam) && (lFam !== "game" || fFam === "game");
      if (!ok) f = undefined;
    }
    let seriesF = e.work.series?.link ? facts(q.get(e.work.series.link)?.qid) : undefined;
    // Medium.
    let medium = def.medium;
    if (def.id === "seiun-dramatic-presentation") medium = seiunMedium(e.mediaType) ?? (f?.medium && FAMILY_OF[f.medium] !== "book" ? f.medium : undefined);
    else if (["film", "tv"].includes(def.family) || def.id.startsWith("jmaf-animation")) {
      if (e.work.series) medium = "tv_episode";
      else if (f?.medium && FAMILY_OF[f.medium] !== "book" && f.medium !== "comic") medium = f.medium;
      else if (f && !f.medium) medium = undefined;
      else if (!f && def.family === "tv") medium = def.medium;
      else if (!f) medium = def.medium === "tv_episode" ? undefined : def.medium;
    }
    if (medium === undefined) { excluded.push({ list: def.id, year: e.year, title: e.work.title, why: `not a film, TV work or game (${e.mediaType ?? f?.classes.join(", ") ?? "no Wikidata class"})` }); continue; }
    // Episodes and seasons of a series.
    let parentF;
    if (medium === "tv_episode" || medium === "tv_season") {
      parentF = seriesF ?? (f?.parent ? facts(f.parent) : undefined);
      if (!parentF && !e.work.series) {
        excluded.push({ list: def.id, year: e.year, title: e.work.title, why: "episode or season without an identifiable series" });
        continue;
      }
      if (f && f.qid === parentF?.qid) f = undefined;
    }
    // SF rule.
    const sfOk = !def.sf || f?.sf === true;
    const persons = e.creators.filter((c) => c.name && !/^(various|n\/a)$/i.test(c.name));
    cands.push({ e, def, f, medium, parentF, seriesTitle: e.work.series?.title, sfOk, persons });
  }

  // 4. Dedupe into works: by Wikidata id, else by title and first creator.
  const works = new Map(); // key -> work
  const byKey2 = new Map();
  const episodeAlias = new Map();
  const key2 = (title, persons, family) => `${family}|${norm(title)}|${lastName(persons[0]?.name)}`;
  const workOf = (c) => {
    const fam = FAMILY_OF[c.medium];
    const title = c.f?.label ?? c.e.work.title;
    const episode = c.parentF || c.seriesTitle;
    const k = c.f ? `q:${c.f.qid}` : episode ? `e:${c.parentF?.qid ?? norm(c.seriesTitle)}|${norm(c.e.work.title)}` : `t:${key2(c.e.work.title, c.persons, fam)}`;
    const eKey = episode ? `e:${c.parentF?.qid ?? norm(c.seriesTitle)}|${norm(c.e.work.title)}` : undefined;
    let w = works.get(k) ?? (!c.f && eKey ? episodeAlias.get(eKey) : undefined);
    if (w && eKey && !episodeAlias.has(eKey)) episodeAlias.set(eKey, w);
    if (!w && !c.f && !c.parentF && !c.seriesTitle) w = byKey2.get(key2(c.e.work.title, c.persons, fam));
    if (!w) {
      w = { key: k, f: c.f, title, listTitle: c.e.work.title, medium: c.medium, family: fam, parentF: c.parentF, seriesTitle: c.seriesTitle, persons: c.persons, originals: c.e.work.originals, jpn: false, memberships: [], sfOk: false, aka: c.e.work.aka };
      works.set(k, w);
      if (eKey) episodeAlias.set(eKey, w);
    }
    for (const t of [c.e.work.title, title, c.e.work.aka].filter(Boolean)) {
      const kk = key2(t, c.persons.length ? c.persons : w.persons, fam);
      if (!byKey2.has(kk)) byKey2.set(kk, w);
    }
    if (w.persons.length === 0 && c.persons.length) w.persons = c.persons;
    if ((!w.originals || w.originals.length === 0) && c.e.work.originals?.length) w.originals = c.e.work.originals;
    return w;
  };
  // Works with a Wikidata item first, so a list row without a link joins the linked work.
  for (const c of [...cands.filter((x) => x.f), ...cands.filter((x) => !x.f)]) {
    const w = workOf(c);
    if (c.def.japanese || c.e.work.flagJpn) w.jpn = true;
    w.memberships.push({ c });
    if (!c.def.sf) w.sfOk = true;
  }
  // Apply the SF rule per membership: an `sf` list membership counts when the work is SF by
  // Wikidata genre, or is on a non-`sf` list.
  let sfDropped = 0;
  for (const w of works.values()) {
    w.memberships = w.memberships.filter(({ c }) => {
      if (!c.def.sf || c.sfOk || w.sfOk) return true;
      sfDropped++;
      return false;
    });
  }
  for (const [k, w] of works) if (w.memberships.length === 0) works.delete(k);

  // 5. Facts per work.
  const eligibility = (c) => (c.def.year === "ceremony" ? c.e.year - 1 : c.def.year.startsWith("fixed:") ? c.e.workYear : c.e.year);
  for (const w of works.values()) {
    const listYear = Math.min(...w.memberships.map(({ c }) => eligibility(c)).filter(Boolean));
    w.listYear = listYear;
    const fy = w.f?.year;
    if (fy && (fy <= listYear + 1 || w.medium === "comic" || w.medium === "tv_series")) {
      w.year = fy;
      w.yearSource = "wikidata";
    } else {
      w.year = listYear;
      w.yearSource = fy ? `list (Wikidata gives ${fy}, after the list's eligibility year)` : "list";
    }
    const fam = w.family;
    let creators = [];
    if (fam === "book" || (fam === "comic" && w.persons.length)) creators = w.persons.map((p) => p.name);
    else if (fam === "film" || w.medium === "tv_episode" || w.medium === "short_film") creators = w.f?.directors?.length ? w.f.directors : w.persons.map((p) => p.name);
    else if (fam === "tv") creators = w.f?.creators?.length ? w.f.creators : [];
    else if (fam === "comic") creators = w.f?.authors?.length ? w.f.authors : w.f?.creators ?? [];
    w.creators = [...new Set(creators.filter((n) => n && n.length < 80))].map((name) => ({ name, kind: /^the\s|\s(brothers|sisters)$|^(clamp|studio|team)\b/i.test(name) ? "group" : "person" }));
    w.studio = fam === "game" ? w.f?.developers?.[0] : undefined;
    w.countries = w.f?.countries?.length ? w.f.countries : w.jpn ? ["JPN"] : [];
    w.original = w.f?.original ?? (w.jpn ? w.originals?.[0] : undefined);
  }

  // 6. Merge with the existing works files.
  const files = {};
  for (const [fam, f] of Object.entries(FAMILY_FILE)) {
    try { files[fam] = JSON.parse(readFileSync(join(DIR, f), "utf8")); } catch { files[fam] = { rule: "D57", note: "Origins works (D57) from the canon lists (#79, scripts/origins/canon-build.mjs). Facts only (NOTICE.md). Child works follow their parent. See INDEX.md.", works: [] }; }
  }
  const existing = Object.entries(files).flatMap(([fam, d]) => d.works.map((w) => ({ fam, w })));
  const ids = new Set(existing.map((x) => x.w.id));
  const byQid = new Map(existing.filter((x) => x.w.wikidata).map((x) => [x.w.wikidata, x]));
  const famOfExisting = (x) => FAMILY_OF[x.w.medium];
  const titleIdx = new Map();
  for (const x of existing) for (const t of [x.w.title, x.w.original_title].filter(Boolean)) {
    const k = `${famOfExisting(x)}|${norm(t)}`;
    titleIdx.set(k, [...(titleIdx.get(k) ?? []), x]);
  }
  const matchExisting = (w) => {
    if (w.f && byQid.has(w.f.qid)) return byQid.get(w.f.qid);
    for (const t of [w.title, w.listTitle, w.aka].filter(Boolean)) {
      // Same title and family, and the same first creator or a year within one; roots before child works.
      const sameCreator = (x) => w.creators[0] && x.w.creators.some((c) => lastName(c.name) === lastName(w.creators[0].name));
      const all = (titleIdx.get(`${w.family}|${norm(t)}`) ?? []).filter((x) => (Math.abs(x.w.year - w.year) <= 1 || (sameCreator(x) && Math.abs(x.w.year - w.year) <= 3)) && (!x.w.wikidata || x.w.wikidata === w.f?.qid));
      const roots = all.filter((x) => !x.w.parent);
      const hits = roots.length > 0 ? roots : all;
      if (hits.length === 1) return hits[0];
    }
    return undefined;
  };
  const membershipsOf = (w) => {
    const rows = w.memberships.map(({ c }) => {
      const m = { list_id: c.def.id, list_name: c.def.name, year: c.e.year };
      if (c.e.category) m.category = c.e.category;
      m.standing = c.e.standing;
      const entry = c.seriesTitle ? `${c.seriesTitle}: ${c.e.work.title}` : c.e.work.title;
      if (norm(entry) !== norm(w.out?.title ?? w.title)) m.entry_title = entry;
      m.source_url = c.e.source_url;
      return m;
    });
    const seen = new Set();
    return rows
      .filter((m) => { const k = `${m.list_id}|${m.year}|${m.category ?? ""}|${m.entry_title ?? ""}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.year - b.year || a.list_id.localeCompare(b.list_id) || (a.entry_title ?? "").localeCompare(b.entry_title ?? ""));
  };
  const newId = (title, year, prefix = "", fallback = "") => {
    // A title in Japanese script only: the first creator and the year make the id.
    if (slug(title) === "work") title = fallback || "work";
    let id = prefix + slug(title);
    if (ids.has(id)) id = `${prefix}${slug(title)}-${year}`;
    let n = 2;
    while (ids.has(id)) id = `${prefix}${slug(title)}-${year}-${n++}`;
    ids.add(id);
    return id;
  };
  const toRaw = (w, id, parentId) => {
    const r = { id, title: w.title };
    if (w.original && norm(w.original) !== norm(w.title)) r.original_title = w.original;
    r.medium = w.medium;
    r.year = w.year;
    r.creators = w.creators;
    if (w.studio) r.studio = w.studio;
    r.countries = w.countries;
    if (parentId) r.parent = parentId;
    r.canon = [];
    r.inclusion = "canon";
    if (w.f) r.wikidata = w.f.qid;
    r.depictions = [];
    if (w.yearSource !== "wikidata") r.note = w.f ? `Year from the list: ${w.yearSource}.` : "Year from the list (no Wikidata item): the eligibility year, or the ceremony year minus one.";
    return r;
  };

  // Series parents of episodes and seasons that are not on a list themselves.
  const parentWorks = new Map();
  const report = { matched: [], newRoots: 0, newChildren: 0, newParents: 0 };
  const appended = { book: [], film: [], tv: [], game: [], comic: [], short: [] };
  const childrenOf = new Map(); // existing or new parent id -> new child raws

  const ordered = [...works.values()].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title) || a.key.localeCompare(b.key));
  // Roots first, children after.
  for (const w of ordered.filter((x) => !x.parentF && !x.seriesTitle)) {
    const hit = matchExisting(w);
    if (hit) {
      w.out = hit.w;
      hit.w.canon = membershipsOf(w);
      hit.w.inclusion = "canon";
      if (w.f && !hit.w.wikidata) hit.w.wikidata = w.f.qid;
      report.matched.push(`${hit.w.id} (${hit.w.inclusion === "canon" && hit.w.www ? "curated" : "canon"})`);
      if (w.f) byQid.set(w.f.qid, hit);
      continue;
    }
    const r = toRaw(w, newId(w.title, w.year, "", `${w.creators[0]?.name ?? w.family} ${w.year}`));
    r.canon = membershipsOf({ ...w, out: r });
    appended[w.family].push(r);
    if (w.f) byQid.set(w.f.qid, { fam: w.family, w: r });
    report.newRoots++;
  }
  for (const w of ordered.filter((x) => x.parentF || x.seriesTitle)) {
    // Find or create the parent series.
    let parent;
    if (w.parentF) parent = byQid.get(w.parentF.qid)?.w;
    if (!parent) {
      const pk = w.parentF ? `q:${w.parentF.qid}` : `t:${norm(w.seriesTitle)}`;
      parent = parentWorks.get(pk);
      if (!parent) {
        // Match an existing work by title.
        const t = w.parentF?.label ?? w.seriesTitle;
        const hits = existing.filter((x) => norm(x.w.title) === norm(t) && FAMILY_OF[x.w.medium] === "tv");
        if (hits.length === 1) parent = hits[0].w;
      }
      if (!parent) {
        const pf = w.parentF;
        const pw = { title: pf?.label ?? w.seriesTitle, medium: "tv_series", year: pf?.year ?? w.year, yearSource: pf?.year ? "wikidata" : "list", creators: (pf?.creators ?? []).map((name) => ({ name, kind: "person" })), countries: pf?.countries ?? [], f: pf, original: pf?.original };
        const r = toRaw(pw, newId(pw.title, pw.year));
        r.note = [r.note, "Included as the series of a listed episode or season; not on a list itself."].filter(Boolean).join(" ");
        appended.tv.push(r);
        parentWorks.set(pk, r);
        if (pf) byQid.set(pf.qid, { fam: "tv", w: r });
        parent = r;
        report.newParents++;
      }
    }
    // A child's parent is never itself a child (D57): attach to the root.
    let root = parent;
    if (root.parent) root = existing.find((x) => x.w.id === root.parent)?.w ?? appended.tv.find((x) => x.id === root.parent) ?? root;
    // Existing child already captured?
    const hit = (w.f && byQid.get(w.f.qid)) || existing.find((x) => x.w.parent === root.id && norm(x.w.title) === norm(w.title));
    if (hit) {
      w.out = hit.w;
      hit.w.canon = membershipsOf(w);
      hit.w.inclusion = "canon";
      if (w.f && !hit.w.wikidata) hit.w.wikidata = w.f.qid;
      report.matched.push(hit.w.id);
      continue;
    }
    const r = toRaw(w, newId(w.title, w.year, `${root.id}--`), root.id);
    if (root !== parent) r.note = [r.note, `Episode of ${parent.title}, recorded under its root work.`].filter(Boolean).join(" ");
    r.canon = membershipsOf({ ...w, out: r });
    if (w.f) byQid.set(w.f.qid, { fam: "tv", w: r });
    childrenOf.set(root.id, [...(childrenOf.get(root.id) ?? []), r]);
    report.newChildren++;
  }

  // 7. Write: existing order kept; new roots appended; new children right after their parent's block.
  const counts = {};
  for (const [fam, d] of Object.entries(files)) {
    const out = [];
    const all = [...d.works, ...appended[fam].filter((r) => !d.works.some((x) => x.id === r.id))];
    for (const w of all) {
      out.push(w);
      if (!w.parent) {
        // keep existing children (they follow in `all`); insert new children after the last child of w
      }
    }
    // Insert new children after their root's existing block.
    const result = [];
    for (let i = 0; i < out.length; i++) {
      result.push(out[i]);
      const next = out[i + 1];
      const rootId = out[i].parent ?? out[i].id;
      if (!next || (next.parent ?? next.id) !== rootId) {
        const kids = (childrenOf.get(rootId) ?? []).filter((k) => !result.some((x) => x.id === k.id) && !out.some((x) => x.id === k.id));
        result.push(...kids);
        childrenOf.delete(rootId);
      }
    }
    d.works = result;
    counts[fam] = { works: result.length, canon: result.filter((w) => w.inclusion === "canon").length };
  }
  if (childrenOf.size > 0) throw new Error(`children without a written parent: ${[...childrenOf.keys()].join(", ")}`);

  const summary = { lists: listInfo, entries: entries.length, works: works.size, sfDropped, excluded: excluded.length, matched: report.matched.length, newRoots: report.newRoots, newChildren: report.newChildren, newParents: report.newParents, counts };
  console.log(JSON.stringify(summary, null, 1));
  const outDir = DRY ? process.env.CANON_OUT : DIR;
  if (outDir) for (const [fam, d] of Object.entries(files)) if (d.works.length > 0) writeFileSync(join(outDir, FAMILY_FILE[fam]), JSON.stringify(d, null, 1) + "\n");
  if (process.env.CANON_REPORT) writeFileSync(process.env.CANON_REPORT, JSON.stringify({ summary, excluded, matched: report.matched }, null, 1));
}

await main();
