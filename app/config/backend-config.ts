const miljøVerdier = [
  "local-backend",
  "local-dev",
  "local-mock",
  "demo",
  "dev",
  "prod",
] as const;

type Miljø = (typeof miljøVerdier)[number];

const WATSON_SAK_LOKAL_URL = "http://localhost:5174";

const WATSON_SAK_URLER: Record<
  Exclude<Miljø, "local-backend" | "local-dev" | "local-mock">,
  string
> = {
  demo: "https://watson-sak-demo.ekstern.dev.nav.no",
  dev: "https://watson-sak.intern.dev.nav.no",
  prod: "https://watson-sak.intern.nav.no",
};

export function hentWatsonSakUrl(miljø?: Miljø) {
  if (!miljø) return undefined;

  if (
    miljø === "local-backend" ||
    miljø === "local-dev" ||
    miljø === "local-mock"
  ) {
    return WATSON_SAK_LOKAL_URL;
  }

  return WATSON_SAK_URLER[miljø];
}
