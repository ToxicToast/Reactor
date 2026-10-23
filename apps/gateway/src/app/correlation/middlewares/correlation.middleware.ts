import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import { isUuid, type DomainContext } from '@toxictoast/shared-kernel';
import { TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { NextFunction, Request, Response } from 'express';
import { CORRELATION_HEADER } from '../constants/index.js';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(
    private readonly correlations: CorrelationContext,
    @Inject(TOKENS.DOMAIN_CONTEXT) private readonly ctx: DomainContext,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const sent = request.headers[CORRELATION_HEADER];
    const correlationId = isUuid(sent) ? sent : this.ctx.id.generate();

    response.setHeader(CORRELATION_HEADER, correlationId);
    this.correlations.run(correlationId, next);
  }
}
