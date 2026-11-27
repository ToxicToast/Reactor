/** ungeprüft, so wie die Plattform zurückleitet */
export interface OAuthCallbackQuery {
  readonly code: unknown;
  readonly state: unknown;
  readonly error_description: unknown;
}
