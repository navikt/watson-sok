export class OppslagApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OppslagApiError";
  }
}
