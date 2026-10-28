import type {
  LiveChannel,
  RecordedTwitchEvent,
  TwitchFeed,
} from '../interfaces/index.js';

export class RecordingTwitchFeed implements TwitchFeed {
  readonly events: Array<RecordedTwitchEvent> = [];
  readonly live: Array<ReadonlyArray<LiveChannel>> = [];

  publishEvent(event: RecordedTwitchEvent): void {
    this.events.push(event);
  }

  publishLive(channels: ReadonlyArray<LiveChannel>): void {
    this.live.push(channels);
  }
}
