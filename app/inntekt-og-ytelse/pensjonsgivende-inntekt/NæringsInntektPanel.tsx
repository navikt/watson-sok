import { Alert, BodyShort, Skeleton, Table } from "@navikt/ds-react";
import { use } from "react";

import { ResolvingComponent } from "~/async/ResolvingComponent";
import type { PensjonsgivendeInntekt } from "~/inntekt-og-ytelse/pensjonsgivende-inntekt/domene";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { formaterBeløp } from "~/utils/number-utils";

type NæringsInntektPanelProps = {
  promise: Promise<PensjonsgivendeInntekt[] | null>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};

function NæringsInntektPanelMedData({
  promise,
  panelId,
  ariaKeyShortcuts,
}: NæringsInntektPanelProps) {
  const data = use(promise);
  return (
    <NæringsInntektPanelInnhold
      data={data}
      panelId={panelId}
      ariaKeyShortcuts={ariaKeyShortcuts}
    />
  );
}

export function NæringsInntektPanel({
  promise,
  panelId,
  ariaKeyShortcuts,
}: NæringsInntektPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<NæringsInntektPanelSkeleton />}>
      <NæringsInntektPanelMedData
        promise={promise}
        panelId={panelId}
        ariaKeyShortcuts={ariaKeyShortcuts}
      />
    </ResolvingComponent>
  );
}

type NæringsInntektPanelInnholdProps = {
  data: PensjonsgivendeInntekt[] | null;
  panelId?: string;
  ariaKeyShortcuts?: string;
};

export const NæringsInntektPanelInnhold = ({
  data,
  panelId,
  ariaKeyShortcuts,
}: NæringsInntektPanelInnholdProps) => {
  const rader = (data ?? [])
    .filter((rad) => rad.næringsinntekt > 0)
    .sort((a, b) => b.inntektsår.localeCompare(a.inntektsår));

  const sum = rader.reduce((acc, rad) => acc + rad.næringsinntekt, 0);
  const harIngenData = rader.length === 0;

  return (
    <PanelContainer
      title="Næringsinntekt"
      id={panelId}
      aria-keyshortcuts={ariaKeyShortcuts}
    >
      {harIngenData ? (
        <Alert variant="info">Ingen næringsinntekt registrert.</Alert>
      ) : (
        <div className="flex flex-col gap-3">
          <BodyShort size="small" className="text-ax-text-neutral-subtle">
            Fastsatt næringsinntekt fra skatteoppgjøret, siste 3 år: inngår i
            Samlet inntekt over
          </BodyShort>
          <Table size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">År</Table.HeaderCell>
                <Table.HeaderCell scope="col" align="right">
                  Næringsinntekt
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rader.map((rad) => (
                <Table.Row key={rad.inntektsår}>
                  <Table.HeaderCell scope="row">
                    {rad.inntektsår}
                  </Table.HeaderCell>
                  <Table.DataCell align="right">
                    {formaterBeløp(rad.næringsinntekt, 0)}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
            <tfoot>
              <Table.Row>
                <Table.HeaderCell scope="row">
                  Sum (siste {rader.length} år)
                </Table.HeaderCell>
                <Table.DataCell align="right">
                  <strong>{formaterBeløp(sum, 0)}</strong>
                </Table.DataCell>
              </Table.Row>
            </tfoot>
          </Table>
        </div>
      )}
    </PanelContainer>
  );
};

const NæringsInntektPanelSkeleton = () => (
  <PanelContainerSkeleton title="Næringsinntekt">
    <Table size="small">
      <Table.Header>
        <Table.Row>
          {["År", "Næringsinntekt"].map((col) => (
          <Table.HeaderCell key={col} scope="col" aria-hidden={true}>
              <Skeleton variant="text" width="60%" />
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: 3 }, (_, i) => (
          <Table.Row key={i}>
            {Array.from({ length: 2 }, (_, j) => (
            <Table.DataCell key={j} aria-hidden={true}>
                <Skeleton variant="text" width="80%" />
              </Table.DataCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </PanelContainerSkeleton>
);
