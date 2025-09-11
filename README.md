# Holmes Oppslag Bruker

En Next.js-applikasjon for å søke opp brukere i Nav-systemet ved hjelp av fødselsnummer eller D-nummer.

## Funksjonalitet

- Søk på brukere ved hjelp av fødselsnummer eller D-nummer
- Viser oversikt over brukerens forhold i Nav

## Teknisk stack

- **Frontend**: Next.js 15 med React 19
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

4. Åpne [http://localhost:3000](http://localhost:3000) i nettleseren

### Tilgjengelige scripts

- `npm run dev` - Starter utviklingsserveren
- `npm run build` - Bygger applikasjonen for produksjon
- `npm run start` - Starter produksjonsserveren
- `npm run lint` - Kjører ESLint
- `npm run typecheck` - Kjører TypeScript type-sjekk
- `npm run prettier` - Sjekker Prettier formatering
- `npm run prettier:fix` - Fikser Prettier formatering

## Utvikling

### Kodekvalitet

Prosjektet bruker:

- **ESLint** for kodekvalitet
- **Prettier** for kodeformatering
- **TypeScript** for type-sikkerhet

Alle endringer må passere:

- TypeScript type-sjekk
- ESLint sjekk
- Prettier formatering

## Deployment

Applikasjonen deployes automatisk til NAIS på GCP via GitHub Actions.

### Miljøer

- **Produksjon**: https://oppslag-bruker.intern.nav.no
- **Dev**: https://oppslag-bruker.intern.dev.nav.no
- **Utvikling**: Lokal utvikling på localhost:3000

## Lisens

Nav sin egen versjon av MIT. Se [LICENSE](LICENSE) filen for detaljer.
