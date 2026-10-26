import {
  HttpStatus,
  Inject,
  Injectable,
  type NestMiddleware,
} from '@nestjs/common';
import type { Clock } from '@toxictoast/shared-kernel';
import { TOKENS } from '@toxictoast/shared-nest';
import { CorrelationContext } from '@toxictoast/shared-system';
import type { NextFunction, Request, Response } from 'express';
import { BanList } from '../services/index.js';

@Injectable()
export class BanMiddleware implements NestMiddleware {
  constructor(
    private readonly bans: BanList,
    private readonly correlations: CorrelationContext,
    @Inject(TOKENS.CLOCK) private readonly clock: Clock,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const until = request.ip ? this.bans.bannedUntil(request.ip) : null;
    if (!until) {
      next();
      return;
    }

    const retryAfter = Math.max(
      1,
      Math.ceil((until.getTime() - this.clock.now().getTime()) / 1000),
    );
    response.setHeader('Retry-After', String(retryAfter));
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      status_code: HttpStatus.TOO_MANY_REQUESTS,
      message: 'too many failed requests, try again later',
      retry_after: retryAfter,
      correlation_id: this.correlations.current(),
    });
  }
}
