import {
  layout,
  route,
  type RouteConfig as RouteConfigType,
} from "@react-router/dev/routes";
import { RouteConfig } from "./config/routeConfig";

export default [
  // App routes
  layout("routes/layout/layout.tsx", [
    route(RouteConfig.INDEX, "routes/index.tsx"),
    route(RouteConfig.OPPSLAG, "routes/oppslag/index.tsx"),
    route(
      RouteConfig.BEKREFT_BEGRUNNET_TILGANG,
      "routes/oppslag/bekreft-begrunnet-tilgang.tsx",
    ),
    route(RouteConfig.PERSONVERN, "routes/personvern.tsx"),
  ]),

  // API routes
  route(RouteConfig.API.HEALTH, "routes/api/health/index.ts"),
  route(RouteConfig.API.LOGGED_IN_USER, "routes/api/logged-in-user/index.ts"),
  route(RouteConfig.API.THEME, "routes/api/theme/index.ts"),

  // Well-known routes
  route(
    RouteConfig.WELL_KNOWN.SECURITY_TXT,
    "routes/well-known/security.txt.ts",
  ),

  // Fallback 404 route
  route("*", "routes/404.tsx"),
] satisfies RouteConfigType;
