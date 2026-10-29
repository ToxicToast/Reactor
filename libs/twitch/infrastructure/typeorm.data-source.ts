import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { twitchMigrations } from './src/migrations/index.js';
import { twitchSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: twitchSchemas,
    migrations: twitchMigrations,
  }),
);
