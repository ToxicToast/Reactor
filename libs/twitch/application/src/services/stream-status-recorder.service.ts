import type { DomainPersistence } from '@toxictoast/shared-application';
import type {
  StreamSessionFactory,
  StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import type { StreamStatusChange } from '../interfaces/index.js';

/** Nur in die laufende Session desselben Streams; ein spätes Status nach Offline verfällt. */
export class StreamStatusRecorder {
  constructor(
    private readonly factory: StreamSessionFactory,
    private readonly sessions: StreamSessionRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async record(change: StreamStatusChange): Promise<void> {
    const live = await this.sessions.findLive(change.channel.channel_id);
    if (!live || live.stream_id !== change.stream_id) {
      return;
    }

    const session = this.factory.reconstitute(live);
    session.observeStatus(change.status);
    await this.persistence.save(session, this.sessions);
  }
}
