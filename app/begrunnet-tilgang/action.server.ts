import {
  redirect,
  redirectDocument,
  type ActionFunctionArgs,
} from "react-router";
import { RouteConfig } from "~/routeConfig";
import {
  hentSøkedataFraSession,
  lagreSøkeinfoPåSession,
} from "~/søk/søkeinfoSession.server";
import { loggBegrunnetTilgang } from "./api.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const begrunnelse = formData.get("begrunnelse")?.toString().trim();
  if (!begrunnelse) {
    return { error: "Begrunnelse er påkrevd" };
  }
  const { ident, tilgang, harUtvidetTilgang } =
    await hentSøkedataFraSession(request);

  if (!ident || !tilgang) {
    return redirect(RouteConfig.INDEX);
  }

  const cookie = await lagreSøkeinfoPåSession(
    {
      ident,
      tilgang,
      harUtvidetTilgang,
      bekreftetBegrunnetTilgang: true,
    },
    request,
  );
  try {
    await loggBegrunnetTilgang({
      ident,
      begrunnelse,
      mangel: tilgang,
      request,
    });
    return redirectDocument(RouteConfig.OPPSLAG, {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch {
    return {
      error: "En feil oppsto ved loggning av begrunnelse. Prøv igjen senere.",
    };
  }
}
