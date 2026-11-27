import { ConnectedAccountDomain, type Result } from '@toxictoast/shared-kernel';
import type { TwitchChannelAnemic } from '../anemics/index.js';
import { TWITCH_CHANNEL_MESSAGES } from '../constants/index.js';
import type { TwitchChannelData } from '../data/index.js';
import {
  TwitchChannelEvents,
  type TwitchChannelEventPayload,
} from '../events/index.js';
import { normalizeTwitchChannelData } from '../functions/index.js';

export class TwitchChannelDomain extends ConnectedAccountDomain<
  TwitchChannelAnemic,
  TwitchChannelData,
  TwitchChannelEventPayload
> {
  protected readonly events = TwitchChannelEvents;
  protected readonly messages = TWITCH_CHANNEL_MESSAGES;

  protected normalize(data: TwitchChannelData): Result<TwitchChannelData> {
    return normalizeTwitchChannelData(data);
  }

  protected isSameAccount(data: TwitchChannelData): boolean {
    return data.twitch_id === this.state.twitch_id;
  }

  protected apply(data: TwitchChannelData): void {
    this.state.login = data.login;
    this.state.display_name = data.display_name;
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
