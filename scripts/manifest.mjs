// Writes data/raw/manifest.json: the list of sources, edition files and other
// files. The envisioning.com Hindsight pages read it to find files on GitHub.
// Run after any change under data/raw: `pnpm manifest`.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../data/raw/", import.meta.url).pathname;
const EDITION = /^\d{4}(-\d{2})?\.json$/;
const sources = {};
for (const name of readdirSync(root).sort()) {
	if (!statSync(join(root, name)).isDirectory()) continue;
	const files = readdirSync(join(root, name)).sort();
	sources[name] = {
		editions: files.filter((f) => EDITION.test(f)).map((f) => f.replace(/\.json$/, "")),
		files: files.filter((f) => !EDITION.test(f)),
	};
}
writeFileSync(join(root, "manifest.json"), `${JSON.stringify({ sources }, null, 1)}\n`);
console.log(`manifest: ${Object.keys(sources).length} sources`);
