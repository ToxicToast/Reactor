import type {
  DayRange,
  RewardRef,
  RewardStat,
  RewardStatsRepository,
} from '@toxictoast/twitch-domain';
import { compositeKey, isWithinDayRange } from './range-filters.js';

interface RewardDay {
  readonly channel_id: string;
  readonly day: string;
  readonly reward: RewardRef;
  readonly redemptions: number;
}

export class InMemoryRewardStatsRepository implements RewardStatsRepository {
  private readonly days = new Map<string, RewardDay>();

  async increment(
    channelId: string,
    reward: RewardRef,
    day: string,
  ): Promise<void> {
    const key = compositeKey(channelId, reward.reward_id, day);
    this.days.set(key, {
      channel_id: channelId,
      day,
      reward,
      redemptions: (this.days.get(key)?.redemptions ?? 0) + 1,
    });
  }

  async list(channelId: string, range: DayRange): Promise<Array<RewardStat>> {
    const totals = new Map<string, RewardStat>();
    for (const entry of this.days.values()) {
      if (
        entry.channel_id !== channelId ||
        !isWithinDayRange(entry.day, range)
      ) {
        continue;
      }
      const current = totals.get(entry.reward.reward_id);
      const redemptions = (current?.redemptions ?? 0) + entry.redemptions;
      totals.set(entry.reward.reward_id, {
        ...entry.reward,
        redemptions,
        points_spent: redemptions * entry.reward.cost,
      });
    }
    return [...totals.values()].sort((a, b) => b.redemptions - a.redemptions);
  }
}
