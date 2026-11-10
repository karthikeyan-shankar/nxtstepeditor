// Turns an approved Studio board into a project you can render.
//   node scripts/apply-board.mjs <board.json> [project-name]
// <board.json> is the board document as Claude reads it from the Studio artifact (collection "boards").
// It creates projects/<date>-<name>/ from the board's style, writes picks.data.js (the on-screen text and picks)
// and BOARD.json (everything, including the voice lines and the notes for Claude), and prints what is left
// to do by hand: the notes the picks could not express, and the voice lines to record or generate.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , boardFile, nameArg] = process.argv;
if (!boardFile) { console.error("usage: node scripts/apply-board.mjs <board.json> [project-name]"); process.exit(1); }
const raw = JSON.parse(fs.readFileSync(boardFile, "utf8"));
const board = raw.data && raw.data.style ? raw.data : raw; // accept the document or its body
const styleId = board.style || "website";
const STYLE_DIR = path.join(ROOT, "styles", styleId);
if (!fs.existsSync(STYLE_DIR)) throw new Error("unknown style " + styleId);
const style = JSON.parse(fs.readFileSync(path.join(STYLE_DIR, "style.json"), "utf8"));

const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "ad";
const date = new Date().toISOString().slice(0, 10);
const name = `${date}-${slug(nameArg || board.name || "ad")}`;
const PROJ = path.join(ROOT, "projects", name);
if (fs.existsSync(PROJ)) throw new Error(`projects/${name} exists; pass another name`);

// copy the style (not its caches or renders)
const skip = new Set([".hyperframes", "renders", ".thumbnails", ".waveform-cache", "node_modules"]);
(function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d); else fs.copyFileSync(s, d);
  }
})(STYLE_DIR, PROJ);

// only what the style knows goes into the render
const fields = new Set(style.shots.flatMap((s) => s.fields.map((f) => f.key)));
const picks = Object.fromEntries(style.shots.flatMap((s) => s.picks.map((p) => [p.key, new Set(p.choices.map((c) => c.value))])));
const text = Object.fromEntries(Object.entries(board.text || {}).filter(([k, v]) => fields.has(k) && typeof v === "string"));
const pick = Object.fromEntries(Object.entries(board.pick || {}).filter(([k, v]) => picks[k] && picks[k].has(v)));
fs.writeFileSync(path.join(PROJ, "picks.data.js"),
  `// From the Studio board "${String(board.name || "").replace(/[\r\n"]/g, " ")}" (${board.status || "draft"}${board.approvedAt ? ", approved " + board.approvedAt : ""}).\n` +
  `window.NS_PICKS = ${JSON.stringify({ text, pick }, null, 1)};\n`);
fs.writeFileSync(path.join(PROJ, "BOARD.json"), JSON.stringify(board, null, 1));

console.log(`projects/${name}: ${Object.keys(text).length} text edits, ${Object.keys(pick).length} picks (style: ${style.name})`);
if (board.status !== "approved") console.log(`\nNOTE: this board is "${board.status}", not approved.`);
const notes = Object.entries(board.shotNotes || {}).filter(([, v]) => String(v).trim());
if (notes.length || (board.notes || "").trim()) {
  console.log("\nChanges for Claude to make in the project (the picks can't do these):");
  if ((board.notes || "").trim()) console.log(`  [whole ad] ${board.notes.trim()}`);
  for (const [shot, n] of notes) console.log(`  [${shot}] ${n}`);
}
const vo = style.shots.filter((s) => (board.vo || {})[s.id]);
if (vo.length) {
  console.log("\nVoice lines, shot by shot (record or generate, then place each at its shot's start):");
  for (const s of vo) console.log(`  [${s.id}] ${board.vo[s.id]}`);
}
console.log(`\nNext: cd projects/${name} && npx --yes hyperframes@0.9.26 check && npx --yes hyperframes@0.9.26 render -q delivery`);
