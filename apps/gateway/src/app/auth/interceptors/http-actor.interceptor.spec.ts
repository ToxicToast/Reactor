import {
  UnauthorizedException,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { ActorContext } from '@toxictoast/shared-system';
import { defer, lastValueFrom } from 'rxjs';
import type { KeycloakTokenVerifier } from '../services/index.js';
import { HttpActorInterceptor } from './http-actor.interceptor.js';

const SUB = 'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3';

const http = (headers: Record<string, string>): ExecutionContext => {
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({ headers, ip: '203.0.113.7' }),
    }),
  } as unknown as ExecutionContext;
};

describe('HttpActorInterceptor', () => {
  let actors: ActorContext;
  let verify: jest.Mock;
  let interceptor: HttpActorInterceptor;
  let next: CallHandler;

  beforeEach(() => {
    actors = new ActorContext();
    verify = jest.fn().mockResolvedValue({
      sub: SUB,
      resource_access: { 'azkaban-api': { roles: ['blog.post.write'] } },
    });
    const verifier = {
      verify,
      audience: 'azkaban-api',
      config: {
        issuer: 'http://localhost:8180/realms/azkaban',
        audience: 'azkaban-api',
        agentClientPrefix: 'azkaban-agent-',
      },
    } as unknown as KeycloakTokenVerifier;
    interceptor = new HttpActorInterceptor(actors, verifier);
    next = {
      handle: () =>
        defer(async () => {
          await Promise.resolve();
          return actors.current();
        }),
    };
  });

  it('runs the request as the user of the token', async () => {
    const actor = await lastValueFrom(
      interceptor.intercept(http({ authorization: 'Bearer abc' }), next),
    );

    expect(verify).toHaveBeenCalledWith('abc');
    expect(actor).toEqual({
      type: 'user',
      id: SUB,
      ip: '203.0.113.7',
      permissions: ['blog.post.write'],
    });
  });

  it('runs requests without token as anonymous', async () => {
    const actor = await lastValueFrom(interceptor.intercept(http({}), next));

    expect(actor).toEqual({
      type: 'anonymous',
      id: null,
      ip: '203.0.113.7',
      permissions: [],
    });
    expect(verify).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens instead of falling back to anonymous', async () => {
    verify.mockRejectedValue(new UnauthorizedException());

    await expect(
      lastValueFrom(
        interceptor.intercept(http({ authorization: 'Bearer kaputt' }), next),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects malformed authorization headers', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(http({ authorization: 'Basic abc' }), next),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
