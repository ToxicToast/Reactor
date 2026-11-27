/** der Teil eines Auth-Clients, den der Start des Logins braucht */
export interface OAuthAuthorizationUrl {
  authorizationUrl(
    state: string,
    redirectUri: string,
    scopes: ReadonlyArray<string>,
  ): string;
}
