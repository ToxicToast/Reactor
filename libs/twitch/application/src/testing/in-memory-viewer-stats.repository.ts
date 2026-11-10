import {
  addCounters,
  VIEWER_COUNTER_KEYS,
  zeroCounters,
  type DayRange,
  type LeaderboardEntry,
  type LeaderboardMetric,
  type ViewerCounters,
  type ViewerRef,
  type ViewerStatsRepository,
} from '@toxictoast/twitch-domain';
import { compositeKey, isWithinDayRange } from './range-filters.js';

interface ViewerDay {
  readonly channel_id: string;
  readonly user_id: string;
  readonly day: string;
  readonly counters: ViewerCounters;
}

export class InMemoryViewerStatsRepository implements ViewerStatsRepository {
  readonly viewers = new Map<string, ViewerRef>();
  readonly days = new Map<string, ViewerDay>();

  async remember(channelId: string, viewer: ViewerRef): Promise<void> {
    this.viewers.set(compositeKey(channelId, viewer.user_id), viewer);
  }

  async increment(
    channelId: string,
    userId: string,
    day: string,
    deltas: Partial<ViewerCounters>,
  ): Promise<void> {
    const key = compositeKey(channelId, userId, day);
    const current =
      this.days.get(key)?.counters ?? zeroCounters(VIEWER_COUNTER_KEYS);
    this.days.set(key, {
      channel_id: channelId,
      user_id: userId,
      day,
      counters: addCounters(VIEWER_COUNTER_KEYS, current, deltas),
    });
  }

  async leaderboard(
    channelId: string,
    metric: LeaderboardMetric,
    range: DayRange,
    limit: number,
  ): Promise<Array<LeaderboardEntry>> {
    const totals = new Map<string, number>();
    for (const entry of this.days.values()) {
      if (
        entry.channel_id === channelId &&
        isWithinDayRange(entry.day, range)
      ) {
        totals.set(
          entry.user_id,
          (totals.get(entry.user_id) ?? 0) + entry.counters[metric],
        );
      }
    }
    return [...totals.entries()]
      .filter(([, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([userId, value]) => {
        const viewer = this.viewers.get(compositeKey(channelId, userId));
        return {
          user_id: userId,
          user_login: viewer?.user_login ?? userId,
          user_name: viewer?.user_name ?? userId,
          value,
        };
      });
  }

  total(channelId: string, userId: string): ViewerCounters {
    let total = zeroCounters(VIEWER_COUNTER_KEYS);
    for (const entry of this.days.values()) {
      if (entry.channel_id === channelId && entry.user_id === userId) {
        total = addCounters(VIEWER_COUNTER_KEYS, total, entry.counters);
      }
    }
    return total;
  }
}
