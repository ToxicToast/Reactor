import { EntitySchema } from 'typeorm';
import type { TwitchTokenRow } from '../interfaces/index.js';

export const TwitchTokenSchema = new EntitySchema<TwitchTokenRow>({
  name: 'TwitchToken',
  tableName: 'twitch_tokens',
  columns: {
    channel_id: { type: 'uuid', primary: true },
    access_token: { type: 'text' },
    refresh_token: { type: 'text', nullable: true },
    scopes: { type: 'text', array: true },
    expires_in: { type: 'int', nullable: true },
    obtained_at: { type: 'timestamptz' },
    updated_at: { type: 'timestamptz' },
  },
});
