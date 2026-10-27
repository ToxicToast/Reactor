import type { Channel } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';

export class TwitchChannelGrpcMapper {
  toProto(anemic: TwitchChannelAnemic): Channel {
    return {
      id: anemic.id,
      twitch_id: anemic.twitch_id,
      login: anemic.login,
      display_name: anemic.display_name,
      scopes: [...anemic.scopes],
      connected: anemic.connected,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
    };
  }
}
