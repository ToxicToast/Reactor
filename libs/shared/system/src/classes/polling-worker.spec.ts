import type { PollingResult, PollingTask } from '../interfaces/index.js';
import { PollingWorker } from './polling-worker.js';

const result = (processed: number, error: unknown = null): PollingResult => {
  return { processed, error };
};

const fakeTask = (
  run: () => Promise<PollingResult>,
  batchSize = 2,
): PollingTask & { run: jest.Mock } => {
  return { batchSize, run: jest.fn(run) };
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

describe('PollingWorker', () => {
  let worker: PollingWorker;

  afterEach(() => worker.stop());

  it('runs again immediately while batches are full', async () => {
    const results = [result(2), result(2), result(1)];
    const task = fakeTask(async () => results.shift() ?? result(0));
    worker = new PollingWorker(task, { intervalMs: 10000, onError: jest.fn() });

    worker.start();
    await waitFor(() => task.run.mock.calls.length === 3);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(task.run).toHaveBeenCalledTimes(3);
  });

  it('reports thrown errors and keeps running', async () => {
    const error = new Error('broker down');
    const onError = jest.fn();
    let first = true;
    const task = fakeTask(async () => {
      if (first) {
        first = false;
        throw error;
      }
      return result(0);
    });
    worker = new PollingWorker(task, { intervalMs: 5, onError });

    worker.start();
    await waitFor(() => task.run.mock.calls.length >= 2);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('reports failed batches', async () => {
    const error = new Error('broker down');
    const onError = jest.fn();
    const task = fakeTask(async () => result(0, error));
    worker = new PollingWorker(task, { intervalMs: 10000, onError });

    worker.start();
    await waitFor(() => onError.mock.calls.length === 1);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('waits for a running batch when stopped', async () => {
    let release!: () => void;
    const task = fakeTask(() => {
      return new Promise((resolve) => {
        release = () => resolve(result(0));
      });
    });
    worker = new PollingWorker(task, { intervalMs: 10000, onError: jest.fn() });
    worker.start();
    await waitFor(() => task.run.mock.calls.length === 1);

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
