// lib/getMockedResponse.ts (server-side util)
import { OppslagBrukerRespons } from "@/app/types/Domain";
import fs from "fs/promises";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), "mocks", "oppslag");

function sanitizeFnr(input: string) {
  // behold kun 0-9 og begrens til 11 tegn
  const digits = (input || "").replace(/\D/g, "");
  return digits.slice(0, 11);
}

export async function getMockedResponseByFnr(fnr: string): Promise<Response> {
  const safeFnr = sanitizeFnr(fnr);
  const candidateFiles = [
    path.join(MOCK_DIR, `${safeFnr}.json`),
    path.join(MOCK_DIR, `default.json`), // fallback
  ];

  for (const file of candidateFiles) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const data = JSON.parse(raw) as OppslagBrukerRespons;
      return Response.json(data, { status: 200 });
    } catch (err: unknown) {
      // prøv neste kandidat ved ENOENT, ellers kast videre
      if (
        err instanceof Error &&
        (err as NodeJS.ErrnoException).code !== "ENOENT"
      ) {
        return new Response(
          JSON.stringify({
            error: `Kunne ikke lese mock: ${err.message ?? "ukjent feil"}`,
          }),
          { status: 500, headers: { "content-type": "application/json" } },
        );
      }
    }
  }

  return new Response(JSON.stringify({ error: "Ingen mock funnet." }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}
