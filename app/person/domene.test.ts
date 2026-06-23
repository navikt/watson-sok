import { describe, expect, it } from "vitest";

import { PersonInformasjonSchema } from "./domene";

const basePerson = {
  navn: { fornavn: "Ola", mellomnavn: null, etternavn: "Nordmann" },
  aktørId: "12345678901",
  adresse: null,
  adressebeskyttelse: "UGRADERT" as const,
  statsborgerskap: ["NOR"],
  sivilstand: null,
  alder: 40,
  fødselsdato: "1984-01-01",
  dødsdato: null,
};

describe("PersonInformasjonSchema — familemedlemmer", () => {
  it("aksepterer ny array-struktur (feature-flagg PÅ)", () => {
    const data = {
      ...basePerson,
      familemedlemmer: [
        {
          ident: "11111111111",
          rolle: "BARN",
          fornavn: "Liten",
          mellomnavn: null,
          etternavn: "Nordmann",
          fødselsdato: "2010-06-01",
          adressebeskyttelse: "UGRADERT",
        },
      ],
    };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const familemedlemmer = result.data.familemedlemmer;
    expect(Array.isArray(familemedlemmer)).toBe(true);
    const liste = familemedlemmer as Array<{ ident: string; rolle: string }>;
    expect(liste[0].ident).toBe("11111111111");
    expect(liste[0].rolle).toBe("BARN");
  });

  it("aksepterer gammel Record-struktur (feature-flagg AV)", () => {
    const data = {
      ...basePerson,
      familemedlemmer: {
        "11111111111": "BARN",
        "22222222222": "GIFT",
      },
    };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const familemedlemmer = result.data.familemedlemmer;
    expect(Array.isArray(familemedlemmer)).toBe(false);
    const record = familemedlemmer as Record<string, string>;
    expect(record["11111111111"]).toBe("BARN");
    expect(record["22222222222"]).toBe("GIFT");
  });

  it("array-format: ukjent rolle får 'Ukjent' via .catch()", () => {
    const data = {
      ...basePerson,
      familemedlemmer: [{ ident: "11111111111", rolle: "UKJENT_ROLLE" }],
    };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const liste = result.data.familemedlemmer as Array<{
      ident: string;
      rolle: string;
    }>;
    expect(liste[0].rolle).toBe("Ukjent");
  });

  it("array-format: ukjent adressebeskyttelse får 'UGRADERT' via .catch()", () => {
    const data = {
      ...basePerson,
      familemedlemmer: [
        {
          ident: "11111111111",
          rolle: "BARN",
          adressebeskyttelse: "HEMMELIG_UKJENT_GRADERING",
        },
      ],
    };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const liste = result.data.familemedlemmer as Array<{
      adressebeskyttelse?: string | null;
    }>;
    expect(liste[0].adressebeskyttelse).toBe("UGRADERT");
  });

  it("tom liste godkjennes som ny array-struktur", () => {
    const data = { ...basePerson, familemedlemmer: [] };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("tomt objekt godkjennes som gammel Record-struktur", () => {
    const data = { ...basePerson, familemedlemmer: {} };

    const result = PersonInformasjonSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
