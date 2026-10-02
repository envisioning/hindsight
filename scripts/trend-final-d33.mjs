// Final trend verdicts under D33, per trend source.
// Usage: node scripts/trend-final-d33.mjs <source|--all>
// Reads data/raw/<source>/: trends-d33.json (mechanical rows), renames-d33-checkerA/B.json
// (two blind rename checkers), renames-adjudicated-d33.json (adjudicator on disagreements) and
// renames-audit-d33.json (agent audit of agreed checks: correct replaces, contest withholds).
// Passes 2, 3, ... (D24, append-only): for pass N, renames-d33-checkerA-pass<N>.json,
// -checkerB-pass<N>.json, renames-adjudicated-d33-pass<N>.json and renames-audit-d33-pass<N>.json,
// when present. The rows in renames-d33-pass<N>-scope.json (or, without it, every id a pass-N
// checker wrote) are resolved from pass-N files only and stay pending until both pass-N checkers
// have them. The latest pass whose scope holds a row decides it; the latest earlier resolution of
// the same id is superseded and named in `pass<M>` (M the earlier pass). Rows outside every later
// scope keep their pass-1 verdicts.
// Verdicts: persisted (shared subject in the next two editions, or a wording variant: "same"),
// renamed, faded, recycled, open (fewer than two later editions), gap (faded, but a next edition
// is a partial capture: not counted). Recycled (D47): a candidate whose final check is faded and
// whose subject is listed again after its window (`reappears_in` in trends-d33.json). Order: the
// recycled rule runs before the gap rule, so a faded row with a later reappearance is recycled even
// when its window holds a partial edition (the reappearance is evidence; D36 keeps recycled).
// Writes final-d33.json with
// shares over graded trends (not open), each with a Wilson 95% interval. Never a hit rate (D33).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SOURCES = ["accenture-tech-vision", "a16z-big-ideas", "deloitte-tech-trends", "ftsg-tech-trends", "mckinsey-tech-trends", "trendwatching"];
const arg = process.argv[2];
const sources = arg === "--all" ? SOURCES : [arg];
if (!arg || !sources.every((s) => SOURCES.includes(s))) throw new Error(`usage: trend-final-d33.mjs <${SOURCES.join("|")}|--all>`);
const root = path.resolve(import.meta.dirname, "..");

function wilson(k, n, z = 1.96) {
	if (!n) return null;
	const p = k / n;
	const d = 1 + (z * z) / n;
	const c = p + (z * z) / (2 * n);
	const r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
	return [(c - r) / d, (c + r) / d].map((x) => Math.round(x * 1000) / 1000);
}

