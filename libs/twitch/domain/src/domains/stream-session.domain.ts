import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { StreamSessionAnemic } from '../anemics/index.js';
import { SESSION_COUNTER_KEYS } from '../constants/index.js';
import { EndSessionEvent, StartSessionEvent } from '../events/index.js';
import { addCounters, secondsBetween } from '../functions/index.js';
import type { SessionCounters } from '../types/index.js';

export class StreamSessionDomain extends BaseDomain<StreamSessionAnemic> {
  get isLive(): boolean {
    return this.state.ended_at === null;
  }

  start(): void {
    this.raise(StartSessionEvent);
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
    this.raise(EndSessionEvent);
    return Result.ok();
  }
}
