import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { TwitchChannelFactory } from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchAuthClient,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchTokenStore,
  RecordingTwitchEventSubscriber,
  twitchChannelAnemic,
} from '../testing/index.js';
import { CompleteAuthorizationUseCase } from './complete-authorization.usecase.js';
import { ValidationError } from '@toxictoast/shared-kernel';

const REDIRECT = 'http://localhost:4000/admin/twitch/callback';

describe('CompleteAuthorizationUseCase', () => {
  let repository: InMemoryTwitchChannelRepository;
  let tokens: InMemoryTwitchTokenStore;
  let subscriber: RecordingTwitchEventSubscriber;
  let auth: FakeTwitchAuthClient;
  let outbox: InMemoryOutbox;
  let useCase: CompleteAuthorizationUseCase;

  beforeEach(() => {
    repository = new InMemoryTwitchChannelRepository();
    tokens = new InMemoryTwitchTokenStore();
    subscriber = new RecordingTwitchEventSubscriber();
    auth = new FakeTwitchAuthClient();
    outbox = new InMemoryOutbox();
    useCase = new CompleteAuthorizationUseCase(
      new TwitchChannelFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, new ImmediateUnitOfWork()),
      auth,
      tokens,
      subscriber,
    );
  });

  it('connects a new channel, stores its token and starts listening', async () => {
    const result = await useCase.execute({
      code: 'code-1',
      redirect_uri: REDIRECT,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      twitch_id: '123456',
      login: 'toxictoast',
      connected: true,
    });
    expect(auth.exchanged).toEqual([
      { code: 'code-1', redirect_uri: REDIRECT },
    ]);
    expect(tokens.items.get(result.value.id)).toEqual(auth.authorization.token);
    expect(subscriber.started).toEqual([result.value.id]);
    expect(outbox.events.map((e) => e.event_name)).toEqual([
      'channel_connected',
    ]);
  });

  it('reconnects a known channel instead of creating a second one', async () => {
    await repository.save(
      twitchChannelAnemic('channel-1', {
        login: 'old_login',
        connected: false,
      }),
    );

    const result = await useCase.execute({
      code: 'code-1',
      redirect_uri: REDIRECT,
    });

    expect(result.value.id).toBe('channel-1');
    expect(result.value).toMatchObject({
      login: 'toxictoast',
      connected: true,
    });
    expect(repository.items.size).toBe(1);
    expect(subscriber.started).toEqual(['channel-1']);
  });

  it('refuses an authorization without all required scopes', async () => {
    auth.authorization = {
      ...auth.authorization,
      token: { ...auth.authorization.token, scopes: ['user:read:chat'] },
    };

    const result = await useCase.execute({
      code: 'code-1',
      redirect_uri: REDIRECT,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(repository.items.size).toBe(0);
    expect(tokens.items.size).toBe(0);
    expect(subscriber.started).toEqual([]);
    expect(outbox.events).toHaveLength(0);
  });

  it('refuses an empty code without asking twitch', async () => {
    const result = await useCase.execute({ code: ' ', redirect_uri: REDIRECT });

    expect(result.isFailure).toBe(true);
    expect(auth.exchanged).toEqual([]);
  });

  it('turns a rejected code into a validation failure', async () => {
    auth.rejectWith = new ValidationError(
      'Twitch rejected the authorization code',
    );

    const result = await useCase.execute({
      code: 'code-1',
      redirect_uri: REDIRECT,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
    expect(repository.items.size).toBe(0);
  });

  it('lets unexpected errors through', async () => {
    auth.rejectWith = new Error('network down');

    await expect(
      useCase.execute({ code: 'code-1', redirect_uri: REDIRECT }),
    ).rejects.toThrow('network down');
  });
});
