// Renders post.html's slides to PNG (1080x1350 each).  node shoot.cjs
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const npx = path.join(process.env.LOCALAPPDATA, "npm-cache", "_npx");
const pd = fs.readdirSync(npx).map((d) => path.join(npx, d, "node_modules")).find((d) => fs.existsSync(path.join(d, "puppeteer-core")));
const puppeteer = require(path.join(pd, "puppeteer-core"));
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--allow-file-access-from-files"] });
  const p = await b.newPage();
  await p.setViewport({ width: 1080, height: 1400 });
  await p.goto(pathToFileURL(path.join(__dirname, "post.html")).href, { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  for (const n of [1, 2, 3]) await (await p.$("#s" + n)).screenshot({ path: path.join(__dirname, `nextstep4u-play-live-${n}.png`) });
  await b.close();
})();
