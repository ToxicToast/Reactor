import type { Clock } from '@toxictoast/shared-kernel';
import type { ReadinessProbe, ReadinessResult } from '@toxictoast/shared-nest';
import type {
  TwitchCredentialsCheck,
  TwitchSocketTracker,
} from '@toxictoast/twitch-bot-infrastructure';
import { TWITCH_SOCKET_GRACE_MS } from '../constants/index.js';

export class TwitchReadinessProbe implements ReadinessProbe {
  readonly key = 'twitch';

  constructor(
    private readonly credentials: TwitchCredentialsCheck,
    private readonly sockets: TwitchSocketTracker,
    private readonly clock: Clock,
    private readonly graceMs: number = TWITCH_SOCKET_GRACE_MS,
  ) {}

  async probe(): Promise<ReadinessResult> {
    const credentials = await this.credentials.check();
    const threshold = new Date(this.clock.now().getTime() - this.graceMs);
    const stale = this.sockets.disconnectedSince(threshold);

    return {
      up: credentials.valid && stale.length === 0,
      details: {
        credentials: credentials.valid ? 'valid' : credentials.message,
        channels: this.sockets.snapshot().map((socket) => {
          return {
            login: socket.login,
            connected: socket.connected,
            since: socket.since.toISOString(),
          };
        }),
      },
    };
  }
}
