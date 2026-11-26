import type { UnitOfWork, UseCase } from '@toxictoast/shared-application';
import { metricsChanged, Result } from '@toxictoast/shared-kernel';
import {
  POST_METRIC_KEYS,
  postRefOf,
  type PostCheckRepository,
  type PostRepository,
  type PostSnapshotRepository,
} from '@toxictoast/publisher-domain';
import type { RecordOutput, RecordPostInput } from '../data/index.js';

/** eine erfolgreiche Abfrage: Post aktualisieren, bei Änderung einen Stand anhängen, Fehlversuche zurücksetzen */
export class RecordPostUseCase implements UseCase<
  RecordPostInput,
  RecordOutput
> {
  constructor(
    private readonly posts: PostRepository,
    private readonly snapshots: PostSnapshotRepository,
    private readonly checks: PostCheckRepository,
    private readonly uow: UnitOfWork,
  ) {}

  execute(input: RecordPostInput): Promise<Result<RecordOutput>> {
    return this.uow.run(async () => {
      const ref = postRefOf(input.post);
      await this.posts.save(input.post);

      const latest = await this.snapshots.latest(ref);
      const changed = metricsChanged(
        latest?.metrics ?? null,
        input.metrics,
        POST_METRIC_KEYS,
      );
      if (changed) {
        await this.snapshots.record({
          post: ref,
          observed_at: input.observed_at,
          metrics: input.metrics,
        });
      }

      await this.checks.save({
        post: ref,
        checked_at: input.observed_at,
        failures: 0,
        last_error: null,
      });
      return Result.ok({ snapshot_recorded: changed });
    });
  }
}
