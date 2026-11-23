import {
  Result,
  type DomainContext,
  type Factory,
} from '@toxictoast/shared-kernel';
import type { TwitchFriendAnemic } from '../anemics/index.js';
import type { TwitchFriendData } from '../data/index.js';
import { TwitchFriendDomain } from '../domains/index.js';
import { normalizeTwitchIdentity } from '../functions/index.js';

export class TwitchFriendFactory implements Factory<
  TwitchFriendAnemic,
  TwitchFriendDomain,
  TwitchFriendData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: TwitchFriendAnemic): TwitchFriendDomain {
    return new TwitchFriendDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: TwitchFriendDomain): TwitchFriendAnemic {
    return domain.toAnemic();
  }

  createDomain(data: TwitchFriendData): Result<TwitchFriendDomain> {
    const normalized = normalizeTwitchIdentity(data);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }

    const domain = new TwitchFriendDomain(
      {
        id: this.ctx.id.generate<'TwitchFriend'>(),
        ...normalized.value,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.add();
    return Result.ok(domain);
  }
}
