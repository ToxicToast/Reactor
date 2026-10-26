import { CorrelationContext } from '@toxictoast/shared-system';
import type { Request, Response } from 'express';
import { BanList } from '../services/index.js';
import { BanMiddleware } from './ban.middleware.js';

const now = new Date('2026-10-25T12:00:00Z');
const clock = { now: () => now };

describe('BanMiddleware', () => {
  let bans: BanList;
  let middleware: BanMiddleware;
  let setHeader: jest.Mock;
  let json: jest.Mock;
  let status: jest.Mock;
  let next: jest.Mock;

  const call = (ip: string): void => {
    middleware.use(
      { ip } as Request,
      { setHeader, status } as unknown as Response,
      next,
    );
  };

  beforeEach(() => {
    bans = new BanList(clock);
    middleware = new BanMiddleware(bans, new CorrelationContext(), clock);
    setHeader = jest.fn();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    next = jest.fn();
  });

  it('lets ips without ban through', () => {
    call('203.0.113.7');

    expect(next).toHaveBeenCalled();
  });

  it('answers banned ips with 429 and retry-after', () => {
    bans.ban({
      id: 'ban-1',
      ip: '203.0.113.7',
      banned_until: '2026-10-25T12:30:00Z',
      lifted_at: null,
    });

    call('::ffff:203.0.113.7');

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(429);
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '1800');
  });
});
