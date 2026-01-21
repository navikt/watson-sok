import { BACKEND_API_URL } from "~/config/env.server";
import { logger } from "~/logging/logging";
import { SaksbehandlerInfoSchema, type SaksbehandlerInfo } from "./domene";

export async function hentSaksbehandlerInfo(
  token: string,
): Promise<SaksbehandlerInfo> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/meg`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    const parsedData = SaksbehandlerInfoSchema.safeParse(json);
    if (!parsedData.success) {
      logger.warn("Informasjon fra saksbehandler-API var ugyldig", {
        feilmelding: json.error,
        status: response.status,
      });
      return {
        navIdent: "",
        organisasjoner: ["Ukjent"],
      };
    }
    return parsedData.data;
  } catch (error) {
    logger.error("Kunne ikke hente informasjon om saksbehandler", { error });
    return {
      navIdent: "",
      organisasjoner: ["Ukjent"],
    };
  }
}
