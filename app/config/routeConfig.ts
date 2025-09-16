/**
 * This file contains all the routes for the app. It should be used whenever you
 * want to link to a route, or specify it in the routes.ts file
 */
export const RouteConfig = {
  INDEX: "/",
  OPPSLAG: {
    route: "/oppslag/:ident",
    link: (ident: string) => `/oppslag/${ident}`,
  },

  WELL_KNOWN: {
    SECURITY_TXT: "/.well-known/security.txt",
  },

  API: {
    HEALTH: "/api/health",
    OPPSLAG_DETALJER: "/api/oppslag/detaljer",
  },
};
