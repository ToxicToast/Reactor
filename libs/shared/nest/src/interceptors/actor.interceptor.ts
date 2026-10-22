import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { ActorContext } from '@toxictoast/shared-system';
import { Observable } from 'rxjs';
import { actorFromMetadata } from '../functions/index.js';
import type { GrpcMetadata } from '../interfaces/index.js';

@Injectable()
export class ActorInterceptor implements NestInterceptor {
  constructor(private readonly actors: ActorContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const actor = actorFromMetadata(
      context.switchToRpc().getContext<GrpcMetadata>(),
    );
    return new Observable((subscriber) => {
      return this.actors.run(actor, () => {
        return next.handle().subscribe(subscriber);
      });
    });
  }
}
