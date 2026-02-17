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
import type { NæringsinntektPost } from "./domene";

type NæringsinntektTabellProps = {
  promise: Promise<NæringsinntektPost[]>;
};

/** Tabell som viser næringsinntekt per år */
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
  const næringsinntekter = use(promise);

  if (næringsinntekter.length === 0) {
    return (
      <Alert variant="info">Ingen næringsinntekt funnet for siste 10 år.</Alert>
    );
  }

  return (
    <Table size="medium">
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col" textSize="small">
            År
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="right" textSize="small">
            Inntekt
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {næringsinntekter.map((post) => (
          <TableRow key={post.år}>
            <TableHeaderCell scope="row" textSize="small">
              {post.år}
            </TableHeaderCell>
            <TableDataCell align="right" textSize="small">
              {formaterBeløp(post.beløp)}
            </TableDataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
