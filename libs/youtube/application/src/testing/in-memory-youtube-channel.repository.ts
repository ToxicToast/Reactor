import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  YouTubeChannelAnemic,
  YouTubeChannelId,
  YouTubeChannelRepository,
} from '@toxictoast/youtube-domain';

export class InMemoryYouTubeChannelRepository implements YouTubeChannelRepository {
  readonly items = new Map<YouTubeChannelId, YouTubeChannelAnemic>();

  async save(anemic: YouTubeChannelAnemic): Promise<YouTubeChannelAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<YouTubeChannelAnemic>> {
    const channels = [...this.items.values()].filter((channel) => {
      return withDeleted || channel.deleted_at === null;
    });
    return channels.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
  }

  async findById(
    id: YouTubeChannelId,
  ): Promise<Nullable<YouTubeChannelAnemic>> {
    return this.items.get(id) ?? null;
  }

  async findByYouTubeId(
    youtubeId: string,
  ): Promise<Nullable<YouTubeChannelAnemic>> {
    return (
      [...this.items.values()].find((channel) => {
        return channel.youtube_id === youtubeId;
      }) ?? null
    );
  }

  async findConnected(): Promise<Array<YouTubeChannelAnemic>> {
    return [...this.items.values()].filter((channel) => {
      return channel.connected && channel.deleted_at === null;
    });
  }
}
