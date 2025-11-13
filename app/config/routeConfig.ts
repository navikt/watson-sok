/**
 * This file contains all the routes for the app. It should be used whenever you
 * want to link to a route, or specify it in the routes.ts file
 */
export const RouteConfig = {
  INDEX: "/",
  PERSONVERN: "/personvern",
  BEKREFT_BEGRUNNET_TILGANG: "/bekreft-begrunnet-tilgang",
  OPPSLAG: "/oppslag",

  WELL_KNOWN: {
    SECURITY_TXT: "/.well-known/security.txt",
  },

  API: {
    HEALTH: "/api/health",
    LOGGED_IN_USER: "/api/logged-in-user",
    THEME: "/api/theme",
  },
};
