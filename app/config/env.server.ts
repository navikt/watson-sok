import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .describe("The mode the app is running in"),
  CLUSTER: z.string().describe("The cluster the app is running in"),
  FARO_URL: z.string().describe("The URL of the Faro instance"),
  UMAMI_SITE_ID: z.string().describe("The ID of the Umami instance"),
  IDENT_SESSION_SECRET: z.string().describe("The secret for the ident session"),
  BACKEND_API_URL: z.string().describe("The URL of the backend API"),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("Missing or invalid environment variables", envResult.error);
  throw new Error(
    "Invalid environment variables. Check console for more information.",
  );
}

export const env = envResult.data;
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const isDev = env.NODE_ENV === "development";
export const shouldUseMockData =
  isDev && !env.BACKEND_API_URL.includes("localhost:8080");
