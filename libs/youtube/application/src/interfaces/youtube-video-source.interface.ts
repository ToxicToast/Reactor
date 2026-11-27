import type { YouTubeChannelAnemic } from '@toxictoast/youtube-domain';
import type { YouTubeVideo } from './youtube-video.interface.js';

export interface YouTubeVideoSource {
  /** alle Video-IDs der Upload-Playlist, neueste zuerst */
  listUploadIds(channel: YouTubeChannelAnemic): Promise<Array<string>>;
  /** fehlende IDs fehlen auch in der Antwort; die Quelle teilt in Pakete à 50 auf */
  videos(
    channel: YouTubeChannelAnemic,
    ids: ReadonlyArray<string>,
  ): Promise<Array<YouTubeVideo>>;
}
