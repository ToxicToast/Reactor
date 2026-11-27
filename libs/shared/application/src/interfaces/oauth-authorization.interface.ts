import type { OAuthToken } from './oauth-token.interface.js';

/** was jede Plattform beim Code-Tausch mindestens liefert */
export interface OAuthAuthorization {
  readonly token: OAuthToken;
}
