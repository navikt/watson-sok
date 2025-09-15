// app/api/oppslag/route.ts
import type { ActionFunctionArgs } from "react-router";
import z from "zod";
import { isProd } from "~/config/env.server";
import type { OppslagBrukerRespons } from "~/types/Domain";
import { getnavpersondataapiOboToken } from "~/utils/access-token";
import { getMockedResponseByFnr } from "./mock";

const requestSchema = z.object({
  ident: z
    .string()
    .min(11)
    .max(11)
    .regex(/^\d{11}$/, {
      message: "Ident må være 11 sifre",
    }),
});

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return new Response("Ugyldig request", { status: 400 });
  }
  const { ident } = parsedBody.data;

  const oboToken = await getnavpersondataapiOboToken(request);

  if (!isProd) {
    console.log("DEVELOPMENT: returnerer mock-respons");
    return await getMockedResponseByFnr(ident);
  }

  return await getDataFromBackEnd(oboToken, ident);
}

async function getDataFromBackEnd(
  oboToken: string,
  ident: string,
): Promise<Response> {
  const targetUrl = "http://nav-persondata-api/oppslag-bruker";
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
      return new Response("Feil ved henting av grunnlagsdata: " + errorText, {
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
