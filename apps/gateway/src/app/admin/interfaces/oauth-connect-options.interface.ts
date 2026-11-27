export interface OAuthConnectOptions {
  /** für Fehlermeldungen, z. B. "twitch" */
  readonly label: string;
  /** Name des State-Cookies */
  readonly cookie: string;
  /** Cookie-Pfad, z. B. /admin/twitch */
  readonly path: string;
  /** wohin es nach dem Admin-Login zurückgeht */
  readonly connectPath: string;
  readonly redirectUri: string;
}
