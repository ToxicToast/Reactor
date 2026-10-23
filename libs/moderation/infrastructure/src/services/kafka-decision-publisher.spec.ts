import { ModerationDecision } from '@toxictoast/moderation-domain';
import type { DomainContext } from '@toxictoast/shared-kernel';
import type {
  EventPublisher,
  PublishedEvent,
} from '@toxictoast/shared-messaging';
import { KafkaDecisionPublisher } from './kafka-decision-publisher.service.js';

const NOW = new Date('2026-10-23T12:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'event-1' as never },
  date: { now: () => NOW },
};

class RecordingPublisher implements EventPublisher {
  readonly published: Array<PublishedEvent> = [];

  async publish(events: ReadonlyArray<PublishedEvent>): Promise<void> {
    this.published.push(...events);
  }
}

describe('KafkaDecisionPublisher', () => {
  it('publishes the decision as blog.comment.moderation.decided', async () => {
    const recording = new RecordingPublisher();

    await new KafkaDecisionPublisher(recording, ctx).publish({
      content_id: 'comment-1',
      decision: ModerationDecision.PENDING,
      note: 'spam (0.62): Links',
      confidence: 0.62,
      model: 'nvidia/nemotron-nano',
      prompt_version: 'v1',
    });

    expect(recording.published).toEqual([
      {
        event_id: 'event-1',
        event_namespace: 'blog.comment.moderation',
        event_name: 'decided',
        event_version: 1,
        aggregate_id: 'comment-1',
        occurred_at: NOW,
        actor: { type: 'ai', id: 'moderation-service', ip: null },
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
