import { test, expect } from "@playwright/test";

test("core route exposes accessible landmarks and navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /trustmotion agency home/i }),
  ).toBeVisible();
});
