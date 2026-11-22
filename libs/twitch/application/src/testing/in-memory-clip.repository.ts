import { paginate } from '@toxictoast/shared-application/testing';
import type { Optional } from '@toxictoast/shared-types';
import type {
  Clip,
  ClipFilter,
  ClipRepository,
} from '@toxictoast/twitch-domain';

export class InMemoryClipRepository implements ClipRepository {
  readonly items = new Map<string, Clip>();

  async save(clip: Clip): Promise<void> {
    this.items.set(clip.clip_id, clip);
  }

  async list(
    filter: ClipFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Clip>> {
    const matching = [...this.items.values()]
      .filter((clip) => clip.channel_id === filter.channel_id)
      .filter((clip) => filter.vod_id === null || clip.vod_id === filter.vod_id)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return paginate(matching, limit, offset);
  }
}
