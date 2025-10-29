import {
  ChildEyesIcon,
  FileSearchIcon,
  PersonIcon,
  PersonTallShortIcon,
} from "@navikt/aksel-icons";
import { BodyShort, Button, Link } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { useRef } from "react";
import { Form } from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { beregnAlderFraFødselsEllerDnummer } from "~/utils/personident-utils";
import {
  formatterFødselsnummer,
  snakeCaseTilSetning,
} from "~/utils/string-utils";

type FamiliemedlemmerModalProps = {
  familiemedlemmer: Record<string, string>;
};
/**
 * En modal (med trigger-knapp) som viser en liste over familiemedlemmer
 */
export function FamiliemedlemmerModal({
  familiemedlemmer,
}: FamiliemedlemmerModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const familiemedlemmerListe = Object.entries(familiemedlemmer)
    .map(([personIdent, type]) => ({
      personIdent,
      type,
    }))
    .sort((a, b) => a.type.localeCompare(b.type));
  if (familiemedlemmerListe.length === 0) {
    return <BodyShort>Ingen kjente familiemedlemmer</BodyShort>;
  }
  const antallBarn = familiemedlemmerListe.filter(
    ({ type }) => type === "BARN",
  ).length;
  const antallFamiliemedlemmerOppsummering = `${familiemedlemmerListe.length} ${familiemedlemmerListe.length === 1 ? "person" : "personer"}`;
  const aldrePåBarn = familiemedlemmerListe
    .filter(({ type }) => type === "BARN")
    .map(({ personIdent }) =>
      beregnAlderFraFødselsEllerDnummer(personIdent, true),
    );
  const yngsteBarn = Math.min(...aldrePåBarn);
  const eldsteBarn = Math.max(...aldrePåBarn);

  const aldersoppsummering =
    aldrePåBarn.length > 0
      ? yngsteBarn === eldsteBarn
        ? `på ${yngsteBarn} år`
        : `fra ${yngsteBarn} til ${eldsteBarn} år`
      : "";

  const antallBarnOppsummering =
    `, hvorav ${antallBarn || "ingen"} barn ${aldersoppsummering}`.trim();
  return (
    <>
      <Link
        as="button"
        onClick={() => ref.current?.showModal()}
        className="text-left p-0"
      >
        {antallFamiliemedlemmerOppsummering} {antallBarnOppsummering}
      </Link>
      <Modal
        ref={ref}
        header={{ heading: "Familiemedlemmer", icon: <PersonTallShortIcon /> }}
        closeOnBackdropClick
      >
        <ModalBody className="min-w-md">
          <div className="flex flex-col gap-2">
            {familiemedlemmerListe.map(({ personIdent, type }) => (
              <div
                className="rounded-md border border-ax-neutral-400 p-2 flex justify-between items-center"
                key={personIdent}
              >
                <div>
                  {mapTypeTilIkon(type)}&nbsp;{snakeCaseTilSetning(type)}:&nbsp;
                  {formatterFødselsnummer(personIdent)}&nbsp;(
                  {beregnAlderFraFødselsEllerDnummer(
                    personIdent,
                    type === "BARN",
                  )}
                  &nbsp; år)
                </div>
                <Form action={RouteConfig.INDEX} method="post">
                  <input type="hidden" name="ident" value={personIdent} />
                  <Button
                    variant="tertiary"
                    size="small"
                    type="submit"
                    icon={
                      <FileSearchIcon
                        aria-hidden={true}
                        className="inline-block"
                        title="Søk etter familiemedlem"
                      />
                    }
                  >
                    Slå opp
                  </Button>
                </Form>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => ref.current?.close()}>
            Lukk
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const mapTypeTilIkon = (type: string) => {
  switch (type) {
    case "BARN":
      return <ChildEyesIcon aria-hidden={true} className="inline-block" />;
    default:
      return <PersonIcon aria-hidden={true} className="inline-block" />;
  }
};
