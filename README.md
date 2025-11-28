# Watson Søk

En React Router-applikasjon for å søke opp brukere i Nav-systemet ved hjelp av fødselsnummer eller D-nummer.

<details>
<summary>TL;DR:</summary>

## Funksjonalitet

- Søk på brukere ved hjelp av fødselsnummer eller D-nummer
- Viser oversikt over brukerens forhold i Nav

## Teknisk stack

- **Frontend**: React Router v7 Framework Mode med React 19
- **Styling**: Tailwind CSS med Navs designsystem (Aksel)
- **Autentisering**: Azure AD via Oasis
- **Deployment**: NAIS på GCP

</details>

<details>
<summary>Kom i gang</summary>

## Forutsetninger

Du må ha nyeste LTS-versjonen av Node og NPM installert, i tillegg til browserne til `playwright` (for å kjøre tester).

```bash
brew install node # installerer node om du ikke har det allerede
npm i -g n # installerer en node version manager for deg
n lts # installerer nyeste LTS (long-term support)-versjon av Node og NPM
npx playwright install # installerer headless browsers for Playwright
```

For utvikling mot lokal backend trenger du også `gcloud` og `k9s`. Se utviklings-seksjonen for mer informasjon om hvordan det settes opp.

## Installasjon

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

## Tilgjengelige scripts

- `npm run dev` - Starter utviklingsserveren
- `npm run dev:local` - Starter utviklingsserveren, men kjører mot lokal backend
- `npm run build` - Bygger applikasjonen for produksjon
- `npm run start` - Starter produksjonsserveren
- `npm run test:e2e` – Kjører ende-til-ende tester
- `npm run lint` - Kjører ESLint
- `npm run typecheck` - Kjører TypeScript typesjekk
- `npm run prettier` - Sjekker Prettier formattering
- `npm run prettier:fix` - Fikser Prettier formattering
- `npm run unused` - Sjekker om du har ubrukt kode eller avhengigheter
- `npm run code-quality` – Kjører lint, typecheck, prettier og unused
</details>

<details>
<summary>Utvikling</summary>

## Kodekvalitet

Prosjektet bruker:

- **ESLint** for kodekvalitet
- **Prettier** for kodeformattering
- **TypeScript** for typesikkerhet
- **Knip** for sjekking av ubrukt kode og avhengigheter
- **Playwright** for å kjøre ende-til-ende tester

## Kjøring mot lokal backend

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

</details>

<details>
<summary>Deployment</summary>

Applikasjonen deployes automatisk til NAIS på GCP via GitHub Actions.

For deployment til dev-miljøet, kan du kjøre actionen [Deploy manuelt til dev](https://github.com/navikt/holmes-oppslag-bruker/actions/workflows/manual-deploy-to-dev.yml) med den branchen du ønsker å deploye. `main`-branchen deployes også til dev hver gang man merger en pull request til `main`.

For deployment til produksjon, lag en [ny release](https://github.com/navikt/holmes-oppslag-bruker/releases/new).

### Unleash

Teamet bruker [Unleash](https://docs.nais.io/services/feature-toggling/) for å styre feature toggling. Om du har tilgang, kan du se dashboardet [her](https://holmes-unleash-web.iap.nav.cloud.nais.io/projects/default?limit=25&favoritesFirst=true&sortBy=createdAt&sortOrder=desc). De kan slås av og på i dev og prod, og de kan også styres basert på Nav-identen til den påloggede brukeren.

Husk å fjerne lanserte feature-flagg så snart featuren er lansert (og man ikke ønsker å ha en av-bryter enkelt tilgjengelig).

#### API tokens

For at Unleash skal fungere, trengs det en egen `ApiToken`-ressurs i Nais, som må deployes på egenhånd hver gang applikasjonen settes opp fra bunnen av i nytt miljø.

For å deploye denne ressursen kan man kjøre [en egen GitHub action](https://github.com/navikt/holmes-oppslag-bruker/actions/workflows/deploy-unleash.yml), hvor man velger miljøet man ønsker å deploye til. Den trengs bare å deployes én gang hver gang applikasjonen settes opp fra bunnen av.

### Miljøer

- **Produksjon**: https://watson-sok.intern.nav.no
- **Dev**: https://watson-sok.intern.dev.nav.no
- **Demo**: https://watson-sok-demo.ekstern.dev.nav.no/
- **Utvikling**: Lokal utvikling på https://localhost:5173

For testbrukere i dev, sjekk [Confluence](https://confluence.adeo.no/spaces/THLMS/pages/675780711/Testmilj%C3%B8er).

</details>

<details>
<summary>Debugging</summary>

## 🐣 Legg til trace-logging for et gitt søk

Om du ønsker å legge til trace-logging for et gitt søk, legg til "?" etter personidenten du ønsker å søke på. Om du vanligvis vil søke på "12345612345", kan du da søke etter "12345612345?", og dette vil slå på trace-logging for det ene søket.

</details>

<details>
<summary>Kontakt, lisens og legal</summary>

### Kontakt

For spørsmål om tjenesten, koden eller annet, kontakt [#team-holmes](https://nav-it.slack.com/archives/C08CZLL2QKE) på Slack.

### Lisens

Nav sin egen versjon av MIT. Se [LICENSE](LICENSE) filen for detaljer.

### Bruk av AI til utvikling av kode

Teamet benytter seg av AI-tjenester for å utvikle koden i denne applikasjonen. All kode gjennomgås av teamet før det integreres i kodebasen.

</details>
