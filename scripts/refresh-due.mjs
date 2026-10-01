// Yearly refresh (#58): which sources have a new edition due.
// Usage: node scripts/refresh-due.mjs [--open] [--today YYYY-MM-DD]
// Reads data/normalized/source_editions.json. A source's cadence is the median gap, in months,
// between its last five editions (12 when it has one edition). A new edition is due when the
// latest edition is older than cadence + 1 month. Prints one line per due source; with --open,
// opens one GitHub issue per due source (label `refresh`), unless an open issue with the same
// title exists. Needs `gh` with write access (GITHUB_TOKEN in the scheduled workflow).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const today = new Date(args.includes("--today") ? args[args.indexOf("--today") + 1] : Date.now());
const editions = JSON.parse(readFileSync(path.join(root, "data/normalized/source_editions.json"), "utf8"));

const months = (iso) => {
	const [y, m] = iso.split("-").map(Number);
	return y * 12 + ((m || 7) - 1); // year-only dates count as mid-year
};
const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
const bySource = new Map();
for (const e of editions) bySource.set(e.source_id, [...(bySource.get(e.source_id) ?? []), months(e.published)]);

// Series that publish no more editions (the reason is in each source's INDEX.md).
const ENDED = {
	"envisioning-technology": "posters ended with the 2012 edition",
	"envisioning-education": "one poster (2012); no later edition",
	"envisioning-health": "one poster (2012); no later edition",
	"envisioning-horizons": "one poster (2014); no later edition",
	"nic-global-trends": "the DNI ended the Global Trends program in September 2025",
	"ftsg-tech-trends": "FTSG retired the Tech Trends format in 2026 (Convergence Outlook instead)",
};
const due = [];
for (const [source, list] of [...bySource].sort()) {
	if (ENDED[source]) continue;
	const ms = [...new Set(list)].sort((a, b) => a - b);
	const gaps = ms.slice(-6).slice(1).map((m, i) => m - ms.slice(-6)[i]);
	const cadence = gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 12;
	const last = ms.at(-1);
	const age = now - last;
	if (age > cadence + 1) {
		const lastIso = `${Math.floor(last / 12)}-${String((last % 12) + 1).padStart(2, "0")}`;
		due.push({ source, cadence, last: lastIso, age });
	}
}

for (const d of due) console.log(`${d.source}: last edition ${d.last}, cadence ${d.cadence} months, ${d.age} months old: new edition due`);
if (!due.length) console.log("no source is due");

if (args.includes("--open")) {
	const repo = "envisioning/hindsight";
	const open = JSON.parse(execFileSync("gh", ["issue", "list", "-R", repo, "--state", "open", "--label", "refresh", "--json", "title", "--limit", "200"], { encoding: "utf8" })).map((i) => i.title);
	for (const d of due) {
		const title = `Refresh: ${d.source} (edition after ${d.last})`;
		if (open.includes(title)) continue;
		const body = [
			`The latest captured edition of \`${d.source}\` is ${d.last}; the source publishes about every ${d.cadence} months, so a new edition is due (#58).`,
			"",
			"Runbook (AGENTS.md, Yearly refresh):",
			`1. Capture the new edition into \`data/raw/${d.source}/\` (append; never reorder an existing edition file).`,
			"2. `pnpm normalize`, then grade claims whose target year has passed as a new wave (D26) or, for numeric sources, re-capture `realized.json` and run `pnpm grade:numeric`.",
			"3. `git add`, `pnpm manifest`, `pnpm typecheck`, `pnpm build`, commit, push, close this issue with the result.",
		].join("\n");
		execFileSync("gh", ["issue", "create", "-R", repo, "--title", title, "--label", "refresh", "--body", body], { stdio: "inherit" });
	}
}
