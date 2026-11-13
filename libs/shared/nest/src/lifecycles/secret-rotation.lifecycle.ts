import { Logger, type OnModuleInit } from '@nestjs/common';
import type { SecretRotation } from '@toxictoast/shared-persistence';

export class SecretRotationLifecycle implements OnModuleInit {
  private readonly logger = new Logger(SecretRotationLifecycle.name);

  constructor(private readonly rotation: SecretRotation) {}

  async onModuleInit(): Promise<void> {
    const rotated = await this.rotation.rotate();
    if (rotated > 0) {
      this.logger.log(`Re-encrypted ${rotated} rows in ${this.rotation.table}`);
    }
  }
}
