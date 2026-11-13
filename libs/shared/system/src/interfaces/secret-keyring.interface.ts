export interface SecretKeyring {
  readonly currentKeyId: string;
  readonly keys: ReadonlyMap<string, Buffer>;
}
