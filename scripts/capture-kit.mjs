// Captures the whole product into app-kit/ so the Studio and Claude know every screen, as it is today.
// Re-run it whenever the website or the app changes:   node scripts/capture-kit.mjs
//
//   app-kit/website/<page>.png        the first phone screen of each public page of nextstep4u.in (412 x 915, 3x)
//   app-kit/website/full/<page>.jpg   the whole page, for reference (1x)
//   app-kit/app/<screen>.png          each screen of the final Android app build that renders without a server (3x)
//   app-kit/elements/<name>.png       the product's key components cut out at 3x (report card, ₹9 card, hero ...)
//   app-kit/catalog.json              everything above, with titles, sources and the capture date
//
// Needs: Chrome, and puppeteer-core (found in the npx cache of hyperframes, or `npm i puppeteer-core`).
// Options (env): SITE (default https://nextstep4u.in), WEB_DIR (the website repo's frontend/),
//                APP_DIR (the app build: <android worktree>/build/app-web), PUPPETEER_DIR.
import fs from "fs";
import path from "path";
import http from "http";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = process.env.SITE || "https://nextstep4u.in";
const WEB_DIR = process.env.WEB_DIR || "C:/Projects/Nextstep4u WebApp and Android/nextstep4u/frontend";
const APP_DIR = process.env.APP_DIR || "C:/Projects/ns4u-wt/android-app/build/app-web";
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const KIT = path.join(ROOT, "app-kit");

function findPuppeteer() {
  if (process.env.PUPPETEER_DIR) return process.env.PUPPETEER_DIR;
  const local = path.join(ROOT, "node_modules");
  if (fs.existsSync(path.join(local, "puppeteer-core"))) return local;
  const npx = path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_npx");
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) {
    const nm = path.join(npx, d, "node_modules");
    if (fs.existsSync(path.join(nm, "puppeteer-core"))) return nm;
  }
  throw new Error("puppeteer-core not found: run `npm i puppeteer-core` in the studio folder");
}
const puppeteer = createRequire(path.join(findPuppeteer(), "x.js"))("puppeteer-core");

// Pages that are not part of the product a student sees (test pages).
const SKIP_PAGES = ["phone-test.html"];
// An app screen that needs a signed-in student and data shows one of these without the API; it is listed
// under "pending" instead of being kept. Run the app's dev sandbox (android worktree: scripts/app-dev.mjs)
// and set APP_URL=http://localhost:8970 to capture those screens with sample data.
const EMPTY_STATE = /No connection|could not be loaded|not shown|Loading…|Loading\.\.\.|Try again|not on the board/i;
const APP_URL = process.env.APP_URL || "";
const PHONE = { width: 412, height: 915, isMobile: true, hasTouch: true };
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The key components, by selector, on the page that shows them best.
const ELEMENTS = [
  { name: "home-hero", page: "index.html", sel: ".v1-hero, #hero, main section" },
  { name: "sample-report-card", page: "sample-report.html", sel: ".v1-report" },
  { name: "try-offer-card", page: "try.html", sel: ".ad-offer" },
];

async function prepare(page) {
  // decline the analytics banner the way a visitor would, then scroll so reveal-on-scroll content loads
  await sleep(700);
  await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /no thanks/i.test(x.textContent)); if (b) b.click(); });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await sleep(1500);
}

