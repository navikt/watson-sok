import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Heading, Link, Skeleton } from "@navikt/ds-react";

type PanelContainerProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  link?: {
    href: string;
    beskrivelse: string;
  };
  className?: string;
};

/**
 * Komponent som viser en panel med en border og padding
 */
export function PanelContainer({
  children,
  title,
  link,
  className = "",
}: PanelContainerProps) {
  return (
    <section
      className={`border border-ax-neutral-400 rounded-xl p-4 relative h-fit ${className}`}
    >
      {title && (
        <Heading level="2" size="medium" spacing>
          {title}
        </Heading>
      )}
      {link && (
        <div className="md:absolute top-4 right-4 mb-4">
          <Link href={link.href}>
            {link.beskrivelse}
            <ExternalLinkIcon aria-hidden="true" />
          </Link>
        </div>
      )}
      {children}
    </section>
  );
}
/** En skeleton-versjon av PanelContainer
 *
 * Fin å bruke når man venter på data
 **/
export function PanelContainerSkeleton({
  title,
  link,
  children,
}: PanelContainerProps) {
  return (
    <section
      className={`border-1 border-ax-neutral-400 rounded-xl p-4 relative h-fit`}
    >
      {title && (
        <Heading level="2" size="medium" spacing as={Skeleton}>
          {title}
        </Heading>
      )}
      {link && (
        <div className="md:absolute top-4 right-4 mb-4">
          <Link href={link.href} as={Skeleton}>
            {link.beskrivelse}
          </Link>
        </div>
      )}
      {children}
    </section>
  );
}
