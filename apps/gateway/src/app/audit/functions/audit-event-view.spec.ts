import type { AuditEvent } from '@toxictoast/contracts-grpc';
import { auditEventView } from './audit-event-view.function.js';

const EVENT: AuditEvent = {
  event_id: '0192f3a0-0000-7000-8000-000000000001',
  event_namespace: 'blog.comment',
  event_name: 'approve',
  event_version: 1,
  aggregate_id: '01a1794c-65d4-7610-8ba8-33af141fcb4f',
  occurred_at: '2026-10-26T20:54:10.000Z',
  actor: { type: 'ai', id: 'ebef5b8b-137d-456c-acbf-a4aea3018407' },
  correlation_id: '01a16a00-cccc-7000-8000-000000000001',
  payload_json: '{"status":"approved"}',
  recorded_at: '2026-10-26T20:54:10.100Z',
};

describe('auditEventView', () => {
  it('turns the payload back into an object', () => {
    expect(auditEventView(EVENT).payload).toEqual({ status: 'approved' });
  });

  it('keeps entries with a broken payload visible', () => {
    expect(
      auditEventView({ ...EVENT, payload_json: '{kaputt' }).payload,
    ).toEqual({
      unparsable: '{kaputt',
    });
  });

  it('marks entries without actor as unknown', () => {
    expect(auditEventView({ ...EVENT, actor: undefined }).actor).toEqual({
      type: 'unknown',
      id: undefined,
      ip: undefined,
    });
  });
});
