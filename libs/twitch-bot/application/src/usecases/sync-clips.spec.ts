import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchClipSource,
  InMemoryPublishedClipLedger,
  InMemoryTwitchChannelRepository,
  TEST_NOW,
  twitchChannelAnemic,
  twitchClip,
} from '../testing/index.js';
import { SyncClipsUseCase } from './sync-clips.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

describe('SyncClipsUseCase', () => {
  let channels: InMemoryTwitchChannelRepository;
  let source: FakeTwitchClipSource;
  let ledger: InMemoryPublishedClipLedger;
  let outbox: InMemoryOutbox;
  let useCase: SyncClipsUseCase;

  beforeEach(async () => {
    channels = new InMemoryTwitchChannelRepository();
    source = new FakeTwitchClipSource();
    ledger = new InMemoryPublishedClipLedger();
    outbox = new InMemoryOutbox();
    useCase = new SyncClipsUseCase(
      channels,
      source,
      ledger,
      outbox,
      new ImmediateUnitOfWork(),
      createTestContext(),
    );
    await channels.save(twitchChannelAnemic(CHANNEL_ID));
  });

  it('looks back 24 hours and publishes each new clip once, oldest first', async () => {
    source.clips = [
      twitchClip('b', { created_at: new Date('2026-10-26T19:50:00Z') }),
      twitchClip('a', { created_at: new Date('2026-10-26T19:10:00Z') }),
    ];

    const first = await useCase.execute();
    const second = await useCase.execute();

    expect(first.value).toEqual({ created: 2 });
    expect(second.value).toEqual({ created: 0 });
    expect(source.requests[0]).toEqual({
      channel_id: CHANNEL_ID,
      since: new Date(TEST_NOW.getTime() - 24 * 3_600_000),
    });
    expect(outbox.events.map((e) => e.payload)).toEqual([
      expect.objectContaining({ clip_id: 'a', channel_login: 'toxictoast' }),
      expect.objectContaining({ clip_id: 'b', channel_login: 'toxictoast' }),
    ]);
    expect(outbox.events.map((e) => e.event_namespace)).toEqual([
      'twitch.clip',
      'twitch.clip',
    ]);
  });

  it('only publishes clips the ledger has not seen yet', async () => {
    await ledger.markPublished(CHANNEL_ID, ['a']);
    source.clips = [twitchClip('a'), twitchClip('b')];

    const result = await useCase.execute();

    expect(result.value).toEqual({ created: 1 });
    expect(outbox.events.map((e) => e.payload)).toEqual([
      expect.objectContaining({ clip_id: 'b' }),
    ]);
  });
});
