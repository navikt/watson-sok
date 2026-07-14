export class OppslagApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OppslagApiError";
  }
}

/** Kastes når et baksystem (f.eks. nav-persondata-api) returnerer HTTP 5xx */
export class BaksystemFeilError extends OppslagApiError {
  constructor(status: number) {
    super(`Feil fra baksystem. Status: ${status}`);
    this.name = "BaksystemFeilError";
  }
}
