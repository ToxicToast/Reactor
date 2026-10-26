import { dataSourceOptionsFromEnv } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { auditMigrations } from './src/migrations/index.js';
import { auditSchemas } from './src/schemas/index.js';

export default new DataSource(
  dataSourceOptionsFromEnv({
    schemas: auditSchemas,
    migrations: auditMigrations,
  }),
);
