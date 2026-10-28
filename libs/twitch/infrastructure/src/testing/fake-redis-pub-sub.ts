import { EventEmitter } from 'node:events';
import type { Redis } from 'ioredis';

export class FakeRedisPubSub extends EventEmitter {
  private readonly topics = new Set<string>();

  async subscribe(...topics: Array<string>): Promise<number> {
    for (const topic of topics) {
      this.topics.add(topic);
    }
    return this.topics.size;
  }

  async unsubscribe(...topics: Array<string>): Promise<number> {
    for (const topic of topics) {
      this.topics.delete(topic);
    }
    return this.topics.size;
  }

  async publish(topic: string, message: string): Promise<number> {
    if (!this.topics.has(topic)) {
      return 0;
    }
    this.emit('message', topic, message);
    return 1;
  }

  asRedis(): Redis {
    return this as unknown as Redis;
  }
}
