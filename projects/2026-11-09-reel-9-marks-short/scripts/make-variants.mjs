// Writes index-no-deadline.html from index.html, so the two versions of the ad never drift apart.
// The only differences: the end card's {"deadline":true} becomes false, and every line marked
// data-variant="deadline" (the flip and stopwatch sounds) is dropped.
// It is temporary: scripts/render-both.sh writes it, renders it and deletes it (one root per project).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");

const on = `data-variable-values='{"deadline":true}'`;
if (src.split(on).length !== 2) throw new Error(`expected exactly one ${on} in index.html`);

const lines = src.split("\n");
const kept = lines.filter((l) => !l.includes('data-variant="deadline"'));
const dropped = lines.length - kept.length;
if (dropped === 0) throw new Error('no data-variant="deadline" lines found in index.html');

const out = kept
  .join("\n")
  .replace(on, `data-variable-values='{"deadline":false}'`)
  .replace("<head>", "<head>\n    <!-- GENERATED from index.html by scripts/make-variants.mjs. Do not edit; edit index.html and re-run it. -->");

fs.writeFileSync(path.join(root, "index-no-deadline.html"), out);
console.log(`index-no-deadline.html written (${dropped} deadline-only lines dropped)`);
