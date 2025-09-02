// app/api/oppslag/route.ts
import { getnavpersondataapiOboToken } from "@/app/utils/access-token";
import { isDevOrTest } from "@/app/utils/is-dev-or-test";
import { OppslagBrukerRespons } from "@/app/types/Domain";
import {getMockedResponseByFnr} from "./mock"; // 👈 importér, ikke eksportér

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fnr = searchParams.get("fnr");

    if (!fnr || fnr.length !== 11) {
        return new Response("Ugyldig fnr", { status: 400 });
    }

    const oboToken = await getnavpersondataapiOboToken();

    if (isDevOrTest()) {
        console.log("DEVELOPMENT: returnerer mock-respons");
        return await getMockedResponseByFnr(fnr);
    }

    return await getDataFromBackEnd(oboToken, fnr);
}

async function getDataFromBackEnd(oboToken: string, fnr: string): Promise<Response> {
    const baseUrl = process.env.NAV_PERSONDATA_API_URL;
    if (!baseUrl) throw new Error("NAV_PERSONDATA_API_URL er ikke satt");

    const targetUrl = `${baseUrl}oppslag-bruker`;

    try {
        const res = await fetch(targetUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${oboToken}`,
                "Content-Type": "application/json",
                fnr,
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Feil fra baksystem: ${res.status} - ${errorText}`);
            return new Response("Feil ved henting av grunnlagsdata", { status: res.status });
        }

        const data = (await res.json()) as OppslagBrukerRespons;
        return Response.json(data);
    } catch (err: unknown) {
        console.error("⛔ Nettverksfeil mot baksystem:", err);
        return new Response("Tilkoblingsfeil mot baksystem", { status: 502 });
    }
}
