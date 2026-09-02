#!/usr/bin/env node
/**
 * Genererer app/test/mocks/<fødselsnummer>.json fra washed rådata i
 * app/test/mocks/tmp-mock/ (rå nav-persondata-api-kildesvar: aareg, dagpenger,
 * inntekt, pdl_hentPerson, pdl_lokalKontor, sigrun, utbetaling).
 *
 * Mapping-logikken her speiler nav-persondata-api sine service-klasser
 * (Kotlin), slik at mock-personen ser identisk ut som det ekte
 * saksbehandler-oppslaget ville gitt:
 *  - personInformasjon      <- service/PersonopplysningerService.kt + service/ExtentionFunctions.kt
 *  - arbeidsgiverInformasjon <- service/ArbeidsforholdService.kt
 *  - inntektInformasjon     <- service/InntektService.kt
 *  - stønader               <- service/YtelseService.kt
 *  - meldekort              <- service/MeldekortService.kt (nesten 1:1 passthrough av dagpenger-data)
 *  - pensjonsgivendeInntekt <- pensjonsgivendeInntekt/Mapping.kt
 *
 * Kjente forenklinger (ingen ereg-/kodeverk-data tilgjengelig offline):
 *  - Arbeidsgivernavn og motpartsorganisasjoner vises som
 *    "<orgnummer> - Ukjent organisasjon" (samme fallback backend selv bruker
 *    når Ereg-oppslag mangler).
 *  - Landkoder og postnummer er kun delvis oversatt til navn (liten,
 *    håndskrevet tabell) — ukjente koder beholdes som rå kode.
 *  - Familiemedlemmers navn/fødselsdato er ikke tilgjengelig (krever et eget
 *    PDL-bolk-kall vi ikke har fanget opp rådata for) — kun ident/rolle er satt.
 *  - aapMeldekort er utelatt (ingen AAP-rådata i tmp-mock).
 *
 * Kjør med: node scripts/generate-mock-person.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TMP_DIR = path.join(ROOT, "app/test/mocks/tmp-mock");
const FNR = "99999999999";
const OUT_FILE = path.join(ROOT, "app/test/mocks", `${FNR}.json`);

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(TMP_DIR, name), "utf-8"));
}

// ---------------------------------------------------------------------------
// Små "kodeverk"-tabeller (erstatning for KodeverkService, som krever
// tilgang til et ekte kodeverk-oppslag vi ikke har offline)
// ---------------------------------------------------------------------------
const LANDKODE_TIL_NAVN = {
  NOR: "NORGE",
  AFG: "AFGHANISTAN",
};
function mapLandkodeTilLandnavn(kode) {
  return LANDKODE_TIL_NAVN[kode] ?? kode;
}

const POSTNUMMER_TIL_POSTSTED = {
  "0301": "OSLO",
};
function mapPostnummerTilPoststed(postnummer) {
  return POSTNUMMER_TIL_POSTSTED[postnummer] ?? postnummer;
}

function orgNummerTilOrgNavn(orgnummer) {
  return `${orgnummer} - Ukjent organisasjon`;
}

/** Speiler MeldekortDomene.kt sin Aktivitet.timerAsDouble(): Duration.parse(...).toMinutes() / 60.0 */
function parseIso8601DurationTilDesimaltimer(duration) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const totalMinutes = hours * 60 + minutes + Math.floor(seconds / 60);
  return totalMinutes / 60;
}

