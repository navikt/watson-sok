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
- `npm run dev:local` - Starter utviklingsserveren, men kjører mot lokal backend
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

### Kjøring mot lokal backend

For å kjøre mot lokal backend, må du gjøre et par ting:

1. Gå til https://azure-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp.holmes.nav-persondata-api og logg inn med en Trygdeetaten bruker.
2. Kopier "access_token"-tokenet og lim inn i .env-filen din. (Dette har en utløpsdato, så dette må du gjøre av og til)
3. Start backenden (se [backendens README](https://github.com/navikt/nav-persondata-api/blob/main/README.md) fil for hvordan man gjør det)
4. Start frontenden med `npm run dev:local`
5. Sett opp port forwarding til 7164 via `k9s`
6. Logg inn via `nais login` ([se her](https://doc.nais.io/operate/cli/how-to/install/) for hvordan du installerer nais-cli)
7. Installer k9s med `brew install k9s`
8. Kjør `kubectl use-context dev-gcp` ([se her](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/#install-with-homebrew-on-macos) for hvordan du setter opp `kubectl`)
9. Kjør `k9s`, trykk `ctrl+f` og endre porten til `7164`
10. Nå skal du kunne gjøre kall fra lokal frontend til lokal backend 🎉

## Deployment

Applikasjonen deployes automatisk til NAIS på GCP via GitHub Actions.

For deployment til dev-miljøet, kan du kjøre actionen [Deploy manuelt til dev](https://github.com/navikt/holmes-oppslag-bruker/actions/workflows/manual-deploy-to-dev.yml) med den branchen du ønsker å deploye. `main`-branchen deployes også til dev hver gang man merger en pull request til `main`.

For deployment til produksjon, lag en [ny release](https://github.com/navikt/holmes-oppslag-bruker/releases/new).

### Miljøer

- **Produksjon**: https://oppslag-bruker.intern.nav.no
- **Dev**: https://oppslag-bruker.intern.dev.nav.no
- **Utvikling**: Lokal utvikling på localhost:5173

For testbrukere i dev, sjekk [Confluence](https://confluence.adeo.no/spaces/THLMS/pages/675780711/Testmilj%C3%B8er).

## Lisens

Nav sin egen versjon av MIT. Se [LICENSE](LICENSE) filen for detaljer.
