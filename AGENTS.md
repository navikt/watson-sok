# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Watson Søk is a React Router v7 application for looking up users in the Norwegian Nav system using fødselsnummer (national ID) or D-nummer. The application displays comprehensive user information including personal details, employment relationships, income, and benefits (ytelser).

## Tech Stack

- **Framework**: React Router v7 (Framework Mode) with React 19
- **Styling**: Tailwind CSS v4 with Nav's design system (Aksel)
- **Authentication**: Azure AD via @navikt/oasis
- **Validation**: Zod schemas
- **Observability**: Grafana Faro
- **Deployment**: NAIS on GCP

## FOLLOW THESE RULES

- Write obvious code, not clever code
- When implementing a new function, make sure to add elaborate jsdoc comments with at least one example.
- Package new files by feature in the `features` folder
- Write all code and comments in Norwegian
- Ensure that the code you implement is accessible (a11y)
- Ensure that you don't introduce any security concerns
- Ask me clarifying questions until you're 95% confident you can complete the task successfully.

## Development Commands

```bash
# Start development server (localhost:5173)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run prettier
npm run prettier:fix
```

## Architecture Overview

### Route Structure

Routes are defined in `app/routes.ts` using React Router v7's file-based routing convention. The main routes are:

- **Layout routes**: Wrapped in `routes/layout/layout.tsx` (includes header/footer)
  - `/` - Landing page with search form
  - `/oppslag` - User lookup results page
  - `/personvern` - Privacy policy page

- **API routes**: Server-only routes for internal APIs
  - `/api/health` - Health check endpoint
  - `/api/logged-in-user` - Returns current logged-in user info
  - `/api/theme` - Theme management

- **Well-known routes**: Standard metadata endpoints
  - `/.well-known/security.txt`

Route paths are defined as constants in `app/config/routeConfig.ts` and should be used throughout the codebase instead of hardcoded strings.

### Authentication & Authorization Flow

Authentication is handled via Azure AD through the @navikt/oasis library in `app/utils/access-token.ts`:

1. The `getLoggedInUser()` function validates the user's Azure AD token
2. For API calls to `nav-persondata-api`, an On-Behalf-Of (OBO) token is requested via `getnavpersondataapiOboToken()`
3. In non-production environments, mock tokens and users are returned
4. Invalid or missing tokens redirect to `/oauth2/login`

### Data Fetching Pattern

The application uses a consistent pattern for fetching user data from the backend API (`nav-persondata-api`):

1. **Session Management**: User identifiers (fødselsnummer) are stored in encrypted session cookies via `app/features/oppslag/oppslagSession.server.tsx`

2. **API Abstraction**: All API calls go through `app/routes/oppslag/api.server.ts`, which provides:
   - `sjekkEksistensOgTilgang()` - Validates access before fetching data
   - `hentPersonopplysninger()` - Personal information
   - `hentArbeidsforhold()` - Employment relationships
   - `hentInntekter()` - Income data
   - `hentYtelser()` - Benefits/welfare data

3. **Mock Data**: In development, mock data is served from `app/routes/oppslag/mock.server.ts` instead of hitting real APIs

4. **Schema Validation**: All API responses are validated using Zod schemas defined in `app/routes/oppslag/schemas.ts`

### Async Rendering Pattern

The application uses React 19's Suspense with async components for progressive data loading:

1. **Loader Returns Promises**: Route loaders return unwrapped promises (not awaited)
2. **ResolvingComponent**: Wraps async components with Suspense + ErrorBoundary (`app/features/async/ResolvingComponent.tsx`)
3. **Progressive Loading**: Each panel can load independently with its own loading/error states

Example from `app/routes/oppslag/index.tsx`:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const ident = await hentIdentFraSession(request);

  return {
    // These promises are NOT awaited - they're passed to components
    personopplysninger: hentPersonopplysninger(ident, request),
    arbeidsgiverInformasjon: hentArbeidsforhold(ident, request),
    inntektInformasjon: hentInntekter(ident, request),
    ytelser: hentYtelser(ident, request),
  };
}
```

### Panel Components

User data is displayed in modular panel components located in `app/features/paneler/`:

- `OverskriftPanel.tsx` - Header with user name
- `BrukerinformasjonPanel.tsx` - Personal information (address, age, family)
- `ArbeidsforholdPanel.tsx` - Employment relationships
- `InntektPanel.tsx` - Income information
- `YtelserPanel.tsx` - Benefits and welfare payments

Each panel receives a promise as a prop and uses `ResolvingComponent` to handle loading/error states.

### Utilities

The `app/utils/` directory contains helper functions:

- `access-token.ts` - Token validation and OBO token exchange
- `date-utils.ts` - Date formatting utilities
- `adresse-utils.ts` - Address formatting (Norwegian/foreign addresses)
- `navn-utils.ts` - Name formatting utilities
- `number-utils.ts` - Number formatting utilities
- `observability.ts` - Faro initialization for monitoring
- `analytics.tsx` - Analytics wrapper component

### Environment Configuration

Environment variables are validated using Zod in `app/config/env.server.ts`. Required variables:

- `NODE_ENV` - Environment mode (development/test/production)
- `CLUSTER` - GCP cluster name
- `FARO_URL` - Grafana Faro monitoring URL
- `IDENT_SESSION_SECRET` - Secret for encrypting session cookies

See `.env.example` for the full list.

### Security Headers

Security headers are configured in `app/root.tsx` in the `headers()` export, including:

- Content Security Policy (CSP)
- X-Frame-Options (DENY)
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options (nosniff)

### Theme Management

Dark/light mode is managed via:

- `app/features/darkside/ThemeCookie.tsx` - Cookie-based theme persistence
- `app/features/darkside/ThemeContext.tsx` - React context for theme state

## Type Safety

- TypeScript strict mode is enabled
- Route types are generated automatically by React Router (in `.react-router/types/`)
- All API responses are validated with Zod schemas
- The `~/*` path alias maps to `app/*` (configured in `tsconfig.json`)

## Deployment

- **Development**: Automatic deployment to https://watson-sok.intern.dev.nav.no on every merge to `main`
- **Production**: Create a new GitHub release to deploy to https://watson-sok.intern.nav.no
- **Manual Dev Deploy**: Use the "Deploy manuelt til dev" GitHub Action with any branch

NAIS configuration is in `.nais/nais.yml` with environment-specific values in `.nais/dev.json` and `.nais/prod.json`.

## Testing Users

Test users for the dev environment are documented in Nav's internal Confluence space: `THLMS > Testmiljøer`.
