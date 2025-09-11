export interface User {
  id: string;
  name: string;
}
export interface LoggedInUserResponse {
  preferredUsername: string;
  name: string;
  navIdent: string;
}
export interface OppslagResponse {
  fnr: string;
  navn: string;
  status: string;
  [key: string]: unknown; // valgfritt for utvidbarhet
}
