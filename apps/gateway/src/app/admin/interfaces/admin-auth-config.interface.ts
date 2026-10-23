export interface AdminAuthConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly sessionSecret: Uint8Array;
  readonly sessionTtlSeconds: number;
  readonly secureCookies: boolean;
}
