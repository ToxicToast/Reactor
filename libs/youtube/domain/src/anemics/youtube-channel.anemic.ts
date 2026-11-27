import type { ConnectedAccountAnemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { YouTubeChannelId } from '../types/index.js';

export interface YouTubeChannelAnemic extends ConnectedAccountAnemic<YouTubeChannelId> {
  /** UC…, 24 Zeichen */
  readonly youtube_id: string;
  /** @ToxicToastTTV; nicht jeder Kanal hat eines */
  readonly handle: Nullable<string>;
  readonly title: string;
}
