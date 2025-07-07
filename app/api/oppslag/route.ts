import { getnavpersondataapiOboToken } from "@/app/utils/access-token";
import { isDevOrTest } from "@/app/utils/is-dev-or-test";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fnr = searchParams.get("fnr");

    if (!fnr || fnr.length !== 11) {
        return new Response("Ugyldig fnr", { status: 400 });
    }

    const oboToken = await getnavpersondataapiOboToken();

    if (isDevOrTest()) {
        console.log("DEVELOPMENT: returnerer mock-respons");
        return await getMockedResponse();
    }

    console.log("Henter data fra baksystem ...");
    return await getDataFromBackEnd(oboToken, fnr);
}

async function getDataFromBackEnd(oboToken: string, fnr: string) {
    const baseUrl = process.env.NAV_PERSONDATA_API_URL;
    if (!baseUrl) {
        throw new Error("NAV_PERSONDATA_API_URL er ikke satt");
    }

    const targetUrl = `${baseUrl}oppslag-bruker`;
    console.log("Kaller URL:", targetUrl);
    console.log({oboToken});

    try {
        const res = await fetch(targetUrl, {
            method: "GET", // 👈 eksplisitt
            headers: {
                Authorization: `Bearer ${oboToken}`,
                "Content-Type": "application/json",
                "fnr": fnr,
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Feil fra baksystem: ${res.status} - ${errorText}`);
            return new Response("Feil ved henting av grunnlagsdata", { status: res.status });
        }

        const data = await res.json();
        return Response.json(data);
    } catch (err: unknown) {
        console.error("⛔ Nettverksfeil mot baksystem:", err);
        return new Response("Tilkoblingsfeil mot baksystem", { status: 502 });
    }
}

async function getMockedResponse() {
    return Response.json({
        utreksTidspunkt: "2025-07-07T12:55:08.828773+02:00",
        ident: "12345678901",
        saksbehandlerId: "Z993399",
        utbetalingRespons: {
            status: true,
            utbetalinger: [
                {
                    utbetaltTil: {
                        aktoertype: "PERSON",
                        ident: "string",
                        navn: "string"
                    },
                    utbetalingsmetode: "string",
                    utbetalingsstatus: "string",
                    posteringsdato: "2025-07-07",
                    forfallsdato: "2025-07-07",
                    utbetalingsdato: "2025-07-07",
                    utbetalingNettobeloep: 999.5,
                    utbetalingsmelding: "string",
                    utbetaltTilKonto: {
                        kontonummer: "string",
                        kontotype: "string"
                    },
                    ytelseListe: [
                        {
                            ytelsestype: "string",
                            ytelsesperiode: {
                                fom: "2025-07-07",
                                tom: "2025-07-07"
                            },
                            ytelseNettobeloep: 1999,
                            rettighetshaver: {
                                aktoertype: "PERSON",
                                ident: "string",
                                navn: "string"
                            },
                            skattsum: 1000.5,
                            trekksum: 1000,
                            ytelseskomponentersum: 111.22,
                            skattListe: [
                                {
                                    skattebeloep: 99.9
                                }
                            ],
                            trekkListe: [
                                {
                                    trekktype: "string",
                                    trekkbeloep: 100,
                                    kreditor: "string"
                                }
                            ],
                            ytelseskomponentListe: [
                                {
                                    ytelseskomponenttype: "string",
                                    satsbeloep: 999,
                                    satstype: "string",
                                    satsantall: 2.5,
                                    ytelseskomponentbeloep: 42
                                }
                            ],
                            bilagsnummer: "string",
                            refundertForOrg: {
                                aktoertype: "PERSON",
                                ident: "string",
                                navn: "string"
                            }
                        }
                    ]
                }
            ]
        }
    });
}
