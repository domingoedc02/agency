import { test, expect } from "@playwright/test";

test("core route exposes accessible landmarks and navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBe(true);
  await expect(page.locator("body")).toContainText("Make the next move");
  await expect(page.locator("main.site-shell")).toHaveCount(1);
  await expect(page.locator("header.site-header")).toHaveCount(1);
  await expect(page.locator("footer.site-footer")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: /trustmotion agency home/i }),
  ).toBeVisible();
  await context.close();
});
