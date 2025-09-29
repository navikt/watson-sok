import fs from "fs/promises";
import path from "path";
import { OppslagBrukerResponsSchema } from "./schemas";

const MOCK_DIR = path.join(process.cwd(), "app", "routes", "oppslag", "mocks");

/**
 * Returnerer mock-data basert på fødselsnummer, eller en fallback-bruker om ingen mock matchet fødselsnummeret.
 *
 * Hvis mock-dataen ikke følger skjemaet, kastes en feil.
 */
export async function getMockedResponseByFødselsnummer(fødselsnummer: string) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000));

  if (!fødselsnummer?.trim()) {
    throw new Error("Fødselsnummer er påkrevd");
  }

  const sanitizedFødselsnummer = sanitizeFødselsnummer(fødselsnummer);
  const candidateFiles = [
    path.join(MOCK_DIR, `${sanitizedFødselsnummer}.json`),
    path.join(MOCK_DIR, `default.json`), // fallback
  ];

  for (const filePath of candidateFiles) {
    const rawData = await readMockFile(filePath);

    if (rawData === null) {
      continue; // File doesn't exist, try next
    }

    const parsedData = OppslagBrukerResponsSchema.safeParse(rawData);
    if (parsedData.success) {
      return parsedData.data;
    }

    // If we reach here, the file exists but data is invalid
    throw new Error(
      `Mock data i ${path.basename(filePath)} er ugyldig: ${parsedData.error.message}`,
    );
  }

  throw new Error(
    `Ingen mock funnet for ${fødselsnummer}, og ingen fallback funnet.`,
  );
}

function sanitizeFødselsnummer(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  return digits.slice(0, 11);
}

function isFileNotFoundError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function readMockFile(filePath: string): Promise<unknown> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return null; // File doesn't exist
    }
    throw error; // Re-throw other errors
  }
}
