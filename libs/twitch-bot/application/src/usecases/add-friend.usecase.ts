import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import {
  ConflictError,
  NotFoundError,
  Result,
} from '@toxictoast/shared-kernel';
import {
  normalizeTwitchLogin,
  type TwitchChannelRepository,
  type TwitchFriendAnemic,
  type TwitchFriendDomain,
  type TwitchFriendFactory,
  type TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';
import type { AddFriendInput } from '../data/index.js';
import type { TwitchUser, TwitchUserLookup } from '../interfaces/index.js';

export class AddFriendUseCase implements UseCase<
  AddFriendInput,
  TwitchFriendAnemic
> {
  constructor(
    private readonly factory: TwitchFriendFactory,
    private readonly friends: TwitchFriendRepository,
    private readonly channels: TwitchChannelRepository,
    private readonly persistence: DomainPersistence,
    private readonly users: TwitchUserLookup,
  ) {}

  async execute(input: AddFriendInput): Promise<Result<TwitchFriendAnemic>> {
    const login = normalizeTwitchLogin(input.login);
    if (login.isFailure) {
      return Result.fail(login.error);
    }

    const user = await this.users.findByLogin(login.value);
    if (!user) {
      return Result.fail(new NotFoundError('Twitch user', login.value));
    }
    if (await this.channels.findByTwitchId(user.twitch_id)) {
      return Result.fail(
        new ConflictError(`${user.login} is connected to the bot`),
      );
    }

    const friend = await this.load(user);
    if (friend.isFailure) {
      return Result.fail(friend.error);
    }
    return this.persistence.persist(friend.value, this.friends);
  }

  private async load(user: TwitchUser): Promise<Result<TwitchFriendDomain>> {
    const existing = await this.friends.findByTwitchId(user.twitch_id, true);
    if (!existing) {
      return this.factory.createDomain(user);
    }

    const friend = this.factory.reconstitute(existing);
    const readded = friend.readd(user);
    if (readded.isFailure) {
      return Result.fail(readded.error);
    }
    return Result.ok(friend);
  }
}
