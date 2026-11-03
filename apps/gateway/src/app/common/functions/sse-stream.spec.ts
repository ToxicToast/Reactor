import type { MessageEvent } from '@nestjs/common';
import { defer, NEVER, Subject } from 'rxjs';
import { SSE } from '../constants/index.js';
import { sseStream } from './sse-stream.function.js';

describe('sseStream', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('emits data and heartbeats until the source completes', () => {
    const source = new Subject<{ value: number }>();
    const received: Array<MessageEvent> = [];
    let completed = false;

    sseStream(source, 'live').subscribe({
      next: (event) => received.push(event),
      complete: () => {
        completed = true;
      },
    });
    source.next({ value: 1 });
    jest.advanceTimersByTime(SSE.HEARTBEAT_MS);
    source.complete();
    jest.advanceTimersByTime(SSE.HEARTBEAT_MS);

    expect(received).toEqual([
      { type: 'live', data: { value: 1 }, retry: SSE.RETRY_MS },
      { type: SSE.HEARTBEAT_TYPE, data: '' },
    ]);
    expect(completed).toBe(true);
  });

  it('opens the source only once', () => {
    let subscriptions = 0;
    const source = defer(() => {
      subscriptions++;
      return NEVER;
    });

    const subscription = sseStream(source, 'live').subscribe();
    subscription.unsubscribe();

    expect(subscriptions).toBe(1);
  });
});
