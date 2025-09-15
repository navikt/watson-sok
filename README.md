# Holmes Oppslag Bruker

En React Router-applikasjon for å søke opp brukere i Nav-systemet ved hjelp av fødselsnummer eller D-nummer.

## Funksjonalitet

- Søk på brukere ved hjelp av fødselsnummer eller D-nummer
- Viser oversikt over brukerens forhold i Nav

## Teknisk stack

- **Frontend**: React Router v7 Framework Mode med React 19
- **Styling**: Tailwind CSS med Navs designsystem (Aksel)
- **Autentisering**: Azure AD via Oasis
- **Deployment**: NAIS på GCP

## Kom i gang

### Forutsetninger

- Node.js 20 eller høyere
- npm

### Installasjon

1. Klon repositoriet:

```bash
git clone <repository-url>
cd holmes-oppslag-bruker
```

2. Installer avhengigheter:

```bash
npm install
```

3. Start utviklingsserveren:

```bash
npm run dev
```

4. Åpne [http://localhost:5173](http://localhost:5173) i nettleseren

### Tilgjengelige scripts

- `npm run dev` - Starter utviklingsserveren
- `npm run build` - Bygger applikasjonen for produksjon
- `npm run start` - Starter produksjonsserveren
- `npm run lint` - Kjører ESLint
- `npm run typecheck` - Kjører TypeScript typesjekk
- `npm run prettier` - Sjekker Prettier formattering
- `npm run prettier:fix` - Fikser Prettier formattering

## Utvikling

### Kodekvalitet

Prosjektet bruker:

- **ESLint** for kodekvalitet
- **Prettier** for kodeformattering
- **TypeScript** for typesikkerhet

## Deployment

Applikasjonen deployes automatisk til NAIS på GCP via GitHub Actions.

For deployment til dev-miljøet, kan du kjøre actionen [Deploy manuelt til dev](https://github.com/navikt/holmes-oppslag-bruker/actions/workflows/manual-deploy-to-dev.yml) med den branchen du ønsker å deploye.

For deployment til produksjon, lag en [ny release](https://github.com/navikt/holmes-oppslag-bruker/releases/new).

### Miljøer

- **Produksjon**: https://oppslag-bruker.intern.nav.no
- **Dev**: https://oppslag-bruker.intern.dev.nav.no
- **Utvikling**: Lokal utvikling på localhost:5173

For testbrukere i dev, sjekk [Confluence](https://confluence.adeo.no/spaces/THLMS/pages/675780711/Testmilj%C3%B8er).

## Lisens

Nav sin egen versjon av MIT. Se [LICENSE](LICENSE) filen for detaljer.
