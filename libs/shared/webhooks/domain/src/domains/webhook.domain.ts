import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { WebhookAnemic } from '../anemics/index.js';
import type { UpdateWebhookData } from '../data/index.js';
import { WebhookEvents, type WebhookEventPayload } from '../events/index.js';
import {
  isWebhookActive,
  matchesEventKey,
  normalizeWebhookData,
  validateWebhookSecret,
} from '../functions/index.js';

export class WebhookDomain extends BaseDomain<
  WebhookAnemic,
  WebhookEventPayload
> {
  get isActive(): boolean {
    return isWebhookActive(this.state);
  }

  subscribesTo(eventKey: string): boolean {
    return this.isActive && matchesEventKey(this.state.events, eventKey);
  }

  createWebhook(): void {
    this.raise(WebhookEvents.CREATED);
  }

  update(data: UpdateWebhookData): Result<void> {
    const writable = this.ensureNotDeleted();
    if (writable.isFailure) {
      return writable;
    }
    const normalized = normalizeWebhookData({
      ...data,
      format: data.format ?? this.state.format,
    });
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    this.state.url = normalized.value.url;
    this.state.events = normalized.value.events;
    this.state.description = normalized.value.description;
    this.state.format = normalized.value.format;
    this.state.active = data.active;
    this.touch();
    this.raise(WebhookEvents.UPDATED);
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
    this.raise(WebhookEvents.SECRET_ROTATED);
    return Result.ok();
  }

  delete(): Result<void> {
    const writable = this.ensureNotDeleted();
    if (writable.isFailure) {
      return writable;
    }

    this.state.active = false;
    this.markDeleted(WebhookEvents.DELETED);
    return Result.ok();
  }

  protected override toEventPayload(): WebhookEventPayload {
    return {
      id: this.state.id,
      events: [...this.state.events],
      description: this.state.description,
      active: this.state.active,
      format: this.state.format,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }

  private ensureNotDeleted(): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Webhook is deleted'));
    }
    return Result.ok();
  }
}
