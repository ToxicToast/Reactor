import type { AuditRepository } from '@toxictoast/audit-domain';
import type { UseCase } from '@toxictoast/shared-application';
import { Result, type Clock } from '@toxictoast/shared-kernel';
import type { RecordAuditEventInput } from '../data/index.js';

export class RecordAuditEventUseCase implements UseCase<
  RecordAuditEventInput,
  void
> {
  constructor(
    private readonly repository: AuditRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: RecordAuditEventInput): Promise<Result<void>> {
    await this.repository.record({
      ...input,
      recorded_at: this.clock.now(),
    });
    return Result.ok();
  }
}
