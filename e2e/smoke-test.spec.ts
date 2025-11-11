import { expect, test } from "@playwright/test";
import { sjekkTilgjengelighet } from "./uu-util";

test.describe("Smoke test", () => {
  test("burde laste forsiden", async ({ page }) => {
    // Naviger til forsiden
    await page.goto("/");

    // Verifiser at siden laster
    await expect(page).toHaveTitle(/Oppslag bruker/);

    await sjekkTilgjengelighet(page);

    // Verifiser at man viser en forside
    await expect(page.locator("h1")).toBeVisible();
  });
});
