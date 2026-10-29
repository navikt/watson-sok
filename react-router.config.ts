import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // Nais-ingressen terminerer TLS, så serveren ser `http` mens nettleserens
  // Origin-header er `https`. Fra react-router 8.5 sammenlignes hele origin i
  // CSRF-sjekken, og alle actions avvises med 400 uten denne listen.
  // Hold listen i synk med INGRESS_URLS i .nais/*.json og .nais/demo.yml.
  allowedActionOrigins: [
    "watson-sok.ansatt.nav.no",
    "watson-sok.intern.nav.no",
    "watson-sok.ansatt.dev.nav.no",
    "watson-sok.intern.dev.nav.no",
    "watson-sok-demo.ekstern.dev.nav.no",
  ],
} satisfies Config;
