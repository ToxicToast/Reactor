import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';

export class ListChannelsUseCase implements UseCase<
  void,
  Array<TwitchChannelAnemic>
> {
  constructor(private readonly repository: TwitchChannelRepository) {}

  async execute(): Promise<Result<Array<TwitchChannelAnemic>>> {
    return Result.ok(await this.repository.findList());
  }
}
