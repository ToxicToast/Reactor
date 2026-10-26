import {
  BlogCommentModerationEvents,
  BlogTopics,
  type ModerationDecidedPayloadV1,
} from '@toxictoast/contracts-events';
import type {
  DecisionPublisher,
  ModerationResult,
} from '@toxictoast/moderation-application';
import type {
  ActorIdentity,
  CorrelationProvider,
  DomainContext,
} from '@toxictoast/shared-kernel';
import type { EventPublisher } from '@toxictoast/shared-messaging';
import { DECISION_TO_EVENT } from '../mappings/index.js';

export class KafkaDecisionPublisher implements DecisionPublisher {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ctx: DomainContext,
    private readonly correlations: CorrelationProvider,
    private readonly actor: ActorIdentity,
  ) {}

  async publish(result: ModerationResult): Promise<void> {
    const payload: ModerationDecidedPayloadV1 = {
      comment_id: result.content_id,
      decision: DECISION_TO_EVENT[result.decision],
      note: result.note,
      confidence: result.confidence,
      model: result.model,
      prompt_version: result.prompt_version,
    };

    await this.publisher.publish([
      {
        event_id: this.ctx.id.generate(),
        event_namespace: BlogTopics.COMMENT_MODERATION,
        event_name: BlogCommentModerationEvents.DECIDED,
        event_version: 1,
        aggregate_id: result.content_id,
        occurred_at: this.ctx.date.now(),
        actor: this.actor,
        correlation_id: this.correlations.current(),
        payload,
      },
    ]);
  }
}
