import type { ApiClient } from '@twurple/api';
import type { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchTokenStore } from '@toxictoast/twitch-bot-application';
import type {
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import { NOOP_TWITCH_BOT_METRICS } from '../constants/index.js';
import {
  createTwitchApiClient,
  createTwitchAuthProvider,
} from '../factories/index.js';
import { isRejectedRefresh } from '../functions/index.js';
import type { TwitchBotMetrics, TwitchConfig } from '../interfaces/index.js';
import { TwitchAccessTokenMapper } from '../mappers/index.js';
import type { AuthorizationLostHandler } from '../types/index.js';

export class TwitchConnection {
  private readonly mapper = new TwitchAccessTokenMapper();
  private readonly lostHandlers: Array<AuthorizationLostHandler> = [];
  private readonly lost = new Set<string>();
  private provider: Nullable<Promise<RefreshingAuthProvider>> = null;
  private client: Nullable<Promise<ApiClient>> = null;

  constructor(
    private readonly config: TwitchConfig,
    private readonly channels: TwitchChannelRepository,
    private readonly tokens: TwitchTokenStore,
    private readonly metrics: TwitchBotMetrics = NOOP_TWITCH_BOT_METRICS,
    private readonly onError: (error: unknown, context: string) => void = () =>
      undefined,
  ) {}

  onAuthorizationLost(handler: AuthorizationLostHandler): void {
    this.lostHandlers.push(handler);
  }

  reportAuthorizationLost(twitchId: string, reason: string): void {
    if (this.lost.has(twitchId)) {
      return;
    }
    this.lost.add(twitchId);
    for (const handler of this.lostHandlers) {
      handler(twitchId, reason);
    }
  }

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
      this.lost.delete(channel.twitch_id);
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
      this.metrics.tokenRefreshed(true);
      this.persist(userId, token).catch((error: unknown) => {
        this.onError(error, `Storing the refreshed token of ${userId} failed`);
      });
    });
    provider.onRefreshFailure((userId, error) => {
      this.metrics.tokenRefreshed(false);
      if (isRejectedRefresh(error)) {
        this.reportAuthorizationLost(
          userId,
          `Twitch rejected the token refresh: ${error.message}`,
        );
        return;
      }
      this.onError(error, `Refreshing the token of ${userId} failed`);
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
