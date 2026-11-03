import type { MessageEvent } from '@nestjs/common';
import {
  endWith,
  ignoreElements,
  interval,
  map,
  merge,
  share,
  takeUntil,
  type Observable,
} from 'rxjs';
import { SSE } from '../constants/index.js';

export const sseStream = <T extends object>(
  source: Observable<T>,
  type: string,
): Observable<MessageEvent> => {
  const shared = source.pipe(share());
  const ended = shared.pipe(ignoreElements(), endWith(true));

  return merge(
    shared.pipe(
      map((data): MessageEvent => ({ type, data, retry: SSE.RETRY_MS })),
    ),
    interval(SSE.HEARTBEAT_MS).pipe(
      takeUntil(ended),
      map((): MessageEvent => ({ type: SSE.HEARTBEAT_TYPE, data: '' })),
    ),
  );
};
