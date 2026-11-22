import { paginate } from '@toxictoast/shared-application/testing';
import type { Optional } from '@toxictoast/shared-types';
import type {
  Video,
  VideoFilter,
  VideoRepository,
} from '@toxictoast/twitch-domain';

export class InMemoryVideoRepository implements VideoRepository {
  readonly items = new Map<string, Video>();

  async save(video: Video): Promise<void> {
    this.items.set(video.video_id, video);
  }

  async list(
    filter: VideoFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Video>> {
    const matching = [...this.items.values()]
      .filter((video) => video.channel_id === filter.channel_id)
      .filter((video) => filter.type === null || video.type === filter.type)
      .filter((video) => {
        return (
          filter.stream_id === null || video.stream_id === filter.stream_id
        );
      })
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return paginate(matching, limit, offset);
  }
}
