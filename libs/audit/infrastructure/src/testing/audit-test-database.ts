import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { auditMigrations } from '../migrations/index.js';
import { auditSchemas } from '../schemas/index.js';

export class AuditTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: auditSchemas, migrations: auditMigrations });
  }
}
