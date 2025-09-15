import { NokIcon } from "@navikt/aksel-icons";
import { Alert, Box, ExpansionCard, Timeline } from "@navikt/ds-react";

import { toDate } from "date-fns";
import type { Stonad } from "~/types/Domain";

export default function StonadOversikt({
  stonadOversikt,
}: {
  stonadOversikt: Stonad[];
}) {
  const isEmpty = !stonadOversikt || stonadOversikt.length === 0;

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-6">
        Ytelser og stønder i Nav siste 3 år
      </h2>
      <Box>
        {isEmpty ? (
          <Alert variant="info">
            Ingen ytelser eller stønader registrert de siste 3 årene.
          </Alert>
        ) : (
          <Timeline>
            {stonadOversikt.map((s, sIdx) => (
              <Timeline.Row
                key={`${s.stonadType}-${sIdx}`}
                label={s.stonadType}
                icon={<span aria-hidden>🏥</span>}
              >
                {s.perioder.map((p, pIdx) => (
                  <Timeline.Period
                    key={`${s.stonadType}-${pIdx}-${p.info}`}
                    start={toDate(p.periode.fom)}
                    end={toDate(p.periode.tom)}
                    status={p.beløp === "0.00" ? "warning" : "success"}
                    icon={<NokIcon />}
                  >
                    <p className="font-medium">{p.beløp.toLocaleString()} kr</p>
                    <p className="text-sm opacity-20">
                      Kilde: {p.kilde}
                      {p.info}
                    </p>
                    <p className="text-sm opacity-20">Bilag: {p.info}</p>
                  </Timeline.Period>
                ))}
              </Timeline.Row>
            ))}
          </Timeline>
        )}
      </Box>
      <ExpansionCard aria-label="Data">
        <ExpansionCard.Header>
          <ExpansionCard.Title>Data</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(stonadOversikt, null, 2)}
          </pre>
        </ExpansionCard.Content>
      </ExpansionCard>
    </div>
  );
}
