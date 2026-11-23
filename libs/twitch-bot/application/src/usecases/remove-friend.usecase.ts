import {
  AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  TwitchFriendAnemic,
  TwitchFriendDomain,
  TwitchFriendFactory,
  TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';
import type { RemoveFriendInput } from '../data/index.js';

export class RemoveFriendUseCase implements UseCase<
  RemoveFriendInput,
  TwitchFriendAnemic
> {
  private readonly editor: AggregateEditor<
    TwitchFriendAnemic,
    TwitchFriendDomain
  >;

  constructor(
    factory: TwitchFriendFactory,
    repository: TwitchFriendRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = new AggregateEditor<TwitchFriendAnemic, TwitchFriendDomain>(
      'Twitch friend',
      factory,
      repository,
      persistence,
    );
  }

  execute(input: RemoveFriendInput): Promise<Result<TwitchFriendAnemic>> {
    return this.editor.change(input.id, (friend) => friend.remove());
  }
}
