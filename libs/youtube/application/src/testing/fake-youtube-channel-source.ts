import type {
  YouTubeChannelProfile,
  YouTubeChannelSource,
} from '../interfaces/index.js';
import { YOUTUBE_ID } from './youtube-channel-anemic.fixture.js';

export class FakeYouTubeChannelSource implements YouTubeChannelSource {
  current: YouTubeChannelProfile = {
    youtube_id: YOUTUBE_ID,
    handle: '@ToxicToastTTV',
    title: 'ToxicToast',
    subscribers: 120,
    video_count: 40,
  };

  async profile(): Promise<YouTubeChannelProfile> {
    return this.current;
  }
}
