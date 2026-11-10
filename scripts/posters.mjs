// Makes styles/<id>/poster.jpg (the Studio gallery's still) from each style's own render, at style.json "poster" seconds.
//   node scripts/posters.mjs [styleId ...]
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const want = process.argv.slice(2);
const ids = fs.readdirSync(path.join(ROOT, "styles"), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !/^[._]/.test(e.name) && fs.existsSync(path.join(ROOT, "styles", e.name, "style.json")))
  .map((e) => e.name).filter((id) => !want.length || want.includes(id));
for (const id of ids) {
  const dir = path.join(ROOT, "styles", id);
  const style = JSON.parse(fs.readFileSync(path.join(dir, "style.json"), "utf8"));
  const at = String(style.poster ?? 1);
  let outText = "";
  try {
    outText = execFileSync("npx", ["--yes", "hyperframes@0.9.26", "snapshot", "--at", at], { cwd: dir, encoding: "utf8", shell: true, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { outText = String(e.stdout || "") + String(e.stderr || ""); }
  const png = (outText.match(/\S+frame-\d+-at-[\d.]+s\.png/) || [])[0];
  if (!png || !fs.existsSync(png)) { console.warn("  ! " + id + ": no snapshot"); continue; }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=360:-2", "-q:v", "4", path.join(dir, "poster.jpg")]);
  fs.rmSync(path.join(dir, ".hyperframes"), { recursive: true, force: true });
  console.log(id + ": poster at " + at + " s");
}
