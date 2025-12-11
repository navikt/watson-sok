import { data, redirectDocument, type ActionFunctionArgs } from "react-router";
import { RouteConfig } from "~/features/config/routeConfig";
import { logger } from "../logging/logging";
import { sjekkEksistensOgTilgang } from "./api.server";
import {
  hentSøkedataFraSession,
  lagreSøkeinfoPåSession,
} from "./søkeinfoSession.server";

export async function søkAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const råIdent = formData.get("ident")?.toString().replace(/\s+/g, "");

  const leggTilTraceHeader = råIdent?.endsWith("?") ?? false;
  const ident = råIdent?.replace("?", "");

  if (!ident || ident.length !== 11 || !ident.match(/^\d+$/)) {
    return { error: "Ugyldig fødsels- eller D-nummer" };
  }

  try {
    const eksistensOgTilgang = await sjekkEksistensOgTilgang({
      ident,
      request,
      navCallId: crypto.randomUUID(),
      traceLogging: leggTilTraceHeader,
    });

    if (eksistensOgTilgang.tilgang === "IKKE_FUNNET") {
      const cookie = await lagreSøkeinfoPåSession(
        {
          ident,
          tilgang: "IKKE_FUNNET",
          harUtvidetTilgang: eksistensOgTilgang.harUtvidetTilgang,
          bekreftetBegrunnetTilgang: false,
        },
        request,
      );
      return data(
        { error: "Bruker ikke funnet" },
        { headers: { "Set-Cookie": cookie } },
      );
    }

    const eksisterendeSøkedata = await hentSøkedataFraSession(request);

    const harAlleredeBekreftetBegrunnetTilgang =
      eksisterendeSøkedata.ident === ident &&
      eksisterendeSøkedata.bekreftetBegrunnetTilgang;

    const cookie = await lagreSøkeinfoPåSession(
      {
        ident,
        tilgang: eksistensOgTilgang.tilgang,
        harUtvidetTilgang: eksistensOgTilgang.harUtvidetTilgang,
        bekreftetBegrunnetTilgang: harAlleredeBekreftetBegrunnetTilgang,
      },
      request,
    );

    if (
      eksistensOgTilgang.tilgang === "OK" ||
      eksistensOgTilgang.harUtvidetTilgang ||
      harAlleredeBekreftetBegrunnetTilgang
    ) {
      return redirectDocument(
        RouteConfig.OPPSLAG + (leggTilTraceHeader ? "?traceLogging=true" : ""),
        {
          headers: {
            "Set-Cookie": cookie,
          },
        },
      );
    }

    return redirectDocument(RouteConfig.TILGANG, {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    logger.error("En feil oppsto ved søking på bruker.", { error });
    return { error: "En feil oppsto ved søking på bruker. Prøv igjen senere." };
  }
}
