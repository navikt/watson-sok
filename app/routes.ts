import {
  layout,
  route,
  type RouteConfig as RouteConfigType,
} from "@react-router/dev/routes";
import { RouteConfig } from "./config/routeConfig";

export default [
  // App routes
  layout("routes/layout.tsx", [
    route(RouteConfig.INDEX, "routes/index.tsx"),
    route(RouteConfig.OPPSLAG.route, "routes/oppslag/[ident]/index.tsx"),
  ]),

  // API routes
  route(RouteConfig.API.HEALTH, "routes/api/health/index.ts"),
  route(RouteConfig.API.LOGGED_IN_USER, "routes/api/logged-in-user/index.ts"),
  route(
    RouteConfig.API.OPPSLAG_DETALJER,
    "routes/api/oppslag/detaljer/index.ts",
  ),

  // Well-known routes
  route(
    RouteConfig.WELL_KNOWN.SECURITY_TXT,
    "routes/well-known/security.txt.ts",
  ),

  // Fallback 404 route
  route("*", "routes/404.tsx"),
] satisfies RouteConfigType;
