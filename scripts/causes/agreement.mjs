// Two-coder agreement on miss causes (D63; same steps as D7, D11, D20).
// Usage: node scripts/causes/agreement.mjs <run>
// Reads <run>/candidates.json and <run>/calls/coder-<A|B>-<batch>.json.
// Writes <run>/agreement.json (kappa on primary family and on cause), <run>/contested.json (for the
// adjudicator: claims whose primary causes differ, with both calls) and <run>/audit-sample.json
// (50 agreed claims, seed d63:<run>:audit, for the auditor).
import path from "node:path";
import { CAUSE_LIST, FAMILIES, family, hash, kappa, loadCalls, readJson, runDir, writeJson } from "./lib.mjs";

const run = process.argv[2];
const dir = runDir(run);
const { candidates } = readJson(path.join(dir, "candidates.json"));
const A = loadCalls(run, "A", candidates);
const B = loadCalls(run, "B", candidates);
const both = candidates.filter((c) => A.has(c.id) && B.has(c.id));
const missing = candidates.filter((c) => !A.has(c.id) || !B.has(c.id)).map((c) => ({ id: c.id, batch: c.batch, A: A.has(c.id), B: B.has(c.id) }));

const fam = kappa(both.map((c) => [family(A.get(c.id).primary), family(B.get(c.id).primary)]), FAMILIES);
const cause = kappa(both.map((c) => [A.get(c.id).primary, B.get(c.id).primary]), CAUSE_LIST);
const byBatch = Object.fromEntries(
	[...new Set(candidates.map((c) => c.batch))].map((b) => [b, kappa(both.filter((c) => c.batch === b).map((c) => [family(A.get(c.id).primary), family(B.get(c.id).primary)]), FAMILIES)]),
);
const matrix = Object.fromEntries(CAUSE_LIST.map((a) => [a, Object.fromEntries(CAUSE_LIST.map((b) => [b, both.filter((c) => A.get(c.id).primary === a && B.get(c.id).primary === b).length]))]));
const contested = both.filter((c) => A.get(c.id).primary !== B.get(c.id).primary);
const agreed = both.filter((c) => A.get(c.id).primary === B.get(c.id).primary);
const passes = fam !== null && fam.kappa >= 0.6;

writeJson(path.join(dir, "agreement.json"), { run, rule: "D63", gate: "kappa on primary family >= 0.6", passes, family: fam, cause, by_batch: byBatch, matrix_A_rows_B_cols: matrix, agreed: agreed.length, contested: contested.length, missing });
writeJson(path.join(dir, "contested.json"), { run, claims: contested.map((c) => ({ ...c, calls: [A.get(c.id), B.get(c.id)] })) });
const sample = agreed.sort((a, b) => (hash(`d63:${run}:audit:${a.id}`) < hash(`d63:${run}:audit:${b.id}`) ? -1 : 1)).slice(0, 50);
writeJson(path.join(dir, "audit-sample.json"), { run, seed: `d63:${run}:audit`, claims: sample.map((c) => ({ ...c, call: A.get(c.id), other_call: B.get(c.id) })) });
console.log(`both ${both.length}, missing ${missing.length}; family kappa ${fam?.kappa} (obs ${fam?.observed}); cause kappa ${cause?.kappa}; contested ${contested.length}; ${passes ? "PASS" : "FAIL"}`);
console.log(byBatch);
