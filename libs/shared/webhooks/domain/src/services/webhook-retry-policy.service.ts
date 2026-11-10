import type { Nullable } from '@toxictoast/shared-types';
import { WEBHOOK_RETRY } from '../constants/index.js';
import type { WebhookRetryOptions } from '../interfaces/index.js';

export class WebhookRetryPolicy {
  constructor(private readonly options: WebhookRetryOptions = WEBHOOK_RETRY) {}

  nextAttemptAt(attempts: number, now: Date): Nullable<Date> {
    if (attempts >= this.options.MAX_ATTEMPTS) {
      return null;
    }
    const delay = Math.min(
      this.options.BASE_DELAY_MS * 2 ** Math.max(attempts - 1, 0),
      this.options.MAX_DELAY_MS,
    );
    return new Date(now.getTime() + delay);
  }
}
