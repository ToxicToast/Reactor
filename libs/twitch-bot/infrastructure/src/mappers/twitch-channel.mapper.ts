import type { Mapper } from '@toxictoast/shared-persistence';
import type {
  TwitchChannelAnemic,
  TwitchChannelId,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchChannelRow } from '../interfaces/index.js';

export class TwitchChannelMapper implements Mapper<
  TwitchChannelAnemic,
  TwitchChannelRow
> {
  toAnemic(row: TwitchChannelRow): TwitchChannelAnemic {
    return {
      id: row.id as TwitchChannelId,
      twitch_id: row.twitch_id,
      login: row.login,
      display_name: row.display_name,
      scopes: [...row.scopes],
      connected: row.connected,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: TwitchChannelAnemic): TwitchChannelRow {
    return {
      id: anemic.id,
      twitch_id: anemic.twitch_id,
      login: anemic.login,
      display_name: anemic.display_name,
      scopes: [...anemic.scopes],
      connected: anemic.connected,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
