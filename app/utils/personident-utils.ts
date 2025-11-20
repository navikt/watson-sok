/**
 * Beregner alderen fra et fødsels- eller d-nummer
 *
 * Dette vil nok ikke funke i alle tilfeller, spesielt med edge-cases rundt h-nummer og barn som er født før 2000, men det er en best effort uten å utvide APIet.
 */
export function beregnAlderFraFødselsEllerDnummer(
  personident: string,
  erBarn: boolean,
) {
  if (personident === "Ukjent") {
    return "Ukjent";
  }
  const datoDel = personident.slice(0, 6);

  let dag = Number(datoDel.slice(0, 2));
  let måned = Number(datoDel.slice(2, 4));
  let år = Number(datoDel.slice(4, 6));

  const erDnummer = dag >= 40;
  if (erDnummer) {
    dag -= 40;
  }
  const nåværendeÅr = Number(new Date().getFullYear().toString().slice(2));

  if (år < nåværendeÅr && erBarn) {
    år += 2000;
  } else {
    år += 1900;
  }

  const dato = new Date(år, måned - 1, dag);
  const iDag = new Date();
  const antallMillisekunderPerÅr = 1000 * 60 * 60 * 24 * 365.25;
  let alder = (iDag.getTime() - dato.getTime()) / antallMillisekunderPerÅr;
  return Math.floor(alder);
}
