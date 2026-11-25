import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { LinkAnemic } from '../anemics/index.js';
import type { LinkChanges } from '../data/index.js';
import { LinkEvents, type LinkEventPayload } from '../events/index.js';
import { normalizeLinkData } from '../functions/index.js';

export class LinkDomain extends BaseDomain<LinkAnemic, LinkEventPayload> {
  get isResolvable(): boolean {
    return !this.isDeleted && this.state.active;
  }

  create(): void {
    this.raise(LinkEvents.CREATED);
  }

  update(changes: LinkChanges): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Link is deleted'));
    }
    const normalized = normalizeLinkData(changes);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    const unchanged =
      normalized.value.target_url === this.state.target_url &&
      normalized.value.description === this.state.description &&
      changes.active === this.state.active;
    if (unchanged) {
      return Result.ok();
    }

    this.state.target_url = normalized.value.target_url;
    this.state.description = normalized.value.description;
    this.state.active = changes.active;
    this.touch();
    this.raise(LinkEvents.UPDATED);
    return Result.ok();
  }

  delete(): void {
    this.markDeleted(LinkEvents.DELETED);
  }

  restore(): void {
    this.markRestored(LinkEvents.RESTORED);
  }

  protected override toEventPayload(): LinkEventPayload {
    return {
      id: this.state.id,
      target_url: this.state.target_url,
      description: this.state.description,
      active: this.state.active,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
