// app/api/oppslag/route.ts
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fnr = searchParams.get("fnr");

    if (!fnr || fnr.length !== 11) {
        return new Response("Ugyldig fnr", { status: 400 });
    }

    // TODO: autentisering med TokenX/Azure + kall til ekte tjeneste

    return Response.json({
        fnr,
        navn: "Ola Nordmann",
        status: "Aktiv i NAV",
        mock: true,
    });
}
