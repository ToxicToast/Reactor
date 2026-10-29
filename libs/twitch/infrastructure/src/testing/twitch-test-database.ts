import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { twitchMigrations } from '../migrations/index.js';
import { twitchSchemas } from '../schemas/index.js';

export class TwitchTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: twitchSchemas, migrations: twitchMigrations });
  }
}
