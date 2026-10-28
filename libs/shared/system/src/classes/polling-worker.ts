import type { Nullable } from '@toxictoast/shared-types';
import type {
  PollingResult,
  PollingTask,
  PollingWorkerOptions,
} from '../interfaces/index.js';

export class PollingWorker {
  private timer: Nullable<ReturnType<typeof setTimeout>> = null;
  private running: Nullable<Promise<void>> = null;
  private stopped = true;

  constructor(
    private readonly task: PollingTask,
    private readonly options: PollingWorkerOptions,
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
    const result = await this.runOnce();
    if (result.error) {
      this.options.onError(result.error);
    }
    if (this.stopped) {
      return;
    }

    if (result.processed >= this.task.batchSize) {
      this.schedule(0);
    } else {
      this.schedule(this.options.intervalMs);
    }
  }

  private async runOnce(): Promise<PollingResult> {
    try {
      return await this.task.run();
    } catch (error) {
      return { processed: 0, error };
    }
  }
}
