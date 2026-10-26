import { ModerationDecision } from '@toxictoast/moderation-domain';
import { ActorType, DomainContext } from '@toxictoast/shared-kernel';
import type {
  EventPublisher,
  PublishedEvent,
} from '@toxictoast/shared-messaging';
import { KafkaDecisionPublisher } from './kafka-decision-publisher.service.js';
import { CorrelationContext } from '@toxictoast/shared-system';

const NOW = new Date('2026-10-23T12:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'event-1' as never },
  date: { now: () => NOW },
};

const CID = '01a16a00-3111-7049-8d8d-0db609f31f2a';

const ACTOR = {
  type: ActorType.AI,
  id: '0192f3a0-0000-7000-8000-0000000000a1',
  ip: null,
} as const;

class RecordingPublisher implements EventPublisher {
  readonly published: Array<PublishedEvent> = [];

  async publish(events: ReadonlyArray<PublishedEvent>): Promise<void> {
    this.published.push(...events);
  }
}

describe('KafkaDecisionPublisher', () => {
  it('publishes the decision as blog.comment.moderation.decided', async () => {
    const recording = new RecordingPublisher();
    const correlations = new CorrelationContext();

    await correlations.run(CID, () =>
      new KafkaDecisionPublisher(recording, ctx, correlations, ACTOR).publish({
        content_id: 'comment-1',
        decision: ModerationDecision.PENDING,
        note: 'spam (0.62): Links',
        confidence: 0.62,
        model: 'nvidia/nemotron-nano',
        prompt_version: 'v1',
      }),
    );

    expect(recording.published).toEqual([
      {
        event_id: 'event-1',
        event_namespace: 'blog.comment.moderation',
        event_name: 'decided',
        event_version: 1,
        aggregate_id: 'comment-1',
        occurred_at: NOW,
        actor: ACTOR,
        correlation_id: CID,
        payload: {
          comment_id: 'comment-1',
          decision: 'pending',
          note: 'spam (0.62): Links',
          confidence: 0.62,
          model: 'nvidia/nemotron-nano',
          prompt_version: 'v1',
        },
      },
    ]);
  });
});
