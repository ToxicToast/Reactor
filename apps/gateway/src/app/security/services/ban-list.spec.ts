import { BanList } from './ban-list.service.js';

let now = new Date('2026-10-25T12:00:00Z');
const clock = { now: () => now };

const payload = (id: string, until: string, ip = '203.0.113.7') => {
  return { id, ip, banned_until: until, lifted_at: null };
};

describe('BanList', () => {
  let bans: BanList;

  beforeEach(() => {
    now = new Date('2026-10-25T12:00:00Z');
    bans = new BanList(clock);
  });

  it('knows active bans, also for mapped ipv4 addresses', () => {
    bans.ban(payload('ban-1', '2026-10-25T12:30:00Z'));

    expect(bans.bannedUntil('::ffff:203.0.113.7')).toEqual(
      new Date('2026-10-25T12:30:00Z'),
    );
  });

  it('ignores bans that already ended while replaying', () => {
    bans.ban(payload('ban-1', '2026-10-25T11:30:00Z'));

    expect(bans.size).toBe(0);
  });

  it('forgets bans once they expire', () => {
    bans.ban(payload('ban-1', '2026-10-25T12:30:00Z'));
    now = new Date('2026-10-25T12:31:00Z');

    expect(bans.bannedUntil('203.0.113.7')).toBeNull();
    expect(bans.size).toBe(0);
  });

  it('only lifts the ban with the same id', () => {
    bans.ban(payload('ban-2', '2026-10-25T14:00:00Z'));

    bans.unban(payload('ban-1', '2026-10-25T12:30:00Z'));
    expect(bans.bannedUntil('203.0.113.7')).not.toBeNull();

    bans.unban(payload('ban-2', '2026-10-25T14:00:00Z'));
    expect(bans.bannedUntil('203.0.113.7')).toBeNull();
  });

  it('keeps a newer ban when an older one is replayed and lifted afterwards', () => {
    bans.ban(payload('ban-2', '2026-10-25T14:00:00Z'));
    bans.ban(payload('ban-1', '2026-10-25T12:30:00Z'));
    bans.unban(payload('ban-1', '2026-10-25T12:30:00Z'));

    expect(bans.bannedUntil('203.0.113.7')).toEqual(
      new Date('2026-10-25T14:00:00Z'),
    );
  });
});
