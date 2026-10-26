import { AuditRetentionPolicy } from './audit-retention-policy.service.js';

const NOW = new Date('2026-10-26T12:00:00Z');

describe('AuditRetentionPolicy', () => {
  const policy = new AuditRetentionPolicy({
    retentionDays: 365,
    overrides: { 'security.access': 30 },
  });

  it('keeps denied requests for 30 days and everything else for a year', () => {
    expect(policy.rules(NOW)).toEqual([
      {
        before: new Date('2026-09-26T12:00:00Z'),
        include: ['security.access'],
      },
      {
        before: new Date('2025-10-26T12:00:00Z'),
        exclude: ['security.access'],
      },
    ]);
  });

  it('works without overrides', () => {
    const plain = new AuditRetentionPolicy({
      retentionDays: 90,
      overrides: {},
    });

    expect(plain.rules(NOW)).toEqual([
      { before: new Date('2026-07-28T12:00:00Z'), exclude: [] },
    ]);
  });

  it('refuses retentions below one day', () => {
    expect(
      () =>
        new AuditRetentionPolicy({
          retentionDays: 365,
          overrides: { 'security.access': 0 },
        }),
    ).toThrow('Audit retention for security.access must be at least one day');
  });
});
