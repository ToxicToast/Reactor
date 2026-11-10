import { Injectable, Logger } from '@nestjs/common';
import { eventKey, readPayload } from '@toxictoast/shared-kernel';
import { RecordTwitchEventUseCase } from '@toxictoast/twitch-application';
import { recordInputOf } from '../functions/index.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';

@Injectable()
export class TwitchEventHandler {
  private readonly logger = new Logger(TwitchEventHandler.name);

  constructor(
    private readonly recordTwitchEventUseCase: RecordTwitchEventUseCase,
  ) {}

  async handle(event: IncomingTwitchEvent): Promise<void> {
    const input = readPayload(event.payload, (payload) => {
      return recordInputOf(event, payload);
    });
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring ${this.describe(event)}: ${input.error.message}`,
      );
      return;
    }

    const result = await this.recordTwitchEventUseCase.execute(input.value);
    if (result.isFailure) {
      this.logger.warn(
        `${this.describe(event)} not recorded: ${result.error.message}`,
      );
    }
  }

  private describe(event: IncomingTwitchEvent): string {
    return `${eventKey(event.event_namespace, event.event_name)} ${event.event_id}`;
  }
}
