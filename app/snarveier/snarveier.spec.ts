import { expect, type Page, test } from "@playwright/test";
import { sjekkTilgjengelighet } from "../test/uu-util";

const testFnr = "98765432101";

/** Navigerer til oppslagssiden med testbruker og venter på at alle paneler er lastet. */
async function gåTilOppslag(page: Page) {
  await page.goto("/");
  const mainContent = page.locator("#maincontent");
  const søkefelt = mainContent.getByLabel(/Fødsels- eller D-nummer/i);
  await søkefelt.fill(testFnr);
  await mainContent.getByRole("button", { name: /søk/i }).click();
  await expect(page).toHaveURL(/\/oppslag/);

  // Vent på at alle paneler er ferdig lastet
  const panelOverskrifter = [
    /Brukerinformasjon/,
    /Ytelser fra Nav/,
    /Inntekt og ytelsesutbetalinger over tid/,
    /Arbeidsforhold/,
    /^Inntekt$/,
    /Inntekts\S*oppsummering/,
  ];
  for (const navn of panelOverskrifter) {
    await expect(page.getByRole("heading", { name: navn })).toBeVisible({
      timeout: 15000,
    });
  }
}

test.describe("Tastatursnarveier", () => {
  test.beforeEach(async ({ page }) => {
    await gåTilOppslag(page);
    // Reset fokus til body for å unngå flaky tester
    await page.locator("body").focus();
    await expect(page.locator("body")).toBeFocused();
  });

  test("Alt+1–6 navigerer til riktig panel", async ({ page }) => {
    const paneler = [
      { tast: "Alt+1", id: "panel-brukerinformasjon" },
      { tast: "Alt+2", id: "panel-ytelser" },
      { tast: "Alt+3", id: "panel-inntekt-og-ytelse-overlapp" },
      { tast: "Alt+4", id: "panel-arbeidsforhold" },
      { tast: "Alt+5", id: "panel-inntekt" },
      { tast: "Alt+6", id: "panel-inntektsoppsummering" },
    ];

    for (const { tast, id } of paneler) {
      await test.step(`${tast} fokuserer panel ${id}`, async () => {
        await page.keyboard.press(tast);
        const panel = page.locator(`#${id}`);
        await expect(panel).toBeFocused();
      });
    }

    await sjekkTilgjengelighet(page);
  });

  test("Alt+K fokuserer søkefeltet i header", async ({ page }) => {
    await test.step("Trykk Alt+K", async () => {
      await page.keyboard.press("Alt+k");
      const søkefelt = page.getByLabel(
        /Fødselsnummer eller D-nummer på bruker/i,
      );
      await expect(søkefelt).toBeFocused();
    });

    await sjekkTilgjengelighet(page);
  });

  test("Alt+T fokuserer tidsvindu-velger", async ({ page }) => {
    await test.step("Trykk Alt+T", async () => {
      await page.keyboard.press("Alt+t");
      const tidsvindu = page.locator("#tidsvindu-velger");
      await expect(tidsvindu).toBeFocused();
    });

    await sjekkTilgjengelighet(page);
  });

  test("Alt+F åpner familiemedlemmer-modal", async ({ page }) => {
    await test.step("Trykk Alt+F", async () => {
      await page.keyboard.press("Alt+f");
      await expect(
        page.getByRole("dialog", { name: /Familiemedlemmer/i }),
      ).toBeVisible();
    });

    await page.waitForTimeout(1000); // Gi tid til animasjon før tilgjengelighetssjekk

    await sjekkTilgjengelighet(page);
  });

  test("Alt+←/→ navigerer tidslinje-perioder", async ({ page }) => {
    await test.step("Trykk Alt+→ for neste periode", async () => {
      const nesteKnapp = page.getByRole("button", {
        name: /Neste periode/i,
      });
      const erAktiv = await nesteKnapp.isEnabled();
      if (erAktiv) {
        await page.keyboard.press("Alt+ArrowRight");
        // Venter litt for at tidslinjen oppdateres
        await page.waitForTimeout(300);
      }
    });

    await test.step("Trykk Alt+← for forrige periode", async () => {
      const forrigeKnapp = page.getByRole("button", {
        name: /Forrige periode/i,
      });
      const erAktiv = await forrigeKnapp.isEnabled();
      if (erAktiv) {
        await page.keyboard.press("Alt+ArrowLeft");
        await page.waitForTimeout(300);
      }
    });

    await sjekkTilgjengelighet(page);
  });

  test("? åpner snarveier-hjelp-modal", async ({ page }) => {
    await test.step("Trykk ? (Shift++)", async () => {
      // Klikk på body for å sikre at fokus ikke er i et input-felt
      await page.locator("body").click();
      await page.keyboard.press("?");
      await expect(
        page.getByRole("dialog", { name: /Tastatursnarveier/i }),
      ).toBeVisible();
    });

    await test.step("Modal inneholder snarvei-kategorier", async () => {
      await expect(
        page.getByRole("heading", { name: "Paneler" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Handlinger" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Navigering" }),
      ).toBeVisible();
    });

    await sjekkTilgjengelighet(page);
  });

  test("←/→ navigerer mellom perioder i tidslinjen", async ({ page }) => {
    await test.step("Fokuser første periode og naviger med piltaster", async () => {
      // Fokuser Ytelser-panelet først
      await page.keyboard.press("Alt+2");
      await expect(page.locator("#panel-ytelser")).toBeFocused();

      // Trykk ↓ for å hoppe til første periode
      await page.keyboard.press("ArrowDown");

      const førstePeriode = page
        .locator("button.aksel-timeline__period--clickable")
        .first();
      await expect(førstePeriode).toBeFocused();

      // Finn alle perioder i samme rad for å sjekke navigering
      const rad = førstePeriode.locator("xpath=ancestor::ol[1]");
      const perioderIRad = rad.locator(
        "button.aksel-timeline__period--clickable",
      );
      const antallPerioder = await perioderIRad.count();

      if (antallPerioder > 1) {
        // Naviger til neste periode med →
        await page.keyboard.press("ArrowRight");
        await expect(perioderIRad.nth(1)).toBeFocused();

        // Naviger tilbake med ←
        await page.keyboard.press("ArrowLeft");
        await expect(perioderIRad.nth(0)).toBeFocused();
      }
    });

    await sjekkTilgjengelighet(page);
  });

  test("↓ fra Ytelser-panelet fokuserer første periode", async ({ page }) => {
    await test.step("Fokuser panel og trykk ↓", async () => {
      await page.keyboard.press("Alt+2");
      await expect(page.locator("#panel-ytelser")).toBeFocused();

      await page.keyboard.press("ArrowDown");

      const førstePeriode = page
        .locator("button.aksel-timeline__period--clickable")
        .first();
      await expect(førstePeriode).toBeFocused();
    });

    await sjekkTilgjengelighet(page);
  });
});
