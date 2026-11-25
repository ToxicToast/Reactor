import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { shortenerMigrations } from '../migrations/index.js';
import { shortenerSchemas } from '../schemas/index.js';

export class ShortenerTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: shortenerSchemas, migrations: shortenerMigrations });
  }
}
