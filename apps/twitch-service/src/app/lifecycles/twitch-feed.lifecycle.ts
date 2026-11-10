import type {
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
} from '@nestjs/common';
import type { RedisTwitchFeed } from '@toxictoast/twitch-infrastructure';

export class TwitchFeedLifecycle
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  constructor(private readonly feed: RedisTwitchFeed) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.feed.start();
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.feed.stop();
  }
}
