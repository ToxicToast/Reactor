import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import type { TwitchFriendId } from '@toxictoast/twitch-bot-domain';
import { TwitchVideoTypes } from '../constants/index.js';
import { TrackedChannels } from '../services/index.js';
import {
  createTestContext,
  FakeTwitchStreamSource,
  FakeTwitchVideoSource,
  InMemoryLiveStreamLedger,
  InMemoryPublishedLedger,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchFriendRepository,
  twitchChannelAnemic,
  twitchFriendAnemic,
  twitchLiveStream,
  twitchVideo,
} from '../testing/index.js';
import { RefreshArchiveUseCase } from './refresh-archive.usecase.js';
import { SyncStreamsUseCase } from './sync-streams.usecase.js';

const OWN_TWITCH_ID = '123456';
const FRIEND_TWITCH_ID = '987654';
const FRIEND_ID = 'friend-1' as TwitchFriendId;

describe('SyncStreamsUseCase', () => {
  let source: FakeTwitchStreamSource;
  let videos: FakeTwitchVideoSource;
  let ledger: InMemoryLiveStreamLedger;
  let outbox: InMemoryOutbox;
  let useCase: SyncStreamsUseCase;

  const names = (): Array<string> => {
    return outbox.events.map((event) => {
      const payload = event.payload as { channel_id: string };
      return `${payload.channel_id}:${event.event_name}`;
    });
  };

  beforeEach(async () => {
    const ctx = createTestContext();
    const uow = new ImmediateUnitOfWork();
    const channels = new InMemoryTwitchChannelRepository();
    const friends = new InMemoryTwitchFriendRepository();
    source = new FakeTwitchStreamSource();
    videos = new FakeTwitchVideoSource();
    ledger = new InMemoryLiveStreamLedger();
    outbox = new InMemoryOutbox();
    useCase = new SyncStreamsUseCase(
      new TrackedChannels(channels, friends),
      source,
      ledger,
      new RefreshArchiveUseCase(
        videos,
        new InMemoryPublishedLedger(),
        outbox,
        uow,
        ctx,
      ),
      outbox,
      uow,
      ctx,
    );
    await channels.save(
      twitchChannelAnemic('channel-1', { twitch_id: OWN_TWITCH_ID }),
    );
    await friends.save(
      twitchFriendAnemic(FRIEND_ID, { twitch_id: FRIEND_TWITCH_ID }),
    );
  });

  it('only reports the status of the own channel', async () => {
    source.streams = [twitchLiveStream(OWN_TWITCH_ID)];

    const result = await useCase.execute();

    expect(result.value).toEqual({ live: 1, online: 0, offline: 0 });
    expect(names()).toEqual([`${OWN_TWITCH_ID}:status`]);
  });

  it('brings a friend online once and then only reports the status', async () => {
    source.streams = [twitchLiveStream(FRIEND_TWITCH_ID)];

    await useCase.execute();
    await useCase.execute();

    expect(names()).toEqual([
      `${FRIEND_TWITCH_ID}:online`,
      `${FRIEND_TWITCH_ID}:status`,
      `${FRIEND_TWITCH_ID}:status`,
    ]);
    expect(ledger.items.get(FRIEND_ID)?.stream_id).toBe(
      `stream-${FRIEND_TWITCH_ID}`,
    );
  });

  it('takes a friend offline and refreshes the archive', async () => {
    source.streams = [twitchLiveStream(FRIEND_TWITCH_ID)];
    await useCase.execute();
    videos.videos = [twitchVideo('v1', { type: TwitchVideoTypes.ARCHIVE })];
    source.streams = [];

    const result = await useCase.execute();

    expect(result.value).toEqual({ live: 0, online: 0, offline: 1 });
    expect(names().slice(-2)).toEqual([
      `${FRIEND_TWITCH_ID}:offline`,
      `${FRIEND_TWITCH_ID}:updated`,
    ]);
    expect(ledger.items.has(FRIEND_ID)).toBe(false);
  });

  it('ends the old session when a friend starts a new stream', async () => {
    source.streams = [twitchLiveStream(FRIEND_TWITCH_ID)];
    await useCase.execute();
    source.streams = [
      twitchLiveStream(FRIEND_TWITCH_ID, { stream_id: 'stream-new' }),
    ];

    await useCase.execute();

    expect(names().slice(-3)).toEqual([
      `${FRIEND_TWITCH_ID}:offline`,
      `${FRIEND_TWITCH_ID}:online`,
      `${FRIEND_TWITCH_ID}:status`,
    ]);
    expect(ledger.items.get(FRIEND_ID)?.stream_id).toBe('stream-new');
  });
});
