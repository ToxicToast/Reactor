import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { describeError } from '@toxictoast/shared-system';
import {
  ResumeSubscriptionsUseCase,
  RevokeChannelUseCase,
} from '@toxictoast/twitch-bot-application';
import {
  TwitchConnection,
  type TwurpleEventSubscriber,
} from '@toxictoast/twitch-bot-infrastructure';
import { TWITCH_BOT_TOKENS } from '../constants/index.js';

@Injectable()
export class TwitchSubscriptionLifecycle
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger('TwitchSubscriptions');

  constructor(
    private readonly resumeSubscriptionsUseCase: ResumeSubscriptionsUseCase,
    private readonly revokeChannelUseCase: RevokeChannelUseCase,
    private readonly connection: TwitchConnection,
    @Inject(TWITCH_BOT_TOKENS.TWITCH_EVENT_SUBSCRIBER)
    private readonly subscriber: TwurpleEventSubscriber,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.connection.onAuthorizationLost((twitchId, reason) => {
      this.revoke(twitchId, reason).catch((error: unknown) => {
        this.logger.error(
          `Revoking Twitch channel ${twitchId} failed`,
          describeError(error),
        );
      });
    });

    const result = await this.resumeSubscriptionsUseCase.execute();
    if (result.isFailure) {
      this.logger.error(
        `Resuming Twitch subscriptions failed: ${result.error.message}`,
      );
      return;
    }

    const { started, failed } = result.value;
    if (started.length === 0 && failed.length === 0) {
      this.logger.log('No connected Twitch channels yet');
    }
    if (started.length > 0) {
      this.logger.log(`Listening to ${started.join(', ')}`);
    }
    if (failed.length > 0) {
      this.logger.warn(
        `Could not listen to ${failed.join(', ')}, reconnect them in the admin area`,
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.subscriber.close();
  }

  private async revoke(twitchId: string, reason: string): Promise<void> {
    const result = await this.revokeChannelUseCase.execute({
      twitch_id: twitchId,
    });
    if (result.isFailure) {
      this.logger.warn(
        `Twitch authorization of ${twitchId} lost (${reason}), but the channel could not be revoked: ${result.error.message}`,
      );
      return;
    }
    this.logger.warn(
      `Twitch authorization of ${result.value.login} lost (${reason}), channel disconnected, connect it again under /admin/twitch/connect`,
    );
  }
}
