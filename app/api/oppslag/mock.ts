import { OppslagBrukerRespons } from "@/app/types/Domain";

export async function getMockedResponse(): Promise<Response> {
    const mocked: OppslagBrukerRespons = {
        utreksTidspunkt: "2025-07-07T18:05:01.959015+02:00",
        ident: "12345678901",
        saksbehandlerId: "Z993399",
        utbetalingRespons: {
            type: "UTBETALINGER",
            data: {
                utbetalinger: [
                    {
                        utbetaltTil: {
                            aktoertype: "PERSON",
                            ident: "15068054321",
                            navn: "Kari Nordmann",
                        },
                        utbetalingsmetode: "BANK_OVERFØRING",
                        utbetalingsstatus: "UTBETALT",
                        posteringsdato: "2025-07-07",
                        forfallsdato: "2025-07-08",
                        utbetalingsdato: "2025-07-09",
                        utbetalingNettobeloep: 999.5,
                        utbetalingsmelding: "Utbetaling for sykepenger",
                        utbetaltTilKonto: {
                            kontonummer: "12345678901",
                            kontotype: "PRIVAT",
                        },
                        ytelseListe: [
                            {
                                ytelsestype: "SYKEPENGER",
                                ytelsesperiode: {
                                    fom: "2025-06-01",
                                    tom: "2025-06-30",
                                },
                                ytelseNettobeloep: 1999,
                                rettighetshaver: {
                                    aktoertype: "PERSON",
                                    ident: "12345678901",
                                    navn: "Ola Nordmann",
                                },
                                skattsum: 1000.5,
                                trekksum: 1000,
                                ytelseskomponentersum: 111.22,
                                skattListe: [
                                    { skattebeloep: 99.9 },
                                ],
                                trekkListe: [
                                    {
                                        trekktype: "FAGFORENINGSKONTINGENT",
                                        trekkbeloep: 100,
                                        kreditor: "Fagforbundet",
                                    },
                                ],
                                ytelseskomponentListe: [
                                    {
                                        ytelseskomponenttype: "BARNETILLEGG",
                                        satsbeloep: 999,
                                        satstype: "DAG",
                                        satsantall: 2.5,
                                        ytelseskomponentbeloep: 42,
                                    },
                                ],
                                bilagsnummer: "BIL123456",
                                refundertForOrg: {
                                    aktoertype: "ORGANISASJON",
                                    ident: "999888777",
                                    navn: "Arbeidsgiver AS",
                                },
                            },
                        ],
                    },
                ],
            },
            ok: true,
            status: 200,
            feilmelding: null,
        },
    };

    return Response.json(mocked);
}
