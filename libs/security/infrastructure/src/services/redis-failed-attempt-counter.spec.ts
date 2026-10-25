import type { Redis } from 'ioredis';
import { RedisFailedAttemptCounter } from './redis-failed-attempt-counter.service.js';

describe('RedisFailedAttemptCounter', () => {
  let evalScript: jest.Mock;
  let del: jest.Mock;
  let counter: RedisFailedAttemptCounter;

  beforeEach(() => {
    evalScript = jest.fn().mockResolvedValue(3);
    del = jest.fn().mockResolvedValue(1);
    counter = new RedisFailedAttemptCounter({
      eval: evalScript,
      del,
    } as unknown as Redis);
  });

  it('counts per ip within the window', async () => {
    await expect(counter.increment('203.0.113.7', 300)).resolves.toBe(3);

    expect(evalScript).toHaveBeenCalledWith(
      expect.stringContaining('INCR'),
      1,
      'security:failed:203.0.113.7',
      300,
    );
  });

  it('removes the counter of an ip', async () => {
    await counter.reset('203.0.113.7');

    expect(del).toHaveBeenCalledWith('security:failed:203.0.113.7');
  });
});
