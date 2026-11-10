import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { blogMigrations } from '../migrations/index.js';
import { blogSchemas } from '../schemas/index.js';

export class BlogTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: blogSchemas, migrations: blogMigrations });
  }
}
