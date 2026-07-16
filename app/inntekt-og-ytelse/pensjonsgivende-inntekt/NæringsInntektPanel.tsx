import { Alert, Skeleton, Table } from "@navikt/ds-react";
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

  const harIngenData = rader.length === 0;

  return (
    <PanelContainer
      title="Næringsinntekt (Skatteetaten)"
      id={panelId}
      aria-keyshortcuts={ariaKeyShortcuts}
    >
      {harIngenData ? (
        <Alert variant="info">Ingen næringsinntekt registrert.</Alert>
      ) : (
        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">År</Table.HeaderCell>
              <Table.HeaderCell scope="col" align="right">
                Næringsinntekt
              </Table.HeaderCell>
              <Table.HeaderCell scope="col" align="right">
                Lønnsinntekt
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
                <Table.DataCell align="right">
                  {rad.lønnsinntekt > 0
                    ? formaterBeløp(rad.lønnsinntekt, 0)
                    : "–"}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </PanelContainer>
  );
};

const NæringsInntektPanelSkeleton = () => (
  <PanelContainerSkeleton title="Næringsinntekt (Skatteetaten)">
    <Table size="small">
      <Table.Header>
        <Table.Row>
          {["År", "Næringsinntekt", "Lønnsinntekt"].map((col) => (
            <Table.HeaderCell key={col} scope="col">
              <Skeleton variant="text" width="60%" />
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {Array.from({ length: 3 }, (_, i) => (
          <Table.Row key={i}>
            {Array.from({ length: 3 }, (_, j) => (
              <Table.DataCell key={j}>
                <Skeleton variant="text" width="80%" />
              </Table.DataCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </PanelContainerSkeleton>
);
