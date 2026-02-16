# Repository Guidelines

Kort veiledning for bidragsytere til Holmes oppslag-bruker. Hold koden enkel, domeneorientert og sikker.

## Prosjektstruktur og moduler

- Kildekode: `app/` med feature-pakking (f.eks. `features/oppslag`, `features/person`, `features/inntekt-og-ytelse`, `features/arbeidsforhold`) og tverrgående (`features/auth`, `features/tema`, `features/layout`, `features/monitorering`).
- Ruter: `app/**/*.route.ts(x)` er selve routes. Alle ruter er spesifisert i `app/routes.ts`.
- Mocks/fixtures: samle i `features/testing` når felles testdata trengs.
- Statiske ressurser: `public/`. Globale stiler: `app/globals.css`.

## Bygg, test og utvikling

- `npm run dev` / `npm run dev:local` – utviklingsserver (lokal backend med `dev:local`).
- `npm run build` → prod-build, `npm run start` → kjør build.
- `npm run typecheck` – React Router typegen + `tsc`.
- `npm run lint` / `npm run lint:fix` – ESLint.
- `npm run prettier` / `npm run prettier:fix` – formattering.
- `npm run unused` – knip for ubrukte filer/imports.
- `npm run code-quality` – samlet sjekk (lint + prettier + typecheck + unused).
- `npm run test:e2e` (`:headed`/`:ui` for debugging) – Playwright e2e.

## Koding og navngiving

- TypeScript strict; React 19 + React Router v7.
- Skriv på norsk; velg åpenbare løsninger fremfor smarte triks.
- Legg utils nær feature; bruk `features/common` kun for genuint delte helpers. Sti-alias `~/*` peker til `app/*`.
- Følg Prettier/ESLint; ingen manuell linjeformattering. Prettier-configen er standard (ingen overrides), som betyr:
  - Doble anførselstegn (`"`) — ikke enkle.
  - Semikolon etter alle statements.
  - Trailing commas overalt (`all`).
  - Maks 80 tegn linjebredde.
  - 2 spaces innrykk.
  - Parenteser rundt eneste arrow function-parameter: `(x) => x`.
- A11y som default: riktige labels, fokusrekkefølge, ARIA der nødvendig.

## Testing

- Plasser både enhetstester (`*.test.tsx`) og ende-til-ende-tester (`*.spec.ts`) ved siden av koden de tester under `app`.
- Navngiv e2e-filer etter brukerflyt (f.eks. `sok-oppslag.spec.ts`).
- Kjør tester og øvrige kvalitetssjekker via `npm run verify` (samlet sjekk: enhetstester, lint, typecheck, unused, osv.) eller `npm run test:e2e` (for e2e); ikke kjør individuelle testkommandoer direkte.

## Sikkerhet og konfig

- Behold sikkerhetsheadere i `features/sikkerhet/headers.server.ts`; ikke svekk CSP uten vurdering.
- Hemmeligheter i `.env` (se `.env.example`); aldri committ secrets.
- Bruk auth-hjelpere i `features/auth` for tokenhåndtering/obo.

## Ferdig er ferdig (Definition of Done)

- Kjør `npm run verify` før en oppgave anses som ferdig. Bruk alltid denne kommandoen for å validere endringer – ikke kjør individuelle steg (typecheck, lint osv.) separat.
- Skriv tester for ny funksjonalitet (enhetstester og/eller e2e etter behov).
- Følg TDD der det gir mening: skriv en feilende test først (rød), implementer (grønn), refaktorer.

## Andre retningslinjer

- Om du må gjøre større antakelser for å gjennomføre en oppgave, stopp og spør om avklaringer.
- Foretrekk alltid komponenter fra `@navikt/ds-react` for å lage konsistente brukeropplevelser.
- Importer sub-komponenter fra egne entry points i `@navikt/ds-react`, f.eks. `import { AccordionItem, AccordionHeader, AccordionContent } from "@navikt/ds-react/Accordion"` – ikke bruk dot-notation (`Accordion.Item`).
- Unngå å legge til nye dependencies uten god grunn; begrunn alltid hvorfor før du går videre.
- Hold filer og komponenter så enkle som mulig:
  - om en komponent blir for stor, vurder å dele den opp.
  - om en fil blir for lang, vurder å splitte den opp i mindre deler.
- Dokumenter eksporterte funksjoner og komponenter med JSDoc-kommentarer for å forklare formål og bruk.
