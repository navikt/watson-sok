import { Alert, Skeleton, Table } from "@navikt/ds-react";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { use } from "react";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import { formaterBeløp } from "~/utils/number-utils";
import type { PensjonsgivendeInntektPost } from "./domene";

type NæringsinntektTabellProps = {
  promise: Promise<PensjonsgivendeInntektPost[]>;
};

/** Tabell som viser pensjonsgivende inntekt per år */
export function NæringsinntektTabell({ promise }: NæringsinntektTabellProps) {
  return (
    <ResolvingComponent
      loadingFallback={<Skeleton variant="rounded" height="10rem" />}
    >
      <NæringsinntektTabellMedData promise={promise} />
    </ResolvingComponent>
  );
}

function NæringsinntektTabellMedData({ promise }: NæringsinntektTabellProps) {
  const poster = use(promise);

  if (poster.length === 0) {
    return (
      <Alert variant="info">
        Ingen pensjonsgivende inntekt funnet for siste 10 år.
      </Alert>
    );
  }

  return (
    <Table size="medium">
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col" textSize="small">
            Inntektsår
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="right" textSize="small">
            Næringsinntekt
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="right" textSize="small">
            Lønnsinntekt
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {poster.map((post) => (
          <TableRow key={post.inntektsår}>
            <TableHeaderCell scope="row" textSize="small">
              {post.inntektsår}
            </TableHeaderCell>
            <TableDataCell align="right" textSize="small">
              {formaterBeløp(post.næringsinntekt)}
            </TableDataCell>
            <TableDataCell align="right" textSize="small">
              {formaterBeløp(post.lønnsinntekt)}
            </TableDataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
