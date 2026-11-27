import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ActorContext } from '@toxictoast/shared-system';
import type { Request, Response } from 'express';
import { of } from 'rxjs';
import type {
  AdminAuthConfig,
  OAuthConnectOptions,
} from '../interfaces/index.js';
import { AdminSessions } from './admin-sessions.service.js';
import { OAuthConnectFlow } from './oauth-connect-flow.service.js';
import { SealedCookie } from './sealed-cookie.service.js';

const OPTIONS: OAuthConnectOptions = {
  label: 'youtube',
  cookie: 'azk_youtube_state',
  path: '/admin/youtube',
  connectPath: '/admin/youtube/connect',
  redirectUri: 'https://api.thoraxia.de/admin/youtube/callback',
};

describe('OAuthConnectFlow', () => {
  const cookies = new SealedCookie({
    sessionSecret: new Uint8Array(32).fill(7),
  } as AdminAuthConfig);
  const actors = new ActorContext();
  const flow = new OAuthConnectFlow(
    cookies,
    new AdminSessions(cookies),
    actors,
  );

  const response = (): Response => {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response;
  };

  const request = async (
    values: { session?: boolean; state?: string } = {},
  ): Promise<Request> => {
    const parts: Array<string> = [];
    if (values.session) {
      parts.push(
        `azk_admin=${await cookies.seal({ sub: 'user-1', permissions: [] }, 60)}`,
      );
    }
    if (values.state) {
      parts.push(
        `${OPTIONS.cookie}=${await cookies.seal({ state: values.state }, 60)}`,
      );
    }
    return {
      headers: { cookie: parts.join('; ') },
      ip: '203.0.113.7',
    } as unknown as Request;
  };

  it('sends admins without a session to the login first', async () => {
    const res = response();
    const start = jest.fn();

    await flow.connect(await request(), res, OPTIONS, start);

    expect(res.redirect).toHaveBeenCalledWith(
      '/admin/auth/login?return_to=%2Fadmin%2Fyoutube%2Fconnect',
    );
    expect(start).not.toHaveBeenCalled();
  });

  it('starts the authorization as the admin and remembers the state', async () => {
    const res = response();
    let actorId: string | null = null;

    await flow.connect(
      await request({ session: true }),
      res,
      OPTIONS,
      (state, redirectUri) => {
        actorId = actors.current().id;
        expect(redirectUri).toBe(OPTIONS.redirectUri);
        return of({ url: `https://accounts.google.com/?state=${state}` });
      },
    );

    expect(actorId).toBe('user-1');
    expect(res.cookie).toHaveBeenCalledWith(
      OPTIONS.cookie,
      expect.any(String),
      expect.objectContaining({ path: OPTIONS.path }),
    );
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('https://accounts.google.com/?state='),
    );
  });

  it('rejects a callback with a foreign state', async () => {
    await expect(
      flow.complete(
        { code: 'code-1', state: 'other', error_description: undefined },
        await request({ session: true, state: 'state-1' }),
        response(),
        OPTIONS,
        () => of({}),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('passes the error of the platform on', async () => {
    await expect(
      flow.complete(
        {
          code: undefined,
          state: 'state-1',
          error_description: 'access_denied',
        },
        await request({ session: true, state: 'state-1' }),
        response(),
        OPTIONS,
        () => of({}),
      ),
    ).rejects.toEqual(new BadRequestException('access_denied'));
  });

  it('completes the authorization and clears the state cookie', async () => {
    const res = response();

    const result = await flow.complete(
      { code: 'code-1', state: 'state-1', error_description: undefined },
      await request({ session: true, state: 'state-1' }),
      res,
      OPTIONS,
      (code, redirectUri) => of({ code, redirectUri }),
    );

    expect(result).toEqual({
      code: 'code-1',
      redirectUri: OPTIONS.redirectUri,
    });
    expect(res.clearCookie).toHaveBeenCalledWith(OPTIONS.cookie, {
      path: OPTIONS.path,
    });
  });
});
