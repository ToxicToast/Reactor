import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { publisherMigrations } from '../migrations/index.js';
import { publisherSchemas } from '../schemas/index.js';

export class PublisherTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: publisherSchemas, migrations: publisherMigrations });
  }
}
