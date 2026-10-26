import type { IpBanPayloadV1 } from '@toxictoast/contracts-events';
import { normalizeIp, type Clock } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';

type BanPayload = Pick<
  IpBanPayloadV1,
  'id' | 'ip' | 'banned_until' | 'lifted_at'
>;

export class BanList {
  private readonly bans = new Map<string, Map<string, Date>>();

  constructor(private readonly clock: Clock) {}

  get size(): number {
    return this.bans.size;
  }

  ban(payload: BanPayload): void {
    const until = new Date(payload.banned_until);
    if (payload.lifted_at !== null || until <= this.clock.now()) {
      return;
    }

    const ip = normalizeIp(payload.ip);
    const bans = this.bans.get(ip) ?? new Map<string, Date>();
    bans.set(payload.id, until);
    this.bans.set(ip, bans);
  }

  unban(payload: BanPayload): void {
    const ip = normalizeIp(payload.ip);
    const bans = this.bans.get(ip);
    if (!bans) {
      return;
    }

    bans.delete(payload.id);
    if (bans.size === 0) {
      this.bans.delete(ip);
    }
  }

  bannedUntil(ip: string): Nullable<Date> {
    const key = normalizeIp(ip);
    const bans = this.bans.get(key);
    if (!bans) {
      return null;
    }

    const now = this.clock.now();
    let latest: Nullable<Date> = null;
    for (const [id, until] of bans) {
      if (until <= now) {
        bans.delete(id);
        continue;
      }
      if (latest === null || until > latest) {
        latest = until;
      }
    }

    if (bans.size === 0) {
      this.bans.delete(key);
    }
    return latest;
  }
}
