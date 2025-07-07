export interface OppslagBrukerRespons {
    utreksTidspunkt: string;
    ident: string;
    saksbehandlerId: string;
    utbetalingRespons: UtbetalingRespons;
}

export interface UtbetalingRespons {
    type: string;
    data: {
        utbetalinger: Utbetaling[];
    };
    ok: boolean;
    status: number;
    feilmelding: string | null;
}

export interface Utbetaling {
    utbetaltTil: Person;
    utbetalingsmetode: string;
    utbetalingsstatus: string;
    posteringsdato: string;
    forfallsdato: string;
    utbetalingsdato: string;
    utbetalingNettobeloep: number;
    utbetalingsmelding: string;
    utbetaltTilKonto: Konto;
    ytelseListe: Ytelse[];
}

export interface Person {
    aktoertype: "PERSON" | "ORGANISASJON" | string;
    ident: string;
    navn: string;
}

export interface Konto {
    kontonummer: string;
    kontotype: string;
}

export interface Ytelse {
    ytelsestype: string;
    ytelsesperiode: Periode;
    ytelseNettobeloep: number;
    rettighetshaver: Person;
    skattsum: number;
    trekksum: number;
    ytelseskomponentersum: number;
    skattListe: Skatt[];
    trekkListe: Trekk[];
    ytelseskomponentListe: Ytelseskomponent[];
    bilagsnummer: string;
    refundertForOrg: Person;
}

export interface Periode {
    fom: string;
    tom: string;
}

export interface Skatt {
    skattebeloep: number;
}

export interface Trekk {
    trekktype: string;
    trekkbeloep: number;
    kreditor: string;
}

export interface Ytelseskomponent {
    ytelseskomponenttype: string;
    satsbeloep: number;
    satstype: string;
    satsantall: number;
    ytelseskomponentbeloep: number;
}