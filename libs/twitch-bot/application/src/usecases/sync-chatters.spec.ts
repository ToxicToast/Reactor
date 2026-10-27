import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  ChatterDiffService,
  type Chatter,
  type TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchChatterSource,
  InMemoryChatterRepository,
  InMemoryTwitchChannelRepository,
  twitchChannelAnemic,
} from '../testing/index.js';
import { SyncChattersUseCase } from './sync-chatters.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

const chatter = (id: string): Chatter => ({
  user_id: id,
  user_login: `user${id}`,
  user_name: `User${id}`,
});

describe('SyncChattersUseCase', () => {
  let channels: InMemoryTwitchChannelRepository;
  let chatters: InMemoryChatterRepository;
  let source: FakeTwitchChatterSource;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: SyncChattersUseCase;

  beforeEach(async () => {
    channels = new InMemoryTwitchChannelRepository();
    chatters = new InMemoryChatterRepository();
    source = new FakeTwitchChatterSource();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new SyncChattersUseCase(
      channels,
      chatters,
      source,
      new ChatterDiffService(),
      outbox,
      uow,
      createTestContext(),
    );
    await channels.save(twitchChannelAnemic(CHANNEL_ID));
  });

  it('publishes joins and parts and stores the new snapshot', async () => {
    await chatters.replace(CHANNEL_ID, [chatter('1'), chatter('2')]);
    source.chatters.set(CHANNEL_ID, [chatter('2'), chatter('3'), chatter('3')]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ joined: 1, left: 1 });
    expect(
      outbox.events.map((e) => `${e.event_namespace}:${e.event_name}`),
    ).toEqual(['twitch.presence:joined', 'twitch.presence:left']);
    expect(outbox.events[0]).toMatchObject({
      aggregate_id: CHANNEL_ID,
      payload: {
        channel_id: '123456',
        channel_login: 'toxictoast',
        channel_name: 'ToxicToast',
        user_id: '3',
        user_login: 'user3',
        user_name: 'User3',
      },
    });
    expect(await chatters.findByChannel(CHANNEL_ID)).toEqual([
      chatter('2'),
      chatter('3'),
    ]);
  });

  it('writes nothing when nobody joined or left', async () => {
    await chatters.replace(CHANNEL_ID, [chatter('1')]);
    source.chatters.set(CHANNEL_ID, [chatter('1')]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ joined: 0, left: 0 });
    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });

  it('skips disconnected channels', async () => {
    await channels.save(twitchChannelAnemic(CHANNEL_ID, { connected: false }));
    source.chatters.set(CHANNEL_ID, [chatter('1')]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ joined: 0, left: 0 });
    expect(outbox.events).toHaveLength(0);
  });
});
