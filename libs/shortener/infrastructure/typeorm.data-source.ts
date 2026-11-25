import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { shortenerMigrations } from './src/migrations/index.js';
import { shortenerSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: shortenerSchemas,
    migrations: shortenerMigrations,
  }),
);
