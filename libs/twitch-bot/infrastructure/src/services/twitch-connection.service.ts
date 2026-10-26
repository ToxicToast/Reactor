import type { ApiClient } from '@twurple/api';
import type { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchTokenStore } from '@toxictoast/twitch-bot-application';
import type {
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import {
  createTwitchApiClient,
  createTwitchAuthProvider,
} from '../factories/index.js';
import type { TwitchConfig } from '../interfaces/index.js';
import { TwitchAccessTokenMapper } from '../mappers/index.js';

export class TwitchConnection {
  private readonly mapper = new TwitchAccessTokenMapper();
  private provider: Nullable<Promise<RefreshingAuthProvider>> = null;
  private client: Nullable<Promise<ApiClient>> = null;

  constructor(
    private readonly config: TwitchConfig,
    private readonly channels: TwitchChannelRepository,
    private readonly tokens: TwitchTokenStore,
    private readonly onError: (error: unknown) => void = () => undefined,
  ) {}

  authProvider(): Promise<RefreshingAuthProvider> {
    if (!this.provider) {
      this.provider = this.createProvider().catch((error: unknown) => {
        this.provider = null;
        throw error;
      });
    }
    return this.provider;
  }

  api(): Promise<ApiClient> {
    if (!this.client) {
      this.client = this.authProvider()
        .then((provider) => createTwitchApiClient(provider))
        .catch((error: unknown) => {
          this.client = null;
          throw error;
        });
    }
    return this.client;
  }

  async use(channel: TwitchChannelAnemic): Promise<ApiClient> {
    const provider = await this.authProvider();
    if (!provider.hasUser(channel.twitch_id)) {
      const token = await this.tokens.find(channel.id);
      if (!token) {
        throw new Error(`No Twitch token stored for ${channel.login}`);
      }
      provider.addUser(channel.twitch_id, this.mapper.toAccessToken(token));
    }
    return this.api();
  }

  async reload(channel: TwitchChannelAnemic): Promise<ApiClient> {
    await this.forget(channel);
    return this.use(channel);
  }

  async forget(channel: TwitchChannelAnemic): Promise<void> {
    const provider = await this.authProvider();
    if (provider.hasUser(channel.twitch_id)) {
      provider.removeUser(channel.twitch_id);
    }
  }

  private async createProvider(): Promise<RefreshingAuthProvider> {
    const provider = await createTwitchAuthProvider(this.config);
    provider.onRefresh((userId, token) => {
      this.persist(userId, token).catch(this.onError);
    });
    return provider;
  }

  private async persist(userId: string, token: AccessToken): Promise<void> {
    const channel = await this.channels.findByTwitchId(userId);
    if (channel) {
      await this.tokens.save(channel.id, this.mapper.toToken(token));
    }
  }
}
