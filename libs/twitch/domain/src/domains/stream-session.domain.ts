import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { StreamSessionAnemic } from '../anemics/index.js';
import { SESSION_COUNTER_KEYS } from '../constants/index.js';
import {
  StreamSessionEvents,
  type StreamSessionEventPayload,
} from '../events/index.js';
import {
  addCounters,
  averageViewers,
  secondsBetween,
} from '../functions/index.js';
import type { StreamStatus } from '../interfaces/index.js';
import type { SessionCounters } from '../types/index.js';

export class StreamSessionDomain extends BaseDomain<
  StreamSessionAnemic,
  StreamSessionEventPayload
> {
  get isLive(): boolean {
    return this.state.ended_at === null;
  }

  start(): void {
    this.raise(StreamSessionEvents.STARTED);
  }

  record(deltas: Partial<SessionCounters>): void {
    if (!this.isLive) {
      return;
    }
    Object.assign(
      this.state,
      addCounters(SESSION_COUNTER_KEYS, this.state, deltas),
    );
    this.touch();
  }

  observeChatters(count: number): void {
    if (!this.isLive || count <= this.state.peak_chatters) {
      return;
    }
    this.state.peak_chatters = count;
    this.touch();
  }

  /** eine Messung pro Minute: Titel und Spiel überschreiben, Zuschauer aufsummieren */
  observeStatus(status: StreamStatus): void {
    if (!this.isLive) {
      return;
    }
    this.state.title = status.title;
    this.state.game_id = status.game_id;
    this.state.game_name = status.game_name;
    this.state.viewer_count = status.viewer_count;
    this.state.peak_viewers = Math.max(
      this.state.peak_viewers,
      status.viewer_count,
    );
    this.state.viewer_samples = this.state.viewer_samples + 1;
    this.state.viewer_sum = this.state.viewer_sum + status.viewer_count;
    this.touch();
  }

  countUniqueChatter(): void {
    if (!this.isLive) {
      return;
    }
    this.state.unique_chatters = this.state.unique_chatters + 1;
    this.touch();
  }

  end(endedAt: Date): Result<void> {
    if (!this.isLive) {
      return Result.fail(new ConflictError('Session has already ended'));
    }

    this.state.ended_at = endedAt;
    this.state.duration_seconds = secondsBetween(
      this.state.started_at,
      endedAt,
    );
    this.touch();
    this.raise(StreamSessionEvents.ENDED);
    return Result.ok();
  }

  protected override toEventPayload(): StreamSessionEventPayload {
    return {
      id: this.state.id,
      channel_id: this.state.channel_id,
      channel_login: this.state.channel_login,
      channel_name: this.state.channel_name,
      stream_id: this.state.stream_id,
      started_at: this.state.started_at,
      ended_at: this.state.ended_at,
      duration_seconds: this.state.duration_seconds,
      peak_chatters: this.state.peak_chatters,
      unique_chatters: this.state.unique_chatters,
      messages: this.state.messages,
      follows: this.state.follows,
      subscriptions: this.state.subscriptions,
      resubscriptions: this.state.resubscriptions,
      gifted_subs: this.state.gifted_subs,
      bits: this.state.bits,
      raids: this.state.raids,
      raid_viewers: this.state.raid_viewers,
      redemptions: this.state.redemptions,
      title: this.state.title,
      game_id: this.state.game_id,
      game_name: this.state.game_name,
      viewer_count: this.state.viewer_count,
      peak_viewers: this.state.peak_viewers,
      average_viewers: averageViewers(this.state),
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
