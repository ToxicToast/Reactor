import { auditInputFromEvent } from './audit-input-from-event.function.js';

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

describe('auditInputFromEvent', () => {
  it('maps the event with its actor and correlation id', () => {
    expect(auditInputFromEvent(EVENT).value).toEqual({
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

    expect(input.value).toMatchObject({
      actor_type: 'unknown',
      actor_id: null,
      actor_ip: null,
      correlation_id: null,
    });
  });

  it.each([
    ['no object', null],
    ['an invalid event id', { ...EVENT, event_id: 'event-1' }],
    ['a too long aggregate id', { ...EVENT, aggregate_id: 'x'.repeat(65) }],
    ['an invalid date', { ...EVENT, occurred_at: 'gestern' }],
    ['a missing payload', { ...EVENT, payload: null }],
    ['a fractional version', { ...EVENT, event_version: 1.5 }],
  ])('refuses %s', (_case, event) => {
    const result = auditInputFromEvent(event);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
