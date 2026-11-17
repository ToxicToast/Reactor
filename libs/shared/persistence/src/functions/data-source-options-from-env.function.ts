import { numberEnv, requiredEnv } from '@toxictoast/shared-system';
import type { DataSourceOptions } from 'typeorm';
import { DATABASE_DEFAULTS, DATABASE_ENV } from '../constants/index.js';
import type { DataSourceConfig } from '../interfaces/index.js';

export const dataSourceOptionsFromEnv = (
  config: DataSourceConfig,
  source: NodeJS.ProcessEnv = process.env,
): DataSourceOptions => {
  return {
    type: 'postgres',
    host: requiredEnv(DATABASE_ENV.HOST, source),
    port: numberEnv(DATABASE_ENV.PORT, DATABASE_DEFAULTS.PORT, source),
    username: requiredEnv(DATABASE_ENV.USER, source),
    password: requiredEnv(DATABASE_ENV.PASSWORD, source),
    database: requiredEnv(DATABASE_ENV.NAME, source),
    entities: config.schemas,
    migrations: config.migrations,
    migrationsTableName: DATABASE_DEFAULTS.MIGRATIONS_TABLE,
  };
};
