import { ConnectedAccountDomain, type Result } from '@toxictoast/shared-kernel';
import type { YouTubeChannelAnemic } from '../anemics/index.js';
import { YOUTUBE_CHANNEL_MESSAGES } from '../constants/index.js';
import type { YouTubeChannelData } from '../data/index.js';
import {
  YouTubeChannelEvents,
  type YouTubeChannelEventPayload,
} from '../events/index.js';
import { normalizeYouTubeChannelData } from '../functions/index.js';

export class YouTubeChannelDomain extends ConnectedAccountDomain<
  YouTubeChannelAnemic,
  YouTubeChannelData,
  YouTubeChannelEventPayload
> {
  protected readonly events = YouTubeChannelEvents;
  protected readonly messages = YOUTUBE_CHANNEL_MESSAGES;

  protected normalize(data: YouTubeChannelData): Result<YouTubeChannelData> {
    return normalizeYouTubeChannelData(data);
  }

  protected isSameAccount(data: YouTubeChannelData): boolean {
    return data.youtube_id === this.state.youtube_id;
  }

  protected apply(data: YouTubeChannelData): void {
    this.state.handle = data.handle;
    this.state.title = data.title;
  }

  protected override toEventPayload(): YouTubeChannelEventPayload {
    return {
      id: this.state.id,
      youtube_id: this.state.youtube_id,
      handle: this.state.handle,
      title: this.state.title,
      scopes: [...this.state.scopes],
      connected: this.state.connected,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
