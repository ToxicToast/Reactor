import type { Consumer } from '@platformatic/kafka';
import { ActorType, SYSTEM_ACTOR } from '@toxictoast/shared-kernel';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import type { ConsumedEvent } from '../interfaces/index.js';
import { KafkaEventConsumer } from './kafka-event-consumer.service.js';

const AI = {
  type: ActorType.AI,
  id: 'moderation-service',
  ip: null,
  permissions: [],
};

const event = (name: string, actor: unknown = AI): ConsumedEvent => {
  return {
    event_id: 'event-1',
    event_namespace: 'moderation',
    event_name: name,
    event_version: 1,
    aggregate_id: 'comment-1',
    occurred_at: '2026-10-20T12:00:00.000Z',
    actor,
    payload: { decision: 'approved' },
  };
};

interface FakeMessage {
  value: string;
  topic: string;
  partition: number;
  offset: bigint;
  commit: jest.Mock;
}

const message = (value: string, offset = 0n): FakeMessage => {
  return {
    value,
    topic: 'moderation',
    partition: 0,
    offset,
    commit: jest.fn().mockResolvedValue(undefined),
  };
};

const fakeStream = (messages: Array<FakeMessage>) => {
  let release: () => void = () => undefined;
  const closed = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    async *[Symbol.asyncIterator]() {
      yield* messages;
      await closed;
    },
    close: jest.fn(async () => {
      release();
    }),
  };
};

const fakeConsumer = (
  messages: Array<FakeMessage>,
  offsets: { earliest: bigint; latest: bigint } = { earliest: 0n, latest: 0n },
) => {
  const stream = fakeStream(messages);
  const consumer = {
    consume: jest.fn().mockResolvedValue(stream),
    close: jest.fn().mockResolvedValue(undefined),
    listOffsets: jest.fn(async ({ timestamp }: { timestamp: bigint }) => {
      const offset = timestamp === -2n ? offsets.earliest : offsets.latest;
      return new Map([['moderation', [offset]]]);
    }),
  };
  return {
    consumer: consumer as unknown as Consumer<string, string, string, string>,
    consume: consumer.consume,
  };
};

const settle = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 20);
  });
};

