import type { NextFunction, Request, Response } from 'express';
import type { AdminAuthConfig } from '../interfaces/index.js';
import { SealedCookie } from '../services/index.js';
import { AdminSessionMiddleware } from './admin-session.middleware.js';

describe('AdminSessionMiddleware', () => {
  const cookies = new SealedCookie({
    sessionSecret: new Uint8Array(32).fill(7),
  } as AdminAuthConfig);
  const middleware = new AdminSessionMiddleware(cookies);

  let redirect: jest.Mock;
  let json: jest.Mock;
  let status: jest.Mock;
  let next: jest.Mock;
  let response: Response;

  const request = (cookie: string | undefined, accept: string): Request => {
    return {
      method: 'GET',
      headers: { cookie },
      originalUrl: '/admin/queues/',
      accepts: (type: string) => (type === accept ? type : false),
    } as unknown as Request;
  };

  const sessionCookie = async (permissions: Array<string>): Promise<string> => {
    return `azk_admin=${await cookies.seal({ sub: 'user-1', permissions }, 60)}`;
  };

  beforeEach(() => {
    redirect = jest.fn();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    next = jest.fn();
    response = { redirect, status } as unknown as Response;
  });

  it('sends browsers without session to the login', async () => {
    await middleware.use(
      request(undefined, 'html'),
      response,
      next as NextFunction,
    );

    expect(redirect).toHaveBeenCalledWith(
      '/admin/auth/login?return_to=%2Fadmin%2Fqueues%2F',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('answers api calls without session with 401', async () => {
    await middleware.use(
      request(undefined, 'json'),
      response,
      next as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(401);
  });

  it('refuses sessions without the queue permission', async () => {
    const cookie = await sessionCookie(['blog.post.write']);

    await middleware.use(
      request(cookie, 'html'),
      response,
      next as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('lets admins through', async () => {
    const cookie = await sessionCookie(['cronjob.queues.manage']);

    await middleware.use(
      request(cookie, 'html'),
      response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });
});
