/** der Teil eines Auth-Clients, den der Abschluss des Logins braucht */
export interface OAuthCodeExchange<TAuthorization> {
  exchangeCode(code: string, redirectUri: string): Promise<TAuthorization>;
}
