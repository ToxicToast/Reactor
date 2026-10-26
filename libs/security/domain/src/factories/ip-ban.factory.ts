import { isIP } from 'node:net';
import {
  Result,
  ValidationError,
  type DomainContext,
  type Factory,
  normalizeIp,
} from '@toxictoast/shared-kernel';
import type { IpBanAnemic } from '../anemics/index.js';
import type { IpBanData } from '../data/index.js';
import { IpBanDomain } from '../domains/index.js';

export class IpBanFactory implements Factory<
  IpBanAnemic,
  IpBanDomain,
  IpBanData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: IpBanAnemic): IpBanDomain {
    return new IpBanDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: IpBanDomain): IpBanAnemic {
    return domain.toAnemic();
  }

  createDomain(data: IpBanData): Result<IpBanDomain> {
    const ip = normalizeIp(data.ip);
    if (isIP(ip) === 0) {
      return Result.fail(new ValidationError(`Invalid ip address ${data.ip}`));
    }
    if (!Number.isInteger(data.level) || data.level < 1) {
      return Result.fail(new ValidationError('Ban level must be at least 1'));
    }
    if (!Number.isInteger(data.failed_attempts) || data.failed_attempts < 1) {
      return Result.fail(
        new ValidationError('Failed attempts must be at least 1'),
      );
    }

    const now = this.ctx.date.now();
    if (data.banned_until <= now) {
      return Result.fail(new ValidationError('Ban must end in the future'));
    }

    const domain = new IpBanDomain(
      {
        id: this.ctx.id.generate<'IpBan'>(),
        ip,
        level: data.level,
        failed_attempts: data.failed_attempts,
        banned_until: data.banned_until,
        lifted_at: null,
        lifted_by: null,
        created_at: now,
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.ban();
    return Result.ok(domain);
  }
}
