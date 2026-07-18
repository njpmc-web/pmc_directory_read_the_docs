import { test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const manifest = JSON.parse(await readFile(new URL("./manifest.json", import.meta.url), "utf8"));
const outputRoot = path.resolve("docs/assets/images");
const fixtureUrl = pathToFileURL(path.resolve("capture/fixture.html")).href;

for (const item of manifest.filter((entry) => entry.publication === "manual")) {
  test(`${item.caption} (${item.viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize(item.viewport);
    await page.goto(`${fixtureUrl}?screen=${encodeURIComponent(item.screen)}`, { waitUntil: "load" });
    await page.locator("[data-docs-fixture]").waitFor();
    const png = await page.screenshot({ fullPage: true, type: "png" });
    await sharp(png).webp({ quality: 82, effort: 5 }).toFile(path.join(outputRoot, item.file));
  });
}
