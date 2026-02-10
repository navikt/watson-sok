import { createCookie } from "react-router";
import z from "zod";

export const preferanserCookie = createCookie("preferanser", {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
});

const themeSchema = z.enum(["light", "dark"]);
export type Theme = z.infer<typeof themeSchema>;

const grafVisningSchema = z.enum(["linje", "stolpe"]);
export type GrafVisning = z.infer<typeof grafVisningSchema>;

const preferanserSchema = z.object({
  theme: themeSchema,
  grafVisning: grafVisningSchema,
});
export type Preferanser = z.infer<typeof preferanserSchema>;

export const defaultPreferanser: Preferanser = {
  theme: "light",
  grafVisning: "linje",
};

/** Parser cookie-verdien og returnerer gyldige preferanser med defaults for manglende/ugyldige felter. */
export function parsePreferanser(value: unknown): Preferanser {
  if (!value || typeof value !== "object") {
    return defaultPreferanser;
  }
  const parsed = preferanserSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return defaultPreferanser;
}
