import type { DomainContext } from '@toxictoast/shared-kernel';
import { StreamSessionFactory } from '../factories/index.js';
import type { StreamSessionDomain } from './stream-session.domain.js';

const ctx: DomainContext = {
  id: { generate: () => 'session-1' as never },
  date: { now: () => new Date('2026-10-28T20:00:05Z') },
};

const CHANNEL = {
  channel_id: '123456',
  channel_login: 'toxictoast',
  channel_name: 'ToxicToast',
};
const STARTED_AT = new Date('2026-10-28T20:00:00Z');

describe('StreamSessionDomain', () => {
  const factory = new StreamSessionFactory(ctx);

  const startSession = (): StreamSessionDomain => {
    const result = factory.createDomain({
      channel: CHANNEL,
      stream_id: 'stream-1',
      started_at: STARTED_AT,
    });
    if (result.isFailure) {
      throw result.error;
    }
    result.value.toEvents();
    return result.value;
  };

  it('starts a live session with zero counters and a started event', () => {
    const result = factory.createDomain({
      channel: CHANNEL,
      stream_id: 'stream-1',
      started_at: STARTED_AT,
    });

    expect(result.value.isLive).toBe(true);
    expect(result.value.toAnemic()).toMatchObject({
      id: 'session-1',
      channel_login: 'toxictoast',
      stream_id: 'stream-1',
      started_at: STARTED_AT,
      messages: 0,
      peak_chatters: 0,
      ended_at: null,
    });
    expect(result.value.toEvents().map((event) => event.event_name)).toEqual([
      'started',
    ]);
  });

  it('refuses an empty stream id', () => {
    const result = factory.createDomain({
      channel: CHANNEL,
      stream_id: ' ',
      started_at: STARTED_AT,
    });

    expect(result.error.code).toBe('VALIDATION');
  });

  it('records counters while live', () => {
    const session = startSession();

    session.record({ messages: 1 });
    session.record({ messages: 1, bits: 100 });

    expect(session.toAnemic()).toMatchObject({ messages: 2, bits: 100 });
    expect(session.toEvents()).toEqual([]);
  });

  it('keeps the highest chatter count', () => {
    const session = startSession();

    session.observeChatters(12);
    session.observeChatters(8);

    expect(session.toAnemic().peak_chatters).toBe(12);
  });

  it('ends with duration and an ended event', () => {
    const session = startSession();

    const result = session.end(new Date('2026-10-28T22:30:00Z'));

    expect(result.isSuccess).toBe(true);
    expect(session.toAnemic()).toMatchObject({
      ended_at: new Date('2026-10-28T22:30:00Z'),
      duration_seconds: 9000,
    });
    expect(session.toEvents().map((event) => event.event_name)).toEqual([
      'ended',
    ]);
  });

  it('ignores everything after the end and refuses to end twice', () => {
    const session = startSession();
    session.end(new Date('2026-10-28T22:30:00Z'));
    session.toEvents();

    session.record({ messages: 1 });
    session.observeChatters(50);
    session.countUniqueChatter();

    expect(session.toAnemic()).toMatchObject({
      messages: 0,
      peak_chatters: 0,
      unique_chatters: 0,
    });
    expect(session.end(new Date()).error.code).toBe('CONFLICT');
  });
});
