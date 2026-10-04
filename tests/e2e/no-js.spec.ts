import { test, expect } from "@playwright/test";

test("core landing content remains available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /make the next move matter/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /tell us what you are building/i }),
  ).toBeVisible();
  await context.close();
});
