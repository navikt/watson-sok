// app/api/oppslag/route.ts
import { env, isProd } from "~/config/env.server";
import type { LoaderFunctionArgs } from "react-router";
import type { OppslagBrukerRespons } from "~/types/Domain";
import { getnavpersondataapiOboToken } from "~/utils/access-token";
import { getMockedResponseByFnr } from "./mock";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const fnr = searchParams.get("fnr");

  if (!fnr || fnr.length !== 11) {
    return new Response("Ugyldig fnr", { status: 400 });
  }

  const oboToken = await getnavpersondataapiOboToken(request);

  if (!isProd) {
    console.log("DEVELOPMENT: returnerer mock-respons");
    return await getMockedResponseByFnr(fnr);
  }

  return await getDataFromBackEnd(oboToken, fnr);
}

async function getDataFromBackEnd(
  oboToken: string,
  ident: string,
): Promise<Response> {
  const targetUrl = `${env.NAV_PERSONDATA_API_URL}oppslag-bruker`;

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fnr: ident }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Feil fra baksystem: ${res.status} - ${errorText}`);
      return new Response("Feil ved henting av grunnlagsdata", {
        status: res.status,
      });
    }

    const data = (await res.json()) as OppslagBrukerRespons;
    return Response.json(data);
  } catch (err: unknown) {
    console.error("⛔ Nettverksfeil mot baksystem:", err);
    return new Response("Tilkoblingsfeil mot baksystem", { status: 502 });
  }
}
