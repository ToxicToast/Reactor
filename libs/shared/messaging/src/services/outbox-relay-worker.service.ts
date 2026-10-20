import type { Nullable } from '@toxictoast/shared-kernel';
import type {
  OutboxRelayResult,
  OutboxRelayWorkerOptions,
} from '../interfaces/index.js';
import type { OutboxRelay } from './outbox-relay.service.js';

export class OutboxRelayWorker {
  private timer: Nullable<ReturnType<typeof setTimeout>> = null;
  private running: Nullable<Promise<void>> = null;
  private stopped = true;

  constructor(
    private readonly relay: OutboxRelay,
    private readonly options: OutboxRelayWorkerOptions,
  ) {}

  start(): void {
    if (!this.stopped) {
      return;
    }
    this.stopped = false;
    this.schedule(0);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.running;
  }

  private schedule(delay: number): void {
    this.timer = setTimeout(() => {
      this.timer = null;
      this.running = this.tick();
    }, delay);
  }

  private async tick(): Promise<void> {
    const result = await this.relayOnce();
    if (result.error) {
      this.options.onError(result.error);
    }
    if (this.stopped) {
      return;
    }

    if (result.published >= this.relay.batchSize) {
      this.schedule(0);
    } else {
      this.schedule(this.options.intervalMs);
    }
  }

  private async relayOnce(): Promise<OutboxRelayResult> {
    try {
      return await this.relay.relay();
    } catch (error) {
      return { published: 0, failed: 0, error };
    }
  }
}
