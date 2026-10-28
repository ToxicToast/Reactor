import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { WebhookAnemic } from '../anemics/index.js';
import type { UpdateWebhookData } from '../data/index.js';
import {
  isWebhookActive,
  matchesEventKey,
  normalizeWebhookData,
  validateWebhookSecret,
} from '../functions/index.js';

export class WebhookDomain extends BaseDomain<WebhookAnemic> {
  get isActive(): boolean {
    return isWebhookActive(this.state);
  }

  subscribesTo(eventKey: string): boolean {
    return this.isActive && matchesEventKey(this.state.events, eventKey);
  }

  update(data: UpdateWebhookData): Result<void> {
    const writable = this.ensureNotDeleted();
    if (writable.isFailure) {
      return writable;
    }
    const normalized = normalizeWebhookData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    this.state.url = normalized.value.url;
    this.state.events = normalized.value.events;
    this.state.description = normalized.value.description;
    this.state.active = data.active;
    this.touch();
    return Result.ok();
  }

  rotateSecret(secret: string): Result<void> {
    const writable = this.ensureNotDeleted();
    if (writable.isFailure) {
      return writable;
    }
    const valid = validateWebhookSecret(secret);
    if (valid.isFailure) {
      return valid;
    }

    this.state.secret = secret;
    this.touch();
    return Result.ok();
  }

  delete(): Result<void> {
    const writable = this.ensureNotDeleted();
    if (writable.isFailure) {
      return writable;
    }

    this.state.active = false;
    this.state.deleted_at = this.ctx.date.now();
    this.touch();
    return Result.ok();
  }

  private ensureNotDeleted(): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Webhook is deleted'));
    }
    return Result.ok();
  }
}
