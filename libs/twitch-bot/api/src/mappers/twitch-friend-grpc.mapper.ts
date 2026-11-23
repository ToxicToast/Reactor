import type { Friend } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type { TwitchFriendAnemic } from '@toxictoast/twitch-bot-domain';

export class TwitchFriendGrpcMapper {
  toProto(anemic: TwitchFriendAnemic): Friend {
    return {
      id: anemic.id,
      twitch_id: anemic.twitch_id,
      login: anemic.login,
      display_name: anemic.display_name,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
    };
  }
}
