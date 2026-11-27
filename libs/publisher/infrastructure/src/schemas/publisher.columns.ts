import type {
  AccountMetricKey,
  PostMetricKey,
  PostRef,
} from '@toxictoast/publisher-domain';
import { primaryColumn } from '@toxictoast/shared-persistence';
import type { EntitySchemaColumnOptions } from 'typeorm';
import { PUBLISHER_COLUMNS } from '../constants/index.js';

export const platformColumn = {
  type: 'varchar',
  length: PUBLISHER_COLUMNS.PLATFORM_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const remoteIdColumn = {
  type: 'varchar',
  length: PUBLISHER_COLUMNS.REMOTE_ID_LENGTH,
} satisfies EntitySchemaColumnOptions;

export const refColumns = {
  platform: primaryColumn(platformColumn),
  remote_id: primaryColumn(remoteIdColumn),
} satisfies Record<keyof PostRef, EntitySchemaColumnOptions>;

/** Zähler; null heißt: die Plattform kennt die Kennzahl nicht */
const counterColumn = {
  type: 'int',
  nullable: true,
} satisfies EntitySchemaColumnOptions;

/** Zeitspannen und Anteile; double, weil ms-Summen ein int sprengen und bigint als String käme */
const measureColumn = {
  type: 'double precision',
  nullable: true,
} satisfies EntitySchemaColumnOptions;

export const postMetricColumns = {
  views: counterColumn,
  likes: counterColumn,
  comments: counterColumn,
  shares: counterColumn,
  saves: counterColumn,
  reach: counterColumn,
  avg_watch_time_ms: measureColumn,
  total_watch_time_ms: measureColumn,
  avg_view_percentage: measureColumn,
  followers_gained: counterColumn,
} satisfies Record<PostMetricKey, EntitySchemaColumnOptions>;

export const accountMetricColumns = {
  followers: counterColumn,
  media_count: counterColumn,
} satisfies Record<AccountMetricKey, EntitySchemaColumnOptions>;
