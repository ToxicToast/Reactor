import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { publisherMigrations } from './src/migrations/index.js';
import { publisherSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: publisherSchemas,
    migrations: publisherMigrations,
  }),
);
