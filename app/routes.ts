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
    route(RouteConfig.PERSONVERN, "routes/personvern.tsx"),
  ]),

  // API routes
  route(RouteConfig.API.HEALTH, "routes/api/health/index.ts"),
  route(RouteConfig.API.LOGGED_IN_USER, "routes/api/logged-in-user/index.ts"),
  route(RouteConfig.API.THEME, "routes/api/theme/index.ts"),
  route(RouteConfig.API.VERSION, "routes/api/version/index.ts"),

  // Well-known routes
  route(
    RouteConfig.WELL_KNOWN.SECURITY_TXT,
    "features/well-known/security.txt.tsx",
  ),

  // Fallback 404 route
  route("*", "features/feilhåndtering/404.route.tsx"),
] satisfies RouteConfigType;
