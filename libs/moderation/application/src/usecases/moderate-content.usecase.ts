import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { ModerationPolicy } from '@toxictoast/moderation-domain';
import type { ModerateContentInput, ModerationResult } from '../data/index.js';
import type {
  ContentClassifier,
  DecisionPublisher,
} from '../interfaces/index.js';

export class ModerateContentUseCase implements UseCase<
  ModerateContentInput,
  ModerationResult
> {
  constructor(
    private readonly classifier: ContentClassifier,
    private readonly policy: ModerationPolicy,
    private readonly publisher: DecisionPublisher,
  ) {}

  async execute(
    input: ModerateContentInput,
  ): Promise<Result<ModerationResult>> {
    const { classification, model, prompt_version } =
      await this.classifier.classify(input.content);
    const outcome = this.policy.decide(classification);

    const result: ModerationResult = {
      content_id: input.content_id,
      decision: outcome.decision,
      note: outcome.note,
      confidence: classification.confidence,
      model,
      prompt_version,
    };
    await this.publisher.publish(result);
    return Result.ok(result);
  }
}
