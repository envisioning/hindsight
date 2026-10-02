// Writes data/raw/manifest.json: the sources, edition files and other files
// that are tracked in git, which is what GitHub serves to the
// envisioning.com Hindsight pages. Untracked work in progress is left out.
// Stage new data first (`git add data/raw/<source>`), then run `pnpm manifest`.
// `links` lists the tracked top-level files of data/links (D48, #59): www reads
// by-technology.json and by-subject.json from GitHub raw at data/links/<file>.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const repo = new URL("..", import.meta.url).pathname;
const EDITION = /^\d{4}(-\d{2})?\.json$/;
const tracked = execFileSync("git", ["ls-files", "data/raw"], { cwd: repo, encoding: "utf8" })
	.split("\n")
	.filter(Boolean);
const sources = {};
for (const file of tracked) {
	const parts = file.split("/");
	if (parts.length !== 4) continue; // data/raw/<source>/<file>
	const [, , name, f] = parts;
	sources[name] ??= { editions: [], files: [] };
	if (EDITION.test(f)) sources[name].editions.push(f.replace(/\.json$/, ""));
	else sources[name].files.push(f);
}
const sorted = Object.fromEntries(
	Object.keys(sources)
		.sort()
		.map((k) => [k, { editions: sources[k].editions.sort(), files: sources[k].files.sort() }]),
);
const links = execFileSync("git", ["ls-files", "data/links"], { cwd: repo, encoding: "utf8" })
	.split("\n")
	.filter((f) => f.split("/").length === 3 && f.endsWith(".json"))
	.map((f) => f.split("/")[2])
	.sort();
writeFileSync(join(repo, "data/raw/manifest.json"), `${JSON.stringify({ sources: sorted, links }, null, 1)}\n`);
console.log(`manifest: ${Object.keys(sorted).length} tracked sources, ${links.length} link files`);
