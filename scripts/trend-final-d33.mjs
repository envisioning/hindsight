// Final trend verdicts under D33, per trend source.
// Usage: node scripts/trend-final-d33.mjs <source|--all>
// Reads data/raw/<source>/: trends-d33.json (mechanical rows), renames-d33-checkerA/B.json
// (two blind rename checkers), renames-adjudicated-d33.json (adjudicator on disagreements) and
// renames-audit-d33.json (agent audit of agreed checks: correct replaces, contest withholds).
// Pass 2 (D24, append-only): renames-d33-checkerA-pass2.json, -checkerB-pass2.json,
// renames-adjudicated-d33-pass2.json and renames-audit-d33-pass2.json, when present. The rows in
// renames-d33-pass2-scope.json (or, without it, every id a pass-2 checker wrote) are resolved from
// pass-2 files only and stay pending until both pass-2 checkers have them; pass-1 rows of the same
// id are superseded and named in `pass1`. Rows outside the scope keep their pass-1 verdicts.
// Verdicts: persisted (shared subject in the next two editions, or a wording variant: "same"),
// renamed, faded, recycled, open (fewer than two later editions), gap (faded, but a next edition
// is a partial capture: not counted). Writes final-d33.json with
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
	// Pass 2 (D24): read when present; never edits the pass-1 files.
	const A2 = byId("renames-d33-checkerA-pass2.json");
	const B2 = byId("renames-d33-checkerB-pass2.json");
	const adj2 = byId("renames-adjudicated-d33-pass2.json");
	const audit2 = read("renames-audit-d33-pass2.json");
	const recs2 = audit2?.records ?? {};
	const scopeFile = read("renames-d33-pass2-scope.json");
	const scope = new Set(scopeFile ? scopeFile.rows.map((r) => r.id) : [...A2.keys(), ...B2.keys()]);
	const passes = [...["renames-d33-checkerA.json", "renames-d33-checkerB.json", "renames-adjudicated-d33.json", "renames-audit-d33.json"], ...(scope.size ? ["renames-d33-pass2-scope.json", "renames-d33-checkerA-pass2.json", "renames-d33-checkerB-pass2.json", "renames-adjudicated-d33-pass2.json", "renames-audit-d33-pass2.json"] : [])].filter((f) => existsSync(path.join(dir, f)));
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
	let superseded = 0;
	for (const r of mech.rows) {
		if (r.status !== "candidate") {
			rows.push({ id: r.id, edition: r.edition, verdict: r.status, status: "computed", ...(r.matched_in ? { matched_in: r.matched_in } : {}) });
			continue;
		}
		if (scope.has(r.id)) {
			const row = resolve(r, A2, B2, adj2, recs2);
			const p1 = resolve(r, A, B, adj, recs);
			if (p1) superseded++;
			if (!row) {
				pending++;
				continue;
			}
			rows.push({ ...row, pass: 2, ...(p1 ? { pass1: { verdict: p1.verdict, status: p1.status, ...(p1.match_id ? { match_id: p1.match_id } : {}) } } : {}) });
			continue;
		}
		const row = resolve(r, A, B, adj, recs);
		if (!row) {
			pending++;
			continue;
		}
		rows.push(row);
	}
	for (let i = 0; i < rows.length; i++) rows[i] = gapIfPartial(rows[i]);
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
		const resolved = Object.entries(recs).filter(([id, x]) => x.decision === "contest" && rows.find((r) => r.id === id)?.verdict === "gap").length;
		auditOut.resolved_by_gap_rule = resolved;
		auditOut.residual_error_rate = auditOut.audited ? Math.round(((auditOut.corrected + auditOut.contested - resolved) / auditOut.audited) * 1000) / 1000 : null;
	}
	return auditOut;
	};
	// Pass-1 audit records whose row is re-checked in pass 2 (D24), or is no longer a candidate
	// (now matched by subject id), no longer decide a verdict: the summary counts only those that do.
	const live = (id) => nextOf.has(id) && !scope.has(id);
	const auditOut = summarize(audit, Object.fromEntries(Object.entries(recs).filter(([id]) => live(id))));
	if (auditOut && scope.size) auditOut.superseded_by_pass2 = Object.keys(recs).filter((id) => scope.has(id)).length;
	if (auditOut && Object.keys(recs).some((id) => !nextOf.has(id))) auditOut.no_longer_candidate = Object.keys(recs).filter((id) => !nextOf.has(id)).length;
	const audit2Out = summarize(audit2, recs2);
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
		...(scope.size ? { pass2: { scope: scope.size, superseded, audit: audit2Out }, passes } : {}),
		verdicts: rows.sort((x, y) => x.id.localeCompare(y.id)),
	};
	writeFileSync(path.join(dir, "final-d33.json"), `${JSON.stringify(out, null, 1)}\n`);
	console.log(source, JSON.stringify({ n: out.n, pending, counts, faded: out.shares?.faded?.share, audit: auditOut?.error_rate }));
}
