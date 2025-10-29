/**
 * Beregner alderen fra et fødsels- eller d-nummer
 *
 * Dette vil nok ikke funke i alle tilfeller, spesielt med edge-cases rundt h-nummer og barn som er født før 2000, men det er en best effort uten å utvide APIet.
 */
export function beregnAlderFraFødselsEllerDnummer(
  personident: string,
  erBarn: boolean,
) {
  const datoDel = personident.slice(0, 6);
  const erDnummer = Number(datoDel) >= 400000;

  const dag = Number(datoDel.slice(0, 2));
  const måned = Number(datoDel.slice(2, 4));
  let år = Number(datoDel.slice(4, 6));
  if (erDnummer) {
    år -= 40;
  }
  if (år < 25 && erBarn) {
    år += 2000;
  } else {
    år += 1900;
  }

  const dato = new Date(år, måned - 1, dag);
  const today = new Date();
  const alder = today.getFullYear() - dato.getFullYear();

  return alder;
}
