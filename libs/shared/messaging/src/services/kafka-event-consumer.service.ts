import type { Consumer, Message, MessagesStream } from '@platformatic/kafka';
import {
  isActorIdentity,
  isUuid,
  SYSTEM_ACTOR,
  type Actor,
  eventKey,
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
import { randomUUID } from 'node:crypto';
import { FALLBACK_HANDLER, KAFKA_ADMIN } from '../constants/index.js';

type StringMessage = Message<string, string, string, string>;
type StringStream = MessagesStream<string, string, string, string>;

export class KafkaEventConsumer {
  private stream: Nullable<StringStream> = null;
  private processing: Nullable<Promise<void>> = null;
  private stopping = false;
  private caughtUp = true;
  private readonly pending = new Map<string, bigint>();
  private running = false;
  private restarts = 0;
  private restartAttempt = 0;
  private restartTimer: Nullable<ReturnType<typeof setTimeout>> = null;

  constructor(
    private readonly consumer: Consumer<string, string, string, string>,
    private readonly actors: ActorContext,
    private readonly correlations: CorrelationContext,
    private readonly options: KafkaEventConsumerOptions,
  ) {}

  get topics(): Array<string> {
    const namespaces = Object.keys(this.options.handlers)
      .filter((key) => key !== FALLBACK_HANDLER)
      .map((key) => key.slice(0, key.lastIndexOf('.')));
    return [...new Set([...namespaces, ...(this.options.topics ?? [])])];
  }

  get isCaughtUp(): boolean {
    return this.caughtUp;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get restartCount(): number {
    return this.restarts;
  }

  async start(): Promise<void> {
    this.stopping = false;
    await this.open();
  }

  async stop(): Promise<void> {
    this.stopping = true;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.stream) {
      await this.stream.close();
    }
    await this.processing;
    await this.consumer.close(true);
  }

  private async open(): Promise<void> {
    if (this.options.replay) {
      await this.trackEndOffsets();
    }
    const stream = await this.consumer.consume({
      topics: this.topics,
      mode: this.options.replay ? 'earliest' : 'committed',
      fallbackMode: 'earliest',
      autocommit: false,
    });

    this.stream = stream;
    this.running = true;
    this.processing = this.process(stream).then(
      () => this.onStreamEnded(null),
      (error: unknown) => this.onStreamEnded(error),
    );
  }

  private onStreamEnded(error: unknown): void {
    this.running = false;
    this.stream = null;
    if (this.stopping) {
      return;
    }

    this.options.onError(
      error ?? new Error('Event stream ended unexpectedly'),
      undefined,
    );
    this.scheduleRestart();
  }

  private scheduleRestart(): void {
    const base = this.options.restartDelayMs ?? 1000;
    const max = this.options.maxRestartDelayMs ?? 30000;
    const delay = Math.min(base * 2 ** this.restartAttempt, max);
    this.restartAttempt++;

    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      void this.restart();
    }, delay);
  }

  private async restart(): Promise<void> {
    if (this.stopping) {
      return;
    }
    try {
      await this.open();
    } catch (error) {
      this.options.onError(error, undefined);
      this.scheduleRestart();
      return;
    }

    this.restarts++;
    this.restartAttempt = 0;
    this.options.onRestart?.(this.restarts);
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
      this.options.handlers[
        eventKey(event.event_namespace, event.event_name)
      ] ?? this.options.handlers[FALLBACK_HANDLER];
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
