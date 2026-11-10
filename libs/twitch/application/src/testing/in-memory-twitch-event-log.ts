import type {
  RecordedTwitchEvent,
  TwitchEventLog,
} from '../interfaces/index.js';

export class InMemoryTwitchEventLog implements TwitchEventLog {
  readonly events = new Map<string, RecordedTwitchEvent>();

  async record(event: RecordedTwitchEvent): Promise<boolean> {
    if (this.events.has(event.event_id)) {
      return false;
    }
    this.events.set(event.event_id, event);
    return true;
  }
}