for (const source of sources) {
	const dir = path.join(root, "data/raw", source);
	const read = (f) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), "utf8")) : null);
	const mech = read("trends-d33.json");
	const byId = (f) => new Map((read(f)?.verdicts ?? []).map((v) => [v.id, v]));
	const A = byId("renames-d33-checkerA.json");
	const B = byId("renames-d33-checkerB.json");
	const adj = byId("renames-adjudicated-d33.json");
	const audit = read("renames-audit-d33.json");
	const recs = audit?.records ?? {};
	// Passes 2..N (D24): read when present; never edits the files of an earlier pass.
	const later = [];
	for (let n = 2; ; n++) {
		const f = { A: `renames-d33-checkerA-pass${n}.json`, B: `renames-d33-checkerB-pass${n}.json`, adj: `renames-adjudicated-d33-pass${n}.json`, audit: `renames-audit-d33-pass${n}.json`, scope: `renames-d33-pass${n}-scope.json` };
		if (!Object.values(f).some((x) => existsSync(path.join(dir, x)))) break;
		const audit = read(f.audit);
		const scopeFile = read(f.scope);
		const pA = byId(f.A);
		const pB = byId(f.B);
		later.push({ n, A: pA, B: pB, adj: byId(f.adj), audit, recs: audit?.records ?? {}, scope: new Set(scopeFile ? scopeFile.rows.map((r) => r.id) : [...pA.keys(), ...pB.keys()]), files: [f.scope, f.A, f.B, f.adj, f.audit] });
	}
	// The pass that decides a row: the latest pass whose scope holds it (1 when none does).
	const passOf = (id) => later.reduce((m, p) => (p.scope.has(id) ? p.n : m), 1);
	const passes = [...["renames-d33-checkerA.json", "renames-d33-checkerB.json", "renames-adjudicated-d33.json", "renames-audit-d33.json"], ...later.filter((p) => p.scope.size).flatMap((p) => p.files)].filter((f) => existsSync(path.join(dir, f)));
	const toVerdict = (v) => (v === "same" ? "persisted" : v);
	const rows = [];
	let pending = 0;
	// A faded verdict is only supported where both next editions were captured in full. Where the
	// window includes a partial edition, faded becomes `gap`: reported, not counted in any share.
	const partial = new Set(mech.partial_editions ?? []);
	const nextOf = new Map(mech.rows.filter((r) => r.status === "candidate").map((r) => [r.id, r.next_editions ?? []]));
	const gapIfPartial = (row) => (row.verdict === "faded" && (nextOf.get(row.id) ?? []).some((e) => partial.has(typeof e === "string" ? e : e.edition)) ? { ...row, verdict: "gap", was: "faded", reason: [row.reason, "A next edition is a partial capture; not finding the trend there is not evidence it faded."].filter(Boolean).join(" ") } : row);
	// One pass's resolution of a candidate row, or null while a checker verdict is missing.
	const resolve = (r, A, B, adj, recs) => {
		const a = A.get(r.id);
		const b = B.get(r.id);
		if (!a || !b) return null;
		if (a.verdict === b.verdict) {
			const rec = recs[r.id];
			if (rec?.decision === "correct") return { id: r.id, edition: r.edition, verdict: toVerdict(rec.corrected_verdict), status: "corrected", was: toVerdict(a.verdict), match_id: rec.corrected_match_id, reason: rec.note };
			if (rec?.decision === "contest" && a.verdict === "faded" && (r.next_editions ?? []).some((e) => partial.has(e)))
				// The audit contested a faded verdict because a next edition is partial: the gap rule resolves it.
				return { id: r.id, edition: r.edition, verdict: "faded", status: "audited", reason: rec.note };
			if (rec?.decision === "contest") return { id: r.id, edition: r.edition, verdict: "contested", status: "contested", was: toVerdict(a.verdict), reason: rec.note };
			return { id: r.id, edition: r.edition, verdict: toVerdict(a.verdict), status: rec ? "audited" : "agreed", ...(a.match_id ? { match_id: a.match_id } : {}) };
		}
		const j = adj.get(r.id);
		return j ? { id: r.id, edition: r.edition, verdict: toVerdict(j.verdict), status: "adjudicated", ...(j.match_id ? { match_id: j.match_id } : {}), reason: j.reason } : { id: r.id, edition: r.edition, verdict: "contested", status: "contested" };
	};
	// D47: faded plus a later reappearance of a shared subject is recycled. Runs before gapIfPartial.
	const backIn = new Map(mech.rows.filter((r) => r.status === "candidate" && r.reappears_in).map((r) => [r.id, r.reappears_in]));
	const recycledIfBack = (row) => (row.verdict === "faded" && backIn.has(row.id) ? { ...row, verdict: "recycled", was: "faded", matched_in: backIn.get(row.id) } : row);
	const superseded = new Map(later.map((p) => [p.n, 0]));
	const passFiles = (n) => (n === 1 ? { A, B, adj, recs } : later.find((p) => p.n === n));
	for (const r of mech.rows) {
		if (r.status !== "candidate") {
			rows.push({ id: r.id, edition: r.edition, verdict: r.status, status: "computed", ...(r.matched_in ? { matched_in: r.matched_in } : {}) });
			continue;
		}
		const n = passOf(r.id);
		const f = passFiles(n);
		const row = resolve(r, f.A, f.B, f.adj, f.recs);
		// The latest earlier pass that resolved this row is superseded (D24).
		let prev = null;
		for (let m = n - 1; m >= 1 && !prev; m--) {
			if (m > 1 && !passFiles(m).scope.has(r.id)) continue;
			const g = passFiles(m);
			const p = resolve(r, g.A, g.B, g.adj, g.recs);
			if (p) prev = { m, p };
		}
		if (n > 1 && prev) superseded.set(n, superseded.get(n) + 1);
		if (!row) {
			pending++;
			continue;
		}
		rows.push(n === 1 ? row : { ...row, pass: n, ...(prev ? { [`pass${prev.m}`]: { verdict: prev.p.verdict, status: prev.p.status, ...(prev.p.match_id ? { match_id: prev.p.match_id } : {}) } } : {}) });
	}
	for (let i = 0; i < rows.length; i++) rows[i] = gapIfPartial(recycledIfBack(rows[i]));
	const counts = {};
	for (const r of rows) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
	const graded = ["persisted", "renamed", "faded", "recycled"].reduce((s, v) => s + (counts[v] ?? 0), 0);
	const share = (v) => (graded >= 20 ? { k: counts[v] ?? 0, n: graded, share: Math.round(((counts[v] ?? 0) / graded) * 10000) / 10000, wilson95: wilson(counts[v] ?? 0, graded) } : null);
	const summarize = (audit, recs) => {
	const recList = Object.values(recs);
	const auditOut = audit
		? {
				seed: audit.seed,
				sample: audit.sample.length,
				audited: recList.length,
				confirmed: recList.filter((x) => x.decision === "confirm").length,
				corrected: recList.filter((x) => x.decision === "correct").length,
				contested: recList.filter((x) => x.decision === "contest").length,
			}
		: null;
	if (auditOut) {
		auditOut.error_rate = auditOut.audited ? Math.round(((auditOut.corrected + auditOut.contested) / auditOut.audited) * 1000) / 1000 : null;
		// Contests resolved by the partial-edition gap rule are not residual errors.
		// A contested faded that the audit-contest branch kept as faded (partial window) and D47 then
		// made recycled is resolved too.
		const resolved = Object.entries(recs).filter(([id, x]) => {
			const r = x.decision === "contest" ? rows.find((y) => y.id === id) : null;
			return r && (r.verdict === "gap" || (r.verdict === "recycled" && r.was === "faded" && r.status === "audited"));
		}).length;
		auditOut.resolved_by_gap_rule = resolved;
		auditOut.residual_error_rate = auditOut.audited ? Math.round(((auditOut.corrected + auditOut.contested - resolved) / auditOut.audited) * 1000) / 1000 : null;
	}
	return auditOut;
	};
	// Pass-1 audit records whose row is re-checked in a later pass (D24), or is no longer a candidate
	// (now matched by subject id), no longer decide a verdict: the summary counts only those that do.
	// A later pass's audit counts its records except those re-checked in a pass after it.
	const live = (id) => nextOf.has(id) && passOf(id) === 1;
	const auditOut = summarize(audit, Object.fromEntries(Object.entries(recs).filter(([id]) => live(id))));
	for (const p of later) {
		const k = Object.keys(recs).filter((id) => p.scope.has(id) && passOf(id) === p.n).length;
		if (auditOut && p.scope.size && (k || p.n === 2)) auditOut[`superseded_by_pass${p.n}`] = k;
	}
	if (auditOut && Object.keys(recs).some((id) => !nextOf.has(id))) auditOut.no_longer_candidate = Object.keys(recs).filter((id) => !nextOf.has(id)).length;
	const laterOut = {};
	for (const p of later) {
		if (!p.scope.size) continue;
		const own = Object.fromEntries(Object.entries(p.recs).filter(([id]) => passOf(id) <= p.n));
		const a = summarize(p.audit, own);
		for (const q of later) {
			if (q.n <= p.n || !a) continue;
			const k = Object.keys(p.recs).filter((id) => passOf(id) === q.n).length;
			if (k) a[`superseded_by_pass${q.n}`] = k;
		}
		laterOut[`pass${p.n}`] = { scope: p.scope.size, superseded: superseded.get(p.n), audit: a };
	}
	const out = {
		rule: "D33",
		process: "Mechanical subject matching, then two blind rename checkers on the rest, adjudicator on disagreements, agent audit of agreed checks (D20, D11). Never a hit rate.",
		editions: mech.editions,
		...(mech.capture_gaps_before ? { capture_gaps_before: mech.capture_gaps_before } : {}),
		n: rows.length,
		...(pending ? { pending } : {}),
		counts,
		shares: graded >= 20 ? { persisted: share("persisted"), renamed: share("renamed"), faded: share("faded"), recycled: share("recycled") } : null,
		...(graded < 20 ? { shares_withheld: `D11: ${graded} graded trends, fewer than 20; counts only.` } : {}),
		audit: auditOut,
		...(Object.keys(laterOut).length ? { ...laterOut, passes } : {}),
		verdicts: rows.sort((x, y) => x.id.localeCompare(y.id)),
	};
	writeFileSync(path.join(dir, "final-d33.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(source, JSON.stringify({ n: out.n, pending, counts, faded: out.shares?.faded?.share, audit: auditOut?.error_rate }));
}
