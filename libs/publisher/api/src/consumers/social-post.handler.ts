import { Injectable, Logger } from '@nestjs/common';
import {
  RecordPostFailureUseCase,
  RecordPostUseCase,
} from '@toxictoast/publisher-application';
import { readPayload } from '@toxictoast/shared-kernel';
import {
  recordPostFailureInputOf,
  recordPostInputOf,
} from '../functions/index.js';

@Injectable()
export class SocialPostHandler {
  private readonly logger = new Logger(SocialPostHandler.name);

  constructor(
    private readonly recordPostUseCase: RecordPostUseCase,
    private readonly recordPostFailureUseCase: RecordPostFailureUseCase,
  ) {}

  async handleObserved(event: unknown): Promise<void> {
    const input = readPayload(event, recordPostInputOf);
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring invalid social.post event: ${input.error.message}`,
      );
      return;
    }
    await this.recordPostUseCase.execute(input.value);
  }

  async handleCheckFailed(event: unknown): Promise<void> {
    const input = readPayload(event, recordPostFailureInputOf);
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring invalid social.post check_failed event: ${input.error.message}`,
      );
      return;
    }
    await this.recordPostFailureUseCase.execute(input.value);
  }
}
