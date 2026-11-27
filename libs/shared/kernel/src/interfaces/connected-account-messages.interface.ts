export interface ConnectedAccountMessages {
  /** die neue Autorisierung gehört zu einem anderen Konto der Plattform */
  readonly FOREIGN_ACCOUNT: string;
  readonly NOT_CONNECTED: string;
}
