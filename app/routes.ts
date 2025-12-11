import {
  layout,
  route,
  type RouteConfig as RouteConfigType,
} from "@react-router/dev/routes";
import { RouteConfig } from "./config/routeConfig";

export default [
  // App routes
  layout("features/layout/AppLayout.tsx", [
    route(RouteConfig.INDEX, "features/søk/Søkeside.route.tsx"),
    route(RouteConfig.OPPSLAG, "routes/oppslag/index.tsx"),
    route(
      RouteConfig.TILGANG,
      "features/begrunnet-tilgang/TilgangSide.route.tsx",
    ),
    route(
      RouteConfig.PERSONVERN,
      "features/personvern/PersonvernSide.route.tsx",
    ),
  ]),

  // API routes
  route(RouteConfig.API.HEALTH, "features/monitorering/helsesjekk/api.ts"),
  route(
    RouteConfig.API.LOGGED_IN_USER,
    "features/admin/innlogget-bruker/api.ts",
  ),
  route(RouteConfig.API.THEME, "features/tema/api.ts"),
  route(RouteConfig.API.VERSION, "features/versjonsvarsling/api.ts"),

  // Well-known routes
  route(
    RouteConfig.WELL_KNOWN.SECURITY_TXT,
    "features/well-known/security.txt.tsx",
  ),

  // Fallback 404 route
  route("*", "features/feilhåndtering/404.route.tsx"),
] satisfies RouteConfigType;
