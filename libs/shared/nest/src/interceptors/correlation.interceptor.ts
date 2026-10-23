import {
  Inject,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { CorrelationContext } from '@toxictoast/shared-system';
import { Observable } from 'rxjs';
import { TOKENS } from '../constants/index.js';
import { correlationFromMetadata } from '../functions/index.js';
import type { GrpcMetadata } from '../interfaces/index.js';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  constructor(
    private readonly correlations: CorrelationContext,
    @Inject(TOKENS.DOMAIN_CONTEXT) private readonly ctx: DomainContext,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const correlationId =
      correlationFromMetadata(
        context.switchToRpc().getContext<GrpcMetadata>(),
      ) ?? this.ctx.id.generate();
    return new Observable((subscriber) => {
      return this.correlations.run(correlationId, () => {
        return next.handle().subscribe(subscriber);
      });
    });
  }
}
