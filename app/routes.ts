import {
  layout,
  route,
  type RouteConfig as RouteConfigType,
} from "@react-router/dev/routes";
import { RouteConfig } from "./routeConfig";

export default [
  // App routes
  layout("layout/AppLayout.tsx", [
    route(RouteConfig.INDEX, "søk/Søkeside.route.tsx"),
    route(RouteConfig.OPPSLAG, "oppslag/OppslagSide.route.tsx"),
    route(RouteConfig.TILGANG, "begrunnet-tilgang/TilgangSide.route.tsx"),
    route(RouteConfig.PERSONVERN, "personvern/PersonvernSide.route.tsx"),
  ]),

  // API routes
  route(RouteConfig.API.HEALTH, "monitorering/helsesjekk/api.route.ts"),
  route(RouteConfig.API.LOGGED_IN_USER, "admin/innlogget-bruker/api.route.ts"),
  route(RouteConfig.API.MELDEKORT, "meldekort/api.route.ts"),
  route(RouteConfig.API.THEME, "tema/api.route.ts"),
  route(RouteConfig.API.VERSION, "versjonsvarsling/api.route.ts"),

  // Well-known routes
  route(
    RouteConfig.WELL_KNOWN.SECURITY_TXT,
    "sikkerhet/well-known/api.route.ts",
  ),

  // Fallback 404 route
  route("*", "feilhåndtering/404.route.tsx"),
] satisfies RouteConfigType;
