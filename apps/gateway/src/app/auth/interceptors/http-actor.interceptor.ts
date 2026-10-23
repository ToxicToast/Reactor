import {
  Injectable,
  UnauthorizedException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import { ActorContext } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import type { Request } from 'express';
import { from, Observable, switchMap } from 'rxjs';
import { actorFromToken } from '../functions/index.js';
import { KeycloakTokenVerifier } from '../services/index.js';

const BEARER = /^Bearer\s+(.+)$/i;

@Injectable()
export class HttpActorInterceptor implements NestInterceptor {
  constructor(
    private readonly actors: ActorContext,
    private readonly verifier: KeycloakTokenVerifier,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    return from(this.actorOf(request)).pipe(
      switchMap((actor) => {
        return new Observable((subscriber) => {
          return this.actors.run(actor, () => {
            return next.handle().subscribe(subscriber);
          });
        });
      }),
    );
  }

  private async actorOf(request: Request): Promise<Actor> {
    const ip = request.ip ?? null;
    const token = this.tokenOf(request.headers.authorization);
    if (token === null) {
      return { type: ActorType.ANONYMOUS, id: null, ip, permissions: [] };
    }

    const payload = await this.verifier.verify(token);
    return actorFromToken(payload, this.verifier.audience, ip);
  }

  private tokenOf(header: string | undefined): Nullable<string> {
    if (!header) {
      return null;
    }
    const match = BEARER.exec(header);
    if (!match) {
      throw new UnauthorizedException('malformed authorization header');
    }
    return match[1];
  }
}
