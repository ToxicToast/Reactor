import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { WebhookDeliveryAnemic } from '../anemics/index.js';
import { WebhookDeliveryStatus } from '../constants/index.js';
import { truncateWebhookError } from '../functions/index.js';
import type { WebhookAttemptFailure } from '../interfaces/index.js';
import type { WebhookRetryPolicy } from '../services/index.js';

export class WebhookDeliveryDomain extends BaseDomain<WebhookDeliveryAnemic> {
  get isPending(): boolean {
    return this.state.status === WebhookDeliveryStatus.PENDING;
  }

  delivered(statusCode: number): Result<void> {
    const pending = this.ensurePending();
    if (pending.isFailure) {
      return pending;
    }

    this.state.status = WebhookDeliveryStatus.DELIVERED;
    this.state.attempts = this.state.attempts + 1;
    this.state.last_status_code = statusCode;
    this.state.last_error = null;
    this.state.next_attempt_at = null;
    this.state.delivered_at = this.ctx.date.now();
    this.touch();
    return Result.ok();
  }

  attemptFailed(
    failure: WebhookAttemptFailure,
    policy: WebhookRetryPolicy,
  ): Result<void> {
    const pending = this.ensurePending();
    if (pending.isFailure) {
      return pending;
    }

    const attempts = this.state.attempts + 1;
    const next = policy.nextAttemptAt(attempts, this.ctx.date.now());
    this.state.attempts = attempts;
    this.state.last_status_code = failure.status_code;
    this.state.last_error = truncateWebhookError(failure.error);
    this.state.next_attempt_at = next;
    if (next === null) {
      this.state.status = WebhookDeliveryStatus.FAILED;
    }
    this.touch();
    return Result.ok();
  }

  abandon(reason: string): Result<void> {
    const pending = this.ensurePending();
    if (pending.isFailure) {
      return pending;
    }

    this.state.status = WebhookDeliveryStatus.FAILED;
    this.state.last_error = truncateWebhookError(reason);
    this.state.next_attempt_at = null;
    this.touch();
    return Result.ok();
  }

  private ensurePending(): Result<void> {
    if (!this.isPending) {
      return Result.fail(new ConflictError('Delivery is not pending'));
    }
    return Result.ok();
  }
}
