export interface BanPolicyConfig {
  readonly threshold: number;
  readonly windowSeconds: number;
  readonly durationsMinutes: ReadonlyArray<number>;
  readonly strikeWindowDays: number;
  readonly allowlist: ReadonlyArray<string>;
}
