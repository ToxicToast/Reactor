import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { securityMigrations } from '../migrations/index.js';
import { securitySchemas } from '../schemas/index.js';

export class SecurityTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: securitySchemas, migrations: securityMigrations });
  }
}
