import { Injectable, Logger } from '@nestjs/common';
import { readPayload } from '@toxictoast/shared-kernel';
import { RecordClickUseCase } from '@toxictoast/shortener-application';
import type { LinkId } from '@toxictoast/shortener-domain';

@Injectable()
export class LinkClickHandler {
  private readonly logger = new Logger(LinkClickHandler.name);

  constructor(private readonly recordClickUseCase: RecordClickUseCase) {}

  /** Event-ID und Zeitpunkt kommen aus dem Umschlag, damit ein Replay nicht doppelt zählt */
  async handle(event: unknown): Promise<void> {
    const input = readPayload(event, (reader) => {
      const payload = reader.record('payload');
      return {
        event_id: reader.uuid('event_id'),
        clicked_at: reader.date('occurred_at'),
        link_id: payload.uuid('link_id') as LinkId,
        referer: payload.nullableString('referer'),
        user_agent: payload.nullableString('user_agent'),
        country: payload.nullableString('country'),
      };
    });
    if (input.isFailure) {
      this.logger.warn(
        `Ignoring invalid shortener.click event: ${input.error.message}`,
      );
      return;
    }

    await this.recordClickUseCase.execute(input.value);
  }
}
