import type { ChatMessage } from '@toxictoast/twitch-domain';
import { EntitySchema } from 'typeorm';
import { TWITCH_COLUMNS } from '../constants/index.js';
import { primaryColumn } from '../functions/index.js';
import {
  externalIdColumn,
  twitchIdColumn,
  viewerColumns,
} from './twitch.columns.js';

const code = {
  type: 'varchar',
  length: TWITCH_COLUMNS.CODE_LENGTH,
  nullable: true,
} as const;

export const TwitchChatMessageSchema = new EntitySchema<ChatMessage>({
  name: 'TwitchChatMessage',
  tableName: 'twitch_chat_messages',
  columns: {
    message_id: primaryColumn(externalIdColumn),
    channel_id: twitchIdColumn,
    ...viewerColumns,
    text: { type: 'text' },
    color: code,
    badges: { type: 'text', array: true },
    bits: { type: 'int', default: 0 },
    reply_to_message_id: { ...externalIdColumn, nullable: true },
    session_id: { type: 'uuid', nullable: true },
    sent_at: { type: 'timestamptz' },
    deleted_at: { type: 'timestamptz', nullable: true },
    deleted_reason: code,
  },
  indices: [
    {
      name: 'idx_twitch_chat_messages_channel',
      columns: ['channel_id', 'sent_at'],
    },
    {
      name: 'idx_twitch_chat_messages_user',
      columns: ['channel_id', 'user_id', 'sent_at'],
    },
    { name: 'idx_twitch_chat_messages_session', columns: ['session_id'] },
  ],
});
