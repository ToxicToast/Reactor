import type { AdminAuthConfig } from '../interfaces/index.js';
import { SealedCookie } from './sealed-cookie.service.js';

const config = (fill: number): AdminAuthConfig => {
  return { sessionSecret: new Uint8Array(32).fill(fill) } as AdminAuthConfig;
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
});
