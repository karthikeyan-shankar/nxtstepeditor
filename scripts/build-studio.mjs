// Builds the Studio page (studio/dist/index.html) from a style and the kit, ready to publish as a Claude artifact.
//   node scripts/build-studio.mjs [style=website]
// It packs the style's own scene files (so the preview runs exactly what renders), its style.json, picks.js,
// the kit catalog with small thumbnails, and the few assets the scenes load. studio/dist/files.json lists
// every file to publish beside the page (published path -> source path).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STYLE_ID = process.argv[2] || "website";
const STYLE_DIR = path.join(ROOT, "styles", STYLE_ID);
const DIST = path.join(ROOT, "studio", "dist");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const json = (v) => JSON.stringify(v).replace(/<\//g, "<\\/"); // safe inside <script>

fs.rmSync(path.join(DIST, "kit"), { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "kit"), { recursive: true });
const files = {};

// the shots, from the style's root timeline
const index = fs.readFileSync(path.join(STYLE_DIR, "index.html"), "utf8");
const shots = [];
for (const m of index.matchAll(/<div id="(\w+)" data-composition-id="\1" data-composition-src="compositions\/(\w+)\.html" data-start="([\d.]+)" data-duration="([\d.]+)"/g)) {
  shots.push({ id: m[1], start: +m[3], duration: +m[4] });
}
if (!shots.length) throw new Error("no scenes found in " + rel(path.join(STYLE_DIR, "index.html")));
const scenes = Object.fromEntries(shots.map((s) => [s.id, fs.readFileSync(path.join(STYLE_DIR, "compositions", s.id + ".html"), "utf8")]));
const style = JSON.parse(fs.readFileSync(path.join(STYLE_DIR, "style.json"), "utf8"));
for (const s of shots) if (!style.shots.find((x) => x.id === s.id)) throw new Error("style.json has no shot " + s.id);

// every asset the scenes load, published at the same path
const assetRefs = new Set();
for (const src of Object.values(scenes)) for (const m of src.matchAll(/assets\/[\w./-]+\.(?:png|webp|jpg|svg|ttf|woff2|mp3)/g)) assetRefs.add(m[0]);
assetRefs.add("assets/music/jersey_bgm.mp3"); // the preview's music toggle
for (const a of assetRefs) {
  const src = path.join(STYLE_DIR, a);
  if (!fs.existsSync(src)) throw new Error("missing asset " + a);
  files[a] = rel(src);
}

// the kit, as small thumbnails
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "app-kit", "catalog.json"), "utf8"));
for (const kind of ["website", "app", "elements"]) {
  catalog[kind] = (catalog[kind] || []).filter((it) => fs.existsSync(path.join(ROOT, "app-kit", it.file)));
  for (const it of catalog[kind]) {
    const out = "kit/" + it.file.replace(/\//g, "--").replace(/\.png$/, ".jpg");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(ROOT, "app-kit", it.file), "-vf", "scale=360:-1", "-q:v", "5", path.join(DIST, out)]);
    files[out] = rel(path.join(DIST, out));
  }
}

const picksJs = fs.readFileSync(path.join(STYLE_DIR, "assets", "picks.js"), "utf8");
let page = fs.readFileSync(path.join(ROOT, "studio", "studio.src.html"), "utf8");
page = page
  .replace("<!--PICKS_JS-->", "<script>\n" + picksJs + "\n</script>")
  .replace("/*STYLE_JSON*/", json(style))
  .replace("/*SHOTS_JSON*/", json(shots))
  .replace("/*SCENES_JSON*/", json(scenes))
  .replace("/*KIT_JSON*/", json(catalog));
fs.writeFileSync(path.join(DIST, "index.html"), page);
fs.writeFileSync(path.join(DIST, "files.json"), JSON.stringify(files, null, 1));
const bytes = Object.values(files).reduce((a, f) => a + fs.statSync(path.join(ROOT, f)).size, 0);
console.log(`studio/dist/index.html: ${shots.length} shots, ${Object.keys(files).length} files (${(bytes / 1048576).toFixed(1)} MB), page ${(page.length / 1024).toFixed(0)} KB`);
