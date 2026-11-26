import type { UseCase } from '@toxictoast/shared-application';
import { Result, truncateText } from '@toxictoast/shared-kernel';
import {
  POST_CHECK_LIMITS,
  postRefOf,
  type PostCheck,
  type PostCheckRepository,
} from '@toxictoast/publisher-domain';
import type { RecordPostFailureInput } from '../data/index.js';

/** Fehlversuche landen hier und nie als Messwert, sonst sähe ein Ausfall wie ein Einbruch der Zahlen aus */
export class RecordPostFailureUseCase implements UseCase<
  RecordPostFailureInput,
  PostCheck
> {
  constructor(private readonly checks: PostCheckRepository) {}

  async execute(input: RecordPostFailureInput): Promise<Result<PostCheck>> {
    const ref = postRefOf(input.post);
    const previous = await this.checks.find(ref);
    const check: PostCheck = {
      post: ref,
      checked_at: input.failed_at,
      failures: (previous?.failures ?? 0) + 1,
      last_error: truncateText(input.error, POST_CHECK_LIMITS.ERROR_MAX),
    };
    await this.checks.save(check);
    return Result.ok(check);
  }
}
