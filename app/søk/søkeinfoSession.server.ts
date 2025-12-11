import { createCookieSessionStorage } from "react-router";
import { env } from "~/config/env.server";
import type { EksistensOgTilgang } from "./domene";

const { getSession, commitSession } = createCookieSessionStorage<
  SøkeinfoSessionData,
  SøkeinfoFlashData
>({
  cookie: {
    name: "sokeinfo",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: [env.IDENT_SESSION_SECRET],
    sameSite: "lax",
    maxAge: 60 * 60, // 1 time
    path: "/",
  },
});

type Søkeinfo = {
  ident: string;
  tilgang: EksistensOgTilgang["tilgang"];
  harUtvidetTilgang: boolean;
  bekreftetBegrunnetTilgang: boolean;
};
export async function lagreSøkeinfoPåSession(
  søkeinfo: Søkeinfo,
  request: Request,
) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!søkeinfo.ident.match(/^\d{11}$/)) {
    session.flash("error", "Ugyldig fødsels- eller D-nummer");
    return commitSession(session);
  }

  session.set("ident", søkeinfo.ident);
  session.set("tilgang", søkeinfo.tilgang);
  session.set("harUtvidetTilgang", søkeinfo.harUtvidetTilgang);
  session.set("bekreftetBegrunnetTilgang", søkeinfo.bekreftetBegrunnetTilgang);
  return commitSession(session);
}

export async function hentSøkedataFraSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return {
    ident: session.get("ident") ?? null,
    tilgang: session.get("tilgang") ?? null,
    harUtvidetTilgang: session.get("harUtvidetTilgang") ?? false,
    bekreftetBegrunnetTilgang:
      session.get("bekreftetBegrunnetTilgang") ?? false,
  };
}

type SøkeinfoSessionData = {
  ident: string;
  tilgang: EksistensOgTilgang["tilgang"];
  bekreftetBegrunnetTilgang: boolean;
  harUtvidetTilgang: boolean;
};

type SøkeinfoFlashData = {
  error?: string;
};
