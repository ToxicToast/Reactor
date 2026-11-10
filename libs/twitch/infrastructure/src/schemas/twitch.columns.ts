import type { ChannelRef, ViewerRef } from '@toxictoast/twitch-domain';
import type { EntitySchemaColumnOptions } from 'typeorm';
import { TWITCH_COLUMNS } from '../constants/index.js';

const twitchId = {
  type: 'varchar',
  length: TWITCH_COLUMNS.TWITCH_ID_LENGTH,
} satisfies EntitySchemaColumnOptions;

const login = {
  type: 'varchar',
  length: TWITCH_COLUMNS.LOGIN_LENGTH,
} satisfies EntitySchemaColumnOptions;

const name = {
  type: 'varchar',
  length: TWITCH_COLUMNS.NAME_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const twitchIdColumn = twitchId;

export const channelColumns = {
  channel_id: twitchId,
  channel_login: login,
  channel_name: name,
} satisfies Record<keyof ChannelRef, EntitySchemaColumnOptions>;

export const viewerColumns = {
  user_id: twitchId,
  user_login: login,
  user_name: name,
} satisfies Record<keyof ViewerRef, EntitySchemaColumnOptions>;

export const externalIdColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.EXTERNAL_ID_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const titleColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.TITLE_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const dayColumn = { type: 'date' } satisfies EntitySchemaColumnOptions;
