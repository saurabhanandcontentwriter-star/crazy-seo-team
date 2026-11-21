import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
const origin = "https://crazyseoteam.in";
const port = process.env.PRERENDER_PORT || "4173";
const preview = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", port, "--strictPort"], { stdio: "ignore", shell: process.platform === "win32" });
let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Vite preview did not start");

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, locale: "en-IN" });
  page.setDefaultNavigationTimeout(25000);

  let generated = 0;
  const failed = [];
  for (const rawUrl of urls) {
    const parsed = new URL(rawUrl);
    if (parsed.origin !== origin || parsed.search || parsed.hash) continue;
    const route = parsed.pathname.replace(/\/$/, "") || "/";
    if (/^\/(admin|crm|employee|track-enquiry|classified-dashboard|post-ad|classified-profile)(\/|$)/i.test(route)) continue;

    try {
      const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? "no response"}`);
      await page.waitForFunction(() => {
        const root = document.querySelector("#root");
        return !!root && root.innerText.trim().length > 80;
      }, { timeout: 9000 }).catch(() => {});
      await page.waitForTimeout(350);

      const snapshot = await page.evaluate(() => {
        const root = document.querySelector("#root");
        const h1 = root?.querySelector("h1");
        return { html: document.documentElement.outerHTML, textLength: root?.innerText.trim().length ?? 0, h1: h1?.textContent?.trim() ?? "" };
      });
      if (!snapshot.h1 || snapshot.textLength < 80) {
        failed.push(`${route}: rendered content missing (h1=${Boolean(snapshot.h1)}, chars=${snapshot.textLength})`);
        continue;
      }

      const html = snapshot.html.replace("</head>", '<meta name="cst-prerendered" content="true">\n</head>');
      const output = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, `<!doctype html>\\n${html}`, "utf8");
      generated++;
      console.log(`PRERENDERED ${route} — ${snapshot.textLength} chars`);
    } catch (error) {
      failed.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (generated === 0) throw new Error("No pages were prerendered");
  console.log(`\nSEO prerender: ${generated}/${urls.length} sitemap URLs generated.`);
  if (failed.length) {
    console.warn(`Prerender warnings (${failed.length}):\n${failed.slice(0, 20).join("\n")}`);
  }
  if (!await readFile(path.join(dist, "index.html"), "utf8").then((html) => html.includes('name="cst-prerendered"'))) {
    throw new Error("Homepage was not prerendered");
  }
} finally {
  await browser?.close();
  preview.kill("SIGTERM");
}
