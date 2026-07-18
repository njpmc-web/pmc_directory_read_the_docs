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
  const firstFigure = page.locator("figure img").first();
  await expect(firstFigure).toHaveJSProperty("complete", true);
  expect(await firstFigure.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
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
  const mobileSequence = page.locator(".shot-sequence.is-enhanced");
  await expect(mobileSequence).toBeVisible();
  await expect(mobileSequence.locator("figure.device-shot")).toHaveCount(2);
  await expect(mobileSequence.locator("figure.device-shot.is-active")).toHaveCount(1);
  expect(await mobileSequence.locator("figure.device-shot.is-active img").evaluate((image) => image.getBoundingClientRect().width)).toBeLessThanOrEqual(340);
});

test("quick start leads with an animated member walkthrough", async ({ page }) => {
  await page.goto(`${base}/quick-start/`);
  expect(await page.locator(".md-header").evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(51, 65, 85)");
  const sequence = page.locator(".shot-sequence--primary.is-enhanced");
  await expect(sequence).toBeVisible();
  await expect(sequence.locator("figure.device-shot")).toHaveCount(5);
  await expect(sequence.locator("figure.device-shot.is-active")).toHaveCount(1);
  await expect(sequence.locator(".shot-sequence__status")).toHaveText("1 / 5");
  await sequence.getByRole("button", { name: "다음 화면" }).click();
  await expect(sequence.locator(".shot-sequence__status")).toHaveText("2 / 5");
  await expect(page.getByRole("heading", { level: 2, name: "회원 5단계" })).toBeVisible();

  await page.goto(`${base}/en/quick-start/`);
  await expect(page.locator(".shot-sequence--primary.is-enhanced")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Five steps for members" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
});

test("admin confirmation pages and framed device figures are published in both languages", async ({ page }) => {
  await page.goto(`${base}/member/admin-confirmation/`);
  await expect(page.getByRole("heading", { level: 1, name: "관리자 확인요청" })).toBeVisible();
  const recoverySequence = page.locator(".shot-sequence.is-enhanced");
  await expect(recoverySequence).toBeVisible();
  await expect(page.locator("figure.device-shot img")).toHaveCount(6);
  await expect(recoverySequence.locator("figure.device-shot.is-active")).toHaveCount(1);
  await expect(recoverySequence.locator(".shot-sequence__dot")).toHaveCount(6);
  await expect(recoverySequence.locator(".shot-sequence__status")).toHaveText("1 / 6");
  await recoverySequence.getByRole("button", { name: "다음 화면" }).click();
  await expect(recoverySequence.locator(".shot-sequence__status")).toHaveText("2 / 6");
  await recoverySequence.getByRole("button", { name: "일시정지" }).click();
  await expect(recoverySequence.getByRole("button", { name: "재생" })).toBeVisible();
  await expect(page.locator("figure.device-shot img[alt='']")).toHaveCount(0);
  for (const image of await page.locator("figure.device-shot img").all()) {
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((element) => element.naturalWidth)).toBe(454);
    const style = await image.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { border: computed.borderTopWidth, shadow: computed.boxShadow, width: element.getBoundingClientRect().width };
    });
    expect(style.border).toBe("0px");
    expect(style.shadow).toBe("none");
    expect(style.width).toBeLessThanOrEqual(340);
  }

  await page.goto(`${base}/en/member/admin-confirmation/`);
  await expect(page.getByRole("heading", { level: 1, name: "Admin Confirmation Request" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Member Sign-in" })).toHaveAttribute("href", "../login/");
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
});
