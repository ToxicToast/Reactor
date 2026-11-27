import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { YouTubeChannelAnemic } from '../anemics/index.js';

export interface YouTubeChannelRepository extends Repository<YouTubeChannelAnemic> {
  findByYouTubeId(youtubeId: string): Promise<Nullable<YouTubeChannelAnemic>>;
  findConnected(): Promise<Array<YouTubeChannelAnemic>>;
}
