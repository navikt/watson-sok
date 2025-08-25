import { OppslagBrukerRespons } from "@/app/types/Domain";

export async function getMockedResponse(): Promise<Response> {
    const mocked: OppslagBrukerRespons = {
        "utrekkstidspunkt": "2025-08-22T14:22:01.694401869",
        "saksbehandlerIdent": "",
        "fodselsnr": "",
        "personInformasjon": {
            "navn": "STORARTET null ALLIANSE",
            "aktorId": "27525728205",
            "adresse": "Fjellmyr terrasse 30, 5532",
            "familemedlemmer": {
                "13499406708": "BARN",
                "10452550240": "BARN",
                "01425808377": "GIFT"
            }
        },
        "arbeidsgiverInformasjon": {
            "lopendeArbeidsforhold": [],
            "historikk": []
        },
        "ytelserOgStonaderInformasjon": null,
        "utbetalingInfo": null,
        "stonadOversikt": [
            {
                "stonadType": "Arbeidsavklaringspenger",
                "perioder": [
                    {
                        "periode": {
                            "fom": "2022-08-08",
                            "tom": "2022-08-21"
                        },
                        "beløp": 2664,
                        "kilde": "SOKOS",
                        "info": "147325817"
                    },
                    {
                        "periode": {
                            "fom": "2022-08-22",
                            "tom": "2022-09-04"
                        },
                        "beløp": 2664,
                        "kilde": "SOKOS",
                        "info": "147502037"
                    },
                    {
                        "periode": {
                            "fom": "2022-09-05",
                            "tom": "2022-09-18"
                        },
                        "beløp": 2664,
                        "kilde": "SOKOS",
                        "info": "147746045"
                    },
                    {
                        "periode": {
                            "fom": "2022-09-19",
                            "tom": "2022-10-02"
                        },
                        "beløp": 2.31E+3,
                        "kilde": "SOKOS",
                        "info": "147854031"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-03",
                            "tom": "2022-10-16"
                        },
                        "beløp": 2167,
                        "kilde": "SOKOS",
                        "info": "148031071"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-17",
                            "tom": "2022-10-30"
                        },
                        "beløp": 2.31E+3,
                        "kilde": "SOKOS",
                        "info": "148207912"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-31",
                            "tom": "2022-11-13"
                        },
                        "beløp": 2238,
                        "kilde": "SOKOS",
                        "info": "148386650"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-14",
                            "tom": "2022-11-27"
                        },
                        "beløp": 2.31E+3,
                        "kilde": "SOKOS",
                        "info": "148565857"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-28",
                            "tom": "2022-12-11"
                        },
                        "beløp": 3404,
                        "kilde": "SOKOS",
                        "info": "148746160"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-12",
                            "tom": "2022-12-25"
                        },
                        "beløp": 2.31E+3,
                        "kilde": "SOKOS",
                        "info": "148916558"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-26",
                            "tom": "2023-01-08"
                        },
                        "beløp": 2081,
                        "kilde": "SOKOS",
                        "info": "117857571"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-09",
                            "tom": "2023-01-22"
                        },
                        "beløp": 2047,
                        "kilde": "SOKOS",
                        "info": "119231966"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-23",
                            "tom": "2023-02-05"
                        },
                        "beløp": 1.98E+3,
                        "kilde": "SOKOS",
                        "info": "118228062"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-06",
                            "tom": "2023-02-19"
                        },
                        "beløp": 2516,
                        "kilde": "SOKOS",
                        "info": "119417050"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-20",
                            "tom": "2023-03-05"
                        },
                        "beløp": 2516,
                        "kilde": "SOKOS",
                        "info": "118703415"
                    },
                    {
                        "periode": {
                            "fom": "2023-03-06",
                            "tom": "2023-03-17"
                        },
                        "beløp": 1913,
                        "kilde": "SOKOS",
                        "info": "727090143"
                    },
                    {
                        "periode": {
                            "fom": "2023-03-20",
                            "tom": "2023-03-31"
                        },
                        "beløp": 1.98E+3,
                        "kilde": "SOKOS",
                        "info": "728149219"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-03",
                            "tom": "2023-04-14"
                        },
                        "beløp": 2215,
                        "kilde": "SOKOS",
                        "info": "730030791"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-17",
                            "tom": "2023-04-28"
                        },
                        "beløp": 2081,
                        "kilde": "SOKOS",
                        "info": "731116678"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-12"
                        },
                        "beløp": 2047,
                        "kilde": "SOKOS",
                        "info": "733097747"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-26"
                        },
                        "beløp": 2.24E+3,
                        "kilde": "SOKOS",
                        "info": "734254177"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-29",
                            "tom": "2023-05-31"
                        },
                        "beløp": 927,
                        "kilde": "SOKOS",
                        "info": "736395085"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-01",
                            "tom": "2023-06-09"
                        },
                        "beløp": 2172,
                        "kilde": "SOKOS",
                        "info": "736395085"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-12",
                            "tom": "2023-06-23"
                        },
                        "beløp": 3099,
                        "kilde": "SOKOS",
                        "info": "737150311"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-26",
                            "tom": "2023-06-30"
                        },
                        "beløp": 1109,
                        "kilde": "SOKOS",
                        "info": "739453511"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-03",
                            "tom": "2023-07-07"
                        },
                        "beløp": 964,
                        "kilde": "SOKOS",
                        "info": "739453511"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-10",
                            "tom": "2023-07-21"
                        },
                        "beløp": 2287,
                        "kilde": "SOKOS",
                        "info": "739912644"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-24",
                            "tom": "2023-07-31"
                        },
                        "beløp": 1477,
                        "kilde": "SOKOS",
                        "info": "740885365"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-01",
                            "tom": "2023-08-04"
                        },
                        "beløp": 989,
                        "kilde": "SOKOS",
                        "info": "740885365"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-07",
                            "tom": "2023-08-18"
                        },
                        "beløp": 2429,
                        "kilde": "SOKOS",
                        "info": "742794531"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-21",
                            "tom": "2023-08-31"
                        },
                        "beløp": 2412,
                        "kilde": "SOKOS",
                        "info": "743830576"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-01",
                            "tom": "2023-09-01"
                        },
                        "beløp": 268,
                        "kilde": "SOKOS",
                        "info": "743830576"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-04",
                            "tom": "2023-09-15"
                        },
                        "beløp": 2394,
                        "kilde": "SOKOS",
                        "info": "745737370"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-18",
                            "tom": "2023-09-29"
                        },
                        "beløp": 2572,
                        "kilde": "SOKOS",
                        "info": "746772279"
                    },
                    {
                        "periode": {
                            "fom": "2023-10-02",
                            "tom": "2023-10-13"
                        },
                        "beløp": 2108,
                        "kilde": "SOKOS",
                        "info": "748685745"
                    },
                    {
                        "periode": {
                            "fom": "2023-10-16",
                            "tom": "2023-10-27"
                        },
                        "beløp": 2358,
                        "kilde": "SOKOS",
                        "info": "749699718"
                    },
                    {
                        "periode": {
                            "fom": "2023-10-30",
                            "tom": "2023-10-31"
                        },
                        "beløp": 436,
                        "kilde": "SOKOS",
                        "info": "751671306"
                    },
                    {
                        "periode": {
                            "fom": "2023-11-01",
                            "tom": "2023-11-10"
                        },
                        "beløp": 1745,
                        "kilde": "SOKOS",
                        "info": "751671306"
                    },
                    {
                        "periode": {
                            "fom": "2023-11-13",
                            "tom": "2023-11-24"
                        },
                        "beløp": 2108,
                        "kilde": "SOKOS",
                        "info": "752683113"
                    },
                    {
                        "periode": {
                            "fom": "2023-11-27",
                            "tom": "2023-11-30"
                        },
                        "beløp": 1236,
                        "kilde": "SOKOS",
                        "info": "755355174"
                    },
                    {
                        "periode": {
                            "fom": "2023-12-01",
                            "tom": "2023-12-08"
                        },
                        "beløp": 1863,
                        "kilde": "SOKOS",
                        "info": "755355174"
                    },
                    {
                        "periode": {
                            "fom": "2023-12-11",
                            "tom": "2023-12-22"
                        },
                        "beløp": 2394,
                        "kilde": "SOKOS",
                        "info": "755642004"
                    },
                    {
                        "periode": {
                            "fom": "2023-12-25",
                            "tom": "2023-12-29"
                        },
                        "beløp": 1267,
                        "kilde": "SOKOS",
                        "info": "756057404"
                    },
                    {
                        "periode": {
                            "fom": "2024-01-01",
                            "tom": "2024-01-05"
                        },
                        "beløp": 1271,
                        "kilde": "SOKOS",
                        "info": "756057404"
                    },
                    {
                        "periode": {
                            "fom": "2024-01-08",
                            "tom": "2024-01-19"
                        },
                        "beløp": 2248,
                        "kilde": "SOKOS",
                        "info": "758011950"
                    },
                    {
                        "periode": {
                            "fom": "2024-01-22",
                            "tom": "2024-01-31"
                        },
                        "beløp": 1.79E+3,
                        "kilde": "SOKOS",
                        "info": "759079612"
                    },
                    {
                        "periode": {
                            "fom": "2024-02-01",
                            "tom": "2024-02-02"
                        },
                        "beløp": 449,
                        "kilde": "SOKOS",
                        "info": "759079612"
                    },
                    {
                        "periode": {
                            "fom": "2024-02-05",
                            "tom": "2024-02-16"
                        },
                        "beløp": 2201,
                        "kilde": "SOKOS",
                        "info": "761056807"
                    },
                    {
                        "periode": {
                            "fom": "2024-02-19",
                            "tom": "2024-02-29"
                        },
                        "beløp": 1984,
                        "kilde": "SOKOS",
                        "info": "762141220"
                    },
                    {
                        "periode": {
                            "fom": "2024-03-01",
                            "tom": "2024-03-01"
                        },
                        "beløp": 217,
                        "kilde": "SOKOS",
                        "info": "762141220"
                    },
                    {
                        "periode": {
                            "fom": "2024-03-04",
                            "tom": "2024-03-15"
                        },
                        "beløp": 2201,
                        "kilde": "SOKOS",
                        "info": "764104549"
                    },
                    {
                        "periode": {
                            "fom": "2024-03-18",
                            "tom": "2024-03-29"
                        },
                        "beløp": 2649,
                        "kilde": "SOKOS",
                        "info": "765248048"
                    },
                    {
                        "periode": {
                            "fom": "2024-04-01",
                            "tom": "2024-04-12"
                        },
                        "beløp": 2201,
                        "kilde": "SOKOS",
                        "info": "767217448"
                    },
                    {
                        "periode": {
                            "fom": "2024-04-15",
                            "tom": "2024-04-26"
                        },
                        "beløp": 2388,
                        "kilde": "SOKOS",
                        "info": "768161969"
                    },
                    {
                        "periode": {
                            "fom": "2024-04-29",
                            "tom": "2024-04-30"
                        },
                        "beløp": 499,
                        "kilde": "SOKOS",
                        "info": "770197412"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-01",
                            "tom": "2024-05-10"
                        },
                        "beløp": 2001,
                        "kilde": "SOKOS",
                        "info": "770197412"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-13",
                            "tom": "2024-05-24"
                        },
                        "beløp": 2313,
                        "kilde": "SOKOS",
                        "info": "771377945"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-01",
                            "tom": "2024-05-24"
                        },
                        "beløp": 195,
                        "kilde": "SOKOS",
                        "info": "771624730"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-27",
                            "tom": "2024-05-31"
                        },
                        "beløp": 1.84E+3,
                        "kilde": "SOKOS",
                        "info": "771926320"
                    },
                    {
                        "periode": {
                            "fom": "2024-06-03",
                            "tom": "2024-06-07"
                        },
                        "beløp": 1841,
                        "kilde": "SOKOS",
                        "info": "771926320"
                    },
                    {
                        "periode": {
                            "fom": "2024-06-10",
                            "tom": "2024-06-21"
                        },
                        "beløp": 3131,
                        "kilde": "SOKOS",
                        "info": "774028811"
                    },
                    {
                        "periode": {
                            "fom": "2024-06-24",
                            "tom": "2024-06-28"
                        },
                        "beløp": 1286,
                        "kilde": "SOKOS",
                        "info": "775176561"
                    },
                    {
                        "periode": {
                            "fom": "2024-07-01",
                            "tom": "2024-07-05"
                        },
                        "beløp": 1.29E+3,
                        "kilde": "SOKOS",
                        "info": "775176561"
                    },
                    {
                        "periode": {
                            "fom": "2024-07-08",
                            "tom": "2024-07-19"
                        },
                        "beløp": 2575,
                        "kilde": "SOKOS",
                        "info": "777221798"
                    },
                    {
                        "periode": {
                            "fom": "2024-07-22",
                            "tom": "2024-07-31"
                        },
                        "beløp": 1903,
                        "kilde": "SOKOS",
                        "info": "778259447"
                    },
                    {
                        "periode": {
                            "fom": "2024-08-01",
                            "tom": "2024-08-02"
                        },
                        "beløp": 477,
                        "kilde": "SOKOS",
                        "info": "778259447"
                    },
                    {
                        "periode": {
                            "fom": "2024-08-05",
                            "tom": "2024-08-16"
                        },
                        "beløp": 2926,
                        "kilde": "SOKOS",
                        "info": "780207072"
                    },
                    {
                        "periode": {
                            "fom": "2024-08-19",
                            "tom": "2024-08-30"
                        },
                        "beløp": 2.38E+3,
                        "kilde": "SOKOS",
                        "info": "781268576"
                    },
                    {
                        "periode": {
                            "fom": "2024-09-01",
                            "tom": "2024-09-01"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "781268576"
                    },
                    {
                        "periode": {
                            "fom": "2024-09-02",
                            "tom": "2024-09-15"
                        },
                        "beløp": 2184,
                        "kilde": "SOKOS",
                        "info": "783268038"
                    },
                    {
                        "periode": {
                            "fom": "2024-09-16",
                            "tom": "2024-09-29"
                        },
                        "beløp": 2341,
                        "kilde": "SOKOS",
                        "info": "784234572"
                    },
                    {
                        "periode": {
                            "fom": "2022-06-13",
                            "tom": "2022-06-26"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-06-27",
                            "tom": "2022-07-24"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-07-25",
                            "tom": "2022-08-07"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-03",
                            "tom": "2022-10-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-31",
                            "tom": "2022-11-27"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-28",
                            "tom": "2022-12-25"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-26",
                            "tom": "2023-01-22"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-23",
                            "tom": "2023-02-19"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-20",
                            "tom": "2023-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-03",
                            "tom": "2023-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-01",
                            "tom": "2023-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-01",
                            "tom": "2023-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-01",
                            "tom": "2023-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-01",
                            "tom": "2023-09-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-10-02",
                            "tom": "2023-10-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-11-01",
                            "tom": "2023-11-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2023-12-01",
                            "tom": "2023-12-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-01-01",
                            "tom": "2024-01-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-02-01",
                            "tom": "2024-02-29"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-03-01",
                            "tom": "2024-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-04-01",
                            "tom": "2024-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-01",
                            "tom": "2024-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-06-01",
                            "tom": "2024-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-07-01",
                            "tom": "2024-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-08-01",
                            "tom": "2024-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    },
                    {
                        "periode": {
                            "fom": "2024-09-02",
                            "tom": "2024-09-29"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "14086029"
                    }
                ]
            },
            {
                "stonadType": "Uføretrygd",
                "perioder": [
                    {
                        "periode": {
                            "fom": "2022-09-01",
                            "tom": "2022-09-30"
                        },
                        "beløp": 9953,
                        "kilde": "SOKOS",
                        "info": "710087127"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-01",
                            "tom": "2022-10-31"
                        },
                        "beløp": 9953,
                        "kilde": "SOKOS",
                        "info": "712603124"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-01",
                            "tom": "2022-11-30"
                        },
                        "beløp": 9953,
                        "kilde": "SOKOS",
                        "info": "715140489"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-01",
                            "tom": "2022-12-31"
                        },
                        "beløp": 11888,
                        "kilde": "SOKOS",
                        "info": "717611138"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-01",
                            "tom": "2023-01-31"
                        },
                        "beløp": 9.4E+3,
                        "kilde": "SOKOS",
                        "info": "720207629"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-01",
                            "tom": "2023-01-31"
                        },
                        "beløp": 3E+3,
                        "kilde": "SOKOS",
                        "info": "722578727"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-01",
                            "tom": "2023-02-28"
                        },
                        "beløp": 9.4E+3,
                        "kilde": "SOKOS",
                        "info": "722846347"
                    },
                    {
                        "periode": {
                            "fom": "2023-03-01",
                            "tom": "2023-03-31"
                        },
                        "beløp": 9.4E+3,
                        "kilde": "SOKOS",
                        "info": "725451469"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-01",
                            "tom": "2023-04-30"
                        },
                        "beløp": 9.4E+3,
                        "kilde": "SOKOS",
                        "info": "728548676"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-31"
                        },
                        "beløp": 9.4E+3,
                        "kilde": "SOKOS",
                        "info": "731403786"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-31"
                        },
                        "beløp": 603,
                        "kilde": "SOKOS",
                        "info": "734797386"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-01",
                            "tom": "2023-06-30"
                        },
                        "beløp": 14709,
                        "kilde": "SOKOS",
                        "info": "734797386"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-01",
                            "tom": "2023-07-31"
                        },
                        "beløp": 10003,
                        "kilde": "SOKOS",
                        "info": "738218032"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-01",
                            "tom": "2023-08-31"
                        },
                        "beløp": 5196,
                        "kilde": "SOKOS",
                        "info": "741152926"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-01",
                            "tom": "2023-09-30"
                        },
                        "beløp": 4424,
                        "kilde": "SOKOS",
                        "info": "744129488"
                    },
                    {
                        "periode": {
                            "fom": "2022-01-01",
                            "tom": "2022-01-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-02-01",
                            "tom": "2022-02-28"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-03-01",
                            "tom": "2022-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-04-01",
                            "tom": "2022-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-05-01",
                            "tom": "2022-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-06-01",
                            "tom": "2022-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-07-01",
                            "tom": "2022-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-08-01",
                            "tom": "2022-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-09-01",
                            "tom": "2022-09-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-01",
                            "tom": "2022-10-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-01",
                            "tom": "2022-11-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-01",
                            "tom": "2022-12-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12652261"
                    },
                    {
                        "periode": {
                            "fom": "2022-01-01",
                            "tom": "2022-01-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-02-01",
                            "tom": "2022-02-28"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-03-01",
                            "tom": "2022-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-04-01",
                            "tom": "2022-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-05-01",
                            "tom": "2022-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-06-01",
                            "tom": "2022-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-07-01",
                            "tom": "2022-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-08-01",
                            "tom": "2022-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-09-01",
                            "tom": "2022-09-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-10-01",
                            "tom": "2022-10-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-11-01",
                            "tom": "2022-11-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2022-12-01",
                            "tom": "2022-12-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "12708429"
                    },
                    {
                        "periode": {
                            "fom": "2024-02-01",
                            "tom": "2024-02-29"
                        },
                        "beløp": 10444,
                        "kilde": "SOKOS",
                        "info": "759382494"
                    },
                    {
                        "periode": {
                            "fom": "2024-03-01",
                            "tom": "2024-03-31"
                        },
                        "beløp": 10444,
                        "kilde": "SOKOS",
                        "info": "762450138"
                    },
                    {
                        "periode": {
                            "fom": "2024-04-01",
                            "tom": "2024-04-30"
                        },
                        "beløp": 10444,
                        "kilde": "SOKOS",
                        "info": "765589258"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-01",
                            "tom": "2024-05-31"
                        },
                        "beløp": 10444,
                        "kilde": "SOKOS",
                        "info": "768605940"
                    },
                    {
                        "periode": {
                            "fom": "2024-05-01",
                            "tom": "2024-05-31"
                        },
                        "beløp": 477,
                        "kilde": "SOKOS",
                        "info": "772204751"
                    },
                    {
                        "periode": {
                            "fom": "2024-06-01",
                            "tom": "2024-06-30"
                        },
                        "beløp": 1.538E+4,
                        "kilde": "SOKOS",
                        "info": "772204751"
                    },
                    {
                        "periode": {
                            "fom": "2024-07-01",
                            "tom": "2024-07-31"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "775433171"
                    },
                    {
                        "periode": {
                            "fom": "2024-08-01",
                            "tom": "2024-08-31"
                        },
                        "beløp": 9.29E+3,
                        "kilde": "SOKOS",
                        "info": "778554594"
                    },
                    {
                        "periode": {
                            "fom": "2024-09-01",
                            "tom": "2024-09-30"
                        },
                        "beløp": 2899,
                        "kilde": "SOKOS",
                        "info": "781684532"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-01",
                            "tom": "2023-01-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-01",
                            "tom": "2023-02-28"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-03-01",
                            "tom": "2023-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-01",
                            "tom": "2023-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-01",
                            "tom": "2023-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-01",
                            "tom": "2023-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-01",
                            "tom": "2023-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-01",
                            "tom": "2023-09-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13771573"
                    },
                    {
                        "periode": {
                            "fom": "2023-01-01",
                            "tom": "2023-01-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-02-01",
                            "tom": "2023-02-28"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-03-01",
                            "tom": "2023-03-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-04-01",
                            "tom": "2023-04-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-05-01",
                            "tom": "2023-05-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-06-01",
                            "tom": "2023-06-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-07-01",
                            "tom": "2023-07-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-08-01",
                            "tom": "2023-08-31"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2023-09-01",
                            "tom": "2023-09-30"
                        },
                        "beløp": 0,
                        "kilde": "SOKOS",
                        "info": "13776270"
                    },
                    {
                        "periode": {
                            "fom": "2025-01-01",
                            "tom": "2025-01-31"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "794003621"
                    },
                    {
                        "periode": {
                            "fom": "2025-02-01",
                            "tom": "2025-02-28"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "797217071"
                    },
                    {
                        "periode": {
                            "fom": "2025-03-01",
                            "tom": "2025-03-31"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "800369277"
                    },
                    {
                        "periode": {
                            "fom": "2025-04-01",
                            "tom": "2025-04-30"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "803446897"
                    },
                    {
                        "periode": {
                            "fom": "2025-05-01",
                            "tom": "2025-05-31"
                        },
                        "beløp": 11135,
                        "kilde": "SOKOS",
                        "info": "806622668"
                    },
                    {
                        "periode": {
                            "fom": "2025-05-01",
                            "tom": "2025-05-31"
                        },
                        "beløp": 551,
                        "kilde": "SOKOS",
                        "info": "810188374"
                    },
                    {
                        "periode": {
                            "fom": "2025-06-01",
                            "tom": "2025-06-30"
                        },
                        "beløp": 16459,
                        "kilde": "SOKOS",
                        "info": "810188374"
                    },
                    {
                        "periode": {
                            "fom": "2025-07-01",
                            "tom": "2025-07-31"
                        },
                        "beløp": 11686,
                        "kilde": "SOKOS",
                        "info": "813409854"
                    },
                    {
                        "periode": {
                            "fom": "2025-08-01",
                            "tom": "2025-08-31"
                        },
                        "beløp": 11686,
                        "kilde": "SOKOS",
                        "info": "816514707"
                    }
                ]
            }
        ]
    };

    return Response.json(mocked);
}
