import type { Clock } from '@toxictoast/shared-kernel';
import type { TwitchSocketState } from '../interfaces';

export class TwitchSocketTracker {
  private readonly sockets = new Map<string, TwitchSocketState>();

  constructor(private readonly clock: Clock) {}

  track(twitchId: string, login: string): void {
    const existing = this.sockets.get(twitchId);
    if (existing) {
      this.sockets.set(twitchId, { ...existing, login });
      return;
    }
    this.sockets.set(twitchId, {
      twitch_id: twitchId,
      login,
      connected: false,
      since: this.clock.now(),
    });
  }

  connected(twitchId: string): void {
    this.update(twitchId, true);
  }

  disconnected(twitchId: string): void {
    this.update(twitchId, false);
  }

  forget(twitchId: string): void {
    this.sockets.delete(twitchId);
  }

  snapshot(): Array<TwitchSocketState> {
    return [...this.sockets.values()];
  }

  disconnectedSince(before: Date): Array<TwitchSocketState> {
    return this.snapshot().filter((socket) => {
      return !socket.connected && socket.since <= before;
    });
  }

  private update(twitchId: string, connected: boolean): void {
    const socket = this.sockets.get(twitchId);
    if (!socket || socket.connected === connected) {
      return;
    }
    this.sockets.set(twitchId, {
      ...socket,
      connected,
      since: this.clock.now(),
    });
  }
}
