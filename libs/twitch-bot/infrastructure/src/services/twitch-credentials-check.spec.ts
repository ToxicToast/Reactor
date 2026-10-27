import { TwitchCredentialsCheck } from './twitch-credentials-check.service.js';

describe('TwitchCredentialsCheck', () => {
  let now: Date;
  let requestToken: jest.Mock;
  let check: TwitchCredentialsCheck;

  beforeEach(() => {
    now = new Date('2026-10-27T12:00:00Z');
    requestToken = jest.fn().mockResolvedValue({ accessToken: 'app' });
    check = new TwitchCredentialsCheck(requestToken, { now: () => now });
  });

  it('reports valid credentials and caches them for five minutes', async () => {
    await expect(check.check()).resolves.toEqual({
      valid: true,
      message: null,
      checked_at: now,
    });

    now = new Date('2026-10-27T12:04:59Z');
    await check.check();
    expect(requestToken).toHaveBeenCalledTimes(1);

    now = new Date('2026-10-27T12:05:00Z');
    await check.check();
    expect(requestToken).toHaveBeenCalledTimes(2);
  });

  it('reports invalid credentials and retries after 30 seconds', async () => {
    requestToken.mockRejectedValue(new Error('invalid client secret'));

    await expect(check.check()).resolves.toMatchObject({
      valid: false,
      message: 'invalid client secret',
    });

    now = new Date('2026-10-27T12:00:30Z');
    await check.check();
    expect(requestToken).toHaveBeenCalledTimes(2);
  });

  it('asks twitch only once for parallel checks', async () => {
    await Promise.all([check.check(), check.check(), check.check()]);

    expect(requestToken).toHaveBeenCalledTimes(1);
  });
});
