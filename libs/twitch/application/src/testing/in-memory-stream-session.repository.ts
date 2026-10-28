import { paginate } from '@toxictoast/shared-application';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  StatsRange,
  StreamSessionAnemic,
  StreamSessionId,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import { isWithinStatsRange } from './range-filters.js';

const newestFirst = (a: StreamSessionAnemic, b: StreamSessionAnemic): number =>
  b.started_at.getTime() - a.started_at.getTime();

export class InMemoryStreamSessionRepository implements StreamSessionRepository {
  readonly items = new Map<StreamSessionId, StreamSessionAnemic>();

  async save(anemic: StreamSessionAnemic): Promise<StreamSessionAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findById(id: StreamSessionId): Promise<Nullable<StreamSessionAnemic>> {
    return this.items.get(id) ?? null;
  }

  async findList(
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StreamSessionAnemic>> {
    return paginate([...this.items.values()].sort(newestFirst), limit, offset);
  }

  async findLive(channelId: string): Promise<Nullable<StreamSessionAnemic>> {
    return (
      this.ofChannel(channelId).find((session) => session.ended_at === null) ??
      null
    );
  }

  async findLatest(channelId: string): Promise<Nullable<StreamSessionAnemic>> {
    return this.ofChannel(channelId)[0] ?? null;
  }

  async findByChannel(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StreamSessionAnemic>> {
    const sessions = this.ofChannel(channelId).filter((session) => {
      return isWithinStatsRange(session.started_at, range);
    });
    return paginate(sessions, limit, offset);
  }

  private ofChannel(channelId: string): Array<StreamSessionAnemic> {
    return [...this.items.values()]
      .filter((session) => session.channel_id === channelId)
      .sort(newestFirst);
  }
}
