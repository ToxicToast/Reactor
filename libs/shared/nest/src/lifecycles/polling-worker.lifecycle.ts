import type {
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
} from '@nestjs/common';
import type { PollingWorker } from '@toxictoast/shared-system';

export class PollingWorkerLifecycle
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  constructor(private readonly worker: PollingWorker) {}

  onApplicationBootstrap(): void {
    this.worker.start();
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.worker.stop();
  }
}
