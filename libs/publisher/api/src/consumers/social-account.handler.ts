import { Injectable, Logger } from '@nestjs/common';
import { RecordAccountUseCase } from '@toxictoast/publisher-application';
import { readPayload } from '@toxictoast/shared-kernel';
import { recordAccountInputOf } from '../functions/index.js';

@Injectable()
export class SocialAccountHandler {
  private readonly logger = new Logger(SocialAccountHandler.name);

  constructor(private readonly recordAccountUseCase: RecordAccountUseCase) {}

  async handleObserved(event: unknown): Promise<void> {
    const input = readPayload(event, recordAccountInputOf);
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring invalid social.account event: ${input.error.message}`,
      );
      return;
    }
    await this.recordAccountUseCase.execute(input.value);
  }
}
