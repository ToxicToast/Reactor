import type { BanPolicyConfig } from '../interfaces/index.js';
import { BanPolicy } from './ban-policy.service.js';

const NOW = new Date('2026-10-23T12:00:00Z');
const MINUTE = 60 * 1000;

const CONFIG: BanPolicyConfig = {
  threshold: 20,
  windowSeconds: 300,
  durationsMinutes: [30, 120, 720, 10080],
  strikeWindowDays: 30,
  allowlist: ['127.0.0.1', '::1', '10.0.0.0/8'],
};

describe('BanPolicy', () => {
  const policy = new BanPolicy(CONFIG);

  describe('escalate', () => {
    it.each([
      [0, 1, 30],
      [1, 2, 120],
      [2, 3, 720],
      [3, 4, 10080],
      [9, 10, 10080],
    ])(
      'after %p previous bans bans on level %p for %p minutes',
      (previous, level, minutes) => {
        expect(policy.escalate(previous, NOW)).toEqual({
          level,
          banned_until: new Date(NOW.getTime() + minutes * MINUTE),
        });
      },
    );
  });

  describe('isExceeded', () => {
    it('bans from the threshold on', () => {
      expect(policy.isExceeded(19)).toBe(false);
      expect(policy.isExceeded(20)).toBe(true);
    });
  });

  describe('strikesSince', () => {
    it('looks back over the strike window', () => {
      expect(policy.strikesSince(NOW)).toEqual(
        new Date('2026-09-23T12:00:00Z'),
      );
    });
  });

  describe('isExempt', () => {
    it.each([['127.0.0.1'], ['::1'], ['::ffff:127.0.0.1'], ['10.20.30.40']])(
      'never bans %p',
      (ip) => {
        expect(policy.isExempt(ip)).toBe(true);
      },
    );

    it.each([['203.0.113.7'], ['11.0.0.1'], ['kaputt']])('may ban %p', (ip) => {
      expect(policy.isExempt(ip)).toBe(false);
    });
  });

  describe('config', () => {
    it('refuses invalid allowlist entries', () => {
      expect(
        () => new BanPolicy({ ...CONFIG, allowlist: ['10.0.0.0/99'] }),
      ).toThrow('Invalid allowlist entry 10.0.0.0/99');
    });

    it('refuses an empty list of durations', () => {
      expect(
        () => new BanPolicy({ ...CONFIG, durationsMinutes: [] }),
      ).toThrow();
    });
  });
});
