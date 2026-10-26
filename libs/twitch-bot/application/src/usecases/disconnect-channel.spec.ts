import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  TwitchChannelFactory,
  type TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchAuthClient,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchTokenStore,
  RecordingTwitchEventSubscriber,
  twitchChannelAnemic,
} from '../testing/index.js';
import { DisconnectChannelUseCase } from './disconnect-channel.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

describe('DisconnectChannelUseCase', () => {
  let repository: InMemoryTwitchChannelRepository;
  let tokens: InMemoryTwitchTokenStore;
  let subscriber: RecordingTwitchEventSubscriber;
  let outbox: InMemoryOutbox;
  let useCase: DisconnectChannelUseCase;

  beforeEach(async () => {
    repository = new InMemoryTwitchChannelRepository();
    tokens = new InMemoryTwitchTokenStore();
    subscriber = new RecordingTwitchEventSubscriber();
    outbox = new InMemoryOutbox();
    useCase = new DisconnectChannelUseCase(
      new TwitchChannelFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
      tokens,
      subscriber,
    );
    await repository.save(twitchChannelAnemic(CHANNEL_ID));
    await tokens.save(
      CHANNEL_ID,
      new FakeTwitchAuthClient().authorization.token,
    );
  });

  it('disconnects the channel, stops listening and forgets the token', async () => {
    const result = await useCase.execute({ id: CHANNEL_ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value.connected).toBe(false);
    expect(subscriber.stopped).toEqual([CHANNEL_ID]);
    expect(tokens.items.has(CHANNEL_ID)).toBe(false);
    expect(outbox.events.map((e) => e.event_name)).toEqual([
      'channel_disconnected',
    ]);
  });

  it('fails for an unknown channel', async () => {
    const result = await useCase.execute({ id: 'unknown' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('refuses to disconnect twice', async () => {
    await useCase.execute({ id: CHANNEL_ID });

    const result = await useCase.execute({ id: CHANNEL_ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
    expect(subscriber.stopped).toEqual([CHANNEL_ID]);
  });
});
