export interface AuditRetentionConfig {
  readonly retentionDays: number;
  readonly overrides: Readonly<Record<string, number>>;
}
