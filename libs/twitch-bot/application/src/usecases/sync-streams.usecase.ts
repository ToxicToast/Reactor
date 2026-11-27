import type {
  ObservedEvent,
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { STREAM_EVENTS } from '../constants/index.js';
import type { SyncStreamsOutput } from '../data/index.js';
import {
  observe,
  streamOnlinePayloadOf,
  streamStatusPayloadOf,
} from '../functions/index.js';
import type {
  LiveStreamEntry,
  LiveStreamLedger,
  TwitchLiveStream,
  TwitchStreamSource,
} from '../interfaces/index.js';
import type { TrackedChannels } from '../services/index.js';
import type { RefreshArchiveUseCase } from './refresh-archive.usecase.js';

/**
 * Status für alle Live-Channels; Online/Offline nur für Freunde,
 * der eigene Channel bekommt das schon über EventSub.
 */
export class SyncStreamsUseCase implements UseCase<void, SyncStreamsOutput> {
  constructor(
    private readonly channels: TrackedChannels,
    private readonly source: TwitchStreamSource,
    private readonly ledger: LiveStreamLedger,
    private readonly archives: RefreshArchiveUseCase,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncStreamsOutput>> {
    const owned = await this.channels.listOwned();
    const friends = await this.channels.listFriends();
    const all = [...owned, ...friends];
    if (all.length === 0) {
      return Result.ok({ live: 0, online: 0, offline: 0 });
    }

    const live = new Map<string, TwitchLiveStream>(
      (await this.source.listLive(all)).map((stream) => {
        return [stream.twitch_id, stream];
      }),
    );
    const known = new Map<string, LiveStreamEntry>(
      (await this.ledger.list()).map((entry) => [entry.channel_id, entry]),
    );

    const events: Array<ObservedEvent> = [];
    const started: Array<LiveStreamEntry> = [];
    const ended: Array<TrackedChannel> = [];

    for (const friend of friends) {
      const stream = live.get(friend.twitch_id);
      const entry = known.get(friend.id);
      if (entry && entry.stream_id !== stream?.stream_id) {
        events.push(
          observe(
            this.ctx,
            friend,
            STREAM_EVENTS.TOPIC,
            STREAM_EVENTS.OFFLINE,
            {},
          ),
        );
        ended.push(friend);
      }
      if (stream && entry?.stream_id !== stream.stream_id) {
        events.push(
          observe(
            this.ctx,
            friend,
            STREAM_EVENTS.TOPIC,
            STREAM_EVENTS.ONLINE,
            streamOnlinePayloadOf(stream),
          ),
        );
        started.push({
          channel_id: friend.id,
          stream_id: stream.stream_id,
          started_at: stream.started_at,
        });
      }
    }

    for (const channel of all) {
      const stream = live.get(channel.twitch_id);
      if (stream) {
        events.push(
          observe(
            this.ctx,
            channel,
            STREAM_EVENTS.TOPIC,
            STREAM_EVENTS.STATUS,
            streamStatusPayloadOf(stream),
          ),
        );
      }
    }

    await this.uow.run(async () => {
      for (const channel of ended) {
        await this.ledger.end(channel.id);
      }
      for (const entry of started) {
        await this.ledger.start(entry);
      }
      if (events.length > 0) {
        await this.outbox.add(events);
      }
    });

    for (const channel of ended) {
      await this.archives.execute({ channel });
    }

    return Result.ok({
      live: live.size,
      online: started.length,
      offline: ended.length,
    });
  }
}
