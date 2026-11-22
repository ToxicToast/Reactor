import type { Request, Response } from 'express';
import type { AdminAuthConfig } from '../interfaces/index.js';
import { SealedCookie } from './sealed-cookie.service.js';

const COOKIE = 'azk_test';
const PATH = '/admin';

const config = (fill: number): AdminAuthConfig => {
  return {
    sessionSecret: new Uint8Array(32).fill(fill),
    secureCookies: true,
  } as AdminAuthConfig;
};

const fakeResponse = () => {
  return { cookie: jest.fn(), clearCookie: jest.fn() };
};

const requestWith = (cookie?: string): Request => {
  return { headers: cookie === undefined ? {} : { cookie } } as Request;
};

describe('SealedCookie', () => {
  const cookies = new SealedCookie(config(7));
  const session = { sub: 'user-1', permissions: ['cronjob.queues.manage'] };

  it('opens what it sealed', async () => {
    const token = await cookies.seal(session, 60);

    await expect(cookies.open(token)).resolves.toEqual(session);
  });

  it('rejects tampered cookies', async () => {
    const token = await cookies.seal(session, 60);
    const tampered = `${token.slice(0, -4)}AAAA`;

    await expect(cookies.open(tampered)).resolves.toBeNull();
  });

  it('rejects cookies sealed with another key', async () => {
    const token = await new SealedCookie(config(9)).seal(session, 60);

    await expect(cookies.open(token)).resolves.toBeNull();
  });

  it('has no session without cookie', async () => {
    await expect(cookies.open(undefined)).resolves.toBeNull();
  });

  it('writes a sealed cookie with the shared options', async () => {
    const response = fakeResponse();

    await cookies.write(
      response as unknown as Response,
      COOKIE,
      session,
      PATH,
      60,
    );

    expect(response.cookie).toHaveBeenCalledWith(COOKIE, expect.any(String), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: PATH,
      maxAge: 60_000,
    });
  });

  it('reads the cookie it wrote from the request', async () => {
    const response = fakeResponse();
    await cookies.write(
      response as unknown as Response,
      COOKIE,
      session,
      PATH,
      60,
    );
    const token = response.cookie.mock.calls[0][1] as string;

    const read = await cookies.read(
      requestWith(`other=1; ${COOKIE}=${token}`),
      COOKIE,
    );

    expect(read).toEqual(session);
  });

  it('reads nothing when the cookie is missing', async () => {
    await expect(cookies.read(requestWith(), COOKIE)).resolves.toBeNull();
    await expect(
      cookies.read(requestWith('other=1'), COOKIE),
    ).resolves.toBeNull();
  });

  it('clears the cookie on its path', () => {
    const response = fakeResponse();

    cookies.clear(response as unknown as Response, COOKIE, PATH);

    expect(response.clearCookie).toHaveBeenCalledWith(COOKIE, { path: PATH });
  });
});
