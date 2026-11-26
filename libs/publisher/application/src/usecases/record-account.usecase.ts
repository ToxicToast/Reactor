import type { UnitOfWork, UseCase } from '@toxictoast/shared-application';
import { metricsChanged, Result } from '@toxictoast/shared-kernel';
import {
  ACCOUNT_METRIC_KEYS,
  accountRefOf,
  type AccountRepository,
  type AccountSnapshotRepository,
} from '@toxictoast/publisher-domain';
import type { RecordAccountInput, RecordOutput } from '../data/index.js';

export class RecordAccountUseCase implements UseCase<
  RecordAccountInput,
  RecordOutput
> {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly snapshots: AccountSnapshotRepository,
    private readonly uow: UnitOfWork,
  ) {}

  execute(input: RecordAccountInput): Promise<Result<RecordOutput>> {
    return this.uow.run(async () => {
      const ref = accountRefOf(input.account);
      await this.accounts.save(input.account);

      const latest = await this.snapshots.latest(ref);
      const changed = metricsChanged(
        latest?.metrics ?? null,
        input.metrics,
        ACCOUNT_METRIC_KEYS,
      );
      if (changed) {
        await this.snapshots.record({
          account: ref,
          observed_at: input.observed_at,
          metrics: input.metrics,
        });
      }
      return Result.ok({ snapshot_recorded: changed });
    });
  }
}
