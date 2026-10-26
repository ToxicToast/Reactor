import type { AuditEntry } from '@toxictoast/audit-domain';

export const auditEntry = (
  eventId: string,
  overrides: Partial<AuditEntry> = {},
): AuditEntry => {
  return {
    event_id: eventId,
    event_namespace: 'blog.tag',
    event_name: 'create',
    event_version: 1,
    aggregate_id: '01a17942-8c25-777d-8b51-edccde30673b',
    occurred_at: new Date('2026-10-26T12:00:00Z'),
    actor_type: 'ai',
    actor_id: '84b6270f-a853-417b-ab4b-8d56d9c36d94',
    actor_ip: '203.0.113.7',
    correlation_id: '01a16a00-aaaa-7000-8000-000000000001',
    payload: { title: 'KI' },
    recorded_at: new Date('2026-10-26T12:00:01Z'),
    ...overrides,
  };
};
