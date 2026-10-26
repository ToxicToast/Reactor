import type { DomainContext } from '@toxictoast/shared-kernel';
import type { IpBanData } from '../data/index.js';
import { IpBanFactory } from '../factories/index.js';
import type { IpBanDomain } from './ip-ban.domain.js';

let now = new Date('2026-10-23T12:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'ban-1' as never },
  date: { now: () => now },
};

const VALID: IpBanData = {
  ip: '::ffff:203.0.113.7',
  level: 1,
  failed_attempts: 20,
  banned_until: new Date('2026-10-23T12:30:00Z'),
};

describe('IpBanDomain', () => {
  const factory = new IpBanFactory(ctx);

  const createBan = (): IpBanDomain => {
    const result = factory.createDomain(VALID);
    if (result.isFailure) {
      throw result.error;
    }
    result.value.toEvents();
    return result.value;
  };

  beforeEach(() => {
    now = new Date('2026-10-23T12:00:00Z');
  });

  describe('createDomain', () => {
    it('creates an active ban with normalized ip and a banned event', () => {
      const result = factory.createDomain(VALID);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic()).toMatchObject({
        ip: '203.0.113.7',
        level: 1,
        lifted_at: null,
      });
      expect(result.value.isActive).toBe(true);
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'banned',
      ]);
    });

    it.each([
      [{ ip: 'kaputt' }],
      [{ level: 0 }],
      [{ failed_attempts: 0 }],
      [{ banned_until: new Date('2026-10-23T11:00:00Z') }],
    ])('refuses %p', (override) => {
      const result = factory.createDomain({ ...VALID, ...override });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('lift', () => {
    it('lifts an active ban and raises an unbanned event', () => {
      const ban = createBan();

      const result = ban.lift('admin-1');

      expect(result.isSuccess).toBe(true);
      expect(ban.isActive).toBe(false);
      expect(ban.toAnemic()).toMatchObject({
        lifted_at: now,
        lifted_by: 'admin-1',
      });
      expect(ban.toEvents().map((e) => e.event_name)).toEqual(['unbanned']);
    });

    it('refuses to lift a ban twice', () => {
      const ban = createBan();
      ban.lift('admin-1');
      ban.toEvents();

      const result = ban.lift('admin-1');

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
      expect(ban.toEvents()).toHaveLength(0);
    });

    it('treats expired bans as inactive', () => {
      const ban = createBan();
      now = new Date('2026-10-23T13:00:00Z');

      expect(ban.isActive).toBe(false);
      expect(ban.lift('admin-1').isFailure).toBe(true);
    });
  });
});
