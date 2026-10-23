export interface AdminSession {
  readonly sub: string;
  readonly permissions: ReadonlyArray<string>;
}
