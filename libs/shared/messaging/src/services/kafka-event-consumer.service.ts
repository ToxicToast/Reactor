import type { Consumer, Message, MessagesStream } from '@platformatic/kafka';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  ConsumedEvent,
  KafkaEventConsumerOptions,
} from '../interfaces/index.js';

type StringMessage = Message<string, string, string, string>;
type StringStream = MessagesStream<string, string, string, string>;

export class KafkaEventConsumer {
  private stream: Nullable<StringStream> = null;
  private processing: Nullable<Promise<void>> = null;
  private stopping = false;

  constructor(
    private readonly consumer: Consumer<string, string, string, string>,
    private readonly options: KafkaEventConsumerOptions,
  ) {}

  get topics(): Array<string> {
    const namespaces = Object.keys(this.options.handlers).map((key) => {
      return key.slice(0, key.lastIndexOf('.'));
    });
    return [...new Set(namespaces)];
  }

  async start(): Promise<void> {
    this.stopping = false;
    this.stream = await this.consumer.consume({
      topics: this.topics,
      mode: 'committed',
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
      await message.commit();
    }
  }

  private async handle(message: StringMessage): Promise<boolean> {
    const event = this.parse(message);
    if (!event) {
      return true;
    }

    const handler =
      this.options.handlers[`${event.event_namespace}.${event.event_name}`];
    if (!handler) {
      return true;
    }

    let delay = this.options.retryDelayMs ?? 1000;
    const maxDelay = this.options.maxRetryDelayMs ?? 30000;
    while (!this.stopping) {
      try {
        await handler(event);
        return true;
      } catch (error) {
        this.options.onError(error, event);
        await this.wait(delay);
        delay = Math.min(delay * 2, maxDelay);
      }
    }
    return false;
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
}
