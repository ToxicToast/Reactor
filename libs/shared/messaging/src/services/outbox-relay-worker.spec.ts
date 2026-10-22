import type { OutboxRelayResult } from '../interfaces/index.js';
import { OutboxRelayWorker } from './outbox-relay-worker.service.js';
import type { OutboxRelay } from './outbox-relay.service.js';

const result = (
  published: number,
  error: unknown = null,
): OutboxRelayResult => {
  return { published, failed: 0, error };
};

const fakeRelay = (
  relay: () => Promise<OutboxRelayResult>,
  batchSize = 2,
): OutboxRelay => {
  return { batchSize, relay: jest.fn(relay) } as unknown as OutboxRelay;
};

const waitFor = async (condition: () => boolean): Promise<void> => {
  const started = Date.now();
  while (!condition()) {
    if (Date.now() - started > 1000) {
      throw new Error('condition not met in time');
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });
  }
};

const calls = (relay: OutboxRelay): number => {
  return (relay.relay as jest.Mock).mock.calls.length;
};

describe('OutboxRelayWorker', () => {
  let worker: OutboxRelayWorker;

  afterEach(() => worker.stop());

  it('relays again immediately while batches are full', async () => {
    const results = [result(2), result(2), result(1)];
    const relay = fakeRelay(async () => results.shift() ?? result(0));
    worker = new OutboxRelayWorker(relay, {
      intervalMs: 10000,
      onError: jest.fn(),
    });

    worker.start();
    await waitFor(() => calls(relay) === 3);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(calls(relay)).toBe(3);
  });

  it('reports errors and keeps running', async () => {
    const error = new Error('broker down');
    const onError = jest.fn();
    let first = true;
    const relay = fakeRelay(async () => {
      if (first) {
        first = false;
        throw error;
      }
      return result(0);
    });
    worker = new OutboxRelayWorker(relay, { intervalMs: 5, onError });

    worker.start();
    await waitFor(() => calls(relay) >= 2);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('reports failed batches', async () => {
    const error = new Error('broker down');
    const onError = jest.fn();
    const relay = fakeRelay(async () => result(0, error));
    worker = new OutboxRelayWorker(relay, { intervalMs: 10000, onError });

    worker.start();
    await waitFor(() => onError.mock.calls.length === 1);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('waits for a running batch when stopped', async () => {
    let release!: () => void;
    const relay = fakeRelay(() => {
      return new Promise((resolve) => {
        release = () => resolve(result(0));
      });
    });
    worker = new OutboxRelayWorker(relay, {
      intervalMs: 10000,
      onError: jest.fn(),
    });
    worker.start();
    await waitFor(() => calls(relay) === 1);

    let stopped = false;
    const stopping = worker.stop().then(() => {
      stopped = true;
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    expect(stopped).toBe(false);

    release();
    await stopping;
    expect(stopped).toBe(true);
  });
});
