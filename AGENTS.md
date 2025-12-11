# Repository Guidelines

Kort innføring for nye bidragsytere til Holmes oppslag-bruker. Hold koden enkel, lesbar og i tråd med domenepakkingen.

## Prosjektstruktur og moduler

- Kildekode ligger under `app/` med feature-pakking: f.eks. `app/oppslag`, `app/person`, `app/inntekt-og-ytelse`, `app/arbeidsforhold`.
- Tverrgående funksjonalitet bor i egne mapper (`auth`, `tema`, `monitorering`, `layout`, `feature-toggling`).
- `app/routes/*` er tynne shells som re-eksporterer fra
- Tester: e2e ligger i `e2e/` (Playwright). Delte mocks/fixtures kan samles i `testing` (opprett ved behov).
- Statiske ressurser: `public/`; globale stiler: `app/globals.css`.

## Bygg, test og utvikling

- `npm run dev` – lokal utvikling (localhost:5173).
- `npm run dev:local` – dev-server med lokal backend.
- `npm run build` / `npm run start` – prod-build og server.
- `npm run typecheck` – React Router typegen + `tsc`.
- `npm run lint` / `npm run lint:fix` – ESLint.
- `npm run prettier` / `npm run prettier:fix` – formattering.
- `npm run unused` – knip, finner døde imports/filer.
- `npm run code-quality` – kjører lint + prettier + typecheck + unused.
- `npm run test:e2e` – Playwright e2e (bruk `:headed` eller `:ui` for debugging).

## Koding og navngiving

- TypeScript i strict-modus; React 19 + React Router v7.
- Følg feature-pakking: legg utils og komponenter nær domenet sitt; bruk `common` kun for ekte delte helpers.
- Sti-alias `~/*` peker til `app/*`.
- Bruk Prettier og ESLint default; ingen manuell formatjustering.
- Kommentarer/tekster i koden på norsk. Skriv åpenbare løsninger, ikke smart kode.
- Bruk tilgjengelighet (a11y) konsekvent: korrekte labels, fokusrekkefølge, ARIA der det trengs.

## Testing

- Navngiv Playwright-scenarier etter brukerflyter (f.eks. `søk-oppslag.spec.ts`).
- Kjør minst `npm run lint` og `npm run typecheck` før PR; `test:e2e` ved endringer i flyt/UX.

## Commits og pull requests

- Commits: korte, imperativt formulerte meldinger som beskriver endringen (`Flytt oppslag-API til featurepakke`).
- PR-er bør inkludere: kort beskrivelse av hva/hvorfor, relevante issues/lenker, risikovurdering, og skjermbilder/GIF ved UI-endringer.
- Unngå store “grab bag”-PR-er; hold scope per feature/endomene.

## Sikkerhet og konfig

- Følg eksisterende sikkerhetsheadere (`sikkerhet/headers.server.ts`); ikke svekk CSP uten vurdering.
- Secrets i `.env` (se `.env.example`); aldri commit hemmeligheter.
- OBO-token og innloggingsflyt håndteres via `auth`; gjenbruk helperne, ikke rull egen auth.
