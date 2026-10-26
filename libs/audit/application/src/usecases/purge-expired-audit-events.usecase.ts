import type {
  AuditRepository,
  AuditRetentionPolicy,
} from '@toxictoast/audit-domain';
import type { UseCase } from '@toxictoast/shared-application';
import { Result, type Clock } from '@toxictoast/shared-kernel';
import type { PurgeExpiredAuditEventsOutput } from '../data/index.js';

export class PurgeExpiredAuditEventsUseCase implements UseCase<
  void,
  PurgeExpiredAuditEventsOutput
> {
  constructor(
    private readonly repository: AuditRepository,
    private readonly policy: AuditRetentionPolicy,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<Result<PurgeExpiredAuditEventsOutput>> {
    let removed = 0;
    for (const rule of this.policy.rules(this.clock.now())) {
      removed += await this.repository.deleteBefore(rule);
    }
    return Result.ok({ removed });
  }
}
