import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type ResolvingComponentProps = {
  /** Fallback for loading */
  loadingFallback: React.ReactNode;
  /** Fallback for feil */
  errorFallback?: React.ReactNode;
  /** Det som "egentlig" skal rendres */
  children: React.ReactNode;
};

/** En komponent som rendrer en suspense-komponent med en error boundary */
export const ResolvingComponent = ({
  errorFallback = (
    <Alert variant="error" className="h-fit">
      <Heading level="2" size="small">
        Feil ved henting av informasjon
      </Heading>
      <BodyShort>
        Det oppstod en feil ved henting av informasjon. Vennligst prøv igjen
        senere.
      </BodyShort>
    </Alert>
  ),
  loadingFallback,
  children,
}: ResolvingComponentProps) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
