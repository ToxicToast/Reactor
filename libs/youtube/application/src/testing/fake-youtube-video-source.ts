import type { YouTubeVideo, YouTubeVideoSource } from '../interfaces/index.js';

export class FakeYouTubeVideoSource implements YouTubeVideoSource {
  readonly uploads: Array<YouTubeVideo> = [];
  readonly requested: Array<ReadonlyArray<string>> = [];

  async listUploadIds(): Promise<Array<string>> {
    return this.uploads.map((video) => video.video_id);
  }

  async videos(
    _channel: unknown,
    ids: ReadonlyArray<string>,
  ): Promise<Array<YouTubeVideo>> {
    this.requested.push(ids);
    return this.uploads.filter((video) => ids.includes(video.video_id));
  }
}
