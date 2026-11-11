import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { TwitchChannelAnemic } from '../anemics/index.js';
import type { TwitchChannelData } from '../data/index.js';
import {
  TwitchChannelEvents,
  type TwitchChannelEventPayload,
} from '../events/index.js';
import { normalizeTwitchChannelData } from '../functions/index.js';

export class TwitchChannelDomain extends BaseDomain<
  TwitchChannelAnemic,
  TwitchChannelEventPayload
> {
  get isConnected(): boolean {
    return this.state.connected;
  }

  connect(): void {
    this.raise(TwitchChannelEvents.CONNECTED);
  }

  reconnect(data: TwitchChannelData): Result<void> {
    const normalized = normalizeTwitchChannelData(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    if (normalized.value.twitch_id !== this.state.twitch_id) {
      return Result.fail(
        new ConflictError(
          'Authorization belongs to a different Twitch account',
        ),
      );
    }

    this.state.login = normalized.value.login;
    this.state.display_name = normalized.value.display_name;
    this.state.scopes = normalized.value.scopes;
    this.state.connected = true;
    this.touch();
    this.raise(TwitchChannelEvents.CONNECTED);
    return Result.ok();
  }

  disconnect(): Result<void> {
    if (!this.state.connected) {
      return Result.fail(new ConflictError('Channel is not connected'));
    }

    this.state.connected = false;
    this.touch();
    this.raise(TwitchChannelEvents.DISCONNECTED);
    return Result.ok();
  }

  revoke(): Result<void> {
    if (!this.state.connected) {
      return Result.fail(new ConflictError('Channel is not connected'));
    }

    this.state.connected = false;
    this.touch();
    this.raise(TwitchChannelEvents.REVOKED);
    return Result.ok();
  }

  missingScopes(required: ReadonlyArray<string>): Array<string> {
    const granted = new Set(this.state.scopes);
    return required.filter((scope) => !granted.has(scope));
  }

  protected override toEventPayload(): TwitchChannelEventPayload {
    return {
      id: this.state.id,
      twitch_id: this.state.twitch_id,
      login: this.state.login,
      display_name: this.state.display_name,
      scopes: [...this.state.scopes],
      connected: this.state.connected,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
