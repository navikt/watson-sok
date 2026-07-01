import { redirectDocument, type ActionFunctionArgs } from "react-router";

import { logger } from "~/logging/logging";
import { RouteConfig } from "~/routeConfig";

import { sjekkEksistensOgTilgang } from "./api.server";
import { lagreSøkeinfoPåSession } from "./søkeinfoSession.server";

/**
 * Tar imot en innkommende søkeforespørsel fra Watson Sak (eller andre
 * interne Nav-applikasjoner) via en cross-origin form POST.
 *
 * Gjør det samme som det ordinære søket: sjekker eksistens og tilgang,
 * lagrer resultatet i session, og redirecter til riktig side.
 *
 * Merk: fungerer kun for brukere som allerede er innlogget i Watson Søk.
 * Brukere uten aktiv session vil bli sendt til forsiden etter innlogging.
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const ident = formData.get("ident")?.toString().replace(/\s+/g, "");

  if (!ident || ident.length !== 11 || !/^\d+$/.test(ident)) {
    return redirectDocument(RouteConfig.INDEX);
  }

  try {
    const eksistensOgTilgang = await sjekkEksistensOgTilgang({
      ident,
      request,
      navCallId: crypto.randomUUID(),
      traceLogging: false,
    });

    const cookie = await lagreSøkeinfoPåSession(
      {
        ident,
        tilgang: eksistensOgTilgang.tilgang,
        harUtvidetTilgang: eksistensOgTilgang.harUtvidetTilgang,
        bekreftetBegrunnetTilgang: false,
      },
      request,
    );

    if (eksistensOgTilgang.tilgang === "IKKE_FUNNET") {
      return redirectDocument(RouteConfig.INDEX, {
        headers: { "Set-Cookie": cookie },
      });
    }

    if (eksistensOgTilgang.tilgang === "OK" || eksistensOgTilgang.harUtvidetTilgang) {
      return redirectDocument(RouteConfig.OPPSLAG, {
        headers: { "Set-Cookie": cookie },
      });
    }

    return redirectDocument(RouteConfig.TILGANG, {
      headers: { "Set-Cookie": cookie },
    });
  } catch (error) {
    logger.error("Feil ved oppslag fra ekstern applikasjon", { error });
    return redirectDocument(RouteConfig.INDEX);
  }
}
