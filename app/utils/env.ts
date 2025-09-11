"use server";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .describe("The mode the app is running in"),
  NAV_PERSONDATA_API_URL: z.url().describe("The URL of the backend API"),
  NAV_PERSONDATA_API_CLUSTER: z
    .string()
    .describe("The cluster name of the backend API"),
  BASE_PATH: z.string().describe("The base path of the app"),
});

const envResultat = envSchema.safeParse(process.env);

if (!envResultat.success) {
  console.error("Missing or invalid environment variables", envResultat.error);
  throw new Error(
    "Invalid environment variables. Check console for more information."
  );
}

export const env = envResultat.data;
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const isDev = env.NODE_ENV === "development";
