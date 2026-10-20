import type { Producer } from '@platformatic/kafka';
import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { EventPublisher } from '../interfaces/index.js';

export class KafkaEventPublisher implements EventPublisher {
  constructor(
    private readonly producer: Producer<string, string, string, string>,
  ) {}

  async publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.producer.send({
      messages: events.map((event) => {
        return {
          topic: event.event_namespace,
          key: event.aggregate_id,
          value: JSON.stringify(event),
          headers: {
            event_id: event.event_id,
            event_name: event.event_name,
            event_version: String(event.event_version),
          },
        };
      }),
    });
  }
}
