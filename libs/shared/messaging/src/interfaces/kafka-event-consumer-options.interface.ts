import type { Optional } from '@toxictoast/shared-types';
import type { EventHandler } from '../types/index.js';
import type { ConsumedEvent } from './consumed-event.interface.js';

export interface KafkaEventConsumerOptions {
  readonly handlers: Readonly<Record<string, EventHandler>>;
  readonly onError: (error: unknown, event: Optional<ConsumedEvent>) => void;
  readonly retryDelayMs?: Optional<number>;
  readonly maxRetryDelayMs?: Optional<number>;
}
