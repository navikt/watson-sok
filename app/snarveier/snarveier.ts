type Kategori = "paneler" | "handlinger" | "navigering";

type SnarveierKonfigurasjon = {
  /** Tastekombinasjon for react-hotkeys-hook (f.eks. "alt+1") */
  tast: string;
  /** Visningsvennlig tast-label (f.eks. "Alt + 1") */
  tastLabel: string;
  /** Kort beskrivelse av hva snarveien gjør */
  beskrivelse: string;
  /** Kategori for gruppering i hjelp-modal */
  kategori: Kategori;
  /** Verdi for aria-keyshortcuts-attributtet */
  ariaKeyShortcuts?: string;
};

/** ID-er for paneler og elementer som kan navigeres til */
export const PanelId = {
  BRUKERINFORMASJON: "panel-brukerinformasjon",
  YTELSER: "panel-ytelser",
  ARBEIDSFORHOLD: "panel-arbeidsforhold",
  INNTEKT: "panel-inntekt",
  INNTEKT_OG_YTELSE_OVERLAPP: "panel-inntekt-og-ytelse-overlapp",
  INNTEKTSOPPSUMMERING: "panel-inntektsoppsummering",
  TIDSVINDU: "tidsvindu-velger",
} as const;

export const SNARVEIER: Record<string, SnarveierKonfigurasjon> = {
  "alt+1": {
    tast: "alt+1",
    tastLabel: "Alt + 1",
    beskrivelse: "Gå til Brukerinformasjon",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+1",
  },
  "alt+2": {
    tast: "alt+2",
    tastLabel: "Alt + 2",
    beskrivelse: "Gå til Ytelser fra Nav",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+2",
  },
  "alt+3": {
    tast: "alt+3",
    tastLabel: "Alt + 3",
    beskrivelse: "Gå til Inntekt/Ytelse-overlapp",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+3",
  },
  "alt+4": {
    tast: "alt+4",
    tastLabel: "Alt + 4",
    beskrivelse: "Gå til Arbeidsforhold",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+4",
  },
  "alt+5": {
    tast: "alt+5",
    tastLabel: "Alt + 5",
    beskrivelse: "Gå til Inntekt",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+5",
  },
  "alt+6": {
    tast: "alt+6",
    tastLabel: "Alt + 6",
    beskrivelse: "Gå til Inntektsoppsummering",
    kategori: "paneler",
    ariaKeyShortcuts: "Alt+6",
  },
  "alt+k": {
    tast: "alt+k",
    tastLabel: "Alt + K",
    beskrivelse: "Fokuser søkefeltet",
    kategori: "handlinger",
  },
  "alt+f": {
    tast: "alt+f",
    tastLabel: "Alt + F",
    beskrivelse: "Åpne familiemedlemmer",
    kategori: "handlinger",
    ariaKeyShortcuts: "Alt+F",
  },
  "alt+t": {
    tast: "alt+t",
    tastLabel: "Alt + T",
    beskrivelse: "Fokuser tidsvindu-velger",
    kategori: "handlinger",
    ariaKeyShortcuts: "Alt+T",
  },
  "alt+left": {
    tast: "alt+left",
    tastLabel: "Alt + ←",
    beskrivelse: "Forrige periode i ytelsesgrafen",
    kategori: "navigering",
  },
  "alt+right": {
    tast: "alt+right",
    tastLabel: "Alt + →",
    beskrivelse: "Neste periode i ytelsesgrafen",
    kategori: "navigering",
  },
  "?": {
    tast: "?",
    tastLabel: "?",
    beskrivelse: "Vis tastatursnarveier",
    kategori: "handlinger",
  },
} as const;

/** Henter snarveier gruppert etter kategori */
export function hentSnarveierGruppert(): Record<
  Kategori,
  SnarveierKonfigurasjon[]
> {
  const gruppert: Record<Kategori, SnarveierKonfigurasjon[]> = {
    paneler: [],
    handlinger: [],
    navigering: [],
  };

  for (const snarvei of Object.values(SNARVEIER)) {
    gruppert[snarvei.kategori].push(snarvei);
  }

  return gruppert;
}

/** Mapper kategori-nøkkel til norsk visningsnavn */
export function kategoriTilNavn(kategori: Kategori): string {
  switch (kategori) {
    case "paneler":
      return "Paneler";
    case "handlinger":
      return "Handlinger";
    case "navigering":
      return "Navigering";
  }
}
