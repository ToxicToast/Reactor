import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type { TwitchChannelRepository } from '@toxictoast/twitch-bot-domain';
import type { ResumeSubscriptionsOutput } from '../data/index.js';
import type { TwitchEventSubscriber } from '../interfaces/index.js';

export class ResumeSubscriptionsUseCase implements UseCase<
  void,
  ResumeSubscriptionsOutput
> {
  constructor(
    private readonly repository: TwitchChannelRepository,
    private readonly subscriber: TwitchEventSubscriber,
  ) {}

  async execute(): Promise<Result<ResumeSubscriptionsOutput>> {
    const started: Array<string> = [];
    const failed: Array<string> = [];

    for (const channel of await this.repository.findConnected()) {
      try {
        await this.subscriber.start(channel);
        started.push(channel.login);
      } catch {
        failed.push(channel.login);
      }
    }

    return Result.ok({ started, failed });
  }
}
