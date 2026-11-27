import type { Nullable } from '@toxictoast/shared-types';
import type {
  YouTubeAnalyticsSource,
  YouTubeVideoAnalytics,
} from '../interfaces/index.js';

export class FakeYouTubeAnalyticsSource implements YouTubeAnalyticsSource {
  readonly values = new Map<string, YouTubeVideoAnalytics>();

  async videoAnalytics(
    _channel: unknown,
    videoId: string,
  ): Promise<Nullable<YouTubeVideoAnalytics>> {
    return this.values.get(videoId) ?? null;
  }
}
