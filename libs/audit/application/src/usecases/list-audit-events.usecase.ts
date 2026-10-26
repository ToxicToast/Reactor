import type { AuditEntry, AuditRepository } from '@toxictoast/audit-domain';
import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import { AUDIT_PAGE_SIZE } from '../constants/index.js';
import type { ListAuditEventsInput } from '../data/index.js';

export class ListAuditEventsUseCase implements UseCase<
  ListAuditEventsInput,
  Array<AuditEntry>
> {
  constructor(private readonly repository: AuditRepository) {}

  async execute(
    input: ListAuditEventsInput,
  ): Promise<Result<Array<AuditEntry>>> {
    const limit = Math.min(
      Math.max(input.limit ?? AUDIT_PAGE_SIZE.DEFAULT, 1),
      AUDIT_PAGE_SIZE.MAX,
    );
    const offset = Math.max(input.offset ?? 0, 0);

    return Result.ok(await this.repository.find({ ...input, limit, offset }));
  }
}
