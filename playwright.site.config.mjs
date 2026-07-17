import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "capture",
  testMatch: "site.spec.mjs",
  timeout: 30_000,
  webServer: {
    command: "python3 -m http.server 8001 --directory site",
    url: "http://127.0.0.1:8001/",
    reuseExistingServer: false,
  },
  use: { browserName: "chromium", channel: "chrome", headless: true },
});
