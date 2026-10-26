import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ResumeSubscriptionsUseCase } from '@toxictoast/twitch-bot-application';
import type { TwurpleEventSubscriber } from '@toxictoast/twitch-bot-infrastructure';
import { TWITCH_BOT_TOKENS } from '../constants/index.js';

@Injectable()
export class TwitchSubscriptionLifecycle
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger('TwitchSubscriptions');

  constructor(
    private readonly resumeSubscriptionsUseCase: ResumeSubscriptionsUseCase,
    @Inject(TWITCH_BOT_TOKENS.TWITCH_EVENT_SUBSCRIBER)
    private readonly subscriber: TwurpleEventSubscriber,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
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
}
