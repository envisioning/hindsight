// A small wikitext table reader for the Origins canon capture (#79): tables, rows, cells with
// rowspan/colspan expanded, and a renderer that turns cell wikitext into text plus its links.

/** Remove comments and references (their content is citation metadata, never list data). */
export function stripNoise(t) {
  return t
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/\{\{(?:efn|refn|NoteTag|sfn|r|Ref heading|refh|Abbr\|Ref\.\|Reference)[^{}]*\}\}/gi, "");
}

/** Split at top-level occurrences of `sep` (outside [[ ]] and {{ }}). */
export function splitTop(s, sep) {
  const out = [];
  let depthL = 0;
  let depthT = 0;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === "[[") { depthL++; cur += two; i++; continue; }
    if (two === "]]" && depthL > 0) { depthL--; cur += two; i++; continue; }
    if (two === "{{") { depthT++; cur += two; i++; continue; }
    if (two === "}}" && depthT > 0) { depthT--; cur += two; i++; continue; }
    if (depthL === 0 && depthT === 0 && s.startsWith(sep, i)) {
      out.push(cur);
      cur = "";
      i += sep.length - 1;
      continue;
    }
    cur += s[i];
  }
  out.push(cur);
  return out;
}

function parseCell(raw, header) {
  // Attribute part: text before the first top-level single pipe, when it looks like attributes.
  const parts = splitTop(raw, "|");
  let attrs = "";
  let content = raw;
  if (parts.length > 1 && /^\s*(?:[a-z-]+\s*=\s*("[^"]*"|'[^']*'|[^\s|]+)\s*)*\s*$/i.test(parts[0])) {
    attrs = parts[0];
    content = parts.slice(1).join("|");
  }
  const span = (name) => {
    const m = attrs.match(new RegExp(`${name}\\s*=\\s*["']?(\\d+)`, "i"));
    return m ? Number(m[1]) : 1;
  };
  return { header, attrs, content: content.trim(), rowspan: span("rowspan"), colspan: span("colspan") };
}

/**
 * Tables of a page: [{ line, heading, rows: [{ attrs, cells }] }]. `heading` is the chain of
 * section headings above the table. Nested tables are kept as cell text.
 */
export function tables(text) {
  const lines = stripNoise(text).split("\n");
  const out = [];
  const headings = [];
  let t = null;
  let depth = 0;
  let row = null;
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    const h = line.match(/^(={2,6})\s*(.*?)\s*\1\s*$/);
    if (!t && h) {
      const level = h[1].length;
      headings.length = level - 2;
      headings[level - 2] = h[2];
      continue;
    }
    const s = line.trimStart();
    if (s.startsWith("{|")) {
      if (t) { depth++; if (row?.cells.length) row.cells.at(-1).content += "\n" + line; continue; }
      t = { line: n + 1, heading: headings.filter(Boolean).join(" / "), attrs: s.slice(2), rows: [] };
      row = null;
      continue;
    }
    if (!t) continue;
    if (s.startsWith("|}")) {
      if (depth > 0) { depth--; if (row?.cells.length) row.cells.at(-1).content += "\n" + line; continue; }
      out.push(t);
      t = null;
      continue;
    }
    if (depth > 0) { if (row?.cells.length) row.cells.at(-1).content += "\n" + line; continue; }
    if (s.startsWith("|-")) { row = { attrs: s.slice(2).trim(), cells: [] }; t.rows.push(row); continue; }
    if (s.startsWith("|+")) continue;
    if (s.startsWith("!") || s.startsWith("|")) {
      if (!row) { row = { attrs: "", cells: [] }; t.rows.push(row); }
      const header = s.startsWith("!");
      const body = s.slice(1);
      const pieces = header ? splitTop(body, "||").flatMap((p) => splitTop(p, "!!")) : splitTop(body, "||");
      for (const p of pieces) row.cells.push(parseCell(p, header));
      continue;
    }
    if (row?.cells.length) row.cells.at(-1).content += "\n" + line;
  }
  return out;
}

