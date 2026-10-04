import { test, expect } from "@playwright/test";

test("core route exposes accessible landmarks and navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main.site-shell")).toBeVisible();
  await expect(page.locator("header.site-header")).toBeVisible();
  await expect(page.locator("footer.site-footer")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /trustmotion agency home/i }),
  ).toBeVisible();
});
