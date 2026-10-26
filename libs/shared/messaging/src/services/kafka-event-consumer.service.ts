import type { Consumer, Message, MessagesStream } from '@platformatic/kafka';
import {
  isActorIdentity,
  isUuid,
  SYSTEM_ACTOR,
  type Actor,
} from '@toxictoast/shared-kernel';
import type {
  ActorContext,
  CorrelationContext,
} from '@toxictoast/shared-system';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  ConsumedEvent,
  KafkaEventConsumerOptions,
} from '../interfaces/index.js';
import { eventKey } from '../functions/index.js';
import { randomUUID } from 'node:crypto';
import { KAFKA_ADMIN } from '../constants/index.js';

type StringMessage = Message<string, string, string, string>;
type StringStream = MessagesStream<string, string, string, string>;

export class KafkaEventConsumer {
  private stream: Nullable<StringStream> = null;
  private processing: Nullable<Promise<void>> = null;
  private stopping = false;
  private caughtUp = true;
  private readonly pending = new Map<string, bigint>();

  constructor(
    private readonly consumer: Consumer<string, string, string, string>,
    private readonly actors: ActorContext,
    private readonly correlations: CorrelationContext,
    private readonly options: KafkaEventConsumerOptions,
  ) {}

  get topics(): Array<string> {
    const namespaces = Object.keys(this.options.handlers).map((key) => {
      return key.slice(0, key.lastIndexOf('.'));
    });
    return [...new Set(namespaces)];
  }

  get isCaughtUp(): boolean {
    return this.caughtUp;
  }

  async start(): Promise<void> {
    this.stopping = false;
    if (this.options.replay) {
      await this.trackEndOffsets();
    }
    this.stream = await this.consumer.consume({
      topics: this.topics,
      mode: this.options.replay ? 'earliest' : 'committed',
      fallbackMode: 'earliest',
      autocommit: false,
    });
    this.processing = this.process(this.stream);
  }

  async stop(): Promise<void> {
    this.stopping = true;
    if (this.stream) {
      await this.stream.close();
    }
    await this.processing;
    await this.consumer.close(true);
  }

  private async process(stream: StringStream): Promise<void> {
    for await (const message of stream) {
      const handled = await this.handle(message);
      if (!handled) {
        return;
      }
      if (this.options.replay) {
        this.markReplayed(message);
        continue;
      }
      await message.commit();
    }
  }

  private async handle(message: StringMessage): Promise<boolean> {
    const event = this.parse(message);
    if (!event) {
      return true;
    }

    const handler =
      this.options.handlers[eventKey(event.event_namespace, event.event_name)];
    if (!handler) {
      return true;
    }

    const actor = this.actorOf(event);
    const correlationId = this.correlationOf(event);
    let delay = this.options.retryDelayMs ?? 1000;
    const maxDelay = this.options.maxRetryDelayMs ?? 30000;
    while (!this.stopping) {
      try {
        await this.correlations.run(correlationId, () => {
          return this.actors.run(actor, () => handler(event));
        });
        return true;
      } catch (error) {
        this.correlations.run(correlationId, () => {
          this.options.onError(error, event);
        });
        await this.wait(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }
    return false;
  }

  private actorOf(event: ConsumedEvent): Actor {
    if (!isActorIdentity(event.actor)) {
      return SYSTEM_ACTOR;
    }
    const { type, id, ip } = event.actor;
    return { type, id, ip, permissions: [] };
  }

  private correlationOf(event: ConsumedEvent): string {
    if (isUuid(event.correlation_id)) {
      return event.correlation_id;
    }
    return randomUUID();
  }

  private parse(message: StringMessage): Optional<ConsumedEvent> {
    try {
      return JSON.parse(message.value) as ConsumedEvent;
    } catch (error) {
      this.options.onError(error, undefined);
      return undefined;
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async trackEndOffsets(): Promise<void> {
    const [earliest, latest] = await Promise.all([
      this.consumer.listOffsets({
        topics: this.topics,
        timestamp: KAFKA_ADMIN.EARLIEST_OFFSET,
      }),
      this.consumer.listOffsets({
        topics: this.topics,
        timestamp: KAFKA_ADMIN.LATEST_OFFSET,
      }),
    ]);

    this.pending.clear();
    for (const [topic, ends] of latest) {
      const starts = earliest.get(topic) ?? [];
      ends.forEach((end, partition) => {
        if (end > (starts[partition] ?? 0n)) {
          this.pending.set(`${topic}:${partition}`, end);
        }
      });
    }
    this.caughtUp = this.pending.size === 0;
  }

  private markReplayed(message: StringMessage): void {
    if (this.caughtUp) {
      return;
    }

    const key = `${message.topic}:${message.partition}`;
    const end = this.pending.get(key);
    if (end !== undefined && message.offset + 1n >= end) {
      this.pending.delete(key);
    }
    this.caughtUp = this.pending.size === 0;
  }
}
