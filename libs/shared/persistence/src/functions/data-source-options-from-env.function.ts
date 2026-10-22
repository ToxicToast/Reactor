import { numberEnv, requiredEnv } from '@toxictoast/shared-system';
import type { DataSourceOptions } from 'typeorm';
import type { DataSourceConfig } from '../interfaces/index.js';

export const dataSourceOptionsFromEnv = (
  config: DataSourceConfig,
  source: NodeJS.ProcessEnv = process.env,
): DataSourceOptions => {
  return {
    type: 'postgres',
    host: requiredEnv('DB_HOST', source),
    port: numberEnv('DB_PORT', 5432, source),
    username: requiredEnv('DB_USER', source),
    password: requiredEnv('DB_PASSWORD', source),
    database: requiredEnv('DB_NAME', source),
    entities: config.schemas,
    migrations: config.migrations,
    migrationsTableName: 'migrations',
  };
};
