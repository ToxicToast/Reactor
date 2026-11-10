import type { Nullable } from '@toxictoast/shared-types';
import type {
  PresenceEntry,
  PresenceRepository,
} from '@toxictoast/twitch-domain';
import { compositeKey } from './range-filters.js';

interface Presence extends PresenceEntry {
  readonly channel_id: string;
}

export class InMemoryPresenceRepository implements PresenceRepository {
  readonly items = new Map<string, Presence>();

  async join(channelId: string, userId: string, at: Date): Promise<void> {
    const key = compositeKey(channelId, userId);
    if (!this.items.has(key)) {
      this.items.set(key, {
        channel_id: channelId,
        user_id: userId,
        joined_at: at,
      });
    }
  }

  async leave(channelId: string, userId: string): Promise<Nullable<Date>> {
    const key = compositeKey(channelId, userId);
    const presence = this.items.get(key);
    this.items.delete(key);
    return presence?.joined_at ?? null;
  }

  async count(channelId: string): Promise<number> {
    return this.ofChannel(channelId).length;
  }

  async restartAll(channelId: string, at: Date): Promise<Array<PresenceEntry>> {
    const present = this.ofChannel(channelId);
    for (const presence of present) {
      this.items.set(compositeKey(channelId, presence.user_id), {
        ...presence,
        joined_at: at,
      });
    }
    return present.map(({ user_id, joined_at }) => ({ user_id, joined_at }));
  }

  private ofChannel(channelId: string): Array<Presence> {
    return [...this.items.values()].filter((presence) => {
      return presence.channel_id === channelId;
    });
  }
}
