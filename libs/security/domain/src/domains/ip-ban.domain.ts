import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { IpBanAnemic } from '../anemics/index.js';
import { IpBanEvents, type IpBanEventPayload } from '../events/index.js';

export class IpBanDomain extends BaseDomain<IpBanAnemic, IpBanEventPayload> {
  get isActive(): boolean {
    return (
      this.state.lifted_at === null &&
      this.state.banned_until > this.ctx.date.now()
    );
  }

  ban(): void {
    this.raise(IpBanEvents.BANNED);
  }

  lift(liftedBy: Nullable<string>): Result<void> {
    if (!this.isActive) {
      return Result.fail(new ConflictError('Ban is not active'));
    }

    this.state.lifted_at = this.ctx.date.now();
    this.state.lifted_by = liftedBy;
    this.touch();
    this.raise(IpBanEvents.UNBANNED);
    return Result.ok();
  }

  protected override toEventPayload(): IpBanEventPayload {
    return {
      id: this.state.id,
      ip: this.state.ip,
      level: this.state.level,
      failed_attempts: this.state.failed_attempts,
      banned_until: this.state.banned_until,
      lifted_at: this.state.lifted_at,
      lifted_by: this.state.lifted_by,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