async function main() {
  for (const d of ["website", "website/full", "app", "elements"]) fs.mkdirSync(path.join(KIT, d), { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
  const catalog = { captured: new Date().toISOString(), site: SITE, website: [], app: [], elements: [], pending: [] };

  // ---- website: every page in frontend/, as the live site serves it ----
  const pages = fs.readdirSync(WEB_DIR).filter((f) => f.endsWith(".html")).sort();
  const seen = new Set();
  for (const f of pages) {
    const id = f.replace(/\.html$/, "");
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ ...PHONE, deviceScaleFactor: 3 });
    try {
      const res = await page.goto(`${SITE}/${f === "index.html" ? "" : f}`, { waitUntil: "networkidle2", timeout: 45000 });
      const status = res ? res.status() : 0;
      const final = page.url().replace(SITE, "") || "/";
      if (status >= 400) { console.log(`skip ${f} (${status})`); await page.close(); continue; }
      if (SKIP_PAGES.includes(f) || (final === "/" && f !== "index.html")) { console.log(`skip ${f} -> ${final}`); await page.close(); continue; }
      // a page that sends visitors elsewhere (to sign in, say) is captured once, under the page it lands on
      if (final !== "/" && !final.startsWith("/" + f) && seen.has(final.split("?")[0])) { console.log(`skip ${f} -> ${final}`); await page.close(); continue; }
      seen.add(final.split("?")[0]);
      await prepare(page);
      const title = (await page.title()).replace(/\s*[|–-]\s*Nextstep4u.*$/i, "").trim();
      await page.screenshot({ path: path.join(KIT, "website", `${id}.png`) });
      await page.setViewport({ ...PHONE, deviceScaleFactor: 1 });
      await sleep(300);
      await page.screenshot({ path: path.join(KIT, "website", "full", `${id}.jpg`), type: "jpeg", quality: 78, fullPage: true });
      catalog.website.push({ id, title, file: `website/${id}.png`, full: `website/full/${id}.jpg`, url: `${SITE}${final}` });
      console.log(`web  ${id}  "${title}"  ${final}`);
    } catch (e) { console.log(`fail ${f}: ${e.message}`); }
    await page.close();
  }

  // ---- key components, cut out ----
  for (const el of ELEMENTS) {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ ...PHONE, deviceScaleFactor: 3 });
    try {
      await page.goto(`${SITE}/${el.page === "index.html" ? "" : el.page}`, { waitUntil: "networkidle2", timeout: 45000 });
      await prepare(page);
      const h = await page.$(el.sel);
      if (h) { await h.screenshot({ path: path.join(KIT, "elements", `${el.name}.png`) }); catalog.elements.push({ id: el.name, file: `elements/${el.name}.png`, from: el.page }); console.log(`elem ${el.name}`); }
    } catch (e) { console.log(`fail element ${el.name}: ${e.message}`); }
    await page.close();
  }

  // ---- app: the final build's own screens, served locally (no server, so signed-in screens are skipped) ----
  if (fs.existsSync(APP_DIR)) {
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
    const srv = http.createServer((q, r) => {
      const p = path.join(APP_DIR, decodeURIComponent(q.url.split("?")[0]));
      fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": types[path.extname(p)] || "application/octet-stream" }); r.end(d); });
    }).listen(8977);
    const appPages = fs.readdirSync(path.join(APP_DIR, "app")).filter((f) => f.endsWith(".html")).sort();
    for (const f of appPages) {
      const id = f.replace(/\.html$/, "");
      const page = await browser.newPage();
      await page.setViewport({ ...PHONE, deviceScaleFactor: 3 });
      try {
        await page.goto(`${APP_URL || "http://localhost:8977"}/app/${f}`, { waitUntil: "networkidle2", timeout: 30000 });
        await sleep(2800); // the launch screen plays its logo reveal first
        const landed = page.url().split("/").pop().split("?")[0];
        if (landed !== f) { console.log(`skip app ${f} -> ${landed}`); await page.close(); continue; }
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (EMPTY_STATE.test(bodyText)) { console.log(`pending app ${f} (needs a signed-in student and data)`); catalog.pending.push({ screen: f, why: "needs a signed-in student and data; capture with APP_URL and the dev sandbox" }); await page.close(); continue; }
        const dots = await page.$$(".dots button[data-i]");
        if (dots.length) {
          for (let i = 0; i < dots.length; i++) {
            await page.evaluate((i) => document.querySelector(`.dots button[data-i="${i}"]`).click(), i);
            await sleep(900);
            await page.screenshot({ path: path.join(KIT, "app", `${id}-${i + 1}.png`) });
            catalog.app.push({ id: `${id}-${i + 1}`, file: `app/${id}-${i + 1}.png`, screen: f });
          }
        } else {
          await page.screenshot({ path: path.join(KIT, "app", `${id}.png`) });
          catalog.app.push({ id, file: `app/${id}.png`, screen: f });
        }
        console.log(`app  ${id}`);
      } catch (e) { console.log(`fail app ${f}: ${e.message}`); }
      await page.close();
    }
    srv.close();
  } else console.log(`no app build at ${APP_DIR}; app screens kept as they are`);

  // the Play Store screenshots of the final build (signed-in screens: home, tests ...), if present
  const play = path.join(path.dirname(APP_DIR), "..", "output", "play-store");
  if (fs.existsSync(play)) for (const f of fs.readdirSync(play).filter((f) => /^screenshot-.*\.png$/.test(f))) {
    fs.copyFileSync(path.join(play, f), path.join(KIT, "app", `play-${f.replace(/^screenshot-/, "")}`));
    catalog.app.push({ id: `play-${f.replace(/^screenshot-|\.png$/g, "")}`, file: `app/play-${f.replace(/^screenshot-/, "")}`, screen: "Play Store screenshot (final build)" });
  }

  await browser.close();
  fs.writeFileSync(path.join(KIT, "catalog.json"), JSON.stringify(catalog, null, 1));
  console.log(`\n${catalog.website.length} website pages, ${catalog.app.length} app screens, ${catalog.elements.length} elements -> app-kit/catalog.json`);
}
main().catch((e) => { console.error(e); process.exit(1); });
