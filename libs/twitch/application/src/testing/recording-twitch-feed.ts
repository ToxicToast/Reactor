import type {
  LiveChannel,
  RecordedTwitchEvent,
  TwitchFeed,
} from '../interfaces/index.js';

export class RecordingTwitchFeed implements TwitchFeed {
  readonly events: Array<RecordedTwitchEvent> = [];
  readonly live: Array<ReadonlyArray<LiveChannel>> = [];

  async publishEvent(event: RecordedTwitchEvent): Promise<void> {
    this.events.push(event);
  }

  async publishLive(channels: ReadonlyArray<LiveChannel>): Promise<void> {
    this.live.push(channels);
  }
}
