import { Logger } from '@nestjs/common';
import {
  ShortenerClickEvents,
  ShortenerTopics,
  type ShortenerClickPayloadV1,
} from '@toxictoast/contracts-events';
import { ActorType, type DomainContext } from '@toxictoast/shared-kernel';
import type { EventPublisher } from '@toxictoast/shared-messaging';
import {
  describeError,
  type CorrelationContext,
} from '@toxictoast/shared-system';
import type { Request } from 'express';

/** Fire-and-forget wie der AccessDeniedReporter; ein verlorener Klick bremst keinen Redirect */
export class LinkClickReporter {
  private readonly logger = new Logger(LinkClickReporter.name);

  constructor(
    private readonly publisher: EventPublisher,
    private readonly ctx: DomainContext,
    private readonly correlations: CorrelationContext,
  ) {}

  report(linkId: string, request: Request): void {
    const payload: ShortenerClickPayloadV1 = {
      link_id: linkId,
      referer: this.header(request, 'referer'),
      user_agent: this.header(request, 'user-agent'),
      country: null,
    };

    this.publisher
      .publish([
        {
          event_id: this.ctx.id.generate(),
          event_namespace: ShortenerTopics.CLICK,
          event_name: ShortenerClickEvents.CLICKED,
          event_version: 1,
          aggregate_id: linkId,
          occurred_at: this.ctx.date.now(),
          // bewusst ohne IP, auch nicht im Actor
          actor: { type: ActorType.ANONYMOUS, id: null, ip: null },
          correlation_id: this.correlations.current(),
          payload,
        },
      ])
      .catch((error: unknown) => {
        this.logger.warn('Reporting a link click failed', describeError(error));
      });
  }

  private header(request: Request, name: string): string | null {
    const value = request.headers[name];
    return typeof value === 'string' && value.length > 0 ? value : null;
  }
}
