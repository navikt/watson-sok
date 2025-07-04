// app/api/oppslag/detaljer/route.ts
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fnr = searchParams.get("fnr");

    if (!fnr) {
        return new Response("fnr mangler", { status: 400 });
    }

    return Response.json({
        fnr,
        arbeidsgivere: [
            { navn: "NAV", stilling: "Veileder", aktiv: true },
            { navn: "Ekstern", stilling: "Konsulent", aktiv: false },
        ],
        sistOppdatert: new Date().toISOString(),
    });
}