// ---------------------------------------------------------------------------
// personInformasjon (jf. PersonopplysningerService.kt + ExtentionFunctions.kt)
// ---------------------------------------------------------------------------
function byggPersonInformasjon() {
  const pdlData = readJson("pdl_hentPerson.json").data;
  const lokalKontor = readJson("pdl_lokalKontor.json");

  const gjeldendeNavn = pdlData.navn.find((n) => !n.metadata.historisk);

  const nåværendeBosted = pdlData.bostedsadresse.find(
    (a) => !a.metadata.historisk,
  );

  function tilNorskAdresse(vegadresse) {
    if (!vegadresse) return null;
    return {
      adressenavn: vegadresse.adressenavn,
      husnummer: vegadresse.husnummer,
      husbokstav: vegadresse.husbokstav,
      postnummer: vegadresse.postnummer,
      kommunenummer: vegadresse.kommunenummer,
      poststed: mapPostnummerTilPoststed(vegadresse.postnummer),
    };
  }

  function tilUtenlandskAdresse(utenlandskAdresse) {
    if (!utenlandskAdresse) return null;
    return {
      adressenavnNummer: utenlandskAdresse.adressenavnNummer,
      bygningEtasjeLeilighet: utenlandskAdresse.bygningEtasjeLeilighet,
      postboksNummerNavn: utenlandskAdresse.postboksNummerNavn,
      postkode: utenlandskAdresse.postkode,
      bySted: utenlandskAdresse.bySted,
      regionDistriktOmråde: utenlandskAdresse.regionDistriktOmraade,
      landkode: mapLandkodeTilLandnavn(utenlandskAdresse.landkode),
    };
  }

  const adresse = nåværendeBosted
    ? {
        norskAdresse: tilNorskAdresse(nåværendeBosted.vegadresse),
        utenlandskAdresse: tilUtenlandskAdresse(
          nåværendeBosted.utenlandskAdresse,
        ),
      }
    : null;

  // adresseHistorikkSiste5År (jf. ExtentionFunctions.kt) — se kommentar der om
  // PDL sin kjente produksjonsfeil med gyldigTilOgMed.
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 5);

  const sortert = pdlData.bostedsadresse
    .map((a) => {
      if (!a.gyldigFraOgMed) return null;
      const fraDato = new Date(a.gyldigFraOgMed.slice(0, 10));
      const rawTilDato = a.gyldigTilOgMed
        ? new Date(a.gyldigTilOgMed.slice(0, 10))
        : null;
      return { adresse: a, fraDato, rawTilDato };
    })
    .filter(Boolean)
    .sort((a, b) => a.fraDato - b.fraDato);

  const adresseHistorikk = sortert
    .map(({ adresse: a, rawTilDato }, index) => {
      const nesteFraDato = sortert[index + 1]?.fraDato ?? null;
      let korrigertTilDato;
      if (nesteFraDato === null) {
        korrigertTilDato = rawTilDato;
      } else if (rawTilDato !== null && rawTilDato < nesteFraDato) {
        korrigertTilDato = rawTilDato;
      } else {
        korrigertTilDato = new Date(nesteFraDato);
        korrigertTilDato.setDate(korrigertTilDato.getDate() - 1);
      }
      return { a, korrigertTilDato };
    })
    .filter(
      ({ korrigertTilDato }) =>
        korrigertTilDato === null || korrigertTilDato >= cutoff,
    )
    .map(({ a, korrigertTilDato }) => {
      const norskAdresse = tilNorskAdresse(a.vegadresse);
      const utenlandskAdresse = tilUtenlandskAdresse(a.utenlandskAdresse);
      if (!norskAdresse && !utenlandskAdresse) return null;
      return {
        adresse: { norskAdresse, utenlandskAdresse },
        gyldigFraOgMed: a.gyldigFraOgMed,
        gyldigTilOgMed: korrigertTilDato
          ? korrigertTilDato.toISOString().slice(0, 10)
          : null,
      };
    })
    .filter(Boolean);

  const telefonnummer = pdlData.telefonnummer
    .filter((t) => !t.metadata.historisk)
    .sort((a, b) => a.prioritet - b.prioritet)
    .map((t) => ({
      landskode: t.landskode,
      nummer: t.nummer,
      prioritet: t.prioritet,
    }));

  const adressebeskyttelse = (() => {
    if (pdlData.adressebeskyttelse.length === 0) return "UGRADERT";
    const gjeldende = pdlData.adressebeskyttelse.find(
      (a) => !a.metadata.historisk,
    );
    const gradering = gjeldende?.gradering;
    if (
      gradering === "UGRADERT" ||
      gradering === "FORTROLIG" ||
      gradering === "STRENGT_FORTROLIG" ||
      gradering === "STRENGT_FORTROLIG_UTLAND"
    ) {
      return gradering;
    }
    return "UGRADERT";
  })();

  // byggFamiliemedlemmerMedRolle + berikFamiliemedlemmerMedNavn — uten
  // bolk-kall er navn/fødselsdato ikke tilgjengelig, kun ident+rolle.
  const familieMap = new Map();
  for (const rel of pdlData.forelderBarnRelasjon) {
    if (rel.relatertPersonsIdent) {
      familieMap.set(
        rel.relatertPersonsIdent,
        rel.relatertPersonsRolle ?? "Ukjent",
      );
    }
  }
  for (const sivilstand of pdlData.sivilstand) {
    if (sivilstand.relatertVedSivilstand) {
      familieMap.set(sivilstand.relatertVedSivilstand, sivilstand.type);
    }
  }
  const familemedlemmer = [...familieMap.entries()].map(([ident, rolle]) => ({
    ident,
    rolle,
    fornavn: null,
    mellomnavn: null,
    etternavn: null,
    fødselsdato: null,
    adressebeskyttelse: "UGRADERT",
  }));

  const statsborgerskap = pdlData.statsborgerskap.map((s) =>
    mapLandkodeTilLandnavn(s.land),
  );

  const gjeldendeSivilstand = pdlData.sivilstand.find(
    (s) => !s.metadata.historisk,
  );

  const fødselsdato = pdlData.foedselsdato[0]?.foedselsdato ?? "";
  const alder = fødselsdato
    ? Math.floor(
        (Date.now() - new Date(fødselsdato).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : -1;

  return {
    navn: {
      fornavn: gjeldendeNavn?.fornavn ?? "",
      mellomnavn: gjeldendeNavn?.mellomnavn ?? null,
      etternavn: gjeldendeNavn?.etternavn ?? "",
    },
    aktørId: FNR,
    adresse,
    adresseHistorikk,
    telefonnummer,
    adressebeskyttelse,
    familemedlemmer,
    statsborgerskap,
    sivilstand: gjeldendeSivilstand?.type ?? "UKJENT",
    alder,
    fødselsdato,
    dødsdato: pdlData.doedsfall[0]?.doedsdato ?? null,
    navKontor: {
      enhetId: lokalKontor.enhetId,
      navn: lokalKontor.navn,
      enhetNr: lokalKontor.enhetNr,
      type: lokalKontor.type,
    },
  };
}

// ---------------------------------------------------------------------------
// arbeidsgiverInformasjon (jf. ArbeidsforholdService.kt)
// ---------------------------------------------------------------------------
function byggArbeidsgiverInformasjon() {
  const alleArbeidsforhold = readJson("aareg.json").data;

  function hentOrgNummer(arbeidsforhold) {
    const identOrg = arbeidsforhold.arbeidssted.identer.find(
      (i) => i.type === "ORGANISASJONSNUMMER",
    );
    return identOrg?.ident ?? "Ingen OrgNummer";
  }

  /** Enkel, stabil erstatning for Kotlin sin orgnummer.hashCode()+dayOfYear (kun brukt som React-key). */
  function saltetId(orgnummer) {
    let hash = 0;
    for (const char of orgnummer) {
      hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (24 * 60 * 60 * 1000),
    );
    return `${hash}${dayOfYear}`;
  }

  function mapArbeidsforhold(arbeidsforhold) {
    const orgnummer = hentOrgNummer(arbeidsforhold);
    return {
      arbeidsgiver: orgNummerTilOrgNavn(orgnummer),
      organisasjonsnummer: orgnummer,
      id: saltetId(orgnummer),
      ansettelsesDetaljer: arbeidsforhold.ansettelsesdetaljer.map((ad) => ({
        type: ad.type,
        stillingsprosent: ad.avtaltStillingsprosent,
        antallTimerPrUke: ad.antallTimerPrUke,
        periode: {
          fom: arbeidsforhold.ansettelsesperiode.startdato,
          tom: arbeidsforhold.ansettelsesperiode.sluttdato,
        },
        yrke: ad.yrke?.beskrivelse ?? null,
      })),
      timerMedTimeloenn: (arbeidsforhold.timerMedTimeloenn ?? []).map(
        (t) => ({
          antall: t.antall,
          startdato: t.startdato,
          sluttdato: t.sluttdato,
          rapporteringsmaaneder: t.rapporteringsmaaneder
            ? {
                fom: t.rapporteringsmaaneder.fra,
                tom: t.rapporteringsmaaneder.til,
              }
            : undefined,
        }),
      ),
    };
  }

  return {
    løpendeArbeidsforhold: alleArbeidsforhold
      .filter((a) => a.ansettelsesperiode.sluttdato === null)
      .map(mapArbeidsforhold),
    historikk: alleArbeidsforhold
      .filter((a) => a.ansettelsesperiode.sluttdato !== null)
      .map(mapArbeidsforhold),
  };
}

// ---------------------------------------------------------------------------
// inntektInformasjon (jf. InntektService.kt)
// ---------------------------------------------------------------------------
function byggInntektInformasjon() {
  const historikker = readJson("inntekt.json").data.data;

  function nyeste(versjoner) {
    return versjoner.reduce((a, b) =>
      new Date(a.oppsummeringstidspunkt) > new Date(b.oppsummeringstidspunkt)
        ? a
        : b,
    );
  }
  function eldste(versjoner) {
    return versjoner.reduce((a, b) =>
      new Date(a.oppsummeringstidspunkt) < new Date(b.oppsummeringstidspunkt)
        ? a
        : b,
    );
  }
  function harHistorikkPåNormallønn(historikk) {
    let count = 0;
    for (const versjon of historikk.versjoner) {
      const antall = versjon.inntektListe.filter(
        (i) => i.type !== "YtelseFraOffentlige",
      ).length;
      if (antall > 0) count++;
    }
    return count > 1;
  }

  const lønnsinntekt = historikker.flatMap((historikk) => {
    const arbeidsgiver = /^\d{9}$/.test(historikk.opplysningspliktig)
      ? orgNummerTilOrgNavn(historikk.opplysningspliktig)
      : null;

    const nyesteVersjon = nyeste(historikk.versjoner);
    const eldsteVersjon = eldste(historikk.versjoner);

    let respons = nyesteVersjon.inntektListe
      .filter((i) => i.type === "Loennsinntekt")
      .map((loenn) => ({
        arbeidsgiver,
        periode: historikk.maaned,
        arbeidsforhold: "",
        stillingsprosent: "",
        lønnstype: loenn.beskrivelse,
        antall: loenn.antall !== null ? Number(loenn.antall) : null,
        beløp: loenn.beloep !== null ? Number(loenn.beloep) : null,
        harFlereVersjoner: harHistorikkPåNormallønn(historikk),
      }));

    const eldsteLoennsinntekt = eldsteVersjon.inntektListe.filter(
      (i) => i.type === "Loennsinntekt",
    );
    if (respons.length === 0 && eldsteLoennsinntekt.length > 0) {
      respons = [
        {
          arbeidsgiver,
          periode: historikk.maaned,
          arbeidsforhold: "",
          stillingsprosent: "",
          lønnstype: eldsteVersjon.inntektListe[0]?.type ?? null,
          antall: null,
          beløp: 0,
          harFlereVersjoner: true,
        },
      ];
    }
    return respons;
  });

  return {
    lønnsinntekt,
    næringsinntekt: [],
    pensjonEllerTrygd: [],
    ytelseFraOffentlige: [],
  };
}

// ---------------------------------------------------------------------------
// stønader (jf. YtelseService.kt)
// ---------------------------------------------------------------------------
function byggStønader() {
  const utbetalinger = readJson("utbetaling.json").data.utbetalinger ?? [];

  const grupper = new Map();
  for (const utbetaling of utbetalinger) {
    for (const ytelse of utbetaling.ytelseListe) {
      if (!ytelse.ytelsestype || ytelse.ytelsestype === "Feriepenger")
        continue;
      if (!grupper.has(ytelse.ytelsestype)) grupper.set(ytelse.ytelsestype, []);
      grupper.get(ytelse.ytelsestype).push({
        periode: {
          fom: ytelse.ytelsesperiode.fom,
          tom: ytelse.ytelsesperiode.tom,
        },
        beløp: Number(ytelse.ytelseNettobeloep),
        bruttoBeløp: Number(ytelse.ytelseskomponentersum),
        kilde: "SOKOS",
        info: ytelse.bilagsnummer ?? null,
      });
    }
  }

  return [...grupper.entries()].map(([stonadType, perioder]) => ({
    stonadType,
    perioder,
  }));
}

// ---------------------------------------------------------------------------
// meldekort (jf. MeldekortService.kt) — kun dagpenger1.json brukes, se
// plan.md: dagpenger2/3.json er byte-identiske duplikater av samme innhold.
// ---------------------------------------------------------------------------
function byggMeldekort() {
  const alleMeldekort = readJson("dagpenger1.json").data ?? [];

  return alleMeldekort
    .filter((m) => m.status === "Innsendt")
    .map((m) => ({
      dager: m.dager.map((dag) => ({
        dato: dag.dato,
        aktiviteter: dag.aktiviteter.map((a) => ({
          id: a.id,
          type: a.type,
          timer:
            a.timer !== null && a.timer !== undefined
              ? parseIso8601DurationTilDesimaltimer(a.timer)
              : null,
          dato: dag.dato,
        })),
        dagIndex: dag.dagIndex,
      })),
      id: m.id,
      periode: { fraOgMed: m.periode.fraOgMed, tilOgMed: m.periode.tilOgMed },
      opprettetAv: m.opprettetAv,
      migrert: false,
      kilde: { rolle: m.kilde.rolle, ident: m.kilde.ident },
      innsendtTidspunkt: m.innsendtTidspunkt,
      registrertArbeidssoker: m.registrertArbeidssoker,
      meldedato: m.meldedato,
    }));
}

// ---------------------------------------------------------------------------
// pensjonsgivendeInntekt (jf. pensjonsgivendeInntekt/Mapping.kt)
// ---------------------------------------------------------------------------
function byggPensjonsgivendeInntekt() {
  const responses = readJson("sigrun.json").map((r) => r.data);

  const perÅr = new Map();
  for (const r of responses) {
    if (!perÅr.has(r.inntektsaar)) perÅr.set(r.inntektsaar, []);
    perÅr.get(r.inntektsaar).push(...r.pensjonsgivendeInntekt);
  }

  return [...perÅr.entries()].map(([inntektsår, alleInntekter]) => ({
    inntektsår,
    lønnsinntekt: alleInntekter.reduce(
      (sum, i) =>
        sum +
        (i.pensjonsgivendeInntektAvLoennsinntekt ?? 0) +
        (i.pensjonsgivendeInntektAvLoennsinntektBarePensjonsdel ?? 0),
      0,
    ),
    næringsinntekt: alleInntekter.reduce(
      (sum, i) =>
        sum +
        (i.pensjonsgivendeInntektAvNaeringsinntekt ?? 0) +
        (i.pensjonsgivendeInntektAvNaeringsinntektFraFiskeFangstEllerFamiliebarnehage ??
          0),
      0,
    ),
  }));
}

// ---------------------------------------------------------------------------
// Sett sammen og skriv fil
// ---------------------------------------------------------------------------
const mockPerson = {
  utrekkstidspunkt: new Date().toISOString().replace("Z", "000000"),
  saksbehandlerIdent: "test-user",
  fødselsnummer: FNR,
  tilgang: {
    tilgang: "OK",
    harUtvidetTilgang: true,
  },
  personInformasjon: byggPersonInformasjon(),
  arbeidsgiverInformasjon: byggArbeidsgiverInformasjon(),
  inntektInformasjon: byggInntektInformasjon(),
  meldekort: byggMeldekort(),
  stønader: byggStønader(),
  pensjonsgivendeInntekt: byggPensjonsgivendeInntekt(),
};

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(mockPerson, null, 2) + "\n",
  "utf-8",
);
console.log(`Skrev mock-person til ${path.relative(ROOT, OUT_FILE)}`);
