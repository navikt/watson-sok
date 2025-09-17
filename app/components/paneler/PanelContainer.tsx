import { Heading, Link } from "@navikt/ds-react";

type PanelContainerProps = {
  children: React.ReactNode;
  title?: string;
  link?: {
    href: string;
    beskrivelse: string;
  };
};

/**
 * Komponent som viser en panel med en border og padding
 */
export function PanelContainer({ children, title, link }: PanelContainerProps) {
  return (
    <div className="bg-primary rounded-sm border-1 border-gray-200 p-4 h-fit relative">
      {title && (
        <Heading level="2" size="medium" spacing>
          {title}
        </Heading>
      )}
      {link && (
        <div className="md:absolute top-4 right-4 mb-4">
          <Link href={link.href}>{link.beskrivelse}</Link>
        </div>
      )}
      {children}
    </div>
  );
}
