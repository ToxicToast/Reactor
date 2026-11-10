import type {
  ChatterActivityRepository,
  StreamSessionId,
} from '@toxictoast/twitch-domain';
import { compositeKey } from './range-filters.js';

export class InMemoryChatterActivityRepository implements ChatterActivityRepository {
  private readonly marks = new Set<string>();

  async markDaily(
    channelId: string,
    day: string,
    userId: string,
  ): Promise<boolean> {
    return this.mark(compositeKey('day', channelId, day, userId));
  }

  async markSession(
    sessionId: StreamSessionId,
    userId: string,
  ): Promise<boolean> {
    return this.mark(compositeKey('session', sessionId, userId));
  }

  private mark(key: string): boolean {
    if (this.marks.has(key)) {
      return false;
    }
    this.marks.add(key);
    return true;
  }
}
