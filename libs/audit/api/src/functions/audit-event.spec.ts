import { auditInputFromEvent } from './audit-input-from-event.function.js';
import { isAuditableEvent } from './is-auditable-event.function.js';

const EVENT = {
  event_id: '0192F3A0-0000-7000-8000-000000000001',
  event_namespace: 'blog.tag',
  event_name: 'create',
  event_version: 1,
  aggregate_id: '01a17942-8c25-777d-8b51-edccde30673b',
  occurred_at: '2026-10-26T17:29:26.821Z',
  actor: { type: 'ai', id: '84b6270f-a853-417b-ab4b-8d56d9c36d94', ip: '::1' },
  correlation_id: '01a16a00-aaaa-7000-8000-000000000001',
  payload: { title: 'KI' },
};

describe('isAuditableEvent', () => {
  it('accepts a complete event', () => {
    expect(isAuditableEvent(EVENT)).toBe(true);
  });

  it.each([
    [{ event_id: 'event-1' }],
    [{ aggregate_id: 'x'.repeat(65) }],
    [{ occurred_at: 'gestern' }],
    [{ payload: null }],
    [{ event_version: 1.5 }],
  ])('refuses %p', (override) => {
    expect(isAuditableEvent({ ...EVENT, ...override })).toBe(false);
  });
});

describe('auditInputFromEvent', () => {
  it('maps the event with its actor and correlation id', () => {
    expect(auditInputFromEvent(EVENT)).toEqual({
      event_id: '0192f3a0-0000-7000-8000-000000000001',
      event_namespace: 'blog.tag',
      event_name: 'create',
      event_version: 1,
      aggregate_id: '01a17942-8c25-777d-8b51-edccde30673b',
      occurred_at: new Date('2026-10-26T17:29:26.821Z'),
      actor_type: 'ai',
      actor_id: '84b6270f-a853-417b-ab4b-8d56d9c36d94',
      actor_ip: '::1',
      correlation_id: '01a16a00-aaaa-7000-8000-000000000001',
      payload: { title: 'KI' },
    });
  });

  it('keeps events without actor or correlation id visible', () => {
    const input = auditInputFromEvent({
      ...EVENT,
      actor: undefined,
      correlation_id: 'kaputt',
    });

    expect(input).toMatchObject({
      actor_type: 'unknown',
      actor_id: null,
      actor_ip: null,
      correlation_id: null,
    });
  });
});
