// Smoke test of the built Studio page, outside Claude (no db / sample): every style mounts and plays its real
// scenes, edits and picks reach the preview, previews and style switches work, and nothing throws.
// Writes screenshots to studio/dist/_test/ (one contact strip per style).
//   node scripts/test-studio.mjs [styleId ...]
import fs from "fs";
import path from "path";
import http from "http";
import { execFileSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "studio", "dist");
const files = JSON.parse(fs.readFileSync(path.join(DIST, "files.json"), "utf8"));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".gif": "image/gif", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html";
  const src = u === "index.html" ? path.join(DIST, "index.html") : files[u] ? path.join(ROOT, files[u]) : null;
  if (!src || !fs.existsSync(src)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "content-type": types[path.extname(src).toLowerCase()] || "application/octet-stream" }); fs.createReadStream(src).pipe(r);
}).listen(8988);

const npx = path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_npx");
const pd = fs.readdirSync(npx).map((d) => path.join(npx, d, "node_modules")).find((d) => fs.existsSync(path.join(d, "puppeteer-core")));
const puppeteer = createRequire(path.join(pd, "x.js"))("puppeteer-core");
const out = path.join(DIST, "_test"); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
let errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
page.on("requestfailed", (q) => errors.push("failed: " + q.url()));
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:8988/#storyboard", { waitUntil: "networkidle0" });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(1200);
const report = { styles: {} };

// 1. the founder's style: edit a line and a pick, see them in the preview
await page.evaluate(() => {
  const i = document.querySelector("#f-hook-l3"); i.value = "padikkiringala?"; i.dispatchEvent(new Event("input"));
  const chip = [...document.querySelectorAll(".shotcard[data-shot=hook] .chips button")].find((b) => b.textContent.startsWith("The drawn students")); chip.click();
});
await wait(700);
await page.evaluate(() => window.__studio.seek(1.2));
await wait(300);
report.edit = await page.evaluate(() => ({
  line: document.querySelector('#sc-hook [data-edit="hook.l3"]').textContent,
  crowd: document.querySelector("#sc-hook").getAttribute("data-crowd"),
}));

// 2. every style, previewed: all timelines exist, a strip of moments, no errors
const want = process.argv.slice(2);
const ids = (await page.evaluate(() => window.__studio.styles())).filter((id) => !want.length || want.includes(id));
for (const id of ids) {
  errors = [];
  await page.evaluate((id) => { window.__studio.preview(id); window.__studio.pause(); }, id);
  await wait(900);
  const info = await page.evaluate(() => ({ style: window.__studio.style(), total: window.__studio.total(), timelines: window.__studio.timelines() }));
  const shots = [];
  const n = 6;
  for (let k = 0; k < n; k++) {
    const at = (info.total * (k + 0.5)) / n;
    await page.evaluate((x) => window.__studio.seek(x), at);
    await wait(250);
    const f = path.join(out, `${id}-${k}.png`);
    await (await page.$("#screen")).screenshot({ path: f });
    shots.push(f);
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", ...shots.flatMap((f) => ["-i", f]), "-filter_complex", shots.map((_, i) => `[${i}]scale=240:-2[v${i}]`).join(";") + ";" + shots.map((_, i) => `[v${i}]`).join("") + `hstack=inputs=${shots.length}`, path.join(out, `strip-${id}.jpg`)]);
  shots.forEach((f) => fs.rmSync(f));
  report.styles[id] = { total: +info.total.toFixed(2), missingTimelines: info.timelines.filter((x) => !x[1]).map((x) => x[0]), errors: errors.slice(0, 6) };
}

// 3. use a style for the ad (switch), then back
errors = [];
const other = ids.find((x) => x !== "website");
if (other) {
  await page.evaluate((id) => { window.__studio.choose(id); }, other);
  await wait(600);
  report.switched = await page.evaluate(() => window.__studio.style());
  await page.evaluate(() => window.__studio.choose("website"));
  await wait(600);
  report.back = await page.evaluate(() => ({ style: window.__studio.style(), line: document.querySelector('#sc-hook [data-edit="hook.l3"]').textContent }));
}
await page.setViewport({ width: 400, height: 860 });
await wait(300);
await page.screenshot({ path: path.join(out, "phone-storyboard.png") });
await page.evaluate(() => document.querySelector('.tabs button[data-tab="script"]').click());
await page.setViewport({ width: 1280, height: 900 });
await wait(500);
await page.screenshot({ path: path.join(out, "script-gallery.png"), fullPage: true });
report.switchErrors = errors;
console.log(JSON.stringify(report, null, 1));
await browser.close(); srv.close();
