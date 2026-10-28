import { EntitySchema } from 'typeorm';
import { primaryColumn } from '../functions/index.js';
import type { SessionChatterRow } from '../interfaces/index.js';
import { twitchIdColumn } from './twitch.columns.js';

export const TwitchSessionChatterSchema = new EntitySchema<SessionChatterRow>({
  name: 'TwitchSessionChatter',
  tableName: 'twitch_session_chatters',
  columns: {
    session_id: { type: 'uuid', primary: true },
    user_id: primaryColumn(twitchIdColumn),
  },
});
