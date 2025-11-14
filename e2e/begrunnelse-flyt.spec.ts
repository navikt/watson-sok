import { expect, test } from "@playwright/test";
import { sjekkTilgjengelighet } from "./uu-util";

test.describe("Begrunnelse-flyt for skjermet bruker", () => {
  test("skal kreve begrunnelse og huske bekreftet tilgang", async ({
    page,
  }) => {
    const skjermetFnr = "22078733571";

    await test.step("Søke på skjermet bruker og havne på bekreft-siden", async () => {
      await page.goto("/");

      const mainContent = page.locator("#maincontent");
      const søkefelt = mainContent.getByLabel(/Fødsels- eller D-nummer/i);
      await søkefelt.fill(skjermetFnr);
      await mainContent.getByRole("button", { name: /søk/i }).click();

      await expect(page).toHaveURL(/bekreft-begrunnet-tilgang/);
      await expect(
        page.getByText(/brukeren er Nav-ansatt eller annen skjermet bruker/i),
      ).toBeVisible();
      await sjekkTilgjengelighet(page);
    });

    await test.step("Validere at begrunnelse er påkrevd", async () => {
      const bekreftKnapp = page.getByRole("button", {
        name: /tjenestlig behov/i,
      });

      await bekreftKnapp.click();
      await expect(page).toHaveURL(/bekreft-begrunnet-tilgang/);
      await expect(page.getByText(/Begrunnelse er påkrevd/i)).toBeVisible();
    });

    await test.step("Send inn begrunnelse og gå til oppslag", async () => {
      await page
        .getByLabel(/Begrunnelse/i)
        .fill("Behov for å hjelpe bruker i sak 123");
      await page.getByRole("button", { name: /tjenestlig behov/i }).click();

      await expect(page).toHaveURL(/\/oppslag/);
      await sjekkTilgjengelighet(page);
    });

    await test.step("Søke på nytt og hoppe rett til oppslag", async () => {
      await page.goto("/");

      const mainContent = page.locator("#maincontent");
      const søkefelt = mainContent.getByLabel(/Fødsels- eller D-nummer/i);
      await søkefelt.fill(skjermetFnr);
      await mainContent.getByRole("button", { name: /søk/i }).click();

      await expect(page).toHaveURL(/\/oppslag$/);
    });
  });
});
