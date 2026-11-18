// Shared helpers for D63 miss-cause coding.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MISS_CAUSE_FAMILY, MissCauseFile } from "../../src/schema.ts";

export const REPO = path.resolve(import.meta.dirname, "../..");
export const CAUSES = path.join(REPO, "data/measures/miss-causes");
export const CAUSE_LIST = Object.keys(MISS_CAUSE_FAMILY);
export const FAMILIES = ["technical", "non_technical", "forecast_error", "unknown"];
export const family = (c) => MISS_CAUSE_FAMILY[c];
export const readJson = (f) => JSON.parse(readFileSync(f, "utf8"));
export const writeJson = (f, v) => writeFileSync(f, `${JSON.stringify(v, null, "\t")}\n`);
export const runDir = (run) => {
	if (!run || !/^[a-z0-9-]+$/.test(run)) throw new Error("bad run");
	return path.join(CAUSES, "runs", run);
};
export const hash = (s) => createHash("sha256").update(s).digest("hex");

/** Load every MissCauseFile for one role from <run>/calls, checked against the candidates. */
export function loadCalls(run, role, candidates) {
	const dir = path.join(runDir(run), "calls");
	const byId = new Map(candidates.map((c) => [c.id, c]));
	const calls = new Map();
	if (!existsSync(dir)) return calls;
	const re = role === "A" || role === "B" ? new RegExp(`^coder-${role}-b\\d+\\.json$`) : new RegExp(`^${role}(-[a-z0-9]+)?\\.json$`);
	for (const f of readdirSync(dir).filter((f) => re.test(f)).sort()) {
		const file = MissCauseFile.parse(readJson(path.join(dir, f)));
		if (file.role !== role || file.run !== run) throw new Error(`${f}: role ${file.role}, run ${file.run}`);
		for (const c of file.calls) {
			const cand = byId.get(c.claim_id);
			if (!cand) throw new Error(`${f}: unknown claim ${c.claim_id}`);
			if ((role === "A" || role === "B") && cand.batch !== file.batch) throw new Error(`${f}: ${c.claim_id} is in ${cand.batch}`);
			if (calls.has(c.claim_id)) throw new Error(`${f}: ${c.claim_id} twice`);
			calls.set(c.claim_id, c);
		}
	}
	return calls;
}

export function kappa(pairs, cats) {
	const n = pairs.length;
	if (!n) return null;
	const po = pairs.filter(([a, b]) => a === b).length / n;
	const pe = cats.reduce((s, k) => s + (pairs.filter(([a]) => a === k).length / n) * (pairs.filter(([, b]) => b === k).length / n), 0);
	return { n, observed: round(po), expected: round(pe), kappa: pe === 1 ? 1 : round((po - pe) / (1 - pe)) };
}

export function wilson(k, m, z = 1.96) {
	if (!m) return null;
	const p = k / m;
	const d = 1 + (z * z) / m;
	const c = (p + (z * z) / (2 * m)) / d;
	const h = (z * Math.sqrt((p * (1 - p)) / m + (z * z) / (4 * m * m))) / d;
	return { k, n: m, share: round(p), low: round(c - h), high: round(c + h) };
}
export const round = (x) => Math.round(x * 1000) / 1000;
