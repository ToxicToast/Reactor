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
import { RevokeChannelUseCase } from './revoke-channel.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

describe('RevokeChannelUseCase', () => {
  let repository: InMemoryTwitchChannelRepository;
  let tokens: InMemoryTwitchTokenStore;
  let subscriber: RecordingTwitchEventSubscriber;
  let outbox: InMemoryOutbox;
  let useCase: RevokeChannelUseCase;

  beforeEach(async () => {
    repository = new InMemoryTwitchChannelRepository();
    tokens = new InMemoryTwitchTokenStore();
    subscriber = new RecordingTwitchEventSubscriber();
    outbox = new InMemoryOutbox();
    useCase = new RevokeChannelUseCase(
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
    const result = await useCase.execute({ twitch_id: '123456' });

    expect(result.value.connected).toBe(false);
    expect(subscriber.stopped).toEqual([CHANNEL_ID]);
    expect(tokens.items.has(CHANNEL_ID)).toBe(false);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['channel_revoked']);
  });

  it('does nothing for a channel that is already disconnected', async () => {
    await useCase.execute({ twitch_id: '123456' });

    const result = await useCase.execute({ twitch_id: '123456' });

    expect(result.isSuccess).toBe(true);
    expect(outbox.events).toHaveLength(1);
    expect(subscriber.stopped).toEqual([CHANNEL_ID]);
  });

  it('fails for an unknown twitch account', async () => {
    const result = await useCase.execute({ twitch_id: '999' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
