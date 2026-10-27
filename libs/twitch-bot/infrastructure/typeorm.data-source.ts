import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { twitchBotMigrations } from './src/migrations/index.js';
import { twitchBotSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: twitchBotSchemas,
    migrations: twitchBotMigrations,
  }),
);
