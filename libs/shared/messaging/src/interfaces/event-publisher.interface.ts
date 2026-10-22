import type { PublishedEvent } from './published-event.interface.js';

export interface EventPublisher {
  publish(events: ReadonlyArray<PublishedEvent>): Promise<void>;
}
