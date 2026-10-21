import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { SYSTEM_ACTOR } from '@toxictoast/shared-kernel';
import { ActorContext } from '@toxictoast/shared-system';
import { defer, lastValueFrom } from 'rxjs';
import type { GrpcMetadata } from '../interfaces/index.js';
import { ActorInterceptor } from './actor.interceptor.js';

const metadata = (values: Record<string, string>): GrpcMetadata => {
  return {
    get: (key) => {
      if (key in values) {
        return [values[key]];
      }
      return [];
    },
  };
};

const executionContext = (
  type: string,
  grpcMetadata: GrpcMetadata,
): ExecutionContext => {
  return {
    getType: () => type,
    switchToRpc: () => ({ getContext: () => grpcMetadata }),
  } as unknown as ExecutionContext;
};

describe('ActorInterceptor', () => {
  let actors: ActorContext;
  let interceptor: ActorInterceptor;
  let next: CallHandler;

  beforeEach(() => {
    actors = new ActorContext();
    interceptor = new ActorInterceptor(actors);
    next = {
      handle: () =>
        defer(async () => {
          await Promise.resolve();
          return actors.current();
        }),
    };
  });

  it('runs grpc handlers as the actor from the metadata', async () => {
    const context = executionContext(
      'rpc',
      metadata({ 'x-actor-type': 'user', 'x-actor-id': 'user-1' }),
    );

    const actor = await lastValueFrom(interceptor.intercept(context, next));

    expect(actor).toEqual({
      type: 'user',
      id: 'user-1',
      ip: null,
      permissions: [],
    });
    expect(actors.current()).toBe(SYSTEM_ACTOR);
  });

  it('leaves http requests untouched', async () => {
    const context = executionContext('http', metadata({}));

    const actor = await lastValueFrom(interceptor.intercept(context, next));

    expect(actor).toBe(SYSTEM_ACTOR);
  });
});
