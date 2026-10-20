import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { blogMigrations } from './src/migrations/index.js';
import { blogSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: blogSchemas,
    migrations: blogMigrations,
  }),
);
