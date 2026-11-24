import type { Nullable } from '@toxictoast/shared-types';
import {
  addCounters,
  CHANNEL_DAY_COUNTER_KEYS,
  FOLLOWER_TOTAL_METRIC,
  PEAK_CHATTERS_METRIC,
  zeroCounters,
  type ChannelDayCounters,
  type ChannelStatsRepository,
  type ClosedDayRange,
  type FollowerTotal,
  type TimelineMetric,
  type TimelinePoint,
} from '@toxictoast/twitch-domain';
import { compositeKey, isWithinDayRange } from './range-filters.js';

interface ChannelDay {
  readonly channel_id: string;
  readonly day: string;
  readonly counters: ChannelDayCounters;
  readonly peak_chatters: number;
  readonly follower_total: Nullable<number>;
}

export class InMemoryChannelStatsRepository implements ChannelStatsRepository {
  readonly days = new Map<string, ChannelDay>();

  async increment(
    channelId: string,
    day: string,
    deltas: Partial<ChannelDayCounters>,
  ): Promise<void> {
    const current = this.dayOf(channelId, day);
    this.days.set(compositeKey(channelId, day), {
      ...current,
      counters: addCounters(CHANNEL_DAY_COUNTER_KEYS, current.counters, deltas),
    });
  }

  async raisePeak(
    channelId: string,
    day: string,
    chatters: number,
  ): Promise<void> {
    const current = this.dayOf(channelId, day);
    this.days.set(compositeKey(channelId, day), {
      ...current,
      peak_chatters: Math.max(current.peak_chatters, chatters),
    });
  }

  async recordFollowerTotal(
    channelId: string,
    day: string,
    total: number,
  ): Promise<void> {
    const current = this.dayOf(channelId, day);
    this.days.set(compositeKey(channelId, day), {
      ...current,
      follower_total: total,
    });
  }

  async latestFollowerTotal(
    channelId: string,
  ): Promise<Nullable<FollowerTotal>> {
    const latest = [...this.days.values()]
      .filter((entry) => {
        return entry.channel_id === channelId && entry.follower_total !== null;
      })
      .sort((a, b) => b.day.localeCompare(a.day))[0];
    if (!latest || latest.follower_total === null) {
      return null;
    }
    return { day: latest.day, total: latest.follower_total };
  }

  /** Buckets in den In-Memory-Tests immer pro Tag, das Gruppieren nach Woche und Monat prüft die Integration-Spec. */
  async timeline(
    channelId: string,
    metric: TimelineMetric,
    _interval: string,
    range: ClosedDayRange,
  ): Promise<Array<TimelinePoint>> {
    return [...this.days.values()]
      .filter((entry) => {
        return (
          entry.channel_id === channelId && isWithinDayRange(entry.day, range)
        );
      })
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((entry) => {
        return { bucket_start: entry.day, value: this.valueOf(entry, metric) };
      });
  }

  counters(channelId: string, day: string): ChannelDayCounters {
    return this.dayOf(channelId, day).counters;
  }

  private valueOf(entry: ChannelDay, metric: TimelineMetric): number {
    if (metric === PEAK_CHATTERS_METRIC) {
      return entry.peak_chatters;
    }
    if (metric === FOLLOWER_TOTAL_METRIC) {
      return entry.follower_total ?? 0;
    }
    return entry.counters[metric];
  }

  private dayOf(channelId: string, day: string): ChannelDay {
    return (
      this.days.get(compositeKey(channelId, day)) ?? {
        channel_id: channelId,
        day,
        counters: zeroCounters(CHANNEL_DAY_COUNTER_KEYS),
        peak_chatters: 0,
        follower_total: null,
      }
    );
  }
}
