import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .describe("The mode the app is running in"),
  ENVIRONMENT: z
    .enum(["local-backend", "local-dev", "local-mock", "demo", "dev", "prod"])
    .describe("The environment the app is running in"),
  CLUSTER: z.string().describe("The cluster the app is running in"),
  FARO_URL: z.string().describe("The URL of the Faro instance"),
  UMAMI_SITE_ID: z.string().describe("The ID of the Umami instance"),
  IDENT_SESSION_SECRET: z.string().describe("The secret for the ident session"),
  MODIA_URL: z.string().describe("The URL of the Modia instance"),
  DEVELOPMENT_OAUTH_TOKEN: z
    .string()
    .optional()
    .describe(
      "The OAuth token for the development environment. Is not set in production.",
    ),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("Missing or invalid environment variables", envResult.error);
  throw new Error(
    "Invalid environment variables. Check console for more information.",
  );
}

export const env = envResult.data;
export const BACKEND_API_URL =
  env.ENVIRONMENT === "local-backend"
    ? "http://localhost:8080"
    : env.ENVIRONMENT === "local-dev"
      ? "https://nav-persondata-api.intern.dev.nav.no"
      : "http://nav-persondata-api";

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";

export const skalBrukeMockdata =
  env.ENVIRONMENT === "local-mock" || env.ENVIRONMENT === "demo";
