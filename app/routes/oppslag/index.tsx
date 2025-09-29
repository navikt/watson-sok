import { Heading, HGrid, Skeleton } from "@navikt/ds-react";
import { use } from "react";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { ResolvingComponent } from "~/features/async/ResolvingComponent";
import { hentIdentFraSession } from "~/features/oppslag/oppslagSession.server";
import {
  ArbeidsforholdPanel,
  ArbeidsforholdPanelSkeleton,
} from "~/features/paneler/ArbeidsforholdPanel";
import {
  BrukerinformasjonPanel,
  BrukerinformasjonPanelSkeleton,
} from "~/features/paneler/BrukerinformasjonPanel";
import {
  InntektPanel,
  InntektPanelSkeleton,
} from "~/features/paneler/InntektPanel";
import {
  StønaderPanel,
  StønaderPanelSkeleton,
} from "~/features/paneler/StønaderPanel";
import { tilFulltNavn } from "~/utils/navn-utils";
import {
  hentArbeidsgivere,
  hentInntekter,
  hentPersonopplysninger,
  hentStønader,
} from "./api.server";
import type { PersonInformasjon } from "./schemas";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="mt-8 mb-4">
        <ResolvingComponent
          loadingFallback={
            <Heading level="1" size="large" as={Skeleton}>
              Navn Navnesen (xx)
            </Heading>
          }
          errorFallback={
            <Heading level="1" size="large">
              Feil ved henting av bruker
            </Heading>
          }
        >
          <OverskriftPanel promise={data.personopplysninger} />
        </ResolvingComponent>
      </div>
      <HGrid gap="space-24" columns={{ xs: 1, sm: 2, md: 2 }}>
        <ResolvingComponent
          loadingFallback={<BrukerinformasjonPanelSkeleton />}
        >
          <BrukerinformasjonPanel promise={data.personopplysninger} />
        </ResolvingComponent>
        <ResolvingComponent loadingFallback={<ArbeidsforholdPanelSkeleton />}>
          <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
        </ResolvingComponent>
      </HGrid>
      <ResolvingComponent loadingFallback={<StønaderPanelSkeleton />}>
        <StønaderPanel promise={data.stønader} />
      </ResolvingComponent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResolvingComponent loadingFallback={<InntektPanelSkeleton />}>
          <InntektPanel promise={data.inntektInformasjon} />
        </ResolvingComponent>
      </div>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const ident = await hentIdentFraSession(request);
  if (!ident) {
    return redirect(RouteConfig.INDEX);
  }

  // TODO: Sjekk om personen finnes / at man har tilgang til å se dem
  // gjennom et eget endepunkt, før resten returneres

  return {
    personopplysninger: hentPersonopplysninger(ident, request),
    arbeidsgiverInformasjon: hentArbeidsgivere(ident, request),
    inntektInformasjon: hentInntekter(ident, request),
    stønader: hentStønader(ident, request),
  };
}

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  if (!loaderData || "error" in loaderData) {
    return [];
  }
  return [
    {
      title: `Oppslag Bruker`,
    },
  ];
}

type OverskriftPanelProps = {
  promise: Promise<PersonInformasjon | null>;
};

const OverskriftPanel = ({ promise }: OverskriftPanelProps) => {
  const personopplysninger = use(promise);
  if (!personopplysninger) {
    return (
      <Heading level="1" size="large">
        Fant ikke bruker
      </Heading>
    );
  }
  return (
    <Heading level="1" size="large">
      {tilFulltNavn(personopplysninger.navn)} ({personopplysninger.alder})
    </Heading>
  );
};
