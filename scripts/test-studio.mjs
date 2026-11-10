// Smoke test of the built Studio page, outside Claude (no db / sample): the player plays the real scenes,
// edits and picks reach the preview, and nothing throws. Writes screenshots to studio/dist/_test/.
//   node scripts/test-studio.mjs
import fs from "fs";
import path from "path";
import http from "http";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "studio", "dist");
const files = JSON.parse(fs.readFileSync(path.join(DIST, "files.json"), "utf8"));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".mp3": "audio/mpeg" };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0]).replace(/^\//, "") || "index.html";
  const src = u === "index.html" ? path.join(DIST, "index.html") : files[u] ? path.join(ROOT, files[u]) : null;
  if (!src || !fs.existsSync(src)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "content-type": types[path.extname(src)] || "application/octet-stream" }); fs.createReadStream(src).pipe(r);
}).listen(8988);

const npx = path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_npx");
const pd = fs.readdirSync(npx).map((d) => path.join(npx, d, "node_modules")).find((d) => fs.existsSync(path.join(d, "puppeteer-core")));
const puppeteer = createRequire(path.join(pd, "x.js"))("puppeteer-core");
const out = path.join(DIST, "_test"); fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
page.on("requestfailed", (q) => errors.push("failed: " + q.url()));
await page.setViewport({ width: 1280, height: 900 });
await page.goto("http://localhost:8988/#storyboard", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
const seekTo = async (t) => { await page.evaluate((t) => { const s = document.querySelector("#scrub"); s.value = String(Math.round(t / 28.6 * 1000)); s.dispatchEvent(new Event("input")); }, t); await new Promise((r) => setTimeout(r, 400)); };
await seekTo(1.2); await page.screenshot({ path: path.join(out, "1-hook.png") });
await seekTo(16.4); await page.screenshot({ path: path.join(out, "2-report.png") });
// edit the hook's question and pick the drawn students; the preview should change
await page.evaluate(() => {
  const i = document.querySelector("#f-hook-l3"); i.value = "padikkiringala?"; i.dispatchEvent(new Event("input"));
  const chip = [...document.querySelectorAll(".shotcard[data-shot=hook] .chips button")].find((b) => b.textContent.startsWith("The drawn students")); chip.click();
});
await new Promise((r) => setTimeout(r, 600));
await seekTo(1.2);
const hook = await page.evaluate(() => ({
  line: document.querySelector('#sc-hook [data-edit="hook.l3"]').textContent,
  crowd: document.querySelector("#sc-hook").getAttribute("data-crowd"),
  plan: document.querySelector("#plan-lines button").textContent,
  facesShown: getComputedStyle(document.querySelector("#sc-hook #hook-faces")).display,
}));
await page.screenshot({ path: path.join(out, "3-edited.png") });
await page.evaluate(() => { document.querySelector("#play-btn").click(); });
await new Promise((r) => setTimeout(r, 1500));
const played = await page.evaluate(() => document.querySelector("#time").textContent);
await page.setViewport({ width: 400, height: 860 });
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: path.join(out, "4-phone.png") });
await page.evaluate(() => document.querySelector('.tabs button[data-tab="kit"]').click());
await new Promise((r) => setTimeout(r, 800));
await page.setViewport({ width: 1280, height: 900 });
await page.screenshot({ path: path.join(out, "5-kit.png") });
await page.evaluate(() => document.querySelector('.tabs button[data-tab="script"]').click());
await page.screenshot({ path: path.join(out, "6-script.png") });
console.log(JSON.stringify({ hook, played, errors }, null, 1));
await browser.close(); srv.close();
