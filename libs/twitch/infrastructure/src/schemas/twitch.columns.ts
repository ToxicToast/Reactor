import type { ChannelRef, ViewerRef } from '@toxictoast/twitch-domain';
import type { EntitySchemaColumnOptions } from 'typeorm';
import { TWITCH_COLUMNS } from '../constants/index.js';

export const twitchIdColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.TWITCH_ID_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const loginColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.LOGIN_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const nameColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.NAME_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const channelColumns = {
  channel_id: twitchIdColumn,
  channel_login: loginColumn,
  channel_name: nameColumn,
} satisfies Record<keyof ChannelRef, EntitySchemaColumnOptions>;

export const viewerColumns = {
  user_id: twitchIdColumn,
  user_login: loginColumn,
  user_name: nameColumn,
} satisfies Record<keyof ViewerRef, EntitySchemaColumnOptions>;

export const externalIdColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.EXTERNAL_ID_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const titleColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.TITLE_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const codeColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.CODE_LENGTH,
  nullable: true,
} satisfies EntitySchemaColumnOptions;

export const keyPartColumn = {
  type: 'varchar',
  length: TWITCH_COLUMNS.KEY_PART_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const dayColumn = { type: 'date' } satisfies EntitySchemaColumnOptions;
