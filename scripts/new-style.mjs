// Starts a new style from styles/_base (shared brand, picks.js, the brand close).
//   node scripts/new-style.mjs <id> "<Name>"
// Then build its shots: see styles/README.md.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , id, name] = process.argv;
if (!id || !/^[a-z][a-z0-9-]{1,30}$/.test(id)) { console.error('usage: node scripts/new-style.mjs <id: lowercase-with-dashes> "<Name>"'); process.exit(1); }
const dst = path.join(ROOT, "styles", id);
if (fs.existsSync(dst)) { console.error("styles/" + id + " exists"); process.exit(1); }
const skip = new Set([".hyperframes", "renders", ".thumbnails", ".waveform-cache", "node_modules", "check.json"]);
(function copy(s, d) {
  fs.mkdirSync(d, { recursive: true });
  for (const e of fs.readdirSync(s, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const a = path.join(s, e.name), b = path.join(d, e.name);
    if (e.isDirectory()) copy(a, b); else fs.copyFileSync(a, b);
  }
})(path.join(ROOT, "styles", "_base"), dst);
fs.rmSync(path.join(dst, "facts.json"), { force: true }); // the shared facts stay in _base
const style = JSON.parse(fs.readFileSync(path.join(dst, "style.json"), "utf8"));
style.id = id; style.name = name || id; style.by = "Claude, " + new Date().toISOString().slice(0, 10); delete style.hidden;
fs.writeFileSync(path.join(dst, "style.json"), JSON.stringify(style, null, 1) + "\n");
console.log("styles/" + id + " created from _base. Next: build its shots (styles/README.md).");
