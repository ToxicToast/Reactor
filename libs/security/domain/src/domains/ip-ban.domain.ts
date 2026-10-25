import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { IpBanAnemic } from '../anemics/index.js';
import { BanIpEvent, UnbanIpEvent } from '../events/index.js';

export class IpBanDomain extends BaseDomain<IpBanAnemic> {
  get isActive(): boolean {
    return (
      this.state.lifted_at === null &&
      this.state.banned_until > this.ctx.date.now()
    );
  }

  ban(): void {
    this.raise(BanIpEvent);
  }

  lift(liftedBy: Nullable<string>): Result<void> {
    if (!this.isActive) {
      return Result.fail(new ConflictError('Ban is not active'));
    }

    this.state.lifted_at = this.ctx.date.now();
    this.state.lifted_by = liftedBy;
    this.touch();
    this.raise(UnbanIpEvent);
    return Result.ok();
  }
}
