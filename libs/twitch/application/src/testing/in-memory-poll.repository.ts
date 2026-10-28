import { paginate } from '@toxictoast/shared-application';
import type { Optional } from '@toxictoast/shared-types';
import type {
  PollRepository,
  PollSnapshot,
  StatsRange,
  StoredPoll,
} from '@toxictoast/twitch-domain';
import { isWithinStatsRange } from './range-filters.js';

export class InMemoryPollRepository implements PollRepository {
  readonly items = new Map<string, StoredPoll>();

  async save(channelId: string, poll: PollSnapshot): Promise<void> {
    this.items.set(poll.poll_id, { ...poll, channel_id: channelId });
  }

  async list(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StoredPoll>> {
    const polls = [...this.items.values()]
      .filter((poll) => {
        return (
          poll.channel_id === channelId &&
          isWithinStatsRange(poll.started_at, range)
        );
      })
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
    return paginate(polls, limit, offset);
  }
}
