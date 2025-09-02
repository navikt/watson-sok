export interface OppslagBrukerRespons {
    utrekkstidspunkt: string;
    fodselsnr: string;
    saksbehandlerIdent: string;
    personInformasjon: PersonInformasjon;
    stonadOversikt : Stonad[];
    arbeidsgiverInformasjon: ArbeidsgiverInformasjon;
    inntektInformasjon :InntektInformasjon
}


export interface InntektInformasjon {
    loennsinntekt: Inntekt[]
    naringsInntekt: Inntekt[]
    pensjonEllerTrygd: Inntekt[]
    ytelseFraOffentlige: Inntekt[]
}


export interface Inntekt {
    arbeidsgiver: string
    periode: string,
    arbeidsforhold: string
    stillingsprosent: string
    lonnstype: string,
    antall: string | null
    belop: string
    harFlereVersjoner: boolean
}

export interface Periode {
    fom: string;      // f.eks. "2025-07"
    tom: string | null;
}


export interface NotNullPeriode {
    fom: string;      // f.eks. "2025-07"
    tom: string;
}

export interface AnsettelsesDetalj {
    type: string;           // f.eks. "Ordinaer"
    stillingsprosent: number;
    antallTimerPrUke: number;
    periode: Periode;
}

export interface Arbeidsforhold {
    arbeidsgiver: string;
    organisasjonsnummer: string;
    adresse: string;
    ansettelsesDetaljer: AnsettelsesDetalj[];
}

export interface ArbeidsgiverInformasjon {
    lopendeArbeidsforhold: Arbeidsforhold[];
    historikk: Arbeidsforhold[];
}


export interface PersonInformasjon {
    navn: string;
    aktorId: string;
    adresse: string;
    familemedlemmer: {
        [personId: string]: "BARN" | "GIFT" | string; // nøkkel = id, verdi = relasjon
    };
}

export interface Stonad {
    stonadType: string;
    perioder: StonadPeriode[];
}
export interface StonadPeriode {
    periode: NotNullPeriode;
    beløp: string;
    kilde: string;
    info: string;
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
    ytelsesperiode: NotNullPeriode;
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