describe('KafkaEventConsumer', () => {
  let actors: ActorContext;
  let correlations: CorrelationContext;

  beforeEach(() => {
    actors = new ActorContext();
    correlations = new CorrelationContext();
  });

  it('subscribes to the namespaces of its handlers', async () => {
    const { consumer, consume } = fakeConsumer([]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: {
        'moderation.decided': jest.fn(),
        'blog.post.publish': jest.fn(),
      },
      onError: jest.fn(),
    });

    await subject.start();

    expect(consume).toHaveBeenCalledWith(
      expect.objectContaining({
        topics: ['moderation', 'blog.post'],
        autocommit: false,
      }),
    );
  });

  it('passes the parsed event to its handler and commits', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const handler = jest.fn().mockResolvedValue(undefined);
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(handler).toHaveBeenCalledWith(event('decided'));
    expect(decided.commit).toHaveBeenCalled();
  });

  it('runs the handler as the actor of the event', async () => {
    const decided = message(JSON.stringify(event('decided')));
    let current: unknown;
    const handler = jest.fn(async () => {
      await Promise.resolve();
      current = actors.current();
    });
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(current).toEqual(AI);
  });

  it('runs the handler as system when the event has no valid actor', async () => {
    const legacy = message(
      JSON.stringify({ ...event('decided'), actor: undefined }),
    );
    const forged = message(
      JSON.stringify(event('decided', { type: 'admin', id: null, ip: null })),
    );
    const seen: Array<unknown> = [];
    const handler = jest.fn(async () => {
      seen.push(actors.current());
    });
    const { consumer } = fakeConsumer([legacy, forged]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(seen).toEqual([SYSTEM_ACTOR, SYSTEM_ACTOR]);
  });

  it('commits events without handler without calling anything', async () => {
    const requested = message(JSON.stringify(event('requested')));
    const handler = jest.fn();
    const { consumer } = fakeConsumer([requested]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(handler).not.toHaveBeenCalled();
    expect(requested.commit).toHaveBeenCalled();
  });

  it('reports and skips messages that are not valid json', async () => {
    const broken = message('{kaputt');
    const onError = jest.fn();
    const { consumer } = fakeConsumer([broken]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': jest.fn() },
      onError,
    });

    await subject.start();
    await settle();

    expect(onError).toHaveBeenCalledWith(expect.any(SyntaxError), undefined);
    expect(broken.commit).toHaveBeenCalled();
  });

  it('retries a failing handler before it commits', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const error = new Error('database down');
    const handler = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    const onError = jest.fn();
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError,
      retryDelayMs: 1,
      maxRetryDelayMs: 1,
    });

    await subject.start();
    await settle();

    expect(handler).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith(error, event('decided'));
    expect(decided.commit).toHaveBeenCalledTimes(1);
  });

  it('does not commit a failing message when stopped', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const handler = jest.fn().mockRejectedValue(new Error('database down'));
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError: jest.fn(),
      retryDelayMs: 1,
      maxRetryDelayMs: 1,
    });

    await subject.start();
    await settle();
    await subject.stop();

    expect(decided.commit).not.toHaveBeenCalled();
  });

  it('runs the handler with the correlation id of the event', async () => {
    const correlationId = '01a16a00-3111-7049-8d8d-0db609f31f2a';
    const decided = message(
      JSON.stringify({ ...event('decided'), correlation_id: correlationId }),
    );
    let seen: string | null = null;
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: {
        'moderation.decided': async () => {
          seen = correlations.current();
        },
      },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(seen).toBe(correlationId);
  });

  it('reads from the beginning and never commits in replay mode', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const { consumer, consume } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: {
        'moderation.decided': jest.fn().mockResolvedValue(undefined),
      },
      onError: jest.fn(),
      replay: true,
    });

    await subject.start();
    await settle();

    expect(consume).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'earliest' }),
    );
    expect(decided.commit).not.toHaveBeenCalled();
  });

  it('is caught up once the replay reaches the end of every partition', async () => {
    const first = message(JSON.stringify(event('decided')), 0n);
    const second = message(JSON.stringify(event('decided')), 1n);
    const { consumer } = fakeConsumer([first, second], {
      earliest: 0n,
      latest: 2n,
    });
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: {
        'moderation.decided': jest.fn().mockResolvedValue(undefined),
      },
      onError: jest.fn(),
      replay: true,
    });

    await subject.start();
    await settle();

    expect(subject.isCaughtUp).toBe(true);
  });

  it('is not caught up while messages are still missing', async () => {
    const first = message(JSON.stringify(event('decided')), 0n);
    const { consumer } = fakeConsumer([first], { earliest: 0n, latest: 2n });
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: {
        'moderation.decided': jest.fn().mockResolvedValue(undefined),
      },
      onError: jest.fn(),
      replay: true,
    });

    await subject.start();
    await settle();

    expect(subject.isCaughtUp).toBe(false);
  });

  it('does not wait for partitions whose messages all expired', async () => {
    const { consumer } = fakeConsumer([], { earliest: 5n, latest: 5n });
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': jest.fn() },
      onError: jest.fn(),
      replay: true,
    });

    await subject.start();

    expect(subject.isCaughtUp).toBe(true);
  });

  it('restarts itself when the stream dies', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const broken = {
      async *[Symbol.asyncIterator]() {
        yield* [];
        throw new Error('connection lost');
      },
      close: jest.fn().mockResolvedValue(undefined),
    };
    const healthy = fakeStream([decided]);
    const consumer = {
      consume: jest
        .fn()
        .mockResolvedValueOnce(broken)
        .mockResolvedValue(healthy),
      close: jest.fn().mockResolvedValue(undefined),
    } as unknown as Consumer<string, string, string, string>;
    const handler = jest.fn().mockResolvedValue(undefined);
    const onError = jest.fn();
    const onRestart = jest.fn();
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': handler },
      onError,
      onRestart,
      restartDelayMs: 1,
    });

    await subject.start();
    await settle();

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'connection lost' }),
      undefined,
    );
    expect(onRestart).toHaveBeenCalledWith(1);
    expect(handler).toHaveBeenCalledWith(event('decided'));
    expect(subject.isRunning).toBe(true);
    expect(subject.restartCount).toBe(1);
  });

  it('does not restart after stop', async () => {
    const { consumer, consume } = fakeConsumer([]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': jest.fn() },
      onError: jest.fn(),
      restartDelayMs: 1,
    });

    await subject.start();
    await subject.stop();
    await settle();

    expect(consume).toHaveBeenCalledTimes(1);
    expect(subject.isRunning).toBe(false);
  });

  it('also subscribes to explicitly listed topics', async () => {
    const { consumer, consume } = fakeConsumer([]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { '*': jest.fn() },
      topics: ['blog.tag', 'security.ip'],
      onError: jest.fn(),
    });

    await subject.start();

    expect(consume).toHaveBeenCalledWith(
      expect.objectContaining({ topics: ['blog.tag', 'security.ip'] }),
    );
  });

  it('passes events without own handler to the fallback handler', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const fallback = jest.fn().mockResolvedValue(undefined);
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { '*': fallback },
      topics: ['moderation'],
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(fallback).toHaveBeenCalledWith(event('decided'));
    expect(decided.commit).toHaveBeenCalled();
  });

  it('prefers an own handler over the fallback', async () => {
    const decided = message(JSON.stringify(event('decided')));
    const own = jest.fn().mockResolvedValue(undefined);
    const fallback = jest.fn().mockResolvedValue(undefined);
    const { consumer } = fakeConsumer([decided]);
    const subject = new KafkaEventConsumer(consumer, actors, correlations, {
      handlers: { 'moderation.decided': own, '*': fallback },
      onError: jest.fn(),
    });

    await subject.start();
    await settle();

    expect(own).toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();
  });
});
