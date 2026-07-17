import { expect, test } from "@playwright/test";

const base = "http://127.0.0.1:8001";

test("Korean and English navigation preserve the page", async ({ page }) => {
  await page.goto(`${base}/member/edit/`);
  await expect(page.getByRole("heading", { level: 1, name: "정보 수정 및 인증" })).toBeVisible();
  const englishLink = page.locator(".md-select__list a").filter({ hasText: "English" });
  await expect(englishLink).toHaveAttribute("href", /\/en\/member\/edit\/$/);
  await page.getByRole("button", { name: "언어설정" }).click();
  await englishLink.click();
  await expect(page).toHaveURL(/\/en\/member\/edit\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Edits and Verification" })).toBeVisible();
  await expect(page.locator("figure img")).toHaveJSProperty("complete", true);
  expect(await page.locator("figure img").evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
});

test("search, direct URLs, previous/next, and screenshot zoom work", async ({ page }) => {
  await page.goto(`${base}/admin/requests/`);
  await expect(page.getByRole("heading", { level: 1, name: "요청 처리" })).toBeVisible();
  await expect(page.locator(".md-footer__link")).toHaveCount(2);
  await page.locator("figure img").click();
  await expect(page.locator("dialog[open]")).toBeVisible();
  await page.locator("dialog[open]").click();
  const input = page.locator(".md-search__input");
  await input.click();
  await input.fill("OTP");
  await expect(input).toHaveValue("OTP");
  const indexResponse = await page.request.get(`${base}/search/search_index.json`);
  expect(indexResponse.ok()).toBe(true);
  const searchIndex = await indexResponse.json();
  expect(searchIndex.docs.some((document) => `${document.title} ${document.text}`.includes("OTP"))).toBe(true);
});

test("mobile navigation renders", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/member/family/`);
  await expect(page.getByRole("heading", { level: 1, name: "가족 정보" })).toBeVisible();
  await expect(page.locator("label.md-header__button[for='__drawer']")).toBeVisible();
});
