import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { TwitchFriendAnemic } from '../anemics/index.js';
import type { TwitchFriendData } from '../data/index.js';
import {
  TwitchFriendEvents,
  type TwitchFriendEventPayload,
} from '../events/index.js';
import { normalizeTwitchIdentity } from '../functions/index.js';

export class TwitchFriendDomain extends BaseDomain<
  TwitchFriendAnemic,
  TwitchFriendEventPayload
> {
  add(): void {
    this.raise(TwitchFriendEvents.ADDED);
  }

  /** holt einen entfernten Freund zurück; ID, Import und Ledger bleiben erhalten */
  readd(data: TwitchFriendData): Result<void> {
    if (!this.isDeleted) {
      return Result.fail(
        new ConflictError(`${this.state.login} is already a friend`),
      );
    }
    const normalized = normalizeTwitchIdentity(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    if (normalized.value.twitch_id !== this.state.twitch_id) {
      return Result.fail(
        new ConflictError('Data belongs to a different Twitch account'),
      );
    }

    this.state.login = normalized.value.login;
    this.state.display_name = normalized.value.display_name;
    this.markRestored(TwitchFriendEvents.ADDED);
    return Result.ok();
  }

  remove(): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Friend is already removed'));
    }
    this.markDeleted(TwitchFriendEvents.REMOVED);
    return Result.ok();
  }

  protected override toEventPayload(): TwitchFriendEventPayload {
    return {
      id: this.state.id,
      twitch_id: this.state.twitch_id,
      login: this.state.login,
      display_name: this.state.display_name,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
