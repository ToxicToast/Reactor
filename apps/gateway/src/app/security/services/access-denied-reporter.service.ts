import { Logger } from '@nestjs/common';
import {
  SecurityAccessEvents,
  SecurityTopics,
  type AccessDeniedPayloadV1,
} from '@toxictoast/contracts-events';
import {
  ActorType,
  normalizeIp,
  SYSTEM_ACTOR,
  type ActorIdentity,
  type DomainContext,
} from '@toxictoast/shared-kernel';
import type { EventPublisher } from '@toxictoast/shared-messaging';
import {
  describeError,
  type ActorContext,
  type CorrelationContext,
} from '@toxictoast/shared-system';
import type { Request } from 'express';
import { REPORTED_STATUS_CODES } from '../constants/index.js';

export class AccessDeniedReporter {
  private readonly logger = new Logger(AccessDeniedReporter.name);

  constructor(
    private readonly publisher: EventPublisher,
    private readonly ctx: DomainContext,
    private readonly actors: ActorContext,
    private readonly correlations: CorrelationContext,
  ) {}

  report(request: Request, statusCode: number): void {
    if (!REPORTED_STATUS_CODES.has(statusCode) || !request.ip) {
      return;
    }

    const ip = normalizeIp(request.ip);
    const userAgent = request.headers['user-agent'];
    const payload: AccessDeniedPayloadV1 = {
      ip,
      status_code: statusCode,
      method: request.method,
      path: request.path,
      user_agent: typeof userAgent === 'string' ? userAgent : null,
    };

    this.publisher
      .publish([
        {
          event_id: this.ctx.id.generate(),
          event_namespace: SecurityTopics.ACCESS,
          event_name: SecurityAccessEvents.DENIED,
          event_version: 1,
          aggregate_id: ip,
          occurred_at: this.ctx.date.now(),
          actor: this.actorOf(ip),
          correlation_id: this.correlations.current(),
          payload,
        },
      ])
      .catch((error: unknown) => {
        this.logger.warn(
          'Reporting a denied request failed',
          describeError(error),
        );
      });
  }

  private actorOf(ip: string): ActorIdentity {
    const actor = this.actors.current();
    if (actor === SYSTEM_ACTOR) {
      return { type: ActorType.ANONYMOUS, id: null, ip };
    }
    return { type: actor.type, id: actor.id, ip };
  }
}
