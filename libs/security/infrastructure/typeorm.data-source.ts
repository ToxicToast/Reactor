import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { securityMigrations } from './src/migrations/index.js';
import { securitySchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: securitySchemas,
    migrations: securityMigrations,
  }),
);
