import type {
  AuditPurgeRule,
  AuditRetentionConfig,
} from '../interfaces/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const assertDays = (name: string, days: number): void => {
  if (!Number.isInteger(days) || days < 1) {
    throw new Error(`Audit retention for ${name} must be at least one day`);
  }
};

export class AuditRetentionPolicy {
  constructor(private readonly config: AuditRetentionConfig) {
    assertDays('all events', config.retentionDays);
    for (const [namespace, days] of Object.entries(config.overrides)) {
      assertDays(namespace, days);
    }
  }

  rules(now: Date): Array<AuditPurgeRule> {
    const namespaces = Object.keys(this.config.overrides);
    const overrides = namespaces.map((namespace) => {
      return {
        before: this.daysBefore(now, this.config.overrides[namespace]),
        include: [namespace],
      };
    });

    return [
      ...overrides,
      {
        before: this.daysBefore(now, this.config.retentionDays),
        exclude: namespaces,
      },
    ];
  }

  private daysBefore(now: Date, days: number): Date {
    return new Date(now.getTime() - days * DAY_MS);
  }
}
