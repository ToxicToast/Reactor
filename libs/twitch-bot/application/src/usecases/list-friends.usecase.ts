import type { UseCase } from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  TwitchFriendAnemic,
  TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';

export class ListFriendsUseCase implements UseCase<
  void,
  Array<TwitchFriendAnemic>
> {
  constructor(private readonly repository: TwitchFriendRepository) {}

  async execute(): Promise<Result<Array<TwitchFriendAnemic>>> {
    return Result.ok(await this.repository.findList());
  }
}
