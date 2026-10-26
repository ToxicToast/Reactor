import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  DomainError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelData,
  TwitchChannelDomain,
  TwitchChannelFactory,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import { TWITCH_BOT_SCOPES } from '../constants/index.js';
import type { CompleteAuthorizationInput } from '../data/index.js';
import type {
  TwitchAuthClient,
  TwitchAuthorization,
  TwitchEventSubscriber,
  TwitchTokenStore,
} from '../interfaces/index.js';

export class CompleteAuthorizationUseCase implements UseCase<
  CompleteAuthorizationInput,
  TwitchChannelAnemic
> {
  constructor(
    private readonly factory: TwitchChannelFactory,
    private readonly repository: TwitchChannelRepository,
    private readonly persistence: DomainPersistence,
    private readonly auth: TwitchAuthClient,
    private readonly tokens: TwitchTokenStore,
    private readonly subscriber: TwitchEventSubscriber,
  ) {}

  async execute(
    input: CompleteAuthorizationInput,
  ): Promise<Result<TwitchChannelAnemic>> {
    if (input.code.trim().length === 0) {
      return Result.fail(new ValidationError('Code must not be empty'));
    }

    const authorization = await this.exchange(input);
    if (authorization.isFailure) {
      return Result.fail(authorization.error);
    }

    const { user, token } = authorization.value;
    const channel = await this.load({ ...user, scopes: token.scopes });
    if (channel.isFailure) {
      return Result.fail(channel.error);
    }

    const missing = channel.value.missingScopes(TWITCH_BOT_SCOPES);
    if (missing.length > 0) {
      return Result.fail(
        new ValidationError(`Missing scopes: ${missing.join(', ')}`),
      );
    }

    const saved = await this.persistence.persist(
      channel.value,
      this.repository,
    );
    if (saved.isFailure) {
      return Result.fail(saved.error);
    }

    await this.tokens.save(saved.value.id, token);
    await this.subscriber.start(saved.value);
    return Result.ok(saved.value);
  }

  private async exchange(
    input: CompleteAuthorizationInput,
  ): Promise<Result<TwitchAuthorization>> {
    try {
      return Result.ok(
        await this.auth.exchangeCode(input.code, input.redirect_uri),
      );
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }
  }

  private async load(
    data: TwitchChannelData,
  ): Promise<Result<TwitchChannelDomain>> {
    const existing = await this.repository.findByTwitchId(data.twitch_id);
    if (!existing) {
      return this.factory.createDomain(data);
    }

    const channel = this.factory.reconstitute(existing);
    const reconnected = channel.reconnect(data);
    if (reconnected.isFailure) {
      return Result.fail(reconnected.error);
    }
    return Result.ok(channel);
  }
}