/** Expand rowspan/colspan: rows of { attrs, cells } where a spanned cell repeats (with `spanned: true`). */
export function grid(table) {
  const out = [];
  const pending = []; // per column: { cell, left }
  for (const r of table.rows) {
    if (r.cells.length === 0) continue;
    const cells = [];
    let col = 0;
    const queue = [...r.cells];
    while (queue.length > 0 || (pending[col] && pending[col].left > 0)) {
      if (pending[col] && pending[col].left > 0) {
        cells[col] = { ...pending[col].cell, spanned: true };
        pending[col].left--;
        col++;
        continue;
      }
      const c = queue.shift();
      if (!c) break;
      for (let k = 0; k < c.colspan; k++) {
        cells[col] = c;
        if (c.rowspan > 1) pending[col] = { cell: c, left: c.rowspan - 1 };
        col++;
      }
    }
    // Fill trailing spanned columns.
    for (let k = col; k < pending.length; k++) {
      if (pending[k] && pending[k].left > 0) { cells[k] = { ...pending[k].cell, spanned: true }; pending[k].left--; }
    }
    out.push({ attrs: r.attrs, cells, headerRow: r.cells.every((c) => c.header) });
  }
  return out;
}

function templateParams(inner) {
  const parts = splitTop(inner, "|");
  const name = parts[0].trim().toLowerCase();
  const pos = [];
  const named = {};
  for (const p of parts.slice(1)) {
    const m = p.match(/^\s*([a-z0-9_-]+)\s*=([\s\S]*)$/i);
    if (m && !p.includes("[[")) named[m[1].toLowerCase()] = m[2].trim();
    else pos.push(p.trim());
  }
  return { name, pos, named };
}

/**
 * Render cell wikitext: { text, links: [{ target, text }], bold, originals: [kanji titles], persons: [{ name, link }] }.
 */
export function render(src) {
  const links = [];
  const originals = [];
  const persons = [];
  let flagJpn = false;
  const bold = /'''/.test(src);
  const walk = (s) => {
    let out = "";
    for (let i = 0; i < s.length; i++) {
      if (s.startsWith("{{", i)) {
        let d = 0;
        let j = i;
        for (; j < s.length; j++) {
          if (s.startsWith("{{", j)) { d++; j++; continue; }
          if (s.startsWith("}}", j)) { d--; j++; if (d === 0) break; }
        }
        const inner = s.slice(i + 2, j - 1);
        out += template(inner);
        i = j;
        continue;
      }
      if (s.startsWith("[[", i)) {
        let d = 0;
        let j = i;
        for (; j < s.length; j++) {
          if (s.startsWith("[[", j)) { d++; j++; continue; }
          if (s.startsWith("]]", j)) { d--; j++; if (d === 0) break; }
        }
        const inner = s.slice(i + 2, j - 1);
        const [target, ...rest] = splitTop(inner, "|");
        i = j;
        if (/^(file|image|category):/i.test(target)) continue;
        const text = rest.length ? walk(rest.join("|")) : target;
        links.push({ target: target.split("#")[0].trim() || target.trim(), fragment: target.split("#")[1], text: clean(text) });
        out += text;
        continue;
      }
      out += s[i];
    }
    return out;
  };
  const template = (inner) => {
    const { name, pos, named } = templateParams(inner);
    if (name === "sortname") {
      const first = named.first ?? pos[0] ?? "";
      const last = named.last ?? pos[1] ?? "";
      const full = `${clean(walk(first))} ${clean(walk(last))}`.trim();
      const nolink = named.nolink !== undefined || pos[3] === "nolink";
      const link = named.link ?? (pos[2] && pos[2] !== "" ? pos[2] : undefined) ?? (named.dab ? `${full} (${named.dab})` : full);
      persons.push({ name: full, link: nolink ? undefined : link });
      if (!nolink) links.push({ target: link, text: full });
      return full;
    }
    if (name === "sort" || name === "sortname2") return walk(pos[1] ?? pos[0] ?? "");
    if (name === "nihongo4" || name === "nihongo" || name === "nihongo2" || name === "nihongo3" || name === "nihongo foot") {
      if (pos[1]) originals.push(clean(walk(pos[1])));
      return walk(pos[0] ?? "");
    }
    if (name === "flagicon" || name === "flag icon") { if (/^(jpn|japan)$/i.test(pos[0] ?? "")) flagJpn = true; return ""; }
    if (["center", "nowrap", "small", "nobr", "lang", "noitalic", "smaller", "big"].includes(name)) return walk(name === "lang" ? pos[1] ?? "" : pos[0] ?? "");
    if (name === "abbr") return walk(pos[0] ?? "");
    if (name === "dagger" || name === "double-dagger" || name === "†") return "†";
    if (name === "ill" || name === "interlanguage link") { const t = pos[0] ?? ""; links.push({ target: t, text: t }); return t; }
    return "";
  };
  const text = clean(walk(src));
  return { text, links, bold, originals, persons, flagJpn };
}

export function clean(s) {
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(?:small|span|sup|sub|i|b|big|center|div|s)[^>]*>/gi, "")
    .replace(/'''|''/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}
