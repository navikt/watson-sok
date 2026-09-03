import fs from "node:fs";
import path from "node:path";

import { describe, it } from "vitest";

import { MockOppslagBrukerResponsSchema } from "./domene";

const MOCK_DIR = path.join(process.cwd(), "app", "test", "mocks");

const mockFiler = fs
  .readdirSync(MOCK_DIR)
  .filter((filnavn) => filnavn.endsWith(".json"));

describe("Alle mock-personer validerer mot MockOppslagBrukerResponsSchema", () => {
  it.each(mockFiler)("%s", (filnavn) => {
    const rawData = JSON.parse(
      fs.readFileSync(path.join(MOCK_DIR, filnavn), "utf-8"),
    );

    const result = MockOppslagBrukerResponsSchema.safeParse(rawData);

    if (!result.success) {
      throw new Error(`${filnavn} er ugyldig: ${result.error.message}`);
    }
  });
});
