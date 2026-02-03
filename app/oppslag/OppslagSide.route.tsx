import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { Page, PageBlock } from "@navikt/ds-react/Page";
import { useLoaderData } from "react-router";
import { ArbeidsforholdPanel } from "~/arbeidsforhold/ArbeidsforholdPanel";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { InntektOgYtelseOverlappPanel } from "~/inntekt-og-ytelse/inntekt-og-ytelse-overlapp-panel/InntektOgYtelseOverlappPanel";
import { InntektPanel } from "~/inntekt-og-ytelse/inntekt/InntektPanel";
import { InntektsoppsummeringPanel } from "~/inntekt-og-ytelse/inntekt/InntektsoppsummeringPanel";
import { YtelserPanel } from "~/inntekt-og-ytelse/ytelse/YtelserPanel";
import { MeldekortPanel } from "~/meldekort/MeldekortPanel";
import { OverskriftPanel } from "~/person/OverskriftPanel";
import { PersonopplysningerPanel } from "~/person/PersonopplysningerPanel";
import { TidsvinduProvider, TidsvinduVelger } from "~/tidsvindu/Tidsvindu";
import { oppslagLoader } from "./loader.server";
import { oppslagMeta } from "./meta";

export const loader = oppslagLoader;
export const meta = oppslagMeta;

export default function OppslagBrukerSide() {
  const data = useLoaderData<typeof oppslagLoader>();
  const visInntektsoppsummeringPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKTSOPPSUMMERING_PANEL,
  );
  const visInntektOgYtelseOverlappPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKT_OG_YTELSE_OVERLAPP_PANEL,
  );
  const visMeldekortPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.VIS_MELDEKORT_PANEL,
  );
  return (
    <TidsvinduProvider>
      <Page>
        <PageBlock className="flex flex-col gap-4 mt-8 px-4">
          <OverskriftPanel promise={data.personopplysninger} />
          <div className="sticky top-4 z-20 self-end -mt-13">
            <TidsvinduVelger />
          </div>
          {data.erBegrensetTilgang && (
            <Alert variant="info" className="w-fit mb-4">
              <Heading level="2" size="small" spacing>
                Begrenset tilgang
              </Heading>
              <BodyShort spacing>
                Du har kun tilgang til å se deler av informasjonen for denne
                brukeren. Det kan være fordi personen er skjermet, bor på
                fortrolig adresse eller andre grunner. Ta kontakt med nærmeste
                leder om du har behov for å se mer informasjon.
              </BodyShort>
            </Alert>
          )}
          <PersonopplysningerPanel promise={data.personopplysninger} />
          <YtelserPanel promise={data.ytelser} />
          {visInntektOgYtelseOverlappPanel ? (
            <div className="grid grid-cols-1 min-[1800px]:grid-cols-2 gap-4">
              <InntektOgYtelseOverlappPanel
                inntektPromise={data.inntektInformasjon}
                ytelserPromise={data.ytelser}
              />
              <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
            </div>
          ) : (
            <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
          )}

          <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
            <InntektPanel
              promise={data.inntektInformasjon}
              ytelserPromise={data.ytelser}
            />

            {visInntektsoppsummeringPanel && (
              <InntektsoppsummeringPanel promise={data.inntektInformasjon} />
            )}

            {visMeldekortPanel && <MeldekortPanel promise={data.meldekort} />}
          </div>
        </PageBlock>
      </Page>
    </TidsvinduProvider>
  );
}
