import { expect, test } from "@playwright/test";
import { sjekkTilgjengelighet } from "./uu-util";

test.describe("Oppslag-flyt", () => {
  test("skal fullføre oppslag på testbruker og vise alle paneler", async ({
    page,
  }) => {
    // Test med gyldig 11-sifret fødselsnummer (mock)
    const testFnr = "98765432101";

    // Steg 1: Gå til landingssiden
    await test.step("Navigere til landingsside", async () => {
      await page.goto("/");

      // Sjekk at siden lastes
      await expect(page).toHaveTitle(/Watson Søk/);

      // Sjekk at overskrift vises
      await expect(
        page.getByRole("heading", { name: /Brukeroppslag/i }),
      ).toBeVisible();

      // Sjekk tilgjengelighet på landingssiden
      await sjekkTilgjengelighet(page);
    });

    // Steg 2: Fyll ut og send inn søkeskjema
    await test.step("Fylle ut søkeskjema med testbruker", async () => {
      const mainContent = page.locator("#maincontent");
      // Finn søkefeltet
      const søkefelt = mainContent.getByLabel(/Fødsels- eller D-nummer/i);
      await expect(søkefelt).toBeVisible();

      // Fyll inn fødselsnummer
      await søkefelt.fill(testFnr);

      // Trykk på søkeknappen
      const søkeknapp = mainContent.getByRole("button", { name: /søk/i });
      await søkeknapp.click();
    });

    // Steg 3: Verifiser at oppslag-siden vises
    await test.step("Verifisere at oppslag-siden lastes", async () => {
      // Vent til URL endres til /oppslag
      await expect(page).toHaveURL(/\/oppslag/);

      // Sjekk tilgjengelighet på oppslag-siden
      await sjekkTilgjengelighet(page);
    });

    // Steg 4: Verifiser at OverskriftPanel vises
    await test.step("Verifisere at overskriftpanel vises", async () => {
      // Vent på at et panel med brukerinfo vises
      // Dette kan være et heading eller annet identifiserbart element
      await expect(page.locator("#maincontent")).toBeVisible({
        timeout: 10000,
      });

      // Sjekk tilgjengelighet
      await sjekkTilgjengelighet(page);
    });

    // Steg 5: Verifiser at BrukerinformasjonPanel vises
    await test.step("Verifisere at brukerinformasjonpanel vises", async () => {
      // Se etter panel med brukerinformasjon
      // Kan være overskrift som "Brukerinformasjon" eller lignende
      const brukerInfoPanel = page
        .getByText(/alder|adresse|familiesituasjon/i)
        .first();

      // Vent til panelet er synlig (kan ta litt tid pga async rendering)
      await expect(brukerInfoPanel).toBeVisible({ timeout: 10000 });

      // Sjekk tilgjengelighet
      await sjekkTilgjengelighet(page);
    });

    // Steg 6: Verifiser at ArbeidsforholdPanel vises
    await test.step("Verifisere at arbeidsforholdpanel vises", async () => {
      // Se etter arbeidsforhold-relatert innhold
      const arbeidsforholdPanel = page
        .getByText(/arbeidsgiver|arbeidsforhold|ansettelse/i)
        .first();

      // Vent til panelet er synlig
      await expect(arbeidsforholdPanel).toBeVisible({ timeout: 10000 });

      // Sjekk tilgjengelighet
      await sjekkTilgjengelighet(page);
    });

    // Steg 7: Verifiser at YtelserPanel vises
    await test.step("Verifisere at ytelserpanel vises", async () => {
      // Se etter ytelser-relatert innhold
      const ytelserPanel = page
        .getByText(/ytelse|stønad|dagpenger|sykepenger/i)
        .first();

      // Vent til panelet er synlig
      await expect(ytelserPanel).toBeVisible({ timeout: 10000 });

      // Sjekk tilgjengelighet
      await sjekkTilgjengelighet(page);
    });

    // Steg 8: Verifiser at InntektPanel vises
    await test.step("Verifisere at inntektpanel vises", async () => {
      // Se etter inntekt-relatert innhold
      const inntektPanel = page.getByText(/inntekt|lønn|beløp/i).first();

      // Vent til panelet er synlig
      await expect(inntektPanel).toBeVisible({ timeout: 10000 });

      // Sjekk tilgjengelighet
      await sjekkTilgjengelighet(page);
    });

    // Steg 9: Verifiser at InntektsoppsummeringPanel vises og fungerer
    await test.step("Verifisere at inntektsoppsummeringpanel vises og er universelt utformet", async () => {
      const panelHeading = page.getByRole("heading", {
        name: /inntektsoppsummering/i,
      });
      await expect(panelHeading).toBeVisible({ timeout: 10000 });
      await sjekkTilgjengelighet(page);
    });

    // Steg 10: Siste tilgjengelighetskontroll av hele siden
    await test.step("Endelig tilgjengelighetskontroll", async () => {
      // Vent litt for å sikre at alt innhold er lastet
      await page.waitForTimeout(1000);

      // Sjekk tilgjengelighet en siste gang
      await sjekkTilgjengelighet(page);
    });
  });

  test("skal vise feilmelding ved ugyldig fødselsnummer", async ({ page }) => {
    await test.step("Navigere til landingsside", async () => {
      await page.goto("/");
      await sjekkTilgjengelighet(page);
    });

    await test.step("Prøve å søke med ugyldig fødselsnummer", async () => {
      const mainContent = page.locator("#maincontent");
      const søkefelt = mainContent.getByLabel(/Fødsels- eller D-nummer/i);
      await søkefelt.fill("123"); // For kort

      const søkeknapp = mainContent.getByRole("button", { name: /søk/i });
      await søkeknapp.click();
    });

    await test.step("Verifisere at feilmelding vises", async () => {
      // Sjekk at vi fortsatt er på landingssiden
      await expect(page).toHaveURL("/");

      // Sjekk at feilmelding vises
      await expect(
        page.getByText(/Ugyldig fødsels- eller D-nummer/i),
      ).toBeVisible();

      // Sjekk tilgjengelighet med feilmelding
      await sjekkTilgjengelighet(page);
    });
  });
});
