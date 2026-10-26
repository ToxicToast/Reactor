import { BlockList, isIP } from 'node:net';
import type { BanDecision, BanPolicyConfig } from '../interfaces/index.js';
import { normalizeIp } from '@toxictoast/shared-kernel';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export class BanPolicy {
  private readonly allowlist = new BlockList();

  constructor(private readonly config: BanPolicyConfig) {
    if (!Number.isInteger(config.threshold) || config.threshold < 1) {
      throw new Error('Ban threshold must be at least 1');
    }
    if (config.durationsMinutes.length === 0) {
      throw new Error('At least one ban duration is required');
    }
    if (config.durationsMinutes.some((minutes) => !(minutes > 0))) {
      throw new Error('Ban durations must be positive');
    }
    for (const entry of config.allowlist) {
      this.allow(entry);
    }
  }

  get windowSeconds(): number {
    return this.config.windowSeconds;
  }

  isExempt(ip: string): boolean {
    const normalized = normalizeIp(ip);
    const version = isIP(normalized);
    if (version === 0) {
      return false;
    }
    return this.allowlist.check(normalized, version === 4 ? 'ipv4' : 'ipv6');
  }

  isExceeded(failedAttempts: number): boolean {
    return failedAttempts >= this.config.threshold;
  }

  strikesSince(now: Date): Date {
    return new Date(now.getTime() - this.config.strikeWindowDays * DAY_MS);
  }

  escalate(previousBans: number, now: Date): BanDecision {
    const level = Math.max(0, previousBans) + 1;
    const durations = this.config.durationsMinutes;
    const minutes = durations[Math.min(level, durations.length) - 1];
    return {
      level,
      banned_until: new Date(now.getTime() + minutes * MINUTE_MS),
    };
  }

  private allow(entry: string): void {
    const [address, prefix] = entry.trim().split('/');
    const normalized = normalizeIp(address);
    const version = isIP(normalized);
    if (version === 0) {
      throw new Error(`Invalid allowlist entry ${entry}`);
    }

    const type = version === 4 ? 'ipv4' : 'ipv6';
    if (prefix === undefined) {
      this.allowlist.addAddress(normalized, type);
      return;
    }

    const bits = Number(prefix);
    const max = version === 4 ? 32 : 128;
    if (!Number.isInteger(bits) || bits < 0 || bits > max) {
      throw new Error(`Invalid allowlist entry ${entry}`);
    }
    this.allowlist.addSubnet(normalized, bits, type);
  }
}
