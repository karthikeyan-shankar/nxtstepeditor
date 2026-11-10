// Builds the Studio page (studio/dist/index.html) from every style and the kit, ready to publish as a Claude artifact.
//   node scripts/build-studio.mjs
// For each style in styles/ (not _base): its own scene files (so the preview runs exactly what renders), its
// style.json (+ the shared facts), anything its root index.html loads from assets/ (a stylesheet, a helper
// script), and every asset its scenes load. Assets are published once by content (a/<hash>-<name>), large
// images at preview size; each style carries a map from its own "assets/..." paths to the published ones.
// studio/dist/files.json lists every file to publish beside the page (published path -> source path).
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const STYLES_DIR = path.join(ROOT, "styles");
const DIST = path.join(ROOT, "studio", "dist");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const json = (v) => JSON.stringify(v).replace(/<\//g, "<\\/"); // safe inside <script>
const ASSET_RE = /assets\/[\w./-]+?\.(?:png|webp|jpe?g|gif|svg|ttf|otf|woff2?|mp3|wav|m4a)/g;
const BIG = 250 * 1024; // images above this are published at preview size

for (const d of ["kit", "a"]) { fs.rmSync(path.join(DIST, d), { recursive: true, force: true }); fs.mkdirSync(path.join(DIST, d), { recursive: true }); }
const files = {};
const published = {}; // content hash -> published path

// Publish one file by content; big images are scaled down for the preview (same format, so the path keeps working).
function publish(src) {
  const buf = fs.readFileSync(src);
  const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
  if (published[hash]) return published[hash];
  const base = path.basename(src).replace(/[^\w.-]/g, "_");
  const out = "a/" + hash + "-" + base;
  const ext = path.extname(src).toLowerCase();
  if (buf.length > BIG && [".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    const dst = path.join(DIST, out);
    const q = ext === ".png" ? [] : ["-q:v", "4"];
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-vf", "scale='min(540,iw)':-2", ...q, dst]);
    files[out] = rel(dst);
  } else files[out] = rel(src);
  published[hash] = out;
  return out;
}

const attr = (tag, name) => { const m = tag.match(new RegExp("\\s" + name + '="([^"]*)"')); return m ? m[1] : null; };
const baseFacts = JSON.parse(fs.readFileSync(path.join(STYLES_DIR, "_base", "facts.json"), "utf8"));
const sharedPicks = fs.readFileSync(path.join(STYLES_DIR, "_base", "assets", "picks.js"), "utf8");
const brandCssSrc = fs.readFileSync(path.join(STYLES_DIR, "_base", "assets", "brand.css"), "utf8");

function loadStyle(id) {
  const dir = path.join(STYLES_DIR, id);
  const index = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const style = JSON.parse(fs.readFileSync(path.join(dir, "style.json"), "utf8"));
  // the shots: every scene host in the root, in order (attributes in any order, tags over several lines)
  const shots = [];
  for (const m of index.matchAll(/<div\b[^>]*data-composition-src="compositions\/[\w-]+\.html"[^>]*>/g)) {
    const tag = m[0].replace(/\s+/g, " ");
    shots.push({ id: attr(tag, "id"), src: attr(tag, "data-composition-src"), start: +attr(tag, "data-start"), duration: +attr(tag, "data-duration") });
  }
  if (!shots.length) throw new Error(id + ": no scenes in index.html");
  const scenes = {};
  for (const s of shots) {
    if (!style.shots.find((x) => x.id === s.id)) throw new Error(id + ": style.json has no shot " + s.id);
    scenes[s.id] = fs.readFileSync(path.join(dir, s.src), "utf8");
  }
  for (const x of style.shots) if (!shots.find((s) => s.id === x.id)) throw new Error(id + ": style.json shot " + x.id + " is not in index.html");
  // what the root loads from assets/ besides the shared files
  const rootCss = [], rootJs = [];
  for (const m of index.matchAll(/<link\b[^>]*href="(assets\/[^"]+\.css)"[^>]*>/g)) if (!/brand\.css$/.test(m[1])) {
    const cssDir = path.posix.dirname(m[1]);
    rootCss.push(fs.readFileSync(path.join(dir, m[1]), "utf8").replace(/url\((["']?)(?!data:|https?:)([^"')]+)\1\)/g, (all, q, u) => "url(" + q + path.posix.normalize(cssDir + "/" + u) + q + ")"));
  }
  for (const m of index.matchAll(/<script\b[^>]*src="(assets\/[^"]+\.js)"[^>]*>/g)) if (!/picks\.js$/.test(m[1])) rootJs.push(fs.readFileSync(path.join(dir, m[1]), "utf8"));
  const picks = path.join(dir, "assets", "picks.js");
  if (fs.existsSync(picks) && fs.readFileSync(picks, "utf8") !== sharedPicks) console.warn("  ! " + id + "/assets/picks.js differs from _base: the Studio uses _base's");
  // every asset referenced anywhere it can be loaded from
  const refs = new Set();
  for (const src of [...Object.values(scenes), ...rootCss, ...rootJs]) for (const a of src.matchAll(ASSET_RE)) refs.add(a[0]);
  if (style.music) refs.add(style.music);
  const map = {};
  for (const a of refs) {
    const f = path.join(dir, a);
    if (!fs.existsSync(f)) { console.warn("  ! " + id + ": missing " + a); continue; }
    map[a] = publish(f);
  }
  const posterFile = path.join(dir, "poster.jpg");
  const poster = fs.existsSync(posterFile) ? publish(posterFile) : null;
  const facts = [...baseFacts, ...(style.facts || []).filter((f) => !baseFacts.includes(f))];
  return { id, style: Object.assign({}, style, { facts }), shots: shots.map(({ src, ...s }) => s), scenes, rootCss: rootCss.join("\n"), rootJs: rootJs.join("\n;\n"), map, poster };
}

const ids = fs.readdirSync(STYLES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !/^[._]/.test(e.name) && fs.existsSync(path.join(STYLES_DIR, e.name, "style.json")))
  .map((e) => e.name);
const styles = [];
for (const id of ids) {
  try { styles.push(loadStyle(id)); }
  catch (e) { console.warn("  ! skipped " + id + ": " + e.message); }
}
// the founder's style first, then by name
styles.sort((a, b) => (a.id === "website" ? -1 : b.id === "website" ? 1 : a.style.name.localeCompare(b.style.name)));

// the shared brand stylesheet, fonts published once
const brandCss = brandCssSrc.replace(/url\("fonts\/([^"]+)"\)/g, (all, f) => 'url("' + publish(path.join(STYLES_DIR, "_base", "assets", "fonts", f)) + '")');

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

let page = fs.readFileSync(path.join(ROOT, "studio", "studio.src.html"), "utf8");
page = page
  .replace("/*BRAND_CSS*/", () => brandCss.replace(/<\/style/gi, "<\\/style"))
  .replace("<!--PICKS_JS-->", () => "<script>\n" + sharedPicks + "\n</script>")
  .replace("/*STYLES_JSON*/", () => json(styles))
  .replace("/*KIT_JSON*/", () => json(catalog));
fs.writeFileSync(path.join(DIST, "index.html"), page);
fs.writeFileSync(path.join(DIST, "files.json"), JSON.stringify(files, null, 1));
const bytes = Object.values(files).reduce((a, f) => a + fs.statSync(path.join(ROOT, f)).size, 0);
console.log(`studio/dist/index.html: ${styles.length} styles (${styles.map((s) => s.id + ":" + s.shots.length).join(", ")}), ${Object.keys(files).length} files (${(bytes / 1048576).toFixed(1)} MB), page ${(page.length / 1024).toFixed(0)} KB`);
