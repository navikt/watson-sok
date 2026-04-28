import {
  FARO_CSP_SOURCE,
  isProd,
  SPORING_CSP_SOURCE,
} from "~/config/env.server";

export function sikkerhetHeaders() {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' https://cdn.nav.no 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: cdn.nav.no; " +
      `connect-src 'self' ${FARO_CSP_SOURCE} ${SPORING_CSP_SOURCE}${isProd ? "" : " ws://localhost:4206"}; ` +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  };
}
