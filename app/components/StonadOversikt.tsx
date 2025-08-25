"use client";

import {
    NokIcon,
    ParasolBeachIcon,
    PencilIcon,
    PersonIcon,
    PiggybankIcon,
    VirusIcon,
} from "@navikt/aksel-icons";
import {Box, ExpansionCard, Timeline, TimelinePeriodProps} from "@navikt/ds-react";

import {Stonad} from "@/app/types/Domain";
import {toDate} from "date-fns";

export default function StonadOversikt({
                                            stonadOversikt,
                                        }: {
    stonadOversikt: Stonad[];
}) {


    return (

        <div className="p-6">
            <h2 className="text-4xl font-bold mb-6">Ytelser og stønder i nav siste 3 år</h2>
            <Box >
                <Timeline>
                    {stonadOversikt.map((s, sIdx) => (
                        <Timeline.Row
                            key={`${s.stonadType}-${sIdx}`}
                            label={s.stonadType}
                            icon={
                                // Bytt ut med ditt ikon om ønskelig
                                //<HospitalIcon aria-hidden />
                                <span aria-hidden>🏥</span>
                            }
                        >
                            {s.perioder.map((p, pIdx) => (
                                <Timeline.Period
                                    key={`${s.stonadType}-${pIdx}-${p.info}`}
                                    start={toDate(p.periode.fom)}
                                    end={toDate(p.periode.tom)}
                                    status={p.beløp === 0 ? "warning" : "success"}
                                    icon=<NokIcon/>
                                >
                                    <p className="font-medium">
                                        {p.beløp.toLocaleString("no-NO")} kr
                                    </p>
                                    <p className="text-sm opacity-20">
                                        Kilde: {p.kilde}{p.info}
                                    </p>
                                    <p className="text-sm opacity-20">
                                         Bilag: {p.info}
                                </p>
                                </Timeline.Period>
                            ))}
                        </Timeline.Row>
                    ))}
                </Timeline>
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
