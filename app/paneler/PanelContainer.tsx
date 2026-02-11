import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Heading, Link, Skeleton, Tag, Tooltip } from "@navikt/ds-react";
import { Feedback } from "./feedback/Feedback";

type PanelContainerProps = {
  children: React.ReactNode;
  /** Om funksjonaliteten er i beta, sett et unikt navn.
   * Dette brukes til å tracke om folk er fornøyd eller ikke med funksjonaliteten,
   * og kan finnes igjen i analyseverktøyene */
  betaFeature?: false | string;
  title?: React.ReactNode;
  link?: {
    href: string;
    beskrivelse: string;
  };
  className?: string;
  /** Unik ID for panelet, brukes bl.a. av tastatursnarveier */
  id?: string;
  /** aria-keyshortcuts for å indikere tilgjengelig tastatursnarvei */
  "aria-keyshortcuts"?: string;
};

/**
 * Komponent som viser en panel med en border og padding
 */
export function PanelContainer({
  children,
  title,
  link,
  betaFeature = false,
  className = "",
  id,
  "aria-keyshortcuts": ariaKeyShortcuts,
}: PanelContainerProps) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-keyshortcuts={ariaKeyShortcuts}
      className={`border border-ax-neutral-400 rounded-xl p-4 relative h-fit ${className} ${id ? "scroll-mt-4 focus:outline-2 focus:outline-ax-border-focus focus:outline-offset-2" : ""}`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Heading level="2" size="medium">
            {title}
          </Heading>
          {betaFeature !== false && (
            <>
              <Tooltip content="Denne funksjonaliteten er under utvikling og kan endre seg.">
                <Tag data-color="meta-purple" variant="strong" size="small">
                  Beta
                </Tag>
              </Tooltip>
              <Feedback feature={betaFeature} />
            </>
          )}
        </div>
      )}
      {link && (
        <div className="md:absolute top-4 right-4 mb-4">
          <Link href={link.href} target="_blank">
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
      className={`border border-ax-neutral-400 rounded-xl p-4 relative h-fit`}
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
