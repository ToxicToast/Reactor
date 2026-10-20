import type { Consumer } from '@platformatic/kafka';
import { ActorType, SYSTEM_ACTOR } from '@toxictoast/shared-kernel';
import { ActorContext } from '@toxictoast/shared-system';
import type { ConsumedEvent } from '../interfaces/index.js';
import { KafkaEventConsumer } from './kafka-event-consumer.service.js';

const AI = { type: ActorType.AI, id: 'moderation-service', ip: null };

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
  commit: jest.Mock;
}

const message = (value: string): FakeMessage => {
  return { value, commit: jest.fn().mockResolvedValue(undefined) };
};

const fakeConsumer = (messages: Array<FakeMessage>) => {
  const stream = {
    async *[Symbol.asyncIterator]() {
      yield* messages;
    },
    close: jest.fn().mockResolvedValue(undefined),
  };
  const consumer = {
    consume: jest.fn().mockResolvedValue(stream),
    close: jest.fn().mockResolvedValue(undefined),
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

  beforeEach(() => {
    actors = new ActorContext();
  });

  it('subscribes to the namespaces of its handlers', async () => {
    const { consumer, consume } = fakeConsumer([]);
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
    const subject = new KafkaEventConsumer(consumer, actors, {
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
});
