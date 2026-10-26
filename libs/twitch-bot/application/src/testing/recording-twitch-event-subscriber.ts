import type {
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchEventSubscriber } from '../interfaces/index.js';

export class RecordingTwitchEventSubscriber implements TwitchEventSubscriber {
  readonly started: Array<string> = [];
  readonly stopped: Array<string> = [];
  readonly failFor = new Set<string>();

  async start(channel: TwitchChannelAnemic): Promise<void> {
    if (this.failFor.has(channel.id)) {
      throw new Error(`Cannot subscribe to ${channel.login}`);
    }
    this.started.push(channel.id);
  }

  async stop(channelId: TwitchChannelId): Promise<void> {
    this.stopped.push(channelId);
  }
}
